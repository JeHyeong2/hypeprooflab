#!/usr/bin/env python3
"""AI Citation Testing Framework for HypeProof.

Tests whether HypeProof content is cited by AI search engines
(ChatGPT, Perplexity, Gemini, etc.).

Usage:
    python3 ai_citation_test.py --query "AI agent content platform" --site hypeproof-ai.xyz
    python3 ai_citation_test.py --batch queries.json --output results.json
    python3 ai_citation_test.py --batch queries.json --mock --report report.md
"""

import argparse
import json
import re
import sys
from dataclasses import dataclass, field, asdict
from datetime import datetime
from difflib import SequenceMatcher
from pathlib import Path
from typing import Optional


# ---------------------------------------------------------------------------
# Data models
# ---------------------------------------------------------------------------

@dataclass
class ContentInfo:
    slug: str
    title: str
    keywords: list[str] = field(default_factory=list)
    unique_phrases: list[str] = field(default_factory=list)


@dataclass
class Citation:
    citation_type: str  # "direct" | "fuzzy" | "indirect"
    matched_text: str
    confidence: float  # 0.0 - 1.0


@dataclass
class QueryResult:
    query: str
    engine: str
    response_text: str
    citations: list[Citation] = field(default_factory=list)
    cited: bool = False


@dataclass
class ContentResult:
    slug: str
    title: str
    queries: list[QueryResult] = field(default_factory=list)

    @property
    def citation_rate(self) -> float:
        if not self.queries:
            return 0.0
        return sum(1 for q in self.queries if q.cited) / len(self.queries)


# ---------------------------------------------------------------------------
# Query Generator
# ---------------------------------------------------------------------------

class QueryGenerator:
    """Generate search queries from content metadata."""

    QUESTION_PREFIXES = [
        "What is", "How does", "Why is",
        "What are the implications of", "How to understand",
    ]

    def generate(self, content: ContentInfo) -> list[str]:
        queries = []
        queries.extend(self._title_queries(content))
        queries.extend(self._keyword_queries(content))
        queries.extend(self._question_queries(content))
        return queries

    def _title_queries(self, content: ContentInfo) -> list[str]:
        title = content.title
        queries = [title]
        # Remove common prefixes/brackets for a cleaner query
        clean = re.sub(r"\[.*?\]\s*", "", title).strip()
        if clean != title:
            queries.append(clean)
        return queries

    def _keyword_queries(self, content: ContentInfo) -> list[str]:
        kws = content.keywords
        if not kws:
            return []
        queries = []
        # Single keywords
        for kw in kws[:3]:
            queries.append(kw)
        # Pairs
        for i in range(len(kws)):
            for j in range(i + 1, min(i + 3, len(kws))):
                queries.append(f"{kws[i]} {kws[j]}")
        return queries

    def _question_queries(self, content: ContentInfo) -> list[str]:
        subject = re.sub(r"\[.*?\]\s*", "", content.title).strip()
        # Shorten long titles
        words = subject.split()
        if len(words) > 6:
            subject = " ".join(words[:6])
        queries = []
        for prefix in self.QUESTION_PREFIXES[:3]:
            queries.append(f"{prefix} {subject}")
        return queries


# ---------------------------------------------------------------------------
# Citation Checker
# ---------------------------------------------------------------------------

class CitationChecker:
    """Check whether an AI response cites our content."""

    def __init__(self, site: str = "hypeproof-ai.xyz"):
        self.site = site

    def check(
        self,
        response_text: str,
        content: ContentInfo,
    ) -> list[Citation]:
        if not response_text:
            return []
        citations: list[Citation] = []
        citations.extend(self._check_direct(response_text))
        citations.extend(self._check_fuzzy(response_text, content))
        citations.extend(self._check_indirect(response_text, content))
        return citations

    def _check_direct(self, text: str) -> list[Citation]:
        """Exact URL match."""
        citations = []
        # Full domain
        if self.site.lower() in text.lower():
            citations.append(Citation("direct", self.site, 1.0))
        # Also check with https://
        url_pattern = re.compile(
            rf"https?://(?:www\.)?{re.escape(self.site)}[^\s]*",
            re.IGNORECASE,
        )
        for m in url_pattern.finditer(text):
            citations.append(Citation("direct", m.group(), 1.0))
        # Deduplicate by matched_text
        seen = set()
        unique = []
        for c in citations:
            if c.matched_text not in seen:
                seen.add(c.matched_text)
                unique.append(c)
        return unique

    def _check_fuzzy(self, text: str, content: ContentInfo) -> list[Citation]:
        """Title or key phrase fuzzy match."""
        citations = []
        title = content.title.lower()
        if not title:
            return citations
        text_lower = text.lower()
        # Exact title inclusion
        if title in text_lower:
            citations.append(Citation("fuzzy", content.title, 0.9))
            return citations
        # Fuzzy ratio
        # Check sliding windows of title length
        title_words = title.split()
        text_words = text_lower.split()
        window = len(title_words)
        if window == 0:
            return citations
        best_ratio = 0.0
        best_match = ""
        for i in range(max(1, len(text_words) - window + 1)):
            candidate = " ".join(text_words[i : i + window])
            ratio = SequenceMatcher(None, title, candidate).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = candidate
        if best_ratio >= 0.7:
            citations.append(Citation("fuzzy", best_match, best_ratio))
        return citations

    def _check_indirect(self, text: str, content: ContentInfo) -> list[Citation]:
        """Check for unique phrases from our content."""
        citations = []
        text_lower = text.lower()
        for phrase in content.unique_phrases:
            if phrase.lower() in text_lower:
                citations.append(Citation("indirect", phrase, 0.6))
        return citations


