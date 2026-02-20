#!/usr/bin/env python3
"""Tests for anti_gaming.py"""

import sys
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from anti_gaming import (
    MAX_PUBS_PER_WEEK,
    MAX_REVIEWS_PER_DAY,
    MIN_REVIEW_LENGTH,
    AntiGamingViolation,
    check_publication_limit,
    check_review_length,
    check_review_limit,
    check_self_review,
    detect_suspicious_patterns,
    validate_review,
    validate_submission,
)

# Fixed "now" for deterministic tests — Thursday 2026-02-20, week starts Mon 2026-02-16
NOW = datetime(2026, 2, 20, 12, 0, 0, tzinfo=timezone.utc)
THIS_WEEK = "2026-02-17T10:00:00+00:00"  # Tuesday this week
LAST_WEEK = "2026-02-09T10:00:00+00:00"  # Previous week
TODAY = "2026-02-20T10:00:00+00:00"
YESTERDAY = "2026-02-19T10:00:00+00:00"


def make_db(subs: dict) -> dict:
    return {"submissions": subs}


def published_sub(creator: str, published_at: str, sub_id: str = "S1") -> dict:
    return {
        "id": sub_id,
        "creator": creator,
        "status": "published",
        "published_at": published_at,
        "submitted_at": published_at,
        "reviews": [],
    }


def review_entry(reviewer: str, timestamp: str) -> dict:
    return {"reviewer": reviewer, "timestamp": timestamp, "decision": "approve"}


class TestPublicationLimit(unittest.TestCase):
    def test_under_limit_passes(self):
        subs = {
            f"S{i}": published_sub("Jay", THIS_WEEK, f"S{i}")
            for i in range(MAX_PUBS_PER_WEEK - 1)
        }
        check_publication_limit("Jay", make_db(subs), NOW)  # no exception

    def test_at_limit_raises(self):
        subs = {
            f"S{i}": published_sub("Jay", THIS_WEEK, f"S{i}")
            for i in range(MAX_PUBS_PER_WEEK)
        }
        with self.assertRaises(AntiGamingViolation):
            check_publication_limit("Jay", make_db(subs), NOW)

    def test_previous_week_not_counted(self):
        # All MAX_PUBS_PER_WEEK publications happened last week → should pass
        subs = {
            f"S{i}": published_sub("Jay", LAST_WEEK, f"S{i}")
            for i in range(MAX_PUBS_PER_WEEK)
        }
        check_publication_limit("Jay", make_db(subs), NOW)

    def test_other_creator_not_counted(self):
        subs = {
            f"S{i}": published_sub("Kiwon", THIS_WEEK, f"S{i}")
            for i in range(MAX_PUBS_PER_WEEK)
        }
        check_publication_limit("Jay", make_db(subs), NOW)

    def test_non_published_status_not_counted(self):
        sub = {
            "id": "S1",
            "creator": "Jay",
            "status": "approved",
            "published_at": None,
            "submitted_at": THIS_WEEK,
            "reviews": [],
        }
        check_publication_limit("Jay", make_db({"S1": sub}), NOW)

    def test_violation_message_contains_creator(self):
        subs = {
            f"S{i}": published_sub("Jay", THIS_WEEK, f"S{i}")
            for i in range(MAX_PUBS_PER_WEEK)
        }
        with self.assertRaises(AntiGamingViolation) as ctx:
            check_publication_limit("Jay", make_db(subs), NOW)
        self.assertIn("Jay", str(ctx.exception))


