"""Google Slides API primitive builders.

Low-level functions that emit Google Slides API request dicts.
These are the building blocks for all slide layouts.
"""

from .grid import emu, rgb

_counter = 0


def reset_counter():
    """Reset the object ID counter. Call before generating a new presentation."""
    global _counter
    _counter = 0


def uid():
    """Generate a unique object ID for a slide element."""
    global _counter
    _counter += 1
    return f'o{_counter:05d}'


def ts(sz, color, bold=False, italic=False, font='Noto Sans KR'):
    """Build a TextStyle dict."""
    s = {
        'fontSize': {'magnitude': sz, 'unit': 'PT'},
        'foregroundColor': {'opaqueColor': rgb(color)},
        'bold': bold,
        'fontFamily': font,
    }
    if italic:
        s['italic'] = True
    return s


def _sh(pid, oid, x, y, w, h, st='TEXT_BOX'):
    """Create a shape on a page."""
    return {
        'createShape': {
            'objectId': oid,
            'shapeType': st,
            'elementProperties': {
                'pageObjectId': pid,
                'size': {
                    'width': {'magnitude': w, 'unit': 'EMU'},
                    'height': {'magnitude': h, 'unit': 'EMU'},
                },
                'transform': {
                    'scaleX': 1, 'scaleY': 1,
                    'translateX': x, 'translateY': y,
                    'unit': 'EMU',
                },
            },
        }
    }


def _img(pid, oid, url, x, y, w, h):
    """Create an image on a page."""
    return {
        'createImage': {
            'objectId': oid,
            'url': url,
            'elementProperties': {
                'pageObjectId': pid,
                'size': {
                    'width': {'magnitude': w, 'unit': 'EMU'},
                    'height': {'magnitude': h, 'unit': 'EMU'},
                },
                'transform': {
                    'scaleX': 1, 'scaleY': 1,
                    'translateX': x, 'translateY': y,
                    'unit': 'EMU',
                },
            },
        }
    }


def _tx(oid, t):
    """Insert text into a shape."""
    return {'insertText': {'objectId': oid, 'text': t, 'insertionIndex': 0}}


def _st(oid, style, s=0, e=None):
    """Apply text style to a range."""
    r = {
        'updateTextStyle': {
            'objectId': oid,
            'style': style,
            'fields': 'fontSize,foregroundColor,bold,fontFamily,italic',
        }
    }
    if e:
        r['updateTextStyle']['textRange'] = {
            'type': 'FIXED_RANGE', 'startIndex': s, 'endIndex': e,
        }
    else:
        r['updateTextStyle']['textRange'] = {'type': 'ALL'}
    return r


def _pa(oid, a='START', ls=100):
    """Apply paragraph style."""
    style = {'alignment': a}
    f = ['alignment']
    if ls != 100:
        style['lineSpacing'] = ls
        f.append('lineSpacing')
    return {
        'updateParagraphStyle': {
            'objectId': oid,
            'style': style,
            'fields': ','.join(f),
            'textRange': {'type': 'ALL'},
        }
    }


def _fi(oid, c):
    """Fill a shape with a solid color."""
    return {
        'updateShapeProperties': {
            'objectId': oid,
            'shapeProperties': {
                'shapeBackgroundFill': {'solidFill': {'color': rgb(c)}},
                'outline': {'propertyState': 'NOT_RENDERED'},
            },
            'fields': 'shapeBackgroundFill,outline',
        }
    }


def _bg(pid, c):
    """Set page background color."""
    return {
        'updatePageProperties': {
            'objectId': pid,
            'pageProperties': {
                'pageBackgroundFill': {'solidFill': {'color': rgb(c)}},
            },
            'fields': 'pageBackgroundFill',
        }
    }


def rect(pid, x, y, w, h, c):
    """Rectangle with solid fill."""
    o = uid()
    return [_sh(pid, o, x, y, w, h, 'RECTANGLE'), _fi(o, c)]


def rrect(pid, x, y, w, h, c):
    """Rounded rectangle with solid fill."""
    o = uid()
    return [_sh(pid, o, x, y, w, h, 'ROUND_RECTANGLE'), _fi(o, c)]


