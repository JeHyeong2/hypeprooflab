#!/usr/bin/env python3
"""
Peer Review Manager — reviewer matching logic
Usage:
    python3 peer_review_manager.py match <submission_id>
    python3 peer_review_manager.py timeout-check
    python3 peer_review_manager.py stats
"""

import json
import random
import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

SUBMISSIONS_FILE = Path(__file__).parent / "submissions.json"

MEMBERS = {
    "Jay":   {"role": "Admin",   "domains": ["ai", "infra"]},
    "Kiwon": {"role": "Creator", "domains": ["marketing"]},
    "TJ":    {"role": "Creator", "domains": ["video"]},
    "Ryan":  {"role": "Creator", "domains": ["dev"]},
    "JY":    {"role": "Creator", "domains": ["dev"]},
    "BH":    {"role": "Creator", "domains": ["finance"]},
}

REVIEW_DEADLINE_HOURS = 48


def load(path=None):
    p = path or SUBMISSIONS_FILE
    if p.exists():
        return json.loads(p.read_text())
    return {"submissions": {}, "nextId": 1}


def save(data, path=None):
    p = path or SUBMISSIONS_FILE
    p.write_text(json.dumps(data, indent=2, ensure_ascii=False))


def get_recent_reviewers(data, n=3):
    """Get reviewers from the last n completed assignments."""
    subs = sorted(
        [s for s in data["submissions"].values() if s.get("reviewers")],
        key=lambda s: s.get("scoredAt") or s.get("submittedAt") or "",
        reverse=True
    )[:n]
    counts = {}
    for s in subs:
        for r in s["reviewers"]:
            counts[r] = counts.get(r, 0) + 1
    return {name for name, c in counts.items() if c >= 2}


def get_creator_name(creator_id, submission):
    """Map creatorId to member name. Simple heuristic."""
    cid = creator_id.lower()
    for name in MEMBERS:
        if name.lower() in cid:
            return name
    return creator_id


def get_submission_domains(submission):
    """Infer domain from submission or creator."""
    creator = get_creator_name(submission["creatorId"], submission)
    if creator in MEMBERS:
        return MEMBERS[creator]["domains"]
    return []


def match_reviewers(submission, data, members=None):
    """
    Match reviewers for a submission.
    Returns list of reviewer names.
    Rules:
    - Exclude self
    - Exclude overloaded (2+ of last 3)
    - 1 same domain + 1 different domain
    - Fast-track (score >= 90): only 1 reviewer
    """
    if members is None:
        members = MEMBERS

    creator = get_creator_name(submission["creatorId"], submission)
    creator_domains = set(members.get(creator, {}).get("domains", []))
    overloaded = get_recent_reviewers(data)
    score = submission.get("geoScore") or 0
    fast_track = score >= 90

    candidates = [
        name for name in members
        if name != creator and name not in overloaded
    ]

    if not candidates:
        raise ValueError("No available reviewers")

    same_domain = [n for n in candidates if set(members[n]["domains"]) & creator_domains]
    diff_domain = [n for n in candidates if not (set(members[n]["domains"]) & creator_domains)]

    if fast_track:
        # Prefer same domain, fallback to any
        pool = same_domain or diff_domain or candidates
        return [random.choice(pool)]

    reviewers = []
    if same_domain:
        pick = random.choice(same_domain)
        reviewers.append(pick)
        candidates.remove(pick)
        if pick in diff_domain:
            diff_domain.remove(pick)
    if diff_domain:
        pick = random.choice(diff_domain)
        reviewers.append(pick)
    elif candidates:
        remaining = [c for c in candidates if c not in reviewers]
        if remaining:
            reviewers.append(random.choice(remaining))

    needed = 1 if fast_track else 2
    if len(reviewers) < needed:
        # Fill from candidates only (respects overload exclusion)
        remaining = [c for c in candidates if c not in reviewers]
        while len(reviewers) < needed and remaining:
            reviewers.append(remaining.pop(0))

    return reviewers


def cmd_match(sub_id, data):
    sub = data["submissions"].get(sub_id)
    if not sub:
        print(f"Not found: {sub_id}")
        return
    if sub["status"] != "scored":
        print(f"Cannot match: status is {sub['status']}, need 'scored'")
        return

    reviewers = match_reviewers(sub, data)
    deadline = datetime.now(timezone.utc) + timedelta(hours=REVIEW_DEADLINE_HOURS)
    sub["reviewers"] = reviewers
    sub["reviewDeadline"] = deadline.isoformat()
    sub["status"] = "in_review"
    save(data)
    print(f"Matched {sub_id}: {reviewers} (deadline: {deadline.isoformat()})")


def cmd_timeout_check(data):
    now = datetime.now(timezone.utc)
    timed_out = []
    for sid, sub in data["submissions"].items():
        if sub["status"] != "in_review":
            continue
        deadline_str = sub.get("reviewDeadline")
        if not deadline_str:
            continue
        deadline = datetime.fromisoformat(deadline_str)
        if now > deadline:
            pending = set(sub["reviewers"]) - {r["reviewer"] for r in sub["reviews"]}
            if pending:
                timed_out.append({"id": sid, "pending": list(pending)})
    if timed_out:
        for t in timed_out:
            print(f"TIMEOUT {t['id']}: pending from {t['pending']}")
    else:
        print("No timeouts")
    return timed_out


def cmd_stats(data):
    by_status = {}
    for sub in data["submissions"].values():
        by_status[sub["status"]] = by_status.get(sub["status"], 0) + 1
    reviewer_counts = {}
    for sub in data["submissions"].values():
        for r in sub.get("reviewers", []):
            reviewer_counts[r] = reviewer_counts.get(r, 0) + 1
    print("=== Status ===")
    for s, c in sorted(by_status.items()):
        print(f"  {s}: {c}")
    print("=== Reviewer Load ===")
    for r, c in sorted(reviewer_counts.items(), key=lambda x: -x[1]):
        print(f"  {r}: {c}")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        return

    cmd = sys.argv[1]
    data = load()

    if cmd == "match" and len(sys.argv) >= 3:
        cmd_match(sys.argv[2], data)
    elif cmd == "timeout-check":
        cmd_timeout_check(data)
    elif cmd == "stats":
        cmd_stats(data)
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
