#!/usr/bin/env python3
"""Error Registry — accumulates errors across deck refine iterations.

Three responsibilities:
1. CLASSIFY: Parse feedback.json issues into error patterns
2. ACCUMULATE: Merge into project-level error-registry.json
3. PROMOTE: When a pattern recurs 3+ times, promote to known-bugs.json

Usage:
    # After each critic run:
    python3 error_registry.py \
        --feedback output/feedback.json \
        --registry output/error-registry.json \
        --known-bugs scripts/gslides/known-bugs.json

    # Check recurring patterns (read-only):
    python3 error_registry.py \
        --registry output/error-registry.json \
        --report
"""

import argparse
import hashlib
import json
import os
import re
import sys
from datetime import date


# Pattern classifiers: map feedback text to error pattern IDs
PATTERN_RULES = [
    {
        'id': 'empty_space',
        'keywords': ['empty', 'blank', 'sparse', 'white space', '공백', 'unused'],
        'component': 'slides.py',
        'severity': 'high',
    },
    {
        'id': 'text_overflow',
        'keywords': ['overflow', 'wrapping', 'wrap', 'truncat', 'cut off', '잘림'],
        'component': 'validate.py',
        'severity': 'medium',
    },
    {
        'id': 'layout_monotony',
        'keywords': ['monoton', 'repetit', 'same layout', 'pattern fatigue', 'identical'],
        'component': 'slide-planner',
        'severity': 'high',
    },
    {
        'id': 'missing_visual',
        'keywords': ['chart', 'diagram', 'visual element', 'zero chart', 'no chart', 'no diagram'],
        'component': 'gslides-toolkit',
        'severity': 'high',
    },
    {
        'id': 'missing_context',
        'keywords': ['so what', 'context', 'without context', 'no comparison', 'buried',
                     'footnote', 'invisible', '맥락'],
        'component': 'content-writer',
        'severity': 'high',
    },
    {
        'id': 'inconsistent_terminology',
        'keywords': ['inconsisten', 'mismatch', 'different header', 'terminology'],
        'component': 'content-writer',
        'severity': 'low',
    },
    {
        'id': 'title_truncation',
        'keywords': ['truncat', '…', 'ellipsis', 'title cut'],
        'component': 'autofix.py',
        'severity': 'high',
    },
    {
        'id': 'tiny_text_projection',
        'keywords': ['unreadable', 'tiny', 'small font', '3m', 'projection', 'caption', 'FONT_CAPTION'],
        'component': 'slides.py',
        'severity': 'medium',
    },
    {
        'id': 'color_inconsistency',
        'keywords': ['color', 'colour', 'inconsistent color', 'accent'],
        'component': 'slides.py',
        'severity': 'low',
    },
    {
        'id': 'alignment_issue',
        'keywords': ['align', 'misalign', 'off-grid', 'uneven gap', 'orphan'],
        'component': 'slides.py',
        'severity': 'medium',
    },
]


def classify_issue(issue_text):
    """Match issue text against known patterns. Returns pattern ID or 'unknown'."""
    text_lower = issue_text.lower()
    for rule in PATTERN_RULES:
        for kw in rule['keywords']:
            if kw.lower() in text_lower:
                return rule['id'], rule['component'], rule['severity']
    return 'unknown', 'unknown', 'low'


def extract_issues_from_feedback(feedback):
    """Parse feedback.json and extract all issues with classifications."""
    issues = []
    iteration = feedback.get('iteration', 0)

    # From per-slide issues
    for slide_fb in feedback.get('slides', []):
        slide_idx = slide_fb.get('index', '?')
        for issue_text in slide_fb.get('issues', []):
            pattern_id, component, severity = classify_issue(issue_text)
            issues.append({
                'pattern': pattern_id,
                'component': component,
                'severity': severity,
                'slide': slide_idx,
                'text': issue_text[:120],
                'iteration': iteration,
            })

    # From mandatory deductions
    for md in feedback.get('mandatory_deductions', []):
        reason = md.get('reason', '')
        pattern_id, component, severity = classify_issue(reason)
        issues.append({
            'pattern': pattern_id,
            'component': component,
            'severity': severity,
            'slide': None,
            'text': reason[:120],
            'iteration': iteration,
        })

    # From design principle violations
    for dpv in feedback.get('design_principles_violated', []):
        pattern_id, component, severity = classify_issue(dpv)
        issues.append({
            'pattern': pattern_id,
            'component': component,
            'severity': severity,
            'slide': None,
            'text': dpv[:120],
            'iteration': iteration,
        })

    return issues


def load_registry(path):
    """Load existing registry or create empty one."""
    if path and os.path.exists(path):
        with open(path, encoding='utf-8') as f:
            return json.load(f)
    return {
        'version': 1,
        'created': str(date.today()),
        'patterns': {},
    }


