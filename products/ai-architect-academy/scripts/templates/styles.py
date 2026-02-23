"""Design system constants for PPT generation."""
from pptx.util import Pt, Inches, Emu
from pptx.dml.color import RGBColor

# === Colors ===
PRIMARY = RGBColor(0x1B, 0x2A, 0x4A)      # Deep Navy
ACCENT = RGBColor(0xFF, 0x6B, 0x35)        # Coral Orange
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
DARK_GRAY = RGBColor(0x4A, 0x4A, 0x4A)
LIGHT_GRAY = RGBColor(0xF5, 0xF5, 0xF5)
MID_GRAY = RGBColor(0x9A, 0x9A, 0x9A)

# === Fonts ===
FONT_FAMILY = "Pretendard"
FONT_FALLBACK = "Apple SD Gothic Neo"

TITLE_SIZE = Pt(36)
SUBTITLE_SIZE = Pt(20)
BODY_SIZE = Pt(16)
STAT_SIZE = Pt(48)
CAPTION_SIZE = Pt(10)
SMALL_SIZE = Pt(12)

# === Slide Dimensions (16:9) ===
SLIDE_WIDTH = Inches(13.333)
SLIDE_HEIGHT = Inches(7.5)

# === Margins ===
MARGIN_LEFT = Inches(1.0)
MARGIN_RIGHT = Inches(1.0)
MARGIN_TOP = Inches(0.8)
MARGIN_BOTTOM = Inches(0.5)
CONTENT_WIDTH = SLIDE_WIDTH - MARGIN_LEFT - MARGIN_RIGHT
CONTENT_HEIGHT = SLIDE_HEIGHT - MARGIN_TOP - MARGIN_BOTTOM
