#!/usr/bin/env python3
"""SVG component library for publication-quality diagram generation.

Provides reusable SVG fragments with consistent styling for:
- Phase nodes (pill-shaped, V-Model items)
- AI badges, arrows, traceability lines
- Phase groups, legends, trigger pills
- Text blocks with Korean/English bilingual support

Usage:
    from svg_components import SVGBuilder

    svg = SVGBuilder(width=1100, height=920, title="My Diagram")
    svg.add(rounded_rect(55, 82, 190, 70, rx=35, fill=COLORS['collect_fill'],
                         stroke=COLORS['collect_stroke'], label="Collect", sublabel="차량 데이터 수집"))
    svg.add(ai_badge(268, 331))
    svg.add(arrow(245, 117, 365, 117))
    html = svg.to_html()
"""

import json
import sys
from dataclasses import dataclass, field
from typing import Optional

# ── Color Palette ──────────────────────────────────────────────

COLORS = {
    # Phase fills
    'collect_fill': '#d4edda', 'collect_stroke': '#28a745',
    'analyze_fill': '#d6eaf8', 'analyze_stroke': '#5dade2',
    'develop_fill': '#d6c8f0', 'develop_stroke': '#8e44ad',
    'verify_fill': '#fef9e7', 'verify_stroke': '#f39c12',
    'report_fill': '#fce4ec', 'report_stroke': '#e74c3c',
    'deploy_fill': '#fce4ec', 'deploy_stroke': '#e74c3c',
    # Spec/Verification in V-Model
    'spec_fill': '#d6eaf8', 'spec_stroke': '#5dade2',
    'verif_fill': '#d4edda', 'verif_stroke': '#28a745',
    # Special
    'ai_badge': '#5b5fc7',
    'traceability': '#8d6e63',
    'trigger_stroke': '#999',
    'error': '#d63031',
    'success': '#28a745',
    # Text
    'title': '#1a1a2e',
    'subtitle': '#555',
    'detail': '#777',
    'white': '#ffffff',
}

# ── Font Stack ─────────────────────────────────────────────────

FONT = "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
FONT_MONO = "'SF Mono', 'Fira Code', monospace"

# ── Standard Defs ──────────────────────────────────────────────

STANDARD_DEFS = """
  <defs>
    <marker id="arrow" viewBox="0 0 10 7" refX="9" refY="3.5"
            markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#555"/>
    </marker>
    <marker id="arrow-red" viewBox="0 0 10 7" refX="9" refY="3.5"
            markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#d63031"/>
    </marker>
    <marker id="arrow-green" viewBox="0 0 10 7" refX="9" refY="3.5"
            markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#00b894"/>
    </marker>
    <marker id="arrow-brown" viewBox="0 0 10 7" refX="9" refY="3.5"
            markerWidth="8" markerHeight="6" orient="auto-start-reverse">
      <polygon points="0 0, 10 3.5, 0 7" fill="#8d6e63"/>
    </marker>
    <filter id="shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.12"/>
    </filter>
  </defs>
"""

# ── SVG Component Functions ────────────────────────────────────

def _esc(text: str) -> str:
    """XML-escape text."""
    return text.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;').replace('"', '&quot;')


def rounded_rect(x: float, y: float, w: float, h: float,
                 rx: float = 8, fill: str = '#fff', stroke: str = '#999',
                 stroke_width: float = 1.5, shadow: bool = True,
                 label: str = '', sublabel: str = '',
                 label_size: int = 20, sublabel_size: int = 12) -> str:
    """Rounded rectangle with optional centered label + sublabel."""
    f = ' filter="url(#shadow)"' if shadow else ''
    parts = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"{f}/>'
    ]
    if label:
        cy = y + h / 2 - (8 if sublabel else 0)
        parts.append(
            f'<text x="{x + w/2}" y="{cy + 6}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="{label_size}" font-weight="700" '
            f'fill="{COLORS["title"]}">{_esc(label)}</text>'
        )
    if sublabel:
        cy = y + h / 2 + label_size * 0.6
        parts.append(
            f'<text x="{x + w/2}" y="{cy}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="{sublabel_size}" '
            f'fill="{COLORS["subtitle"]}">{_esc(sublabel)}</text>'
        )
    return '\n  '.join(parts)


