#!/usr/bin/env python3
"""
AI Architect Academy — 10-Case Portfolio Deck (s01-s27).

Reads slide-content.json and generates Google Slides via the gslides toolkit.
Layout code is project-specific; primitives come from scripts.gslides.
"""

import json
import os
import sys

# Add project root to path for scripts.gslides imports
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))

from scripts.gslides.grid import (
    SW, SH, emu, MARGIN_L, CONTENT_W,
    COL2_W, COL3_W, COL4_W,
    CARD_PAD,
    col2, col3, col4,
    FONT_TITLE, FONT_CARD_TITLE, FONT_BODY, FONT_CAPTION,
    FONT_STAT_BIG, FONT_STAT_MED, FONT_LABEL,
)
from scripts.gslides.primitives import (
    uid, tb, rect, rrect, card, section_header, _sh, _img, _fi,
)
from scripts.gslides.themes import NAVY_CORAL
from scripts.gslides.api_client import generate

# === Theme colors ===
T = NAVY_CORAL
PRIMARY = T.colors['primary']
ACCENT = T.colors['accent']
WHITE = T.colors['white']
DARK_GRAY = T.colors['dark_gray']
LIGHT_GRAY = T.colors['light_gray']
MID_GRAY = T.colors['mid_gray']
NAVY_LIGHT = T.colors['navy_light']
SHADOW = T.colors['shadow']
ACCENT_LIGHT = T.colors['accent_light']
GREEN_SOFT = T.colors['green_soft']
FONT = T.font

# ============================================================
# SHARED HELPERS
# ============================================================

def _slide_header(pid, num, title):
    """Consistent slide header."""
    r = []
    if num:
        r += rrect(pid, MARGIN_L, emu(0.28), emu(0.55), emu(0.35), ACCENT)
        r += tb(pid, MARGIN_L, emu(0.30), emu(0.55), emu(0.3), num, 14, ACCENT, True, 'CENTER')
        r += tb(pid, emu(1.2), emu(0.28), emu(8), emu(0.4), title, FONT_TITLE, PRIMARY, True)
    else:
        r += tb(pid, MARGIN_L, emu(0.28), emu(9), emu(0.4), title, FONT_TITLE, PRIMARY, True)
    r += rect(pid, MARGIN_L, emu(0.88), CONTENT_W, emu(0.02), LIGHT_GRAY)
    return r


def _title_slide(pid, s, label='PORTFOLIO  |  2026'):
    """Cover/closing slide with metrics bar."""
    r = []
    r += rect(pid, 0, 0, SW, SH, PRIMARY)
    r += rect(pid, 0, 0, emu(0.1), SH, ACCENT)
    r += rect(pid, emu(0.1), emu(0.08), SW, emu(0.04), ACCENT)
    r += tb(pid, MARGIN_L + emu(0.1), emu(0.5), emu(3), emu(0.25), label, FONT_BODY, MID_GRAY)
    # Use 28pt (was 36pt) to prevent title truncation on long titles
    r += tb(pid, MARGIN_L + emu(0.1), emu(1.0), emu(8.5), emu(1.6),
            s.get('title', ''), 28, WHITE, True, ls=115)
    r += rect(pid, MARGIN_L + emu(0.1), emu(2.55), emu(2), emu(0.05), ACCENT)
    subtitle = s.get('subtitle', '')
    if subtitle:
        r += tb(pid, MARGIN_L + emu(0.1), emu(2.65), emu(7), emu(0.4),
                subtitle, 14, MID_GRAY, ls=160)
    # Metrics bar
    r += rect(pid, 0, emu(3.5), SW, emu(0.8), NAVY_LIGHT)
    metrics = s.get('metrics', [
        ('₩134M', 'Year 1 목표'),
        ('10개', '케이스 포트폴리오'),
        ('₩373M', 'Year 2 전망'),
        ('03-28', '파일럿 D-Day'),
    ])
    for i, (num_val, lbl) in enumerate(metrics):
        x = MARGIN_L + emu(0.1) + i * emu(2.35)
        r += tb(pid, x, emu(3.6), emu(1.0), emu(0.35), num_val, 18, ACCENT, True)
        r += tb(pid, x + emu(1.05), emu(3.67), emu(1.2), emu(0.25), lbl, FONT_BODY, WHITE)
        if i < 3:
            r += rect(pid, x + emu(2.2), emu(3.65), emu(0.02), emu(0.35), MID_GRAY)
    # Footer
    r += rect(pid, 0, emu(4.5), SW, emu(0.75), {'red': 0.106, 'green': 0.165, 'blue': 0.290})
    partner = s.get('partner', '')
    if partner:
        r += tb(pid, MARGIN_L + emu(0.1), emu(4.6), emu(6), emu(0.4),
                partner, 11, WHITE, True)
    return r


