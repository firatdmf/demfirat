'use client';

import { useState, ReactNode, Suspense } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import SearchOverlay from './SearchOverlay';
import EditorOverlay from './EditorOverlay';
import QuickViewModal from './QuickViewModal';
import type { NavItemDTO } from '@/lib/api';

type Props = {
  children: ReactNode;
  initialNav?: NavItemDTO[] | null;
  categoryCounts?: Record<string, number>;
};

export default function SiteShell({ children, initialNav, categoryCounts }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="b2b-app b2b-scroll">
      <Header onOpenSearch={() => setSearchOpen(true)} initialNav={initialNav} categoryCounts={categoryCounts} />
      {children}
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
      {/* useSearchParams() must be inside Suspense per Next.js 15 */}
      <Suspense fallback={null}>
        <EditorOverlay />
      </Suspense>
    </div>
  );
}
