#!/usr/bin/env python3
"""Lint typography in slide builder .py files.

Parses tb() calls to detect text box overflow where the allocated
height is too small for the text content at the given font size.
"""

import argparse
import ast
import re
import sys


EMU_PER_PT = 12700
DEFAULT_LINE_HEIGHT_FACTOR = 1.3
KOREAN_OVERHEAD = 1.10  # Korean text needs ~10% more height


def _has_korean(text):
    return any('\uAC00' <= ch <= '\uD7A3' for ch in text)


def _count_lines(text):
    return text.count('\\n') + 1 if '\\n' in text else text.count('\n') + 1


def lint_file(path):
    """Parse a .py file and find tb() calls with potential overflow.

    Returns list of dicts: {line, text, font_pt, box_h_emu, required_h_emu, overflow_pct}
    """
    with open(path, encoding='utf-8') as f:
        source = f.read()

    issues = []

    # Match tb() calls: tb(pid, x, y, w, h, text, sz, ...)
    # We look for the pattern across potentially multiple lines
    pattern = re.compile(
        r'tb\s*\('
        r'[^,]+,'       # pid
        r'[^,]+,'       # x
        r'[^,]+,'       # y
        r'[^,]+,'       # w
        r'\s*([^,]+),'  # h (capture group 1)
        r"\s*(?:'([^']*)'|\"([^\"]*)\")\s*,"  # text (capture group 2 or 3)
        r'\s*(\d+)'     # sz (capture group 4)
        r'(?:.*?ls\s*=\s*(\d+))?',  # optional ls (capture group 5)
        re.DOTALL,
    )

    for match in pattern.finditer(source):
        h_expr = match.group(1).strip()
        text = match.group(2) or match.group(3) or ''
        font_pt = int(match.group(4))
        ls = int(match.group(5)) if match.group(5) else 100

        # Try to evaluate h expression
        try:
            # Handle emu() calls
            h_eval = h_expr.replace('emu(', '(914400*')
            box_h = int(eval(h_eval))
        except Exception:
            continue

        lines = _count_lines(text)
        required_h = lines * font_pt * EMU_PER_PT * DEFAULT_LINE_HEIGHT_FACTOR * (ls / 100)
        if _has_korean(text):
            required_h *= KOREAN_OVERHEAD

        required_h = int(required_h)

        if box_h < required_h * 0.85:
            line_no = source[:match.start()].count('\n') + 1
            overflow_pct = round((1 - box_h / required_h) * 100)
            issues.append({
                'line': line_no,
                'text': text[:50] + ('...' if len(text) > 50 else ''),
                'font_pt': font_pt,
                'lines': lines,
                'box_h_emu': box_h,
                'required_h_emu': required_h,
                'overflow_pct': overflow_pct,
            })

    return issues


def print_report(path, issues):
    """Print lint report."""
    print(f'\n=== Typography Lint: {path} ===')
    if not issues:
        print('[PASS] No overflow detected')
        return True

    for i in issues:
        print(f'[WARN] Line {i["line"]}: "{i["text"]}" '
              f'({i["font_pt"]}pt, {i["lines"]} lines, '
              f'box={i["box_h_emu"]} < needed={i["required_h_emu"]}, '
              f'{i["overflow_pct"]}% overflow)')

    print(f'\n{len(issues)} potential overflow(s)')
    return False


def lint_content_json(path, limits=None):
    """Lint slide-content.json for text that will overflow at typical font sizes.

    Unlike lint_file() which checks hardcoded strings in slides.py,
    this checks the dynamic content that gets injected at runtime.

    Args:
        path: Path to slide-content.json
        limits: Dict of field → max visual chars. Uses sensible defaults.

    Returns:
        List of issue dicts compatible with validate.py format.
    """
    import json

    if limits is None:
        limits = {
            'title': 10, 'subtitle': 25, 'stat_label': 8,
            'bullet': 15, 'table_cell': 12, 'quote': 40,
        }

    with open(path, encoding='utf-8') as f:
        content = json.load(f)

    issues = []
    # Typical font sizes per field (pt) and box heights (emu)
    FIELD_FONT = {
        'title': 28, 'subtitle': 18, 'stat_label': 14,
        'bullet': 14, 'table_cell': 11, 'quote': 14,
    }

    for slide in content.get('slides', []):
        sn = slide.get('build', '??')

        # Check multi-line fields that may cause vertical overflow
        for field_name, text in [
            ('title', slide.get('title', '')),
            ('subtitle', slide.get('subtitle', '')),
            ('quote', slide.get('quote', '')),
            ('callout', slide.get('callout', '')),
        ]:
            if not text:
                continue
            lines = text.count('\n') + 1
            font_pt = FIELD_FONT.get(field_name, 14)
            # Estimate: if text has newlines and >2 lines, likely overflow
            if lines > 2:
                issues.append({
                    'line': 0,
                    'source': 'content_json',
                    'slide': sn,
                    'field': field_name,
                    'text': text[:50] + ('...' if len(text) > 50 else ''),
                    'font_pt': font_pt,
                    'lines': lines,
                    'overflow_pct': (lines - 2) * 30,  # rough estimate
                })

        # Check bullet desc fields (often the longest)
        for j, b in enumerate(slide.get('bullets', [])):
            desc = b.get('desc', '')
            if desc and len(desc) > 60:
                issues.append({
                    'line': 0,
                    'source': 'content_json',
                    'slide': sn,
                    'field': f'bullets[{j}].desc',
                    'text': desc[:50] + '...',
                    'font_pt': 12,
                    'lines': max(1, len(desc) // 30),
                    'overflow_pct': max(0, (len(desc) - 60) * 2),
                })

    return issues


def main():
    parser = argparse.ArgumentParser(description='Lint tb() calls for text overflow')
    parser.add_argument('file', help='Python file with slide builders')
    parser.add_argument('--content', help='Path to slide-content.json for dynamic content linting')
    parser.add_argument('--limits', help='Path to JSON file with text limits')
    args = parser.parse_args()

    all_issues = lint_file(args.file)
    passed = print_report(args.file, all_issues)

    if args.content:
        import json as _json
        limits = None
        if args.limits:
            with open(args.limits, encoding='utf-8') as f:
                limits = _json.load(f)
        content_issues = lint_content_json(args.content, limits)
        if content_issues:
            print(f'\n=== Content JSON Lint: {args.content} ===')
            for i in content_issues:
                print(f'[WARN] Slide {i["slide"]} {i["field"]}: "{i["text"]}" '
                      f'({i["font_pt"]}pt, ~{i["lines"]} lines, ~{i["overflow_pct"]}% overflow)')
            print(f'\n{len(content_issues)} content overflow(s)')
            passed = False
        else:
            print(f'\n[PASS] Content JSON: no overflow detected')

    sys.exit(0 if passed else 1)


if __name__ == '__main__':
    main()