def _three_col_stats(pid, s, num=''):
    """Three stat columns layout — taller cards to fill space."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    cols = s.get('columns', [])
    CARD_H = emu(2.8)  # Taller cards (was 2.0) — fills vertical space
    for i, col_data in enumerate(cols):
        x = col3(i)
        r += card(pid, x, emu(1.1), COL3_W, CARD_H)
        c = [ACCENT, PRIMARY, NAVY_LIGHT][i % 3]
        r += rect(pid, x, emu(1.1), COL3_W, emu(0.06), c)
        stat = col_data.get('stat', '')
        if stat:
            r += tb(pid, x + CARD_PAD, emu(1.25), COL3_W - CARD_PAD * 2, emu(0.65),
                    stat, FONT_STAT_BIG, c, True)
        label = col_data.get('label', '')
        if label:
            r += tb(pid, x + CARD_PAD, emu(1.95), COL3_W - CARD_PAD * 2, emu(0.25),
                    label, FONT_CARD_TITLE, PRIMARY, True)
        r += rect(pid, x + CARD_PAD, emu(2.23), COL3_W - CARD_PAD * 2, emu(0.02), LIGHT_GRAY)
        desc = col_data.get('desc', '')
        if desc:
            r += tb(pid, x + CARD_PAD, emu(2.3), COL3_W - CARD_PAD * 2, emu(1.4),
                    desc, FONT_BODY, DARK_GRAY, ls=140)
    # Anchor callout/source at fixed bottom position
    callout = s.get('callout', '')
    source = s.get('source', '')
    if callout:
        r += rrect(pid, MARGIN_L, emu(4.15), CONTENT_W, emu(0.42), ACCENT_LIGHT)
        r += rect(pid, MARGIN_L, emu(4.15), emu(0.07), emu(0.42), ACCENT)
        r += tb(pid, MARGIN_L + emu(0.25), emu(4.20), CONTENT_W - emu(0.4), emu(0.35),
                callout, FONT_BODY, PRIMARY, True)
    if source:
        src_y = emu(4.65) if callout else emu(4.55)
        r += tb(pid, MARGIN_L, src_y, CONTENT_W, emu(0.2),
                source, FONT_CAPTION, MID_GRAY)
    return r


def _three_col_roles(pid, s, num=''):
    """Three role columns — uses FONT_STAT_MED for stat (avoids oversized text)."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    cols = s.get('columns', [])
    CARD_H = emu(2.8)  # Taller (was 2.0)
    for i, col_data in enumerate(cols):
        x = col3(i)
        r += card(pid, x, emu(1.1), COL3_W, CARD_H)
        c = [ACCENT, PRIMARY, NAVY_LIGHT][i % 3]
        r += rect(pid, x, emu(1.1), COL3_W, emu(0.06), c)
        stat = col_data.get('stat', '')
        if stat:
            # Use FONT_STAT_MED (16pt) instead of FONT_STAT_BIG (28pt)
            r += tb(pid, x + CARD_PAD, emu(1.25), COL3_W - CARD_PAD * 2, emu(0.4),
                    stat, FONT_STAT_MED, c, True)
        label = col_data.get('label', '')
        if label:
            r += tb(pid, x + CARD_PAD, emu(1.7), COL3_W - CARD_PAD * 2, emu(0.3),
                    label, 14, PRIMARY, True)
        r += rect(pid, x + CARD_PAD, emu(2.05), COL3_W - CARD_PAD * 2, emu(0.02), LIGHT_GRAY)
        desc = col_data.get('desc', '')
        if desc:
            r += tb(pid, x + CARD_PAD, emu(2.12), COL3_W - CARD_PAD * 2, emu(0.8),
                    desc, FONT_BODY, DARK_GRAY, ls=140)
    source = s.get('source', '')
    if source:
        r += rrect(pid, MARGIN_L, emu(4.05), CONTENT_W, emu(0.5), ACCENT_LIGHT)
        r += rect(pid, MARGIN_L, emu(4.05), emu(0.06), emu(0.5), ACCENT)
        r += tb(pid, MARGIN_L + emu(0.2), emu(4.1), CONTENT_W - emu(0.3), emu(0.4),
                source, FONT_BODY, PRIMARY, True, it=True)
    return r


