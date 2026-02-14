#!/usr/bin/env python3
"""Tests for AI Citation Testing Framework."""

import json
import os
import sys
import tempfile
import unittest

sys.path.insert(0, os.path.dirname(__file__))

from ai_citation_test import (
    CitationChecker,
    ContentInfo,
    ContentResult,
    QueryGenerator,
    QueryResult,
    ReportGenerator,
    get_mock_response,
    run_batch,
    run_single_query,
    MOCK_RESPONSES,
)


class TestQueryGenerator(unittest.TestCase):
    def setUp(self):
        self.gen = QueryGenerator()

    def test_title_queries(self):
        content = ContentInfo(slug="test", title="How to Survive the AI Era")
        queries = self.gen.generate(content)
        self.assertTrue(any("How to Survive the AI Era" in q for q in queries))

    def test_title_with_brackets_cleaned(self):
        content = ContentInfo(
            slug="test",
            title="[Report Review] What 2026 Agentic Coding Trends Tell Us",
        )
        queries = self.gen.generate(content)
        # Should have both original and cleaned
        self.assertTrue(any("[Report Review]" in q for q in queries))
        self.assertTrue(any("What 2026" in q and "[" not in q for q in queries))

    def test_keyword_queries(self):
        content = ContentInfo(
            slug="test", title="Test", keywords=["AI", "coding", "trends"]
        )
        queries = self.gen.generate(content)
        self.assertTrue(any("AI coding" in q for q in queries))

    def test_question_queries(self):
        content = ContentInfo(slug="test", title="The Intent Designer")
        queries = self.gen.generate(content)
        self.assertTrue(any(q.startswith("What is") for q in queries))
        self.assertTrue(any(q.startswith("How does") for q in queries))

    def test_empty_keywords(self):
        content = ContentInfo(slug="test", title="Test", keywords=[])
        queries = self.gen.generate(content)
        # Should still produce title and question queries
        self.assertGreater(len(queries), 0)


class TestCitationChecker(unittest.TestCase):
    def setUp(self):
        self.checker = CitationChecker("hypeproof-ai.xyz")
        self.content = ContentInfo(
            slug="building-ai-content-platform",
            title="Building a Content Platform with Multi-Agent AI",
            keywords=["multi-agent AI", "content platform"],
            unique_phrases=["7 chained bugs and 26 security tests"],
        )

    def test_direct_domain_match(self):
        text = "Check out hypeproof-ai.xyz for more info."
        citations = self.checker.check(text, self.content)
        direct = [c for c in citations if c.citation_type == "direct"]
        self.assertGreater(len(direct), 0)
        self.assertEqual(direct[0].confidence, 1.0)

    def test_direct_url_match(self):
        text = "See https://hypeproof-ai.xyz/columns/test for details."
        citations = self.checker.check(text, self.content)
        direct = [c for c in citations if c.citation_type == "direct"]
        self.assertGreater(len(direct), 0)

    def test_fuzzy_exact_title(self):
        text = "The article Building a Content Platform with Multi-Agent AI discusses..."
        citations = self.checker.check(text, self.content)
        fuzzy = [c for c in citations if c.citation_type == "fuzzy"]
        self.assertGreater(len(fuzzy), 0)
        self.assertGreaterEqual(fuzzy[0].confidence, 0.7)

    def test_fuzzy_partial_title(self):
        text = "Building a Content Platform with Multi-Agent systems is trending."
        citations = self.checker.check(text, self.content)
        fuzzy = [c for c in citations if c.citation_type == "fuzzy"]
        self.assertGreater(len(fuzzy), 0)

    def test_indirect_unique_phrase(self):
        text = "The analysis found 7 chained bugs and 26 security tests in the platform."
        citations = self.checker.check(text, self.content)
        indirect = [c for c in citations if c.citation_type == "indirect"]
        self.assertGreater(len(indirect), 0)
        self.assertEqual(indirect[0].confidence, 0.6)

    def test_no_citation_found(self):
        text = "The weather today is sunny with a high of 75 degrees."
        citations = self.checker.check(text, self.content)
        self.assertEqual(len(citations), 0)

    def test_empty_response(self):
        citations = self.checker.check("", self.content)
        self.assertEqual(len(citations), 0)

    def test_case_insensitive_domain(self):
        text = "Visit HYPEPROOF-AI.XYZ for AI news."
        citations = self.checker.check(text, self.content)
        direct = [c for c in citations if c.citation_type == "direct"]
        self.assertGreater(len(direct), 0)


