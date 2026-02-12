#!/usr/bin/env python3
"""
Daily Research QA Checker
- 불릿포인트 비율 체크
- 금지 표현 검출
- 링크 포함 여부
- 파일 형식 검증
"""

import re
import sys
import urllib.request
import urllib.error
from pathlib import Path
from datetime import datetime

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

# 권장 패턴 (있으면 좋음)
GOOD_PATTERNS = [
    r"근데 함정이 있다",
    r"결과가 소름",
    r"1위긴 1위인데",
    r"또 한 방",
    r"진짜 얘기",
    r"그래서\?",
    r"So What",
]


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
    
    # 1. 불릿포인트 비율 체크
    bullet_lines = sum(1 for line in lines if re.match(r"^\s*[-*•]\s", line))
    total_lines = len([l for l in lines if l.strip()])
    bullet_ratio = bullet_lines / total_lines if total_lines > 0 else 0
    results["stats"]["bullet_ratio"] = f"{bullet_ratio:.1%}"
    
    if bullet_ratio > 0.15:
        results["errors"].append(f"불릿포인트 비율 {bullet_ratio:.1%} > 15%")
        results["passed"] = False
    
    # 2. 금지 표현 검출
    for phrase in BANNED_PHRASES:
        if phrase in content:
            results["errors"].append(f"금지 표현 발견: '{phrase}'")
            results["passed"] = False
    
    # 3. 링크 포함 여부 + 접속 검증
    links = re.findall(r"<(https?://[^>]+)>", content)
    results["stats"]["link_count"] = len(links)
    
    if len(links) == 0:
        results["errors"].append("링크 없음! 출처 URL 필수")
        results["passed"] = False
    else:
        # 링크 접속 검증
        dead_links = []
        for url in links[:10]:  # 최대 10개만 체크 (속도)
            try:
                req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
                urllib.request.urlopen(req, timeout=5)
            except (urllib.error.HTTPError, urllib.error.URLError, Exception) as e:
                dead_links.append(url)
        
        results["stats"]["dead_links"] = len(dead_links)
        if dead_links:
            results["errors"].append(f"접속 불가 링크 {len(dead_links)}개 발견!")
            for dl in dead_links[:3]:  # 최대 3개만 표시
                results["errors"].append(f"  → {dl[:60]}...")
            results["passed"] = False
    
    # 4. 날짜 형식 확인 (파일명)
    date_match = re.match(r"(\d{4}-\d{2}-\d{2})\.md$", filepath.name)
    if not date_match:
        results["warnings"].append(f"파일명 형식 불일치: {filepath.name} (YYYY-MM-DD.md 권장)")
    
    # 5. 훅 문장 확인 (첫 비어있지 않은 문단)
    content_start = re.sub(r"^#.*\n", "", content, flags=re.MULTILINE).strip()
    first_para = content_start.split("\n\n")[0] if content_start else ""
    if len(first_para) > 200:
        results["warnings"].append("첫 문단이 너무 김 (훅은 짧고 강렬하게)")
    
    # 6. 권장 패턴 체크 (있으면 좋음)
    good_found = sum(1 for p in GOOD_PATTERNS if re.search(p, content))
    results["stats"]["good_patterns"] = good_found
    if good_found == 0:
        results["warnings"].append("권장 표현 없음 (근데 함정이 있다, 결과가 소름 등)")
    
    # 7. 글자수 체크
    char_count = len(content)
    results["stats"]["char_count"] = char_count
    
    # 멀티파트 체크
    parts = re.findall(r"\[(\d+)/(\d+)\]", content)
    if parts:
        results["stats"]["parts"] = f"{len(set(parts))} parts"
    
    return results


def main():
    if len(sys.argv) < 2:
        # 기본: 오늘 날짜 파일 체크
        today = datetime.now().strftime("%Y-%m-%d")
        research_dir = Path.home() / "CodeWorkspace/side/hypeproof/research/daily"
        filepath = research_dir / f"{today}.md"
        
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
    print(f"\n📋 QA Report: {result['file']}")
    print("=" * 50)
    
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