def _bullet_slide(pid, s, num=''):
    """Bullet minimal layout — dynamic height to fill space."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    bullets = s.get('bullets', [])
    n_bullets = len(bullets)
    # Dynamic bullet height: expand to fill available space (1.1 to ~4.6)
    available = emu(3.5)  # from 1.1 to 4.6
    bullet_h = min(emu(0.85), max(emu(0.55), available // max(n_bullets, 1) - emu(0.1)))
    y = emu(1.1)
    for i, b in enumerate(bullets):
        c = [ACCENT, PRIMARY, NAVY_LIGHT, MID_GRAY][i % 4]
        r += card(pid, MARGIN_L, y, CONTENT_W, bullet_h)
        r += rect(pid, MARGIN_L, y, emu(0.07), bullet_h, c)
        head = b.get('head', '')
        if head:
            r += tb(pid, MARGIN_L + emu(0.25), y + emu(0.08), emu(3.0), emu(0.25),
                    head, FONT_CARD_TITLE, c, True)
        desc = b.get('desc', '')
        if desc:
            r += tb(pid, MARGIN_L + emu(3.4), y + emu(0.08), emu(5.5), bullet_h - emu(0.15),
                    desc, FONT_BODY, DARK_GRAY, ls=130)
        y += bullet_h + emu(0.1)
    quote = s.get('quote', '')
    if quote:
        # Anchor quote/callout at bottom
        qy = max(y + emu(0.05), emu(4.15))
        r += rrect(pid, MARGIN_L, qy, CONTENT_W, emu(0.45), ACCENT_LIGHT)
        r += rect(pid, MARGIN_L, qy, emu(0.06), emu(0.45), ACCENT)
        r += tb(pid, MARGIN_L + emu(0.25), qy + emu(0.05), CONTENT_W - emu(0.4), emu(0.35),
                quote, FONT_BODY, PRIMARY, True, it=True)
    return r


def _two_col(pid, s, num=''):
    """Two-column layout with dynamic card height."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    lx, rx = col2(0), col2(1)
    ldata = s.get('left', {})
    rdata = s.get('right', {})

    # Compute card height based on content
    n_bullets = max(len(ldata.get('bullets', [])), len(rdata.get('bullets', [])))
    card_h = emu(0.5) + emu(0.4) + n_bullets * emu(0.34) + emu(0.15)
    card_h = max(card_h, emu(2.2))
    card_h = min(card_h, emu(3.3))

    # Left column
    r += card(pid, lx, emu(1.05), COL2_W, card_h)
    r += rect(pid, lx, emu(1.05), COL2_W, emu(0.38), PRIMARY)
    lh = ldata.get('header', '')
    if lh:
        r += tb(pid, lx + CARD_PAD, emu(1.1), COL2_W - CARD_PAD * 2, emu(0.28),
                lh, FONT_CARD_TITLE, WHITE, True)
    ly = emu(1.58)
    for item in ldata.get('bullets', []):
        if item:
            r += rect(pid, lx + CARD_PAD, ly + emu(0.06), emu(0.05), emu(0.05), ACCENT)
            r += tb(pid, lx + CARD_PAD + emu(0.18), ly, COL2_W - CARD_PAD * 2 - emu(0.18),
                    emu(0.28), item, FONT_BODY, DARK_GRAY, ls=125)
        ly += emu(0.34)

    # Right column
    r += card(pid, rx, emu(1.05), COL2_W, card_h)
    r += rect(pid, rx, emu(1.05), COL2_W, emu(0.38), ACCENT)
    rh = rdata.get('header', '')
    if rh:
        r += tb(pid, rx + CARD_PAD, emu(1.1), COL2_W - CARD_PAD * 2, emu(0.28),
                rh, FONT_CARD_TITLE, WHITE, True)
    ry = emu(1.58)
    for item in rdata.get('bullets', []):
        if item:
            r += rect(pid, rx + CARD_PAD, ry + emu(0.06), emu(0.05), emu(0.05), PRIMARY)
            r += tb(pid, rx + CARD_PAD + emu(0.18), ry, COL2_W - CARD_PAD * 2 - emu(0.18),
                    emu(0.28), item, FONT_BODY, DARK_GRAY, ls=125)
        ry += emu(0.34)

    # Callout — anchor at fixed bottom position
    callout = s.get('callout', '')
    if callout:
        callout_y = emu(4.15)
        r += rrect(pid, MARGIN_L, callout_y, CONTENT_W, emu(0.42), ACCENT_LIGHT)
        r += rect(pid, MARGIN_L, callout_y, emu(0.07), emu(0.42), ACCENT)
        r += tb(pid, MARGIN_L + emu(0.25), callout_y + emu(0.05), CONTENT_W - emu(0.4), emu(0.35),
                callout, FONT_BODY, PRIMARY, True)
    # Source
    source = s.get('source', '')
    if source:
        src_y = emu(4.65) if callout else emu(4.55)
        r += tb(pid, MARGIN_L, src_y, CONTENT_W, emu(0.2),
                source, FONT_CAPTION, MID_GRAY)
    return r


