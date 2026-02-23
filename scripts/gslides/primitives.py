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