# ---------------------------------------------------------------------------
# Mock Engine
# ---------------------------------------------------------------------------

MOCK_RESPONSES: dict[str, str] = {
    "default": (
        "Based on my research, there are several perspectives on this topic. "
        "Various experts have discussed the implications of AI in content creation. "
        "Some platforms are exploring new approaches to AI-generated content verification."
    ),
    "with_citation": (
        "According to an article on hypeproof-ai.xyz, AI content platforms are "
        "evolving rapidly. The piece titled 'Building a Content Platform with "
        "Multi-Agent AI' discusses how multi-agent systems can chain together "
        "for content verification. For more details, see "
        "https://hypeproof-ai.xyz/columns/building-ai-content-platform"
    ),
    "fuzzy_citation": (
        "Recent analysis suggests that agentic coding trends in 2026 will reshape "
        "developer workflows. One report review examines what these trends tell us "
        "about the future of developers, highlighting the shift from manual coding "
        "to AI-assisted development patterns."
    ),
    "indirect_citation": (
        "The concept of an 'intent designer' is emerging as a new role in AI. "
        "Rather than writing code directly, professionals will design intents "
        "that AI systems interpret and execute. This represents a fundamental "
        "shift in how humans interact with technology."
    ),
    "korean": (
        "AI 시대에 살아남는 법에 대한 다양한 의견이 있습니다. "
        "마케팅의 타겟이 변화하고 있으며, 의장의 시대가 시작되었다는 "
        "분석도 있습니다. hypeproof-ai.xyz에서 관련 칼럼을 확인할 수 있습니다."
    ),
    "empty": "",
}


def get_mock_response(query: str, engine: str = "mock") -> str:
    """Return a mock response based on query keywords."""
    q = query.lower()
    if "building" in q and "platform" in q:
        return MOCK_RESPONSES["with_citation"]
    if "agentic" in q or "coding trends" in q:
        return MOCK_RESPONSES["fuzzy_citation"]
    if "intent designer" in q:
        return MOCK_RESPONSES["indirect_citation"]
    if any(kw in q for kw in ["살아남", "마케팅", "의장"]):
        return MOCK_RESPONSES["korean"]
    return MOCK_RESPONSES["default"]


# ---------------------------------------------------------------------------
# Report Generator
# ---------------------------------------------------------------------------

