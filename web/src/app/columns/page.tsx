import { getAllColumns } from '@/lib/columns';
import ColumnsListClient from './ColumnsListClient';

export const metadata = {
  title: 'Columns | HypeProof AI',
  description: 'Deep analysis, research insights, and sharp takes on AI, technology, and the future.',
};

export default function ColumnsPage() {
  const koColumns = getAllColumns('ko');
  const enColumns = getAllColumns('en');
  
  return <ColumnsListClient koColumns={koColumns} enColumns={enColumns} />;
}