def pill(x: float, y: float, w: float, h: float,
         fill: str = 'none', stroke: str = '#999',
         stroke_width: float = 1.2, label: str = '',
         label_color: str = '#555', font_size: int = 13) -> str:
    """Pill-shaped element (rx = h/2)."""
    rx = h / 2
    parts = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="{stroke_width}"/>'
    ]
    if label:
        parts.append(
            f'<text x="{x + w/2}" y="{y + h/2 + font_size * 0.35}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="{font_size}" fill="{label_color}">{_esc(label)}</text>'
        )
    return '\n  '.join(parts)


def ai_badge(cx: float, cy: float, r: float = 12) -> str:
    """Purple AI badge circle with 'AI' text."""
    return (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{COLORS["ai_badge"]}"/>\n'
        f'  <text x="{cx}" y="{cy + 4}" text-anchor="middle" '
        f'font-family="sans-serif" font-size="9" font-weight="700" fill="#fff">AI</text>'
    )


def arrow(x1: float, y1: float, x2: float, y2: float,
          style: str = 'solid', color: str = '#555',
          stroke_width: float = 1.8, marker: str = 'arrow') -> str:
    """Line with arrow marker. style: solid | dashed."""
    dash = ' stroke-dasharray="6,3"' if style == 'dashed' else ''
    return (
        f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" '
        f'stroke="{color}" stroke-width="{stroke_width}"{dash} '
        f'marker-end="url(#{marker})"/>'
    )


def curved_arrow(path_d: str, color: str = '#555',
                 stroke_width: float = 1.5, style: str = 'dashed',
                 marker: str = 'arrow') -> str:
    """Curved path with arrow marker."""
    dash = ' stroke-dasharray="8,4"' if style == 'dashed' else ''
    return (
        f'<path d="{path_d}" fill="none" stroke="{color}" '
        f'stroke-width="{stroke_width}"{dash} marker-end="url(#{marker})"/>'
    )


def traceability_line(x1: float, y1: float, x2: float, y2: float,
                      label: str = '') -> str:
    """Brown dashed traceability line with optional midpoint label."""
    parts = [arrow(x1, y1, x2, y2, style='dashed', color=COLORS['traceability'],
                   stroke_width=1.2, marker='arrow-brown')]
    if label:
        mx, my = (x1 + x2) / 2, (y1 + y2) / 2 - 8
        parts.append(
            f'<text x="{mx}" y="{my}" text-anchor="middle" '
            f'font-family="sans-serif" font-size="10" fill="{COLORS["traceability"]}">{_esc(label)}</text>'
        )
    return '\n  '.join(parts)


def phase_group(x: float, y: float, w: float, h: float,
                label: str = '', stroke: str = '#5dade2',
                stroke_width: float = 1.5, font_size: int = 15) -> str:
    """Dashed rectangle phase grouping with header label."""
    parts = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="12" '
        f'fill="none" stroke="{stroke}" stroke-width="{stroke_width}" stroke-dasharray="8,4"/>'
    ]
    if label:
        parts.append(
            f'<text x="{x + w/2}" y="{y + 27}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="{font_size}" font-weight="700" '
            f'fill="{COLORS["title"]}">{_esc(label)}</text>'
        )
    return '\n  '.join(parts)


def text_block(x: float, y: float, lines: list,
               font_size: int = 11, color: str = '#777',
               anchor: str = 'middle', line_height: float = 14) -> str:
    """Multi-line text block."""
    parts = []
    for i, line in enumerate(lines):
        parts.append(
            f'<text x="{x}" y="{y + i * line_height}" text-anchor="{anchor}" '
            f'font-family="{FONT}" font-size="{font_size}" fill="{color}">{_esc(line)}</text>'
        )
    return '\n  '.join(parts)


def vertical_label(x: float, y: float, text: str,
                   color: str = '#28a745', font_size: int = 12) -> str:
    """Rotated -90deg text for side labels."""
    return (
        f'<text x="{x}" y="{y}" font-family="{FONT}" font-size="{font_size}" '
        f'fill="{color}" font-weight="600" '
        f'transform="rotate(-90, {x}, {y})">{_esc(text)}</text>'
    )


