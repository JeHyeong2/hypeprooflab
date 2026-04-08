#!/usr/bin/env python3
"""
Multi-channel vault retrieval for /ask.

Channels:
  1. Keyword/entity — ontology-index.yaml entity resolution → file list
  2. BM25 lexical — TF-IDF style scoring over vault markdown files
  3. Graph traversal — graph-edges.yaml relationship discovery
  4. Temporal boost — weight recently modified files higher

Usage:
  python3 vault_search.py "CCU2 maturity gap"
  python3 vault_search.py --top 10 "who influences AI Technician?"
  python3 vault_search.py --channel bm25 "diagnostic integration"
  python3 vault_search.py --json "competitor comparison"
"""

import argparse
import json
import math
import os
import re
import sys
import time
from collections import Counter, defaultdict
from pathlib import Path
from typing import Dict, List, Optional, Set, Tuple

try:
    import yaml
except ImportError:
    print("ERROR: PyYAML required — pip install pyyaml", file=sys.stderr)
    sys.exit(1)

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------
SCRIPT_DIR = Path(__file__).resolve().parent
SKILLS_DIR = SCRIPT_DIR.parent.parent          # .claude/skills/
PROJECT_ROOT = SKILLS_DIR.parent.parent        # project root

INDEX_PATH = PROJECT_ROOT / "knowledge" / "ontology-index.yaml"
ROUTING_PATH = PROJECT_ROOT / "knowledge" / "index-routing.yaml"
GRAPH_PATH = PROJECT_ROOT / "knowledge" / "graph-edges.yaml"

VAULT_DIRS = [
    PROJECT_ROOT / "workspace" / "agendas",
    PROJECT_ROOT / "workspace" / "signals",
    PROJECT_ROOT / "workspace" / "stakeholders",
    PROJECT_ROOT / "knowledge",
    PROJECT_ROOT / "knowledge" / "products",
    PROJECT_ROOT / "knowledge" / "customers",
    PROJECT_ROOT / "knowledge" / "competitors",
    PROJECT_ROOT / "knowledge" / "partners",
    PROJECT_ROOT / "knowledge" / "specs",
]

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def collect_vault_files() -> List[Path]:
    """Collect all .md and .yaml files from vault directories."""
    files = []
    seen = set()
    for d in VAULT_DIRS:
        if not d.exists():
            continue
        for f in d.iterdir():
            if f.is_file() and f.suffix in (".md", ".yaml") and f.name not in ("_template.md", "_use-case-template.md"):
                real = f.resolve()
                if real not in seen:
                    seen.add(real)
                    files.append(f)
    return files


def tokenize(text: str) -> List[str]:
    """Simple whitespace + punctuation tokenizer, lowercased."""
    return re.findall(r"[a-z0-9가-힣]+", text.lower())


def rel_path(p: Path) -> str:
    """Return path relative to project root."""
    try:
        return str(p.relative_to(PROJECT_ROOT))
    except ValueError:
        return str(p)


# ---------------------------------------------------------------------------
# Channel 1: Keyword / Entity Resolution
# ---------------------------------------------------------------------------

def channel_keyword(query: str) -> Dict[str, float]:
    """Resolve entities from the routing table / index and return file scores."""
    scores: Dict[str, float] = defaultdict(float)
    tokens = set(tokenize(query))

    # Try routing table first, fallback to full index
    index_data = None
    for path in [ROUTING_PATH, INDEX_PATH]:
        if path.exists():
            try:
                with open(path) as f:
                    index_data = yaml.safe_load(f)
                break
            except Exception:
                continue

    if not index_data:
        return scores

    # Collect alias map
    alias_map = {}
    if "aliases" in index_data:
        alias_map = index_data["aliases"]
    elif "alias_map" in index_data:
        alias_map = index_data["alias_map"]

    # Resolve query tokens to entity IDs
    resolved_ids: Set[str] = set()
    for token in tokens:
        if token in alias_map:
            resolved_ids.add(alias_map[token])
        for eid in _entity_ids(index_data):
            if token in eid or eid in token:
                resolved_ids.add(eid)

    # Get files for resolved entities
    entities = index_data.get("entities", {})
    if not entities:
        for section in ("products", "use_cases", "customers", "competitors", "partners", "stakeholders"):
            for item in index_data.get(section, []) if isinstance(index_data.get(section), list) else []:
                eid = item.get("id", "")
                if eid in resolved_ids:
                    for f in item.get("files", []):
                        scores[f] += 1.0
    else:
        for eid, edata in entities.items():
            if eid in resolved_ids:
                for f in edata.get("files", []):
                    scores[f] += 1.0

    return scores


