#!/usr/bin/env python3
"""Tests for auto_points.py"""

import sys
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).parent))

from auto_points import (
    POINTS_AI_CITATION_30D,
    POINTS_REFERRAL,
    POINTS_REVIEW,
    credit_ai_citation_30d,
    credit_content_published,
    credit_referral,
    credit_review_completed,
    get_content_points,
)

MOCK_RESPONSE = {"id": "abc", "member": "Jay", "amount": 50, "total": 150}


class TestGetContentPoints(unittest.TestCase):
    def test_geo_70_to_84_returns_50(self):
        for score in [70, 75, 84]:
            with self.subTest(score=score):
                self.assertEqual(get_content_points(score), 50)

    def test_geo_85_to_94_returns_80(self):
        for score in [85, 90, 94]:
            with self.subTest(score=score):
                self.assertEqual(get_content_points(score), 80)

    def test_geo_95_plus_returns_120(self):
        for score in [95, 98, 100]:
            with self.subTest(score=score):
                self.assertEqual(get_content_points(score), 120)

    def test_below_threshold_returns_0(self):
        self.assertEqual(get_content_points(69), 0)
        self.assertEqual(get_content_points(0), 0)

    def test_exact_boundary_70(self):
        self.assertEqual(get_content_points(70), 50)

    def test_exact_boundary_85(self):
        self.assertEqual(get_content_points(85), 80)

    def test_exact_boundary_95(self):
        self.assertEqual(get_content_points(95), 120)


class TestCreditContentPublished(unittest.TestCase):
    @patch("auto_points.call_credit_api")
    def test_geo_75_credits_50pts(self, mock_api):
        mock_api.return_value = {**MOCK_RESPONSE, "amount": 50}
        credit_content_published("Jay", 75)
        call_args = mock_api.call_args[0][0]
        self.assertEqual(call_args["amount"], 50)
        self.assertEqual(call_args["member"], "Jay")
        self.assertEqual(call_args["type"], "Earn")
        self.assertEqual(call_args["category"], "Content")

    @patch("auto_points.call_credit_api")
    def test_geo_90_credits_80pts(self, mock_api):
        mock_api.return_value = {**MOCK_RESPONSE, "amount": 80}
        credit_content_published("Ryan", 90)
        call_args = mock_api.call_args[0][0]
        self.assertEqual(call_args["amount"], 80)

    @patch("auto_points.call_credit_api")
    def test_geo_97_credits_120pts(self, mock_api):
        mock_api.return_value = {**MOCK_RESPONSE, "amount": 120}
        credit_content_published("Kiwon", 97)
        call_args = mock_api.call_args[0][0]
        self.assertEqual(call_args["amount"], 120)

    def test_below_threshold_raises_value_error(self):
        with self.assertRaises(ValueError):
            credit_content_published("Jay", 69)

    def test_geo_0_raises_value_error(self):
        with self.assertRaises(ValueError):
            credit_content_published("Jay", 0)

    @patch("auto_points.call_credit_api")
    def test_note_includes_geo_score(self, mock_api):
        mock_api.return_value = MOCK_RESPONSE
        credit_content_published("Jay", 75)
        note = mock_api.call_args[0][0]["note"]
        self.assertIn("75", note)


class TestCreditReviewCompleted(unittest.TestCase):
    @patch("auto_points.call_credit_api")
    def test_valid_review_credits_correct_amount(self, mock_api):
        mock_api.return_value = {**MOCK_RESPONSE, "amount": POINTS_REVIEW}
        credit_review_completed("TJ", 350)
        call_args = mock_api.call_args[0][0]
        self.assertEqual(call_args["amount"], POINTS_REVIEW)
        self.assertEqual(call_args["category"], "Review")
        self.assertEqual(call_args["member"], "TJ")

    def test_short_review_raises_value_error(self):
        with self.assertRaises(ValueError):
            credit_review_completed("TJ", 299)

    def test_zero_length_raises_value_error(self):
        with self.assertRaises(ValueError):
            credit_review_completed("TJ", 0)

    @patch("auto_points.call_credit_api")
    def test_exactly_300_chars_passes(self, mock_api):
        mock_api.return_value = MOCK_RESPONSE
        credit_review_completed("TJ", 300)
        mock_api.assert_called_once()

    @patch("auto_points.call_credit_api")
    def test_note_includes_review_length(self, mock_api):
        mock_api.return_value = MOCK_RESPONSE
        credit_review_completed("TJ", 500)
        note = mock_api.call_args[0][0]["note"]
        self.assertIn("500", note)


class TestCreditAiCitation30d(unittest.TestCase):
    @patch("auto_points.call_credit_api")
    def test_credits_correct_amount(self, mock_api):
        mock_api.return_value = {**MOCK_RESPONSE, "amount": POINTS_AI_CITATION_30D}
        credit_ai_citation_30d("Jay")
        call_args = mock_api.call_args[0][0]
        self.assertEqual(call_args["amount"], POINTS_AI_CITATION_30D)
        self.assertEqual(call_args["category"], "Community")
        self.assertEqual(call_args["member"], "Jay")
        self.assertEqual(call_args["type"], "Earn")


class TestCreditReferral(unittest.TestCase):
    @patch("auto_points.call_credit_api")
    def test_credits_correct_amount(self, mock_api):
        mock_api.return_value = {**MOCK_RESPONSE, "amount": POINTS_REFERRAL}
        credit_referral("Sebastian")
        call_args = mock_api.call_args[0][0]
        self.assertEqual(call_args["amount"], POINTS_REFERRAL)
        self.assertEqual(call_args["category"], "Referral")
        self.assertEqual(call_args["member"], "Sebastian")
        self.assertEqual(call_args["type"], "Earn")


if __name__ == "__main__":
    unittest.main()
