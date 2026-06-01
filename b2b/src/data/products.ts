import type { Product, Category } from '@/types/product';

const blackBg = 'linear-gradient(135deg,#0E0E0C 0%, #2C2A26 100%)';
const creamBg = 'linear-gradient(135deg,#F4F0E8 0%, #E0D9CA 100%)';
const sageBg = 'linear-gradient(135deg,#C7D4CC 0%, #5C7C6F 100%)';
const navyBg = 'linear-gradient(135deg,#3B6B8C 0%, #1F3D52 100%)';
const burgundyBg = 'linear-gradient(135deg,#B0382F 0%, #6E1F19 100%)';
const terracottaBg = 'linear-gradient(135deg,#E9C7B8 0%, #B8654A 100%)';
const stoneBg = 'linear-gradient(135deg,#C9BFA9 0%, #9A9281 100%)';
const whiteBg = 'linear-gradient(135deg,#FFFFFF 0%, #ECE6DA 100%)';
const greyBg = 'linear-gradient(135deg,#C9BFA9 0%, #6E685D 100%)';
const cinnamonBg = 'linear-gradient(135deg,#8C4A33 0%, #4A2519 100%)';
const anthraciteBg = 'linear-gradient(135deg,#6E685D 0%, #3A3631 100%)';

export const PRODUCTS: Product[] = [];

// DEMFIRAT category structure — matches demfirat.com main storefront.
// ERP product_category values: "fabric" (tülle/blackout/embroidery curtains),
// "ready-made_curtain" (rustic), "bed" (bedroom). The `key` here matches
// the ERP product_category so filter URLs work with the API.
export const CATEGORIES: Category[] = [
  { key: 'fabric', label: { tr: 'Tül Perdeler', en: 'Tulle Curtains' }, count: 0, swatch: '#FAF8F4', parent: 'perdeler' },
  { key: 'ready-made_curtain', label: { tr: 'Rustik Perdeler', en: 'Rustic Curtains' }, count: 0, swatch: '#B8654A', parent: 'perdeler' },
  { key: 'bed', label: { tr: 'Yatak Odası', en: 'Bedroom' }, count: 0, swatch: '#E9C7B8', parent: 'yatak' },
];

// DEMFIRAT does not segment by season — keep an empty list so any
// season-driven UI renders nothing rather than a sock collection.
export const SEASONS: { key: string; label: { tr: string; en: string }; count: number; bg: string }[] = [];

// Single-brand storefront — no brand picker needed.
export const BRANDS: { key: string; label: { tr: string; en: string }; count: number; swatch: string }[] = [];