def tb(pid, x, y, w, h, t, sz, c, b=False, a='START', it=False, ls=100, font=None):
    """Text box with full styling.

    Args:
        pid: Page object ID
        x, y, w, h: Position and size in EMU
        t: Text content
        sz: Font size in PT
        c: Color dict (Google Slides RGB)
        b: Bold
        a: Alignment ('START', 'CENTER', 'END')
        it: Italic
        ls: Line spacing (100 = single)
        font: Override font family (uses theme font if None)
    """
    o = uid()
    style = ts(sz, c, b, it, font) if font else ts(sz, c, b, it)
    return [_sh(pid, o, x, y, w, h), _tx(o, t), _st(o, style), _pa(o, a, ls)]


def card(pid, x, y, w, h, c=None):
    """Card with drop shadow (rounded rect on top of shadow rect).

    Args:
        c: Card background color. Defaults to white if None.
    """
    if c is None:
        c = {'red': 1.0, 'green': 1.0, 'blue': 1.0}
    shadow = {'red': 0.860, 'green': 0.860, 'blue': 0.860}
    r = rrect(pid, x + emu(0.02), y + emu(0.02), w, h, shadow)
    r += rrect(pid, x, y, w, h, c)
    return r


def bar_chart(pid, x, y, w, h, bars, theme_colors, show_values=True, highlight_last=True):
    """Horizontal bar chart using rectangles.

    Args:
        bars: List of dicts with 'label', 'value', 'display' keys.
              'value' is numeric (for scaling), 'display' is the shown text.
        theme_colors: Dict with 'primary', 'accent', 'dark_gray', 'mid_gray' colors.
        show_values: Show value labels on bars.
        highlight_last: Use accent color for the last bar.
    """
    if not bars:
        return []

    r = []
    max_val = max(b['value'] for b in bars)
    bar_count = len(bars)
    bar_h = min(h // bar_count - emu(0.08), emu(0.45))
    label_w = emu(1.2)
    chart_x = x + label_w + emu(0.1)
    chart_w = w - label_w - emu(0.3)

    for i, bar in enumerate(bars):
        bar_y = y + i * (bar_h + emu(0.08))
        ratio = bar['value'] / max_val if max_val else 0
        bar_w = max(int(chart_w * ratio), emu(0.1))

        is_last = (i == bar_count - 1) and highlight_last
        color = theme_colors.get('accent', {'red': 1.0, 'green': 0.420, 'blue': 0.208}) \
            if is_last else theme_colors.get('primary', {'red': 0.106, 'green': 0.165, 'blue': 0.290})

        # Label
        r += tb(pid, x, bar_y, label_w, bar_h,
                bar.get('label', ''), 9,
                theme_colors.get('dark_gray', {'red': 0.290, 'green': 0.290, 'blue': 0.290}),
                a='END')

        # Bar rect
        r += rrect(pid, chart_x, bar_y, bar_w, bar_h, color)

        # Value on bar
        if show_values:
            display = bar.get('display', str(bar['value']))
            r += tb(pid, chart_x + emu(0.1), bar_y, bar_w - emu(0.15), bar_h,
                    display, 9,
                    {'red': 1.0, 'green': 1.0, 'blue': 1.0}, True)

    return r


def flow_diagram(pid, x, y, w, h, steps, theme_colors, orientation='horizontal'):
    """Flow diagram with connected step boxes.

    Args:
        steps: List of dicts with 'label' and optional 'desc' keys.
        theme_colors: Dict with 'primary', 'accent', 'light_gray', 'dark_gray' colors.
        orientation: 'horizontal' or 'vertical'.
    """
    if not steps:
        return []

    r = []
    n = len(steps)
    primary = theme_colors.get('primary', {'red': 0.106, 'green': 0.165, 'blue': 0.290})
    accent = theme_colors.get('accent', {'red': 1.0, 'green': 0.420, 'blue': 0.208})
    light = theme_colors.get('light_gray', {'red': 0.945, 'green': 0.945, 'blue': 0.945})
    dark = theme_colors.get('dark_gray', {'red': 0.290, 'green': 0.290, 'blue': 0.290})
    white = {'red': 1.0, 'green': 1.0, 'blue': 1.0}

    if orientation == 'horizontal':
        arrow_w = emu(0.25)
        total_arrows = max(n - 1, 0) * arrow_w
        step_w = (w - total_arrows) // n
        step_h = h

        for i, step in enumerate(steps):
            sx = x + i * (step_w + arrow_w)
            # Step box
            r += rrect(pid, sx, y, step_w, step_h, primary if i == 0 else light)
            text_color = white if i == 0 else dark
            # Number badge
            r += tb(pid, sx, y + emu(0.05), step_w, emu(0.25),
                    f'{i + 1}', 8, accent, True, 'CENTER')
            # Label
            r += tb(pid, sx + emu(0.1), y + emu(0.28), step_w - emu(0.2), emu(0.3),
                    step.get('label', ''), 10, text_color, True, 'CENTER')
            # Desc
            if step.get('desc'):
                r += tb(pid, sx + emu(0.1), y + emu(0.55), step_w - emu(0.2), step_h - emu(0.6),
                        step['desc'], 8, dark, a='CENTER')
            # Arrow between steps
            if i < n - 1:
                arrow_x = sx + step_w
                arrow_y = y + step_h // 2 - emu(0.08)
                r += tb(pid, arrow_x, arrow_y, arrow_w, emu(0.2),
                        '\u2192', 14, accent, True, 'CENTER')
    else:
        arrow_h = emu(0.2)
        total_arrows = max(n - 1, 0) * arrow_h
        step_h = (h - total_arrows) // n
        step_w = w

        for i, step in enumerate(steps):
            sy = y + i * (step_h + arrow_h)
            r += rrect(pid, x, sy, step_w, step_h, primary if i == 0 else light)
            text_color = white if i == 0 else dark
            r += tb(pid, x + emu(0.1), sy + emu(0.05), emu(0.3), step_h,
                    f'{i + 1}', 8, accent, True)
            r += tb(pid, x + emu(0.45), sy + emu(0.05), step_w - emu(0.6), step_h - emu(0.1),
                    step.get('label', ''), 10, text_color, True)
            if i < n - 1:
                arrow_y = sy + step_h
                r += tb(pid, x + step_w // 2 - emu(0.15), arrow_y, emu(0.3), arrow_h,
                        '\u2193', 14, accent, True, 'CENTER')

    return r


def pie_segments(pid, cx, cy, radius, segments, theme_colors):
    """Simulated pie chart using overlapping arcs (approximated with rectangles).

    Since Google Slides API doesn't support native pie charts,
    this creates a visual representation using colored rectangles with labels.

    Args:
        cx, cy: Center position
        segments: List of dicts with 'label', 'pct', optional 'display' keys.
        theme_colors: Dict with color values.
    """
    r = []
    # Use a legend-style representation since true arcs aren't available
    colors = [
        theme_colors.get('primary', {'red': 0.106, 'green': 0.165, 'blue': 0.290}),
        theme_colors.get('accent', {'red': 1.0, 'green': 0.420, 'blue': 0.208}),
        theme_colors.get('navy_light', {'red': 0.180, 'green': 0.260, 'blue': 0.420}),
        theme_colors.get('mid_gray', {'red': 0.700, 'green': 0.700, 'blue': 0.700}),
    ]
    dark = theme_colors.get('dark_gray', {'red': 0.290, 'green': 0.290, 'blue': 0.290})
    white = {'red': 1.0, 'green': 1.0, 'blue': 1.0}

    # Stacked bar representation (horizontal)
    bar_x = cx - radius
    bar_y = cy - emu(0.25)
    bar_w = radius * 2
    bar_h = emu(0.5)
    total_pct = sum(s.get('pct', 0) for s in segments)

    x_offset = bar_x
    for i, seg in enumerate(segments):
        pct = seg.get('pct', 0)
        seg_w = max(int(bar_w * pct / total_pct), emu(0.2)) if total_pct else emu(0.5)
        color = colors[i % len(colors)]
        r += rrect(pid, x_offset, bar_y, seg_w, bar_h, color)

        # Percentage label on bar
        display = seg.get('display', f'{pct}%')
        r += tb(pid, x_offset, bar_y, seg_w, bar_h, display, 9, white, True, 'CENTER')
        x_offset += seg_w

    # Legend below
    legend_y = bar_y + bar_h + emu(0.15)
    legend_x = cx - radius
    for i, seg in enumerate(segments):
        color = colors[i % len(colors)]
        r += rect(pid, legend_x, legend_y, emu(0.15), emu(0.15), color)
        r += tb(pid, legend_x + emu(0.2), legend_y - emu(0.02), emu(1.5), emu(0.2),
                seg.get('label', ''), 8, dark)
        legend_x += emu(2.0)

    return r


def comparison_matrix(pid, x, y, w, h, rows, headers, theme_colors, highlight_col=None):
    """Comparison matrix table with optional column highlight.

    Args:
        rows: List of lists (each row is a list of cell strings).
        headers: List of header strings.
        theme_colors: Dict with color values.
        highlight_col: 0-indexed column to highlight with accent color.
    """
    if not rows or not headers:
        return []

    r = []
    n_cols = len(headers)
    n_rows = len(rows)
    col_w = w // n_cols
    header_h = emu(0.35)
    row_h = min((h - header_h) // max(n_rows, 1), emu(0.4))

    primary = theme_colors.get('primary', {'red': 0.106, 'green': 0.165, 'blue': 0.290})
    accent = theme_colors.get('accent', {'red': 1.0, 'green': 0.420, 'blue': 0.208})
    light = theme_colors.get('light_gray', {'red': 0.945, 'green': 0.945, 'blue': 0.945})
    dark = theme_colors.get('dark_gray', {'red': 0.290, 'green': 0.290, 'blue': 0.290})
    white = {'red': 1.0, 'green': 1.0, 'blue': 1.0}

    # Header row
    for j, hdr in enumerate(headers):
        hx = x + j * col_w
        bg = accent if j == highlight_col else primary
        r += rrect(pid, hx, y, col_w - emu(0.02), header_h, bg)
        r += tb(pid, hx + emu(0.05), y, col_w - emu(0.12), header_h,
                hdr, 9, white, True, 'CENTER')

    # Data rows
    for i, row in enumerate(rows):
        ry = y + header_h + emu(0.02) + i * (row_h + emu(0.02))
        for j, cell in enumerate(row):
            cx = x + j * col_w
            bg = light if i % 2 == 0 else white
            if j == highlight_col:
                from copy import deepcopy
                bg = theme_colors.get('accent_light', {'red': 1.0, 'green': 0.930, 'blue': 0.890})
            r += rect(pid, cx, ry, col_w - emu(0.02), row_h, bg)
            r += tb(pid, cx + emu(0.05), ry, col_w - emu(0.12), row_h,
                    str(cell), 8, dark, a='CENTER')

    return r


def section_header(pid, num, title, subtitle=None, *,
                   accent=None, primary=None, mid_gray=None, light_gray=None):
    """Consistent section header: number badge + title + optional subtitle.

    Color args default to navy-coral theme if not provided.
    """
    if accent is None:
        accent = {'red': 1.0, 'green': 0.420, 'blue': 0.208}
    if primary is None:
        primary = {'red': 0.106, 'green': 0.165, 'blue': 0.290}
    if mid_gray is None:
        mid_gray = {'red': 0.700, 'green': 0.700, 'blue': 0.700}
    if light_gray is None:
        light_gray = {'red': 0.945, 'green': 0.945, 'blue': 0.945}

    from .grid import MARGIN_L, CONTENT_W, FONT_TITLE

    r = []
    r += rrect(pid, MARGIN_L, emu(0.28), emu(0.55), emu(0.35), accent)
    r += tb(pid, MARGIN_L, emu(0.30), emu(0.55), emu(0.3), num, 14, accent, True, 'CENTER')
    r += tb(pid, emu(1.2), emu(0.28), emu(8), emu(0.4), title, FONT_TITLE, primary, True)
    if subtitle:
        r += tb(pid, emu(1.2), emu(0.6), emu(8), emu(0.25), subtitle, 10, mid_gray, it=True)
    r += rect(pid, MARGIN_L, emu(0.88), CONTENT_W, emu(0.02), light_gray)
    return r
