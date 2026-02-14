#!/usr/bin/env python3
"""
Pipeline Integration Tests — E2E tests for the full content pipeline.

Tests the complete flow: submit → score → review → approve → publish
using temp submissions.json files.

Requires: pytest, pyyaml
"""

import json
import os
import shutil
import tempfile
import unittest
from copy import deepcopy
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch

import sys
sys.path.insert(0, str(Path(__file__).parent))

from submission_tracker import (
    load, save, transition, next_id, VALID_TRANSITIONS,
    cmd_submit, cmd_score, cmd_assign, cmd_review,
    cmd_approve, cmd_publish, cmd_reject, cmd_status,
)
from peer_review_manager import (
    match_reviewers, get_recent_reviewers, cmd_timeout_check,
    MEMBERS, REVIEW_DEADLINE_HOURS,
)
from geo_qa_score import score_article
from content_pipeline import (
    parse_frontmatter, validate_frontmatter, detect_language,
    _heuristic_score, GEO_QA_PASS_THRESHOLD,
)


# ── Helpers ──────────────────────────────────────────────────


def fresh_data():
    return {"submissions": {}, "nextId": 1}


def make_sub(sid="SUB-001", creator="jaylee_59200", title="Test Article",
             status="submitted", score=None, reviewers=None, reviews=None):
    return {
        "id": sid, "creatorId": creator, "title": title,
        "status": status, "geoScore": score,
        "submittedAt": datetime.now(timezone.utc).isoformat(),
        "scoredAt": None, "reviewers": reviewers or [], "reviews": reviews or [],
        "approvedAt": None, "publishedAt": None,
        "threadId": None, "channelId": "1471863670718857247",
    }


def make_args(**kwargs):
    """Create a namespace object mimicking argparse."""
    from types import SimpleNamespace
    return SimpleNamespace(**kwargs)


def temp_submissions_file():
    """Create a temp file for submissions.json and return path."""
    fd, path = tempfile.mkstemp(suffix=".json")
    os.close(fd)
    return Path(path)


def run_full_pipeline(data, path, creator="Ryan", title="Full Test", score=82):
    """Run the full happy path pipeline, returning the final submission."""
    # 1. Submit
    args = make_args(creator=creator, title=title, channel=None, thread=None)
    with patch('submission_tracker.SUBMISSIONS_FILE', path):
        save(data, path)
        sid = cmd_submit(args, data)

    # 2. Score
    args = make_args(id=sid, geo_score=score)
    with patch('submission_tracker.SUBMISSIONS_FILE', path):
        cmd_score(args, data)

    # 3. Match reviewers
    sub = data["submissions"][sid]
    reviewers = match_reviewers(sub, data)

    # 4. Assign
    args = make_args(id=sid, reviewers=reviewers)
    with patch('submission_tracker.SUBMISSIONS_FILE', path):
        cmd_assign(args, data)

    # 5. Reviews
    for reviewer in reviewers:
        args = make_args(id=sid, reviewer=reviewer, verdict="approve", feedback="LGTM")
        with patch('submission_tracker.SUBMISSIONS_FILE', path):
            cmd_review(args, data)

    # 6. Approve
    args = make_args(id=sid)
    with patch('submission_tracker.SUBMISSIONS_FILE', path):
        cmd_approve(args, data)

    # 7. Publish
    args = make_args(id=sid)
    with patch('submission_tracker.SUBMISSIONS_FILE', path):
        cmd_publish(args, data)

    return data["submissions"][sid]


