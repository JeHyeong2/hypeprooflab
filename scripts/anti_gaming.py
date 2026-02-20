#!/usr/bin/env python3
"""
Anti-Gaming Rules for HypeProof content pipeline.

Rules enforced:
  - Max 3 publications per creator per week
  - Max 5 reviews per creator per day
  - Min review length 300 chars
  - Flag suspicious patterns (rapid bursts, collusion, free-riders)

Usage:
    python anti_gaming.py check-pub --creator NAME
    python anti_gaming.py check-review --submission-id ID --reviewer NAME --feedback TEXT
    python anti_gaming.py scan
"""

import argparse
import json
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Optional

SCRIPT_DIR = Path(__file__).parent.resolve()
SUBMISSIONS_FILE = SCRIPT_DIR / "submissions.json"

MAX_PUBS_PER_WEEK = 3
MAX_REVIEWS_PER_DAY = 5
MIN_REVIEW_LENGTH = 300


class AntiGamingViolation(Exception):
    pass


# ── Data helpers ─────────────────────────────────────────────


def load_submissions(path=None) -> dict:
    p = path or SUBMISSIONS_FILE
    if p.exists():
        return json.loads(p.read_text())
    return {"submissions": {}}


def _parse_dt(iso: str) -> datetime:
    dt = datetime.fromisoformat(iso)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def get_week_start(dt: datetime) -> datetime:
    """Return Monday 00:00 UTC of the week containing dt."""
    monday = dt - timedelta(days=dt.weekday())
    return monday.replace(hour=0, minute=0, second=0, microsecond=0)


# ── Individual rule checks ───────────────────────────────────


def check_publication_limit(
    creator: str, db: dict, now: Optional[datetime] = None
) -> None:
    """Raise AntiGamingViolation if creator has >= MAX_PUBS_PER_WEEK this week."""
    now = now or datetime.now(timezone.utc)
    week_start = get_week_start(now)

    count = 0
    for sub in db["submissions"].values():
        if sub.get("creator") != creator:
            continue
        if sub.get("status") != "published":
            continue
        published_at = sub.get("published_at") or sub.get("publishedAt")
        if not published_at:
            continue
        if _parse_dt(published_at) >= week_start:
            count += 1

    if count >= MAX_PUBS_PER_WEEK:
        raise AntiGamingViolation(
            f"Publication limit exceeded: {creator} has {count} publications this week "
            f"(max {MAX_PUBS_PER_WEEK})"
        )


def check_review_limit(reviewer: str, db: dict, now: Optional[datetime] = None) -> None:
    """Raise AntiGamingViolation if reviewer has >= MAX_REVIEWS_PER_DAY today."""
    now = now or datetime.now(timezone.utc)
    day_start = now.replace(hour=0, minute=0, second=0, microsecond=0)

    count = 0
    for sub in db["submissions"].values():
        for review in sub.get("reviews", []):
            if review.get("reviewer") != reviewer:
                continue
            ts = review.get("timestamp") or review.get("reviewedAt")
            if not ts:
                continue
            if _parse_dt(ts) >= day_start:
                count += 1

    if count >= MAX_REVIEWS_PER_DAY:
        raise AntiGamingViolation(
            f"Review limit exceeded: {reviewer} has {count} reviews today "
            f"(max {MAX_REVIEWS_PER_DAY})"
        )


def check_review_length(feedback: str) -> None:
    """Raise AntiGamingViolation if feedback is shorter than MIN_REVIEW_LENGTH."""
    length = len(feedback.strip())
    if length < MIN_REVIEW_LENGTH:
        raise AntiGamingViolation(
            f"Review too short: {length} chars (minimum {MIN_REVIEW_LENGTH})"
        )


def check_self_review(submission_id: str, reviewer: str, db: dict) -> None:
    """Raise AntiGamingViolation if reviewer is reviewing their own submission."""
    sub = db["submissions"].get(submission_id)
    if sub and sub.get("creator") == reviewer:
        raise AntiGamingViolation(
            f"Self-review not allowed: {reviewer} cannot review their own submission"
        )


# ── Composite validators ─────────────────────────────────────


def validate_submission(creator: str, db: dict, now: Optional[datetime] = None) -> None:
    """Run all pre-submission checks. Raises AntiGamingViolation on failure."""
    check_publication_limit(creator, db, now)


def validate_review(
    submission_id: str,
    reviewer: str,
    feedback: str,
    db: dict,
    now: Optional[datetime] = None,
) -> None:
    """Run all pre-review checks. Raises AntiGamingViolation on failure."""
    check_self_review(submission_id, reviewer, db)
    check_review_limit(reviewer, db, now)
    check_review_length(feedback)


# ── Pattern detection ────────────────────────────────────────


