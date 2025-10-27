import EmbroideryClient from './EmbroideryClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Embroidery Fabrics - Karven Tekstil',
  description: 'Embroidered sheer curtain fabrics collection',
};

export default async function EmbroideryPage(props: PageProps<'/[locale]/product/fabrics/embroidery'>) {
  const { locale } = await props.params;
  const searchParams = await props.searchParams;

  return (
    <EmbroideryClient 
      locale={locale}
      searchParams={searchParams}
    />
  );
}
