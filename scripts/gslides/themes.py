"""Theme definitions for Google Slides presentations."""

from dataclasses import dataclass, field


@dataclass
class Theme:
    """Presentation color theme.

    colors: dict mapping color names to Google Slides RGB dicts
            (e.g., {'red': 0.106, 'green': 0.165, 'blue': 0.290})
    font: primary font family name
    """
    name: str
    colors: dict = field(default_factory=dict)
    font: str = 'Noto Sans KR'


NAVY_CORAL = Theme(
    name='navy-coral',
    colors={
        'primary': {'red': 0.106, 'green': 0.165, 'blue': 0.290},
        'accent': {'red': 1.0, 'green': 0.420, 'blue': 0.208},
        'white': {'red': 1.0, 'green': 1.0, 'blue': 1.0},
        'dark_gray': {'red': 0.290, 'green': 0.290, 'blue': 0.290},
        'light_gray': {'red': 0.945, 'green': 0.945, 'blue': 0.945},
        'mid_gray': {'red': 0.700, 'green': 0.700, 'blue': 0.700},
        'navy_light': {'red': 0.180, 'green': 0.260, 'blue': 0.420},
        'shadow': {'red': 0.860, 'green': 0.860, 'blue': 0.860},
        'accent_light': {'red': 1.0, 'green': 0.930, 'blue': 0.890},
        'green_soft': {'red': 0.220, 'green': 0.557, 'blue': 0.235},
    },
    font='Noto Sans KR',
)
