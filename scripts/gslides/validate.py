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


def _check_text(issues, slide_num, field, text, limit, severity='FAIL'):
    """Check a single text field against a character limit."""
    if not text:
        return
    vlen = total_visual_len(text)
    if vlen > limit:
        issues.append({
            'type': 'text_overflow',
            'severity': severity,
            'slide': slide_num,
            'field': field,
            'value': text[:60] + ('...' if len(text) > 60 else ''),
            'visual_len': vlen,
            'limit': limit,
        })


def _check_layout_diversity(slides):
    """Check that no single layout (build function) dominates >30% of slides."""
    issues = []
    if len(slides) < 6:
        return issues
    layout_counts = {}
    for s in slides:
        build = s.get('build', '??')
        # Infer layout type from content structure
        if 'columns' in s and len(s.get('columns', [])) == 3:
            layout = 'three_col_stats'
        elif 'columns' in s and len(s.get('columns', [])) == 2:
            layout = 'two_col'
        elif 'bullets' in s:
            layout = 'bullet_list'
        elif 'rows' in s:
            layout = 'table'
        elif 'phases' in s:
            layout = 'timeline'
        else:
            layout = 'other'
        layout_counts.setdefault(layout, []).append(build)
    threshold = max(3, int(len(slides) * 0.30))
    for layout, builds in layout_counts.items():
        if len(builds) > threshold:
            issues.append({
                'type': 'layout_monotony',
                'severity': 'WARN',
                'message': (f'Layout "{layout}" used {len(builds)}x '
                            f'(slides {", ".join(builds)}) — exceeds 30% threshold ({threshold}). '
                            f'Replace some with unique layouts for visual variety.'),
            })
    return issues


def _check_sparse_slides(slides):
    """Flag slides with very few visual elements (likely too much empty space)."""
    issues = []
    for s in slides:
        build = s.get('build', '??')
        element_count = 0
        for key in ['columns', 'bullets', 'phases', 'members', 'steps']:
            element_count += len(s.get(key, []))
        if 'rows' in s:
            element_count += len(s['rows'])
        if s.get('chart'):
            element_count += len(s['chart'].get('bars', []))
            element_count += len(s['chart'].get('segments', []))
        if 'left' in s:
            element_count += len(s['left'].get('items', []))
        if 'right' in s:
            element_count += len(s['right'].get('items', []))
        for key in ['quote', 'source', 'subtitle', 'callout']:
            if s.get(key):
                element_count += 1
        # Title slide and closing are exempt
        if element_count < 4 and build not in ('01', str(len(slides))):
            issues.append({
                'type': 'sparse_slide',
                'severity': 'WARN',
                'slide': build,
                'element_count': element_count,
                'message': (f'Slide {build} has only {element_count} content elements — '
                            f'likely >50% empty space. Add stats, callouts, or merge with adjacent slide.'),
            })
    return issues


def _check_cross_slide_consistency(slides):
    """Check for inconsistent terminology across slides."""
    issues = []
    # Collect column headers from table slides for consistency
    header_variants = {}  # canonical → {variant: [slides]}
    for s in slides:
        build = s.get('build', '??')
        if 'headers' in s:
            for h in s['headers']:
                key = h.strip().replace(' ', '')
                header_variants.setdefault(key, {}).setdefault(h, []).append(build)
    for key, variants in header_variants.items():
        if len(variants) > 1:
            details = ', '.join(f'"{v}" in s{"/s".join(ss)}' for v, ss in variants.items())
            issues.append({
                'type': 'cross_slide_inconsistency',
                'severity': 'WARN',
                'message': f'Inconsistent header variants: {details}. Standardize to one form.',
            })
    return issues


def _infer_layout(slide):
    """Infer layout type from slide content structure."""
    if 'columns' in slide and len(slide.get('columns', [])) == 3:
        return 'three_col_stats'
    elif 'columns' in slide and len(slide.get('columns', [])) == 2:
        return 'two_col'
    elif 'bullets' in slide:
        return 'bullet_list'
    elif 'rows' in slide:
        return 'table'
    elif 'phases' in slide:
        return 'timeline'
    elif 'left' in slide and 'right' in slide:
        return 'split_two_col'
    elif 'members' in slide:
        return 'team'
    elif slide.get('chart'):
        chart_type = slide['chart'].get('type', '')
        if chart_type == 'bar' or 'bars' in slide.get('chart', {}):
            return 'bar_chart'
        return 'chart'
    elif slide.get('steps') or slide.get('flow'):
        return 'flow_diagram'
    elif slide.get('diagram') or slide.get('image'):
        return 'visual'
    else:
        return 'other'