def detect_suspicious_patterns(db: dict) -> list[dict]:
    """
    Scan all submissions and return list of flagged incidents.

    Patterns detected:
    - Rapid submission bursts (3+ submissions within 1 hour)
    - Reviewer pair collusion (same 2 reviewers co-reviewing 3+ times)
    - Free-rider (creator with 3+ reviews received but 0 given)
    """
    flags = []

    # 1. Rapid submission bursts
    creator_times: dict[str, list[datetime]] = {}
    for sub in db["submissions"].values():
        creator = sub.get("creator", "Unknown")
        ts = sub.get("submitted_at") or sub.get("submittedAt")
        if ts:
            creator_times.setdefault(creator, []).append(_parse_dt(ts))

    for creator, times in creator_times.items():
        times_sorted = sorted(times)
        for i in range(len(times_sorted) - 2):
            window = times_sorted[i : i + 3]
            if (window[-1] - window[0]).total_seconds() < 3600:
                flags.append(
                    {
                        "type": "rapid_burst",
                        "creator": creator,
                        "details": (
                            f"3 submissions within 1 hour around {window[0].isoformat()}"
                        ),
                        "severity": "medium",
                    }
                )
                break  # one flag per creator

    # 2. Reviewer pair collusion (same pair co-reviews 3+ submissions)
    pair_counts: dict[tuple, int] = {}
    for sub in db["submissions"].values():
        reviewers = [
            r.get("reviewer") for r in sub.get("reviews", []) if r.get("reviewer")
        ]
        if len(reviewers) >= 2:
            pair = tuple(sorted(reviewers[:2]))
            pair_counts[pair] = pair_counts.get(pair, 0) + 1

    for pair, count in pair_counts.items():
        if count >= 3:
            flags.append(
                {
                    "type": "reviewer_collusion",
                    "reviewers": list(pair),
                    "count": count,
                    "details": (
                        f"Reviewers {pair[0]} and {pair[1]} co-reviewed {count} times"
                    ),
                    "severity": "high",
                }
            )

    # 3. Free-rider: received 3+ reviews but gave 0
    review_given: dict[str, int] = {}
    review_received: dict[str, int] = {}
    for sub in db["submissions"].values():
        creator = sub.get("creator", "Unknown")
        review_received[creator] = review_received.get(creator, 0) + 1
        for review in sub.get("reviews", []):
            reviewer = review.get("reviewer", "Unknown")
            review_given[reviewer] = review_given.get(reviewer, 0) + 1

    for creator, received in review_received.items():
        given = review_given.get(creator, 0)
        if received >= 3 and given == 0:
            flags.append(
                {
                    "type": "no_review_contribution",
                    "creator": creator,
                    "received": received,
                    "given": given,
                    "details": f"{creator} received {received} reviews but gave 0",
                    "severity": "low",
                }
            )

    return flags


# ── CLI ─────────────────────────────────────────────────────


def cmd_check_pub(args):
    db = load_submissions()
    try:
        validate_submission(args.creator, db)
        print(f"✅ {args.creator} is within publication limits")
    except AntiGamingViolation as e:
        print(f"🚫 {e}")
        return 1


def cmd_check_review(args):
    db = load_submissions()
    try:
        validate_review(args.submission_id, args.reviewer, args.feedback, db)
        print(f"✅ Review from {args.reviewer} passes all checks")
    except AntiGamingViolation as e:
        print(f"🚫 {e}")
        return 1


def cmd_scan(args):
    db = load_submissions()
    flags = detect_suspicious_patterns(db)
    if not flags:
        print("✅ No suspicious patterns detected")
        return 0

    print(f"⚠️  {len(flags)} suspicious pattern(s) detected:\n")
    for f in flags:
        severity = {"high": "🔴", "medium": "🟡", "low": "🟢"}.get(f["severity"], "⚪")
        print(f"{severity} [{f['type']}] {f['details']}")
    return 0


def main():
    parser = argparse.ArgumentParser(description="HypeProof Anti-Gaming Checker")
    sub = parser.add_subparsers(dest="command")

    p = sub.add_parser("check-pub", help="Check publication limits for a creator")
    p.add_argument("--creator", required=True)

    p = sub.add_parser("check-review", help="Validate a review before recording")
    p.add_argument("--submission-id", required=True)
    p.add_argument("--reviewer", required=True)
    p.add_argument("--feedback", required=True)

    sub.add_parser("scan", help="Scan all submissions for suspicious patterns")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return 1

    return {
        "check-pub": cmd_check_pub,
        "check-review": cmd_check_review,
        "scan": cmd_scan,
    }[args.command](args) or 0


if __name__ == "__main__":
    sys.exit(main())
