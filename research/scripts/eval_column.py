#!/usr/bin/env python3
"""
Column Quality Eval v1.0
eval_research.py 기반 칼럼 전용 품질 평가 시스템.

평가 항목:
  1. Structure (rule-based) — frontmatter 필수 필드, H2 구조, 본문 길이 (20점)
  2. Style (rule-based) — 금지표현, 불릿 비율 (20점)
  3. Title Quality (rule-based) — 제목 길이, 클리셰 (10점)
  4. Content Quality (LLM-as-Judge) — Hook, 스토리텔링, 비판, 연결성, So What (25점)
  5. Links (automated) — 깨진 링크 검증, 선택적 (15점)
  6. Security (automated) — 보안 게이트 (10점)

총점 100점. 70점 미만 = FAIL (게시 차단)
Security critical 발견 시 점수 무관하게 FAIL 강제.

칼럼 vs 리서치 차이점:
  - Sources 섹션 불필요 (칼럼은 opinion piece)
  - 확신도 라벨 불필요
  - 제목 다양성(cosine) 체크 불필요 (칼럼은 저자별 독립)
  - creator/creatorImage 필수 체크 강화
  - 링크 배점 상향 (15점), 단 선택적 (없어도 가능)

Usage:
  python3 eval_column.py <file.md>           # 전체 eval
  python3 eval_column.py <file.md> --quick   # LLM 제외 (빠름)
  python3 eval_column.py <file.md> --json    # JSON 출력
  python3 eval_column.py --all               # 전체 칼럼 일괄 eval
  python3 eval_column.py --all --quick       # 전체 칼럼 quick eval
"""

import re
import sys
import json
import subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed

# Import security_check from same directory
sys.path.insert(0, str(Path(__file__).parent))
from security_check import run_security_check

COLUMN_DIR = Path.home() / "CodeWorkspace/hypeproof/web/src/content/columns/ko"

# ── 금지표현 ──
BANNED_PHRASES = [
    "에 대해 알아보겠습니다", "살펴보도록 하겠습니다", "살펴보겠습니다",
    "매우 흥미로운", "흥미로운 발전", "라고 할 수 있겠습니다",
    "것으로 보입니다", "것으로 예상됩니다", "주목할 만합니다", "눈여겨볼 만합니다",
]

# ── 제목 클리셰 ──
TITLE_CLICHES = ["전쟁", "역설", "균열", "이중성", "딜레마", "사이에서", "새로운 국면"]

# ── Frontmatter 필수 필드 (칼럼 전용) ──
REQUIRED_FM = [
    "title", "creator", "date", "category", "slug",
    "readTime", "excerpt", "creatorImage", "lang",
]

# ── Known paywall domains (link check skip) ──
KNOWN_BLOCKERS = {"bloomberg.com", "wsj.com", "nytimes.com", "ft.com"}


def parse_frontmatter(content: str) -> dict:
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return {}
    fm = {}
    for line in match.group(1).split("\n"):
        if ":" in line:
            k, v = line.split(":", 1)
            fm[k.strip()] = v.strip().strip('"').strip("'")
    return fm


def get_body(content: str) -> str:
    """frontmatter 제거한 본문"""
    parts = re.split(r'^---\s*\n.*?\n---', content, maxsplit=1, flags=re.DOTALL)
    return parts[1] if len(parts) > 1 else content


# ═══════════════════════════════════════════
# EVAL 1: Structure (20점)
# ═══════════════════════════════════════════
def eval_structure(content: str, fm: dict) -> dict:
    score = 20
    details = []

    # Frontmatter 필수 필드 (10점) — creator/creatorImage 강화
    missing = [f for f in REQUIRED_FM if f not in fm]
    if missing:
        penalty = min(10, len(missing) * 2)
        # creator/creatorImage 누락은 추가 감점
        critical_missing = [f for f in ["creator", "creatorImage"] if f in missing]
        if critical_missing:
            penalty = min(10, penalty + len(critical_missing) * 2)
        score -= penalty
        details.append(f"frontmatter 누락 {len(missing)}개: {', '.join(missing)} (-{penalty})")

    body = get_body(content)

    # H1이 본문에 있으면 안 됨 (-2)
    if re.search(r'^# [^#]', body, re.MULTILINE):
        score -= 2
        details.append("본문에 H1 사용 (-2)")

    # H2 섹션 최소 2개 (4점)
    h2_count = len(re.findall(r'^## ', body, re.MULTILINE))
    if h2_count < 2:
        score -= 4
        details.append(f"H2 섹션 {h2_count}개 — 최소 2개 필요 (-4)")

    # 본문 2000자 이상 (4점)
    body_len = len(body.strip())
    if body_len < 2000:
        score -= 4
        details.append(f"본문 {body_len}자 — 최소 2000자 필요 (-4)")

    if not details:
        details.append("✅ 구조 양호")

    return {"name": "Structure", "score": max(0, score), "max": 20, "details": details}


