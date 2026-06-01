import AuthGuard from '@/components/AuthGuard';
import CheckoutClient from './CheckoutClient';
import type { Locale } from '@/i18n';

type Props = { params: Promise<{ locale: Locale }> };

export default async function CheckoutPage({ params }: Props) {
  const { locale } = await params;
  return (
    <AuthGuard>
      <CheckoutClient locale={locale} />
    </AuthGuard>
  );
}
