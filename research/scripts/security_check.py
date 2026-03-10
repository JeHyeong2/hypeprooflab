#!/usr/bin/env python3
"""
Research Security Gate v1.0
콘텐츠 파이프라인 보안 검증 — 게시 전 필수 통과.

체크 항목:
  1. HTML Injection (critical)
  2. Event Handler Injection (critical)
  3. JavaScript URI (critical)
  4. 악성 URL 패턴 (warning)
  5. 외부 이미지 트래킹 (info)
  6. Frontmatter Injection (critical/warning)
  7. 과도한 리다이렉트 (warning)
  8. 숨은 콘텐츠 (info/warning)

Usage:
  python3 security_check.py <file.md>           # 단일 파일
  python3 security_check.py --all               # 전체 research/ko + research/en
  python3 security_check.py <file.md> --json    # JSON 출력
"""

import re
import sys
import json
import subprocess
from pathlib import Path
from urllib.parse import urlparse

# ── Paths ──
WEB_RESEARCH_DIR = Path.home() / "CodeWorkspace/hypeproof/web/src/content/research"
KO_DIR = WEB_RESEARCH_DIR / "ko"
EN_DIR = WEB_RESEARCH_DIR / "en"

# ══════════════════════════════════════════════
# Detection patterns
# ══════════════════════════════════════════════

# 1. HTML Injection — critical
DANGEROUS_TAGS = re.compile(
    r'<\s*(script|iframe|object|embed|form|input|style|link)\b',
    re.IGNORECASE
)

# 2. Event Handler Injection — critical
EVENT_HANDLERS = re.compile(
    r'\bon(error|load|click|mouseover|mouseout|mouseenter|mouseleave'
    r'|keydown|keyup|keypress|focus|blur|submit|change|input'
    r'|contextmenu|dblclick|drag|drop|resize|scroll)\s*=',
    re.IGNORECASE
)

# 3. JavaScript URI — critical
JS_URI = re.compile(
    r'(javascript\s*:|data\s*:\s*text/html|vbscript\s*:)',
    re.IGNORECASE
)

# 4. URL shorteners & suspicious TLDs — warning
URL_SHORTENERS = [
    "bit.ly", "tinyurl.com", "t.co", "goo.gl", "ow.ly",
    "is.gd", "buff.ly", "j.mp", "su.pr", "rebrand.ly",
    "bl.ink", "short.io", "cutt.ly",
]
SUSPICIOUS_TLDS = [".tk", ".ml", ".ga", ".cf", ".gq"]

# 5. Known tracker domains — info
TRACKER_DOMAINS = [
    "pixel.wp.com", "www.facebook.com/tr", "bat.bing.com",
    "google-analytics.com", "googletagmanager.com",
    "doubleclick.net", "adservice.google.com",
    "mc.yandex.ru", "counter.yadro.ru",
]

# 6. Frontmatter injection patterns — critical/warning
FM_INJECTION = re.compile(r'(:\s*\|[\s\n]|:\s*>[\s\n]|\{\{|}}|`[^`]*`)')

# 8. Zero-width characters — warning
ZERO_WIDTH = re.compile(r'[\u200b\u200c\u200d\u2060\ufeff\u200e\u200f]')


def parse_frontmatter_raw(content: str) -> tuple[str, str]:
    """Returns (frontmatter_text, body_text)"""
    match = re.match(r'^---\s*\n(.*?)\n---', content, re.DOTALL)
    if match:
        fm = match.group(1)
        body = content[match.end():]
        return fm, body
    return "", content


def find_line(content: str, pattern_match_start: int) -> int:
    """Convert character offset to line number"""
    return content[:pattern_match_start].count('\n') + 1


# ══════════════════════════════════════════════
# Individual checks
# ══════════════════════════════════════════════

def check_html_injection(content: str) -> list[dict]:
    """Check 1: Dangerous HTML tags"""
    findings = []
    for m in DANGEROUS_TAGS.finditer(content):
        findings.append({
            "severity": "critical",
            "type": "html_injection",
            "detail": f"Dangerous HTML tag: <{m.group(1)}>",
            "line": find_line(content, m.start()),
        })
    return findings


def check_event_handlers(content: str) -> list[dict]:
    """Check 2: Inline event handlers"""
    findings = []
    for m in EVENT_HANDLERS.finditer(content):
        findings.append({
            "severity": "critical",
            "type": "event_handler_injection",
            "detail": f"Inline event handler: {m.group(0).strip()}",
            "line": find_line(content, m.start()),
        })
    return findings


def check_js_uri(content: str) -> list[dict]:
    """Check 3: JavaScript/data/vbscript URIs"""
    findings = []
    for m in JS_URI.finditer(content):
        findings.append({
            "severity": "critical",
            "type": "javascript_uri",
            "detail": f"Suspicious URI protocol: {m.group(0).strip()}",
            "line": find_line(content, m.start()),
        })
    return findings