def _check_consecutive_layouts(slides, max_consecutive=2):
    """Flag when the same layout appears more than N times in a row."""
    issues = []
    if len(slides) < 3:
        return issues
    run_start = 0
    prev_layout = None
    for i, s in enumerate(slides):
        layout = _infer_layout(s)
        if layout == prev_layout:
            if i - run_start + 1 > max_consecutive:
                builds = [slides[j].get('build', str(j+1)) for j in range(run_start, i+1)]
                issues.append({
                    'type': 'consecutive_layout',
                    'severity': 'WARN',
                    'message': (f'{len(builds)} consecutive "{layout}" slides '
                                f'(s{"/s".join(builds)}) — max {max_consecutive} in a row. '
                                f'Break monotony with a different layout.'),
                })
        else:
            run_start = i
            prev_layout = layout
    return issues


def _check_visual_variety(slides, min_visual=4):
    """Ensure minimum number of slides have visual elements (charts, diagrams, images)."""
    issues = []
    visual_count = 0
    for s in slides:
        if any(s.get(k) for k in ('chart', 'diagram', 'image', 'icon_grid', 'steps', 'flow')):
            visual_count += 1
    if len(slides) >= 10 and visual_count < min_visual:
        issues.append({
            'type': 'visual_variety',
            'severity': 'WARN',
            'message': (f'Only {visual_count} slides have visual elements '
                        f'(charts/diagrams/images) — minimum {min_visual} recommended for '
                        f'a {len(slides)}-slide deck. Add data visualizations or diagrams.'),
        })
    return issues


