import type { Product, ColorVariant, SizeVariant, Bilingual } from '@/types/product';

/*
 * Maps the Django marketing API response to our internal `Product` type.
 *
 * Django response shape (see erp2/marketing/views.get_products):
 *   {
 *     products: [{ id, title, sku, description, price, primary_image,
 *                  product_attributes, product_files, attribute_value_images }],
 *     product_variants: [{ id, product_id, variant_sku, variant_price,
 *                          variant_quantity, product_variant_attribute_values }],
 *     product_variant_attributes: [{ id, name }],   // e.g. {name: "Renk"}, {name: "Beden"}
 *     product_variant_attribute_values: [{ id, product_variant_attribute_id, product_variant_attribute_value }]
 *   }
 *
 * Our Product type wants `colors[]` (color variants with stock+bg) and
 * `sizes[]` (size variants with stock). We collapse Django's
 * normalized variant grid into per-attribute-value aggregates.
 */

export type DjangoApiResponse = {
  products: DjangoProduct[];
  product_variants: DjangoVariant[];
  product_variant_attributes: { id: number; name: string }[];
  product_variant_attribute_values: {
    id: number;
    product_variant_attribute_id: number;
    product_variant_attribute_value: string;
  }[];
  product_category?: string | null;
};

export type DjangoProduct = {
  id: number;
  title: string;
  sku: string;
  description: string | null;
  price: number;
  /** Wholesale price for the B2B storefront. When set, the B2B mapper
   *  prefers this over `price`. Falls back to `price` when null. */
  b2b_price?: number | null;
  primary_image: string | null;
  product_attributes: { name: string; value: string; sequence: number }[];
  is_packaged?: boolean;
  pack_count?: number | null;
  product_files: { id: number; file: string; product_variant_id: number | null; is_primary: boolean }[];
  attribute_value_images?: Record<string, Record<string, { name: string; url: string }>>;
};