GOOD_ARTICLE = """---
title: "AI와 물리학의 만남"
creator: Ryan
date: 2026-01-15
category: research
tags: [AI, physics]
slug: ai-physics
readTime: "8 min"
excerpt: "AI가 물리학 연구를 어떻게 변화시키고 있는가"
creatorImage: "/members/ryan.png"
---

## 서론

인공지능이 물리학 연구를 혁신하고 있습니다. 최근 연구에 따르면 [1] AI를 활용한 시뮬레이션이
기존 방법보다 100배 빠른 결과를 도출하고 있습니다.

## 본론

### AI 기반 시뮬레이션

DeepMind의 AlphaFold [2]는 단백질 구조 예측의 정확도를 92%까지 높였습니다.
이는 기존 방법 대비 약 3배 향상된 수치입니다 [3].

| 방법 | 정확도 | 속도 |
| --- | --- | --- |
| 전통적 시뮬레이션 | 30% | 1x |
| AI 기반 | 92% | 100x |

### 양자 컴퓨팅과의 융합

양자 컴퓨팅 [4] 분야에서도 AI가 활용되고 있습니다.
구글의 연구에 따르면 약 1000만 큐비트가 필요한 문제를 AI로 최적화할 수 있습니다.

- 양자 에러 보정 최적화
- 회로 설계 자동화
- 실험 데이터 분석

## 결론

AI와 물리학의 융합은 [5] 과학 연구의 새로운 패러다임을 열고 있습니다.

(출처: Nature, Science, arXiv)

## 추가 분석

### 머신러닝 모델의 발전

최근 5년간 머신러닝 모델의 파라미터 수는 약 1000배 증가했습니다 [6].
GPT-4는 약 1.8조 개의 파라미터를 보유하고 있으며, 이는 인간 뇌의 시냅스 수(약 100조 개)에 비하면 아직 1.8%에 불과합니다.

| 모델 | 파라미터 수 | 학습 데이터 | 출시년도 |
| --- | --- | --- | --- |
| GPT-3 | 1750억 | 45TB | 2020 |
| GPT-4 | 1.8조 | 13조 토큰 | 2023 |
| Gemini | 비공개 | 비공개 | 2024 |

### 물리학 시뮬레이션의 혁신

전통적인 몬테카를로 시뮬레이션은 수백 시간이 소요되지만, AI 기반 대리 모델(surrogate model)은 동일한 정확도를 수 초 만에 달성합니다 [7].
CERN의 대형 하드론 충돌기(LHC) 데이터 분석에서도 AI가 약 40%의 시간을 절약하고 있습니다.

- 입자 충돌 시뮬레이션 가속화
- 이상 탐지 자동화
- 실시간 데이터 필터링
- 새로운 입자 후보 탐색

### 향후 전망

2030년까지 AI와 물리학의 융합 시장 규모는 약 500억 달러에 달할 것으로 예상됩니다.
양자 컴퓨팅과 AI의 결합은 현재 불가능한 문제들을 해결할 수 있는 잠재력을 가지고 있습니다 [8].
""" 


# ══════════════════════════════════════════════════════════════
# 1. Happy Path: 제출 → 채점 → 리뷰어 매칭 → 리뷰 → 승인 → 발행
# ══════════════════════════════════════════════════════════════