def validate(content, limits=None, expected_slides=None, layout_rules=None):
    """Run all validation checks.

    Checks:
    1. Slide count
    2. Text overflow on ALL field types (title, subtitle, bullets, table cells,
       columns, quotes, callouts, phases, members, left/right items)
    3. Layout diversity (no single layout >30% of deck)
    4. Sparse slides (<4 elements → likely empty space problem)
    5. Cross-slide consistency (header terminology)
    6. Consecutive same layouts (monotony breaker)
    7. Visual variety (minimum charts/diagrams/images)

    Args:
        content: Parsed slide-content.json dict
        limits: Text length limits dict. Defaults to DEFAULT_LIMITS.
        expected_slides: Expected slide count. None to skip count check.
        layout_rules: Dict with layout diversity rules from deck.yaml.

    Returns:
        List of issue dicts with type, severity, and details.
    """
    if limits is None:
        limits = DEFAULT_LIMITS
    if layout_rules is None:
        layout_rules = {}

    issues = []
    slides = content.get('slides', [])

    # --- Check 1: Slide count ---
    if expected_slides is not None and len(slides) != expected_slides:
        issues.append({
            'type': 'structure',
            'severity': 'FAIL',
            'message': f'Expected {expected_slides} slides, got {len(slides)}',
        })

    # --- Check 2: Text overflow on ALL fields ---
    for i, slide in enumerate(slides):
        sn = slide.get('build', str(i + 1))

        # Title
        _check_text(issues, sn, 'title', slide.get('title', ''),
                     limits.get('title', 10))

        # Subtitle
        _check_text(issues, sn, 'subtitle', slide.get('subtitle', ''),
                     limits.get('subtitle', 25))

        # Quote / callout
        for field in ('quote', 'callout'):
            _check_text(issues, sn, field, slide.get(field, ''),
                         limits.get('quote', 40))

        # Bullets
        for j, b in enumerate(slide.get('bullets', [])):
            _check_text(issues, sn, f'bullets[{j}].head',
                         b.get('head', ''), limits.get('bullet', 15))
            _check_text(issues, sn, f'bullets[{j}].desc',
                         b.get('desc', ''), limits.get('quote', 40), 'WARN')

        # Columns (stat cards)
        for j, col in enumerate(slide.get('columns', [])):
            _check_text(issues, sn, f'columns[{j}].label',
                         col.get('label', ''), limits.get('stat_label', 8))
            _check_text(issues, sn, f'columns[{j}].desc',
                         col.get('desc', ''), limits.get('quote', 40), 'WARN')

        # Table rows
        for j, row in enumerate(slide.get('rows', [])):
            if isinstance(row, list):
                for k, cell in enumerate(row):
                    _check_text(issues, sn, f'rows[{j}][{k}]',
                                 str(cell), limits.get('table_cell', 12), 'WARN')

        # Left/right two-column items
        for side in ('left', 'right'):
            col_data = slide.get(side, {})
            _check_text(issues, sn, f'{side}.title',
                         col_data.get('title', ''), limits.get('title', 10))
            for j, item in enumerate(col_data.get('items', [])):
                _check_text(issues, sn, f'{side}.items[{j}]',
                             str(item), limits.get('bullet', 15), 'WARN')

        # Phases (timeline)
        for j, phase in enumerate(slide.get('phases', [])):
            _check_text(issues, sn, f'phases[{j}].name',
                         phase.get('name', ''), limits.get('title', 10))
            for k, item in enumerate(phase.get('items', [])):
                _check_text(issues, sn, f'phases[{j}].items[{k}]',
                             str(item), limits.get('bullet', 15), 'WARN')

        # Members
        for j, member in enumerate(slide.get('members', [])):
            for field in ['name', 'role', 'org']:
                _check_text(issues, sn, f'members[{j}].{field}',
                             member.get(field, ''), limits.get('table_cell', 12), 'WARN')

    # --- Check 3: Layout diversity ---
    issues.extend(_check_layout_diversity(slides))

    # --- Check 4: Sparse slides ---
    issues.extend(_check_sparse_slides(slides))

    # --- Check 5: Cross-slide consistency ---
    issues.extend(_check_cross_slide_consistency(slides))

    # --- Check 6: Consecutive same layouts ---
    max_consec = layout_rules.get('max_consecutive_same', 2)
    issues.extend(_check_consecutive_layouts(slides, max_consec))

    # --- Check 7: Visual variety ---
    min_visual = layout_rules.get('min_visual_slides', 4)
    issues.extend(_check_visual_variety(slides, min_visual))

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
                      f'"{issue["value"]}" ({issue["visual_len"]} chars > {issue["limit"]} limit)')
            else:
                print(f'[FAIL] {issue.get("message", issue)}')
        for issue in warns:
            if issue['type'] == 'text_overflow':
                print(f'[WARN] Slide {issue["slide"]} {issue["field"]}: '
                      f'"{issue["value"]}" ({issue["visual_len"]} chars > {issue["limit"]} limit)')
            elif 'message' in issue:
                print(f'[WARN] {issue["message"]}')

    print(f'\nFails: {len(fails)}')
    print(f'Warnings: {len(warns)}')
    print(f'Status: {"FAIL" if fails else "PASS"}')
    return len(fails) == 0


def main():
    parser = argparse.ArgumentParser(description='Validate slide-content.json')
    parser.add_argument('--content', required=True, help='Path to slide-content.json')
    parser.add_argument('--limits', help='Path to JSON file with text limits')
    parser.add_argument('--deck-yaml', help='Path to deck.yaml for layout_rules and text_limits')
    parser.add_argument('--expected-slides', type=int, help='Expected number of slides')
    args = parser.parse_args()

    if not os.path.exists(args.content):
        print(f'[FAIL] File not found: {args.content}')
        sys.exit(1)

    with open(args.content, encoding='utf-8') as f:
        content = json.load(f)

    limits = DEFAULT_LIMITS
    layout_rules = {}

    # Load from deck.yaml if provided
    if args.deck_yaml and os.path.exists(args.deck_yaml):
        try:
            import yaml
            with open(args.deck_yaml, encoding='utf-8') as f:
                deck_cfg = yaml.safe_load(f)
            if deck_cfg.get('text_limits'):
                limits = {**DEFAULT_LIMITS, **deck_cfg['text_limits']}
            if deck_cfg.get('layout_rules'):
                layout_rules = deck_cfg['layout_rules']
        except ImportError:
            pass  # yaml not available, skip

    # Override with explicit limits file
    if args.limits and os.path.exists(args.limits):
        with open(args.limits, encoding='utf-8') as f:
            limits = {**limits, **json.load(f)}

    issues = validate(content, limits, args.expected_slides, layout_rules)
    passed = print_report(issues, len(content.get('slides', [])))
    sys.exit(0 if passed else 1)


if __name__ == '__main__':
    main()
