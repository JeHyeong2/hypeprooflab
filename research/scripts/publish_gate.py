#!/usr/bin/env python3
"""
Publish Gate v1.0 — 통합 게시 게이트
모든 칼럼/리서치 콘텐츠가 배포 전에 반드시 거쳐야 하는 게이트.

누가 썼든, 어떤 경로든 이 게이트를 안 거치면 배포 안 됨.
Jay 글도 예외 없음, Mother 대필도 예외 없음.

3단계 게이트:
  Gate 1: Security — security_check.py (critical → BLOCKED)
  Gate 2: Quality  — eval_column.py / eval_research.py (70점 미만 → BLOCKED)
  Gate 3: Process  — 경로별 대화 이력 / 승인 확인

Usage:
  python3 publish_gate.py <file.md>                        # 기본 (auto-detect route)
  python3 publish_gate.py <file.md> --route creator-submit # 경로 지정
  python3 publish_gate.py <file.md> --route jay-direct
  python3 publish_gate.py <file.md> --route mother-draft
  python3 publish_gate.py <file.md> --route ai-draft
  python3 publish_gate.py <file.md> --route research-auto
  python3 publish_gate.py <file.md> --skip-conversation    # 대화 이력 확인 건너뛰기
  python3 publish_gate.py <file.md> --json                 # JSON 출력
  python3 publish_gate.py --all-columns                    # 전체 칼럼 배치
  python3 publish_gate.py --all-research                   # 전체 리서치 배치
  python3 publish_gate.py --log-conversation <file> --creator <name> --summary "대화 요약"
"""

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

# ── Paths ──
SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = Path.home() / "CodeWorkspace" / "hypeproof"
COLUMN_KO_DIR = PROJECT_ROOT / "web" / "src" / "content" / "columns" / "ko"
COLUMN_EN_DIR = PROJECT_ROOT / "web" / "src" / "content" / "columns" / "en"
RESEARCH_KO_DIR = PROJECT_ROOT / "web" / "src" / "content" / "research" / "ko"
RESEARCH_EN_DIR = PROJECT_ROOT / "web" / "src" / "content" / "research" / "en"
CONVERSATION_LOG = PROJECT_ROOT / "research" / "logs" / "conversation_log.json"

# Import sibling modules
sys.path.insert(0, str(SCRIPT_DIR))
from security_check import run_security_check

VALID_ROUTES = ["creator-submit", "jay-direct", "mother-draft", "ai-draft", "research-auto"]
JAY_APPROVAL_KEYWORDS = ["올려", "OK", "ok", "Ok", "ㅇㅇ", "고", "좋아", "올려줘", "게시해",
                          "ㄱ", "가자", "올리자", "진행", "승인"]


# ══════════════════════════════════════════════
# Helpers
# ══════════════════════════════════════════════

def parse_frontmatter(content: str) -> dict:
    """Simple YAML frontmatter parser (no external deps)."""
    if not content.startswith("---"):
        return {}
    parts = content.split("---", 2)
    if len(parts) < 3:
        return {}
    fm = {}
    for line in parts[1].strip().split("\n"):
        if ":" in line:
            key, _, val = line.partition(":")
            key = key.strip()
            val = val.strip().strip('"').strip("'")
            fm[key] = val
    return fm


def detect_content_type(filepath: Path) -> str:
    """Detect if file is column or research based on path."""
    resolved = filepath.resolve()
    path_str = str(resolved)
    if "columns" in path_str:
        return "column"
    if "research" in path_str:
        return "research"
    # Fallback: check filename patterns or default
    return "unknown"


def detect_route(filepath: Path, fm: dict) -> str:
    """Auto-detect publishing route based on path and frontmatter."""
    content_type = detect_content_type(filepath)

    if content_type == "research":
        return "research-auto"

    if content_type == "column":
        creator = fm.get("creator", "").strip().lower()
        if creator in ("jay", "재원", "jay lee", "이재원"):
            return "jay-direct"
        return "creator-submit"

    # Unknown content type — default to creator-submit (safest)
    return "creator-submit"


def load_conversation_log() -> dict:
    """Load conversation_log.json."""
    if not CONVERSATION_LOG.exists():
        return {"logs": []}
    try:
        return json.loads(CONVERSATION_LOG.read_text(encoding="utf-8"))
    except (json.JSONDecodeError, OSError):
        return {"logs": []}


