#!/usr/bin/env python3
"""
geo_qa_local.py — HypeProof Lab 로컬 GEO Quality Scorer

Herald의 서버 채점 시스템과 동일한 가중치를 사용하는 경량 로컬 버전.
제출 전 셀프 체크용. 단독 실행 가능 (외부 의존성 없음).

Usage:
    python3 geo_qa_local.py article.md
    python3 geo_qa_local.py article.md --verbose
    python3 geo_qa_local.py article.md --json
    python3 geo_qa_local.py article.md --min-score 80

Exit codes:
    0 — 70점 이상 (제출 가능)
    1 — 70점 미만 (제출 불가)
    2 — 파일 오류
"""

import sys
import re
import json
import argparse
from pathlib import Path


# ─── 점수 배점 (Herald와 동일) ───────────────────────────────────────────
WEIGHTS = {
    "inline_citations": 25,  # 인라인 인용
    "structure": 20,  # H2/H3 구조
    "tables": 10,  # 테이블
    "word_count": 15,  # 단어/글자 수
    "statistics": 10,  # 통계/수치
    "schema_ready": 10,  # frontmatter 완비
    "freshness": 5,  # date 메타데이터
    "readability": 5,  # 가독성
    "keyword_stuffing": 0,  # 키워드 스터핑 (감점)
}

REQUIRED_FRONTMATTER = [
    "title",
    "creator",
    "date",
    "category",
    "tags",
    "slug",
    "readTime",
    "excerpt",
    "creatorImage",
]

SUBMISSION_THRESHOLD = 70
FAST_TRACK_THRESHOLD = 90


# ─── 파싱 ────────────────────────────────────────────────────────────────


def parse_file(filepath: str) -> tuple[dict, str]:
    """frontmatter와 본문을 분리해서 반환"""
    content = Path(filepath).read_text(encoding="utf-8")

    frontmatter = {}
    body = content

    if content.startswith("---"):
        parts = content.split("---", 2)
        if len(parts) >= 3:
            fm_text = parts[1].strip()
            body = parts[2].strip()
            frontmatter = parse_yaml_simple(fm_text)

    return frontmatter, body


def parse_yaml_simple(yaml_text: str) -> dict:
    """외부 라이브러리 없이 기본 YAML 파싱 (단순 키-값 및 리스트)"""
    result = {}
    current_key = None
    current_list = None

    for line in yaml_text.splitlines():
        # 리스트 아이템
        if line.strip().startswith("- ") and current_key:
            if current_list is None:
                current_list = []
                result[current_key] = current_list
            current_list.append(line.strip()[2:].strip().strip('"').strip("'"))
            continue

        # 키-값 쌍
        if ":" in line and not line.startswith(" "):
            current_list = None
            key, _, value = line.partition(":")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if value:
                result[key] = value
                current_key = key
            else:
                result[key] = None
                current_key = key

    return result


# ─── 채점 함수 ───────────────────────────────────────────────────────────