export type DjangoVariant = {
  id: number;
  product_id: number;
  variant_sku: string;
  variant_price: number | null;
  /** Variant-level wholesale price; overrides product b2b_price when set. */
  variant_b2b_price?: number | null;
  variant_quantity: number | null;
  product_variant_attribute_values: number[];
};

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[ı]/g, 'i')
    .replace(/[ş]/g, 's')
    .replace(/[ğ]/g, 'g')
    .replace(/[ü]/g, 'u')
    .replace(/[ö]/g, 'o')
    .replace(/[ç]/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

const dual = (v: string | null | undefined): Bilingual => ({
  tr: v ?? '',
  en: v ?? '',
});

/* Color name TR/EN dictionary. Keyed by lowercased input; lookup is
   bidirectional so the same map handles both Django→TR and Django→EN
   regardless of which language the source string was. */
const COLOR_DICT: Record<string, { tr: string; en: string }> = {
  white: { tr: 'Beyaz', en: 'White' },
  beyaz: { tr: 'Beyaz', en: 'White' },
  black: { tr: 'Siyah', en: 'Black' },
  siyah: { tr: 'Siyah', en: 'Black' },
  blue: { tr: 'Mavi', en: 'Blue' },
  mavi: { tr: 'Mavi', en: 'Blue' },
  red: { tr: 'Kırmızı', en: 'Red' },
  kirmizi: { tr: 'Kırmızı', en: 'Red' },
  'kırmızı': { tr: 'Kırmızı', en: 'Red' },
  green: { tr: 'Yeşil', en: 'Green' },
  yesil: { tr: 'Yeşil', en: 'Green' },
  'yeşil': { tr: 'Yeşil', en: 'Green' },
  pink: { tr: 'Pembe', en: 'Pink' },
  pembe: { tr: 'Pembe', en: 'Pink' },
  yellow: { tr: 'Sarı', en: 'Yellow' },
  sari: { tr: 'Sarı', en: 'Yellow' },
  'sarı': { tr: 'Sarı', en: 'Yellow' },
  orange: { tr: 'Turuncu', en: 'Orange' },
  turuncu: { tr: 'Turuncu', en: 'Orange' },
  purple: { tr: 'Mor', en: 'Purple' },
  mor: { tr: 'Mor', en: 'Purple' },
  brown: { tr: 'Kahverengi', en: 'Brown' },
  kahverengi: { tr: 'Kahverengi', en: 'Brown' },
  gray: { tr: 'Gri', en: 'Gray' },
  grey: { tr: 'Gri', en: 'Gray' },
  gri: { tr: 'Gri', en: 'Gray' },
  cream: { tr: 'Krem', en: 'Cream' },
  krem: { tr: 'Krem', en: 'Cream' },
  navy: { tr: 'Lacivert', en: 'Navy' },
  lacivert: { tr: 'Lacivert', en: 'Navy' },
  burgundy: { tr: 'Bordo', en: 'Burgundy' },
  bordo: { tr: 'Bordo', en: 'Burgundy' },
  beige: { tr: 'Bej', en: 'Beige' },
  bej: { tr: 'Bej', en: 'Beige' },
  khaki: { tr: 'Haki', en: 'Khaki' },
  haki: { tr: 'Haki', en: 'Khaki' },
  coral: { tr: 'Mercan', en: 'Coral' },
  mercan: { tr: 'Mercan', en: 'Coral' },
  sage: { tr: 'Adaçayı', en: 'Sage' },
  'adaçayı': { tr: 'Adaçayı', en: 'Sage' },
  adacayi: { tr: 'Adaçayı', en: 'Sage' },
  stone: { tr: 'Taş', en: 'Stone' },
  'taş': { tr: 'Taş', en: 'Stone' },
  tas: { tr: 'Taş', en: 'Stone' },
  cinnamon: { tr: 'Tarçın', en: 'Cinnamon' },
  'tarçın': { tr: 'Tarçın', en: 'Cinnamon' },
  tarcin: { tr: 'Tarçın', en: 'Cinnamon' },
  anthracite: { tr: 'Antrasit', en: 'Anthracite' },
  antrasit: { tr: 'Antrasit', en: 'Anthracite' },
  terracotta: { tr: 'Terracotta', en: 'Terracotta' },
};

const colorBilingual = (raw: string | null | undefined): Bilingual => {
  if (!raw) return { tr: '', en: '' };
  const hit = COLOR_DICT[raw.trim().toLowerCase()];
  return hit ? { ...hit } : dual(raw);
};

/*
 * Some Django text fields (description, title) are stored as JSON
 * with per-locale translations:
 *   {"translations": {"tr": {"title": "...", "description": "..."}, "en": {...}}}
 * Parse that into a Bilingual; fall back to raw string if it's plain text.
 */
function parseTranslated(raw: string | null | undefined, key: string, fallback = ''): Bilingual {
  if (!raw) return dual(fallback);
  const trimmed = raw.trim();
  if (!trimmed.startsWith('{')) return dual(trimmed);
  try {
    const parsed = JSON.parse(trimmed);
    const t = parsed?.translations;
    if (t && typeof t === 'object') {
      return {
        tr: t.tr?.[key] ?? t.en?.[key] ?? fallback,
        en: t.en?.[key] ?? t.tr?.[key] ?? fallback,
      };
    }
  } catch {}
  return dual(trimmed);
}

// Use the shared color map ported from demfirat.com main storefront —
// 150+ textile-specific Turkish/English color names (powder, lilac,
// spring flower, smoky quartz, vizon, kestane, etc.) mapped to hex.
import { COLOR_MAP } from './colorMap';

const colorHexFromName = (name: string): string => {
  // Normalise: lowercase + replace spaces with underscores so
  // "spring flower" matches "spring_flower" in COLOR_MAP keys.
  const normalised = name.toLowerCase().trim().replace(/[\s-]+/g, '_');
  return COLOR_MAP[normalised]
    ?? COLOR_MAP[name.toLowerCase().trim()]
    ?? '#6E685D';
};

const gradientFromHex = (hex: string): string => {
  // Quick lighten by averaging with white for the start stop
  return `linear-gradient(135deg, ${hex} 0%, ${hex} 100%)`;
};

export function mapDjangoToProducts(resp: DjangoApiResponse): Product[] {
  const attrById = new Map(resp.product_variant_attributes.map((a) => [a.id, a.name]));
  const attrValueById = new Map(
    resp.product_variant_attribute_values.map((v) => [
      v.id,
      { name: attrById.get(v.product_variant_attribute_id) ?? '', value: v.product_variant_attribute_value },
    ]),
  );

  return resp.products.map((p) => {
    const variants = resp.product_variants.filter((v) => v.product_id === p.id);

    // Aggregate stock per color and per size
    const colorMap = new Map<string, ColorVariant>();
    const sizeMap = new Map<string, SizeVariant>();

    for (const v of variants) {
      let colorVal: string | null = null;
      let sizeVal: string | null = null;
      for (const avId of v.product_variant_attribute_values) {
        const av = attrValueById.get(avId);
        if (!av) continue;
        const lower = av.name.toLowerCase();
        if (lower.includes('renk') || lower.includes('color')) colorVal = av.value;
        else if (lower.includes('beden') || lower.includes('size')) sizeVal = av.value;
      }

      const stock = Math.max(0, Math.floor(v.variant_quantity ?? 0));
      if (colorVal) {
        const existing = colorMap.get(colorVal);
        // ERP may publish a per-product swatch image map:
        //   attribute_value_images = { color: { "smoky_quartz": { name, url } } }
        // Backend normalises the key to lowercase + underscores ("smoky_quartz"),
        // but the variant value is stored in its original form ("Smoky Quartz").
        // Normalise both sides before comparing so the lookup actually matches.
        const normalize = (s: string) =>
          s.toLowerCase().trim().replace(/[\s\-]+/g, '_');
        const swatchFromMap = (() => {
          const map = p.attribute_value_images;
          if (!map) return undefined;
          const attrKey = Object.keys(map).find((k) => {
            const n = normalize(k);
            return n === 'color' || n === 'renk';
          });
          if (!attrKey) return undefined;
          const valueMap = map[attrKey];
          const target = normalize(colorVal!);
          const valKey = Object.keys(valueMap).find((k) => normalize(k) === target);
          return valKey ? valueMap[valKey]?.url : undefined;
        })();
        const hex = colorHexFromName(colorVal);
        // Prefer a variant-tagged image (any sequence, primary flag optional).
        // Fall back to the product's primary image, then a flat color.
        const variantImage =
          p.product_files.find((f) => f.product_variant_id === v.id && f.is_primary) ??
          p.product_files.find((f) => f.product_variant_id === v.id);
        // Large card photo (when this color is hovered/selected) —
        // matches demfirat.com:
        //   1. variant's own primary photo (per-variant image)
        //   2. product.primary_image (so cards never look broken when
        //      a variant has no dedicated photo yet)
        //   3. flat hex
        const bg = variantImage?.file
          ? `url(${variantImage.file}) center/cover`
          : p.primary_image
          ? `url(${p.primary_image}) center/cover`
          : gradientFromHex(hex);
        // Swatch dot color on the card — preference chain:
        //   1. attribute_value_images.color.<value>.url  (explicit swatch)
        //   2. variant_image.file                         (variant photo)
        //   3. flat hex color
        // This mirrors the demfirat.com main storefront behaviour so a
        // photo uploaded to the bed variant shows on the card swatch.
        // Swatch dot — matches demfirat.com main site behavior:
        //   1. If a color-swatch image is uploaded (attribute_value_images),
        //      use it (this is the "pattern" image, e.g. floral fabric).
        //   2. Otherwise fall back to the CSS hex matching the color name
        //      (Siyah → #0E0E0C, Adaçayı → #5C7C6F, etc.).
        // Variant product photos are NOT used as swatches.
        const swatchColor = swatchFromMap
          ? `url(${swatchFromMap}) center/cover`
          : hex;
        if (existing) existing.stock += stock;
        else colorMap.set(colorVal, { id: slugify(colorVal), color: swatchColor, label: colorBilingual(colorVal), stock, bg });
      }
      if (sizeVal) {
        const existing = sizeMap.get(sizeVal);
        if (existing) existing.stock += stock;
        else sizeMap.set(sizeVal, { id: slugify(sizeVal), label: sizeVal, stock });
      }
    }

    const colors = Array.from(colorMap.values());
    const sizes = Array.from(sizeMap.values());

    // Pull metadata from product_attributes (key/value list set in Django)
    const attrs: Record<string, string> = {};
    for (const a of p.product_attributes) attrs[a.name.toLowerCase()] = a.value;

    const slug = slugify(p.title) || `urun-${p.id}`;
    // Card default image (when no swatch hovered) — matches demfirat.com
    // main storefront behaviour:
    //   1. product.primary_image (the user-curated "hero" photo)
    //   2. else first variant's primary photo (variant-tagged file)
    //   3. else any variant photo
    //   4. else flat gradient
    // The per-variant photos still drive the swatch-hover state below;
    // primary_image here is just the "default" the customer first sees.
    const firstVariantWithImage = variants.find((v) =>
      p.product_files.some((f) => f.product_variant_id === v.id),
    );
    const firstVariantImage = firstVariantWithImage
      ? (p.product_files.find((f) => f.product_variant_id === firstVariantWithImage.id && f.is_primary)
        ?? p.product_files.find((f) => f.product_variant_id === firstVariantWithImage.id))
      : undefined;
    const primaryBg = p.primary_image
      ? `url(${p.primary_image}) center/cover`
      : firstVariantImage?.file
      ? `url(${firstVariantImage.file}) center/cover`
      : colors[0]?.bg ?? 'linear-gradient(135deg,#C9BFA9 0%,#6E685D 100%)';

    // The ERP product editor stores BOTH the localized title AND the
    // localized description inside `p.description` as JSON:
    //   {"translations": {"tr": {"title": "...", "description": "..."}, "en": {...}}}
    // `p.title` itself is just the legacy plain-text fallback (often a
    // dev placeholder like "BelinoPlus Erkek sdsds"), so the bilingual
    // display name has to be parsed out of `p.description`.
    const titleBilingual = parseTranslated(p.description, 'title', p.title);
    const longDescHtml = parseTranslated(p.description, 'description', '');
    const careHtml = parseTranslated(p.description, 'care_instructions', '');
    const stripHtml = (s: string) =>
      s.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
    const shortFromLong = (s: string) => {
      const stripped = stripHtml(s);
      return stripped.length > 220 ? stripped.slice(0, 217).trimEnd() + '…' : stripped;
    };
    const shortDesc: Bilingual = {
      tr: shortFromLong(longDescHtml.tr),
      en: shortFromLong(longDescHtml.en),
    };

    const product: Product = {
      id: String(p.id),
      slug,
      sku: p.sku,
      // The Django list response carries the active category at the
      // response level, not per-product. Stamp it so client-side
      // re-filters don't drop everything when category was set.
      categoryKey: resp.product_category ?? attrs['kategori_key'] ?? attrs['category'] ?? 'genel',
      category: dual(resp.product_category ?? attrs['kategori'] ?? attrs['category'] ?? ''),
      brand: attrs['marka'] ?? 'DEMFIRAT',
      name: titleBilingual,
      meta: dual(attrs['meta'] ?? `${sizes.length} beden · ${colors.length} renk`),
      description: shortDesc,
      longDescription: longDescHtml.tr || longDescHtml.en ? longDescHtml : undefined,
      // B2B storefront prefers the wholesale price (product or variant level).
      // Picks the lowest non-null variant_b2b_price as the from-price; falls
      // back to product b2b_price, then to retail price.
      price: (() => {
        const variantB2bPrices = variants
          .map(v => v.variant_b2b_price)
          .filter((x): x is number => x != null && x > 0);
        if (variantB2bPrices.length > 0) return Math.min(...variantB2bPrices);
        if (p.b2b_price != null && Number(p.b2b_price) > 0) return Number(p.b2b_price);
        return Number(p.price);
      })(),
      variantType: colors.length > 1 ? 'color' : 'size',
      bg: primaryBg,
      colors,
      sizes,
      // Pack metadata is now first-class on Product (is_packaged + pack_count).
      // We still fall back to the legacy `paket_adet` attribute for older rows
      // that pre-date the schema change. count=0 means "sold by the unit, no pack".
      pack: (() => {
        const isPacked = p.is_packaged === true;
        const explicit = isPacked ? Number(p.pack_count ?? 0) : 0;
        const legacy = Number(attrs['paket_adet'] ?? 0);
        const count = explicit > 0 ? explicit : legacy;
        const labelTr = count > 0 ? `${count}'li paket` : 'Tekli';
        const labelEn = count > 0 ? `Pack of ${count}` : 'Single';
        return { count, label: { tr: attrs['paket_etiket'] || labelTr, en: attrs['paket_etiket_en'] || labelEn } };
      })(),
      composition: dual(attrs['kompozisyon'] ?? ''),
      origin: dual(attrs['uretim'] ?? 'Türkiye'),
      care: careHtml.tr || careHtml.en
        ? { tr: stripHtml(careHtml.tr), en: stripHtml(careHtml.en) }
        : dual(attrs['yikama'] ?? ''),
      minOrder: { packs: Number(attrs['min_siparis'] ?? 24) },
      seasonKey: attrs['sezon_key'] ?? 'all',
      season: dual(attrs['sezon'] ?? ''),
      tags: (attrs['etiketler'] ?? '').split(',').map((t) => t.trim()).filter(Boolean),
    };
    return product;
  });
}

export function mapDjangoToProduct(resp: DjangoApiResponse): Product | null {
  const list = mapDjangoToProducts(resp);
  return list[0] ?? null;
}