def _entity_ids(index_data: dict) -> Set[str]:
    """Extract all entity IDs from index data."""
    ids = set()
    if "entities" in index_data:
        ids.update(index_data["entities"].keys())
    for section in ("products", "use_cases", "customers", "competitors", "partners"):
        for item in index_data.get(section, []) if isinstance(index_data.get(section), list) else []:
            if "id" in item:
                ids.add(item["id"])
    return ids


# ---------------------------------------------------------------------------
# Channel 2: BM25 Lexical Search
# ---------------------------------------------------------------------------

def channel_bm25(query: str, vault_files: Optional[List[Path]] = None,
                 k1: float = 1.5, b: float = 0.75) -> Dict[str, float]:
    """BM25 scoring over vault markdown files."""
    if vault_files is None:
        vault_files = collect_vault_files()

    query_tokens = tokenize(query)
    if not query_tokens:
        return {}

    doc_tfs: Dict[str, Counter] = {}
    doc_lens: Dict[str, int] = {}

    for fp in vault_files:
        try:
            text = fp.read_text(encoding="utf-8", errors="ignore")
        except Exception:
            continue
        tokens = tokenize(text)
        rp = rel_path(fp)
        doc_tfs[rp] = Counter(tokens)
        doc_lens[rp] = len(tokens)

    if not doc_tfs:
        return {}

    n_docs = len(doc_tfs)
    avgdl = sum(doc_lens.values()) / n_docs if n_docs else 1

    df: Dict[str, int] = defaultdict(int)
    for qt in set(query_tokens):
        for rp, tf in doc_tfs.items():
            if tf[qt] > 0:
                df[qt] += 1

    scores: Dict[str, float] = {}
    for rp, tf in doc_tfs.items():
        score = 0.0
        dl = doc_lens[rp]
        for qt in query_tokens:
            if df[qt] == 0:
                continue
            idf = math.log((n_docs - df[qt] + 0.5) / (df[qt] + 0.5) + 1.0)
            tf_val = tf[qt]
            tf_norm = (tf_val * (k1 + 1)) / (tf_val + k1 * (1 - b + b * dl / avgdl))
            score += idf * tf_norm
        if score > 0:
            scores[rp] = score

    return scores


# ---------------------------------------------------------------------------
# Channel 3: Graph Traversal
# ---------------------------------------------------------------------------

def channel_graph(query: str) -> Dict[str, float]:
    """Traverse graph-edges.yaml for relationship-based file discovery."""
    scores: Dict[str, float] = defaultdict(float)

    if not GRAPH_PATH.exists():
        return scores

    try:
        with open(GRAPH_PATH) as f:
            data = yaml.safe_load(f)
    except Exception:
        return scores

    edges = data.get("edges", [])
    if not edges:
        return scores

    tokens = set(tokenize(query))

    for edge in edges:
        src = edge.get("source", "")
        tgt = edge.get("target", "")
        fact = edge.get("fact", "")

        src_tokens = set(tokenize(src))
        tgt_tokens = set(tokenize(tgt))
        fact_tokens = set(tokenize(fact))

        overlap = tokens & (src_tokens | tgt_tokens | fact_tokens)
        if overlap:
            boost = len(overlap) / max(len(tokens), 1)
            for eid in (src, tgt):
                _add_entity_files(eid, scores, boost * 0.8)

    return scores


def _add_entity_files(entity_id: str, scores: Dict[str, float], boost: float):
    """Look up files for an entity from the routing table / index."""
    for path in [ROUTING_PATH, INDEX_PATH]:
        if not path.exists():
            continue
        try:
            with open(path) as f:
                data = yaml.safe_load(f)
        except Exception:
            continue

        entities = data.get("entities", {})
        if entity_id in entities:
            for fp in entities[entity_id].get("files", []):
                scores[fp] += boost
            return

        for section in ("products", "use_cases", "customers", "competitors", "partners"):
            for item in data.get(section, []) if isinstance(data.get(section), list) else []:
                if item.get("id") == entity_id:
                    for fp in item.get("files", []):
                        scores[fp] += boost
                    return


