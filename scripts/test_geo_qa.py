#!/usr/bin/env python3
"""Tests for geo_qa_score.py"""

import sys
import os
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from geo_qa_score import (
    score_article, parse_frontmatter, count_words,
    score_citations, score_structure, score_tables,
    score_word_count, score_keyword_stuffing
)

COLUMNS_DIR = Path(__file__).parent.parent / "web" / "src" / "content" / "columns" / "ko"


class TestCitations(unittest.TestCase):
    def test_zero_citations(self):
        pts, count, _ = score_citations("No citations here at all.")
        self.assertEqual(count, 0)
        self.assertEqual(pts, 0)

    def test_three_citations(self):
        body = "According to [1] and [2], also [3] supports this."
        pts, count, _ = score_citations(body)
        self.assertEqual(count, 3)
        self.assertEqual(pts, 15)

    def test_five_plus_citations(self):
        body = "[1] [2] [3] [4] [5] [6]"
        pts, count, _ = score_citations(body)
        self.assertGreaterEqual(count, 5)
        self.assertEqual(pts, 25)  # capped at 25

    def test_markdown_links_count(self):
        body = "[link](https://a.com) and [ref](https://b.com)"
        pts, count, _ = score_citations(body)
        self.assertGreaterEqual(count, 2)


class TestStructure(unittest.TestCase):
    def test_h2_h3_scoring(self):
        body = "## A\n### B\n## C\n### D\n## E\n- item1\n- item2\n- item3\n"
        pts, detail, _ = score_structure(body)
        self.assertGreater(pts, 0)
        self.assertIn("H2=3", detail)
        self.assertIn("H3=2", detail)

    def test_no_structure(self):
        body = "Just plain text with no headings."
        pts, _, _ = score_structure(body)
        self.assertEqual(pts, 0)


class TestTables(unittest.TestCase):
    def test_table_detection(self):
        body = "| A | B |\n| --- | --- |\n| 1 | 2 |\n"
        pts, count, _ = score_tables(body)
        self.assertEqual(count, 1)
        self.assertEqual(pts, 5)

    def test_no_table(self):
        pts, count, _ = score_tables("No tables here.")
        self.assertEqual(count, 0)


class TestWordCount(unittest.TestCase):
    def test_english_words(self):
        wc = count_words("hello world foo bar baz")
        self.assertEqual(wc, 5)

    def test_korean_words(self):
        body = "가" * 100  # 100 Korean chars
        wc = count_words(body)
        self.assertEqual(wc, 200)  # 100 / 0.5

    def test_word_count_scoring(self):
        body = "word " * 3000
        pts, wc, _ = score_word_count(body)
        self.assertEqual(pts, 15)


class TestKeywordStuffing(unittest.TestCase):
    def test_no_stuffing(self):
        body = " ".join(f"word{i}" for i in range(200))
        pts, _, _ = score_keyword_stuffing(body)
        self.assertEqual(pts, 0)

    def test_stuffing_detected(self):
        body = "spam " * 100 + " ".join(f"other{i}" for i in range(50))
        pts, _, _ = score_keyword_stuffing(body)
        self.assertEqual(pts, -10)


class TestFrontmatter(unittest.TestCase):
    def test_parse_valid(self):
        text = "---\ntitle: Test\nauthor: Jay\ndate: 2026-01-01\n---\nBody here."
        meta, body = parse_frontmatter(text)
        self.assertEqual(meta["title"], "Test")
        self.assertIn("Body here", body)

    def test_no_frontmatter(self):
        meta, body = parse_frontmatter("Just body text.")
        self.assertEqual(meta, {})


class TestTotalScore(unittest.TestCase):
    def test_score_range(self):
        text = "---\ntitle: Test\nauthor: Jay\ndate: 2026-01-01\n---\n## Heading\nSome content."
        result = score_article(text)
        self.assertGreaterEqual(result["total"], 0)
        self.assertLessEqual(result["total"], 100)

    def test_empty_article(self):
        result = score_article("")
        self.assertGreaterEqual(result["total"], 0)
        self.assertLessEqual(result["total"], 100)


class TestIntegrationWithRealFile(unittest.TestCase):
    def test_real_column_file(self):
        files = list(COLUMNS_DIR.glob("*.md")) if COLUMNS_DIR.exists() else []
        if not files:
            self.skipTest("No column files found")
        text = files[0].read_text(encoding="utf-8")
        result = score_article(text)
        self.assertGreaterEqual(result["total"], 0)
        self.assertLessEqual(result["total"], 100)
        self.assertIn("breakdown", result)
        self.assertEqual(len(result["breakdown"]), 9)
        print(f"\n  [Integration] {files[0].name}: {result['total']}/100")


if __name__ == "__main__":
    unittest.main(verbosity=2)
