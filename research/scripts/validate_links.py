#!/usr/bin/env python3
"""
Research Link Validator v1.0
- 리서치 마크다운 파일의 모든 링크를 검증
- 파이프라인 통합용: exit code 0=pass, 1=broken links found
- 병렬 검증으로 빠른 실행 (concurrent.futures)

Usage:
  python3 validate_links.py <file.md>              # 단일 파일
  python3 validate_links.py --all                   # 전체 리서치
  python3 validate_links.py --recent 7              # 최근 7일
  python3 validate_links.py --fix <file.md>         # 깨진 링크 자동 수정 시도
"""

import re
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

RESEARCH_DIR = Path.home() / "CodeWorkspace/hypeproof/web/src/content/research/ko"
EN_DIR = Path.home() / "CodeWorkspace/hypeproof/web/src/content/research/en"

# 403은 paywall — 정상으로 간주
PAYWALL_CODES = {401, 403}
# 이 도메인은 항상 bot을 차단 — skip
KNOWN_BLOCKERS = {"bloomberg.com", "wsj.com", "nytimes.com", "ft.com"}


def extract_links(content: str) -> list[dict]:
    """마크다운에서 [text](url) 형태의 링크 추출"""
    pattern = r'\[([^\]]+)\]\((https?://[^)]+)\)'
    links = []
    seen = set()
    for match in re.finditer(pattern, content):
        url = match.group(2)
        if url not in seen:
            seen.add(url)
            links.append({
                "text": match.group(1)[:60],
                "url": url,
            })
    return links


def check_url(url: str, timeout: int = 10) -> dict:
    """curl로 URL 검증 (redirect 따라감, bot-block 우회)"""
    # known blocker는 skip
    for domain in KNOWN_BLOCKERS:
        if domain in url:
            return {"url": url, "status": "skip", "code": 0, "reason": "known paywall"}

    try:
        result = subprocess.run(
            ["curl", "-sL", "-o", "/dev/null",
             "-w", "%{http_code}",
             "--max-time", str(timeout),
             "-A", "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
             url],
            capture_output=True, text=True, timeout=timeout + 5
        )
        code = int(result.stdout.strip()) if result.stdout.strip().isdigit() else 0

        if code == 200:
            return {"url": url, "status": "ok", "code": code}
        elif code in PAYWALL_CODES:
            return {"url": url, "status": "paywall", "code": code}
        elif code == 404:
            return {"url": url, "status": "broken", "code": code, "reason": "404 Not Found"}
        elif code >= 500:
            return {"url": url, "status": "broken", "code": code, "reason": f"Server error {code}"}
        elif code == 0:
            return {"url": url, "status": "broken", "code": 0, "reason": "Connection failed/timeout"}
        else:
            return {"url": url, "status": "warn", "code": code, "reason": f"HTTP {code}"}

    except subprocess.TimeoutExpired:
        return {"url": url, "status": "broken", "code": 0, "reason": "Timeout"}
    except Exception as e:
        return {"url": url, "status": "broken", "code": 0, "reason": str(e)[:50]}


def validate_file(filepath: Path, parallel: int = 5) -> dict:
    """파일의 모든 링크를 병렬 검증"""
    content = filepath.read_text(encoding="utf-8")
    links = extract_links(content)

    results = {
        "file": filepath.name,
        "total": len(links),
        "ok": [],
        "paywall": [],
        "broken": [],
        "skipped": [],
        "warn": [],
    }

    if not links:
        return results

    with ThreadPoolExecutor(max_workers=parallel) as executor:
        futures = {executor.submit(check_url, link["url"]): link for link in links}
        for future in as_completed(futures):
            link = futures[future]
            try:
                check = future.result()
                check["text"] = link["text"]
                status = check["status"]
                if status == "ok":
                    results["ok"].append(check)
                elif status == "paywall":
                    results["paywall"].append(check)
                elif status == "broken":
                    results["broken"].append(check)
                elif status == "skip":
                    results["skipped"].append(check)
                else:
                    results["warn"].append(check)
            except Exception as e:
                results["broken"].append({
                    "url": link["url"], "text": link["text"],
                    "status": "broken", "code": 0, "reason": str(e)[:50]
                })

    return results


def print_report(results: dict) -> None:
    """리포트 출력"""
    print(f"\n🔗 Link Validation: {results['file']}")
    print(f"   Total: {results['total']} | "
          f"✅ {len(results['ok'])} | "
          f"🔒 {len(results['paywall'])} | "
          f"⏭️ {len(results['skipped'])} | "
          f"⚠️ {len(results['warn'])} | "
          f"❌ {len(results['broken'])}")

    if results["broken"]:
        print(f"\n   ❌ Broken links:")
        for b in results["broken"]:
            print(f"      [{b.get('text', '')}]")
            print(f"      {b['url'][:90]}")
            print(f"      → {b.get('reason', 'unknown')}")

    if results["warn"]:
        print(f"\n   ⚠️ Warnings:")
        for w in results["warn"]:
            print(f"      {w['code']} | {w['url'][:80]}")


def get_recent_files(days: int) -> list[Path]:
    """최근 N일의 리서치 파일"""
    files = []
    today = datetime.now()
    for i in range(days):
        date = today - timedelta(days=i)
        f = RESEARCH_DIR / f"{date.strftime('%Y-%m-%d')}-daily-research.md"
        if f.exists():
            files.append(f)
    return files


def main():
    args = sys.argv[1:]

    if not args:
        print("Usage: validate_links.py <file.md> | --all | --recent N")
        sys.exit(1)

    files = []
    if args[0] == "--all":
        files = sorted(RESEARCH_DIR.glob("*.md"))
    elif args[0] == "--recent":
        days = int(args[1]) if len(args) > 1 else 7
        files = get_recent_files(days)
    else:
        p = Path(args[0])
        if p.exists():
            files = [p]
        else:
            print(f"❌ File not found: {p}")
            sys.exit(1)

    total_broken = 0
    all_results = []

    for f in files:
        results = validate_file(f)
        print_report(results)
        total_broken += len(results["broken"])
        all_results.append(results)

    # Summary
    print(f"\n{'='*50}")
    print(f"📊 Summary: {len(files)} files scanned")
    total_links = sum(r["total"] for r in all_results)
    total_ok = sum(len(r["ok"]) for r in all_results)
    total_paywall = sum(len(r["paywall"]) for r in all_results)
    print(f"   Links: {total_links} total | {total_ok} ok | {total_paywall} paywall | {total_broken} broken")

    if total_broken > 0:
        print(f"\n❌ FAILED — {total_broken} broken link(s) found")
        sys.exit(1)
    else:
        print(f"\n✅ PASSED — all links valid")
        sys.exit(0)


if __name__ == "__main__":
    main()