def _feedback_hash(feedback):
    """Compute a hash of feedback content for deduplication."""
    canonical = json.dumps(feedback, sort_keys=True, ensure_ascii=False)
    return hashlib.md5(canonical.encode()).hexdigest()


def is_already_ingested(registry, feedback):
    """Check if this feedback has already been ingested."""
    h = _feedback_hash(feedback)
    ingested = registry.get('ingested_hashes', [])
    return h in ingested


def mark_ingested(registry, feedback):
    """Record that this feedback has been ingested."""
    h = _feedback_hash(feedback)
    ingested = registry.setdefault('ingested_hashes', [])
    if h not in ingested:
        ingested.append(h)


def update_registry(registry, issues):
    """Merge new issues into the registry, incrementing occurrence counts."""
    patterns = registry.setdefault('patterns', {})

    for issue in issues:
        pid = issue['pattern']
        if pid not in patterns:
            patterns[pid] = {
                'pattern': pid,
                'component': issue['component'],
                'severity': issue['severity'],
                'first_seen_iter': issue['iteration'],
                'last_seen_iter': issue['iteration'],
                'occurrences': 0,
                'slides_affected': [],
                'sample_texts': [],
                'status': 'open',
                'fix_applied': None,
            }

        entry = patterns[pid]
        entry['occurrences'] += 1
        entry['last_seen_iter'] = max(entry['last_seen_iter'], issue['iteration'])
        if issue['slide'] and issue['slide'] not in entry['slides_affected']:
            entry['slides_affected'].append(issue['slide'])
        if len(entry['sample_texts']) < 3 and issue['text'] not in entry['sample_texts']:
            entry['sample_texts'].append(issue['text'])
        # Escalate severity if recurring
        if entry['occurrences'] >= 3 and entry['severity'] != 'critical':
            entry['severity'] = 'high'
        if entry['occurrences'] >= 5:
            entry['severity'] = 'critical'

    registry['last_updated'] = str(date.today())
    return registry


def check_promotions(registry, known_bugs_path):
    """Find patterns with 3+ occurrences not yet in known-bugs.json."""
    promotions = []
    known_bug_patterns = set()

    if known_bugs_path and os.path.exists(known_bugs_path):
        with open(known_bugs_path, encoding='utf-8') as f:
            known = json.load(f)
        for bug in known.get('bugs', []):
            # Extract pattern from bug description/id
            known_bug_patterns.add(bug.get('pattern', ''))

    for pid, entry in registry.get('patterns', {}).items():
        if entry['occurrences'] >= 3 and pid not in known_bug_patterns and entry['status'] == 'open':
            promotions.append({
                'pattern': pid,
                'component': entry['component'],
                'severity': entry['severity'],
                'occurrences': entry['occurrences'],
                'first_seen': entry['first_seen_iter'],
                'last_seen': entry['last_seen_iter'],
                'sample': entry['sample_texts'][0] if entry['sample_texts'] else '',
                'recommendation': f'Add to known-bugs.json and implement fix in {entry["component"]}',
            })

    return promotions


def promote_to_known_bugs(promotions, known_bugs_path):
    """Append promoted patterns to known-bugs.json."""
    if not promotions or not known_bugs_path:
        return 0

    if os.path.exists(known_bugs_path):
        with open(known_bugs_path, encoding='utf-8') as f:
            known = json.load(f)
    else:
        known = {'version': 1, 'last_updated': str(date.today()), 'bugs': []}

    existing_patterns = {b.get('pattern', '') for b in known.get('bugs', [])}
    added = 0

    for promo in promotions:
        if promo['pattern'] in existing_patterns:
            continue
        bug_id = f"BUG-{len(known['bugs']) + 1:03d}"
        known['bugs'].append({
            'id': bug_id,
            'component': promo['component'],
            'pattern': promo['pattern'],
            'description': f"Recurring error ({promo['occurrences']}x across iterations {promo['first_seen']}-{promo['last_seen']}): {promo['sample']}",
            'severity': promo['severity'],
            'fix': None,
            'fixed_in': None,
            'prevention_rule': f"Auto-promoted from error registry. Needs manual fix in {promo['component']}.",
        })
        added += 1

    if added:
        known['last_updated'] = str(date.today())
        with open(known_bugs_path, 'w', encoding='utf-8') as f:
            json.dump(known, f, ensure_ascii=False, indent=2)

    return added


