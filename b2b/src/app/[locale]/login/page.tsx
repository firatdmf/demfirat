import LoginClient from './LoginClient';
import type { Locale } from '@/i18n';

type Props = { params: Promise<{ locale: Locale }> };

export default async function LoginPage({ params }: Props) {
  const { locale } = await params;
  return <LoginClient locale={locale} />;
}