class TestMockResponses(unittest.TestCase):
    def test_building_platform_query(self):
        resp = get_mock_response("Building a content platform with AI")
        self.assertIn("hypeproof-ai.xyz", resp)

    def test_agentic_coding_query(self):
        resp = get_mock_response("agentic coding trends 2026")
        self.assertIn("agentic coding", resp)

    def test_intent_designer_query(self):
        resp = get_mock_response("what is an intent designer")
        self.assertIn("intent designer", resp)

    def test_default_response(self):
        resp = get_mock_response("random unrelated query")
        self.assertGreater(len(resp), 0)

    def test_korean_query(self):
        resp = get_mock_response("AI 시대에 살아남는 법")
        self.assertIn("hypeproof-ai.xyz", resp)


class TestReportGenerator(unittest.TestCase):
    def setUp(self):
        self.gen = ReportGenerator()

    def test_report_has_header(self):
        results = []
        report = self.gen.generate(results, "hypeproof-ai.xyz")
        self.assertIn("# AI Citation Test Report", report)
        self.assertIn("hypeproof-ai.xyz", report)

    def test_report_with_results(self):
        from ai_citation_test import Citation
        cr = ContentResult(slug="test", title="Test Article")
        cr.queries = [
            QueryResult("q1", "mock", "resp", [Citation("direct", "url", 1.0)], True),
            QueryResult("q2", "mock", "resp", [], False),
        ]
        report = self.gen.generate([cr], "hypeproof-ai.xyz")
        self.assertIn("Test Article", report)
        self.assertIn("50.0%", report)
        self.assertIn("🟢", report)
        self.assertIn("🔴", report)

    def test_report_suggestions_for_low_rate(self):
        cr = ContentResult(slug="test", title="Test")
        cr.queries = [QueryResult("q1", "mock", "resp", [], False)]
        report = self.gen.generate([cr], "hypeproof-ai.xyz")
        self.assertIn("Improvement Suggestions", report)
        self.assertIn("JSON-LD", report)


class TestRunSingleQuery(unittest.TestCase):
    def test_mock_mode(self):
        content = ContentInfo(
            slug="building-ai-content-platform",
            title="Building a Content Platform with Multi-Agent AI",
            unique_phrases=["multi-agent AI content platform"],
        )
        result = run_single_query(
            "Building a content platform with multi-agent AI",
            "hypeproof-ai.xyz",
            content,
            mock=True,
        )
        self.assertIsInstance(result, QueryResult)
        self.assertTrue(result.cited)

    def test_live_mode_raises(self):
        with self.assertRaises(NotImplementedError):
            run_single_query("test", "test.com", None, mock=False)


class TestBatchRun(unittest.TestCase):
    def test_batch_from_file(self):
        queries_path = os.path.join(os.path.dirname(__file__), "citation_queries.json")
        if not os.path.exists(queries_path):
            self.skipTest("citation_queries.json not found")
        results = run_batch(queries_path, "hypeproof-ai.xyz", mock=True)
        self.assertEqual(len(results), 10)
        for cr in results:
            self.assertEqual(len(cr.queries), 3)

    def test_batch_output_json(self):
        data = [{
            "slug": "test",
            "title": "Test",
            "keywords": [],
            "unique_phrases": [],
            "queries": ["test query"],
        }]
        with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
            json.dump(data, f)
            f.flush()
            results = run_batch(f.name, "hypeproof-ai.xyz", mock=True)
        os.unlink(f.name)
        self.assertEqual(len(results), 1)


class TestEdgeCases(unittest.TestCase):
    def test_empty_content_info(self):
        checker = CitationChecker("hypeproof-ai.xyz")
        content = ContentInfo(slug="", title="", keywords=[], unique_phrases=[])
        citations = checker.check("some random text", content)
        self.assertEqual(len(citations), 0)

    def test_multilingual_response(self):
        checker = CitationChecker("hypeproof-ai.xyz")
        content = ContentInfo(
            slug="test",
            title="AI 시대의 생존법",
            unique_phrases=["AI 시대의 생존법"],
        )
        text = "AI 시대의 생존법에 대한 글이 hypeproof-ai.xyz에 있습니다."
        citations = checker.check(text, content)
        self.assertGreater(len(citations), 0)
        types = {c.citation_type for c in citations}
        self.assertIn("direct", types)

    def test_content_result_citation_rate_empty(self):
        cr = ContentResult(slug="test", title="Test")
        self.assertEqual(cr.citation_rate, 0.0)

    def test_query_generator_long_title(self):
        gen = QueryGenerator()
        content = ContentInfo(
            slug="test",
            title="A Very Long Title That Has More Than Six Words In It For Testing",
        )
        queries = gen.generate(content)
        question_queries = [q for q in queries if q.startswith("What is")]
        # Question queries should truncate to ~6 words
        for q in question_queries:
            subject = q.replace("What is ", "")
            self.assertLessEqual(len(subject.split()), 7)


if __name__ == "__main__":
    unittest.main()
