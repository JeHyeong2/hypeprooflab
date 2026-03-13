#!/usr/bin/env python3
"""
Deterministic inline link injector for HypeProof research/column articles.

Reads the Sources table, extracts URL + title pairs,
then scans body text for matching keywords and inserts markdown links.

Usage: python3 inject-inline-links.py <file.md> [--dry-run]
"""
import re, sys, os

def parse_sources(content: str) -> list[dict]:
    """Extract sources from the Sources table."""
    sources = []
    # Find Sources table rows: | N | [Title](URL) ... |
    pattern = r'\|\s*\d+\s*\|\s*\[([^\]]+)\]\((https?://[^\)]+)\)'
    for m in re.finditer(pattern, content):
        title = m.group(1).strip()
        url = m.group(2).strip()
        sources.append({'title': title, 'url': url})
    return sources

def extract_keywords(title: str) -> list[str]:
    """Extract linkable keywords from a source title."""
    keywords = []
    
    # Full company/product names (most specific first)
    known_entities = [
        'Claude Code', 'OpenClaw', 'DeepSeek', 'Perplexity', 'Atlassian',
        'Microsoft', 'Google', 'OpenAI', 'Anthropic', 'Meta', 'Apple',
        'GitHub', 'Vercel', 'Cursor', 'Replit', 'Windsurf',
        'GPT-5', 'GPT-4', 'Claude 4', 'Claude 3', 'Gemini',
        'DirectX', 'WordPress', 'SurePath', 'Mac Mini', 'Mac mini',
        'EU', 'CERT', 'GDC', 'LLM', 'MCP',
    ]
    
    for entity in known_entities:
        if entity.lower() in title.lower():
            keywords.append(entity)
    
    # Extract capitalized multi-word phrases from title
    # e.g., "Personal Computer" from "Perplexity takes on OpenClaw with 'Personal Computer'"
    quoted = re.findall(r"['\"]([^'\"]+)['\"]", title)
    keywords.extend(quoted)
    
    return keywords

def find_body_and_sources(content: str) -> tuple[str, str, str]:
    """Split content into frontmatter, body, and sources section."""
    # Split frontmatter
    parts = content.split('---', 2)
    if len(parts) >= 3:
        frontmatter = '---' + parts[1] + '---'
        rest = parts[2]
    else:
        frontmatter = ''
        rest = content
    
    # Split body from sources
    sources_patterns = [
        r'\n---\n\n### 🔗 Sources',
        r'\n### 🔗 Sources',
        r'\n## Sources',
        r'\n### Sources',
        r'\n## 출처',
        r'\n### 🔗 출처',
    ]
    
    for pat in sources_patterns:
        match = re.search(pat, rest)
        if match:
            body = rest[:match.start()]
            sources_section = rest[match.start():]
            return frontmatter, body, sources_section
    
    return frontmatter, rest, ''

def inject_links(body: str, sources: list[dict]) -> tuple[str, int]:
    """Inject inline links into body text. Returns modified body and count."""
    injected = 0
    used_urls = set()
    
    # Collect all keyword -> url mappings
    mappings = []
    for src in sources:
        keywords = extract_keywords(src['title'])
        for kw in keywords:
            mappings.append((kw, src['url']))
    
    # Sort by keyword length (longest first) to avoid partial matches
    mappings.sort(key=lambda x: len(x[0]), reverse=True)
    
    for keyword, url in mappings:
        if url in used_urls:
            continue
            
        # Skip if this keyword is already linked in body
        # Pattern: [keyword](any-url) or [... keyword ...](any-url)
        escaped_kw = re.escape(keyword)
        if re.search(r'\[[^\]]*' + escaped_kw + r'[^\]]*\]\(', body):
            continue
        
        # Find first occurrence of keyword in body (not inside markdown links)
        # Only match keyword that's not already inside [...](...) 
        pattern = r'(?<!\[)(' + escaped_kw + r')(?!\]\()'
        
        match = re.search(pattern, body)
        if match:
            # Replace first occurrence only
            start, end = match.start(1), match.end(1)
            original = body[start:end]
            replacement = f'[{original}]({url})'
            body = body[:start] + replacement + body[end:]
            used_urls.add(url)
            injected += 1
    
    return body, injected

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 inject-inline-links.py <file.md> [--dry-run]")
        sys.exit(1)
    
    filepath = sys.argv[1]
    dry_run = '--dry-run' in sys.argv
    
    with open(filepath, 'r') as f:
        content = f.read()
    
    sources = parse_sources(content)
    if not sources:
        print(f"⚠️  No Sources table found in {os.path.basename(filepath)}")
        sys.exit(0)
    
    frontmatter, body, sources_section = find_body_and_sources(content)
    
    # Count existing body links
    existing_links = len(re.findall(r'\[([^\]]+)\]\(https?://[^\)]+\)', body))
    
    modified_body, injected = inject_links(body, sources)
    
    total_links = existing_links + injected
    
    print(f"📄 {os.path.basename(filepath)}")
    print(f"   Sources: {len(sources)}")
    print(f"   Existing body links: {existing_links}")
    print(f"   New links injected: {injected}")
    print(f"   Total body links: {total_links}")
    
    if injected == 0:
        print(f"   ✅ No injection needed (already {existing_links} links)")
        sys.exit(0)
    
    if dry_run:
        print(f"   🔍 DRY RUN — would inject {injected} links")
        # Show what would be linked
        for src in sources:
            keywords = extract_keywords(src['title'])
            if keywords:
                print(f"      {', '.join(keywords)} → {src['url'][:60]}...")
        sys.exit(0)
    
    # Write back
    new_content = frontmatter + modified_body + sources_section
    with open(filepath, 'w') as f:
        f.write(new_content)
    
    print(f"   ✅ Injected {injected} inline links")

if __name__ == '__main__':
    main()
