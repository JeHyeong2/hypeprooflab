#!/usr/bin/env python3
"""
Content Pipeline Automation — Phase 1 (Mother-direct)
Usage:
    python content_pipeline.py submit <file.md> [--author NAME]
    python content_pipeline.py review <id> <approve|reject> [--reviewer NAME] [--feedback TEXT]
    python content_pipeline.py status [id]
    python content_pipeline.py publish <id>
"""

import argparse
import json
import os
import random
import re
import shutil
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

SCRIPT_DIR = Path(__file__).parent.resolve()
PROJECT_ROOT = SCRIPT_DIR.parent
SUBMISSIONS_FILE = SCRIPT_DIR / "submissions.json"
WEB_COLUMNS_DIR = PROJECT_ROOT / "web" / "src" / "content" / "columns"

REQUIRED_FRONTMATTER = [
    "title", "author", "date", "category", "tags",
    "slug", "readTime", "excerpt", "authorImage"
]

ACTIVE_CREATORS = ["Jay", "Mia", "Hoon", "Sora", "Juno"]

GEO_QA_PASS_THRESHOLD = 70


# ── Submissions DB ──────────────────────────────────────────

def load_submissions() -> dict:
    if SUBMISSIONS_FILE.exists():
        return json.loads(SUBMISSIONS_FILE.read_text())
    return {"submissions": {}, "last_reviewers": []}


def save_submissions(db: dict):
    SUBMISSIONS_FILE.write_text(json.dumps(db, indent=2, ensure_ascii=False))


# ── Frontmatter ─────────────────────────────────────────────

def parse_frontmatter(text: str) -> dict | None:
    m = re.match(r"^---\s*\n(.*?)\n---", text, re.DOTALL)
    if not m:
        return None
    fm = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            key = line.split(":", 1)[0].strip()
            val = line.split(":", 1)[1].strip().strip('"').strip("'")
            fm[key] = val
    return fm


def validate_frontmatter(fm: dict) -> list[str]:
    missing = [k for k in REQUIRED_FRONTMATTER if k not in fm or not fm[k]]
    errors = []
    if missing:
        errors.append(f"Missing frontmatter fields: {', '.join(missing)}")
    if "authorImage" in fm and not re.match(r"^/members/\w+\.png$", fm["authorImage"]):
        errors.append(f"authorImage should be /members/{{name}}.png, got: {fm['authorImage']}")
    return errors


def detect_language(text: str) -> str:
    korean_chars = len(re.findall(r"[\uac00-\ud7af]", text))
    return "ko" if korean_chars > 20 else "en"


# ── GEO QA ──────────────────────────────────────────────────

def run_geo_qa(filepath: str) -> dict:
    """Run geo_qa_score.py and return {score, feedback}."""
    geo_script = SCRIPT_DIR / "geo_qa_score.py"
    if not geo_script.exists():
        # Fallback: simple heuristic scoring
        return _heuristic_score(filepath)
    try:
        result = subprocess.run(
            [sys.executable, str(geo_script), filepath],
            capture_output=True, text=True, timeout=60
        )
        output = result.stdout.strip()
        # Expect JSON output with score and feedback
        return json.loads(output)
    except Exception as e:
        print(f"⚠️  GEO QA script error ({e}), using heuristic scoring")
        return _heuristic_score(filepath)


def _heuristic_score(filepath: str) -> dict:
    """Basic quality heuristic when geo_qa_score.py is unavailable."""
    text = Path(filepath).read_text()
    fm = parse_frontmatter(text)
    score = 50
    feedback = []

    # Frontmatter completeness (+20)
    if fm:
        fm_errors = validate_frontmatter(fm)
        if not fm_errors:
            score += 20
        else:
            feedback.extend(fm_errors)
    else:
        feedback.append("No frontmatter found")

    # Word count (+15 for 500+)
    body = re.sub(r"^---.*?---", "", text, flags=re.DOTALL).strip()
    words = len(body.split())
    if words >= 500:
        score += 15
    elif words >= 200:
        score += 8
    else:
        feedback.append(f"Content too short ({words} words, recommend 500+)")

    # Citations (+10)
    if "citations" in (fm or {}) or re.search(r"\[.*?\]\(https?://", body):
        score += 10
    else:
        feedback.append("No citations or references found")

    # Headings structure (+5)
    headings = re.findall(r"^#{2,3}\s+", body, re.MULTILINE)
    if len(headings) >= 3:
        score += 5
    else:
        feedback.append("Consider adding more section headings for structure")

    return {"score": min(score, 100), "feedback": feedback}


