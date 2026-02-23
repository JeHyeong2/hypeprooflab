#!/usr/bin/env python3
"""
Validate slide-content.json against text constraints.

Usage: python3 validate_slides.py [--content output/slide-content.json]
"""
import argparse
import json
import os
import re
import sys


# Korean character counting: only count Hangul syllables
def korean_len(text: str) -> int:
    """Count Korean characters (Hangul syllables only)."""
    return sum(1 for ch in text if '\uAC00' <= ch <= '\uD7A3')


def total_visual_len(text: str) -> int:
    """Count visually significant characters (Korean + ASCII letters/digits)."""
    return sum(1 for ch in text if '\uAC00' <= ch <= '\uD7A3' or ch.isalnum())


# Constraints
LIMITS = {
    'title': 10,
    'subtitle': 25,
    'stat_label': 8,
    'bullet': 15,
    'table_cell': 12,
    'quote': 40,
}


def validate(content: dict) -> list[dict]:
    """Run all validation checks. Returns list of issues."""
    issues = []
    slides = content.get('slides', [])

    # Check slide count
    if len(slides) != 9:
        issues.append({
            'type': 'structure',
            'severity': 'FAIL',
            'message': f'Expected 9 slides, got {len(slides)}',
        })

    for i, slide in enumerate(slides):
        slide_num = slide.get('build', str(i + 1))

        # Check title if present in phases or content
        # Slides with phases have embedded content
        if 'phases' in slide:
            for j, phase in enumerate(slide['phases']):
                name = phase.get('name', '')
                if korean_len(name) > LIMITS['title']:
                    issues.append({
                        'type': 'text_overflow',
                        'severity': 'FAIL',
                        'slide': slide_num,
                        'field': f'phases[{j}].name',
                        'value': name,
                        'korean_chars': korean_len(name),
                        'limit': LIMITS['title'],
                    })

        if 'members' in slide:
            for j, member in enumerate(slide['members']):
                for field in ['name', 'role', 'org']:
                    val = member.get(field, '')
                    if korean_len(val) > LIMITS['table_cell']:
                        issues.append({
                            'type': 'text_overflow',
                            'severity': 'WARN',
                            'slide': slide_num,
                            'field': f'members[{j}].{field}',
                            'value': val,
                            'korean_chars': korean_len(val),
                            'limit': LIMITS['table_cell'],
                        })

        # Check for empty required fields
        if slide.get('build') and not any(k != 'build' for k in slide.keys()):
            # Slides with only 'build' key are OK (hardcoded in generator)
            continue

    return issues


def print_report(issues: list[dict], slide_count: int):
    """Print formatted QA report."""
    print('\n=== Proposal QA Report ===')
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
    parser.add_argument('--content', default=os.path.join(
        os.path.dirname(__file__), '..', 'output', 'slide-content.json'))
    args = parser.parse_args()

    if not os.path.exists(args.content):
        print(f'[FAIL] File not found: {args.content}')
        sys.exit(1)

    with open(args.content, encoding='utf-8') as f:
        content = json.load(f)

    issues = validate(content)
    passed = print_report(issues, len(content.get('slides', [])))
    sys.exit(0 if passed else 1)


if __name__ == '__main__':
    main()
