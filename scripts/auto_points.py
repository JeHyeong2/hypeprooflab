#!/usr/bin/env python3
"""
Auto Points — credit points on pipeline events.

Called by content_pipeline.py after key events.

Events:
  content_published  --creator NAME --geo-score N
  review_completed   --reviewer NAME --review-length N
  ai_citation_30d    --creator NAME
  referral           --referrer NAME
"""

import argparse
import json
import os
import sys
import urllib.error
import urllib.request
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()

CREDIT_API_URL = (
    os.getenv("HYPEPROOF_API_URL", "http://localhost:3000") + "/api/points/credit"
)
CREDIT_API_SECRET = os.getenv("CREDIT_API_SECRET", "")

# Points tiers (task spec)
POINTS_CONTENT = {
    (70, 85): 50,  # GEO 70-84
    (85, 95): 80,  # GEO 85-94
    (95, 101): 120,  # GEO 95+
}

POINTS_REVIEW = 20
POINTS_AI_CITATION_30D = 30
POINTS_REFERRAL = 100
MIN_REVIEW_LENGTH = 300


def get_content_points(geo_score: int) -> int:
    """Return point value for a given GEO score, or 0 if below threshold."""
    for (low, high), pts in POINTS_CONTENT.items():
        if low <= geo_score < high:
            return pts
    return 0


def call_credit_api(payload: dict) -> dict:
    """POST to /api/points/credit and return response dict."""
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        CREDIT_API_URL,
        data=data,
        headers={
            "Content-Type": "application/json",
            "X-Credit-Secret": CREDIT_API_SECRET,
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8")
        raise RuntimeError(f"API error {e.code}: {body}") from e


def credit_content_published(creator: str, geo_score: int) -> dict:
    pts = get_content_points(geo_score)
    if pts == 0:
        raise ValueError(f"GEO score {geo_score} is below threshold (70)")
    return call_credit_api(
        {
            "member": creator,
            "amount": pts,
            "type": "Earn",
            "category": "Content",
            "note": f"Content published — GEO score {geo_score}",
        }
    )


def credit_review_completed(reviewer: str, review_length: int) -> dict:
    if review_length < MIN_REVIEW_LENGTH:
        raise ValueError(
            f"Review too short: {review_length} chars (min {MIN_REVIEW_LENGTH})"
        )
    return call_credit_api(
        {
            "member": reviewer,
            "amount": POINTS_REVIEW,
            "type": "Earn",
            "category": "Review",
            "note": f"Peer review completed ({review_length} chars)",
        }
    )


def credit_ai_citation_30d(creator: str) -> dict:
    return call_credit_api(
        {
            "member": creator,
            "amount": POINTS_AI_CITATION_30D,
            "type": "Earn",
            "category": "Community",
            "note": "AI citation confirmed at 30-day mark",
        }
    )


def credit_referral(referrer: str) -> dict:
    return call_credit_api(
        {
            "member": referrer,
            "amount": POINTS_REFERRAL,
            "type": "Earn",
            "category": "Referral",
            "note": "Creator referral — new member onboarded",
        }
    )


# ── CLI ─────────────────────────────────────────────────────


def cmd_content(args):
    try:
        result = credit_content_published(args.creator, args.geo_score)
        print(
            f"✅ Credited {result.get('amount', '?')} pts to {args.creator} (GEO {args.geo_score})"
        )
        print(f"   New total: {result.get('total', '?')} pts")
    except ValueError as e:
        print(f"❌ {e}")
        return 1


def cmd_review(args):
    try:
        result = credit_review_completed(args.reviewer, args.review_length)
        print(f"✅ Credited {POINTS_REVIEW} pts to {args.reviewer}")
        print(f"   New total: {result.get('total', '?')} pts")
    except ValueError as e:
        print(f"❌ {e}")
        return 1


def cmd_citation(args):
    result = credit_ai_citation_30d(args.creator)
    print(
        f"✅ Credited {POINTS_AI_CITATION_30D} pts to {args.creator} (AI citation 30d)"
    )
    print(f"   New total: {result.get('total', '?')} pts")


def cmd_referral(args):
    result = credit_referral(args.referrer)
    print(f"✅ Credited {POINTS_REFERRAL} pts to {args.referrer} (referral)")
    print(f"   New total: {result.get('total', '?')} pts")


def main():
    parser = argparse.ArgumentParser(description="HypeProof Auto Points Crediting")
    sub = parser.add_subparsers(dest="command")

    p = sub.add_parser("content", help="Credit points for content published")
    p.add_argument("--creator", required=True)
    p.add_argument("--geo-score", type=int, required=True)

    p = sub.add_parser("review", help="Credit points for peer review completed")
    p.add_argument("--reviewer", required=True)
    p.add_argument("--review-length", type=int, required=True)

    p = sub.add_parser("citation", help="Credit AI citation 30d bonus")
    p.add_argument("--creator", required=True)

    p = sub.add_parser("referral", help="Credit referral bonus")
    p.add_argument("--referrer", required=True)

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return 1

    return {
        "content": cmd_content,
        "review": cmd_review,
        "citation": cmd_citation,
        "referral": cmd_referral,
    }[args.command](args) or 0


if __name__ == "__main__":
    sys.exit(main())
