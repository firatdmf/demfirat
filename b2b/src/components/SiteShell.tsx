'use client';

import { useState, ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import CartDrawer from './CartDrawer';
import SearchOverlay from './SearchOverlay';
import QuickViewModal from './QuickViewModal';

type Props = {
  children: ReactNode;
  categoryCounts?: Record<string, number>;
};

export default function SiteShell({ children, categoryCounts }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="b2b-app b2b-scroll">
      <Header onOpenSearch={() => setSearchOpen(true)} categoryCounts={categoryCounts} />
      {children}
      <Footer />
      <CartDrawer />
      <QuickViewModal />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