def _table_slide(pid, s, num=''):
    """Table layout."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    headers = s.get('headers', [])
    rows = s.get('rows', [])
    n_cols = len(headers)
    if n_cols == 0:
        return r
    col_w = CONTENT_W // n_cols
    # Header row
    for j, h in enumerate(headers):
        r += rect(pid, MARGIN_L + j * col_w, emu(1.05), col_w, emu(0.35), PRIMARY)
        if h:
            r += tb(pid, MARGIN_L + j * col_w + CARD_PAD, emu(1.1),
                    col_w - CARD_PAD * 2, emu(0.25), h, FONT_BODY, WHITE, True)
    # Data rows
    row_h = emu(0.4)
    for i, row in enumerate(rows):
        bg = LIGHT_GRAY if i % 2 == 0 else WHITE
        for j, cell in enumerate(row):
            r += rect(pid, MARGIN_L + j * col_w, emu(1.4) + i * row_h, col_w, row_h, bg)
            cell_str = str(cell)
            if cell_str:
                text_color = ACCENT if j == 0 else DARK_GRAY
                bold = j == 0
                r += tb(pid, MARGIN_L + j * col_w + CARD_PAD, emu(1.45) + i * row_h,
                        col_w - CARD_PAD * 2, emu(0.3), cell_str, FONT_BODY, text_color, bold)
    # Callout below table
    callout = s.get('callout', '')
    if callout:
        table_bottom = emu(1.4) + len(rows) * emu(0.4) + emu(0.15)
        r += rrect(pid, MARGIN_L, table_bottom, CONTENT_W, emu(0.42), ACCENT_LIGHT)
        r += rect(pid, MARGIN_L, table_bottom, emu(0.07), emu(0.42), ACCENT)
        r += tb(pid, MARGIN_L + emu(0.25), table_bottom + emu(0.05), CONTENT_W - emu(0.4), emu(0.35),
                callout, FONT_BODY, PRIMARY, True)
    return r


def _timeline_slide(pid, s, num=''):
    """Timeline/phases layout with larger KPI markers."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    phases = s.get('phases', [])
    colors = [ACCENT, PRIMARY, NAVY_LIGHT, MID_GRAY]
    n = len(phases)
    if n == 0:
        return r
    pw = CONTENT_W // n
    gap = emu(0.08)
    y = emu(1.15)
    r += rect(pid, MARGIN_L, y + emu(0.17), CONTENT_W, emu(0.04), LIGHT_GRAY)
    for i, p in enumerate(phases):
        x = MARGIN_L + i * pw
        c = colors[i % len(colors)]
        # Larger KPI marker (0.55 wide x 0.35 tall)
        kpi_text = p.get('kpi', str(i + 1))
        marker_w = emu(0.95)
        marker_h = emu(0.38)
        marker_x = x + (pw - marker_w) // 2
        r += rrect(pid, marker_x, y, marker_w, marker_h, c)
        if kpi_text:
            r += tb(pid, marker_x, y + emu(0.02), marker_w, marker_h - emu(0.02),
                    kpi_text, FONT_BODY, WHITE, True, 'CENTER')
        # Card below
        cy = y + emu(0.5)
        cw = pw - gap
        r += card(pid, x, cy, cw, emu(3.1))
        r += rect(pid, x, cy, cw, emu(0.06), c)
        name = p.get('name', '')
        if name:
            r += tb(pid, x + CARD_PAD, cy + CARD_PAD, cw - CARD_PAD * 2, emu(0.25),
                    name, FONT_CARD_TITLE, c, True)
        period = p.get('period', '')
        if period:
            r += tb(pid, x + CARD_PAD, cy + emu(0.4), cw - CARD_PAD * 2, emu(0.2),
                    period, FONT_BODY, MID_GRAY)
        iy = cy + emu(0.7)
        for item in p.get('items', []):
            if item:
                r += rect(pid, x + CARD_PAD, iy + emu(0.06), emu(0.04), emu(0.04), c)
                r += tb(pid, x + CARD_PAD + emu(0.14), iy, cw - CARD_PAD * 2 - emu(0.14),
                        emu(0.28), item, FONT_BODY, DARK_GRAY, ls=125)
            iy += emu(0.33)
    return r