class TestReviewLimit(unittest.TestCase):
    def _db_with_reviews(self, reviewer: str, count: int, timestamp: str) -> dict:
        sub = {
            "id": "S1",
            "creator": "Kiwon",
            "status": "in_review",
            "reviews": [review_entry(reviewer, timestamp) for _ in range(count)],
        }
        return make_db({"S1": sub})

    def test_under_limit_passes(self):
        db = self._db_with_reviews("TJ", MAX_REVIEWS_PER_DAY - 1, TODAY)
        check_review_limit("TJ", db, NOW)

    def test_at_limit_raises(self):
        db = self._db_with_reviews("TJ", MAX_REVIEWS_PER_DAY, TODAY)
        with self.assertRaises(AntiGamingViolation):
            check_review_limit("TJ", db, NOW)

    def test_yesterday_reviews_not_counted(self):
        db = self._db_with_reviews("TJ", MAX_REVIEWS_PER_DAY, YESTERDAY)
        check_review_limit("TJ", db, NOW)  # no exception

    def test_other_reviewer_not_counted(self):
        db = self._db_with_reviews("Ryan", MAX_REVIEWS_PER_DAY, TODAY)
        check_review_limit("TJ", db, NOW)  # no exception


class TestReviewLength(unittest.TestCase):
    def test_exact_minimum_passes(self):
        check_review_length("x" * MIN_REVIEW_LENGTH)

    def test_above_minimum_passes(self):
        check_review_length("x" * (MIN_REVIEW_LENGTH + 100))

    def test_one_below_minimum_raises(self):
        with self.assertRaises(AntiGamingViolation):
            check_review_length("x" * (MIN_REVIEW_LENGTH - 1))

    def test_empty_string_raises(self):
        with self.assertRaises(AntiGamingViolation):
            check_review_length("")

    def test_whitespace_only_raises(self):
        with self.assertRaises(AntiGamingViolation):
            check_review_length("   " * 200)

    def test_violation_message_mentions_length(self):
        with self.assertRaises(AntiGamingViolation) as ctx:
            check_review_length("x" * 100)
        self.assertIn("100", str(ctx.exception))


class TestSelfReview(unittest.TestCase):
    def _db(self, creator: str) -> dict:
        return make_db({"S1": {"id": "S1", "creator": creator, "reviews": []}})

    def test_self_review_raises(self):
        with self.assertRaises(AntiGamingViolation):
            check_self_review("S1", "Jay", self._db("Jay"))

    def test_other_reviewer_passes(self):
        check_self_review("S1", "TJ", self._db("Jay"))

    def test_unknown_submission_passes(self):
        check_self_review("S999", "Jay", make_db({}))


