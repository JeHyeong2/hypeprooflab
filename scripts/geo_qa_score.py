#!/usr/bin/env python3
"""GEO Quality Score — automatic scoring for HypeProof columns.

Usage:
    python3 geo_qa_score.py path/to/article.md [--json]
"""

import argparse
import json
import re
import sys
from pathlib import Path

try:
    import yaml
except ImportError:
    print("pyyaml required: pip install pyyaml", file=sys.stderr)
    sys.exit(1)


# ── helpers ──────────────────────────────────────────────────────────────

def parse_frontmatter(text: str):
    """Return (meta_dict, body_str)."""
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n", text, re.DOTALL)
    if not m:
        return {}, text
    try:
        meta = yaml.safe_load(m.group(1)) or {}
    except yaml.YAMLError:
        meta = {}
    return meta, text[m.end():]


def count_words(body: str) -> int:
    """Word count aware of Korean (char_count / 0.5 for CJK-heavy text)."""
    cjk = len(re.findall(r"[\u3000-\u9fff\uac00-\ud7af]", body))
    non_cjk_words = len(re.findall(r"[a-zA-Z0-9]+", body))
    return int(cjk / 0.5) + non_cjk_words


def detect_lang(body: str) -> str:
    cjk = len(re.findall(r"[\uac00-\ud7af]", body))
    return "ko" if cjk > 50 else "en"


# ── scoring functions ────────────────────────────────────────────────────

def score_citations(body: str):
    """인라인 인용 (max 25)."""
    patterns = [
        r"\[[\d]+\]",              # [1], [2]
        r"\[\^[^\]]+\]",           # [^fn]
        r"(?:출처|Source|참고|Reference)\s*[:：]",
        r"\((?:출처|Source|참고)[^)]*\)",
        r"<a [^>]*>",              # HTML links as citations
        r"\[[^\]]+\]\(http[^\)]+\)",  # markdown links
    ]
    count = 0
    for p in patterns:
        count += len(re.findall(p, body, re.IGNORECASE))
    pts = min(count * 5, 25)
    return pts, count, "인라인 인용"


def score_structure(body: str):
    """구조 (max 20): H2×3(max12) + H3×1(max4) + bullet(4)."""
    h2 = len(re.findall(r"^##\s+", body, re.MULTILINE))
    h3 = len(re.findall(r"^###\s+", body, re.MULTILINE))
    bullets = len(re.findall(r"^[\-\*]\s+", body, re.MULTILINE))
    h2_pts = min(h2 * 3, 12)
    h3_pts = min(h3 * 1, 4)
    bullet_pts = 4 if bullets >= 3 else int(bullets * 1.3)
    pts = min(h2_pts + h3_pts + bullet_pts, 20)
    detail = f"H2={h2} H3={h3} bullets={bullets}"
    return pts, detail, "구조"


def score_tables(body: str):
    """테이블 (max 10): table × 5."""
    tables = len(re.findall(r"^\|.+\|$\n\|[\-\s:|]+\|$", body, re.MULTILINE))
    pts = min(tables * 5, 10)
    return pts, tables, "테이블"


def score_word_count(body: str):
    """단어 수 (max 15)."""
    wc = count_words(body)
    if wc >= 3000:
        pts = 15
    elif wc >= 2000:
        pts = 12
    elif wc >= 1500:
        pts = 8
    elif wc >= 1000:
        pts = 4
    else:
        pts = 0
    return pts, wc, "단어 수"


def score_statistics(body: str):
    """통계/데이터 (max 10): 숫자+단위/퍼센트 × 2."""
    patterns = [
        r"\d+[\.,]?\d*\s*%",
        r"\d+[\.,]?\d*\s*(?:억|만|천|조|달러|원|USD|EUR|명|건|개|배|GB|TB|MB)",
        r"(?:약|대략|roughly|approximately)\s+\d+",
    ]
    count = 0
    for p in patterns:
        count += len(re.findall(p, body, re.IGNORECASE))
    pts = min(count * 2, 10)
    return pts, count, "통계/데이터"


def score_schema(meta: dict):
    """Schema-ready (max 10): frontmatter(4) + date(3) + author(3)."""
    pts = 0
    if meta:
        pts += 4
    if meta.get("date"):
        pts += 3
    if meta.get("creator") or meta.get("author"):
        pts += 3
    detail = f"fm={'Y' if meta else 'N'} date={'Y' if meta.get('date') else 'N'} creator={'Y' if (meta.get('creator') or meta.get('author')) else 'N'}"
    return min(pts, 10), detail, "Schema-ready"