# ═══════════════════════════════════════════
# EVAL 2: Style (20점)
# ═══════════════════════════════════════════
def eval_style(content: str) -> dict:
    score = 20
    details = []
    body = get_body(content)
    lines = [l for l in body.split("\n") if l.strip()]

    # 금지표현 (각 -3, 최대 -12)
    banned_found = [p for p in BANNED_PHRASES if p in content]
    if banned_found:
        penalty = min(12, len(banned_found) * 3)
        score -= penalty
        details.append(f"금지표현 {len(banned_found)}개: {banned_found[:3]} (-{penalty})")

    # 불릿포인트 비율 >15% (-5)
    bullet_lines = sum(1 for l in lines if re.match(r'^\s*[-*•]\s', l))
    ratio = bullet_lines / len(lines) if lines else 0
    if ratio > 0.15:
        score -= 5
        details.append(f"불릿 비율 {ratio:.0%} > 15% (-5)")

    # 글자 수 부족 추가 감점 (이미 Structure에서도 체크하지만 심각하면 스타일에서도)
    if len(body) < 1000:
        score -= 3
        details.append(f"본문 {len(body)}자 — 심각하게 짧음 (-3)")

    if not details:
        details.append("✅ 스타일 양호")

    return {"name": "Style", "score": max(0, score), "max": 20, "details": details}


# ═══════════════════════════════════════════
# EVAL 3: Title Quality (10점)
# ═══════════════════════════════════════════
def eval_title_quality(fm: dict) -> dict:
    score = 10
    details = []
    title = fm.get("title", "")

    if not title:
        return {"name": "Title Quality", "score": 0, "max": 10, "details": ["제목 없음"]}

    # 제목 길이 15자 이상 (5점)
    if len(title) < 15:
        score -= 5
        details.append(f"제목 {len(title)}자 — 15자 이상 권장 (-5)")

    # 클리셰 체크 (각 -2, 최대 -5)
    cliches = [c for c in TITLE_CLICHES if c in title]
    if cliches:
        penalty = min(5, len(cliches) * 2)
        score -= penalty
        details.append(f"제목 클리셰 {len(cliches)}개: {cliches} (-{penalty})")

    if not details:
        details.append("✅ 제목 양호")

    return {"name": "Title Quality", "score": max(0, score), "max": 10, "details": details}


# ═══════════════════════════════════════════
# EVAL 4: Content Quality — LLM-as-Judge (25점)
# ═══════════════════════════════════════════
LLM_JUDGE_PROMPT = """당신은 테크 칼럼 편집장입니다. 아래 칼럼을 5가지 기준으로 1-5점 Likert 척도로 평가하세요.

## 평가 기준
1. **훅(Hook)** — 첫 2문장이 독자를 끌어들이는가? (1=지루, 5=강렬)
2. **스토리텔링** — 불릿포인트 나열이 아닌 서사로 전개하는가? (1=나열, 5=몰입)
3. **비판적 시각** — 단순 보도가 아닌 분석/비판이 있는가? (1=PR복사, 5=날카로운통찰)
4. **연결성** — 개별 주제를 큰 맥락으로 엮는가? (1=파편적, 5=유기적)
5. **So What** — "그래서 뭐?" 에 대한 답이 있는가? (1=없음, 5=명확)

## 출력 형식 (JSON만 출력, 다른 텍스트 없이):
{{"hook":N,"storytelling":N,"critical":N,"connection":N,"sowhat":N,"comment":"한줄평"}}

## 칼럼:
{content}"""