def score_inline_citations(body: str) -> tuple[int, str]:
    """인라인 인용 감지 (25점)"""
    patterns = [
        r"\[.+?\]\(https?://.+?\)",  # [텍스트](URL)
        r"https?://\S+",  # 노출 URL
        r"(?:에\s*따르면|에\s*의하면|연구에서|보고서에서|발표에\s*따르면)",
        r"(?:according to|per|cited by|as reported by)",
        r"\(\d{4}\)",  # (2024) 형식 연도 인용
        r"[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s*\(\d{4}\)",  # Author (2024)
    ]

    citations = set()
    for pattern in patterns:
        matches = re.finditer(pattern, body, re.IGNORECASE)
        for m in matches:
            citations.add(m.start() // 50)  # 50자 윈도우로 중복 제거

    count = len(citations)

    if count >= 5:
        score, detail = 25, f"{count}개 감지 (만점)"
    elif count == 4:
        score, detail = 20, f"{count}개 감지 (1개 추가하면 만점)"
    elif count == 3:
        score, detail = 15, f"{count}개 감지 (2개 추가 권장)"
    elif count == 2:
        score, detail = 8, f"{count}개 감지 (최소 3개 필요)"
    elif count == 1:
        score, detail = 3, f"{count}개 감지 (심각하게 부족)"
    else:
        score, detail = 0, "0개 감지 — 제출 전 필수 추가"

    return score, detail


def score_structure(body: str) -> tuple[int, str]:
    """H2/H3 헤딩 구조 (20점)"""
    h2_count = len(re.findall(r"^##\s+.+", body, re.MULTILINE))
    h3_count = len(re.findall(r"^###\s+.+", body, re.MULTILINE))
    bullet_count = len(re.findall(r"^[\-\*]\s+.+", body, re.MULTILINE))
    numbered_count = len(re.findall(r"^\d+\.\s+.+", body, re.MULTILINE))
    list_total = bullet_count + numbered_count

    score = 0
    parts = []

    # H2: 4개 이상 = 8점
    if h2_count >= 4:
        score += 8
        parts.append(f"H2={h2_count} ✓")
    elif h2_count >= 2:
        score += 4
        parts.append(f"H2={h2_count} (4개 권장)")
    else:
        parts.append(f"H2={h2_count} (부족)")

    # H3: 3개 이상 = 6점
    if h3_count >= 3:
        score += 6
        parts.append(f"H3={h3_count} ✓")
    elif h3_count >= 1:
        score += 3
        parts.append(f"H3={h3_count} (3개 권장)")
    else:
        parts.append(f"H3={h3_count} (없음)")

    # 리스트: 8개 이상 = 6점
    if list_total >= 8:
        score += 6
        parts.append(f"bullets={list_total} ✓")
    elif list_total >= 4:
        score += 3
        parts.append(f"bullets={list_total} (8개 권장)")
    else:
        parts.append(f"bullets={list_total} (부족)")

    detail = "  ".join(parts)
    return score, detail


def score_tables(body: str) -> tuple[int, str]:
    """테이블 포함 여부 (10점)"""
    # 마크다운 테이블: | 로 시작하는 행
    table_rows = re.findall(r"^\|.+\|", body, re.MULTILINE)
    # 헤더 구분선으로 실제 테이블 수 계산
    table_separators = re.findall(r"^\|[\s\-\|:]+\|", body, re.MULTILINE)
    table_count = len(table_separators)

    if table_count >= 2:
        score, detail = 10, f"{table_count}개 테이블 (만점)"
    elif table_count == 1:
        score, detail = 5, f"{table_count}개 테이블 (2개면 만점)"
    else:
        score, detail = 0, "테이블 없음 — 핵심 데이터를 표로 정리하면 인용 2.5배 ↑"

    return score, detail


def score_word_count(body: str, lang: str = "ko") -> tuple[int, str]:
    """단어/글자 수 (15점)"""
    # 마크다운 마커 제거 후 계산
    clean = re.sub(r"[#\*\[\]\(\)\-`>]", "", body)
    clean = re.sub(r"https?://\S+", "", clean)

    if lang == "ko":
        # 한국어: 공백 제거 후 글자 수
        char_count = len(re.sub(r"\s", "", clean))
        if char_count >= 2000:
            score, detail = 15, f"{char_count:,}자 (만점)"
        elif char_count >= 1500:
            score, detail = 10, f"{char_count:,}자 (2,000자 권장)"
        elif char_count >= 1000:
            score, detail = 5, f"{char_count:,}자 (부족)"
        else:
            score, detail = 0, f"{char_count:,}자 (심각하게 부족)"
    else:
        # 영어: 단어 수
        word_count = len(clean.split())
        if word_count >= 2000:
            score, detail = 15, f"{word_count:,} words (만점)"
        elif word_count >= 1500:
            score, detail = 10, f"{word_count:,} words (2,000 권장)"
        elif word_count >= 1000:
            score, detail = 5, f"{word_count:,} words (부족)"
        else:
            score, detail = 0, f"{word_count:,} words (심각하게 부족)"

    return score, detail


def score_statistics(body: str) -> tuple[int, str]:
    """통계/수치 포함 (10점)"""
    patterns = [
        r"\d+(?:\.\d+)?%",  # 퍼센트
        r"\$[\d,]+(?:\.\d+)?[BMK]?",  # 달러 금액
        r"[\d,]+(?:\.\d+)?\s*(?:억|만|천|조)",  # 한국 단위
        r"\d+(?:\.\d+)?배",  # 배수
        r"\d+(?:\.\d+)?×",  # 배수 기호
        r"(?:약|approximately|around)\s*\d+",  # 약 N
        r"\d{4}년",  # 연도
        r"\d+(?:\.\d+)?\s*(?:ms|GB|TB|MB|KB)",  # 기술 수치
    ]

    positions = set()
    for pattern in patterns:
        for m in re.finditer(pattern, body, re.IGNORECASE):
            positions.add(m.start() // 100)  # 100자 윈도우

    count = len(positions)

    if count >= 6:
        score, detail = 10, f"{count}개 수치 감지 (만점)"
    elif count >= 4:
        score, detail = 8, f"{count}개 수치 감지 (6개면 만점)"
    elif count >= 2:
        score, detail = 4, f"{count}개 수치 감지 (부족)"
    else:
        score, detail = 0, f"{count}개 수치 감지 — 구체적 데이터 추가 필요"

    return score, detail


def score_schema_ready(frontmatter: dict) -> tuple[int, str]:
    """Schema-ready frontmatter 완비 (10점)"""
    present = [f for f in REQUIRED_FRONTMATTER if frontmatter.get(f)]
    missing = [f for f in REQUIRED_FRONTMATTER if not frontmatter.get(f)]

    # author 필드 사용 경고
    has_author_error = "author" in frontmatter and "creator" not in frontmatter

    if has_author_error:
        score = 0
        detail = "❌ 'author' 필드 사용 금지 → 'creator'로 변경 필수"
    elif not missing:
        score = 10
        detail = f"frontmatter {len(present)}개 필드 완비 ✓"
    else:
        score = max(0, 10 - len(missing) * 2)
        detail = f"누락: {', '.join(missing)}"

    return score, detail


def score_freshness(frontmatter: dict) -> tuple[int, str]:
    """Freshness 메타데이터 (5점)"""
    if frontmatter.get("date"):
        return 5, f"date: {frontmatter['date']} ✓"
    else:
        return 0, "date 필드 없음 — frontmatter에 date 추가 필요"


def score_readability(body: str) -> tuple[int, str]:
    """가독성 (5점) — 평균 문장 길이"""
    # 문장 분리 (마침표, 느낌표, 물음표)
    sentences = re.split(r"[.!?。]\s+", body)
    sentences = [s.strip() for s in sentences if len(s.strip()) > 10]

    if not sentences:
        return 3, "문장 분석 불가 (분량 부족)"

    avg_len = sum(len(s) for s in sentences) / len(sentences)

    if avg_len <= 60:
        score, detail = 5, f"평균 {avg_len:.0f}자/문장 ✓ (60자 이하)"
    elif avg_len <= 80:
        score, detail = 3, f"평균 {avg_len:.0f}자/문장 (60자 이하 권장)"
    elif avg_len <= 100:
        score, detail = 1, f"평균 {avg_len:.0f}자/문장 — 문장 분리 권장"
    else:
        score, detail = 0, f"평균 {avg_len:.0f}자/문장 — 긴 문장 분리 필수"

    return score, detail


def score_keyword_stuffing(body: str) -> tuple[int, str]:
    """키워드 스터핑 감지 (0점, 과도하면 -10점)"""
    words = re.findall(r"\b[\w가-힣]{2,}\b", body.lower())
    if not words:
        return 0, "감지 안 됨 ✓"

    total = len(words)
    freq = {}
    for w in words:
        freq[w] = freq.get(w, 0) + 1

    # 스톱워드 제외 (일반적인 한국어/영어 조사, 관사 등)
    stop_words = {
        "the",
        "a",
        "an",
        "and",
        "or",
        "but",
        "in",
        "on",
        "at",
        "to",
        "for",
        "이",
        "가",
        "을",
        "를",
        "은",
        "는",
        "의",
        "에",
        "도",
        "으로",
        "로",
        "그",
        "그리고",
        "또한",
        "하지만",
        "하며",
        "있다",
        "있는",
        "있어",
        "것",
        "수",
        "이다",
        "됩니다",
        "합니다",
        "때문에",
        "위해",
    }

    overused = []
    for word, count in freq.items():
        if word in stop_words:
            continue
        density = (count / total) * 100
        if density >= 8:
            overused.append((word, count, density))

    if not overused:
        return 0, "감지 안 됨 ✓"

    worst = sorted(overused, key=lambda x: x[2], reverse=True)[:3]
    penalty = min(10, len(overused) * 3)
    detail = " | ".join(f"'{w}' {c}회({d:.1f}%)" for w, c, d in worst)
    return -penalty, f"스터핑 의심: {detail}"


# ─── 제안 생성 ───────────────────────────────────────────────────────────


def generate_suggestions(scores: dict, details: dict, frontmatter: dict) -> list[str]:
    """점수를 바탕으로 구체적인 개선 제안 생성"""
    suggestions = []
    max_scores = WEIGHTS.copy()

    # 우선순위: 점수 대비 최대 향상 가능 항목 순
    for key in [
        "inline_citations",
        "tables",
        "readability",
        "structure",
        "statistics",
        "word_count",
    ]:
        current = scores.get(key, 0)
        maximum = max_scores.get(key, 0)
        if current < maximum:
            gap = maximum - current

            if key == "inline_citations" and current < maximum:
                needed = 5 - (current // 5)
                suggestions.append(
                    f"[인라인 인용] {needed}개 추가하면 +{gap}점 예상 "
                    f"(학술 논문/공식 보고서 우선)"
                )
            elif key == "tables" and current < 10:
                suggestions.append(
                    f"[테이블] 핵심 데이터를 표로 정리하면 +{gap}점 "
                    f"(AI 인용 확률 2.5배 ↑)"
                )
            elif key == "readability" and current < 5:
                suggestions.append(
                    f"[가독성] 문장 평균 길이 60자 이하로 분리하면 +{gap}점"
                )
            elif key == "word_count" and current < 15:
                suggestions.append(f"[분량] 2,000자 이상으로 늘리면 +{gap}점")
            elif key == "statistics" and current < 10:
                suggestions.append(f"[통계] 구체적 수치 데이터 추가하면 +{gap}점")

    # frontmatter 오류
    if "author" in frontmatter:
        suggestions.insert(
            0, "[긴급] 'author' → 'creator'로 필드명 변경 필수 (미변경 시 제출 차단)"
        )

    missing_fm = [f for f in REQUIRED_FRONTMATTER if not frontmatter.get(f)]
    if missing_fm:
        suggestions.insert(0, f"[긴급] frontmatter 누락 필드: {', '.join(missing_fm)}")

    return suggestions[:5]  # 최대 5개 제안


# ─── 출력 ────────────────────────────────────────────────────────────────


def bar(score: int, maximum: int, width: int = 5) -> str:
    """점수 막대 시각화"""
    if maximum <= 0:
        return "─" * width
    filled = round((score / maximum) * width)
    filled = max(0, min(width, filled))
    return "█" * filled + "░" * (width - filled)


def print_report(
    filepath: str,
    frontmatter: dict,
    body: str,
    scores: dict,
    details: dict,
    total: int,
    suggestions: list[str],
    verbose: bool = False,
) -> None:
    """채점 결과 출력 (Herald 형식과 동일)"""
    lang = frontmatter.get("lang", "ko")

    if total >= FAST_TRACK_THRESHOLD:
        status = "🚀 Fast-track 가능 (리뷰어 1명)"
        status_icon = "🚀"
    elif total >= SUBMISSION_THRESHOLD:
        status = "✅ 제출 가능 → Peer Review 큐 진입"
        status_icon = "✅"
    else:
        status = "❌ 제출 불가 — 개선 후 재채점 필요"
        status_icon = "❌"

    print()
    print(f"{'─' * 55}")
    print(f"  GEO Quality Score: {total}/100  {status_icon}")
    print(f"  파일: {filepath}")
    print(f"{'─' * 55}")
    print()
    print("📊 Breakdown:")
    print(f"  {'항목':<16} {'점수':>8}  {'막대':>6}  {'세부'}")
    print(f"  {'─' * 52}")

    items = [
        ("인라인 인용", "inline_citations", WEIGHTS["inline_citations"]),
        ("구조 (H2/H3)", "structure", WEIGHTS["structure"]),
        ("테이블", "tables", WEIGHTS["tables"]),
        ("단어/글자 수", "word_count", WEIGHTS["word_count"]),
        ("통계/데이터", "statistics", WEIGHTS["statistics"]),
        ("Schema-ready", "schema_ready", WEIGHTS["schema_ready"]),
        ("Freshness", "freshness", WEIGHTS["freshness"]),
        ("가독성", "readability", WEIGHTS["readability"]),
        ("키워드 스터핑", "keyword_stuffing", 0),
    ]

    for label, key, maximum in items:
        s = scores[key]
        d = details[key]
        b = bar(max(0, s), maximum if maximum > 0 else 10)
        penalty_marker = " ⚠️" if s < 0 else ""
        print(f"  {label:<16} {s:>3}/{maximum:<3}  {b}  {d}{penalty_marker}")

    print()
    print(f"  {'─' * 52}")
    print(f"  {'총점':<16} {total:>3}/100")
    print()

    if suggestions:
        print("💡 개선 제안:")
        for s in suggestions:
            print(f"  • {s}")
        print()

    print(f"  {status}")
    print(f"{'─' * 55}")
    print()


def print_json_report(
    filepath: str, scores: dict, details: dict, total: int, suggestions: list[str]
) -> None:
    """JSON 형식 출력 (파이프라인 통합용)"""
    result = {
        "file": filepath,
        "total_score": total,
        "passed": total >= SUBMISSION_THRESHOLD,
        "fast_track": total >= FAST_TRACK_THRESHOLD,
        "scores": scores,
        "details": details,
        "suggestions": suggestions,
        "threshold": SUBMISSION_THRESHOLD,
    }
    print(json.dumps(result, ensure_ascii=False, indent=2))


# ─── 메인 ────────────────────────────────────────────────────────────────


def main() -> int:
    parser = argparse.ArgumentParser(
        description="HypeProof Lab 로컬 GEO Quality Scorer",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
예시:
  python3 geo_qa_local.py article.md
  python3 geo_qa_local.py article.md --verbose
  python3 geo_qa_local.py article.md --json
  python3 geo_qa_local.py article.md --min-score 80

Exit codes:
  0 — 통과 (기본 70점, --min-score로 변경 가능)
  1 — 미달
  2 — 파일 오류
        """,
    )
    parser.add_argument("filepath", help="채점할 마크다운 파일 경로")
    parser.add_argument("-v", "--verbose", action="store_true", help="상세 출력")
    parser.add_argument("--json", action="store_true", help="JSON 형식으로 출력")
    parser.add_argument(
        "--min-score",
        type=int,
        default=SUBMISSION_THRESHOLD,
        help=f"통과 기준 점수 (기본: {SUBMISSION_THRESHOLD})",
    )

    args = parser.parse_args()

    # 파일 읽기
    try:
        frontmatter, body = parse_file(args.filepath)
    except FileNotFoundError:
        print(f"오류: 파일을 찾을 수 없습니다 — {args.filepath}", file=sys.stderr)
        return 2
    except Exception as e:
        print(f"오류: {e}", file=sys.stderr)
        return 2

    lang = frontmatter.get("lang", "ko")

    # 채점
    scores = {}
    details = {}

    scores["inline_citations"], details["inline_citations"] = score_inline_citations(
        body
    )
    scores["structure"], details["structure"] = score_structure(body)
    scores["tables"], details["tables"] = score_tables(body)
    scores["word_count"], details["word_count"] = score_word_count(body, lang)
    scores["statistics"], details["statistics"] = score_statistics(body)
    scores["schema_ready"], details["schema_ready"] = score_schema_ready(frontmatter)
    scores["freshness"], details["freshness"] = score_freshness(frontmatter)
    scores["readability"], details["readability"] = score_readability(body)
    scores["keyword_stuffing"], details["keyword_stuffing"] = score_keyword_stuffing(
        body
    )

    total = sum(scores.values())
    total = max(0, min(100, total))  # 0-100 클램프

    suggestions = generate_suggestions(scores, details, frontmatter)

    # 출력
    if args.json:
        print_json_report(args.filepath, scores, details, total, suggestions)
    else:
        print_report(
            args.filepath,
            frontmatter,
            body,
            scores,
            details,
            total,
            suggestions,
            verbose=args.verbose,
        )

    # Exit code
    threshold = args.min_score
    return 0 if total >= threshold else 1


if __name__ == "__main__":
    sys.exit(main())
