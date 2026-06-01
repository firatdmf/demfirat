'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Icon from './Icon';
import { useCart } from '@/contexts/CartContext';
import { useCurrency, type CurrencyCode } from '@/contexts/CurrencyContext';
import { useAuth } from '@/contexts/AuthContext';
import type { NavItemDTO } from '@/lib/api';

type SubItem = { id?: number; label: string; en: string; count: number; swatch: string; href: string };
type NavItem = {
  key: string;
  /** Storefront DB id (NavMenu.pk) when source is the API. Used by
   *  the visual editor to drag-reorder + inline-rename. Undefined for
   *  the bundled fallback NAV (legacy hardcoded list). */
  dbId?: number;
  label: string;
  labelEn: string;
  href?: string;
  sub?: SubItem[];
  // tone is the fallback color when image is missing; image takes
  // precedence in the mega-feature card render.
  feature?: { title: string; meta: string; tone: string; image?: string };
};

const NAV: NavItem[] = [
  {
    key: 'perdeler',
    label: 'Perdeler',
    labelEn: 'Curtains',
    href: '/products',
    sub: [
      // Tül
      { label: 'Tüm Tül Perdeler', en: 'All Tulle Curtains', count: 0, swatch: '#FAF8F4', href: '/products?cat=fabric' },
      { label: 'Nakışlı Tül Perde', en: 'Embroidered Tulle', count: 0, swatch: '#E9C7B8', href: '/products?cat=fabric&fabric_type=embroidery' },
      { label: 'Düz Tül Perdeler', en: 'Solid Tulle Curtains', count: 0, swatch: '#C9BFA9', href: '/products?cat=fabric&fabric_type=solid' },
      // Fon
      { label: 'Fon Perdeler', en: 'Blackout Curtains', count: 0, swatch: '#3B6B8C', href: '/products?cat=fabric&fabric_type=blackout' },
      // Rustik
      { label: 'Rustik Perdeler', en: 'Rustic Curtains', count: 0, swatch: '#B8654A', href: '/products?cat=ready-made_curtain' },
    ],
    feature: { title: 'Toptan perde koleksiyonu', meta: 'Top, metre & paket fiyatları', tone: '#C9BFA9' },
  },
  { key: 'yatak', label: 'Yatak Odası', labelEn: 'Bedroom', href: '/products?cat=bed' },
  { key: 'hakkimizda', label: 'Hakkımızda', labelEn: 'About', href: '/about' },
  { key: 'iletisim', label: 'İletişim', labelEn: 'Contact', href: '/contact' },
  { key: 'blog', label: 'Blog', labelEn: 'Blog', href: '/blog' },
];

/**
 * Adapter — accept either the bundled hardcoded NAV array (legacy)
 * or the storefront API DTO and normalise to a single shape the
 * existing render code already understands. Storefront entries can
 * be missing fields, so we fill in safe defaults.
 */
function navFromStorefront(items: NavItemDTO[]): NavItem[] {
  return items.map((it) => ({
    key: `sf-${it.id}`,
    dbId: it.id,
    label: it.label.tr || it.label.en,
    labelEn: it.label.en || it.label.tr,
    href: it.href || undefined,
    sub: it.children.length
      ? it.children.map((c) => ({
          id: c.id,
          label: c.label.tr || c.label.en,
          en: c.label.en || c.label.tr,
          count: c.count ?? 0,
          swatch: c.swatch || '#0E0E0C',
          href: c.href || '/products',
        }))
      : undefined,
    feature: it.feature
      ? {
          title: it.feature.title,
          meta: it.feature.meta,
          tone: '#C9BFA9',
          image: it.feature.image || undefined,
        }
      : undefined,
  }));
}