def save_conversation_log(data: dict):
    """Save conversation_log.json."""
    CONVERSATION_LOG.parent.mkdir(parents=True, exist_ok=True)
    CONVERSATION_LOG.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )


def find_log_entry(log_data: dict, filename: str) -> dict | None:
    """Find a conversation log entry for a given file."""
    basename = Path(filename).name
    for entry in log_data.get("logs", []):
        if Path(entry.get("file", "")).name == basename:
            return entry
    return None


def grade(score: int) -> str:
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"


# ══════════════════════════════════════════════
# Gate 1: Security
# ══════════════════════════════════════════════

def gate_security(filepath: Path) -> dict:
    """Run security_check.py and return gate result."""
    result = run_security_check(filepath, skip_network=True)
    critical = result["summary"]["critical"]
    warning = result["summary"]["warning"]

    if critical > 0:
        return {
            "gate": "Security",
            "status": "BLOCKED",
            "detail": f"{critical} critical, {warning} warning",
            "findings": result["findings"],
        }

    return {
        "gate": "Security",
        "status": "PASS",
        "detail": f"0 critical, {warning} warning",
        "findings": result["findings"],
    }


# ══════════════════════════════════════════════
# Gate 2: Quality
# ══════════════════════════════════════════════

def gate_quality(filepath: Path) -> dict:
    """Run eval_column.py or eval_research.py (--quick mode) and return gate result."""
    content_type = detect_content_type(filepath)

    if content_type == "column":
        from eval_column import run_eval
    elif content_type == "research":
        from eval_research import run_eval
    else:
        # Fallback: try column eval
        from eval_column import run_eval

    result = run_eval(filepath, quick=True)
    score = result["score"]
    g = grade(score)

    # Security critical from eval overrides
    if result.get("security_blocked", False):
        return {
            "gate": "Quality",
            "status": "BLOCKED",
            "score": score,
            "grade": g,
            "detail": f"{score}/100 — {g} grade (security critical override)",
            "eval_result": result,
        }

    if score < 70:
        return {
            "gate": "Quality",
            "status": "BLOCKED",
            "score": score,
            "grade": g,
            "detail": f"{score}/100 — {g} grade",
            "eval_result": result,
        }

    if score < 80:
        return {
            "gate": "Quality",
            "status": "WARNING",
            "score": score,
            "grade": g,
            "detail": f"{score}/100 — {g} grade (개선 권고)",
            "eval_result": result,
        }

    return {
        "gate": "Quality",
        "status": "PASS",
        "score": score,
        "grade": g,
        "detail": f"{score}/100 — {g} grade",
        "eval_result": result,
    }


# ══════════════════════════════════════════════
# Gate 3: Process
# ══════════════════════════════════════════════

