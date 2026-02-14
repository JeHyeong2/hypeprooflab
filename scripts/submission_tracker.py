#!/usr/bin/env python3
"""
Submission Tracker — CRUD for submissions.json
Usage:
    python3 submission_tracker.py submit --creator ID --title TITLE [--channel CHAN] [--thread THREAD]
    python3 submission_tracker.py score <id> --geo-score N
    python3 submission_tracker.py assign <id> --reviewers R1 R2
    python3 submission_tracker.py review <id> --reviewer NAME --verdict approve|reject [--feedback TEXT]
    python3 submission_tracker.py approve <id>
    python3 submission_tracker.py publish <id>
    python3 submission_tracker.py reject <id> [--reason TEXT]
    python3 submission_tracker.py status [id]
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

SUBMISSIONS_FILE = Path(__file__).parent / "submissions.json"

VALID_TRANSITIONS = {
    "submitted": ["scored", "rejected"],
    "scored": ["in_review", "rejected"],
    "in_review": ["approved", "rejected"],
    "approved": ["published", "rejected"],
    "published": [],
    "rejected": [],
}


def load(path=None):
    p = path or SUBMISSIONS_FILE
    if p.exists():
        return json.loads(p.read_text())
    return {"submissions": {}, "nextId": 1}


def save(data, path=None):
    p = path or SUBMISSIONS_FILE
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def now_iso():
    return datetime.now(timezone.utc).isoformat()


def next_id(data):
    n = data.get("nextId", 1)
    sid = f"SUB-{n:03d}"
    data["nextId"] = n + 1
    return sid


def transition(sub, target):
    current = sub["status"]
    if target not in VALID_TRANSITIONS.get(current, []):
        raise ValueError(f"Invalid transition: {current} → {target}")
    sub["status"] = target
    return sub


def cmd_submit(args, data):
    sid = next_id(data)
    sub = {
        "id": sid,
        "creatorId": args.creator,
        "title": args.title,
        "status": "submitted",
        "geoScore": None,
        "submittedAt": now_iso(),
        "scoredAt": None,
        "reviewers": [],
        "reviews": [],
        "approvedAt": None,
        "publishedAt": None,
        "threadId": getattr(args, "thread", None),
        "channelId": getattr(args, "channel", None) or "1471863670718857247",
    }
    data["submissions"][sid] = sub
    save(data)
    print(f"Created {sid}")
    return sid


def cmd_score(args, data):
    sub = data["submissions"][args.id]
    transition(sub, "scored")
    sub["geoScore"] = args.geo_score
    sub["scoredAt"] = now_iso()
    save(data)
    print(f"{args.id} scored {args.geo_score}")


def cmd_assign(args, data):
    sub = data["submissions"][args.id]
    transition(sub, "in_review")
    sub["reviewers"] = args.reviewers
    sub["reviewDeadline"] = now_iso()  # caller should set proper deadline
    save(data)
    print(f"{args.id} assigned to {args.reviewers}")


def cmd_review(args, data):
    sub = data["submissions"][args.id]
    if sub["status"] != "in_review":
        raise ValueError(f"Cannot review in status {sub['status']}")
    sub["reviews"].append({
        "reviewer": args.reviewer,
        "verdict": args.verdict,
        "feedback": getattr(args, "feedback", ""),
        "reviewedAt": now_iso(),
    })
    save(data)
    print(f"{args.id} reviewed by {args.reviewer}: {args.verdict}")


def cmd_approve(args, data):
    sub = data["submissions"][args.id]
    transition(sub, "approved")
    sub["approvedAt"] = now_iso()
    save(data)
    print(f"{args.id} approved")


def cmd_publish(args, data):
    sub = data["submissions"][args.id]
    transition(sub, "published")
    sub["publishedAt"] = now_iso()
    save(data)
    print(f"{args.id} published")


def cmd_reject(args, data):
    sub = data["submissions"][args.id]
    transition(sub, "rejected")
    sub["rejectedAt"] = now_iso()
    sub["rejectReason"] = getattr(args, "reason", "")
    save(data)
    print(f"{args.id} rejected")


def cmd_status(args, data):
    if args.id:
        sub = data["submissions"].get(args.id)
        if not sub:
            print(f"Not found: {args.id}")
            return
        print(json.dumps(sub, indent=2, ensure_ascii=False))
    else:
        for sid, sub in data["submissions"].items():
            print(f"{sid}: {sub['status']} — {sub['title']}")


def main(argv=None):
    p = argparse.ArgumentParser()
    sp = p.add_subparsers(dest="cmd")

    s = sp.add_parser("submit")
    s.add_argument("--creator", required=True)
    s.add_argument("--title", required=True)
    s.add_argument("--channel")
    s.add_argument("--thread")

    s = sp.add_parser("score")
    s.add_argument("id")
    s.add_argument("--geo-score", type=int, required=True)

    s = sp.add_parser("assign")
    s.add_argument("id")
    s.add_argument("--reviewers", nargs="+", required=True)

    s = sp.add_parser("review")
    s.add_argument("id")
    s.add_argument("--reviewer", required=True)
    s.add_argument("--verdict", choices=["approve", "reject"], required=True)
    s.add_argument("--feedback", default="")

    s = sp.add_parser("approve")
    s.add_argument("id")

    s = sp.add_parser("publish")
    s.add_argument("id")

    s = sp.add_parser("reject")
    s.add_argument("id")
    s.add_argument("--reason", default="")

    s = sp.add_parser("status")
    s.add_argument("id", nargs="?")

    args = p.parse_args(argv)
    if not args.cmd:
        p.print_help()
        return

    data = load()
    {"submit": cmd_submit, "score": cmd_score, "assign": cmd_assign,
     "review": cmd_review, "approve": cmd_approve, "publish": cmd_publish,
     "reject": cmd_reject, "status": cmd_status}[args.cmd](args, data)


if __name__ == "__main__":
    main()
