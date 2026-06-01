export type Locale = 'tr' | 'en';

export type Bilingual = { tr: string; en: string };

export type ColorVariant = {
  id: string;
  color: string;
  label: Bilingual;
  stock: number;
  bg: string;
};

export type SizeVariant = {
  id: string;
  label: string;
  stock: number;
};

export type Feature = {
  title: Bilingual;
  desc: Bilingual;
};

export type Product = {
  id: string;
  slug: string;
  sku: string;
  category: Bilingual;
  categoryKey: string;
  brand: string;
  name: Bilingual;
  meta: Bilingual;
  description: Bilingual;
  longDescription?: Bilingual;
  features?: Feature[];
  price: number;
  priceWas?: number;
  badge?: Bilingual;
  variantType: 'color' | 'size';
  bg: string;
  extraColors?: number;
  colors?: ColorVariant[];
  sizes?: SizeVariant[];
  pack: { count: number; pairs?: number; label: Bilingual };
  composition: Bilingual;
  origin: Bilingual;
  care: Bilingual;
  minOrder: { packs: number };
  season: Bilingual;
  seasonKey: string;
  tags: string[];
};

export type Category = {
  key: string;
  label: Bilingual;
  count: number;
  swatch?: string;
  parent?: string;
};

export type CartLine = {
  // Local id (for React keys). For server-backed lines this mirrors
  // serverId; for optimistic locals it's a temp string.
  id: string;
  // Django CartItem.id once persisted; null while pending or for
  // anonymous (in-memory) carts.
  serverId: number | null;
  productId: string;
  // Round-trip identifiers used by the Django cart endpoints.
  productSku: string;
  variantSku: string;
  name: Bilingual;
  category: Bilingual;
  variant: Bilingual;
  size: string;
  qty: number;
  price: number;
  bg: string;
};
