"""Grid system constants for 16:9 Google Slides (10" x 5.625").

All coordinates in EMU (English Metric Units).
1 inch = 914400 EMU.
"""

SW = 9144000
SH = 5143500


def emu(i):
    """Convert inches to EMU."""
    return int(i * 914400)


def rgb(c):
    """Wrap color dict for Google Slides API."""
    return {'rgbColor': c}


# === Margins ===
MARGIN_L = emu(0.5)
MARGIN_R = emu(0.3)
MARGIN_T = emu(0.95)
CONTENT_W = emu(9.0)

# === Column layouts ===
COL2_W = emu(4.35)
COL2_GAP = emu(0.3)
COL3_W = emu(2.8)
COL3_GAP = emu(0.3)
COL4_W = emu(2.05)
COL4_GAP = emu(0.2)

CARD_PAD = emu(0.15)
MAX_Y = emu(5.0)


def col2(i):
    """X position for 2-column layout (0-indexed)."""
    return MARGIN_L + i * (COL2_W + COL2_GAP)


def col3(i):
    """X position for 3-column layout (0-indexed)."""
    return MARGIN_L + i * (COL3_W + COL3_GAP)


def col4(i):
    """X position for 4-column layout (0-indexed)."""
    return MARGIN_L + i * (COL4_W + COL4_GAP)


# === Font size tokens (PT) ===
FONT_TITLE = 18
FONT_CARD_TITLE = 12
FONT_BODY = 9
FONT_CAPTION = 7
FONT_STAT_BIG = 28
FONT_STAT_MED = 16
FONT_LABEL = 8
