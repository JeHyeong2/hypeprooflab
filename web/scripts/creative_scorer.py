#!/usr/bin/env python3
"""
창작물 채점 스크립트 (구조 체크만 — LLM 판단은 Herald에게)

Usage: python3 creative_scorer.py <file.md>

10개 기준, 100점 만점:
  캐릭터 음성 일관성  15점
  세계관 내적 논리    15점
  서사 구조          15점
  문체 일관성        10점
  감정 아크          10점
  대화 자연스러움     10점
  독창성            10점
  몰입도             5점
  테마 깊이           5점
  가독성             5점
"""

import sys
import re
import json
from pathlib import Path
from dataclasses import dataclass, field, asdict

CRITERIA = [
    ("character_voice", "캐릭터 음성 일관성", 15),
    ("worldbuilding", "세계관 내적 논리", 15),
    ("narrative_structure", "서사 구조", 15),
    ("style_consistency", "문체 일관성", 10),
    ("emotional_arc", "감정 아크", 10),
    ("dialogue", "대화 자연스러움", 10),
    ("originality", "독창성", 10),
    ("immersion", "몰입도", 5),
    ("theme_depth", "테마 깊이", 5),
    ("readability", "가독성", 5),
]


@dataclass
class ScoreResult:
    scores: dict = field(default_factory=dict)
    total: int = 0
    notes: list = field(default_factory=list)

    def add(self, key: str, score: int, note: str = ""):
        self.scores[key] = score
        self.total += score
        if note:
            self.notes.append(f"[{key}] {note}")


def count_words(text: str) -> int:
    # Korean: count characters; mixed: rough word count
    korean = len(re.findall(r"[\uac00-\ud7af]", text))
    english = len(re.findall(r"[a-zA-Z]+", text))
    return korean + english


def count_dialogues(text: str) -> int:
    return len(re.findall(r'[""「」『』]', text)) // 2


def count_paragraphs(text: str) -> int:
    return len([p for p in text.split("\n\n") if p.strip()])


def count_headings(text: str) -> int:
    return len(re.findall(r"^#{1,6}\s", text, re.MULTILINE))


def avg_sentence_length(text: str) -> float:
    sentences = re.split(r"[.!?。！？]\s*", text)
    sentences = [s for s in sentences if s.strip()]
    if not sentences:
        return 0
    return sum(len(s) for s in sentences) / len(sentences)


def score_file(filepath: str) -> ScoreResult:
    text = Path(filepath).read_text(encoding="utf-8")
    result = ScoreResult()

    words = count_words(text)
    dialogues = count_dialogues(text)
    paragraphs = count_paragraphs(text)
    headings = count_headings(text)
    avg_sent = avg_sentence_length(text)

    # --- Structural heuristics (not LLM-level, just basics) ---

    # 서사 구조: headings + paragraphs로 대략 판단
    if headings >= 5 and paragraphs >= 10:
        result.add("narrative_structure", 12, "구조적으로 잘 나뉨")
    elif headings >= 2 or paragraphs >= 5:
        result.add("narrative_structure", 8, "기본 구조 있음")
    else:
        result.add("narrative_structure", 3, "구조 부족")

    # 대화 자연스러움: 대화 존재 여부
    if dialogues >= 10:
        result.add("dialogue", 8, f"대화 {dialogues}쌍 감지")
    elif dialogues >= 3:
        result.add("dialogue", 5, f"대화 {dialogues}쌍 감지")
    else:
        result.add("dialogue", 2, "대화 적음 — Herald 리뷰 필요")

    # 가독성: 평균 문장 길이
    if 20 <= avg_sent <= 60:
        result.add("readability", 4, f"평균 문장 {avg_sent:.0f}자")
    elif avg_sent < 20:
        result.add("readability", 3, "문장이 매우 짧음")
    else:
        result.add("readability", 2, "문장이 길어 가독성 저하 우려")

    # 분량 → 몰입도 proxy
    if words >= 3000:
        result.add("immersion", 4, f"분량 {words}자 — 충분")
    elif words >= 1000:
        result.add("immersion", 3, f"분량 {words}자")
    else:
        result.add("immersion", 1, f"분량 {words}자 — 짧음")

    # 나머지는 LLM 판단 필요 → placeholder
    for key, label, max_score in CRITERIA:
        if key not in result.scores:
            result.add(key, 0, f"[{label}] Herald LLM 리뷰 필요 (max {max_score}점)")

    return result


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 creative_scorer.py <file.md>")
        sys.exit(1)

    filepath = sys.argv[1]
    if not Path(filepath).exists():
        print(f"Error: {filepath} not found")
        sys.exit(1)

    result = score_file(filepath)

    print(f"\n🎨 Creative Score Report: {filepath}")
    print(f"{'=' * 50}")
    for key, label, max_score in CRITERIA:
        score = result.scores.get(key, 0)
        bar = "█" * score + "░" * (max_score - score)
        print(f"  {label:<12} {bar} {score}/{max_score}")
    print(f"{'=' * 50}")
    print(f"  총점: {result.total}/100")
    print()
    for note in result.notes:
        print(f"  💡 {note}")

    # JSON output for programmatic use
    print(f"\n📊 JSON:\n{json.dumps(asdict(result), ensure_ascii=False, indent=2)}")


if __name__ == "__main__":
    main()