def check_url_patterns(content: str) -> list[dict]:
    """Check 4: URL shorteners and suspicious TLDs"""
    findings = []
    urls = re.findall(r'https?://[^\s\)>"\']+', content)

    shortener_count = 0
    for url in urls:
        parsed = urlparse(url)
        host = parsed.hostname or ""

        # URL shorteners
        for shortener in URL_SHORTENERS:
            if host == shortener or host.endswith("." + shortener):
                shortener_count += 1
                if shortener_count >= 3:
                    line = find_line(content, content.find(url))
                    findings.append({
                        "severity": "warning",
                        "type": "url_shortener_excess",
                        "detail": f"Excessive URL shortener usage ({shortener_count}): {url[:80]}",
                        "line": line,
                    })

        # Suspicious TLDs
        for tld in SUSPICIOUS_TLDS:
            if host.endswith(tld):
                line = find_line(content, content.find(url))
                findings.append({
                    "severity": "warning",
                    "type": "suspicious_tld",
                    "detail": f"Suspicious TLD ({tld}): {url[:80]}",
                    "line": line,
                })

    return findings


def check_external_images(content: str) -> list[dict]:
    """Check 5: External image tracking"""
    findings = []
    img_pattern = re.compile(r'!\[([^\]]*)\]\((https?://[^)]+)\)')
    for m in img_pattern.finditer(content):
        url = m.group(2)
        parsed = urlparse(url)
        host = parsed.hostname or ""
        for tracker in TRACKER_DOMAINS:
            if tracker in host or tracker in url:
                findings.append({
                    "severity": "info",
                    "type": "tracking_image",
                    "detail": f"Known tracker in image: {url[:80]}",
                    "line": find_line(content, m.start()),
                })
                break
    return findings


def check_frontmatter_injection(content: str) -> list[dict]:
    """Check 6: Frontmatter YAML injection"""
    findings = []
    fm_text, _ = parse_frontmatter_raw(content)
    if not fm_text:
        return findings

    fm_start_offset = content.find(fm_text)

    for line_idx, line in enumerate(fm_text.split('\n'), start=2):  # +2 for --- line
        # Multiline value injection (: | or : >)
        if re.search(r':\s*\|$', line) or re.search(r':\s*>$', line):
            findings.append({
                "severity": "warning",
                "type": "frontmatter_multiline",
                "detail": f"YAML multiline value in frontmatter: {line.strip()[:60]}",
                "line": line_idx,
            })

        # Template injection {{ }}
        if '{{' in line or '}}' in line:
            findings.append({
                "severity": "critical",
                "type": "frontmatter_injection",
                "detail": f"Template injection in frontmatter: {line.strip()[:60]}",
                "line": line_idx,
            })

        # Embedded code/script in YAML values
        if re.search(r'<\s*script', line, re.IGNORECASE):
            findings.append({
                "severity": "critical",
                "type": "frontmatter_script",
                "detail": f"Script in frontmatter: {line.strip()[:60]}",
                "line": line_idx,
            })

    return findings


def check_redirects(content: str) -> list[dict]:
    """Check 7: Excessive redirects (3+) — samples up to 5 URLs"""
    findings = []
    urls = re.findall(r'\]\((https?://[^)]+)\)', content)
    if not urls:
        return findings

    # Sample at most 5 URLs to avoid slow checks
    sample = urls[:5]
    for url in sample:
        try:
            result = subprocess.run(
                ["curl", "-sL", "-o", "/dev/null", "-w",
                 "%{num_redirects} %{url_effective}",
                 "--max-time", "6", "--max-redirs", "10",
                 "-A", "Mozilla/5.0", url],
                capture_output=True, text=True, timeout=10
            )
            parts = result.stdout.strip().split(" ", 1)
            if len(parts) == 2:
                num_redirects = int(parts[0]) if parts[0].isdigit() else 0
                final_url = parts[1]
                if num_redirects >= 3:
                    orig_domain = urlparse(url).hostname or ""
                    final_domain = urlparse(final_url).hostname or ""
                    if orig_domain != final_domain:
                        line = find_line(content, content.find(url))
                        findings.append({
                            "severity": "warning",
                            "type": "excessive_redirect",
                            "detail": f"{num_redirects} redirects: {orig_domain} → {final_domain}",
                            "line": line,
                        })
        except (subprocess.TimeoutExpired, Exception):
            pass

    return findings


def check_hidden_content(content: str) -> list[dict]:
    """Check 8: HTML comments with suspicious code + zero-width characters"""
    findings = []

    # HTML comments with suspicious content
    comment_pattern = re.compile(r'<!--(.*?)-->', re.DOTALL)
    for m in comment_pattern.finditer(content):
        comment_body = m.group(1)
        # Check for script/code inside comments
        if re.search(r'<\s*script|javascript:|on\w+\s*=', comment_body, re.IGNORECASE):
            findings.append({
                "severity": "warning",
                "type": "hidden_code_in_comment",
                "detail": f"Suspicious code in HTML comment: {comment_body.strip()[:60]}",
                "line": find_line(content, m.start()),
            })
        else:
            findings.append({
                "severity": "info",
                "type": "html_comment",
                "detail": f"HTML comment: {comment_body.strip()[:60]}",
                "line": find_line(content, m.start()),
            })

    # Zero-width characters
    for m in ZERO_WIDTH.finditer(content):
        char_name = {
            '\u200b': 'ZWSP', '\u200c': 'ZWNJ', '\u200d': 'ZWJ',
            '\u2060': 'WJ', '\ufeff': 'BOM', '\u200e': 'LRM', '\u200f': 'RLM',
        }.get(m.group(), f'U+{ord(m.group()):04X}')
        findings.append({
            "severity": "info",
            "type": "zero_width_char",
            "detail": f"Zero-width character ({char_name}) at position {m.start()}",
            "line": find_line(content, m.start()),
        })

    return findings