def gate_process(filepath: Path, route: str, fm: dict, skip_conversation: bool = False) -> dict:
    """Check process requirements based on route."""

    # Routes that don't need conversation check
    if route in ("jay-direct", "research-auto"):
        return {
            "gate": "Process",
            "status": "PASS",
            "detail": f"Route '{route}' — 대화 확인 불필요",
        }

    if skip_conversation:
        return {
            "gate": "Process",
            "status": "PASS",
            "detail": "--skip-conversation 플래그 사용",
        }

    # Load conversation log
    log_data = load_conversation_log()
    entry = find_log_entry(log_data, filepath.name)

    if route == "creator-submit":
        creator = fm.get("creator", "unknown")
        if not entry:
            return {
                "gate": "Process",
                "status": "BLOCKED",
                "detail": f"크리에이터({creator}) 대화 기록 없음",
                "hint": "크리에이터와 최소 1회 대화 후 재실행하세요",
            }
        conversations = entry.get("conversations", [])
        if len(conversations) < 1:
            return {
                "gate": "Process",
                "status": "BLOCKED",
                "detail": f"크리에이터({creator}) 대화 기록 부족 (0회)",
                "hint": "크리에이터와 최소 1회 대화 후 재실행하세요",
            }
        return {
            "gate": "Process",
            "status": "PASS",
            "detail": f"크리에이터({creator}) 대화 {len(conversations)}회 확인",
        }

    if route == "mother-draft":
        if not entry:
            return {
                "gate": "Process",
                "status": "BLOCKED",
                "detail": "Jay 승인 기록 없음",
                "hint": "Jay의 명시적 승인(\"올려\", \"OK\" 등) 기록 후 재실행하세요",
            }
        # Check for Jay's explicit approval in conversations
        has_approval = False
        for conv in entry.get("conversations", []):
            if conv.get("from", "").lower() in ("jay", "재원"):
                summary = conv.get("summary", "")
                if any(kw in summary for kw in JAY_APPROVAL_KEYWORDS):
                    has_approval = True
                    break
        if entry.get("approved", False):
            has_approval = True

        if not has_approval:
            return {
                "gate": "Process",
                "status": "BLOCKED",
                "detail": "Jay 명시적 승인 없음",
                "hint": "Jay의 승인(\"올려\", \"OK\", \"ㅇㅇ\", \"고\" 등) 기록 후 재실행하세요",
            }
        return {
            "gate": "Process",
            "status": "PASS",
            "detail": "Jay 승인 확인됨",
        }

    if route == "ai-draft":
        if not entry:
            return {
                "gate": "Process",
                "status": "BLOCKED",
                "detail": "크리에이터 승인 기록 없음",
                "hint": "크리에이터의 명시적 승인 기록 후 재실행하세요",
            }
        if not entry.get("approved", False):
            return {
                "gate": "Process",
                "status": "BLOCKED",
                "detail": "크리에이터 명시적 승인 없음",
                "hint": "크리에이터의 승인 기록 후 재실행하세요",
            }
        return {
            "gate": "Process",
            "status": "PASS",
            "detail": "크리에이터 승인 확인됨",
        }

    # Fallback for unknown route
    return {
        "gate": "Process",
        "status": "BLOCKED",
        "detail": f"알 수 없는 경로: {route}",
    }


# ══════════════════════════════════════════════
# Run gate pipeline
# ══════════════════════════════════════════════

def run_publish_gate(filepath: Path, route: str | None = None,
                     skip_conversation: bool = False) -> dict:
    """Run all 3 gates and return consolidated result."""
    content = filepath.read_text(encoding="utf-8")
    fm = parse_frontmatter(content)

    # Detect route if not specified
    if not route:
        route = detect_route(filepath, fm)

    creator = fm.get("creator", "unknown")
    now = datetime.now(timezone.utc).isoformat()

    # Gate 1: Security
    g1 = gate_security(filepath)

    # Gate 2: Quality (skip if security blocked? No — run all gates for full report)
    g2 = gate_quality(filepath)

    # Gate 3: Process
    g3 = gate_process(filepath, route, fm, skip_conversation)

    gates = [g1, g2, g3]
    blocked = [g for g in gates if g["status"] == "BLOCKED"]
    warnings = [g for g in gates if g["status"] == "WARNING"]

    if blocked:
        final_status = "BLOCKED"
        failed_gates = ", ".join(f"Gate {i+1}" for i, g in enumerate(gates)
                                 if g["status"] == "BLOCKED")
        final_detail = f"{failed_gates} 실패"
    elif warnings:
        final_status = "WARNING"
        final_detail = "통과 (개선 권고 있음)"
    else:
        final_status = "PASS"
        final_detail = "모든 게이트 통과"

    result = {
        "file": filepath.name,
        "route": route,
        "creator": creator,
        "timestamp": now,
        "gates": {
            "security": {
                "status": g1["status"],
                "detail": g1["detail"],
                "timestamp": now,
            },
            "quality": {
                "status": g2["status"],
                "score": g2.get("score"),
                "grade": g2.get("grade"),
                "detail": g2["detail"],
                "timestamp": now,
            },
            "process": {
                "status": g3["status"],
                "detail": g3["detail"],
                "timestamp": now,
            },
        },
        "final": {
            "status": final_status,
            "detail": final_detail,
        },
        "gate_results": gates,
    }

    # Update conversation_log.json with gate results
    _update_log_gates(filepath.name, creator, route, result["gates"])

    return result