class ReportGenerator:
    """Generate markdown reports from citation test results."""

    def generate(self, results: list[ContentResult], site: str) -> str:
        lines = [
            f"# AI Citation Test Report",
            f"",
            f"**Site:** {site}",
            f"**Date:** {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            f"**Content tested:** {len(results)}",
            f"",
        ]

        # Summary
        total_queries = sum(len(r.queries) for r in results)
        total_cited = sum(sum(1 for q in r.queries if q.cited) for r in results)
        overall_rate = total_cited / total_queries if total_queries else 0

        lines.append("## Summary")
        lines.append("")
        lines.append(f"- Total queries: {total_queries}")
        lines.append(f"- Cited responses: {total_cited}")
        lines.append(f"- **Overall citation rate: {overall_rate:.1%}**")
        lines.append("")

        # Per-content breakdown
        lines.append("## Results by Content")
        lines.append("")

        for cr in results:
            emoji = "✅" if cr.citation_rate > 0 else "❌"
            lines.append(f"### {emoji} {cr.title}")
            lines.append(f"")
            lines.append(f"Citation rate: {cr.citation_rate:.1%}")
            lines.append("")

            for qr in cr.queries:
                status = "🟢" if qr.cited else "🔴"
                lines.append(f"- {status} `{qr.query}`")
                for c in qr.citations:
                    lines.append(
                        f"  - [{c.citation_type}] \"{c.matched_text}\" "
                        f"(confidence: {c.confidence:.0%})"
                    )
            lines.append("")

        # Suggestions
        lines.append("## Improvement Suggestions")
        lines.append("")
        uncited = [r for r in results if r.citation_rate == 0]
        if uncited:
            lines.append("### Content with zero citations:")
            for r in uncited:
                lines.append(f"- **{r.title}** — consider adding structured data, "
                             f"improving SEO metadata, or creating FAQ sections")
            lines.append("")

        if overall_rate < 0.3:
            lines.append("### General recommendations:")
            lines.append("- Add JSON-LD structured data to all pages")
            lines.append("- Create FAQ sections with common questions")
            lines.append("- Improve meta descriptions with unique value propositions")
            lines.append("- Build backlinks from authoritative sources")
            lines.append("- Ensure content has unique data/statistics that AI can cite")
            lines.append("")

        return "\n".join(lines)


# ---------------------------------------------------------------------------
# Main runner
# ---------------------------------------------------------------------------

def run_single_query(
    query: str,
    site: str,
    content: Optional[ContentInfo],
    mock: bool = True,
    engine: str = "mock",
) -> QueryResult:
    if mock:
        response = get_mock_response(query, engine)
    else:
        raise NotImplementedError(
            "Live mode requires API keys. Use --mock for testing."
        )

    checker = CitationChecker(site)
    c = content or ContentInfo(slug="", title="", keywords=[], unique_phrases=[])
    citations = checker.check(response, c)
    cited = len(citations) > 0

    return QueryResult(
        query=query,
        engine=engine,
        response_text=response,
        citations=citations,
        cited=cited,
    )


def run_batch(
    queries_path: str,
    site: str,
    mock: bool = True,
) -> list[ContentResult]:
    with open(queries_path) as f:
        data = json.load(f)

    results = []
    for item in data:
        content = ContentInfo(
            slug=item.get("slug", ""),
            title=item.get("title", ""),
            keywords=item.get("keywords", []),
            unique_phrases=item.get("unique_phrases", []),
        )
        cr = ContentResult(slug=content.slug, title=content.title)

        for q in item.get("queries", []):
            qr = run_single_query(q, site, content, mock=mock)
            cr.queries.append(qr)

        results.append(cr)

    return results


def main():
    parser = argparse.ArgumentParser(description="AI Citation Test Framework")
    parser.add_argument("--query", help="Single query to test")
    parser.add_argument("--site", default="hypeproof-ai.xyz", help="Site domain")
    parser.add_argument("--batch", help="Path to batch queries JSON")
    parser.add_argument("--output", help="Output results JSON path")
    parser.add_argument("--report", help="Output markdown report path")
    parser.add_argument("--mock", action="store_true", default=True, help="Use mock responses (default)")
    parser.add_argument("--live", action="store_true", help="Use live API calls")
    args = parser.parse_args()

    mock = not args.live

    if args.query:
        content = ContentInfo(slug="", title=args.query)
        result = run_single_query(args.query, args.site, content, mock=mock)
        print(f"Query: {result.query}")
        print(f"Cited: {result.cited}")
        for c in result.citations:
            print(f"  [{c.citation_type}] {c.matched_text} ({c.confidence:.0%})")
        if not result.cited:
            print("  No citations found.")

    elif args.batch:
        results = run_batch(args.batch, args.site, mock=mock)

        if args.output:
            output = []
            for cr in results:
                output.append({
                    "slug": cr.slug,
                    "title": cr.title,
                    "citation_rate": cr.citation_rate,
                    "queries": [asdict(qr) for qr in cr.queries],
                })
            with open(args.output, "w") as f:
                json.dump(output, f, indent=2, ensure_ascii=False)
            print(f"Results written to {args.output}")

        if args.report:
            report = ReportGenerator().generate(results, args.site)
            with open(args.report, "w") as f:
                f.write(report)
            print(f"Report written to {args.report}")

        if not args.output and not args.report:
            report = ReportGenerator().generate(results, args.site)
            print(report)
    else:
        parser.print_help()
        sys.exit(1)


if __name__ == "__main__":
    main()
