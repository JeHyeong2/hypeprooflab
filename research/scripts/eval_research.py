#!/usr/bin/env python3
"""
Research Quality Eval v1.0
Anthropic eval 패턴 기반 리서치 품질 평가 시스템.

평가 항목:
  1. Structure (rule-based) — frontmatter, 본문 구조, 링크 수
  2. Style (rule-based) — 금지표현, 불릿 비율, 확신도 라벨 위치
  3. Title diversity (cosine similarity) — 최근 제목과 유사도
  4. Content quality (LLM-as-Judge) — 톤, 스토리텔링, 인사이트 깊이
  5. Links (automated) — 깨진 링크 검증

총점 100점. 70점 미만 = FAIL (게시 차단)

Usage:
  python3 eval_research.py <file.md>                 # 전체 eval
  python3 eval_research.py <file.md> --quick          # LLM 제외 (빠름)
  python3 eval_research.py <file.md> --json           # JSON 출력
"""

import re
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

RESEARCH_DIR = Path.home() / "CodeWorkspace/hypeproof/web/src/content/research/ko"

# ── 1. 금지표현 ──
BANNED_PHRASES = [
    "에 대해 알아보겠습니다", "살펴보도록 하겠습니다", "살펴보겠습니다",
    "매우 흥미로운", "흥미로운 발전", "라고 할 수 있겠습니다",
    "것으로 보입니다", "것으로 예상됩니다", "주목할 만합니다", "눈여겨볼 만합니다",
]

# ── 2. 확신도 라벨 ──
CONFIDENCE_LABELS = ["🟢 Observed", "🔵 Supported", "🟡 Speculative", "⚪ Unknown"]

# ── 3. 제목 클리셰 ──
TITLE_CLICHES = ["전쟁", "역설", "균열", "이중성", "딜레마", "사이에서", "새로운 국면"]

# ── 4. Frontmatter 필수 필드 ──
REQUIRED_FM = ["title", "date", "category", "slug", "readTime", "excerpt", "creatorImage", "lang"]

# ── 5. Known paywall domains (link check skip) ──
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


def get_body_before_sources(content: str) -> str:
    body = get_body(content)
    parts = re.split(r'###?\s*🔗\s*Sources', body)
    return parts[0] if parts else body


# ═══════════════════════════════════════════
# EVAL 1: Structure (25점)
# ═══════════════════════════════════════════
def eval_structure(content: str, fm: dict) -> dict:
    score = 25
    details = []

    # Frontmatter 필수 필드 (10점)
    missing = [f for f in REQUIRED_FM if f not in fm]
    if missing:
        penalty = min(10, len(missing) * 2)
        score -= penalty
        details.append(f"frontmatter 누락 {len(missing)}개: {', '.join(missing)} (-{penalty})")

    # H1이 본문에 있으면 안 됨 (-3)
    body = get_body(content)
    if re.search(r'^# [^#]', body, re.MULTILINE):
        score -= 3
        details.append("본문에 H1 사용 (-3)")

    # H2 섹션 최소 2개 (5점)
    h2_count = len(re.findall(r'^## ', body, re.MULTILINE))
    if h2_count < 2:
        score -= 5
        details.append(f"H2 섹션 {h2_count}개 — 최소 2개 필요 (-5)")

    # Sources 섹션 존재 (5점)
    if "Sources" not in content:
        score -= 5
        details.append("Sources 섹션 없음 (-5)")

    # 링크 최소 5개 (5점)
    links = re.findall(r'\]\(https?://', content)
    if len(links) < 5:
        penalty = 5
        score -= penalty
        details.append(f"링크 {len(links)}개 — 최소 5개 필요 (-{penalty})")

    return {"name": "Structure", "score": max(0, score), "max": 25, "details": details}


# ═══════════════════════════════════════════
# EVAL 2: Style (25점)
# ═══════════════════════════════════════════
def eval_style(content: str) -> dict:
    score = 25
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

    # 확신도 라벨 인라인 (각 -3)
    body_before_src = get_body_before_sources(content)
    inline_labels = [l for l in CONFIDENCE_LABELS if l in body_before_src]
    if inline_labels:
        penalty = min(9, len(inline_labels) * 3)
        score -= penalty
        details.append(f"확신도 라벨 인라인 {len(inline_labels)}개 (-{penalty})")

    # 확신도 분포 (Sources 섹션에서)
    sources_section = content.split("Sources")[-1] if "Sources" in content else ""
    label_counts = {l: sources_section.count(l) for l in CONFIDENCE_LABELS}
    total_labels = sum(label_counts.values())
    if total_labels > 0:
        observed_ratio = label_counts.get("🟢 Observed", 0) / total_labels
        if observed_ratio > 0.8:
            score -= 3
            details.append(f"🟢 Observed 비율 {observed_ratio:.0%} > 80% — 분류 재검토 필요 (-3)")

    # 글자 수 (최소 2000자)
    if len(body) < 2000:
        score -= 3
        details.append(f"본문 {len(body)}자 — 최소 2000자 권장 (-3)")

    return {"name": "Style", "score": max(0, score), "max": 25, "details": details}