# ---------------------------------------------------------------------------
# Channel 4: Temporal Boost
# ---------------------------------------------------------------------------

def channel_temporal(vault_files: Optional[List[Path]] = None,
                     decay_days: float = 14.0) -> Dict[str, float]:
    """Score files by recency — exponential decay from modification time."""
    if vault_files is None:
        vault_files = collect_vault_files()

    now = time.time()
    scores: Dict[str, float] = {}

    for fp in vault_files:
        try:
            mtime = fp.stat().st_mtime
        except Exception:
            continue
        age_days = (now - mtime) / 86400.0
        score = math.exp(-age_days / decay_days)
        scores[rel_path(fp)] = score

    return scores


# ---------------------------------------------------------------------------
# Merge & Rank
# ---------------------------------------------------------------------------

CHANNEL_WEIGHTS = {
    "keyword": 1.0,
    "bm25": 0.8,
    "graph": 0.6,
    "temporal": 0.3,
}


def normalize_scores(scores: Dict[str, float]) -> Dict[str, float]:
    """Min-max normalize scores to [0, 1]."""
    if not scores:
        return {}
    max_val = max(scores.values())
    min_val = min(scores.values())
    rng = max_val - min_val
    if rng == 0:
        return {k: 1.0 for k in scores}
    return {k: (v - min_val) / rng for k, v in scores.items()}


def merge_channels(channel_results: Dict[str, Dict[str, float]],
                   weights: Optional[Dict[str, float]] = None,
                   top_k: int = 10) -> List[Dict]:
    """Merge normalized channel scores with weighted sum."""
    if weights is None:
        weights = CHANNEL_WEIGHTS

    normalized = {ch: normalize_scores(scores) for ch, scores in channel_results.items()}

    merged: Dict[str, float] = defaultdict(float)
    file_channels: Dict[str, List[str]] = defaultdict(list)

    for ch, scores in normalized.items():
        w = weights.get(ch, 0.5)
        for fp, score in scores.items():
            merged[fp] += score * w
            if score > 0:
                file_channels[fp].append(ch)

    ranked = sorted(merged.items(), key=lambda x: -x[1])[:top_k]

    return [
        {
            "file": fp,
            "score": round(score, 4),
            "channels": file_channels[fp],
        }
        for fp, score in ranked
    ]


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def search(query: str, top_k: int = 10,
           channels: Optional[List[str]] = None) -> List[Dict]:
    """Run multi-channel retrieval and return ranked results."""
    vault_files = collect_vault_files()

    active_channels = channels or ["keyword", "bm25", "graph", "temporal"]
    results: Dict[str, Dict[str, float]] = {}

    if "keyword" in active_channels:
        results["keyword"] = channel_keyword(query)
    if "bm25" in active_channels:
        results["bm25"] = channel_bm25(query, vault_files)
    if "graph" in active_channels:
        results["graph"] = channel_graph(query)
    if "temporal" in active_channels:
        results["temporal"] = channel_temporal(vault_files)

    return merge_channels(results, top_k=top_k)


def main():
    parser = argparse.ArgumentParser(
        description="Multi-channel vault retrieval for /ask")
    parser.add_argument("query", help="Search query")
    parser.add_argument("--top", type=int, default=10,
                        help="Number of results (default: 10)")
    parser.add_argument("--channel", action="append", default=None,
                        choices=["keyword", "bm25", "graph", "temporal"],
                        help="Run only specific channel(s)")
    parser.add_argument("--json", action="store_true",
                        help="Output as JSON")
    args = parser.parse_args()

    results = search(args.query, top_k=args.top, channels=args.channel)

    if args.json:
        print(json.dumps({"query": args.query, "results": results}, indent=2))
    else:
        print(f"Query: {args.query}")
        print(f"Results ({len(results)}):\n")
        for i, r in enumerate(results, 1):
            chs = ", ".join(r["channels"])
            print(f"  {i:2d}. [{r['score']:.4f}] {r['file']}")
            print(f"      channels: {chs}")
        if not results:
            print("  (no results)")


if __name__ == "__main__":
    main()