class TestHappyPath(unittest.TestCase):
    """E2E happy path through the entire pipeline."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_01_full_happy_path(self):
        """Full pipeline: submit → score → assign → review → approve → publish."""
        sub = run_full_pipeline(self.data, self.path)
        self.assertEqual(sub["status"], "published")
        self.assertIsNotNone(sub["publishedAt"])
        self.assertGreater(len(sub["reviews"]), 0)

    def test_02_submission_creates_record(self):
        """Submit creates a record with correct initial state."""
        save(self.data, self.path)
        args = make_args(creator="Jay", title="New Post", channel=None, thread=None)
        sid = cmd_submit(args, self.data)
        save(self.data, self.path)
        self.assertIn(sid, self.data["submissions"])
        sub = self.data["submissions"][sid]
        self.assertEqual(sub["status"], "submitted")
        self.assertEqual(sub["creatorId"], "Jay")
        self.assertIsNone(sub["geoScore"])

    def test_03_scoring_updates_state(self):
        """Score transitions from submitted to scored."""
        save(self.data, self.path)
        args = make_args(creator="Jay", title="Score Test", channel=None, thread=None)
        sid = cmd_submit(args, self.data)
        args = make_args(id=sid, geo_score=85)
        cmd_score(args, self.data)
        sub = self.data["submissions"][sid]
        self.assertEqual(sub["status"], "scored")
        self.assertEqual(sub["geoScore"], 85)


# ══════════════════════════════════════════════════════════════
# 2. 70 미만 → 반려
# ══════════════════════════════════════════════════════════════


class TestLowScoreRejection(unittest.TestCase):
    """Submissions scoring below 70 should be rejected."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_04_score_below_70_reject(self):
        """Score < 70 → reject the submission."""
        save(self.data, self.path)
        args = make_args(creator="Jay", title="Low Quality", channel=None, thread=None)
        sid = cmd_submit(args, self.data)
        args = make_args(id=sid, geo_score=65)
        cmd_score(args, self.data)
        # After scoring, if < 70 the pipeline should reject
        sub = self.data["submissions"][sid]
        self.assertEqual(sub["geoScore"], 65)
        # Reject it
        args = make_args(id=sid, reason="GEO score below threshold")
        cmd_reject(args, self.data)
        self.assertEqual(self.data["submissions"][sid]["status"], "rejected")

    def test_05_geo_qa_low_score_article(self):
        """GEO QA scoring: minimal article gets low score."""
        result = score_article("Just a short text.")
        self.assertLess(result["total"], GEO_QA_PASS_THRESHOLD)

    def test_06_geo_qa_good_article_passes(self):
        """GEO QA scoring: well-structured article passes threshold."""
        result = score_article(GOOD_ARTICLE)
        self.assertGreaterEqual(result["total"], GEO_QA_PASS_THRESHOLD)


# ══════════════════════════════════════════════════════════════
# 3. 한 명 REJECT → 재리뷰
# ══════════════════════════════════════════════════════════════