# ============================================================
# IMAGE HELPER
# ============================================================

def _place_image(pid, r, s):
    """If slide data has 'image_url', place it on the right side of the slide."""
    url = s.get('image_url', '')
    if not url:
        return
    # Image on right 40% of slide, vertically centered in content area
    img_x = MARGIN_L + emu(5.5)
    img_y = emu(1.2)
    img_w = emu(3.5)
    img_h = emu(2.5)
    oid = uid()
    r.append(_img(pid, oid, url, img_x, img_y, img_w, img_h))


# ============================================================
# DENSE LAYOUTS (Consulting Style)
# ============================================================

def _stat_table_hybrid(pid, s, num=''):
    """Top: 2-3 stat cards. Bottom: supporting table. For topics with both headline numbers and detail."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    # Top: stat cards (compact, single row)
    cols = s.get('columns', [])
    n_cols = len(cols) or 3
    stat_w = CONTENT_W // n_cols
    for i, col_data in enumerate(cols):
        x = MARGIN_L + i * stat_w
        c = [ACCENT, PRIMARY, NAVY_LIGHT][i % 3]
        r += rect(pid, x, emu(1.05), stat_w - emu(0.1), emu(0.06), c)
        stat = col_data.get('stat', '')
        if stat:
            r += tb(pid, x + CARD_PAD, emu(1.15), stat_w - emu(0.4), emu(0.35),
                    stat, FONT_STAT_MED, c, True)
        label = col_data.get('label', '')
        if label:
            r += tb(pid, x + CARD_PAD, emu(1.52), stat_w - emu(0.4), emu(0.2),
                    label, FONT_BODY, DARK_GRAY)
    # Bottom: table
    headers = s.get('headers', [])
    rows = s.get('rows', [])
    if headers:
        n_tc = len(headers)
        tw = CONTENT_W // n_tc
        ty = emu(1.9)
        for j, h in enumerate(headers):
            r += rect(pid, MARGIN_L + j * tw, ty, tw, emu(0.3), PRIMARY)
            if h:
                r += tb(pid, MARGIN_L + j * tw + CARD_PAD, ty + emu(0.03),
                        tw - CARD_PAD * 2, emu(0.22), h, FONT_BODY, WHITE, True)
        for i, row in enumerate(rows):
            bg = LIGHT_GRAY if i % 2 == 0 else WHITE
            for j, cell in enumerate(row):
                r += rect(pid, MARGIN_L + j * tw, ty + emu(0.3) + i * emu(0.35),
                          tw, emu(0.35), bg)
                if str(cell):
                    tc = ACCENT if j == 0 else DARK_GRAY
                    r += tb(pid, MARGIN_L + j * tw + CARD_PAD,
                            ty + emu(0.33) + i * emu(0.35),
                            tw - CARD_PAD * 2, emu(0.28), str(cell), FONT_BODY, tc, j == 0)
    # Callout at bottom
    callout = s.get('callout', '')
    if callout:
        r += rrect(pid, MARGIN_L, emu(4.15), CONTENT_W, emu(0.42), ACCENT_LIGHT)
        r += rect(pid, MARGIN_L, emu(4.15), emu(0.07), emu(0.42), ACCENT)
        r += tb(pid, MARGIN_L + emu(0.25), emu(4.20), CONTENT_W - emu(0.4), emu(0.35),
                callout, FONT_BODY, PRIMARY, True)
    source = s.get('source', '')
    if source:
        r += tb(pid, MARGIN_L, emu(4.65), CONTENT_W, emu(0.2), source, FONT_CAPTION, MID_GRAY)
    return r


def _matrix_layout(pid, s, num=''):
    """2x3 or 3x2 grid of mini-cards. For 4-6 items needing equal visual weight."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    items = s.get('items', [])
    n = len(items)
    # Auto-select grid: 6 items → 3x2, 4 items → 2x2
    n_cols = 3 if n >= 5 else 2
    n_rows = (n + n_cols - 1) // n_cols
    cell_w = (CONTENT_W - emu(0.2) * (n_cols - 1)) // n_cols
    cell_h = emu(1.3)
    colors = [ACCENT, PRIMARY, NAVY_LIGHT, MID_GRAY, GREEN_SOFT, ACCENT]
    for idx, item in enumerate(items):
        col_idx = idx % n_cols
        row_idx = idx // n_cols
        x = MARGIN_L + col_idx * (cell_w + emu(0.2))
        y = emu(1.1) + row_idx * (cell_h + emu(0.15))
        c = colors[idx % len(colors)]
        r += card(pid, x, y, cell_w, cell_h)
        r += rect(pid, x, y, cell_w, emu(0.06), c)
        label = item.get('label', '')
        if label:
            r += tb(pid, x + CARD_PAD, y + emu(0.12), cell_w - CARD_PAD * 2, emu(0.25),
                    label, FONT_CARD_TITLE, c, True)
        stat = item.get('stat', '')
        if stat:
            r += tb(pid, x + CARD_PAD, y + emu(0.4), cell_w - CARD_PAD * 2, emu(0.3),
                    stat, FONT_STAT_MED, c, True)
        desc = item.get('desc', '')
        if desc:
            r += tb(pid, x + CARD_PAD, y + emu(0.75), cell_w - CARD_PAD * 2, emu(0.45),
                    desc, FONT_BODY, DARK_GRAY, ls=130)
    callout = s.get('callout', '')
    if callout:
        r += rrect(pid, MARGIN_L, emu(4.15), CONTENT_W, emu(0.42), ACCENT_LIGHT)
        r += rect(pid, MARGIN_L, emu(4.15), emu(0.07), emu(0.42), ACCENT)
        r += tb(pid, MARGIN_L + emu(0.25), emu(4.20), CONTENT_W - emu(0.4), emu(0.35),
                callout, FONT_BODY, PRIMARY, True)
    return r