# ═══════════════════════════════════════════
# EVAL 3: Title Diversity (15점)
# ═══════════════════════════════════════════
def eval_title_diversity(filepath: Path, fm: dict) -> dict:
    score = 15
    details = []
    title = fm.get("title", "")

    # 클리셰 체크
    cliches = [c for c in TITLE_CLICHES if c in title]
    if len(cliches) >= 2:
        score -= 5
        details.append(f"제목 클리셰 {len(cliches)}개: {cliches} (-5)")

    # 최근 3일 제목과 비교 (간단 문자 겹침)
    try:
        date_str = fm.get("date", "")
        current_date = datetime.strptime(date_str, "%Y-%m-%d")
    except (ValueError, TypeError):
        return {"name": "Title Diversity", "score": score, "max": 15, "details": ["날짜 파싱 실패"]}

    recent_titles = []
    for i in range(1, 4):
        prev_date = current_date - timedelta(days=i)
        prev_file = RESEARCH_DIR / f"{prev_date.strftime('%Y-%m-%d')}-daily-research.md"
        if prev_file.exists():
            prev_fm = parse_frontmatter(prev_file.read_text(encoding="utf-8"))
            if "title" in prev_fm:
                recent_titles.append(prev_fm["title"])

    # 겹치는 클리셰 패턴
    for prev_title in recent_titles:
        shared_cliches = [c for c in TITLE_CLICHES if c in title and c in prev_title]
        if shared_cliches:
            score -= 3
            details.append(f"최근 제목과 패턴 중복: {shared_cliches}")

    # 제목 길이 (너무 짧으면 감점)
    if len(title) < 15:
        score -= 3
        details.append(f"제목 {len(title)}자 — 너무 짧음 (-3)")

    if not details:
        details.append("✅ 제목 다양성 양호")

    return {"name": "Title Diversity", "score": max(0, score), "max": 15, "details": details}


# ═══════════════════════════════════════════
# EVAL 4: Content Quality — LLM-as-Judge (25점)
# ═══════════════════════════════════════════
LLM_JUDGE_PROMPT = """당신은 테크 리서치 칼럼 편집장입니다. 아래 칼럼을 5가지 기준으로 1-5점 Likert 척도로 평가하세요.

## 평가 기준
1. **훅(Hook)** — 첫 2문장이 독자를 끌어들이는가? (1=지루, 5=강렬)
2. **스토리텔링** — 불릿포인트 나열이 아닌 서사로 전개하는가? (1=나열, 5=몰입)
3. **비판적 시각** — 단순 보도가 아닌 분석/비판이 있는가? (1=PR복사, 5=날카로운통찰)
4. **연결성** — 개별 뉴스를 큰 트렌드로 엮는가? (1=파편적, 5=유기적)
5. **So What** — "그래서 뭐?" 에 대한 답이 있는가? (1=없음, 5=명확)

## 출력 형식 (JSON만 출력, 다른 텍스트 없이):
{"hook":N,"storytelling":N,"critical":N,"connection":N,"sowhat":N,"comment":"한줄평"}

## 칼럼:
{content}"""


def eval_llm_judge(content: str) -> dict:
    """Claude --print로 LLM-as-Judge 실행"""
    body = get_body(content)
    # 토큰 절약: 본문 앞 4000자만
    truncated = body[:4000]
    prompt = LLM_JUDGE_PROMPT.replace("{content}", truncated)

    try:
        # claude --print needs PTY; use temp file approach instead
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

        # JSON 추출
        json_match = re.search(r'\{[^}]+\}', output)
        if not json_match:
            return {"name": "LLM Judge", "score": 0, "max": 25,
                    "details": [f"LLM 응답 파싱 실패: {output[:100]}"]}

        scores = json.loads(json_match.group())

        # 5개 항목 × 5점 만점 = 25점 만점 → 그대로 사용
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
# EVAL 5: Link Validation (10점)
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
    score = 10
    details = []

    urls = list(set(re.findall(r'\]\((https?://[^)]+)\)', content)))
    if not urls:
        return {"name": "Links", "score": 0, "max": 10, "details": ["링크 없음"]}

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
    return {"name": "Links", "score": max(0, score), "max": 10, "details": details}


# ═══════════════════════════════════════════
# MAIN
# ═══════════════════════════════════════════
def run_eval(filepath: Path, quick: bool = False) -> dict:
    content = filepath.read_text(encoding="utf-8")
    fm = parse_frontmatter(content)

    evals = [
        eval_structure(content, fm),
        eval_style(content),
        eval_title_diversity(filepath, fm),
    ]

    if not quick:
        evals.append(eval_llm_judge(content))
        evals.append(eval_links(content))
    else:
        # quick mode: LLM/Links 스킵, 비례 환산
        pass

    total_score = sum(e["score"] for e in evals)
    total_max = sum(e["max"] for e in evals)

    # quick mode면 100점 기준으로 환산
    if quick:
        normalized = round(total_score / total_max * 100) if total_max > 0 else 0
    else:
        normalized = total_score

    result = {
        "file": filepath.name,
        "score": normalized,
        "max": 100,
        "grade": grade(normalized),
        "passed": normalized >= 70,
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
    print(f"📊 Research Eval: {result['file']}")
    print(f"   Score: {result['score']}/{result['max']} ({result['grade']}) — {status}")
    print(f"{'='*60}")

    for ev in result["evals"]:
        icon = "✅" if ev["score"] >= ev["max"] * 0.7 else "⚠️" if ev["score"] >= ev["max"] * 0.5 else "❌"
        print(f"\n{icon} {ev['name']}: {ev['score']}/{ev['max']}")
        for d in ev["details"]:
            print(f"   {d}")

    print(f"\n{'─'*60}")
    if result["passed"]:
        print(f"✅ 게시 가능 (Score ≥ 70)")
    else:
        print(f"❌ 게시 차단 — 품질 개선 필요 (Score < 70)")
    print()


def main():
    args = sys.argv[1:]
    if not args:
        print("Usage: eval_research.py <file.md> [--quick] [--json]")
        sys.exit(1)

    filepath = Path(args[0])
    quick = "--quick" in args
    as_json = "--json" in args

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