class TestRejectAndReReview(unittest.TestCase):
    """One reviewer rejects → needs re-review."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_07_one_reject_blocks_approval(self):
        """If one reviewer rejects, submission cannot be approved directly."""
        save(self.data, self.path)
        args = make_args(creator="Jay", title="Mixed Review", channel=None, thread=None)
        sid = cmd_submit(args, self.data)
        cmd_score(make_args(id=sid, geo_score=80), self.data)
        cmd_assign(make_args(id=sid, reviewers=["Kiwon", "TJ"]), self.data)

        # First reviewer approves
        cmd_review(make_args(id=sid, reviewer="Kiwon", verdict="approve", feedback="Good"), self.data)
        # Second reviewer rejects
        cmd_review(make_args(id=sid, reviewer="TJ", verdict="reject", feedback="Needs work"), self.data)

        sub = self.data["submissions"][sid]
        # Should still be in_review, cannot approve
        self.assertEqual(sub["status"], "in_review")
        has_reject = any(r["verdict"] == "reject" for r in sub["reviews"])
        self.assertTrue(has_reject)

    def test_08_re_review_after_reject(self):
        """After rejection feedback, content can be re-reviewed with new reviewers."""
        save(self.data, self.path)
        args = make_args(creator="Ryan", title="Re-review Test", channel=None, thread=None)
        sid = cmd_submit(args, self.data)
        cmd_score(make_args(id=sid, geo_score=80), self.data)
        cmd_assign(make_args(id=sid, reviewers=["Jay", "BH"]), self.data)
        cmd_review(make_args(id=sid, reviewer="Jay", verdict="reject", feedback="Fix citations"), self.data)

        sub = self.data["submissions"][sid]
        # Clear reviews and reassign
        sub["reviews"] = []
        sub["reviewers"] = ["Kiwon", "TJ"]
        save(self.data, self.path)

        # New reviewers approve
        cmd_review(make_args(id=sid, reviewer="Kiwon", verdict="approve", feedback="Fixed"), self.data)
        cmd_review(make_args(id=sid, reviewer="TJ", verdict="approve", feedback="OK"), self.data)
        cmd_approve(make_args(id=sid), self.data)
        self.assertEqual(self.data["submissions"][sid]["status"], "approved")


# ══════════════════════════════════════════════════════════════
# 4. 리뷰어 타임아웃 → 재배정
# ══════════════════════════════════════════════════════════════


class TestReviewerTimeout(unittest.TestCase):
    """Reviewer timeout triggers reassignment."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_09_timeout_detected(self):
        """Detect timed-out reviews."""
        sub = make_sub(sid="SUB-001", status="in_review", score=80, reviewers=["Kiwon", "TJ"])
        sub["reviewDeadline"] = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        self.data["submissions"]["SUB-001"] = sub
        save(self.data, self.path)

        result = cmd_timeout_check(self.data)
        self.assertEqual(len(result), 1)
        self.assertIn("Kiwon", result[0]["pending"])
        self.assertIn("TJ", result[0]["pending"])

    def test_10_timeout_reassignment(self):
        """After timeout, reassign to new reviewers."""
        sub = make_sub(sid="SUB-001", creator="Jay", status="in_review", score=80, reviewers=["Kiwon", "TJ"])
        sub["reviewDeadline"] = (datetime.now(timezone.utc) - timedelta(hours=1)).isoformat()
        self.data["submissions"]["SUB-001"] = sub
        save(self.data, self.path)

        timeouts = cmd_timeout_check(self.data)
        self.assertTrue(len(timeouts) > 0)

        # Reassign
        new_reviewers = match_reviewers(sub, self.data)
        sub["reviewers"] = new_reviewers
        sub["reviews"] = []
        sub["reviewDeadline"] = (datetime.now(timezone.utc) + timedelta(hours=REVIEW_DEADLINE_HOURS)).isoformat()
        save(self.data, self.path)

        # New reviewers were assigned (may overlap due to randomness, just verify assignment happened)
        self.assertEqual(len(new_reviewers), 2)
        self.assertNotIn("Jay", new_reviewers)  # creator excluded
        self.assertEqual(sub["status"], "in_review")

    def test_11_no_timeout_within_deadline(self):
        """No timeout flagged when within deadline."""
        sub = make_sub(sid="SUB-001", status="in_review", reviewers=["Kiwon"])
        sub["reviewDeadline"] = (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        self.data["submissions"]["SUB-001"] = sub
        result = cmd_timeout_check(self.data)
        self.assertEqual(len(result), 0)


# ══════════════════════════════════════════════════════════════
# 5. Fast-track (90+) → 1명 리뷰
# ══════════════════════════════════════════════════════════════


class TestFastTrack(unittest.TestCase):
    """Score >= 90 triggers fast-track with only 1 reviewer."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_12_fast_track_one_reviewer(self):
        """Score >= 90 → only 1 reviewer assigned."""
        sub = make_sub(creator="Jay", status="scored", score=95)
        reviewers = match_reviewers(sub, self.data)
        self.assertEqual(len(reviewers), 1)

    def test_13_fast_track_boundary_90(self):
        """Score exactly 90 → fast-track (1 reviewer)."""
        sub = make_sub(creator="Jay", status="scored", score=90)
        reviewers = match_reviewers(sub, self.data)
        self.assertEqual(len(reviewers), 1)

    def test_14_normal_track_89(self):
        """Score 89 → normal (2 reviewers)."""
        sub = make_sub(creator="Jay", status="scored", score=89)
        reviewers = match_reviewers(sub, self.data)
        self.assertEqual(len(reviewers), 2)


# ══════════════════════════════════════════════════════════════
# 6. 재제출 (점수 비교)
# ══════════════════════════════════════════════════════════════


class TestResubmission(unittest.TestCase):
    """Resubmission should allow score comparison."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_15_resubmission_score_comparison(self):
        """Resubmitted content should get a new (potentially different) score."""
        # First submission: low score
        result1 = score_article("# Short\n\nBrief content.")
        # Improved version
        result2 = score_article(GOOD_ARTICLE)
        self.assertGreater(result2["total"], result1["total"])

    def test_16_resubmit_new_record(self):
        """Resubmission creates a new submission record."""
        save(self.data, self.path)
        # First submission
        sid1 = cmd_submit(make_args(creator="Jay", title="Draft v1", channel=None, thread=None), self.data)
        cmd_score(make_args(id=sid1, geo_score=55), self.data)
        cmd_reject(make_args(id=sid1, reason="Low score"), self.data)

        # Resubmission
        sid2 = cmd_submit(make_args(creator="Jay", title="Draft v2", channel=None, thread=None), self.data)
        cmd_score(make_args(id=sid2, geo_score=85), self.data)

        self.assertNotEqual(sid1, sid2)
        self.assertEqual(self.data["submissions"][sid1]["status"], "rejected")
        self.assertEqual(self.data["submissions"][sid2]["status"], "scored")
        self.assertGreater(self.data["submissions"][sid2]["geoScore"],
                          self.data["submissions"][sid1]["geoScore"])


# ══════════════════════════════════════════════════════════════
# 7. 동시 다수 제출물 처리
# ══════════════════════════════════════════════════════════════


class TestConcurrentSubmissions(unittest.TestCase):
    """Multiple submissions processed simultaneously."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_17_multiple_submissions(self):
        """Process 5 submissions concurrently without ID collision."""
        save(self.data, self.path)
        sids = []
        creators = ["Jay", "Kiwon", "TJ", "Ryan", "BH"]
        for i, creator in enumerate(creators):
            sid = cmd_submit(
                make_args(creator=creator, title=f"Article {i+1}", channel=None, thread=None),
                self.data
            )
            sids.append(sid)

        # All unique IDs
        self.assertEqual(len(set(sids)), 5)
        # All in submitted state
        for sid in sids:
            self.assertEqual(self.data["submissions"][sid]["status"], "submitted")

    def test_18_concurrent_different_stages(self):
        """Multiple submissions in different pipeline stages simultaneously."""
        save(self.data, self.path)
        # Sub 1: submitted
        sid1 = cmd_submit(make_args(creator="Jay", title="A1", channel=None, thread=None), self.data)
        # Sub 2: scored
        sid2 = cmd_submit(make_args(creator="Kiwon", title="A2", channel=None, thread=None), self.data)
        cmd_score(make_args(id=sid2, geo_score=80), self.data)
        # Sub 3: in_review
        sid3 = cmd_submit(make_args(creator="TJ", title="A3", channel=None, thread=None), self.data)
        cmd_score(make_args(id=sid3, geo_score=85), self.data)
        cmd_assign(make_args(id=sid3, reviewers=["Jay", "Ryan"]), self.data)

        self.assertEqual(self.data["submissions"][sid1]["status"], "submitted")
        self.assertEqual(self.data["submissions"][sid2]["status"], "scored")
        self.assertEqual(self.data["submissions"][sid3]["status"], "in_review")


# ══════════════════════════════════════════════════════════════
# 8. 유효하지 않은 상태 전이 → 에러
# ══════════════════════════════════════════════════════════════


class TestInvalidTransitions(unittest.TestCase):
    """Invalid state transitions must raise errors."""

    def test_19_submitted_to_published_invalid(self):
        """Cannot jump from submitted to published."""
        sub = make_sub(status="submitted")
        with self.assertRaises(ValueError):
            transition(sub, "published")

    def test_20_submitted_to_approved_invalid(self):
        """Cannot jump from submitted to approved."""
        sub = make_sub(status="submitted")
        with self.assertRaises(ValueError):
            transition(sub, "approved")

    def test_21_published_is_terminal(self):
        """Published is a terminal state — no further transitions."""
        sub = make_sub(status="published")
        for target in ["submitted", "scored", "in_review", "approved", "rejected"]:
            with self.assertRaises(ValueError):
                transition(sub, target)

    def test_22_rejected_is_terminal(self):
        """Rejected is a terminal state."""
        sub = make_sub(status="rejected")
        for target in ["submitted", "scored", "in_review", "approved", "published", "rejected"]:
            with self.assertRaises(ValueError):
                transition(sub, target)

    def test_23_review_wrong_status(self):
        """Cannot review a submission not in in_review status."""
        self.data = fresh_data()
        sub = make_sub(sid="SUB-001", status="submitted")
        self.data["submissions"]["SUB-001"] = sub
        with self.assertRaises(ValueError):
            cmd_review(make_args(id="SUB-001", reviewer="Jay", verdict="approve", feedback=""), self.data)


# ══════════════════════════════════════════════════════════════
# 9. 발행 후 포인트 적립 확인
# ══════════════════════════════════════════════════════════════


class TestPublishPoints(unittest.TestCase):
    """Publishing should track point-eligible state."""

    def setUp(self):
        self.path = temp_submissions_file()
        self.data = fresh_data()

    def tearDown(self):
        self.path.unlink(missing_ok=True)

    def test_24_publish_records_timestamp(self):
        """Published submissions have publishedAt timestamp for point calculation."""
        sub = run_full_pipeline(self.data, self.path)
        self.assertEqual(sub["status"], "published")
        self.assertIsNotNone(sub["publishedAt"])
        # Verify timestamp is valid ISO format
        ts = datetime.fromisoformat(sub["publishedAt"])
        self.assertIsInstance(ts, datetime)

    def test_25_publish_has_creator_for_points(self):
        """Published submission retains creatorId for point attribution."""
        sub = run_full_pipeline(self.data, self.path, creator="BH", title="Points Test")
        self.assertEqual(sub["creatorId"], "BH")
        self.assertEqual(sub["status"], "published")


# ══════════════════════════════════════════════════════════════
# 10. 승인 요청 메시지 파싱 정확성
# ══════════════════════════════════════════════════════════════


class TestApprovalMessageParsing(unittest.TestCase):
    """Approval request messages must be parseable and accurate."""

    def test_26_frontmatter_parsing(self):
        """Frontmatter is parsed correctly for approval requests."""
        fm = parse_frontmatter(GOOD_ARTICLE)
        self.assertIsNotNone(fm)
        self.assertIn("title", fm)

    def test_27_frontmatter_validation(self):
        """Frontmatter validation catches missing fields."""
        good_fm = {
            "title": "Test", "creator": "Jay", "date": "2026-01-01",
            "category": "AI", "tags": "test", "slug": "test",
            "readTime": "5 min", "excerpt": "Test", "creatorImage": "/members/jay.png",
        }
        errors = validate_frontmatter(good_fm)
        self.assertEqual(errors, [])

        bad_fm = {"title": "Test"}
        errors = validate_frontmatter(bad_fm)
        self.assertGreater(len(errors), 0)

    def test_28_geo_score_breakdown(self):
        """GEO score includes detailed breakdown for approval review."""
        result = score_article(GOOD_ARTICLE)
        self.assertIn("breakdown", result)
        self.assertIn("total", result)
        self.assertEqual(len(result["breakdown"]), 9)
        categories = {b["category"] for b in result["breakdown"]}
        self.assertIn("인라인 인용", categories)
        self.assertIn("구조", categories)

    def test_29_language_detection_accuracy(self):
        """Language detection is accurate for Korean and English."""
        ko_text = "이것은 한국어 텍스트입니다. " * 10
        en_text = "This is an English text with no Korean characters."
        self.assertEqual(detect_language(ko_text), "ko")
        self.assertEqual(detect_language(en_text), "en")

    def test_30_valid_transitions_map_complete(self):
        """All states are covered in the transition map."""
        expected_states = {"submitted", "scored", "in_review", "approved", "published", "rejected"}
        self.assertEqual(set(VALID_TRANSITIONS.keys()), expected_states)


if __name__ == "__main__":
    unittest.main(verbosity=2)