def _image_two_col(pid, s, num=''):
    """Left: image. Right: text content. For slides needing visual evidence."""
    r = []
    r += _slide_header(pid, num, s.get('title', ''))
    # Left: image (55% width)
    image_url = s.get('image_url', '')
    if image_url:
        oid = uid()
        r.append(_img(pid, oid, image_url, MARGIN_L, emu(1.1), emu(4.8), emu(3.2)))
    else:
        # Placeholder rectangle if no image
        r += rrect(pid, MARGIN_L, emu(1.1), emu(4.8), emu(3.2), LIGHT_GRAY)
        r += tb(pid, MARGIN_L + emu(1.5), emu(2.3), emu(2.0), emu(0.5),
                '[Image]', FONT_BODY, MID_GRAY, False, 'CENTER')
    # Right: text content (40% width)
    rx = MARGIN_L + emu(5.1)
    rw = emu(3.9)
    bullets = s.get('bullets', [])
    ry = emu(1.1)
    for b in bullets:
        head = b.get('head', '')
        if head:
            r += tb(pid, rx, ry, rw, emu(0.22), head, FONT_CARD_TITLE, PRIMARY, True)
            ry += emu(0.25)
        desc = b.get('desc', '')
        if desc:
            r += tb(pid, rx, ry, rw, emu(0.35), desc, FONT_BODY, DARK_GRAY, ls=130)
            ry += emu(0.4)
    callout = s.get('callout', '')
    if callout:
        r += rrect(pid, rx, emu(3.6), rw, emu(0.4), ACCENT_LIGHT)
        r += rect(pid, rx, emu(3.6), emu(0.06), emu(0.4), ACCENT)
        r += tb(pid, rx + emu(0.2), emu(3.65), rw - emu(0.3), emu(0.3),
                callout, FONT_BODY, PRIMARY, True)
    source = s.get('source', '')
    if source:
        r += tb(pid, MARGIN_L, emu(4.55), CONTENT_W, emu(0.2),
                source, FONT_CAPTION, MID_GRAY)
    return r


