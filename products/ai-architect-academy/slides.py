#!/usr/bin/env python3
"""
AI Architect Academy — Slide builders (s01-s09).

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

# === Theme colors (module-level for convenience) ===
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
# SLIDE BUILDERS
# ============================================================

def s01_title(pid, s):
    r = []
    r += rect(pid, 0, 0, SW, SH, PRIMARY)
    r += rect(pid, 0, 0, emu(0.1), SH, ACCENT)
    r += rect(pid, emu(0.1), emu(0.08), SW, emu(0.04), ACCENT)
    r += tb(pid, MARGIN_L + emu(0.1), emu(0.5), emu(2), emu(0.25), 'PROPOSAL  |  2026.02', FONT_BODY, MID_GRAY)
    r += tb(pid, MARGIN_L + emu(0.1), emu(1.0), emu(5.5), emu(1.4),
            "Future AI Leader's\nAcademy", 42, WHITE, True, ls=100)
    r += rect(pid, MARGIN_L + emu(0.1), emu(2.45), emu(2), emu(0.05), ACCENT)
    r += tb(pid, MARGIN_L + emu(0.1), emu(2.55), emu(5.5), emu(0.35),
            '미래 AI 리더 아카데미', 18, WHITE, True, ls=100)
    r += tb(pid, MARGIN_L + emu(0.1), emu(2.95), emu(5.5), emu(0.9),
            "코딩하는 아이에서 'AI를 지휘하는 아이'로\n부모와 함께 만드는 4시간의 관점 전환", 14, MID_GRAY, ls=160)
    r += tb(pid, MARGIN_L + emu(0.1), emu(3.95), emu(5), emu(0.32),
            'Filamentree (HypeProof AI Lab)  ×  동아일보', 11, WHITE)
    img_id = uid()
    r += [_img(pid, img_id, 'https://hypeproof-ai.xyz/workshop/edu.png', emu(6.2), emu(1.3), emu(3.3), emu(1.92))]
    r += rect(pid, 0, emu(4.3), SW, emu(0.9), NAVY_LIGHT)
    metrics = [('4시간', '워크숍'), ('1:1', '부모-자녀 팀'), ('9개', '완성된 게임'), ('93%', '학부모 AI 필수 인식')]
    for i, (num, label) in enumerate(metrics):
        x = MARGIN_L + emu(0.1) + i * emu(2.35)
        r += tb(pid, x, emu(4.4), emu(1.0), emu(0.35), num, 20, ACCENT, True)
        r += tb(pid, x + emu(1.05), emu(4.47), emu(1.2), emu(0.25), label, FONT_BODY, WHITE)
        if i < 3:
            r += rect(pid, x + emu(2.2), emu(4.45), emu(0.02), emu(0.35), MID_GRAY)
    return r


def s02_market(pid, s):
    r = []
    r += section_header(pid, '01', '시장 기회: $43B', '한국은 아직 초기 — 선점 기회',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    r += tb(pid, MARGIN_L, emu(1.05), emu(4), emu(0.3), '글로벌 AI 교육 시장 규모', FONT_CARD_TITLE, PRIMARY, True)
    bars = [
        ('2024', 0.25, '$6.9B'), ('2025', 0.35, '$10B'), ('2026', 0.45, '$14B'),
        ('2027', 0.58, '$20B'), ('2028', 0.72, '$28B'), ('2029', 0.86, '$35B'), ('2030', 1.0, '$43B'),
    ]
    bar_base_y = emu(4.2)
    bar_max_h = emu(2.7)
    bw = emu(0.5)
    gap = emu(0.08)
    for i, (year, pct, val) in enumerate(bars):
        x = MARGIN_L + emu(0.1) + i * (bw + gap)
        h = int(bar_max_h * pct)
        y = bar_base_y - h
        c = ACCENT if i == len(bars) - 1 else (PRIMARY if i >= 4 else LIGHT_GRAY)
        r += rect(pid, x, y, bw, h, c)
        r += tb(pid, x, y - emu(0.22), bw, emu(0.2), val, FONT_BODY, ACCENT if i == len(bars) - 1 else DARK_GRAY, i == len(bars) - 1, 'CENTER')
        r += tb(pid, x, bar_base_y + emu(0.05), bw, emu(0.18), year, FONT_LABEL, MID_GRAY, a='CENTER')
    r += tb(pid, MARGIN_L + emu(0.1), emu(4.35), emu(2), emu(0.2), 'CAGR 41%  ↑', FONT_BODY, ACCENT, True)
    r += tb(pid, MARGIN_L + emu(0.1), emu(4.55), emu(3), emu(0.18), 'Source: Mordor Intelligence (2025)', FONT_CAPTION, MID_GRAY)
    cx = col2(1)
    r += card(pid, cx, emu(1.05), COL2_W, emu(1.8))
    r += rect(pid, cx, emu(1.05), emu(0.07), emu(1.8), ACCENT)
    r += tb(pid, cx + CARD_PAD, emu(1.15), emu(1.5), emu(0.6), '10×', FONT_STAT_BIG, ACCENT, True)
    r += tb(pid, cx + emu(1.8), emu(1.2), emu(2.2), emu(0.3), '한국 코딩교육 시장 성장', FONT_CARD_TITLE, PRIMARY, True)
    r += tb(pid, cx + emu(1.8), emu(1.5), emu(2.2), emu(0.7),
            '1,500억 → 1.5조원 (2030)\n2025 코딩교육 필수화 시행\n교육부 시수 2배 확대', FONT_BODY, DARK_GRAY, ls=140)
    r += tb(pid, cx + emu(1.8), emu(2.35), emu(2), emu(0.18), 'Source: 교육부, GII', FONT_CAPTION, MID_GRAY)
    r += card(pid, cx, emu(3.05), COL2_W, emu(1.8))
    r += rect(pid, cx, emu(3.05), emu(0.07), emu(1.8), PRIMARY)
    r += tb(pid, cx + CARD_PAD, emu(3.15), emu(1.5), emu(0.6), '93%', FONT_STAT_BIG, PRIMARY, True)
    r += tb(pid, cx + emu(1.8), emu(3.2), emu(2.2), emu(0.3), '학부모 AI 필수 역량 인식', FONT_CARD_TITLE, PRIMARY, True)
    r += tb(pid, cx + emu(1.8), emu(3.5), emu(2.2), emu(0.7),
            'AI·코딩을 국영수 수준의\n필수 역량으로 인식 (N=1,000)\n유료 교육 의향 87%', FONT_BODY, DARK_GRAY, ls=140)
    r += tb(pid, cx + emu(1.8), emu(4.15), emu(2), emu(0.18), 'Source: 한국경제·입소스', FONT_CAPTION, MID_GRAY)
    return r


def s03_problem(pid, s):
    r = []
    r += section_header(pid, '02', '3가지 구조적 한계',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    gaps = [
        {'label': 'GAP 1', 'title': '코딩 기술의 가치 급락', 'color': ACCENT,
         'stat': '90% → 60%', 'stat_label': '코딩 취업률 전망',
         'points': ['개발자 75% AI 도구 사용 예측', '코딩 스킬 시장 가치 구조적 하락', '프롬프트가 새로운 코딩']},
        {'label': 'GAP 2', 'title': '부모 배제형 교육', 'color': PRIMARY,
         'stat': '0%', 'stat_label': '기존 학원 부모 참여율',
         'points': ['아이만 수강, 부모는 대기실', '가정 내 확장·복습 불가', '"함께 배우는" 모델 전무']},
        {'label': 'GAP 3', 'title': '성취 경험의 부재', 'color': NAVY_LIGHT,
         'stat': '34시간', 'stat_label': '연간 학교 정보교육',
         'points': ['"내가 만들었다" 경험 없음', '완성물 없는 교육의 한계', '몰입형 프로젝트 학습 부재']},
    ]
    y = emu(1.1)
    for i, g in enumerate(gaps):
        x = col3(i)
        c = g['color']
        r += card(pid, x, y, COL3_W, emu(3.8))
        r += rect(pid, x, y, COL3_W, emu(0.06), c)
        r += rrect(pid, x + CARD_PAD, y + CARD_PAD, emu(0.75), emu(0.28), c)
        r += tb(pid, x + CARD_PAD, y + CARD_PAD + emu(0.02), emu(0.75), emu(0.24), g['label'], FONT_BODY, WHITE, True, 'CENTER')
        r += tb(pid, x + CARD_PAD, y + emu(0.52), COL3_W - CARD_PAD * 2, emu(0.3), g['title'], FONT_CARD_TITLE, PRIMARY, True)
        r += tb(pid, x + CARD_PAD, y + emu(0.9), COL3_W - CARD_PAD * 2, emu(0.5), g['stat'], FONT_STAT_BIG, c, True)
        r += tb(pid, x + CARD_PAD, y + emu(1.4), COL3_W - CARD_PAD * 2, emu(0.2), g['stat_label'], FONT_BODY, DARK_GRAY)
        r += rect(pid, x + CARD_PAD, y + emu(1.7), COL3_W - CARD_PAD * 2, emu(0.02), LIGHT_GRAY)
        py = y + emu(1.85)
        for pt in g['points']:
            r += rect(pid, x + CARD_PAD, py + emu(0.05), emu(0.05), emu(0.05), c)
            r += tb(pid, x + CARD_PAD + emu(0.15), py, COL3_W - CARD_PAD * 2 - emu(0.15), emu(0.3), pt, FONT_BODY, DARK_GRAY, ls=120)
            py += emu(0.4)
    r += rect(pid, MARGIN_L, emu(4.7), emu(0.06), emu(0.3), ACCENT)
    r += tb(pid, MARGIN_L + emu(0.25), emu(4.7), emu(8.5), emu(0.3),
            '"코딩 문법을 외우게 할 것인가, AI를 지휘하는 법을 알려줄 것인가?"', 11, PRIMARY, True, it=True)
    r += tb(pid, MARGIN_L, emu(5.0), emu(5), emu(0.15), 'Sources: Gartner (2025), 교육부, 한국교육과정평가원', FONT_CAPTION, MID_GRAY)
    return r


def s04_concept(pid, s):
    r = []
    r += section_header(pid, '03', '부모-자녀 Co-Founding', 'AI를 지휘하는 설계자를 키웁니다',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    child_x = col3(0)
    r += card(pid, child_x, emu(1.2), COL3_W, emu(2.2))
    r += rect(pid, child_x, emu(1.2), COL3_W, emu(0.55), ACCENT)
    r += tb(pid, child_x + CARD_PAD, emu(1.25), COL3_W - CARD_PAD * 2, emu(0.2), 'VISIONARY', FONT_BODY, WHITE, True)
    r += tb(pid, child_x + CARD_PAD, emu(1.42), COL3_W - CARD_PAD * 2, emu(0.22), '자녀', 14, WHITE, True)
    r += tb(pid, child_x + CARD_PAD, emu(1.9), COL3_W - CARD_PAD * 2, emu(1.3),
            '무한한 상상력으로 아이디어 발산\n"하늘 나는 고양이를 만들래!"\nAI에게 직접 지시하고\n결과를 확인하는 경험', 10, DARK_GRAY, ls=145)
    ai_x = col3(1)
    r += rrect(pid, ai_x, emu(1.4), COL3_W, emu(1.8), LIGHT_GRAY)
    r += rect(pid, ai_x, emu(1.4), COL3_W, emu(0.06), ACCENT)
    r += tb(pid, ai_x, emu(1.7), COL3_W, emu(0.5), 'AI', 24, ACCENT, True, 'CENTER')
    r += tb(pid, ai_x, emu(2.1), COL3_W, emu(0.25), 'EXECUTOR', 10, DARK_GRAY, True, 'CENTER')
    r += tb(pid, ai_x + CARD_PAD, emu(2.4), COL3_W - CARD_PAD * 2, emu(0.5),
            '지시받은 대로 코드를 작성\n10초 만에 결과물 생성', FONT_LABEL, MID_GRAY, a='CENTER', ls=130)
    parent_x = col3(2)
    r += card(pid, parent_x, emu(1.2), COL3_W, emu(2.2))
    r += rect(pid, parent_x, emu(1.2), COL3_W, emu(0.55), PRIMARY)
    r += tb(pid, parent_x + CARD_PAD, emu(1.25), COL3_W - CARD_PAD * 2, emu(0.2), 'INTEGRATOR', FONT_BODY, WHITE, True)
    r += tb(pid, parent_x + CARD_PAD, emu(1.42), COL3_W - CARD_PAD * 2, emu(0.42), '부모', 14, WHITE, True)
    r += tb(pid, parent_x + CARD_PAD, emu(1.9), COL3_W - CARD_PAD * 2, emu(1.3),
            '현실 감각으로 구조화·구체화\n"날개는 어떤 버튼으로 펴?"\n기획서를 함께 정리하는\n디지털 파트너', 10, DARK_GRAY, ls=145)
    arrow1_x = col3(0) + COL3_W
    r += [_sh(pid, uid(), arrow1_x + emu(0.05), emu(1.95), emu(0.2), emu(0.35), 'RIGHT_ARROW')]
    r += [{'updateShapeProperties': {'objectId': r[-1]['createShape']['objectId'],
        'shapeProperties': {'shapeBackgroundFill': {'solidFill': {'color': {'rgbColor': ACCENT}}},
            'outline': {'outlineFill': {'solidFill': {'color': {'rgbColor': ACCENT}}}, 'weight': {'magnitude': 0.5, 'unit': 'PT'}}},
        'fields': 'shapeBackgroundFill,outline'}}]
    arrow2_x = col3(2)
    r += [_sh(pid, uid(), arrow2_x - emu(0.25), emu(1.95), emu(0.2), emu(0.35), 'LEFT_ARROW')]
    r += [{'updateShapeProperties': {'objectId': r[-1]['createShape']['objectId'],
        'shapeProperties': {'shapeBackgroundFill': {'solidFill': {'color': {'rgbColor': PRIMARY}}},
            'outline': {'outlineFill': {'solidFill': {'color': {'rgbColor': PRIMARY}}}, 'weight': {'magnitude': 0.5, 'unit': 'PT'}}},
        'fields': 'shapeBackgroundFill,outline'}}]
    r += rect(pid, MARGIN_L, emu(3.65), CONTENT_W, emu(0.02), LIGHT_GRAY)
    r += tb(pid, MARGIN_L, emu(3.8), emu(3), emu(0.26), '핵심 역량 3가지', 10, PRIMARY, True, ls=100)
    comps = [
        ('맥락 설계', 'Context Engineering', 'AI에게 올바른 지시를 내리는\n논리적 사고력', ACCENT),
        ('의사결정', 'Decision Making', '무엇을 만들고 무엇을 포기할지\n판단하는 능력', PRIMARY),
        ('협업 리더십', 'Collaborative Leadership', '사람(부모)과 AI를 동시에\n지휘하는 경험', NAVY_LIGHT),
    ]
    for i, (ko, en, desc, c) in enumerate(comps):
        x = col3(i)
        r += card(pid, x, emu(4.0), COL3_W, emu(0.9))
        r += rect(pid, x, emu(4.0), emu(0.06), emu(0.9), c)
        r += tb(pid, x + CARD_PAD, emu(4.05), COL3_W - CARD_PAD * 2, emu(0.25), ko, FONT_CARD_TITLE, c, True)
        r += tb(pid, x + CARD_PAD, emu(4.28), COL3_W - CARD_PAD * 2, emu(0.2), en, FONT_LABEL, MID_GRAY)
        r += tb(pid, x + CARD_PAD, emu(4.48), COL3_W - CARD_PAD * 2, emu(0.45), desc, FONT_BODY, DARK_GRAY, ls=130)
    return r


def s05_curriculum(pid, s):
    r = []
    r += section_header(pid, '04', '4시간 몰입 커리큘럼', '"내 게임"을 완성하는 경험',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    bar_y = emu(1.1)
    times = [(40, ACCENT), (50, PRIMARY), (90, NAVY_LIGHT), (60, ACCENT)]
    total_min = sum(t for t, _ in times)
    x = MARGIN_L
    for i, (mins, c) in enumerate(times):
        w = int(CONTENT_W * mins / total_min)
        r += rect(pid, x, bar_y, w, emu(0.12), c)
        r += tb(pid, x, bar_y - emu(0.2), w, emu(0.18), f'{mins}분', FONT_CAPTION, c, True, 'CENTER')
        x += w
    phases = s['phases']
    sy = emu(1.45)
    phase_widths = [emu(1.90), emu(2.05), emu(2.70), emu(1.90)]
    phase_gap = emu(0.15)
    colors = [ACCENT, PRIMARY, NAVY_LIGHT, ACCENT]
    px = MARGIN_L
    for i, p in enumerate(phases):
        x = px
        w = phase_widths[i]
        c = colors[i]
        r += card(pid, x, sy, w, emu(3.3))
        r += rect(pid, x, sy, w, emu(0.55), c)
        r += tb(pid, x + CARD_PAD, sy + emu(0.03), w - CARD_PAD * 2, emu(0.2), f'Part {i+1}', FONT_LABEL, WHITE, True)
        r += tb(pid, x + CARD_PAD, sy + emu(0.22), w - CARD_PAD * 2, emu(0.3), p['name'], 11, WHITE, True)
        r += tb(pid, x + CARD_PAD, sy + emu(0.65), w - CARD_PAD * 2, emu(0.7), p['desc'], FONT_BODY, DARK_GRAY, ls=150)
        r += rect(pid, x + CARD_PAD, sy + emu(1.4), w - CARD_PAD * 2, emu(0.02), LIGHT_GRAY)
        r += tb(pid, x + CARD_PAD, sy + emu(1.5), w - CARD_PAD * 2, emu(0.2), '핵심 포인트', FONT_LABEL, c, True)
        r += tb(pid, x + CARD_PAD, sy + emu(1.7), w - CARD_PAD * 2, emu(1.0), p['highlight'], FONT_LABEL, PRIMARY, ls=150)
        px += w + phase_gap
    r += rrect(pid, MARGIN_L, emu(4.75), CONTENT_W, emu(0.25), ACCENT_LIGHT)
    r += rect(pid, MARGIN_L, emu(4.75), emu(0.05), emu(0.25), ACCENT)
    r += tb(pid, MARGIN_L + emu(0.2), emu(4.77), emu(5), emu(0.2),
            '10초 피드백 루프: AI 지시 → 즉시 결과 → 수정 → 반복', 10, ACCENT, True, ls=100)
    r += tb(pid, emu(5.8), emu(4.77), emu(3.5), emu(0.2),
            '5개 시상 카테고리: 모든 팀이 수상', 10, PRIMARY, True, ls=100)
    return r


def s06_partnership(pid, s):
    r = []
    r += section_header(pid, '05', 'AI 교육 시장 선점', '기존 자산만으로 참여 가능',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    r += rrect(pid, MARGIN_L, emu(1.05), CONTENT_W, emu(0.45), ACCENT_LIGHT)
    r += rect(pid, MARGIN_L, emu(1.05), emu(0.06), emu(0.45), ACCENT)
    r += tb(pid, MARGIN_L + emu(0.25), emu(1.08), CONTENT_W - emu(0.35), emu(0.2),
            '조선일보: 에듀조선(뉴지엄·기자체험관)으로 K-12 체험 교육 운영 중', 10, PRIMARY, True, ls=100)
    r += tb(pid, MARGIN_L + emu(0.25), emu(1.28), CONTENT_W - emu(0.35), emu(0.2),
            '→ 동아일보의 빈 칸을 먼저 채우는 기회', 10, ACCENT, True, ls=100)
    ly = emu(1.7)
    lx = col2(0)
    r += card(pid, lx, ly, COL2_W, emu(2.8))
    r += rect(pid, lx, ly, COL2_W, emu(0.45), LIGHT_GRAY)
    r += tb(pid, lx + CARD_PAD, ly + emu(0.08), emu(2.5), emu(0.3), '동아일보 투입', FONT_CARD_TITLE, PRIMARY, True)
    r += rrect(pid, lx + emu(2.8), ly + emu(0.08), emu(1.3), emu(0.25), GREEN_SOFT)
    r += tb(pid, lx + emu(2.8), ly + emu(0.1), emu(1.3), emu(0.2), '추가비용 없음', FONT_LABEL, WHITE, True, 'CENTER')
    items_l = [
        ('브랜드', '"동아일보 × Future AI Leader\'s Academy" 공동 명칭'),
        ('공간', '동아미디어센터 또는 기존 교육장 (월 1~2회)'),
        ('홍보', '어린이동아·동아닷컴·교육섹션 기존 채널 활용'),
        ('네트워크', '동아이지에듀 구독자·미디어프론티어 수료생 연계'),
    ]
    iy = ly + emu(0.55)
    for label, desc in items_l:
        r += tb(pid, lx + CARD_PAD, iy, emu(0.8), emu(0.2), label, FONT_BODY, PRIMARY, True)
        r += tb(pid, lx + CARD_PAD + emu(0.85), iy, emu(3.1), emu(0.2), desc, FONT_BODY, DARK_GRAY)
        iy += emu(0.38)
    rx = col2(1)
    r += card(pid, rx, ly, COL2_W, emu(2.8))
    r += rect(pid, rx, ly, COL2_W, emu(0.45), ACCENT)
    r += tb(pid, rx + CARD_PAD, ly + emu(0.08), emu(3), emu(0.3), '동아일보 수익', FONT_CARD_TITLE, WHITE, True)
    items_r = [
        ('AI 교육 브랜드', '조선 에듀조선 대비 차별화된 AI 교육 포지셔닝'),
        ('신규 매출', '워크숍 수익 분배 (수수료 또는 정액)'),
        ('콘텐츠', '워크숍 기반 기사·영상 콘텐츠 무상 확보'),
        ('고객 데이터', '학부모/학생 관심사 DB → 구독 전환 연계'),
    ]
    iy = ly + emu(0.55)
    for label, desc in items_r:
        r += rect(pid, rx + CARD_PAD, iy + emu(0.04), emu(0.05), emu(0.05), ACCENT)
        r += tb(pid, rx + CARD_PAD + emu(0.13), iy, emu(1.0), emu(0.2), label, FONT_BODY, ACCENT, True)
        r += tb(pid, rx + CARD_PAD + emu(1.18), iy, emu(2.9), emu(0.2), desc, FONT_BODY, DARK_GRAY)
        iy += emu(0.38)
    r += rect(pid, 0, emu(4.55), SW, emu(0.45), PRIMARY)
    r += tb(pid, MARGIN_L, emu(4.6), emu(4), emu(0.2), '동아일보 AI 교육 포트폴리오의 빈 칸', 10, ACCENT, True, ls=100)
    r += tb(pid, MARGIN_L, emu(4.8), CONTENT_W, emu(0.18),
            '미디어 프론티어(성인)  ·  동아이지에듀(초중고 구독)  ·  DBR에듀(직장인)  →  초중등+학부모 유료 AI 교육 = 없음', FONT_BODY, WHITE)
    return r


def s07_roadmap(pid, s):
    r = []
    r += section_header(pid, '06', '실행 로드맵', '파일럿 → 확산 → 스케일업',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    phases = s['phases']
    colors = [ACCENT, PRIMARY, NAVY_LIGHT]
    y = emu(1.1)
    r += rect(pid, MARGIN_L, y + emu(0.15), CONTENT_W, emu(0.04), LIGHT_GRAY)
    for i, p in enumerate(phases):
        x = col3(i)
        c = colors[i]
        r += rrect(pid, x + emu(1.15), y, emu(0.4), emu(0.35), c)
        r += tb(pid, x + emu(1.15), y + emu(0.02), emu(0.4), emu(0.3), str(i + 1), 13, WHITE, True, 'CENTER')
        cy = y + emu(0.55)
        r += card(pid, x, cy, COL3_W, emu(2.6))
        r += rect(pid, x, cy, COL3_W, emu(0.06), c)
        r += tb(pid, x + CARD_PAD, cy + CARD_PAD, COL3_W - CARD_PAD * 2, emu(0.25), p['name'], FONT_CARD_TITLE, c, True)
        r += tb(pid, x + CARD_PAD, cy + emu(0.4), COL3_W - CARD_PAD * 2, emu(0.2), p['period'], FONT_BODY, MID_GRAY)
        iy = cy + emu(0.7)
        for item in p['items']:
            r += rect(pid, x + CARD_PAD, iy + emu(0.05), emu(0.05), emu(0.05), c)
            r += tb(pid, x + CARD_PAD + emu(0.15), iy, COL3_W - CARD_PAD * 2 - emu(0.15), emu(0.22), item, FONT_BODY, DARK_GRAY)
            iy += emu(0.28)
        r += rrect(pid, x + CARD_PAD, cy + emu(1.9), COL3_W - CARD_PAD * 2, emu(0.55), LIGHT_GRAY)
        r += rect(pid, x + CARD_PAD, cy + emu(1.9), COL3_W - CARD_PAD * 2, emu(0.04), c)
        r += tb(pid, x + CARD_PAD + emu(0.1), cy + emu(2.0), COL3_W - CARD_PAD * 2 - emu(0.2), emu(0.4), p['kpi'], FONT_BODY, c, True, ls=130)
    r += rect(pid, MARGIN_L, emu(4.25), CONTENT_W, emu(0.02), LIGHT_GRAY)
    kpis = [('15팀', '파일럿 목표'), ('학교 3곳', '확산 제휴'), ('월 3회', '손익분기'), ('₩93M', '연간 매출 전망')]
    for i, (num, label) in enumerate(kpis):
        x = MARGIN_L + i * emu(2.35)
        r += tb(pid, x, emu(4.45), emu(1.2), emu(0.2), num, 14, ACCENT, True)
        r += tb(pid, x + emu(1.25), emu(4.47), emu(1.0), emu(0.18), label, FONT_LABEL, MID_GRAY)
    return r


def s08_faculty(pid, s):
    r = []
    r += section_header(pid, '07', '핵심 팀', '실리콘밸리 + CERN + AI 전문가',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    members = s['members']
    colors = [ACCENT, PRIMARY, NAVY_LIGHT, MID_GRAY]
    cw = COL4_W
    for i, m in enumerate(members):
        x = col4(i)
        y = emu(1.05)
        c = colors[i]
        r += card(pid, x, y, cw, emu(3.8))
        r += rect(pid, x, y, cw, emu(0.06), c)
        photo_w = emu(1.0)
        photo_x = x + (cw - photo_w) // 2
        photo_url = m.get('photo')
        if photo_url:
            img_id = uid()
            r += [_img(pid, img_id, photo_url, photo_x, y + emu(0.2), photo_w, photo_w)]
        else:
            r += rrect(pid, photo_x, y + emu(0.2), photo_w, photo_w, LIGHT_GRAY)
            r += tb(pid, photo_x, y + emu(0.5), photo_w, emu(0.4), m.get('icon', '+'), 20, MID_GRAY, a='CENTER')
        r += tb(pid, x + CARD_PAD, y + emu(1.3), cw - CARD_PAD * 2, emu(0.25), m['name'], 11, PRIMARY, True, 'CENTER')
        badge_w = cw - emu(0.5)
        badge_x = x + (cw - badge_w) // 2
        r += rrect(pid, badge_x, y + emu(1.6), badge_w, emu(0.25), c)
        r += tb(pid, badge_x, y + emu(1.62), badge_w, emu(0.22), m['role'], FONT_LABEL, WHITE, True, 'CENTER')
        r += tb(pid, x + CARD_PAD, y + emu(1.92), cw - CARD_PAD * 2, emu(0.2), m['org'], FONT_LABEL, MID_GRAY, a='CENTER')
        r += rect(pid, x + CARD_PAD + emu(0.05), y + emu(2.18), cw - CARD_PAD * 2 - emu(0.1), emu(0.02), LIGHT_GRAY)
        r += tb(pid, x + CARD_PAD, y + emu(2.28), cw - CARD_PAD * 2, emu(1.4), m['creds'], FONT_LABEL, DARK_GRAY, a='CENTER', ls=145)
    return r


def s09_closing(pid, s):
    r = []
    r += section_header(pid, '08', '검증과 제안', '프로그램 실적 + 비즈니스 모델',
                        accent=ACCENT, primary=PRIMARY, mid_gray=MID_GRAY, light_gray=LIGHT_GRAY)
    left_x = col2(0)
    r += card(pid, left_x, emu(1.05), emu(5.0), emu(2.0))
    r += rect(pid, left_x, emu(1.05), emu(5.0), emu(0.4), PRIMARY)
    r += tb(pid, left_x + CARD_PAD, emu(1.1), emu(3), emu(0.3), '실적', FONT_CARD_TITLE, WHITE, True)
    achs = [
        '워크숍 1회 완료 — 피드백 확보',
        '게임 9개 완성 — 전원 플레이 가능',
        '재참여 의향 100% (전원 응답)',
    ]
    ay = emu(1.6)
    for a in achs:
        r += rect(pid, left_x + CARD_PAD, ay + emu(0.05), emu(0.05), emu(0.05), ACCENT)
        r += tb(pid, left_x + CARD_PAD + emu(0.2), ay, emu(4.4), emu(0.25), a, FONT_BODY, DARK_GRAY)
        ay += emu(0.32)
    right_x = emu(5.8)
    r += card(pid, right_x, emu(1.05), emu(3.7), emu(2.0))
    r += rect(pid, right_x, emu(1.05), emu(3.7), emu(0.4), ACCENT)
    r += tb(pid, right_x + CARD_PAD, emu(1.1), emu(3), emu(0.3), '비즈니스 모델', FONT_CARD_TITLE, WHITE, True)
    biz = [('₩200,000', '/팀 (부모+자녀)'), ('₩3~4M', '/회 매출 (15팀)'), ('₩93M', '연간 전망'), ('월 3회', '손익분기')]
    by = emu(1.55)
    for num, label in biz:
        r += tb(pid, right_x + CARD_PAD, by, emu(1.5), emu(0.25), num, 13, ACCENT, True)
        r += tb(pid, right_x + CARD_PAD + emu(1.5), by + emu(0.02), emu(1.8), emu(0.2), label, FONT_BODY, DARK_GRAY)
        by += emu(0.3)
    banner_w = CONTENT_W
    banner_h = int(banner_w / 5.46)
    img_id2 = uid()
    r += [_img(pid, img_id2, 'https://hypeproof-ai.xyz/workshop/banner.png', MARGIN_L, emu(3.2), banner_w, banner_h)]
    r += rect(pid, 0, emu(4.1), SW, emu(0.75), PRIMARY)
    r += rect(pid, MARGIN_L, emu(4.2), emu(0.05), emu(0.4), ACCENT)
    r += tb(pid, MARGIN_L + emu(0.25), emu(4.15), emu(7), emu(0.6),
            '"AI가 어렵지 않다는 것을 배웠습니다.\n아이와 처음으로 무언가를 함께 완성했습니다."', 13, WHITE, True, ls=120)
    r += tb(pid, emu(8.0), emu(4.2), emu(1.5), emu(0.2), '— 참가 학부모', FONT_LABEL, MID_GRAY, a='END', it=True)
    r += tb(pid, MARGIN_L, emu(4.8), emu(2), emu(0.2), 'NEXT STEP', FONT_CARD_TITLE, ACCENT, True)
    r += tb(pid, MARGIN_L, emu(4.95), CONTENT_W, emu(0.2),
            '파일럿 워크숍 1회, 함께 시작하시죠.', 11, WHITE, True)
    return r


# ============================================================
# SLIDE DATA + DISPATCH
# ============================================================

SLIDES = [
    {"build": "01"}, {"build": "02"},
    {"build": "03"}, {"build": "04"},
    {"build": "05", "phases": [
        {"name": "관점의 전환", "time": "40분", "desc": "AI 라이브 데모로 충격과 호기심\n노동자 vs 건축가 관점 전환", "highlight": "핵심 질문:\n벽돌을 나를 것인가, 설계할 것인가?"},
        {"name": "협업과 조율", "time": "50분", "desc": "샘플 게임 분석 후 기획서 작성\n아이: 상상, 부모: 구조화", "highlight": "산출물:\n부모-자녀 공동 게임 기획서 1부"},
        {"name": "지휘와 소통", "time": "90분", "desc": "AI에게 직접 지시하여 게임 제작\n10초 피드백 루프로 즉시 확인", "highlight": "완성물:\n실제 플레이 가능한 게임 1개"},
        {"name": "성취와 비전", "time": "60분", "desc": "팀별 발표와 시상식 진행\n5개 카테고리로 모든 팀 수상", "highlight": "시상:\n최고창의/협업/기술/스토리/MVP"},
    ]},
    {"build": "06"}, {"build": "07", "phases": [
        {"name": "파일럿", "period": "1~2개월", "items": ["프로그램 검증", "1차 워크숍", "피드백 수집·개선"], "kpi": "NPS 80%+\n참가 15팀"},
        {"name": "확산", "period": "3~6개월", "items": ["정기 클래스 운영", "학교 제휴 확보", "월 4회 체계"], "kpi": "월 ₩12M\n학교 3곳 제휴"},
        {"name": "스케일업", "period": "6~12개월", "items": ["기업 CSR 연계", "강사 양성", "온라인 SaaS"], "kpi": "연 ₩93M\n온라인 MVP"},
    ]},
    {"build": "08", "members": [
        {"name": "이재원 (Jay)", "role": "Product Lead", "org": "Sonatus (Silicon Valley Unicorn)",
         "photo": "https://hypeproof-ai.xyz/members/jay.png",
         "creds": "실제 워크숍 기획·운영 경험\nAI 제품 전략 10년+\nSilicon Valley SW Engineer\n제품 설계 & 팀 리딩"},
        {"name": "김지웅 (Ryan)", "role": "Tech Lead", "org": "Filamentree",
         "photo": "https://hypeproof-ai.xyz/members/ryan.png",
         "creds": "前 CERN 연구원 (입자물리)\nAX·R&D 팀 리더\n과학 교육 커리큘럼 설계\nPhD Particle Physics"},
        {"name": "신진용 (JY)", "role": "Content Lead", "org": "Remember",
         "photo": "https://hypeproof-ai.xyz/members/jy.png",
         "creds": "AI/ML 엔지니어\nAgentic AI 전문가\nAI 교육 콘텐츠 개발\nML Ops & LLM 실전 경험"},
        {"name": "+ 전문 강사풀", "role": "확장 예정", "org": "파트너 네트워크",
         "icon": "+",
         "creds": "교육 전공 강사 영입\n스케일업 단계\n지역별 강사 배치\n온라인 강의 제작"},
    ]},
    {"build": "09"},
]

BUILDERS = {
    '01': s01_title, '02': s02_market, '03': s03_problem, '04': s04_concept,
    '05': s05_curriculum, '06': s06_partnership, '07': s07_roadmap, '08': s08_faculty,
    '09': s09_closing,
}


def main():
    """Generate the academy proposal presentation."""
    import yaml

    deck_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'deck.yaml')
    if os.path.exists(deck_path):
        with open(deck_path, encoding='utf-8') as f:
            config = yaml.safe_load(f)
        title = config.get('title', "Future AI Leader's Academy")
    else:
        title = "Future AI Leader's Academy — 동아일보 제안 v11"

    url, pid = generate(title, SLIDES, BUILDERS)
    print(f'\nPresentation ID: {pid}')
    return url


if __name__ == '__main__':
    main()
