import { glossaryTerms } from './glossary';

interface MdastNode {
  type: string;
  value?: string;
  children?: MdastNode[];
  url?: string;
}

const SKIP_PARENT_TYPES = new Set(['link', 'linkReference', 'code', 'inlineCode', 'heading']);

function escapeRegex(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasKoreanChar(input: string): boolean {
  return /[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(input);
}

function buildPatterns() {
  return glossaryTerms.flatMap((g) => {
    const patterns: { regex: RegExp; slug: string }[] = [];
    if (g.term) {
      patterns.push({
        regex: new RegExp(`\\b(${escapeRegex(g.term)})\\b`, 'i'),
        slug: g.slug,
      });
    }
    if (g.termKo) {
      const escaped = escapeRegex(g.termKo);
      patterns.push({
        regex: hasKoreanChar(g.termKo)
          ? new RegExp(`(${escaped})`)
          : new RegExp(`\\b(${escaped})\\b`, 'i'),
        slug: g.slug,
      });
    }
    return patterns;
  });
}

export default function remarkGlossaryLinks() {
  const patterns = buildPatterns();

  return (tree: MdastNode) => {
    const linkedSlugs = new Set<string>();

    function walk(node: MdastNode, parentType: string | null) {
      if (!node || !node.children) return;
      const next: MdastNode[] = [];

      for (const child of node.children) {
        if (SKIP_PARENT_TYPES.has(child.type) || SKIP_PARENT_TYPES.has(parentType || '')) {
          if (child.children) walk(child, child.type);
          next.push(child);
          continue;
        }

        if (child.type === 'text' && typeof child.value === 'string') {
          const replacements = replaceFirstMatch(child.value, patterns, linkedSlugs);
          if (replacements) {
            next.push(...replacements);
          } else {
            next.push(child);
          }
        } else {
          if (child.children) walk(child, child.type);
          next.push(child);
        }
      }

      node.children = next;
    }

    walk(tree, null);
  };
}

function replaceFirstMatch(
  text: string,
  patterns: { regex: RegExp; slug: string }[],
  linkedSlugs: Set<string>,
): MdastNode[] | null {
  let earliest: { idx: number; match: string; slug: string } | null = null;

  for (const { regex, slug } of patterns) {
    if (linkedSlugs.has(slug)) continue;
    const m = regex.exec(text);
    if (!m) continue;
    if (earliest === null || m.index < earliest.idx) {
      earliest = { idx: m.index, match: m[0], slug };
    }
  }

  if (!earliest) return null;

  linkedSlugs.add(earliest.slug);

  const before = text.slice(0, earliest.idx);
  const after = text.slice(earliest.idx + earliest.match.length);

  const nodes: MdastNode[] = [];
  if (before) nodes.push({ type: 'text', value: before });
  nodes.push({
    type: 'link',
    url: `/glossary#${earliest.slug}`,
    children: [{ type: 'text', value: earliest.match }],
  });
  if (after) {
    const tail = replaceFirstMatch(after, patterns, linkedSlugs);
    if (tail) {
      nodes.push(...tail);
    } else {
      nodes.push({ type: 'text', value: after });
    }
  }
  return nodes;
}