def legend(x: float, y: float, items: list, dot_size: int = 12,
           gap: float = 140, font_size: int = 12) -> str:
    """Horizontal color-coded legend. items: [(color, label), ...]"""
    parts = []
    cx = x
    for color, label in items:
        parts.append(
            f'<rect x="{cx}" y="{y}" width="{dot_size}" height="{dot_size}" '
            f'rx="3" fill="{color}"/>'
        )
        parts.append(
            f'<text x="{cx + dot_size + 6}" y="{y + dot_size - 2}" '
            f'font-family="{FONT}" font-size="{font_size}" fill="#555">{_esc(label)}</text>'
        )
        cx += gap
    return '\n  '.join(parts)


def badge_pill(x: float, y: float, w: float, h: float,
               fill: str = '#d4edda', stroke: str = '#28a745',
               label: str = '', label_color: str = '#28a745') -> str:
    """Small badge pill (e.g., 'CCU1/2 양산', '신규 개발')."""
    rx = h / 2
    parts = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" '
        f'fill="{fill}" stroke="{stroke}" stroke-width="1"/>'
    ]
    if label:
        parts.append(
            f'<text x="{x + w/2}" y="{y + h/2 + 4}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="10" fill="{label_color}" '
            f'font-weight="600">{_esc(label)}</text>'
        )
    return '\n  '.join(parts)


def trigger_pill(x: float, y: float, label: str, w: float = 120, h: float = 32) -> str:
    """Top-row trigger event pill (no fill, gray stroke)."""
    return pill(x, y, w, h, fill='none', stroke=COLORS['trigger_stroke'],
                label=label, label_color=COLORS['subtitle'])


# ── V-Model Specific ──────────────────────────────────────────

def vmodel_spec_item(x: float, y: float, w: float, h: float,
                     label: str, sublabel: str = '',
                     has_ai: bool = True) -> str:
    """V-Model specification side item (blue fill + optional AI badge)."""
    parts = [rounded_rect(x, y, w, h, rx=8,
                          fill=COLORS['spec_fill'], stroke=COLORS['spec_stroke'],
                          label_size=12, shadow=True)]
    # Override label rendering for custom positioning
    parts = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" '
        f'fill="{COLORS["spec_fill"]}" stroke="{COLORS["spec_stroke"]}" '
        f'stroke-width="1.5" filter="url(#shadow)"/>'
    ]
    if has_ai:
        parts.append(ai_badge(x + 18, y + h / 2))
    lx = x + w / 2 + (10 if has_ai else 0)
    parts.append(
        f'<text x="{lx}" y="{y + h/2 - 3}" text-anchor="middle" '
        f'font-family="{FONT}" font-size="12" font-weight="600" '
        f'fill="{COLORS["title"]}">{_esc(label)}</text>'
    )
    if sublabel:
        parts.append(
            f'<text x="{lx}" y="{y + h/2 + 12}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="10" fill="{COLORS["detail"]}">{_esc(sublabel)}</text>'
        )
    return '\n  '.join(parts)


def vmodel_verif_item(x: float, y: float, w: float, h: float,
                      label: str, sublabel: str = '',
                      has_ai: bool = True) -> str:
    """V-Model verification side item (green fill + optional AI badge on right)."""
    parts = [
        f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" '
        f'fill="{COLORS["verif_fill"]}" stroke="{COLORS["verif_stroke"]}" '
        f'stroke-width="1.5" filter="url(#shadow)"/>'
    ]
    lx = x + w / 2 - (10 if has_ai else 0)
    parts.append(
        f'<text x="{lx}" y="{y + h/2 - 3}" text-anchor="middle" '
        f'font-family="{FONT}" font-size="12" font-weight="600" '
        f'fill="{COLORS["title"]}">{_esc(label)}</text>'
    )
    if sublabel:
        parts.append(
            f'<text x="{lx}" y="{y + h/2 + 12}" text-anchor="middle" '
            f'font-family="{FONT}" font-size="10" fill="{COLORS["detail"]}">{_esc(sublabel)}</text>'
        )
    if has_ai:
        parts.append(ai_badge(x + w - 18, y + h / 2))
    return '\n  '.join(parts)


# ── SVGBuilder ─────────────────────────────────────────────────

