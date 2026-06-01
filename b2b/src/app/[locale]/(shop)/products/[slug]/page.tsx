import { notFound } from 'next/navigation';
import { getProduct, getRelatedProducts } from '@/lib/api';
import DetailClient from './DetailClient';
import type { Locale } from '@/i18n';

type Props = { params: Promise<{ locale: Locale; slug: string }> };

export default async function ProductDetailPage({ params }: Props) {
  const { locale, slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  const related = await getRelatedProducts(slug);

  // Browsing the catalog is public — prices and ordering still gate
  // behind login via the "Sign in for price" button on ProductCard
  // and the cart drawer. Removing RequireAuth here so the URL works
  // when a guest pastes it.
  return <DetailClient locale={locale} product={product} related={related} />;
}