def eval_llm_judge(content: str) -> dict:
    """Claude --print로 LLM-as-Judge 실행"""
    body = get_body(content)
    truncated = body[:4000]
    prompt = LLM_JUDGE_PROMPT.replace("{content}", truncated)

    try:
        import tempfile
        with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
            f.write(prompt)
            prompt_file = f.name

        result = subprocess.run(
            f'cat "{prompt_file}" | /Users/jaylee/.local/bin/claude --print --model sonnet --max-turns 1 2>/dev/null',
            shell=True, capture_output=True, text=True, timeout=60
        )
        Path(prompt_file).unlink(missing_ok=True)
        output = result.stdout.strip()

        json_match = re.search(r'\{[^}]+\}', output)
        if not json_match:
            return {"name": "LLM Judge", "score": 0, "max": 25,
                    "details": [f"LLM 응답 파싱 실패: {output[:100]}"]}

        scores = json.loads(json_match.group())
        total = sum(scores.get(k, 0) for k in ["hook", "storytelling", "critical", "connection", "sowhat"])
        comment = scores.get("comment", "")

        details = [
            f"Hook: {scores.get('hook', '?')}/5",
            f"Storytelling: {scores.get('storytelling', '?')}/5",
            f"Critical: {scores.get('critical', '?')}/5",
            f"Connection: {scores.get('connection', '?')}/5",
            f"So What: {scores.get('sowhat', '?')}/5",
        ]
        if comment:
            details.append(f"💬 {comment}")

        return {"name": "LLM Judge", "score": total, "max": 25, "details": details}

    except subprocess.TimeoutExpired:
        return {"name": "LLM Judge", "score": 0, "max": 25, "details": ["LLM 타임아웃 (60s)"]}
    except Exception as e:
        return {"name": "LLM Judge", "score": 0, "max": 25, "details": [f"LLM 에러: {str(e)[:80]}"]}


# ═══════════════════════════════════════════
# EVAL 5: Links (15점)
# ═══════════════════════════════════════════
def check_url(url: str) -> dict:
    for domain in KNOWN_BLOCKERS:
        if domain in url:
            return {"url": url, "status": "skip"}
    try:
        result = subprocess.run(
            ["curl", "-sL", "-o", "/dev/null", "-w", "%{http_code}", "--max-time", "8",
             "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36", url],
            capture_output=True, text=True, timeout=12
        )
        code = int(result.stdout.strip()) if result.stdout.strip().isdigit() else 0
        if code in (200, 301, 302):
            return {"url": url, "status": "ok"}
        elif code in (401, 403):
            return {"url": url, "status": "paywall"}
        else:
            return {"url": url, "status": "broken", "code": code}
    except Exception:
        return {"url": url, "status": "broken", "code": 0}


def eval_links(content: str) -> dict:
    """칼럼 링크 검증 — 링크 없어도 감점 최소화 (칼럼은 opinion piece)"""
    score = 15
    details = []

    urls = list(set(re.findall(r'\]\((https?://[^)]+)\)', content)))
    if not urls:
        # 칼럼은 링크 없어도 OK, 하지만 약간 감점
        return {"name": "Links", "score": 10, "max": 15,
                "details": ["링크 없음 — 칼럼이므로 경미 감점 (-5)"]}

    broken = []
    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = {executor.submit(check_url, url): url for url in urls[:20]}
        for future in as_completed(futures):
            result = future.result()
            if result["status"] == "broken":
                broken.append(result)

    if broken:
        penalty = min(10, len(broken) * 3)
        score -= penalty
        for b in broken[:3]:
            details.append(f"❌ {b.get('code', '?')} | {b['url'][:70]}")

    details.insert(0, f"검증: {len(urls)}개 중 {len(broken)}개 실패")
    return {"name": "Links", "score": max(0, score), "max": 15, "details": details}


# ═══════════════════════════════════════════
# EVAL 6: Security (10점)
# ═══════════════════════════════════════════
def eval_security(filepath: Path) -> dict:
    """Security gate — critical 발견 시 0점 + 전체 FAIL 강제"""
    score = 10
    details = []

    try:
        result = run_security_check(filepath, skip_network=True)
        summary = result["summary"]

        if summary["critical"] > 0:
            score = 0
            details.append(f"🚨 Critical 발견 {summary['critical']}건 — 게시 차단!")
            for f in result["findings"]:
                if f["severity"] == "critical":
                    details.append(f"  L{f['line']}: {f['detail']}")

        if summary["warning"] > 0:
            penalty = min(score, summary["warning"] * 3)
            score -= penalty
            details.append(f"⚠️ Warning {summary['warning']}건 (-{penalty})")

        if summary["info"] > 0:
            details.append(f"ℹ️ Info {summary['info']}건 (감점 없음)")

        if not result["findings"]:
            details.append("✅ 보안 이슈 없음")

        return {
            "name": "Security",
            "score": max(0, score),
            "max": 10,
            "details": details,
            "_has_critical": summary["critical"] > 0,
        }
    except Exception as e:
        return {
            "name": "Security",
            "score": 0,
            "max": 10,
            "details": [f"보안 검사 에러: {str(e)[:80]}"],
            "_has_critical": False,
        }


# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════
def run_eval(filepath: Path, quick: bool = False) -> dict:
    content = filepath.read_text(encoding="utf-8")
    fm = parse_frontmatter(content)

    evals = [
        eval_structure(content, fm),
        eval_style(content),
        eval_title_quality(fm),
    ]

    if not quick:
        evals.append(eval_llm_judge(content))
        evals.append(eval_links(content))
    else:
        # quick mode: LLM/Links 스킵
        pass

    # Security eval always runs
    security_result = eval_security(filepath)
    evals.append(security_result)

    total_score = sum(e["score"] for e in evals)
    total_max = sum(e["max"] for e in evals)

    # quick mode면 100점 기준으로 환산
    if quick:
        normalized = round(total_score / total_max * 100) if total_max > 0 else 0
    else:
        normalized = total_score

    # Security critical → 전체 FAIL 강제
    security_critical = security_result.get("_has_critical", False)
    passed = normalized >= 70 and not security_critical

    result = {
        "file": filepath.name,
        "score": normalized,
        "max": 100,
        "grade": grade(normalized),
        "passed": passed,
        "security_blocked": security_critical,
        "evals": evals,
        "frontmatter": fm,
    }
    return result


def grade(score: int) -> str:
    if score >= 90: return "A"
    if score >= 80: return "B"
    if score >= 70: return "C"
    if score >= 60: return "D"
    return "F"


def print_report(result: dict) -> None:
    status = "✅ PASS" if result["passed"] else "❌ FAIL"
    print(f"\n{'='*60}")
    print(f"📝 Column Eval: {result['file']}")
    print(f"   Score: {result['score']}/{result['max']} ({result['grade']}) — {status}")
    print(f"{'='*60}")

    for ev in result["evals"]:
        icon = "✅" if ev["score"] >= ev["max"] * 0.7 else "⚠️" if ev["score"] >= ev["max"] * 0.5 else "❌"
        print(f"\n{icon} {ev['name']}: {ev['score']}/{ev['max']}")
        for d in ev["details"]:
            print(f"   {d}")

    print(f"\n{'─'*60}")
    if result.get("security_blocked"):
        print("🚨 게시 차단 — 보안 위반 (Security Critical)")
    elif result["passed"]:
        print("✅ 게시 가능 (Score ≥ 70)")
    else:
        print("❌ 게시 차단 — 품질 개선 필요 (Score < 70)")
    print()


def run_all(quick: bool = False, as_json: bool = False) -> None:
    """전체 칼럼 일괄 평가"""
    files = sorted(COLUMN_DIR.glob("*.md"))
    if not files:
        print(f"❌ No columns found in {COLUMN_DIR}")
        sys.exit(1)

    results = []
    passed = 0
    failed = 0

    for f in files:
        result = run_eval(f, quick=quick)
        results.append(result)
        if result["passed"]:
            passed += 1
        else:
            failed += 1

        if not as_json:
            status = "✅" if result["passed"] else "❌"
            print(f"  {status} {result['file']}: {result['score']}/{result['max']} ({result['grade']})")

    if as_json:
        print(json.dumps(results, ensure_ascii=False, indent=2))
    else:
        print(f"\n{'='*60}")
        print(f"📊 Total: {len(files)} columns | ✅ {passed} passed | ❌ {failed} failed")
        print(f"{'='*60}")

    sys.exit(0 if failed == 0 else 1)


def main():
    args = sys.argv[1:]
    quick = "--quick" in args
    as_json = "--json" in args
    run_all_flag = "--all" in args

    # Clean args
    clean_args = [a for a in args if a not in ("--quick", "--json", "--all")]

    if run_all_flag:
        run_all(quick=quick, as_json=as_json)
        return

    if not clean_args:
        print("Usage:")
        print("  python3 eval_column.py <file.md>           # 전체 eval")
        print("  python3 eval_column.py <file.md> --quick   # LLM 제외")
        print("  python3 eval_column.py <file.md> --json    # JSON 출력")
        print("  python3 eval_column.py --all               # 전체 칼럼")
        print("  python3 eval_column.py --all --quick       # 전체 칼럼 quick")
        sys.exit(1)

    filepath = Path(clean_args[0])
    if not filepath.exists():
        print(f"❌ File not found: {filepath}")
        sys.exit(1)

    result = run_eval(filepath, quick=quick)

    if as_json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_report(result)

    sys.exit(0 if result["passed"] else 1)


if __name__ == "__main__":
    main()
