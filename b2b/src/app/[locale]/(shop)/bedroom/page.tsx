import { redirect } from 'next/navigation';
import type { Locale } from '@/i18n';

type Props = { params: Promise<{ locale: Locale }> };

// /bedroom is a legacy landing page — its hero now lives on the homepage,
// and the Header link points directly at the filtered product listing.
// Anyone hitting /bedroom (old bookmarks, sitemap, etc.) is redirected.
export default async function BedroomRedirect({ params }: Props) {
  const { locale } = await params;
  const prefix = locale === 'tr' ? '' : `/${locale}`;
  redirect(`${prefix}/products?cat=bed`);
}
