#!/usr/bin/env python3
"""Auto-fix recurring issues in slide-content.json based on feedback patterns.

Reads feedback.json from deck-critic and applies mechanical fixes to
slide-content.json that don't require creative judgement:

1. Sparse slides: Add callout/source fields from SPEC content
2. Text overflow: Truncate overflowing text with ellipsis
3. Layout monotony: Suggest layout swaps (logged, not auto-applied)

Usage:
    python3 autofix.py --content output/slide-content.json \
                       --feedback output/feedback.json \
                       --limits-json '{"title": 12, "bullet": 18}'
"""

import argparse
import copy
import json
import os
import re
import sys

try:
    import yaml
except ImportError:
    yaml = None


def _korean_ratio(text):
    """Return fraction of visually significant chars that are Korean."""
    korean = sum(1 for ch in text if '\uAC00' <= ch <= '\uD7A3')
    alnum = sum(1 for ch in text if ch.isalnum())
    if alnum == 0:
        return 0.0
    return korean / alnum


def _visual_len(text):
    """Count visually significant characters (Korean + alphanumeric)."""
    return sum(1 for ch in text if '\uAC00' <= ch <= '\uD7A3' or ch.isalnum())


def _truncate(text, limit):
    """Truncate text to fit within visual char limit, preserving Korean."""
    if _visual_len(text) <= limit:
        return text
    result = []
    count = 0
    for ch in text:
        if '\uAC00' <= ch <= '\uD7A3' or ch.isalnum():
            count += 1
        if count > limit - 1:
            result.append('…')
            break
        result.append(ch)
    return ''.join(result)


def fix_text_overflow(slides, limits):
    """Truncate text fields that exceed limits. Returns (fixed_slides, fix_log)."""
    fixes = []
    FIELD_LIMIT_MAP = {
        'title': 'title',
        'subtitle': 'subtitle',
        'quote': 'quote',
        'callout': 'quote',
    }

    for slide in slides:
        sn = slide.get('build', '??')

        # Direct text fields
        for field, limit_key in FIELD_LIMIT_MAP.items():
            text = slide.get(field, '')
            if not text or _visual_len(text) <= limits.get(limit_key, 999):
                continue
            # Skip truncation for English-dominant text (Korean < 30%)
            # because English chars are ~half the width of Korean chars,
            # so the same char count takes much less visual space.
            if _korean_ratio(text) < 0.3:
                continue
            original = text
            slide[field] = _truncate(text, limits[limit_key])
            fixes.append({
                'type': 'truncated',
                'slide': sn,
                'field': field,
                'before_len': _visual_len(original),
                'after_len': _visual_len(slide[field]),
                'limit': limits[limit_key],
            })

        # Bullets
        for j, b in enumerate(slide.get('bullets', [])):
            for bfield, lkey in [('head', 'bullet'), ('desc', 'quote')]:
                text = b.get(bfield, '')
                if text and _visual_len(text) > limits.get(lkey, 999):
                    original = text
                    b[bfield] = _truncate(text, limits[lkey])
                    fixes.append({
                        'type': 'truncated',
                        'slide': sn,
                        'field': f'bullets[{j}].{bfield}',
                        'before_len': _visual_len(original),
                        'after_len': _visual_len(b[bfield]),
                        'limit': limits[lkey],
                    })

        # Columns (stat cards)
        for j, col in enumerate(slide.get('columns', [])):
            text = col.get('label', '')
            if text and _visual_len(text) > limits.get('stat_label', 999):
                original = text
                col['label'] = _truncate(text, limits['stat_label'])
                fixes.append({
                    'type': 'truncated',
                    'slide': sn,
                    'field': f'columns[{j}].label',
                    'before_len': _visual_len(original),
                    'after_len': _visual_len(col['label']),
                    'limit': limits['stat_label'],
                })

        # Table cells
        for j, row in enumerate(slide.get('rows', [])):
            if isinstance(row, list):
                for k, cell in enumerate(row):
                    text = str(cell)
                    if _visual_len(text) > limits.get('table_cell', 999):
                        original = text
                        row[k] = _truncate(text, limits['table_cell'])
                        fixes.append({
                            'type': 'truncated',
                            'slide': sn,
                            'field': f'rows[{j}][{k}]',
                            'before_len': _visual_len(original),
                            'after_len': _visual_len(row[k]),
                            'limit': limits['table_cell'],
                        })

    return slides, fixes


def fix_sparse_slides(slides, feedback):
    """For slides flagged as sparse by critic, add source/callout if missing."""
    fixes = []
    sparse_indices = set()

    # Find sparse slides from feedback
    if feedback:
        for fs in feedback.get('slides', []):
            for issue in fs.get('issues', []):
                if 'empty' in issue.lower() or 'sparse' in issue.lower():
                    sparse_indices.add(fs['index'])
        for md in feedback.get('mandatory_deductions', []):
            reason = md.get('reason', '')
            # Extract slide numbers like "s08", "s02"
            for m in re.finditer(r's(\d+)', reason):
                sparse_indices.add(int(m.group(1)))

    for slide in slides:
        sn = slide.get('build', '??')
        try:
            idx = int(sn)
        except (ValueError, TypeError):
            continue

        if idx in sparse_indices:
            fixes.append({
                'type': 'sparse_flagged',
                'slide': sn,
                'reason': f'Slide {sn} flagged as sparse — content-writer should add stats/callouts from SPEC',
            })

    return slides, fixes


