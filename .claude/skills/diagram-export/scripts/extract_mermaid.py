#!/usr/bin/env python3
"""Extract mermaid code blocks from a markdown file into individual .mmd files."""
import re
import sys
import json
from pathlib import Path


def extract(md_path: str, out_dir: str) -> list[dict]:
    content = Path(md_path).read_text(encoding='utf-8')

    # Find all headings with their positions
    headings = [(m.start(), m.group(1).strip())
                for m in re.finditer(r'^#{1,6}\s+(.+)', content, re.MULTILINE)]

    # Find mermaid blocks anchored to column 0
    blocks = list(re.finditer(r'^```mermaid\n(.*?)^```', content, re.MULTILINE | re.DOTALL))

    out = Path(out_dir)
    out.mkdir(parents=True, exist_ok=True)

    manifest = []
    for i, match in enumerate(blocks, 1):
        block = match.group(1).strip()
        block_pos = match.start()
        first_line = block.split('\n')[0].strip()
        node_count = len(re.findall(r'\[.*?\]', block))

        # Detect diagram type
        if first_line.startswith('flowchart') or first_line.startswith('graph'):
            dtype = 'flowchart'
        elif first_line.startswith('gantt'):
            dtype = 'gantt'
        elif first_line.startswith('pie'):
            dtype = 'pie'
        elif first_line.startswith('sequenceDiagram'):
            dtype = 'sequence'
        elif first_line.startswith('classDiagram'):
            dtype = 'class'
        else:
            dtype = 'unknown'

        # Find nearest preceding heading for label
        label = f'D-{i}'
        desc = ''
        for h_pos, h_text in reversed(headings):
            if h_pos < block_pos:
                label = h_text
                # Get first non-blank line after heading as desc
                after_heading = content[h_pos:block_pos]
                lines = [l.strip() for l in after_heading.split('\n')[1:] if l.strip() and not l.strip().startswith('#')]
                desc = lines[0][:120] if lines else ''
                break

        mmd_file = out / f'd{i}.mmd'
        mmd_file.write_text(block, encoding='utf-8')

        manifest.append({
            'index': i,
            'type': dtype,
            'label': label,
            'desc': desc,
            'file': str(mmd_file),
            'lines': len(block.split('\n')),
            'node_count': node_count,
            'first_line': first_line[:80],
        })

    manifest_file = out / 'manifest.json'
    manifest_file.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding='utf-8')
    print(json.dumps({'extracted': len(blocks), 'manifest': str(manifest_file)}, indent=2))
    return manifest


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print("Usage: extract_mermaid.py <markdown_file> <output_dir>")
        sys.exit(1)
    extract(sys.argv[1], sys.argv[2])
