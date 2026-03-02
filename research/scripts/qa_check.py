#!/usr/bin/env python3
"""
Daily Research QA Checker v2.0
- 불릿포인트 비율 체크
- 금지 표현 검출
- 링크 포함 여부 + 접속 검증 (paywall 구분)
- 확신도 라벨 인라인 체크
- Frontmatter v2 검증
- 제목 패턴 다양성 체크
"""

import re
import sys
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime, timedelta

# 금지 표현
BANNED_PHRASES = [
    "에 대해 알아보겠습니다",
    "살펴보도록 하겠습니다",
    "살펴보겠습니다",
    "매우 흥미로운",
    "흥미로운 발전",
    "라고 할 수 있겠습니다",
    "것으로 보입니다",
    "것으로 예상됩니다",
    "주목할 만합니다",
    "눈여겨볼 만합니다",
]

# 권장 패턴
GOOD_PATTERNS = [
    r"근데 함정이 있다",
    r"결과가 소름",
    r"1위긴 1위인데",
    r"또 한 방",
    r"진짜 얘기",
    r"그래서\?",
    r"So What",
]

# 제목 클리셰 패턴
TITLE_CLICHES = [
    r"전쟁", r"역설", r"균열", r"이중성", r"딜레마",
    r"사이에서", r"새로운 국면",
]

# 확신도 라벨 (본문 인라인이면 안 됨)
CONFIDENCE_LABELS = [
    "🟢 Observed", "🔵 Supported", "🟡 Speculative", "⚪ Unknown",
]

# Frontmatter v2 필수 필드
REQUIRED_FRONTMATTER = ["title", "date", "author", "category", "slug", "readTime", "excerpt", "lang"]


def extract_frontmatter(content: str) -> dict:
    """YAML frontmatter 추출 (간단 파서)"""
    fm = {}
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if not match:
        return fm
    for line in match.group(1).split("\n"):
        if ":" in line:
            key, val = line.split(":", 1)
            fm[key.strip()] = val.strip().strip('"').strip("'")
    return fm


def check_links(content: str) -> dict:
    """링크 검증 — 200/403(paywall)/dead 구분"""
    # <URL> 형식과 [text](URL) 형식 모두 추출
    links_angle = re.findall(r"<(https?://[^>]+)>", content)
    links_md = re.findall(r"\]\((https?://[^\)]+)\)", content)
    all_links = list(set(links_angle + links_md))

    result = {"total": len(all_links), "ok": [], "paywall": [], "dead": []}

    for url in all_links[:15]:  # 최대 15개
        try:
            req = urllib.request.Request(url, headers={
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            })
            resp = urllib.request.urlopen(req, timeout=8)
            result["ok"].append(url)
        except urllib.error.HTTPError as e:
            if e.code in (401, 403):
                result["paywall"].append(url)
            else:
                result["dead"].append(url)
        except Exception:
            result["dead"].append(url)

    return result


def check_confidence_inline(content: str) -> list:
    """확신도 라벨이 Sources 섹션 바깥에서 인라인으로 쓰였는지 체크"""
    issues = []
    # Sources 섹션 전까지의 본문만 체크
    parts = re.split(r"###?\s*🔗\s*Sources", content)
    body = parts[0] if parts else content

    for label in CONFIDENCE_LABELS:
        count = body.count(label)
        if count > 0:
            issues.append(f"본문에 확신도 라벨 인라인 발견: '{label}' × {count}회")

    return issues


def check_title_diversity(filepath: Path) -> list:
    """최근 3일 제목과 클리셰 패턴 비교"""
    issues = []
    fm = extract_frontmatter(filepath.read_text(encoding="utf-8"))
    title = fm.get("title", "")

    # 현재 제목 클리셰 체크
    cliches_found = [p for p in TITLE_CLICHES if re.search(p, title)]
    if len(cliches_found) >= 2:
        issues.append(f"제목 클리셰 {len(cliches_found)}개: {', '.join(cliches_found)}")

    # 최근 3일 파일과 비교
    daily_dir = filepath.parent
    try:
        date_str = fm.get("date", "")
        current_date = datetime.strptime(date_str, "%Y-%m-%d")
    except ValueError:
        return issues

    for i in range(1, 4):
        prev_date = current_date - timedelta(days=i)
        prev_file = daily_dir / f"{prev_date.strftime('%Y-%m-%d')}-daily-research.md"
        if prev_file.exists():
            prev_fm = extract_frontmatter(prev_file.read_text(encoding="utf-8"))
            prev_title = prev_fm.get("title", "")
            # 공통 클리셰 패턴
            for p in TITLE_CLICHES:
                if re.search(p, title) and re.search(p, prev_title):
                    issues.append(f"'{p}' 패턴이 {prev_date.strftime('%m/%d')} 제목과 중복")

    return issues


