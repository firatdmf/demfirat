'use client';

import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { useEffect } from 'react';

// This page now redirects to profile page with orders tab
export default function OrdersPage() {
  const router = useRouter();
  const locale = useLocale();

  useEffect(() => {
    router.replace(`/${locale}/account/profile?tab=orders`);
  }, [router, locale]);

  return null;
}
