"""Google Slides generation toolkit.

Usage:
    from scripts.gslides import (
        # Grid
        emu, rgb, SW, SH,
        MARGIN_L, MARGIN_R, MARGIN_T, CONTENT_W,
        COL2_W, COL3_W, COL4_W, col2, col3, col4,
        CARD_PAD, MAX_Y,
        FONT_TITLE, FONT_CARD_TITLE, FONT_BODY, FONT_CAPTION,
        FONT_STAT_BIG, FONT_STAT_MED, FONT_LABEL,
        # Primitives
        uid, tb, rect, rrect, card, section_header,
        _sh, _img, _tx, _st, _pa, _fi, _bg,
        reset_counter,
        # Themes
        Theme, NAVY_CORAL,
        # API
        generate,
    )
"""

from .grid import (
    SW, SH, emu, rgb,
    MARGIN_L, MARGIN_R, MARGIN_T, CONTENT_W,
    COL2_W, COL2_GAP, COL3_W, COL3_GAP, COL4_W, COL4_GAP,
    CARD_PAD, MAX_Y,
    col2, col3, col4,
    FONT_TITLE, FONT_CARD_TITLE, FONT_BODY, FONT_CAPTION,
    FONT_STAT_BIG, FONT_STAT_MED, FONT_LABEL,
)

from .primitives import (
    uid, ts, tb, rect, rrect, card, section_header,
    _sh, _img, _tx, _st, _pa, _fi, _bg,
    reset_counter,
)

from .themes import Theme, NAVY_CORAL

from .api_client import generate

__all__ = [
    'SW', 'SH', 'emu', 'rgb',
    'MARGIN_L', 'MARGIN_R', 'MARGIN_T', 'CONTENT_W',
    'COL2_W', 'COL2_GAP', 'COL3_W', 'COL3_GAP', 'COL4_W', 'COL4_GAP',
    'CARD_PAD', 'MAX_Y',
    'col2', 'col3', 'col4',
    'FONT_TITLE', 'FONT_CARD_TITLE', 'FONT_BODY', 'FONT_CAPTION',
    'FONT_STAT_BIG', 'FONT_STAT_MED', 'FONT_LABEL',
    'uid', 'ts', 'tb', 'rect', 'rrect', 'card', 'section_header',
    '_sh', '_img', '_tx', '_st', '_pa', '_fi', '_bg',
    'reset_counter',
    'Theme', 'NAVY_CORAL',
    'generate',
]