# ── Reviewer Matching ───────────────────────────────────────

def match_reviewers(db: dict, author: str, count: int = 2) -> list[str]:
    candidates = [c for c in ACTIVE_CREATORS if c != author]
    # Exclude last assigned reviewers to prevent consecutive assignment
    last = db.get("last_reviewers", [])
    preferred = [c for c in candidates if c not in last]
    if len(preferred) < count:
        preferred = candidates
    chosen = random.sample(preferred, min(count, len(preferred)))
    db["last_reviewers"] = chosen
    return chosen


# ── Commands ────────────────────────────────────────────────

def cmd_submit(args):
    filepath = Path(args.file).resolve()
    if not filepath.exists():
        print(f"❌ File not found: {filepath}")
        return 1

    text = filepath.read_text()
    fm = parse_frontmatter(text)
    author = args.author or (fm.get("author") if fm else None) or "Unknown"

    # Run GEO QA
    print(f"📝 Submitting: {filepath.name} by {author}")
    print("🔍 Running GEO QA scoring...")
    qa = run_geo_qa(str(filepath))
    score = qa["score"]
    feedback = qa.get("feedback", [])

    # Create submission
    db = load_submissions()
    sub_id = datetime.now().strftime("%Y%m%d") + "-" + uuid.uuid4().hex[:6]
    lang = detect_language(text)

    sub = {
        "id": sub_id,
        "author": author,
        "file": str(filepath),
        "filename": filepath.name,
        "language": lang,
        "geo_score": score,
        "geo_feedback": feedback,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
        "status": "pending",  # pending | in_review | approved | rejected | published
        "reviewers": [],
        "reviews": [],
    }

    if score < GEO_QA_PASS_THRESHOLD:
        sub["status"] = "rejected"
        print(f"\n❌ GEO QA Score: {score}/100 (threshold: {GEO_QA_PASS_THRESHOLD})")
        print("📋 Feedback:")
        for fb in feedback:
            print(f"   • {fb}")
        print(f"\n→ Please improve and resubmit.")
    else:
        # Assign reviewers
        reviewers = match_reviewers(db, author)
        sub["reviewers"] = reviewers
        sub["status"] = "in_review"
        sub["review_deadline"] = datetime.now(timezone.utc).isoformat()  # +48h tracked externally
        print(f"\n✅ GEO QA Score: {score}/100 — PASSED")
        if feedback:
            print("📋 Notes:")
            for fb in feedback:
                print(f"   • {fb}")
        print(f"👥 Reviewers assigned: {', '.join(reviewers)}")
        print(f"⏰ Review deadline: 48 hours")

    db["submissions"][sub_id] = sub
    save_submissions(db)
    print(f"\n📌 Submission ID: {sub_id}")
    return 0


def cmd_review(args):
    db = load_submissions()
    sub = db["submissions"].get(args.id)
    if not sub:
        print(f"❌ Submission not found: {args.id}")
        return 1

    if sub["status"] != "in_review":
        print(f"⚠️  Submission status is '{sub['status']}', not in_review")
        return 1

    reviewer = args.reviewer or "Anonymous"
    decision = args.decision  # approve or reject
    feedback = args.feedback or ""

    sub["reviews"].append({
        "reviewer": reviewer,
        "decision": decision,
        "feedback": feedback,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })

    approvals = sum(1 for r in sub["reviews"] if r["decision"] == "approve")
    rejections = sum(1 for r in sub["reviews"] if r["decision"] == "reject")

    if rejections > 0:
        sub["status"] = "rejected"
        print(f"❌ Submission {args.id} REJECTED by {reviewer}")
        if feedback:
            print(f"   Feedback: {feedback}")
    elif approvals >= 2:
        sub["status"] = "approved"
        print(f"✅ Submission {args.id} APPROVED (2/2 reviews)")
        print(f"   → Ready for: python content_pipeline.py publish {args.id}")
    else:
        print(f"👍 Review recorded ({approvals}/2 approvals)")

    save_submissions(db)
    return 0


