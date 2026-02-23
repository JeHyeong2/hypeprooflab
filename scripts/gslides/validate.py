#!/usr/bin/env python3
"""Validate slide-content.json against configurable text constraints."""

import argparse
import json
import os
import sys


def korean_len(text):
    """Count Korean characters (Hangul syllables only)."""
    return sum(1 for ch in text if '\uAC00' <= ch <= '\uD7A3')


def total_visual_len(text):
    """Count visually significant characters (Korean + ASCII letters/digits)."""
    return sum(1 for ch in text if '\uAC00' <= ch <= '\uD7A3' or ch.isalnum())


# Default limits (can be overridden via deck.yaml text_limits)
DEFAULT_LIMITS = {
    'title': 10,
    'subtitle': 25,
    'stat_label': 8,
    'bullet': 15,
    'table_cell': 12,
    'quote': 40,
}


def validate(content, limits=None, expected_slides=None):
    """Run all validation checks.

    Args:
        content: Parsed slide-content.json dict
        limits: Text length limits dict. Defaults to DEFAULT_LIMITS.
        expected_slides: Expected slide count. None to skip count check.

    Returns:
        List of issue dicts with type, severity, and details.
    """
    if limits is None:
        limits = DEFAULT_LIMITS

    issues = []
    slides = content.get('slides', [])

    if expected_slides is not None and len(slides) != expected_slides:
        issues.append({
            'type': 'structure',
            'severity': 'FAIL',
            'message': f'Expected {expected_slides} slides, got {len(slides)}',
        })

    for i, slide in enumerate(slides):
        slide_num = slide.get('build', str(i + 1))

        if 'phases' in slide:
            for j, phase in enumerate(slide['phases']):
                name = phase.get('name', '')
                if korean_len(name) > limits.get('title', 10):
                    issues.append({
                        'type': 'text_overflow',
                        'severity': 'FAIL',
                        'slide': slide_num,
                        'field': f'phases[{j}].name',
                        'value': name,
                        'korean_chars': korean_len(name),
                        'limit': limits['title'],
                    })

        if 'members' in slide:
            for j, member in enumerate(slide['members']):
                for field in ['name', 'role', 'org']:
                    val = member.get(field, '')
                    if korean_len(val) > limits.get('table_cell', 12):
                        issues.append({
                            'type': 'text_overflow',
                            'severity': 'WARN',
                            'slide': slide_num,
                            'field': f'members[{j}].{field}',
                            'value': val,
                            'korean_chars': korean_len(val),
                            'limit': limits['table_cell'],
                        })

    return issues


def print_report(issues, slide_count):
    """Print formatted QA report. Returns True if passed."""
    print('\n=== Slide QA Report ===')
    print(f'Slides checked: {slide_count}')
    print()

    fails = [i for i in issues if i['severity'] == 'FAIL']
    warns = [i for i in issues if i['severity'] == 'WARN']

    if not issues:
        print('[PASS] All checks passed')
    else:
        for issue in fails:
            if issue['type'] == 'text_overflow':
                print(f'[FAIL] Slide {issue["slide"]} {issue["field"]}: '
                      f'"{issue["value"]}" ({issue["korean_chars"]} Korean chars > {issue["limit"]} limit)')
            else:
                print(f'[FAIL] {issue["message"]}')
        for issue in warns:
            if issue['type'] == 'text_overflow':
                print(f'[WARN] Slide {issue["slide"]} {issue["field"]}: '
                      f'"{issue["value"]}" ({issue["korean_chars"]} Korean chars > {issue["limit"]} limit)')

    print(f'\nFails: {len(fails)}')
    print(f'Warnings: {len(warns)}')
    print(f'Status: {"FAIL" if fails else "PASS"}')
    return len(fails) == 0


def main():
    parser = argparse.ArgumentParser(description='Validate slide-content.json')
    parser.add_argument('--content', required=True, help='Path to slide-content.json')
    parser.add_argument('--limits', help='Path to JSON file with text limits')
    parser.add_argument('--expected-slides', type=int, help='Expected number of slides')
    args = parser.parse_args()

    if not os.path.exists(args.content):
        print(f'[FAIL] File not found: {args.content}')
        sys.exit(1)

    with open(args.content, encoding='utf-8') as f:
        content = json.load(f)

    limits = DEFAULT_LIMITS
    if args.limits and os.path.exists(args.limits):
        with open(args.limits, encoding='utf-8') as f:
            limits = {**DEFAULT_LIMITS, **json.load(f)}

    issues = validate(content, limits, args.expected_slides)
    passed = print_report(issues, len(content.get('slides', [])))
    sys.exit(0 if passed else 1)


if __name__ == '__main__':
    main()
