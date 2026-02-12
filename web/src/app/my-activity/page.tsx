import { Metadata } from 'next';
import MyActivityClient from './MyActivityClient';

export const metadata: Metadata = {
  title: '내 활동 | HypeProof AI',
  description: 'My liked and bookmarked columns',
};

export default function MyActivityPage() {
  return <MyActivityClient />;
}