def _update_log_gates(filename: str, creator: str, route: str, gates: dict):
    """Update or create log entry with gate results."""
    log_data = load_conversation_log()
    entry = find_log_entry(log_data, filename)

    if entry:
        entry["gates"] = gates
    else:
        log_data["logs"].append({
            "file": filename,
            "creator": creator,
            "creatorId": "",
            "route": route,
            "conversations": [],
            "approved": False,
            "approvedAt": None,
            "gates": gates,
        })

    save_conversation_log(log_data)


# ══════════════════════════════════════════════
# Log conversation helper
# ══════════════════════════════════════════════

def log_conversation(filename: str, creator: str, summary: str,
                     from_who: str | None = None, creator_id: str = ""):
    """Add a conversation entry to conversation_log.json."""
    log_data = load_conversation_log()
    entry = find_log_entry(log_data, filename)
    now = datetime.now(timezone.utc).isoformat()

    conv_entry = {
        "timestamp": now,
        "from": from_who or creator,
        "summary": summary,
    }

    if entry:
        entry["conversations"].append(conv_entry)
        if not entry.get("creator"):
            entry["creator"] = creator
        if creator_id and not entry.get("creatorId"):
            entry["creatorId"] = creator_id
    else:
        log_data["logs"].append({
            "file": Path(filename).name,
            "creator": creator,
            "creatorId": creator_id,
            "route": "",
            "conversations": [conv_entry],
            "approved": False,
            "approvedAt": None,
            "gates": {},
        })

    save_conversation_log(log_data)
    return conv_entry


# ══════════════════════════════════════════════
# Display
# ══════════════════════════════════════════════

STATUS_ICONS = {
    "PASS": "✅",
    "WARNING": "⚠️",
    "BLOCKED": "❌",
}

FINAL_ICONS = {
    "PASS": "🟢",
    "WARNING": "🟡",
    "BLOCKED": "❌",
}


def format_result(result: dict) -> str:
    """Format gate result for terminal output."""
    lines = []
    sep = "=" * 60

    lines.append(sep)
    lines.append(f"🚦 Publish Gate: {result['file']}")
    creator_str = f" ({result['creator']})" if result["creator"] != "unknown" else ""
    lines.append(f"   Route: {result['route']}{creator_str}")
    lines.append(sep)
    lines.append("")

    gates = result["gates"]

    # Gate 1 — Security
    g1 = gates["security"]
    icon = STATUS_ICONS.get(g1["status"], "?")
    lines.append(f"Gate 1 — Security")
    lines.append(f"  {icon} {g1['status']} ({g1['detail']})")
    lines.append("")

    # Gate 2 — Quality
    g2 = gates["quality"]
    icon = STATUS_ICONS.get(g2["status"], "?")
    score_str = f"{g2['score']}/100 — {g2['grade']} grade" if g2.get("score") is not None else ""
    lines.append(f"Gate 2 — Quality")
    lines.append(f"  {icon} {g2['status']} ({score_str})")
    if g2["status"] == "WARNING":
        lines.append(f"  → 개선 권고: 80점 이상 목표")
    lines.append("")

    # Gate 3 — Process
    g3 = gates["process"]
    icon = STATUS_ICONS.get(g3["status"], "?")
    lines.append(f"Gate 3 — Process")
    lines.append(f"  {icon} {g3['status']} — {g3['detail']}")
    # Show hint if blocked
    for gr in result.get("gate_results", []):
        if gr.get("gate") == "Process" and gr.get("hint"):
            lines.append(f"  → {gr['hint']}")
    lines.append("")

    # Final result
    lines.append(sep)
    final = result["final"]
    icon = FINAL_ICONS.get(final["status"], "?")
    lines.append(f"🚦 최종 결과: {icon} {final['status']} ({final['detail']})")
    lines.append(sep)

    return "\n".join(lines)


# ══════════════════════════════════════════════
# Batch operations
# ══════════════════════════════════════════════

def get_all_columns() -> list[Path]:
    """Get all column .md files."""
    files = []
    for d in [COLUMN_KO_DIR, COLUMN_EN_DIR]:
        if d.exists():
            files.extend(sorted(d.glob("*.md")))
    return files


def get_all_research() -> list[Path]:
    """Get all research .md files."""
    files = []
    for d in [RESEARCH_KO_DIR, RESEARCH_EN_DIR]:
        if d.exists():
            files.extend(sorted(d.glob("*.md")))
    return files


