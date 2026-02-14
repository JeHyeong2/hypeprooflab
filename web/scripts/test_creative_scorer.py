#!/usr/bin/env python3
"""Tests for creative_scorer.py"""

import sys
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from creative_scorer import score_file, count_words, count_dialogues, count_paragraphs

SAMPLE_NOVEL = """# 제1장 시작

어둠 속에서 눈을 떴다. 차가운 바닥이 등을 눌렀다.

"여기가 어디지?" 그가 중얼거렸다.

"조용히 해." 옆에서 낮은 목소리가 들렸다.

## 두 번째 장면

그들은 긴 복도를 걸었다. 벽에는 이상한 문양이 새겨져 있었다.

"이건 뭐야?" 그녀가 물었다.

"모르겠어. 하지만 느낌이 좋지 않아."

세 번째 방에 들어서자 갑자기 빛이 쏟아졌다.

## 세 번째 장면

결국 그들은 출구를 찾았다. 밖에는 익숙한 풍경이 펼쳐져 있었다.

"돌아왔어." 그녀가 미소 지었다.

끝.
"""

SAMPLE_SHORT = "짧은 글."


def write_temp(content: str) -> str:
    f = tempfile.NamedTemporaryFile(mode="w", suffix=".md", delete=False, encoding="utf-8")
    f.write(content)
    f.close()
    return f.name


def test_count_words():
    assert count_words("hello world") == 2
    assert count_words("안녕하세요") == 5  # 5 Korean chars
    assert count_words("") == 0
    print("✅ test_count_words passed")


def test_count_dialogues():
    assert count_dialogues('"안녕" "잘가"') == 2
    assert count_dialogues("대화 없음") == 0
    print("✅ test_count_dialogues passed")


def test_count_paragraphs():
    assert count_paragraphs("a\n\nb\n\nc") == 3
    assert count_paragraphs("single") == 1
    print("✅ test_count_paragraphs passed")


def test_score_novel():
    path = write_temp(SAMPLE_NOVEL)
    result = score_file(path)
    assert result.total > 0, "Novel should have positive score"
    assert result.scores.get("narrative_structure", 0) >= 8, "Novel has headings/paragraphs"
    assert result.scores.get("dialogue", 0) >= 5, "Novel has dialogues"
    Path(path).unlink()
    print(f"✅ test_score_novel passed (total={result.total})")


def test_score_short():
    path = write_temp(SAMPLE_SHORT)
    result = score_file(path)
    assert result.scores.get("immersion", 0) <= 2, "Short text = low immersion"
    Path(path).unlink()
    print(f"✅ test_score_short passed (total={result.total})")


if __name__ == "__main__":
    test_count_words()
    test_count_dialogues()
    test_count_paragraphs()
    test_score_novel()
    test_score_short()
    print("\n🎉 All tests passed!")