class TestDetectSuspiciousPatterns(unittest.TestCase):
    def _rapid_burst_db(self, creator: str) -> dict:
        base = datetime(2026, 2, 20, 10, 0, 0, tzinfo=timezone.utc)
        subs = {}
        for i in range(3):
            ts = (base + timedelta(minutes=i * 10)).isoformat()
            subs[f"S{i}"] = {
                "id": f"S{i}",
                "creator": creator,
                "status": "submitted",
                "submitted_at": ts,
                "reviews": [],
            }
        return make_db(subs)

    def test_rapid_burst_detected(self):
        db = self._rapid_burst_db("Jay")
        flags = detect_suspicious_patterns(db)
        burst = [f for f in flags if f["type"] == "rapid_burst"]
        self.assertEqual(len(burst), 1)
        self.assertEqual(burst[0]["creator"], "Jay")
        self.assertEqual(burst[0]["severity"], "medium")

    def test_no_burst_when_spread_out(self):
        subs = {}
        for i in range(3):
            subs[f"S{i}"] = {
                "id": f"S{i}",
                "creator": "Jay",
                "status": "submitted",
                "submitted_at": f"2026-02-{15 + i}T10:00:00+00:00",
                "reviews": [],
            }
        flags = detect_suspicious_patterns(make_db(subs))
        burst = [f for f in flags if f["type"] == "rapid_burst"]
        self.assertEqual(len(burst), 0)

    def test_reviewer_collusion_detected(self):
        subs = {}
        for i in range(3):
            subs[f"S{i}"] = {
                "id": f"S{i}",
                "creator": f"Creator{i}",
                "status": "approved",
                "reviews": [
                    review_entry("Alice", TODAY),
                    review_entry("Bob", TODAY),
                ],
            }
        flags = detect_suspicious_patterns(make_db(subs))
        collusion = [f for f in flags if f["type"] == "reviewer_collusion"]
        self.assertEqual(len(collusion), 1)
        self.assertEqual(collusion[0]["severity"], "high")
        self.assertIn("Alice", collusion[0]["reviewers"])
        self.assertIn("Bob", collusion[0]["reviewers"])

    def test_no_collusion_below_threshold(self):
        subs = {}
        for i in range(2):  # Only 2 co-reviews, threshold is 3
            subs[f"S{i}"] = {
                "id": f"S{i}",
                "creator": f"Creator{i}",
                "status": "approved",
                "reviews": [
                    review_entry("Alice", TODAY),
                    review_entry("Bob", TODAY),
                ],
            }
        flags = detect_suspicious_patterns(make_db(subs))
        collusion = [f for f in flags if f["type"] == "reviewer_collusion"]
        self.assertEqual(len(collusion), 0)

    def test_free_rider_detected(self):
        subs = {}
        for i in range(3):
            subs[f"S{i}"] = {
                "id": f"S{i}",
                "creator": "Freeloader",
                "status": "published",
                "published_at": THIS_WEEK,
                "reviews": [
                    review_entry("TJ", TODAY),
                    review_entry("Ryan", TODAY),
                ],
            }
        flags = detect_suspicious_patterns(make_db(subs))
        free_rider = [f for f in flags if f["type"] == "no_review_contribution"]
        creators = [f["creator"] for f in free_rider]
        self.assertIn("Freeloader", creators)

    def test_active_reviewer_not_flagged(self):
        subs = {
            "S1": {
                "id": "S1",
                "creator": "Jay",
                "status": "published",
                "published_at": THIS_WEEK,
                "reviews": [review_entry("TJ", TODAY)],
            },
            "S2": {
                "id": "S2",
                "creator": "Kiwon",
                "status": "in_review",
                "reviews": [review_entry("Jay", TODAY)],  # Jay reviews others
            },
        }
        flags = detect_suspicious_patterns(make_db(subs))
        free_rider = [
            f
            for f in flags
            if f["type"] == "no_review_contribution" and f["creator"] == "Jay"
        ]
        self.assertEqual(len(free_rider), 0)

    def test_empty_db_no_flags(self):
        flags = detect_suspicious_patterns(make_db({}))
        self.assertEqual(flags, [])


class TestValidateSubmission(unittest.TestCase):
    def test_passes_when_under_limit(self):
        validate_submission("Jay", make_db({}), NOW)

    def test_raises_when_over_limit(self):
        subs = {
            f"S{i}": published_sub("Jay", THIS_WEEK, f"S{i}")
            for i in range(MAX_PUBS_PER_WEEK)
        }
        with self.assertRaises(AntiGamingViolation):
            validate_submission("Jay", make_db(subs), NOW)


class TestValidateReview(unittest.TestCase):
    def _base_db(self) -> dict:
        return make_db({"S1": {"id": "S1", "creator": "Kiwon", "reviews": []}})

    def test_valid_review_passes(self):
        validate_review("S1", "TJ", "x" * 400, self._base_db(), NOW)

    def test_self_review_fails(self):
        db = make_db({"S1": {"id": "S1", "creator": "Jay", "reviews": []}})
        with self.assertRaises(AntiGamingViolation):
            validate_review("S1", "Jay", "x" * 400, db, NOW)

    def test_short_review_fails(self):
        with self.assertRaises(AntiGamingViolation):
            validate_review("S1", "TJ", "too short", self._base_db(), NOW)

    def test_daily_limit_enforced(self):
        reviews = [review_entry("TJ", TODAY) for _ in range(MAX_REVIEWS_PER_DAY)]
        db = make_db({"S1": {"id": "S1", "creator": "Kiwon", "reviews": reviews}})
        with self.assertRaises(AntiGamingViolation):
            validate_review("S1", "TJ", "x" * 400, db, NOW)


if __name__ == "__main__":
    unittest.main()