def get_active_warnings(registry, known_bugs_path=None):
    """Get active warnings for injection into agent prompts.

    Returns list of strings that deck-orchestrator can inject into
    content-writer/slide-planner Task prompts as "known issues to avoid".
    """
    warnings = []
    known_fixes = {}

    if known_bugs_path and os.path.exists(known_bugs_path):
        with open(known_bugs_path, encoding='utf-8') as f:
            known = json.load(f)
        for bug in known.get('bugs', []):
            if bug.get('prevention_rule'):
                known_fixes[bug['pattern']] = bug['prevention_rule']

    for pid, entry in registry.get('patterns', {}).items():
        if entry['status'] == 'open' and entry['occurrences'] >= 2:
            rule = known_fixes.get(pid, f'Pattern "{pid}" has recurred {entry["occurrences"]}x — review and fix.')
            warnings.append({
                'pattern': pid,
                'component': entry['component'],
                'occurrences': entry['occurrences'],
                'warning': rule,
            })

    return warnings


def print_report(registry, known_bugs_path=None):
    """Print human-readable registry report."""
    patterns = registry.get('patterns', {})
    if not patterns:
        print('\n=== Error Registry: Empty ===')
        return

    print(f'\n=== Error Registry Report ===')
    print(f'Patterns tracked: {len(patterns)}')
    print(f'Last updated: {registry.get("last_updated", "?")}')
    print()

    # Sort by occurrences descending
    sorted_patterns = sorted(patterns.values(), key=lambda p: -p['occurrences'])

    for p in sorted_patterns:
        status_icon = '✓' if p['status'] == 'fixed' else '⚠' if p['occurrences'] >= 3 else '·'
        print(f'  {status_icon} [{p["severity"].upper():8s}] {p["pattern"]} '
              f'({p["occurrences"]}x, iter {p["first_seen_iter"]}-{p["last_seen_iter"]}) '
              f'— {p["component"]}')
        if p['status'] == 'fixed':
            print(f'    Fixed: {p["fix_applied"]}')
        elif p['sample_texts']:
            print(f'    Sample: {p["sample_texts"][0][:80]}')

    # Promotion candidates
    promotions = check_promotions(registry, known_bugs_path)
    if promotions:
        print(f'\n⚠ {len(promotions)} pattern(s) ready for promotion to known-bugs.json:')
        for promo in promotions:
            print(f'  → {promo["pattern"]} ({promo["occurrences"]}x) in {promo["component"]}')

    # Active warnings for agents
    warnings = get_active_warnings(registry, known_bugs_path)
    if warnings:
        print(f'\n📋 {len(warnings)} active warning(s) for agent injection:')
        for w in warnings:
            print(f'  [{w["component"]}] {w["warning"][:80]}')


def main():
    parser = argparse.ArgumentParser(description='Error Registry for deck pipeline')
    parser.add_argument('--feedback', help='Path to feedback.json (input)')
    parser.add_argument('--registry', help='Path to error-registry.json (read/write)')
    parser.add_argument('--known-bugs', help='Path to known-bugs.json (read/write)')
    parser.add_argument('--report', action='store_true', help='Print registry report')
    parser.add_argument('--promote', action='store_true', help='Auto-promote 3+ patterns to known-bugs')
    parser.add_argument('--warnings-json', action='store_true',
                        help='Output active warnings as JSON (for agent injection)')
    args = parser.parse_args()

    registry = load_registry(args.registry)

    # Ingest new feedback
    if args.feedback:
        if not os.path.exists(args.feedback):
            print(f'[ERROR] Feedback file not found: {args.feedback}', file=sys.stderr)
            sys.exit(1)
        with open(args.feedback, encoding='utf-8') as f:
            feedback = json.load(f)
        # Deduplication: skip if already ingested
        if is_already_ingested(registry, feedback):
            print(f'[SKIP] Feedback already ingested (duplicate hash). Iteration {feedback.get("iteration", "?")}')
        else:
            issues = extract_issues_from_feedback(feedback)
            registry = update_registry(registry, issues)
            mark_ingested(registry, feedback)
            if args.registry:
                with open(args.registry, 'w', encoding='utf-8') as f:
                    json.dump(registry, f, ensure_ascii=False, indent=2)
                print(f'Ingested {len(issues)} issues from iteration {feedback.get("iteration", "?")}')

    # Auto-promote
    if args.promote and args.known_bugs:
        promotions = check_promotions(registry, args.known_bugs)
        if promotions:
            added = promote_to_known_bugs(promotions, args.known_bugs)
            print(f'Promoted {added} pattern(s) to {args.known_bugs}')
        else:
            print('No patterns ready for promotion')

    # Output warnings JSON
    if args.warnings_json:
        warnings = get_active_warnings(registry, args.known_bugs)
        print(json.dumps(warnings, ensure_ascii=False, indent=2))
        return

    # Report
    if args.report:
        print_report(registry, args.known_bugs)

    sys.exit(0)


if __name__ == '__main__':
    main()
