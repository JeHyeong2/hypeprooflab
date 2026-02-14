#!/usr/bin/env python3
"""Tests for submission_tracker and peer_review_manager."""

import json
import tempfile
import unittest
from copy import deepcopy
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch

from submission_tracker import load, save, transition, next_id, VALID_TRANSITIONS
from peer_review_manager import (
    match_reviewers, get_recent_reviewers, MEMBERS,
    cmd_timeout_check, REVIEW_DEADLINE_HOURS,
)


def fresh_data():
    return {"submissions": {}, "nextId": 1}


def make_sub(sid="SUB-001", creator="jaylee_59200", status="submitted", score=None, reviewers=None):
    return {
        "id": sid, "creatorId": creator, "title": "Test",
        "status": status, "geoScore": score,
        "submittedAt": datetime.now(timezone.utc).isoformat(),
        "scoredAt": None, "reviewers": reviewers or [], "reviews": [],
        "approvedAt": None, "publishedAt": None,
        "threadId": None, "channelId": "1471863670718857247",
    }


class TestTransitions(unittest.TestCase):
    def test_valid_submitted_to_scored(self):
        sub = make_sub(status="submitted")
        transition(sub, "scored")
        self.assertEqual(sub["status"], "scored")

    def test_valid_scored_to_in_review(self):
        sub = make_sub(status="scored")
        transition(sub, "in_review")
        self.assertEqual(sub["status"], "in_review")

    def test_valid_in_review_to_approved(self):
        sub = make_sub(status="in_review")
        transition(sub, "approved")
        self.assertEqual(sub["status"], "approved")

    def test_valid_approved_to_published(self):
        sub = make_sub(status="approved")
        transition(sub, "published")
        self.assertEqual(sub["status"], "published")

    def test_invalid_submitted_to_published(self):
        sub = make_sub(status="submitted")
        with self.assertRaises(ValueError):
            transition(sub, "published")

    def test_invalid_published_to_anything(self):
        sub = make_sub(status="published")
        with self.assertRaises(ValueError):
            transition(sub, "submitted")

    def test_reject_from_any_active(self):
        for status in ["submitted", "scored", "in_review", "approved"]:
            sub = make_sub(status=status)
            transition(sub, "rejected")
            self.assertEqual(sub["status"], "rejected")

    def test_cannot_reject_rejected(self):
        sub = make_sub(status="rejected")
        with self.assertRaises(ValueError):
            transition(sub, "rejected")


class TestMatching(unittest.TestCase):
    def test_excludes_self(self):
        sub = make_sub(creator="Jay", status="scored", score=80)
        data = fresh_data()
        for _ in range(20):
            reviewers = match_reviewers(sub, data)
            self.assertNotIn("Jay", reviewers)

    def test_two_reviewers_normal(self):
        sub = make_sub(creator="Jay", status="scored", score=80)
        data = fresh_data()
        reviewers = match_reviewers(sub, data)
        self.assertEqual(len(reviewers), 2)

    def test_same_and_diff_domain(self):
        # Jay's domains: ai, infra. No other member has those.
        # So same_domain should be empty, both from diff_domain
        sub = make_sub(creator="Ryan", status="scored", score=80)
        data = fresh_data()
        results = set()
        for _ in range(50):
            revs = match_reviewers(sub, data)
            # Ryan is dev domain. JY is also dev. Should get at least one dev sometimes.
            results.update(revs)
        self.assertIn("JY", results)  # same domain as Ryan

    def test_fast_track_one_reviewer(self):
        sub = make_sub(creator="Jay", status="scored", score=92)
        data = fresh_data()
        reviewers = match_reviewers(sub, data)
        self.assertEqual(len(reviewers), 1)

    def test_fast_track_exactly_90(self):
        sub = make_sub(creator="Jay", status="scored", score=90)
        data = fresh_data()
        reviewers = match_reviewers(sub, data)
        self.assertEqual(len(reviewers), 1)

    def test_fast_track_89_gets_two(self):
        sub = make_sub(creator="Jay", status="scored", score=89)
        data = fresh_data()
        reviewers = match_reviewers(sub, data)
        self.assertEqual(len(reviewers), 2)

    def test_overload_exclusion(self):
        data = fresh_data()
        # Create 3 recent subs all reviewed by Kiwon
        for i in range(3):
            s = make_sub(sid=f"SUB-{i:03d}", creator="Jay", status="in_review", score=80, reviewers=["Kiwon", "TJ"])
            s["scoredAt"] = datetime.now(timezone.utc).isoformat()
            data["submissions"][s["id"]] = s

        sub = make_sub(sid="SUB-NEW", creator="Jay", status="scored", score=80)
        for _ in range(20):
            reviewers = match_reviewers(sub, data)
            # Kiwon appeared in 3/3 last subs → excluded
            self.assertNotIn("Kiwon", reviewers)

    def test_overload_tj_also_excluded(self):
        data = fresh_data()
        for i in range(3):
            s = make_sub(sid=f"SUB-{i:03d}", creator="Jay", status="in_review", score=80, reviewers=["Kiwon", "TJ"])
            s["scoredAt"] = datetime.now(timezone.utc).isoformat()
            data["submissions"][s["id"]] = s
        sub = make_sub(sid="SUB-NEW", creator="Jay", status="scored", score=80)
        for _ in range(20):
            reviewers = match_reviewers(sub, data)
            self.assertNotIn("TJ", reviewers)

    def test_no_available_reviewers(self):
        # Only 1 member besides creator, and they're overloaded
        tiny_members = {
            "Jay": {"role": "Admin", "domains": ["ai"]},
            "Solo": {"role": "Creator", "domains": ["dev"]},
        }
        data = fresh_data()
        for i in range(3):
            s = make_sub(sid=f"SUB-{i:03d}", creator="Jay", status="in_review", reviewers=["Solo"])
            s["scoredAt"] = datetime.now(timezone.utc).isoformat()
            data["submissions"][s["id"]] = s
        sub = make_sub(creator="Jay", status="scored", score=80)
        with self.assertRaises(ValueError):
            match_reviewers(sub, data, members=tiny_members)


class TestTimeout(unittest.TestCase):
    def test_detects_timeout(self):
        data = fresh_data()
        sub = make_sub(status="in_review", reviewers=["Kiwon", "TJ"])
        sub["reviewDeadline"] = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        data["submissions"]["SUB-001"] = sub
        result = cmd_timeout_check(data)
        self.assertEqual(len(result), 1)
        self.assertIn("Kiwon", result[0]["pending"])

    def test_no_timeout_when_within_deadline(self):
        data = fresh_data()
        sub = make_sub(status="in_review", reviewers=["Kiwon"])
        sub["reviewDeadline"] = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        data["submissions"]["SUB-001"] = sub
        result = cmd_timeout_check(data)
        self.assertEqual(len(result), 0)


class TestNextId(unittest.TestCase):
    def test_increments(self):
        data = {"submissions": {}, "nextId": 5}
        sid = next_id(data)
        self.assertEqual(sid, "SUB-005")
        self.assertEqual(data["nextId"], 6)


class TestPersistence(unittest.TestCase):
    def test_save_load_roundtrip(self):
        with tempfile.NamedTemporaryFile(suffix=".json", delete=False) as f:
            p = Path(f.name)
        data = {"submissions": {"SUB-001": make_sub()}, "nextId": 2}
        save(data, p)
        loaded = load(p)
        self.assertEqual(loaded["nextId"], 2)
        self.assertIn("SUB-001", loaded["submissions"])
        p.unlink()


if __name__ == "__main__":
    unittest.main()
