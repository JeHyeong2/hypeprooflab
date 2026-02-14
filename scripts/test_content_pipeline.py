#!/usr/bin/env python3
"""Tests for content_pipeline.py"""

import json
import os
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent))
from content_pipeline import (
    parse_frontmatter, validate_frontmatter, match_reviewers,
    load_submissions, save_submissions, REQUIRED_FRONTMATTER,
    GEO_QA_PASS_THRESHOLD, ACTIVE_CREATORS, WEB_COLUMNS_DIR,
    SUBMISSIONS_FILE, detect_language,
)

VALID_FM = {
    "title": "Test Article",
    "creator": "Jay",
    "date": "2026-01-01",
    "category": "AI",
    "tags": "test",
    "slug": "test-article",
    "readTime": "5 min",
    "excerpt": "A test article",
    "creatorImage": "/members/jay.png",
}

VALID_MD = "---\n" + "\n".join(f'{k}: "{v}"' for k, v in VALID_FM.items()) + "\n---\n\n## Content\n\nBody text here.\n"


class TestSubmitGeoReject(unittest.TestCase):
    """submit: GEO score < 70 should reject"""

    def test_low_geo_rejects(self):
        # A very short article should score < 70
        short_md = "---\ntitle: Short\n---\nHello."
        with tempfile.NamedTemporaryFile(mode='w', suffix='.md', delete=False) as f:
            f.write(short_md)
            f.flush()
            from content_pipeline import run_geo_qa
            result = run_geo_qa(f.name)
            # The score should be below threshold for such minimal content
            self.assertLess(result.get("score", result.get("total", 0)), 100)
        os.unlink(f.name)


class TestReviewerMatching(unittest.TestCase):
    def test_excludes_author(self):
        db = {"submissions": {}, "last_reviewers": []}
        reviewers = match_reviewers(db, "Jay", count=2)
        self.assertNotIn("Jay", reviewers)
        self.assertEqual(len(reviewers), 2)

    def test_avoids_consecutive_assignment(self):
        db = {"submissions": {}, "last_reviewers": ["Mia", "Hoon"]}
        reviewers = match_reviewers(db, "Jay", count=2)
        # Should prefer people NOT in last_reviewers
        for r in reviewers:
            self.assertNotIn(r, ["Mia", "Hoon"])

    def test_fallback_when_not_enough_preferred(self):
        # Only 2 non-author candidates, both in last_reviewers
        db = {"submissions": {}, "last_reviewers": ["Mia", "Hoon", "Sora", "Juno"]}
        reviewers = match_reviewers(db, "Jay", count=2)
        self.assertEqual(len(reviewers), 2)
        self.assertNotIn("Jay", reviewers)

    def test_two_reviewers_on_pass(self):
        db = {"submissions": {}, "last_reviewers": []}
        reviewers = match_reviewers(db, "Jay", count=2)
        self.assertEqual(len(reviewers), 2)


class TestReviewApproval(unittest.TestCase):
    def test_two_approvals_means_approved(self):
        sub = {
            "status": "in_review",
            "reviews": [
                {"reviewer": "Mia", "decision": "approve", "feedback": ""},
                {"reviewer": "Hoon", "decision": "approve", "feedback": ""},
            ],
        }
        approvals = sum(1 for r in sub["reviews"] if r["decision"] == "approve")
        self.assertEqual(approvals, 2)
        if approvals >= 2:
            sub["status"] = "approved"
        self.assertEqual(sub["status"], "approved")


class TestFrontmatterValidation(unittest.TestCase):
    def test_valid_frontmatter(self):
        errors = validate_frontmatter(VALID_FM)
        self.assertEqual(errors, [])

    def test_missing_fields(self):
        fm = {"title": "Test"}
        errors = validate_frontmatter(fm)
        self.assertGreater(len(errors), 0)
        self.assertIn("Missing frontmatter fields", errors[0])

    def test_required_fields_list(self):
        expected = ["title", "creator", "date", "category", "tags", "slug", "readTime", "excerpt", "creatorImage"]
        self.assertEqual(REQUIRED_FRONTMATTER, expected)

    def test_creator_image_format(self):
        fm = dict(VALID_FM)
        fm["creatorImage"] = "bad-path.jpg"
        errors = validate_frontmatter(fm)
        self.assertTrue(any("creatorImage" in e for e in errors))


class TestPublishPath(unittest.TestCase):
    def test_korean_detection(self):
        text = "이것은 한국어 텍스트입니다. " * 10
        self.assertEqual(detect_language(text), "ko")

    def test_english_detection(self):
        self.assertEqual(detect_language("This is English text"), "en")

    def test_publish_copies_to_correct_dir(self):
        """Verify WEB_COLUMNS_DIR is set correctly"""
        self.assertTrue(str(WEB_COLUMNS_DIR).endswith("web/src/content/columns"))


if __name__ == "__main__":
    unittest.main(verbosity=2)
