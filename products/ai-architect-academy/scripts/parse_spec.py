#!/usr/bin/env python3
"""
Parse SPEC.md into slide-content.json.

Usage: python3 parse_spec.py [--spec SPEC.md] [--output output/slide-content.json]

Reads SPEC.md sections and maps them to the 9-slide structure
used by generate_gslides.py.
"""
import argparse
import json
import os
import re


def parse_sections(text: str) -> dict[str, str]:
    """Split SPEC.md by ## headers into {section_title: content}."""
    sections = {}
    current = None
    lines = []
    for line in text.splitlines():
        m = re.match(r'^## (\d+)\.\s+(.+)', line)
        if m:
            if current:
                sections[current] = '\n'.join(lines).strip()
            current = f'{m.group(1)}. {m.group(2)}'
            lines = []
        elif current:
            lines.append(line)
    if current:
        sections[current] = '\n'.join(lines).strip()
    return sections


def extract_table_rows(text: str) -> list[list[str]]:
    """Extract markdown table rows as list of lists."""
    rows = []
    for line in text.splitlines():
        line = line.strip()
        if line.startswith('|') and '---' not in line:
            cells = [c.strip().strip('*') for c in line.split('|')[1:-1]]
            rows.append(cells)
    return rows


def build_slide_content(sections: dict[str, str]) -> dict:
    """Map SPEC sections to the SLIDES format used by generate_gslides.py."""
    slides = []

    # Slide 1: Title (§1)
    s1 = sections.get('1. 프로그램 개요', '')
    rows = extract_table_rows(s1)
    row_map = {r[0]: r[1] for r in rows if len(r) >= 2}
    slides.append({
        'build': '01',
        'title': row_map.get('정식명', "Future AI Leader's Academy"),
        'subtitle': row_map.get('부제', ''),
        'partner': f"{row_map.get('운영', '')}  ×  {row_map.get('파트너', '')}",
    })

    # Slide 2: Market (§2) — no extra data needed, hardcoded in builder
    slides.append({'build': '02'})

    # Slide 3: Problem (§3) — no extra data needed
    slides.append({'build': '03'})

    # Slide 4: Concept (§4) — no extra data needed
    slides.append({'build': '04'})

    # Slide 5: Curriculum (§5)
    s5 = sections.get('5. 커리큘럼: 4시간, 4단계 (Action Plan)', '')
    parts = re.findall(r'### Part (\d): (.+?) \((\d+)min\)', s5)
    part_texts = re.split(r'### Part \d:', s5)[1:]

    phases_5 = []
    highlights_map = {
        '1': '핵심 질문:\n직접 벽돌을 나를 것인가,\n설계도를 그릴 것인가?',
        '2': '산출물:\n부모-자녀 공동\n게임 기획서 1부',
        '3': '10초 피드백 루프:\n지시→결과→수정→반복\n실제 게임 완성',
        '4': '시상 카테고리:\n최고창의/최고협업\n최고기술/최고스토리/MVP',
    }
    for i, (num, name, time) in enumerate(parts):
        # Extract bullet points as description
        desc_lines = []
        if i < len(part_texts):
            for line in part_texts[i].splitlines():
                line = line.strip()
                if line.startswith('- '):
                    desc_lines.append(line[2:])
        desc = '\n'.join(desc_lines[:3]) if desc_lines else ''
        phases_5.append({
            'name': name.strip(),
            'time': f'{time}분',
            'desc': desc,
            'highlight': highlights_map.get(num, ''),
        })
    slides.append({'build': '05', 'phases': phases_5})

    # Slide 6: Partnership (§6) — no extra data needed
    slides.append({'build': '06'})

    # Slide 7: Roadmap (§7)
    s7 = sections.get('7. 로드맵 & 성과 (Roadmap & Outcome)', '')
    phase_matches = re.findall(r'### Phase (\d): (.+?) \((.+?)\)', s7)
    phases_7 = []
    kpi_map = {
        '1': 'NPS 80%+\n참가 15팀',
        '2': '월 ₩12M\n학교 3곳 제휴',
        '3': '연 ₩93M\n온라인 MVP',
    }
    roadmap_items = {
        '1': ['프로그램 검증', '1차 워크숍', '피드백 수집·개선'],
        '2': ['정기 클래스 운영', '학교 제휴 확보', '월 4회 체계'],
        '3': ['기업 CSR 연계', '강사 양성', '온라인 SaaS'],
    }
    for num, name, period in phase_matches:
        phases_7.append({
            'name': name.strip(),
            'period': period.strip(),
            'items': roadmap_items.get(num, []),
            'kpi': kpi_map.get(num, ''),
        })
    slides.append({'build': '07', 'phases': phases_7})

    # Slide 8: Faculty (§8)
    s8 = sections.get('8. Faculty', '')
    fac_rows = extract_table_rows(s8)
    members = []
    if len(fac_rows) > 1:  # skip header row
        for row in fac_rows[1:]:
            if len(row) >= 4:
                members.append({
                    'name': row[0],
                    'role': row[3] if row[3] != '-' else row[1],
                    'org': row[2],
                    'creds': row[1],
                })
    slides.append({'build': '08', 'members': members})

    # Slide 9: Closing (§9, §10)
    slides.append({'build': '09'})

    return {'title': "Future AI Leader's Academy — 동아일보 제안", 'slides': slides}


def main():
    parser = argparse.ArgumentParser(description='Parse SPEC.md into slide-content.json')
    parser.add_argument('--spec', default=os.path.join(os.path.dirname(__file__), '..', 'SPEC.md'))
    parser.add_argument('--output', default=os.path.join(os.path.dirname(__file__), '..', 'output', 'slide-content.json'))
    args = parser.parse_args()

    with open(args.spec, encoding='utf-8') as f:
        spec_text = f.read()

    sections = parse_sections(spec_text)
    print(f'📄 Parsed {len(sections)} sections from {args.spec}')

    content = build_slide_content(sections)
    print(f'📊 Generated {len(content["slides"])} slides')

    os.makedirs(os.path.dirname(os.path.abspath(args.output)), exist_ok=True)
    with open(args.output, 'w', encoding='utf-8') as f:
        json.dump(content, f, ensure_ascii=False, indent=2)
    print(f'✅ Saved: {args.output}')


if __name__ == '__main__':
    main()