export default function Header({
  onOpenSearch,
  initialNav,
  categoryCounts,
}: {
  onOpenSearch: () => void;
  initialNav?: NavItemDTO[] | null;
  categoryCounts?: Record<string, number>;
}) {
  // Storefront API is the source of truth when reachable; otherwise
  // the bundled NAV array keeps the live site working. ERP edits show
  // up on the next request because next/dynamic re-renders the layout.
  const counts = categoryCounts ?? {};
  // Inject live counts into the hardcoded NAV sub-items so the mega
  // menu reads "Tüm Tül Perdeler · 12 ürün" instead of "0 ürün".
  const NAV_WITH_COUNTS: NavItem[] = NAV.map((item) => {
    if (!item.sub) return item;
    return {
      ...item,
      sub: item.sub.map((s) => {
        // Decide which count belongs to this sub-link by inspecting its href.
        const href = s.href || '';
        let count = 0;
        if (href.includes('cat=fabric') && href.includes('fabric_type=embroidery'))
          count = counts.embroidery ?? 0;
        else if (href.includes('cat=fabric') && href.includes('fabric_type=solid'))
          count = counts.solid ?? 0;
        else if (href.includes('cat=fabric') && href.includes('fabric_type=blackout'))
          count = counts.blackout ?? 0;
        else if (href.includes('cat=fabric'))
          count = counts.fabric ?? 0;
        else if (href.includes('cat=ready-made_curtain'))
          count = counts['ready-made_curtain'] ?? 0;
        else if (href.includes('cat=bed') || href === '/bedroom')
          count = counts.bed ?? 0;
        return { ...s, count };
      }),
    };
  });
  const navItems: NavItem[] = initialNav && initialNav.length > 0
    ? navFromStorefront(initialNav)
    : NAV_WITH_COUNTS;
  const locale = useLocale();
  const tCommon = useTranslations('common');
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const cart = useCart();
  const { currency, setCurrency } = useCurrency();
  const CURRENCIES: CurrencyCode[] = ['TRY', 'USD', 'EUR'];
  const { user, signOut } = useAuth();
  const [userMenu, setUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const currencyRef = useRef<HTMLDivElement>(null);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpand, setMobileExpand] = useState<string | null>(null);

  // Lock background scroll while the mobile drawer is open.
  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
    TRY: '₺', USD: '$', EUR: '€',
  };

  useEffect(() => {
    if (!currencyOpen && !langOpen) return;
    const onDown = (e: MouseEvent) => {
      if (currencyOpen && !currencyRef.current?.contains(e.target as Node)) setCurrencyOpen(false);
      if (langOpen && !langRef.current?.contains(e.target as Node)) setLangOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setCurrencyOpen(false); setLangOpen(false); }
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [currencyOpen, langOpen]);

  // Close the user dropdown on outside click / Escape. Mouse-leave
  // was too fragile (the 6px gap between the trigger and the panel
  // was killing the menu before the user could reach it).
  useEffect(() => {
    if (!userMenu) return;
    const onDown = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) setUserMenu(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setUserMenu(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenu]);

  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Header stays pinned to the top at all times. Only the dark utility
  // bar collapses once the user scrolls past the very top — the main
  // bar (logo + nav + actions) is always visible.
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const next = window.scrollY > 10;
        setScrolled((prev) => (prev === next ? prev : next));
        ticking = false;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const open = (k: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(k);
  };
  const close = () => {
    closeTimer.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const switchLang = (l: 'tr' | 'en') => {
    if (l === locale) return;
    // next-intl middleware reads the NEXT_LOCALE cookie when there is
    // no explicit locale segment in the URL. Without setting it, going
    // from /en/foo back to /foo (the implicit-TR path) gets re-resolved
    // to EN because the previous cookie still says 'en'. Writing the
    // new value before navigating fixes EN→TR (and prevents a flash on
    // TR→EN too).
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; samesite=lax`;

    const segments = pathname.split('/').filter(Boolean);
    if (segments[0] === 'tr' || segments[0] === 'en') segments.shift();
    const rest = segments.join('/');
    const base = l === 'tr' ? `/${rest}` : `/en/${rest}`;
    const cleanBase = base.replace(/\/+$/, '') || '/';
    const qs = searchParams.toString();
    const target = qs ? `${cleanBase}?${qs}` : cleanBase;
    // Hard navigation so the new locale's messages are loaded cleanly
    // and the URL/locale stay in sync — router.push left stale state
    // when switching mid-render.
    window.location.assign(target);
  };

  const localePrefix = locale === 'tr' ? '' : `/${locale}`;
  const homeHref = locale === 'tr' ? '/' : '/en';

  return (
    <header
      className={`bel-header ${scrolled ? 'scrolled' : ''}`}
      onMouseLeave={close}
    >
      <div className="bel-utility">
        <div className="bel-container util-row">
          <span className="bel-mono">{tCommon('wholesale')}</span>
          <div className="util-right">
            {user ? (
              <span className="util-signin" style={{ cursor: 'default' }}>
                {user.name || user.username}
              </span>
            ) : (
              <Link href={`${localePrefix}/login`} className="util-signin">
                {tCommon('signIn')}
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="bel-container main-bar">
        <button
          type="button"
          className={`bel-burger ${mobileOpen ? 'open' : ''}`}
          aria-label="Menu"
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>

        <Link className="bel-logo" href={homeHref}>
          <span className="logo-word">DEMFIRAT</span>
          <span className="logo-tag">Wholesale</span>
        </Link>

        <nav
          className="bel-nav"
          data-edit-sort-list="navmenu"
        >
          {navItems.map((item) => (
            <div
              key={item.key}
              className={`bel-nav-item ${openMenu === item.key ? 'open' : ''}`}
              onMouseEnter={() => item.sub && open(item.key)}
              data-edit-sort-id={item.dbId ?? undefined}
            >
              {item.href ? (
                // Items with href are clickable (navigate); if they also have
                // sub, hover still opens the mega menu.
                <Link href={`${localePrefix}${item.href}`}>
                  <button
                    data-edit-text={item.dbId ? `navmenu:${item.dbId}:label_${locale}` : undefined}
                  >
                    {locale === 'tr' ? item.label : item.labelEn}
                    {item.sub && <Icon name="chevronDown" size={10} />}
                  </button>
                </Link>
              ) : (
                <button onClick={() => item.sub && open(item.key)}>
                  <span
                    data-edit-text={item.dbId ? `navmenu:${item.dbId}:label_${locale}` : undefined}
                  >
                    {locale === 'tr' ? item.label : item.labelEn}
                  </span>
                  {item.sub && <Icon name="chevronDown" size={10} />}
                </button>
              )}
            </div>
          ))}
        </nav>

        <div className="bel-actions">
          <div className="bel-pick" ref={currencyRef} data-open={currencyOpen ? 'true' : 'false'}>
            <button
              type="button"
              className="bel-pick-trigger"
              aria-haspopup="listbox"
              aria-expanded={currencyOpen}
              onClick={() => { setCurrencyOpen((v) => !v); setLangOpen(false); }}
            >
              <span className="bel-pick-sym">{CURRENCY_SYMBOLS[currency]}</span>
              <span className="bel-pick-code">{currency}</span>
              <Icon name="chevronDown" size={14} />
            </button>
            {currencyOpen && (
              <div className="bel-pick-menu" role="listbox">
                {CURRENCIES.map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="option"
                    aria-selected={currency === c}
                    className={`bel-pick-opt ${currency === c ? 'on' : ''}`}
                    onClick={() => {
                      setCurrency(c);
                      setCurrencyOpen(false);
                    }}
                  >
                    <span className="bel-pick-opt-sym">{CURRENCY_SYMBOLS[c]}</span>
                    <span className="bel-pick-opt-code">{c}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="bel-pick" ref={langRef} data-open={langOpen ? 'true' : 'false'}>
            <button
              type="button"
              className="bel-pick-trigger"
              aria-haspopup="listbox"
              aria-expanded={langOpen}
              onClick={() => { setLangOpen((v) => !v); setCurrencyOpen(false); }}
            >
              <Icon name="globe" size={15} />
              <span className="bel-pick-code">{locale.toUpperCase()}</span>
              <Icon name="chevronDown" size={14} />
            </button>
            {langOpen && (
              <div className="bel-pick-menu" role="listbox">
                {(['tr', 'en'] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    role="option"
                    aria-selected={locale === l}
                    className={`bel-pick-opt ${locale === l ? 'on' : ''}`}
                    onClick={() => {
                      switchLang(l);
                      setLangOpen(false);
                    }}
                  >
                    <span className="bel-pick-opt-code">{l.toUpperCase()}</span>
                    <span className="bel-pick-opt-name">
                      {l === 'tr' ? 'Türkçe' : 'English'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button className="action" aria-label="Search" onClick={onOpenSearch}>
            <Icon name="search" />
          </button>
          {user ? (
            <div className="bel-user-menu" ref={userMenuRef}>
              <button
                className="action"
                aria-label="Account"
                aria-expanded={userMenu}
                onClick={() => setUserMenu((v) => !v)}
              >
                <Icon name="user" />
              </button>
              {userMenu && (
                <div className="bel-user-menu-panel">
                  <div className="bel-user-menu-head">
                    <div className="bel-user-menu-avatar" aria-hidden>
                      {(user.name || user.username).trim().charAt(0).toUpperCase()}
                    </div>
                    <div className="bel-user-menu-id">
                      <div className="bel-user-menu-name">{user.name || user.username}</div>
                      {user.email && <div className="bel-user-menu-email">{user.email}</div>}
                    </div>
                  </div>
                  <div className="bel-user-menu-section">
                    <Link
                      href={`${localePrefix}/account`}
                      className="bel-user-menu-item"
                      onClick={() => setUserMenu(false)}
                    >
                      <Icon name="userCircle" size={18} />
                      <span>{locale === 'tr' ? 'Hesabım' : 'My account'}</span>
                      <Icon name="chevronRight" size={14} />
                    </Link>
                    <Link
                      href={`${localePrefix}/account/orders`}
                      className="bel-user-menu-item"
                      onClick={() => setUserMenu(false)}
                    >
                      <Icon name="package" size={18} />
                      <span>{locale === 'tr' ? 'Siparişlerim' : 'Orders'}</span>
                      <Icon name="chevronRight" size={14} />
                    </Link>
                    <Link
                      href={`${localePrefix}/account/favorites`}
                      className="bel-user-menu-item"
                      onClick={() => setUserMenu(false)}
                    >
                      <Icon name="heart" size={18} />
                      <span>{locale === 'tr' ? 'Favorilerim' : 'Favorites'}</span>
                      <Icon name="chevronRight" size={14} />
                    </Link>
                    <Link
                      href={`${localePrefix}/account/addresses`}
                      className="bel-user-menu-item"
                      onClick={() => setUserMenu(false)}
                    >
                      <Icon name="mapPin" size={18} />
                      <span>{locale === 'tr' ? 'Adreslerim' : 'Addresses'}</span>
                      <Icon name="chevronRight" size={14} />
                    </Link>
                  </div>
                  <button
                    className="bel-user-menu-item logout"
                    onClick={() => {
                      signOut();
                      setUserMenu(false);
                    }}
                  >
                    <Icon name="signOut" size={18} />
                    <span>{locale === 'tr' ? 'Çıkış yap' : 'Sign out'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={`${localePrefix}/login`} className="action" aria-label="Account">
              <Icon name="user" />
            </Link>
          )}
          <button className="action cart" onClick={cart.open} aria-label="Cart">
            <Icon name="bag" />
            {cart.items.length > 0 && <span className="cart-dot">{cart.items.length}</span>}
          </button>
        </div>
      </div>

      {openMenu &&
        (() => {
          const item = navItems.find((n) => n.key === openMenu);
          if (!item || !item.sub) return null;
          return (
            <div className="bel-mega" onMouseEnter={() => open(openMenu)}>
              <div className="bel-container mega-row">
                <div className="mega-list">
                  <div className="bel-eyebrow" style={{ marginBottom: 16 }}>
                    {locale === 'tr' ? item.label : item.labelEn} · {item.sub.length}{' '}
                    {locale === 'tr' ? 'kategori' : 'categories'}
                  </div>
                  <div className="mega-grid">
                    {item.sub.map((s) => (
                      <Link
                        key={s.label}
                        href={`${localePrefix}${s.href}`}
                        className="mega-link"
                        onClick={() => setOpenMenu(null)}
                      >
                        <span className="mega-sw" style={{ background: s.swatch }} />
                        <span className="mega-label">
                          <span
                            className="mega-tr"
                            data-edit-text={s.id ? `navmenu:${s.id}:label_${locale}` : undefined}
                          >
                            {locale === 'tr' ? s.label : s.en}
                          </span>
                          <span className="mega-count">
                            {s.count} {locale === 'tr' ? 'ürün' : 'products'}
                          </span>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
                {item.feature && (
                  <Link
                    href={`${localePrefix}/products`}
                    className="mega-feature"
                    style={!item.feature.image ? { background: item.feature.tone } : undefined}
                    onClick={() => setOpenMenu(null)}
                  >
                    {item.feature.image && (
                      <Image
                        src={item.feature.image}
                        alt=""
                        fill
                        sizes="320px"
                        style={{ objectFit: 'cover' }}
                      />
                    )}
                    <div className="feat-content">
                      <div className="feat-tag">{locale === 'tr' ? 'Vitrin' : 'Featured'}</div>
                      <div className="feat-title">{item.feature.title}</div>
                      <div className="feat-meta">{item.feature.meta}</div>
                      <div className="feat-arrow">{locale === 'tr' ? 'İncele' : 'Explore'} →</div>
                    </div>
                  </Link>
                )}
              </div>
            </div>
          );
        })()}

      {/* ============ MOBILE SLIDE-DOWN MENU (Demfirat pattern) ============ */}
      {mobileOpen && (
        <div className="bel-mobile-menu" role="dialog" aria-modal="true">
            <nav className="bel-mobile-nav">
              {navItems.map((item) => {
                const expanded = mobileExpand === item.key;
                if (!item.sub || item.sub.length === 0) {
                  return (
                    <Link
                      key={item.key}
                      href={`${localePrefix}${item.href || '/'}`}
                      className="bel-mobile-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      {locale === 'tr' ? item.label : item.labelEn}
                    </Link>
                  );
                }
                return (
                  <div key={item.key} className={`bel-mobile-group ${expanded ? 'open' : ''}`}>
                    <button
                      type="button"
                      className="bel-mobile-link bel-mobile-link-toggle"
                      onClick={() => setMobileExpand(expanded ? null : item.key)}
                      aria-expanded={expanded}
                    >
                      <span>{locale === 'tr' ? item.label : item.labelEn}</span>
                      <Icon name="chevronDown" size={16} />
                    </button>
                    {expanded && (
                      <div className="bel-mobile-sub">
                        {item.sub.map((s) => (
                          <Link
                            key={s.label}
                            href={`${localePrefix}${s.href}`}
                            className="bel-mobile-sublink"
                            onClick={() => setMobileOpen(false)}
                          >
                            <span
                              className="bel-mobile-sw"
                              style={{ background: s.swatch }}
                            />
                            <span>{locale === 'tr' ? s.label : s.en}</span>
                            <span className="bel-mobile-count">{s.count}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>

            <div className="bel-mobile-foot">
              {user ? (
                <div className="bel-mobile-userline">
                  <Icon name="user" size={16} />
                  <span>{user.name || user.username}</span>
                </div>
              ) : (
                <Link
                  href={`${localePrefix}/login`}
                  className="bel-mobile-cta"
                  onClick={() => setMobileOpen(false)}
                >
                  {tCommon('signIn')}
                </Link>
              )}

              <div className="bel-mobile-row">
                <span className="bel-eyebrow">{locale === 'tr' ? 'Para' : 'Currency'}</span>
                <div className="bel-mobile-pills">
                  {CURRENCIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      className={`bel-mobile-pill ${currency === c ? 'on' : ''}`}
                      onClick={() => setCurrency(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bel-mobile-row">
                <span className="bel-eyebrow">{locale === 'tr' ? 'Dil' : 'Language'}</span>
                <div className="bel-mobile-pills">
                  {(['tr', 'en'] as const).map((l) => (
                    <button
                      key={l}
                      type="button"
                      className={`bel-mobile-pill ${locale === l ? 'on' : ''}`}
                      onClick={() => switchLang(l)}
                    >
                      {l.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
        </div>
      )}
    </header>
  );
}