# ══════════════════════════════════════════════
# Main API
# ══════════════════════════════════════════════

def run_security_check(filepath: Path, skip_network: bool = False) -> dict:
    """
    Run all security checks on a markdown file.

    Returns:
    {
        "file": "filename.md",
        "passed": True/False,   # critical이 하나라도 있으면 False
        "findings": [
            {"severity": "critical|warning|info", "type": "...", "detail": "...", "line": N}
        ],
        "summary": {"critical": N, "warning": N, "info": N}
    }
    """
    content = filepath.read_text(encoding="utf-8")

    findings = []
    findings.extend(check_html_injection(content))
    findings.extend(check_event_handlers(content))
    findings.extend(check_js_uri(content))
    findings.extend(check_url_patterns(content))
    findings.extend(check_external_images(content))
    findings.extend(check_frontmatter_injection(content))
    findings.extend(check_hidden_content(content))

    if not skip_network:
        findings.extend(check_redirects(content))

    summary = {
        "critical": sum(1 for f in findings if f["severity"] == "critical"),
        "warning": sum(1 for f in findings if f["severity"] == "warning"),
        "info": sum(1 for f in findings if f["severity"] == "info"),
    }

    return {
        "file": str(filepath),
        "passed": summary["critical"] == 0,
        "findings": findings,
        "summary": summary,
    }


def get_all_research_files() -> list[Path]:
    """Collect all .md files from ko/ and en/ dirs"""
    files = []
    for d in [KO_DIR, EN_DIR]:
        if d.exists():
            files.extend(sorted(d.glob("*.md")))
    return files


def print_report(result: dict) -> None:
    status = "✅ PASS" if result["passed"] else "🚨 BLOCKED"
    filepath = Path(result["file"])
    print(f"\n{'='*60}")
    print(f"🔒 Security Check: {filepath.name}")
    print(f"   Status: {status}")
    print(f"   Critical: {result['summary']['critical']} | "
          f"Warning: {result['summary']['warning']} | "
          f"Info: {result['summary']['info']}")
    print(f"{'='*60}")

    for f in result["findings"]:
        icon = {"critical": "🚨", "warning": "⚠️", "info": "ℹ️"}.get(f["severity"], "?")
        print(f"  {icon} [{f['severity'].upper()}] L{f['line']}: {f['type']}")
        print(f"     {f['detail']}")

    if not result["findings"]:
        print("  ✅ No security issues found")
    print()


def main():
    args = sys.argv[1:]
    if not args:
        print("Usage:")
        print("  security_check.py <file.md>           # Single file")
        print("  security_check.py --all               # All ko/ + en/")
        print("  security_check.py <file.md> --json    # JSON output")
        print("  security_check.py --all --json        # All files, JSON")
        sys.exit(1)

    scan_all = "--all" in args
    as_json = "--json" in args
    skip_network = "--skip-network" in args

    if scan_all:
        files = get_all_research_files()
        if not files:
            print("❌ No research files found")
            sys.exit(1)

        results = []
        for f in files:
            results.append(run_security_check(f, skip_network=skip_network))

        if as_json:
            output = {
                "scan_date": __import__("datetime").datetime.now().isoformat(),
                "total_files": len(results),
                "passed": sum(1 for r in results if r["passed"]),
                "blocked": sum(1 for r in results if not r["passed"]),
                "results": results,
            }
            print(json.dumps(output, ensure_ascii=False, indent=2))
        else:
            for r in results:
                print_report(r)
            # Summary
            passed = sum(1 for r in results if r["passed"])
            blocked = len(results) - passed
            total_critical = sum(r["summary"]["critical"] for r in results)
            total_warning = sum(r["summary"]["warning"] for r in results)
            total_info = sum(r["summary"]["info"] for r in results)
            print(f"\n{'═'*60}")
            print(f"📊 Total: {len(results)} files | ✅ {passed} passed | 🚨 {blocked} blocked")
            print(f"   Findings: {total_critical} critical, {total_warning} warning, {total_info} info")
            print(f"{'═'*60}")

        sys.exit(1 if any(not r["passed"] for r in results) else 0)

    else:
        filepath = Path([a for a in args if not a.startswith("--")][0])
        if not filepath.exists():
            print(f"❌ File not found: {filepath}")
            sys.exit(1)

        result = run_security_check(filepath, skip_network=skip_network)

        if as_json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print_report(result)

        sys.exit(0 if result["passed"] else 1)


if __name__ == "__main__":
    main()
