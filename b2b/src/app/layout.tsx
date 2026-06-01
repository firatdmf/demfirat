import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DEMFIRAT — B2B Wholesale',
  description: 'Toptan perde, tül ve ev tekstili · DEMFIRAT B2B portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