def check_file(filepath: Path) -> dict:
    """파일 QA 체크"""
    content = filepath.read_text(encoding="utf-8")
    lines = content.split("\n")

    results = {
        "file": filepath.name,
        "passed": True,
        "errors": [],
        "warnings": [],
        "stats": {},
    }

    # 1. Frontmatter v2 검증
    fm = extract_frontmatter(content)
    missing_fm = [f for f in REQUIRED_FRONTMATTER if f not in fm]
    if missing_fm:
        results["warnings"].append(f"Frontmatter 누락 필드: {', '.join(missing_fm)}")

    # 2. 불릿포인트 비율
    bullet_lines = sum(1 for line in lines if re.match(r"^\s*[-*•]\s", line))
    total_lines = len([l for l in lines if l.strip()])
    bullet_ratio = bullet_lines / total_lines if total_lines > 0 else 0
    results["stats"]["bullet_ratio"] = f"{bullet_ratio:.1%}"
    if bullet_ratio > 0.15:
        results["errors"].append(f"불릿포인트 비율 {bullet_ratio:.1%} > 15%")
        results["passed"] = False

    # 3. 금지 표현
    for phrase in BANNED_PHRASES:
        if phrase in content:
            results["errors"].append(f"금지 표현: '{phrase}'")
            results["passed"] = False

    # 4. 확신도 라벨 인라인 체크
    confidence_issues = check_confidence_inline(content)
    if confidence_issues:
        for issue in confidence_issues:
            results["errors"].append(issue)
        results["passed"] = False

    # 5. 링크 검증
    link_result = check_links(content)
    results["stats"]["links_total"] = link_result["total"]
    results["stats"]["links_ok"] = len(link_result["ok"])
    results["stats"]["links_paywall"] = len(link_result["paywall"])
    results["stats"]["links_dead"] = len(link_result["dead"])

    if link_result["total"] == 0:
        results["errors"].append("링크 없음! 출처 URL 필수")
        results["passed"] = False

    if link_result["dead"]:
        results["errors"].append(f"접속 불가 링크 {len(link_result['dead'])}개:")
        for dl in link_result["dead"][:5]:
            results["errors"].append(f"  ❌ {dl[:80]}")
        results["passed"] = False

    if link_result["paywall"]:
        results["warnings"].append(f"Paywall 링크 {len(link_result['paywall'])}개 (본문에 '(paywall)' 표기 권장):")
        for pl in link_result["paywall"][:3]:
            results["warnings"].append(f"  🔒 {pl[:80]}")

    # 6. 제목 다양성
    title_issues = check_title_diversity(filepath)
    for issue in title_issues:
        results["warnings"].append(f"제목: {issue}")

    # 7. 권장 패턴
    good_found = sum(1 for p in GOOD_PATTERNS if re.search(p, content))
    results["stats"]["good_patterns"] = good_found
    if good_found == 0:
        results["warnings"].append("권장 표현 없음 (근데 함정이 있다, 결과가 소름 등)")

    # 8. 글자수
    results["stats"]["char_count"] = len(content)

    # 9. 영문 버전 존재 여부
    en_dir = filepath.parent / "en"
    en_file = en_dir / filepath.name
    results["stats"]["en_version"] = "✅" if en_file.exists() else "❌ 없음"
    if not en_file.exists():
        results["warnings"].append("영문 버전 없음 (research/daily/en/ 에 생성 필요)")

    return results


def main():
    if len(sys.argv) < 2:
        today = datetime.now().strftime("%Y-%m-%d")
        research_dir = Path.home() / "CodeWorkspace/hypeproof/research/daily"
        filepath = research_dir / f"{today}-daily-research.md"
        if not filepath.exists():
            print(f"❌ 오늘 파일 없음: {filepath}")
            sys.exit(1)
    else:
        filepath = Path(sys.argv[1])

    if not filepath.exists():
        print(f"❌ 파일 없음: {filepath}")
        sys.exit(1)

    result = check_file(filepath)

    # 결과 출력
    print(f"\n📋 QA Report v2.0: {result['file']}")
    print("=" * 60)

    print(f"\n📊 Stats:")
    for key, val in result["stats"].items():
        print(f"   {key}: {val}")

    if result["errors"]:
        print(f"\n❌ Errors ({len(result['errors'])}):")
        for err in result["errors"]:
            print(f"   • {err}")

    if result["warnings"]:
        print(f"\n⚠️  Warnings ({len(result['warnings'])}):")
        for warn in result["warnings"]:
            print(f"   • {warn}")

    if result["passed"]:
        print(f"\n✅ PASSED")
        sys.exit(0)
    else:
        print(f"\n❌ FAILED")
        sys.exit(1)


if __name__ == "__main__":
    main()
