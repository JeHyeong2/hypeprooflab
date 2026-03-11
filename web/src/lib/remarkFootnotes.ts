import { visit } from 'unist-util-visit';
import type { Plugin } from 'unified';
import type { Root, Strong, Text } from 'mdast';

/**
 * Remark plugin: converts **[N]** patterns into clickable footnote links.
 * 
 * Input markdown:  some text **[1]**.
 * Output: some text <sup><a href="#source-1">[1]</a></sup>.
 * 
 * Also adds id="source-N" anchors to the Sources table rows.
 */
const remarkFootnotes: Plugin<[], Root> = () => {
  return (tree: Root) => {
    visit(tree, 'strong', (node: Strong, index, parent) => {
      if (!parent || index === undefined) return;

      // Check if the strong node contains exactly one text child matching [N]
      if (
        node.children.length === 1 &&
        node.children[0].type === 'text'
      ) {
        const text = (node.children[0] as Text).value;
        const match = text.match(/^\[(\d+)\]$/);

        if (match) {
          const num = match[1];
          // Replace the strong node with an HTML node for <sup><a>
          (parent.children as any[])[index!] = {
            type: 'html',
            value: `<sup class="footnote-ref"><a href="#source-${num}" id="ref-${num}" title="출처 ${num}">[${num}]</a></sup>`,
          };
        }
      }
    });
  };
};

export default remarkFootnotes;