class SVGBuilder:
    """Accumulates SVG fragments and outputs complete HTML."""

    def __init__(self, width: int = 1100, height: int = 920, title: str = 'Diagram'):
        self.width = width
        self.height = height
        self.title = title
        self.fragments: list[str] = []

    def add(self, fragment: str) -> 'SVGBuilder':
        self.fragments.append(fragment)
        return self

    def add_comment(self, text: str) -> 'SVGBuilder':
        self.fragments.append(f'\n  <!-- {text} -->')
        return self

    def to_svg(self) -> str:
        body = '\n  '.join(self.fragments)
        return (
            f'<svg viewBox="0 0 {self.width} {self.height}" '
            f'width="{self.width}" height="{self.height}" '
            f'xmlns="http://www.w3.org/2000/svg">\n'
            f'{STANDARD_DEFS}\n'
            f'  {body}\n'
            f'</svg>'
        )

    def to_html(self) -> str:
        return (
            '<!DOCTYPE html>\n'
            '<html lang="ko">\n'
            '<head>\n'
            '<meta charset="UTF-8">\n'
            f'<title>{_esc(self.title)}</title>\n'
            '<style>\n'
            '  body { margin: 0; background: #fff; '
            f"font-family: {FONT}; " + '}\n'
            '  svg { display: block; margin: 0 auto; }\n'
            '  @media print { body { margin: 0; } }\n'
            '</style>\n'
            '</head>\n'
            '<body>\n'
            f'{self.to_svg()}\n'
            '</body>\n'
            '</html>'
        )


# ── Self-test ──────────────────────────────────────────────────

def _self_test():
    """Quick validation that components render without errors."""
    tests = [
        ('rounded_rect', rounded_rect(0, 0, 200, 70, rx=35, fill='#d4edda', stroke='#28a745',
                                       label='Test', sublabel='서브라벨')),
        ('pill', pill(0, 0, 120, 32, label='Trigger')),
        ('ai_badge', ai_badge(50, 50)),
        ('arrow_solid', arrow(0, 0, 100, 0)),
        ('arrow_dashed', arrow(0, 0, 100, 0, style='dashed', color='#d63031')),
        ('traceability_line', traceability_line(0, 0, 200, 0, label='↔ traceability')),
        ('phase_group', phase_group(0, 0, 400, 300, label='Test Phase')),
        ('text_block', text_block(100, 100, ['Line 1', 'Line 2', '한국어'])),
        ('vertical_label', vertical_label(10, 200, 'Field monitoring')),
        ('legend', legend(10, 10, [('#28a745', 'Collect'), ('#5dade2', 'Analyze')])),
        ('badge_pill', badge_pill(0, 0, 90, 22, label='CCU1/2 양산')),
        ('trigger_pill', trigger_pill(0, 0, 'Field issue')),
        ('vmodel_spec', vmodel_spec_item(0, 0, 190, 42, 'SYS.2 시스템 요구사항', 'System Req')),
        ('vmodel_verif', vmodel_verif_item(0, 0, 190, 42, 'SWE.6 SW 검증', 'SW Qual Test')),
        ('curved_arrow', curved_arrow('M 30 685 Q -20 400 30 152', color='#28a745')),
    ]

    ok = 0
    for name, svg in tests:
        if '<' in svg and '>' in svg:
            ok += 1
        else:
            print(f"FAIL: {name} — no valid SVG tags", file=sys.stderr)

    # Test SVGBuilder
    builder = SVGBuilder(400, 200, 'Self-Test')
    builder.add(rounded_rect(10, 10, 180, 60, label='Hello'))
    builder.add(ai_badge(200, 40))
    html = builder.to_html()
    if '<!DOCTYPE html>' in html and '<svg' in html:
        ok += 1
    else:
        print("FAIL: SVGBuilder.to_html()", file=sys.stderr)

    total = len(tests) + 1
    print(f"svg_components self-test: {ok}/{total} passed")
    if ok == total:
        print("All components OK")
    return 0 if ok == total else 1


if __name__ == '__main__':
    if '--help' in sys.argv:
        print(__doc__)
        print("\nAvailable components:")
        print("  rounded_rect, pill, ai_badge, arrow, curved_arrow,")
        print("  traceability_line, phase_group, text_block, vertical_label,")
        print("  legend, badge_pill, trigger_pill, vmodel_spec_item, vmodel_verif_item")
        print("  SVGBuilder (accumulator → HTML output)")
        print("\nColor constants: COLORS dict")
        print("Font constants: FONT, FONT_MONO")
        print("\nRun without args for self-test.")
    else:
        sys.exit(_self_test())
