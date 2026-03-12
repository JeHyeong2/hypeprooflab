#!/usr/bin/env python3
"""
Add Sources table to a column that doesn't have one.
Usage: python3 add-sources-to-column.py <column-file-path>

Reads the column, extracts key claims/facts, 
and appends a Sources section at the end.
"""
import sys, re, os

def extract_claims(text):
    """Extract sentences that contain factual claims worth sourcing."""
    claims = []
    # Remove frontmatter
    text = re.sub(r'^---.*?---', '', text, flags=re.DOTALL).strip()
    
    # Split into sentences (rough)
    sentences = re.split(r'[.。!]\s+', text)
    
    for s in sentences:
        s = s.strip()
        if len(s) < 20:
            continue
        # Look for factual indicators
        if any(ind in s for ind in ['%', '억', '만', '달러', '$', '조', 
                                      '연구', '발표', '보고서', '논문',
                                      '에 따르면', '기준', '통계',
                                      'according', 'study', 'report',
                                      'MIT', 'Stanford', 'Google', 'OpenAI',
                                      'Microsoft', 'Anthropic', 'Meta']):
            claims.append(s[:200])
    
    return claims[:10]  # Max 10 claims

def main():
    if len(sys.argv) < 2:
        print("Usage: python3 add-sources-to-column.py <file>")
        sys.exit(1)
    
    fpath = sys.argv[1]
    with open(fpath, 'r') as f:
        content = f.read()
    
    # Check if already has sources
    if re.search(r'^#{2,3}.*([Ss]ources|출처)', content, re.MULTILINE):
        print(f"SKIP: {os.path.basename(fpath)} already has Sources")
        return
    
    claims = extract_claims(content)
    print(f"Found {len(claims)} factual claims in {os.path.basename(fpath)}")
    for i, c in enumerate(claims):
        print(f"  [{i+1}] {c[:80]}...")

if __name__ == '__main__':
    main()