def score_freshness(meta: dict):
    """Freshness (max 5)."""
    has = bool(meta.get("date") or meta.get("freshness") or meta.get("updated"))
    return 5 if has else 0, has, "Freshness"


def score_keyword_stuffing(body: str):
    """키워드 스터핑 감점 (0 or -10)."""
    STOP_WORDS = {
        "the", "be", "to", "of", "and", "in", "that", "have", "it", "for",
        "not", "on", "with", "he", "as", "you", "do", "at", "this", "but",
        "his", "by", "from", "they", "we", "say", "her", "she", "or", "an",
        "will", "my", "one", "all", "would", "there", "their", "what", "so",
        "up", "out", "if", "about", "who", "get", "which", "go", "me", "when",
        "make", "can", "like", "time", "no", "just", "him", "know", "take",
        "is", "are", "was", "were", "been", "being", "has", "had", "did",
        "a", "an", "its", "than", "into", "could", "may", "each", "also",
    }
    words = re.findall(r"\w{2,}", body.lower())
    if not words:
        return 0, "", "키워드 스터핑"
    from collections import Counter
    freq = Counter(w for w in words if w not in STOP_WORDS)
    if not freq:
        return 0, "no content words", "키워드 스터핑"
    top_word, top_count = freq.most_common(1)[0]
    ratio = top_count / len(words)
    penalty = -10 if ratio > 0.03 else 0
    detail = f"top='{top_word}' {ratio:.1%}"
    return penalty, detail, "키워드 스터핑"


def score_readability(body: str):
    """가독성 (max 5): 문장 길이 기반."""
    sentences = re.split(r"[.!?。]\s+", body)
    sentences = [s for s in sentences if len(s.strip()) > 5]
    if not sentences:
        return 0, 0, "가독성"
    avg_len = sum(len(s) for s in sentences) / len(sentences)
    # shorter sentences = better readability for web
    if avg_len <= 60:
        pts = 5
    elif avg_len <= 80:
        pts = 4
    elif avg_len <= 100:
        pts = 3
    elif avg_len <= 130:
        pts = 2
    else:
        pts = 1
    return pts, f"avg_sentence_len={avg_len:.0f}", "가독성"


# ── main ─────────────────────────────────────────────────────────────────

def score_article(text: str) -> dict:
    meta, body = parse_frontmatter(text)

    results = []
    results.append(score_citations(body))
    results.append(score_structure(body))
    results.append(score_tables(body))
    results.append(score_word_count(body))
    results.append(score_statistics(body))
    results.append(score_schema(meta))
    results.append(score_freshness(meta))
    results.append(score_keyword_stuffing(body))
    results.append(score_readability(body))

    breakdown = []
    total = 0
    suggestions = []
    max_scores = [25, 20, 10, 15, 10, 10, 5, 0, 5]  # 0 for penalty category

    for i, (pts, detail, name) in enumerate(results):
        total += pts
        breakdown.append({"category": name, "score": pts, "max": max_scores[i], "detail": str(detail)})
        if max_scores[i] > 0 and pts < max_scores[i] * 0.6:
            suggestions.append(f"[{name}] {pts}/{max_scores[i]}점 — 개선 필요")

    total = max(0, min(100, total))

    return {
        "total": total,
        "breakdown": breakdown,
        "suggestions": suggestions,
        "meta_title": meta.get("title", ""),
        "lang": detect_lang(body),
        "word_count": count_words(body),
    }


def print_report(result: dict):
    print(f"\n{'='*50}")
    print(f"  GEO Quality Score: {result['total']}/100")
    print(f"  {result['meta_title']}  [{result['lang'].upper()}]  ~{result['word_count']} words")
    print(f"{'='*50}\n")

    for b in result["breakdown"]:
        bar = "█" * b["score"] + "░" * max(0, b["max"] - b["score"]) if b["max"] > 0 else ("⚠" if b["score"] < 0 else "✓")
        print(f"  {b['category']:12s}  {b['score']:+3d}/{b['max']:2d}  {bar}  {b['detail']}")

    if result["suggestions"]:
        print(f"\n💡 개선 제안:")
        for s in result["suggestions"]:
            print(f"   • {s}")
    print()


def main():
    parser = argparse.ArgumentParser(description="GEO Quality Score for HypeProof columns")
    parser.add_argument("file", help="Markdown file to score")
    parser.add_argument("--json", action="store_true", help="Output as JSON")
    args = parser.parse_args()

    text = Path(args.file).read_text(encoding="utf-8")
    result = score_article(text)

    if args.json:
        print(json.dumps(result, ensure_ascii=False, indent=2))
    else:
        print_report(result)


if __name__ == "__main__":
    main()