def run_batch(files: list[Path], as_json: bool = False, skip_conversation: bool = False):
    """Run publish gate on multiple files."""
    results = []
    for f in files:
        try:
            r = run_publish_gate(f, skip_conversation=skip_conversation)
            results.append(r)
            if not as_json:
                print(format_result(r))
                print()
        except Exception as e:
            err = {
                "file": f.name,
                "error": str(e),
                "final": {"status": "ERROR", "detail": str(e)},
            }
            results.append(err)
            if not as_json:
                print(f"❌ ERROR: {f.name} — {e}")
                print()

    if as_json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        # Summary
        total = len(results)
        passed = sum(1 for r in results if r.get("final", {}).get("status") == "PASS")
        warned = sum(1 for r in results if r.get("final", {}).get("status") == "WARNING")
        blocked = sum(1 for r in results if r.get("final", {}).get("status") == "BLOCKED")
        errors = sum(1 for r in results if r.get("final", {}).get("status") == "ERROR")

        print("=" * 60)
        print(f"📊 배치 결과: {total}개 파일")
        print(f"  ✅ PASS: {passed}  ⚠️ WARNING: {warned}  ❌ BLOCKED: {blocked}  💥 ERROR: {errors}")
        print("=" * 60)

    return results


# ══════════════════════════════════════════════
# CLI
# ══════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="🚦 Publish Gate — 통합 게시 게이트",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("file", nargs="?", help="검사할 마크다운 파일")
    parser.add_argument("--route", choices=VALID_ROUTES,
                        help="게시 경로 (기본: auto-detect)")
    parser.add_argument("--skip-conversation", action="store_true",
                        help="대화 이력 확인 건너뛰기")
    parser.add_argument("--json", action="store_true", dest="as_json",
                        help="JSON 출력")
    parser.add_argument("--all-columns", action="store_true",
                        help="전체 칼럼 배치 검사")
    parser.add_argument("--all-research", action="store_true",
                        help="전체 리서치 배치 검사")

    # Log conversation subcommand
    parser.add_argument("--log-conversation", metavar="FILE",
                        help="대화 기록 추가 (파일명)")
    parser.add_argument("--creator", help="크리에이터 이름 (--log-conversation용)")
    parser.add_argument("--creator-id", default="",
                        help="크리에이터 Discord ID (--log-conversation용)")
    parser.add_argument("--summary", help="대화 요약 (--log-conversation용)")
    parser.add_argument("--from-who", help="발화자 (기본: creator 이름)")

    args = parser.parse_args()

    # Handle --log-conversation
    if args.log_conversation:
        if not args.creator or not args.summary:
            print("❌ --log-conversation 사용 시 --creator 와 --summary 필수")
            sys.exit(1)
        entry = log_conversation(
            args.log_conversation, args.creator, args.summary,
            from_who=args.from_who, creator_id=args.creator_id,
        )
        if args.as_json:
            print(json.dumps(entry, ensure_ascii=False, indent=2))
        else:
            print(f"✅ 대화 기록 추가: {args.log_conversation} ({args.creator})")
            print(f"   요약: {args.summary}")
        sys.exit(0)

    # Handle batch operations
    if args.all_columns:
        files = get_all_columns()
        if not files:
            print("⚠️ 칼럼 파일 없음")
            sys.exit(0)
        run_batch(files, as_json=args.as_json, skip_conversation=args.skip_conversation)
        sys.exit(0)

    if args.all_research:
        files = get_all_research()
        if not files:
            print("⚠️ 리서치 파일 없음")
            sys.exit(0)
        run_batch(files, as_json=args.as_json, skip_conversation=args.skip_conversation)
        sys.exit(0)

    # Single file mode
    if not args.file:
        parser.print_help()
        sys.exit(1)

    filepath = Path(args.file)
    if not filepath.exists():
        print(f"❌ 파일 없음: {filepath}")
        sys.exit(1)

    result = run_publish_gate(filepath, route=args.route,
                              skip_conversation=args.skip_conversation)

    if args.as_json:
        # Remove large eval_result from JSON output for cleanliness
        for gr in result.get("gate_results", []):
            gr.pop("eval_result", None)
            gr.pop("findings", None)
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print(format_result(result))

    # Exit code: 0 = PASS/WARNING, 1 = BLOCKED
    if result["final"]["status"] == "BLOCKED":
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
