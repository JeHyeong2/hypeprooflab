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


def main():
    parser = argparse.ArgumentParser(description='Lint tb() calls for text overflow')
    parser.add_argument('file', help='Python file with slide builders')
    args = parser.parse_args()

    issues = lint_file(args.file)
    passed = print_report(args.file, issues)
    sys.exit(0 if passed else 1)


if __name__ == '__main__':
    main()
