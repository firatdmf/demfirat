import SiteShell from '@/components/SiteShell';
import { getProducts } from '@/lib/api';

// Server component — fetches product counts per DEMFIRAT category so the
// header menu can render "Tül Perdeler 12 ürün" with real numbers (not 0).
// Cached for 60s via the djangoGet revalidate setting in api.ts.
export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [fabric, readyMade, bed] = await Promise.all([
    getProducts({ categoryKey: 'fabric' }),
    getProducts({ categoryKey: 'ready-made_curtain' }),
    getProducts({ categoryKey: 'bed' }),
  ]);
  const categoryCounts = {
    fabric: fabric.length,
    'ready-made_curtain': readyMade.length,
    bed: bed.length,
    // Tülle subtype counts (best-effort: client-side filter on the
    // already-fetched fabric list using fabric_type attribute).
    embroidery: fabric.filter((p) =>
      (p as any).fabric_type === 'embroidery' || p.tags?.includes('embroidery'),
    ).length,
    solid: fabric.filter((p) =>
      (p as any).fabric_type === 'solid' || p.tags?.includes('solid'),
    ).length,
    blackout: fabric.filter((p) =>
      (p as any).fabric_type === 'blackout' || p.tags?.includes('blackout'),
    ).length,
  };
  return <SiteShell initialNav={null} categoryCounts={categoryCounts}>{children}</SiteShell>;
}