def cmd_status(args):
    db = load_submissions()
    if args.id:
        sub = db["submissions"].get(args.id)
        if not sub:
            print(f"❌ Not found: {args.id}")
            return 1
        _print_submission(sub)
    else:
        if not db["submissions"]:
            print("📭 No submissions yet.")
            return 0
        for sub in sorted(db["submissions"].values(), key=lambda s: s["submitted_at"], reverse=True):
            _print_submission(sub)
            print()
    return 0


def _print_submission(sub):
    status_emoji = {
        "pending": "⏳", "in_review": "👀", "approved": "✅",
        "rejected": "❌", "published": "🚀"
    }
    emoji = status_emoji.get(sub["status"], "❓")
    print(f"{emoji} [{sub['id']}] {sub['filename']} by {sub['author']}")
    print(f"   Status: {sub['status']} | GEO: {sub['geo_score']}/100 | Lang: {sub['language']}")
    if sub["reviewers"]:
        print(f"   Reviewers: {', '.join(sub['reviewers'])}")
    for r in sub.get("reviews", []):
        print(f"   Review: {r['reviewer']} → {r['decision']}" + (f" ({r['feedback']})" if r['feedback'] else ""))


def cmd_publish(args):
    db = load_submissions()
    sub = db["submissions"].get(args.id)
    if not sub:
        print(f"❌ Not found: {args.id}")
        return 1

    if sub["status"] != "approved":
        print(f"⚠️  Status is '{sub['status']}'. Must be 'approved' to publish.")
        return 1

    src = Path(sub["file"])
    if not src.exists():
        print(f"❌ Source file missing: {src}")
        return 1

    text = src.read_text()
    fm = parse_frontmatter(text)
    if not fm:
        print("❌ No frontmatter found")
        return 1

    errors = validate_frontmatter(fm)
    if errors:
        print("❌ Frontmatter validation failed:")
        for e in errors:
            print(f"   • {e}")
        return 1

    # Determine destination
    lang = sub["language"]
    dest_dir = WEB_COLUMNS_DIR / lang
    dest_dir.mkdir(parents=True, exist_ok=True)
    dest = dest_dir / src.name
    shutil.copy2(src, dest)

    sub["status"] = "published"
    sub["published_at"] = datetime.now(timezone.utc).isoformat()
    sub["published_path"] = str(dest.relative_to(PROJECT_ROOT))
    save_submissions(db)

    print(f"🚀 Published: {dest.relative_to(PROJECT_ROOT)}")
    print(f"   → git add & commit to deploy")
    return 0


# ── Main ────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(description="HypeProof Content Pipeline")
    sub = parser.add_subparsers(dest="command")

    p_submit = sub.add_parser("submit")
    p_submit.add_argument("file")
    p_submit.add_argument("--author", "-a")

    p_review = sub.add_parser("review")
    p_review.add_argument("id")
    p_review.add_argument("decision", choices=["approve", "reject"])
    p_review.add_argument("--reviewer", "-r")
    p_review.add_argument("--feedback", "-f")

    p_status = sub.add_parser("status")
    p_status.add_argument("id", nargs="?")

    p_publish = sub.add_parser("publish")
    p_publish.add_argument("id")

    args = parser.parse_args()
    if not args.command:
        parser.print_help()
        return 1

    return {"submit": cmd_submit, "review": cmd_review, "status": cmd_status, "publish": cmd_publish}[args.command](args)


if __name__ == "__main__":
    sys.exit(main() or 0)