# ============================================================
# SLIDE BUILDERS
# ============================================================

def s01_title(pid, s):
    return _title_slide(pid, s, 'PORTFOLIO  |  2026')


def s02_exec_summary(pid, s):
    return _three_col_stats(pid, s, '')


def s03_why_now(pid, s):
    return _bullet_slide(pid, s, '00')


def s04_market(pid, s):
    return _three_col_stats(pid, s, '01')


def s05_gap(pid, s):
    return _two_col(pid, s, '02')


def s06_concept(pid, s):
    # Uses _three_col_roles to avoid oversized stat text
    return _three_col_roles(pid, s, '03')


def s07_curriculum(pid, s):
    return _timeline_slide(pid, s, '04')


def s08_case_table(pid, s):
    return _table_slide(pid, s, '05')


def s09_c01(pid, s):
    return _two_col(pid, s, 'C01')


def s10_c02(pid, s):
    return _two_col(pid, s, 'C02')


def s11_c03(pid, s):
    return _two_col(pid, s, 'C03')


def s12_c04(pid, s):
    return _two_col(pid, s, 'C04')


def s13_c05(pid, s):
    return _two_col(pid, s, 'C05')


def s14_c06(pid, s):
    return _two_col(pid, s, 'C06')


def s15_c07(pid, s):
    return _two_col(pid, s, 'C07')


def s16_c08(pid, s):
    return _two_col(pid, s, 'C08')


def s17_c09c10(pid, s):
    return _two_col(pid, s, 'C09')


def s18_synergies(pid, s):
    return _two_col(pid, s, '06')


def s19_roadmap(pid, s):
    return _timeline_slide(pid, s, '07')


def s20_financial(pid, s):
    # Special: highlight middle column (목표 시나리오) with accent background
    r = []
    r += _slide_header(pid, '08', s.get('title', ''))
    cols = s.get('columns', [])
    CARD_H = emu(2.8)
    for i, col_data in enumerate(cols):
        x = col3(i)
        # Middle card gets accent_light background
        bg = ACCENT_LIGHT if i == 1 else None
        r += card(pid, x, emu(1.1), COL3_W, CARD_H, bg)
        c = [ACCENT, PRIMARY, NAVY_LIGHT][i % 3]
        border_c = ACCENT if i == 1 else c
        r += rect(pid, x, emu(1.1), COL3_W, emu(0.06) if i != 1 else emu(0.1), border_c)
        stat = col_data.get('stat', '')
        if stat:
            r += tb(pid, x + CARD_PAD, emu(1.25), COL3_W - CARD_PAD * 2, emu(0.65),
                    stat, FONT_STAT_BIG, border_c, True)
        label = col_data.get('label', '')
        if label:
            r += tb(pid, x + CARD_PAD, emu(1.95), COL3_W - CARD_PAD * 2, emu(0.25),
                    label, FONT_CARD_TITLE, PRIMARY, True)
        r += rect(pid, x + CARD_PAD, emu(2.23), COL3_W - CARD_PAD * 2, emu(0.02), LIGHT_GRAY)
        desc = col_data.get('desc', '')
        if desc:
            r += tb(pid, x + CARD_PAD, emu(2.3), COL3_W - CARD_PAD * 2, emu(0.6),
                    desc, FONT_BODY, DARK_GRAY, ls=140)
    source = s.get('source', '')
    if source:
        r += tb(pid, MARGIN_L, emu(4.1), CONTENT_W, emu(0.2),
                source, FONT_CAPTION, MID_GRAY)
    return r


def s21_asset_map(pid, s):
    return _table_slide(pid, s, '09')


def s22_donga_value(pid, s):
    return _bullet_slide(pid, s, '10')


def s23_donga_investment(pid, s):
    return _table_slide(pid, s, '11')


def s24_risk(pid, s):
    return _bullet_slide(pid, s, '12')


def s25_partner_review(pid, s):
    return _bullet_slide(pid, s, '13')


def s26_next_steps(pid, s):
    return _table_slide(pid, s, '14')