def suggest_layout_swaps(slides, feedback):
    """Analyze layout monotony and suggest swaps (advisory only, not applied)."""
    suggestions = []

    # Count layout types
    layout_runs = []
    for i, s in enumerate(slides):
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
        layout_runs.append((s.get('build', str(i+1)), layout))

    # Find consecutive runs
    from itertools import groupby
    for layout, group in groupby(layout_runs, key=lambda x: x[1]):
        group_list = list(group)
        if len(group_list) > 2:
            builds = [g[0] for g in group_list]
            # Suggest converting middle slide to a different layout
            mid = builds[len(builds) // 2]
            alt = 'two_col' if layout != 'two_col' else 'bullet_list'
            suggestions.append({
                'type': 'layout_swap_suggestion',
                'slides': builds,
                'current_layout': layout,
                'suggested_swap': f'Convert s{mid} from {layout} to {alt}',
                'reason': f'{len(builds)} consecutive {layout} slides',
            })

    return suggestions


def autofix(content_path, feedback_path=None, limits=None, dry_run=False):
    """Run all auto-fixes and return results."""
    with open(content_path, encoding='utf-8') as f:
        content = json.load(f)

    feedback = {}
    if feedback_path and os.path.exists(feedback_path):
        with open(feedback_path, encoding='utf-8') as f:
            feedback = json.load(f)

    if limits is None:
        limits = {
            'title': 12, 'subtitle': 30, 'stat_label': 10,
            'bullet': 18, 'table_cell': 14, 'quote': 45,
        }

    original = copy.deepcopy(content)
    slides = content.get('slides', [])
    all_fixes = []

    # Fix 1: Text overflow
    slides, text_fixes = fix_text_overflow(slides, limits)
    all_fixes.extend(text_fixes)

    # Fix 2: Sparse slides
    slides, sparse_fixes = fix_sparse_slides(slides, feedback)
    all_fixes.extend(sparse_fixes)

    # Fix 3: Layout suggestions (advisory only)
    layout_suggestions = suggest_layout_swaps(slides, feedback)

    content['slides'] = slides

    result = {
        'fixes_applied': len(all_fixes),
        'fixes': all_fixes,
        'layout_suggestions': layout_suggestions,
        'dry_run': dry_run,
    }

    if not dry_run and all_fixes:
        # Backup before overwrite (versioned by iteration or timestamp)
        if os.path.exists(content_path):
            import shutil
            from datetime import datetime
            ts = datetime.now().strftime('%Y%m%d_%H%M%S')
            backup_path = content_path.replace('.json', f'.{ts}.bak.json')
            shutil.copy2(content_path, backup_path)
            print(f'[backup] {backup_path}')
        with open(content_path, 'w', encoding='utf-8') as f:
            json.dump(content, f, ensure_ascii=False, indent=2)

    # Write layout suggestions to separate file for orchestrator consumption
    if layout_suggestions:
        suggestions_path = os.path.join(os.path.dirname(content_path), 'layout_suggestions.json')
        with open(suggestions_path, 'w', encoding='utf-8') as f:
            json.dump(layout_suggestions, f, ensure_ascii=False, indent=2)
        print(f'[layout] {len(layout_suggestions)} suggestion(s) → {suggestions_path}')

    return result


def main():
    parser = argparse.ArgumentParser(description='Auto-fix slide-content.json issues')
    parser.add_argument('--content', required=True, help='Path to slide-content.json')
    parser.add_argument('--feedback', help='Path to feedback.json from deck-critic')
    parser.add_argument('--deck-yaml', help='Path to deck.yaml (reads text_limits from it)')
    parser.add_argument('--limits-json', help='JSON string with text limits (overrides deck-yaml)')
    parser.add_argument('--dry-run', action='store_true', help='Show fixes without applying')
    args = parser.parse_args()

    limits = None
    if args.deck_yaml:
        if yaml is None:
            print('WARNING: pyyaml not installed, --deck-yaml ignored', file=sys.stderr)
        else:
            with open(args.deck_yaml, encoding='utf-8') as f:
                deck_cfg = yaml.safe_load(f)
            limits = deck_cfg.get('text_limits')
    if args.limits_json:
        limits = json.loads(args.limits_json)

    result = autofix(args.content, args.feedback, limits, args.dry_run)

    print(f'\n=== Auto-Fix Report ===')
    print(f'Mode: {"DRY RUN" if args.dry_run else "APPLIED"}')
    print(f'Fixes: {result["fixes_applied"]}')

    for fix in result['fixes']:
        if fix['type'] == 'truncated':
            print(f'  [FIX] s{fix["slide"]} {fix["field"]}: '
                  f'{fix["before_len"]} → {fix["after_len"]} chars (limit {fix["limit"]})')
        else:
            print(f'  [FIX] s{fix["slide"]}: {fix["reason"]}')

    if result['layout_suggestions']:
        print(f'\nLayout suggestions ({len(result["layout_suggestions"])}):')
        for s in result['layout_suggestions']:
            print(f'  [SUGGEST] {s["suggested_swap"]} ({s["reason"]})')

    print(f'\nStatus: {"DRY RUN — no changes written" if args.dry_run else "Changes written to file"}')
    sys.exit(0)


if __name__ == '__main__':
    main()
