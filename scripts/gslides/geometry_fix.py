#!/usr/bin/env python3
"""Apply geometry fixes to slides.py based on critic feedback.

Reads feedback.json for truncation/empty-space issues and modifies
emu() values in the target slides.py file. Runs lint after fixing.
"""

import argparse
import json
import os
import re
import sys


# Minimum/maximum constraints for emu values (inches)
MIN_BOX_HEIGHT = 0.3
MAX_BOX_HEIGHT = 4.5
MIN_CARD_HEIGHT = 1.5
MAX_CARD_HEIGHT = 3.5


def _parse_feedback(feedback_path):
    """Extract geometry-relevant issues from feedback.json.

    Returns:
        List of dicts with keys: slide_index, issue_type, suggestion
    """
    with open(feedback_path, encoding='utf-8') as f:
        feedback = json.load(f)

    geo_issues = []
    for slide in feedback.get('slides', []):
        idx = slide.get('index', 0)
        for issue_text in slide.get('issues', []):
            lower = issue_text.lower()
            if any(kw in lower for kw in ('truncat', 'cut off', 'overflow', 'too small')):
                geo_issues.append({
                    'slide_index': idx,
                    'issue_type': 'truncation',
                    'detail': issue_text,
                })
            elif any(kw in lower for kw in ('empty space', 'sparse', 'too much whitespace', 'under-utilized')):
                geo_issues.append({
                    'slide_index': idx,
                    'issue_type': 'empty_space',
                    'detail': issue_text,
                })
    return geo_issues


def _find_builder_function(source, slide_index):
    """Find the builder function for a given slide index in slides.py.

    Looks for patterns like:
      def s03(pid, data):  or  '03': s03  in BUILDERS dict
    """
    build_id = f'{slide_index:02d}'
    # Find function definition
    pattern = rf'def\s+s{build_id}\s*\('
    match = re.search(pattern, source)
    if match:
        return match.start(), f's{build_id}'
    return None, None


def _adjust_emu_values(source, func_start, issue_type):
    """Adjust emu() values within a builder function.

    For truncation: increase height values by 20%
    For empty space: increase height values by 30% (to fill space)

    Returns modified source.
    """
    # Find the end of the function (next def or end of file)
    next_def = re.search(r'\ndef\s+\w+\s*\(', source[func_start + 1:])
    if next_def:
        func_end = func_start + 1 + next_def.start()
    else:
        func_end = len(source)

    func_body = source[func_start:func_end]

    if issue_type == 'truncation':
        # Increase box heights (the h parameter in tb/card calls)
        # Look for emu(X.X) in height positions and increase
        def _increase_height(m):
            val = float(m.group(1))
            new_val = min(val * 1.2, MAX_BOX_HEIGHT)
            new_val = max(new_val, MIN_BOX_HEIGHT)
            return f'emu({new_val:.2f})'

        # Match height params: 5th positional in tb() calls
        # This is a conservative approach - only adjust explicit emu() in card/tb h params
        modified = re.sub(
            r'(?<=,\s)emu\((\d+\.?\d*)\)(?=,\s*[\'"])',  # emu before text string
            _increase_height,
            func_body,
        )
        # Also adjust card heights
        modified = re.sub(
            r'card\(pid,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*emu\((\d+\.?\d*)\)',
            lambda m: m.group(0).replace(
                f'emu({m.group(1)})',
                f'emu({min(float(m.group(1)) * 1.2, MAX_CARD_HEIGHT):.2f})'
            ),
            modified,
        )
    elif issue_type == 'empty_space':
        # Increase content area heights to fill space
        def _expand_height(m):
            val = float(m.group(1))
            new_val = min(val * 1.3, MAX_CARD_HEIGHT)
            return f'emu({new_val:.2f})'

        modified = re.sub(
            r'card\(pid,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*emu\((\d+\.?\d*)\)',
            lambda m: m.group(0).replace(
                f'emu({m.group(1)})',
                f'emu({min(float(m.group(1)) * 1.3, MAX_CARD_HEIGHT):.2f})'
            ),
            func_body,
        )
        modified = func_body if modified == func_body else modified
    else:
        modified = func_body

    return source[:func_start] + modified + source[func_end:]


def apply_geometry_fixes(slides_path, feedback_path, lint_after=True, dry_run=False):
    """Main entry point: read feedback, fix geometry in slides.py.

    Args:
        slides_path: Path to the project's slides.py
        feedback_path: Path to feedback.json from deck-critic
        lint_after: Run lint_typography after fixes
        dry_run: If True, report what would change without modifying files

    Returns:
        Dict with keys: fixes_applied (int), lint_passed (bool), details (list)
    """
    if not os.path.exists(slides_path):
        return {'fixes_applied': 0, 'lint_passed': False,
                'details': [f'slides.py not found: {slides_path}']}

    if not os.path.exists(feedback_path):
        return {'fixes_applied': 0, 'lint_passed': False,
                'details': [f'feedback.json not found: {feedback_path}']}

    issues = _parse_feedback(feedback_path)
    if not issues:
        return {'fixes_applied': 0, 'lint_passed': True,
                'details': ['No geometry issues found in feedback']}

    with open(slides_path, encoding='utf-8') as f:
        source = f.read()

    original = source
    details = []
    fixes = 0

    for issue in issues:
        func_start, func_name = _find_builder_function(source, issue['slide_index'])
        if func_start is None:
            details.append(f'Slide {issue["slide_index"]}: builder function not found, skipping')
            continue

        new_source = _adjust_emu_values(source, func_start, issue['issue_type'])
        if new_source != source:
            source = new_source
            fixes += 1
            details.append(
                f'Slide {issue["slide_index"]} ({func_name}): '
                f'adjusted for {issue["issue_type"]}'
            )
        else:
            details.append(
                f'Slide {issue["slide_index"]} ({func_name}): '
                f'no emu() patterns matched for {issue["issue_type"]}'
            )

    if dry_run:
        details.insert(0, f'DRY RUN: would apply {fixes} fix(es)')
        return {'fixes_applied': fixes, 'lint_passed': None, 'details': details}

    if source != original:
        with open(slides_path, 'w', encoding='utf-8') as f:
            f.write(source)
        details.insert(0, f'Wrote {fixes} fix(es) to {slides_path}')

    # Run lint after fixing
    lint_passed = True
    if lint_after and fixes > 0:
        from .lint_typography import lint_file, print_report
        lint_issues = lint_file(slides_path)
        lint_passed = print_report(slides_path, lint_issues)
        if not lint_passed:
            details.append(f'Post-fix lint found {len(lint_issues)} issue(s)')

    return {'fixes_applied': fixes, 'lint_passed': lint_passed, 'details': details}


def main():
    parser = argparse.ArgumentParser(description='Apply geometry fixes from feedback')
    parser.add_argument('--slides', required=True, help='Path to slides.py')
    parser.add_argument('--feedback', required=True, help='Path to feedback.json')
    parser.add_argument('--no-lint', action='store_true', help='Skip lint after fixing')
    parser.add_argument('--dry-run', action='store_true', help='Report without modifying')
    args = parser.parse_args()

    result = apply_geometry_fixes(
        args.slides, args.feedback,
        lint_after=not args.no_lint,
        dry_run=args.dry_run,
    )

    print(json.dumps(result, indent=2, ensure_ascii=False))
    sys.exit(0 if result['fixes_applied'] > 0 or result['lint_passed'] else 1)


if __name__ == '__main__':
    main()