def s27_closing(pid, s):
    # Closing slide: different metrics
    s_copy = dict(s)
    s_copy['metrics'] = [
        ('MOU', '3월 체결'),
        ('D-Day', '03-28'),
        ('NPS 85+', '정기화'),
        ('Q3', 'C03·C05'),
    ]
    return _title_slide(pid, s_copy, 'NEXT STEP')


# ============================================================
# DATA + DISPATCH
# ============================================================

def load_slides():
    content_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'output', 'slide-content.json')
    with open(content_path, encoding='utf-8') as f:
        data = json.load(f)
    return data['slides']


def _auto_dispatch(pid, s):
    """Auto-detect layout type from slide data keys and dispatch."""
    keys = set(s.keys()) - {'build', 'title', 'source', 'callout', 'image_url'}
    build = s.get('build', '')
    layout = s.get('layout', '')  # Explicit layout override from content-writer

    # Explicit layout dispatch (new dense layouts)
    if layout == 'stat-table-hybrid':
        return _stat_table_hybrid(pid, s, build)
    if layout == 'matrix':
        return _matrix_layout(pid, s, build)
    if layout == 'image-two-col':
        return _image_two_col(pid, s, build)

    # Title/closing slides
    if 'subtitle' in keys or build in ('01', '23'):
        if build == '23':
            return s27_closing(pid, s)
        return s01_title(pid, s)
    # Stat-table hybrid: has both 'columns' and 'headers'
    if 'columns' in keys and 'headers' in keys:
        return _stat_table_hybrid(pid, s, build)
    # Matrix: has 'items' list
    if 'items' in keys:
        return _matrix_layout(pid, s, build)
    # Image + text: has 'image_url' and 'bullets'
    if 'image_url' in s and s['image_url'] and 'bullets' in keys:
        return _image_two_col(pid, s, build)
    # Three-col roles (C06 concept slide)
    if 'columns' in keys and build == '06':
        return _three_col_roles(pid, s, '03')
    # Three-col stats — financial highlight (middle card accented, build 17)
    if 'columns' in keys and build == '17':
        return s20_financial(pid, s)
    # Three-col stats
    if 'columns' in keys:
        num_map = {'02': '', '04': '01', '10': 'C01'}
        return _three_col_stats(pid, s, num_map.get(build, build))
    # Timeline
    if 'phases' in keys:
        num_map = {'07': '04', '16': '07'}
        return _timeline_slide(pid, s, num_map.get(build, build))
    # Table
    if 'headers' in keys:
        num_map = {'08': 'P1', '09': 'P2', '11': 'P1', '13': 'P2', '15': '09',
                   '20': '12', '21': '13', '22': '14'}
        return _table_slide(pid, s, num_map.get(build, build))
    # Bullet
    if 'bullets' in keys:
        num_map = {'03': '00', '18': '10', '19': '11'}
        return _bullet_slide(pid, s, num_map.get(build, build))
    # Two-col (default)
    num_map = {'05': '02', '12': 'C05', '14': '06'}
    return _two_col(pid, s, num_map.get(build, build))


BUILDERS = {
    '01': s01_title,
    '02': _auto_dispatch,
    '03': _auto_dispatch,
    '04': _auto_dispatch,
    '05': _auto_dispatch,
    '06': _auto_dispatch,
    '07': _auto_dispatch,
    '08': _auto_dispatch,
    '09': _auto_dispatch,
    '10': _auto_dispatch,
    '11': _auto_dispatch,
    '12': _auto_dispatch,
    '13': _auto_dispatch,
    '14': _auto_dispatch,
    '15': _auto_dispatch,
    '16': _auto_dispatch,
    '17': _auto_dispatch,
    '18': _auto_dispatch,
    '19': _auto_dispatch,
    '20': _auto_dispatch,
    '21': _auto_dispatch,
    '22': _auto_dispatch,
    '23': s27_closing,
}


def main():
    import yaml
    deck_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deck.yaml')
    if os.path.exists(deck_path):
        with open(deck_path, encoding='utf-8') as f:
            config = yaml.safe_load(f)
        title = config.get('title', "Future AI Leader's Academy — Portfolio")
    else:
        title = "Future AI Leader's Academy — 10-Case Portfolio 상세 제안서"

    slides = load_slides()
    url, pid = generate(title, slides, BUILDERS)
    print(f'\nPresentation ID: {pid}')
    return url


if __name__ == '__main__':
    main()
