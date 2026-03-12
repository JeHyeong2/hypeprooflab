#!/usr/bin/env python3
"""Batch fix frontmatter: add lang and authorType to all columns."""
import os, re, glob

COLS_DIR = os.path.expanduser("~/CodeWorkspace/hypeproof/web/src/content/columns/ko")
AI_CREATORS = {"Jay", "Mother", ""}
HUMAN_OVERRIDE = {"Jay Lee"}  # Jay Lee = human (에세이/소설)

fixed = 0
for fpath in sorted(glob.glob(os.path.join(COLS_DIR, "*.md"))):
    fname = os.path.basename(fpath)
    with open(fpath, "r") as f:
        content = f.read()
    
    # Parse frontmatter
    m = re.match(r'^---\n(.*?)\n---', content, re.DOTALL)
    if not m:
        print(f"  SKIP {fname} (no frontmatter)")
        continue
    
    fm = m.group(1)
    body_start = m.end()
    changed = False
    
    # Get creator
    cm = re.search(r'^creator:\s*"?([^"\n]+)"?', fm, re.MULTILINE)
    creator = cm.group(1).strip() if cm else ""
    
    # Add lang if missing
    if not re.search(r'^lang:', fm, re.MULTILINE):
        fm += '\nlang: "ko"'
        changed = True
    
    # Add authorType if missing
    if not re.search(r'^authorType:', fm, re.MULTILINE):
        if creator in HUMAN_OVERRIDE:
            atype = "human"
        elif creator in AI_CREATORS:
            atype = "ai"
        else:
            atype = "human"
        fm += f'\nauthorType: "{atype}"'
        changed = True
    
    if changed:
        new_content = f"---\n{fm}\n---{content[body_start:]}"
        with open(fpath, "w") as f:
            f.write(new_content)
        print(f"  ✅ {fname} (creator={creator})")
        fixed += 1
    else:
        print(f"  — {fname} (already OK)")

print(f"\nFixed: {fixed} files")
