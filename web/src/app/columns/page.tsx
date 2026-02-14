import { Metadata } from 'next';
import { getAllColumns } from '@/lib/columns';
import ColumnsListClient from './ColumnsListClient';
import { generateCollectionJsonLd } from '@/lib/jsonld';

export const metadata: Metadata = {
  title: 'Columns',
  description: 'Deep analysis, research insights, and sharp takes on AI, technology, and the future.',
  openGraph: {
    title: 'Columns | HypeProof AI',
    description: 'Deep analysis, research insights, and sharp takes on AI, technology, and the future.',
    type: 'website',
  },
};

export default function ColumnsPage() {
  const koColumns = getAllColumns('ko');
  const enColumns = getAllColumns('en');
  const allColumns = [...koColumns, ...enColumns];
  const uniqueColumns = Array.from(
    new Map(allColumns.map(c => [c.frontmatter.slug, c])).values()
  );
  const collectionJsonLd = generateCollectionJsonLd(uniqueColumns);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionJsonLd) }}
      />
      <ColumnsListClient koColumns={koColumns} enColumns={enColumns} />
    </>
  );
}
