"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import classes from "@/components/Header.module.css";
import Link from "next/link";
import Image from 'next/image';
import { FaUser, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaBox, FaHeadset } from "react-icons/fa";
import { signOut } from "next-auth/react";
import LocaleSwitcher from "./LocaleSwitcher";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useCart } from "@/contexts/CartContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useRouter, usePathname } from "next/navigation";
import { getColorCode } from "@/lib/colorMap";
import { getLocalizedProductField } from "@/lib/productUtils";
import LoginModal from "./LoginModal";

interface HeaderProps {
  menuTArray: string[];
}

interface Product {
  id: number;
  pk?: number;
  title: string;
  sku?: string;
  category_name?: string;
  product_category?: string;
  primary_image?: string;
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  colors?: string[];
  description?: string;
}

function Header({ menuTArray }: HeaderProps) {
  const { data: session, status } = useSession();
  const locale = useLocale();
  const { cartCount } = useCart();
  const { convertPrice, currency, setCurrency, symbol } = useCurrency();
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    let lastY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        const delta = y - lastY;

        if (y < 10) {
          setIsScrolled(false);
          setIsHidden(false);
        } else {
          setIsScrolled(true);
          if (delta > 4 && y > 120) {
            setIsHidden(true);
          } else if (delta < -4) {
            setIsHidden(false);
          }
        }

        lastY = y;
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      search: { en: 'Search products...', tr: 'Ürün ara...', ru: 'Поиск товаров...', pl: 'Szukaj produktów...' },
      login: { en: 'Sign In', tr: 'Giriş', ru: 'Войти', pl: 'Zaloguj' },
      noResults: { en: 'No products found', tr: 'Ürün bulunamadı', ru: 'Товары не найдены', pl: 'Nie znaleziono produktów' },
      viewAll: { en: 'View all results', tr: 'Tüm sonuçları gör', ru: 'Все результаты', pl: 'Wszystkie wyniki' },
      trackOrder: { en: 'Order Tracking', tr: 'Sipariş Takibi', ru: 'Отслеживание', pl: 'Śledzenie' },
      blog: { en: 'Blog', tr: 'Blog', ru: 'Блог', pl: 'Blog' },
      helpSupport: { en: 'Help & Support', tr: 'Yardım & Destek', ru: 'Помощь', pl: 'Pomoc' },
      freeShipping: { en: 'Free Shipping on Domestic Orders Over 2000 TL', tr: 'Türkiye İçi 2000 TL ve Üzeri Siparişlerde Kargo Bedava', ru: 'Бесплатная доставка при заказе от 2000 TL', pl: 'Darmowa wysyłka powyżej 2000 TL' },
      qualityGuarantee: { en: '100% Quality Guarantee on All Products', tr: 'Tüm Ürünlerde %100 Kalite Garantisi', ru: '100% гарантия качества', pl: '100% gwarancja jakości' },
      followUs: { en: 'Follow Us', tr: 'Takip Edin', ru: 'Подписаться', pl: 'Obserwuj' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  const marqueeMessages = [
    t('freeShipping'),
    t('qualityGuarantee'),
  ];

  // Client-side product cache for instant search
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  const loadProductsForSearch = useCallback(async () => {
    if (productsLoaded || allProducts.length > 0) return;
    try {
      const response = await fetch(`/api/search?q=__all__&limit=500`);
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.products || []);
        setProductsLoaded(true);
      }
    } catch (error) { }
  }, [productsLoaded, allProducts.length]);

  useEffect(() => {
    const timer = setTimeout(() => { loadProductsForSearch(); }, 1000);
    return () => clearTimeout(timer);
  }, [loadProductsForSearch]);

  // Search logic
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (allProducts.length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      ).slice(0, 8);
      setSearchResults(filtered);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.products || []);
        }
      } catch (error) { }
      setIsSearching(false);
    }, 150);
    return () => clearTimeout(timeout);
  }, [searchQuery, allProducts]);

  // Open search — replaces header content inline
  const openSearch = () => {
    setSearchOpen(true);
    loadProductsForSearch();
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close on ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSearch();
    };
    if (searchOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Search', {
          search_string: searchQuery.trim(),
          content_category: 'products'
        });
      }
      router.push(`/${locale}/product/search?search=${encodeURIComponent(searchQuery)}`);
      closeSearch();
    }
  };

  const handleProductClick = (product: Product) => {
    const productIdentifier = product.sku || product.id;
    if (product.product_category === 'ready-made_curtain') {
      router.push(`/${locale}/product/ready-made_curtain/${productIdentifier}`);
    } else {
      router.push(`/${locale}/product/fabric/${productIdentifier}/curtain#ProductDetailCard`);
    }
    closeSearch();
  };

  const isProductDetail = pathname?.match(/\/product\/[^/]+\/[^/]+/);

  const headerClasses = [
    classes.header,
    hasMounted && isScrolled ? classes.scrolled : '',
    hasMounted && isHidden && isProductDetail ? classes.hidden : ''
  ].filter(Boolean).join(' ');

  return (
    <>
      <header className={headerClasses}>
        {/* Announcement Bar - Marquee */}
        <div className={classes.announcementBar}>
          <div className={classes.marqueeTrack}>
            <div className={classes.marqueeContent}>
              {marqueeMessages.map((msg, i) => (
                <span key={i} className={classes.marqueeItem}>
                  <span className={classes.marqueeDot}>✦</span> {msg}
                </span>
              ))}
              {marqueeMessages.map((msg, i) => (
                <span key={`dup-${i}`} className={classes.marqueeItem}>
                  <span className={classes.marqueeDot}>✦</span> {msg}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Single Main Header Bar */}
        <div className={classes.mainBar}>
          {!searchOpen ? (
            <>
              {/* Mobile hamburger */}
              <button
                className={classes.mobileMenuToggle}
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                <span className={mobileMenuOpen ? classes.active : ''}></span>
                <span className={mobileMenuOpen ? classes.active : ''}></span>
                <span className={mobileMenuOpen ? classes.active : ''}></span>
              </button>

              {/* Logo */}
              <Link href={`/${locale}`} className={classes.logoLink}>
                <Image
                  src="/media/karvenLogo.webp"
                  alt="Karven"
                  className={classes.logo}
                  width={150}
                  height={50}
                  priority
                  style={{ objectFit: 'contain', display: 'block' }}
                />
              </Link>

              {/* Desktop Nav Links */}
              <nav className={classes.desktopNav}>
                <Link href={`/${locale}`} className={classes.navLink}>
                  {menuTArray[0]}
                </Link>

                {/* TÜL PERDELER Dropdown */}
                <div className={classes.navDropdown}>
                  <span className={classes.navLink}>
                    {locale === 'tr' ? 'Tül Perdeler' : locale === 'ru' ? 'Тюлевые шторы' : locale === 'pl' ? 'Firany' : 'Tulle Curtains'}
                    <svg className={classes.dropdownArrow} width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                      <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
                    </svg>
                  </span>
                  <div className={classes.megaMenu}>
                    <div className={classes.megaMenuContent}>
                      <div className={classes.megaMenuCategories}>
                        <div className={classes.megaMenuColumn}>
                          <h4 className={classes.megaMenuTitle}>
                            {locale === 'tr' ? 'Tül Çeşitleri' : locale === 'ru' ? 'Виды тюля' : locale === 'pl' ? 'Rodzaje firan' : 'Tulle Types'}
                          </h4>
                          <Link href={`/${locale}/product/fabric?intent=custom_curtain&fabric_type=embroidery`} className={classes.megaMenuItem}>
                            {locale === 'tr' ? 'Nakışlı Tül Perde' : locale === 'ru' ? 'Вышитый тюль' : locale === 'pl' ? 'Haftowane firany' : 'Embroidered Tulle Curtains'}
                          </Link>
                          <Link href={`/${locale}/product/fabric?intent=custom_curtain&fabric_type=solid`} className={classes.megaMenuItem}>
                            {locale === 'tr' ? 'Düz Tül Perdeler' : locale === 'ru' ? 'Гладкий тюль' : locale === 'pl' ? 'Gładkie firany' : 'Solid Tulle Curtains'}
                          </Link>
                          <Link href={`/${locale}/product/fabric?intent=custom_curtain`} className={classes.megaMenuItem}>
                            {locale === 'tr' ? 'Tüm Perdeler' : locale === 'ru' ? 'Все шторы' : locale === 'pl' ? 'Wszystkie zasłony' : 'All Curtains'}
                          </Link>
                        </div>
                      </div>
                      <Link href={`/${locale}/product/fabric?intent=custom_curtain`} className={classes.megaMenuImage}>
                        <Image src="/media/hero/fabric-hero.png" alt="Tulle Curtains" width={300} height={200} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                        <div className={classes.megaMenuImageOverlay}>
                          <h3>{locale === 'tr' ? 'Tül Perde Koleksiyonu' : locale === 'ru' ? 'Коллекция тюля' : locale === 'pl' ? 'Kolekcja firan' : 'Tulle Collection'}</h3>
                          <span>{locale === 'tr' ? 'ALIŞVERİŞE BAŞLA' : locale === 'ru' ? 'НАЧАТЬ ПОКУПКИ' : locale === 'pl' ? 'ZACZNIJ ZAKUPY' : 'START SHOPPING'}</span>
                        </div>
                      </Link>
                    </div>
                  </div>
                </div>

                <Link href={`/${locale}/product/ready-made_curtain`} className={classes.navLink}>
                  {locale === 'tr' ? 'Hazır Perdeler' : locale === 'ru' ? 'Готовые шторы' : locale === 'pl' ? 'Gotowe zasłony' : 'Ready Made Curtains'}
                </Link>
                <Link href={`/${locale}/about`} className={classes.navLink}>
                  {menuTArray[3]}
                </Link>
                <Link href={`/${locale}/contact`} className={classes.navLink}>
                  {menuTArray[4]}
                </Link>
                <Link href={`/${locale}/blog`} className={classes.navLink}>
                  {t('blog')}
                </Link>
              </nav>

              {/* Right Icons */}
              <div className={classes.actionIcons}>
                <button onClick={openSearch} className={classes.iconButton} title="Search" aria-label="Search">
                  <FaSearch />
                </button>

                <Link href={`/${locale}/favorites`} className={classes.iconButton} title="Favorites">
                  <FaHeart />
                </Link>

                {hasMounted && session?.user ? (
                  <div className={classes.userDropdown}>
                    <button className={classes.iconButton} title="Account">
                      <FaUser />
                    </button>
                    <div className={classes.userDropdownMenu}>
                      <Link href={`/${locale}/account/profile`} className={classes.userDropdownItem}>
                        {locale === 'tr' ? 'Profilim' : locale === 'ru' ? 'Мой профиль' : locale === 'pl' ? 'Mój profil' : 'My Profile'}
                      </Link>
                      <Link href={`/${locale}/account/orders`} className={classes.userDropdownItem}>
                        {locale === 'tr' ? 'Siparişlerim' : locale === 'ru' ? 'Мои заказы' : locale === 'pl' ? 'Moje zamówienia' : 'My Orders'}
                      </Link>
                      <button onClick={() => signOut()} className={classes.userDropdownItem}>
                        {locale === 'tr' ? 'Çıkış Yap' : locale === 'ru' ? 'Выйти' : locale === 'pl' ? 'Wyloguj' : 'Sign Out'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => setShowLoginModal(true)} className={classes.iconButton} title={t('login')}>
                    <FaUser />
                  </button>
                )}

                <Link href={`/${locale}/cart`} className={classes.cartButton} title="Cart">
                  <FaShoppingCart />
                  {hasMounted && cartCount > 0 && (
                    <span className={classes.cartBadge}>{cartCount}</span>
                  )}
                </Link>

                {/* Currency Selector */}
                <div className={classes.currencySelector}>
                  <button className={classes.currencyBtn} title="Select currency">
                    <span className={classes.currencySymbol}>{hasMounted ? symbol : '₺'}</span>
                    <span className={classes.currencyCode}>{hasMounted ? currency : 'TRY'}</span>
                    <svg className={classes.currencyArrow} width="9" height="5" viewBox="0 0 9 5" fill="currentColor">
                      <path d="M1 1l3.5 3L8 1" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                    </svg>
                  </button>
                  <div className={classes.currencyDropdown}>
                    {[{ code: 'TRY', sym: '₺' }, { code: 'USD', sym: '$' }, { code: 'EUR', sym: '€' }, { code: 'RUB', sym: '₽' }, { code: 'PLN', sym: 'zł' }].map(c => (
                      <button
                        key={c.code}
                        className={`${classes.currencyOption} ${hasMounted ? (currency === c.code ? classes.currencyOptionActive : '') : (c.code === 'TRY' ? classes.currencyOptionActive : '')}`}
                        onClick={() => setCurrency(c.code)}
                      >
                        <span className={classes.currencyOptionSym}>{c.sym}</span>
                        <span className={classes.currencyOptionCode}>{c.code}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className={classes.localeSwitcherDesktop}>
                  <LocaleSwitcher />
                </div>
              </div>
            </>
          ) : (
            /* ── Search Mode: replaces header content inline ── */
            <div className={classes.searchBar}>
              <form onSubmit={handleSearchSubmit} className={classes.searchForm}>
                <FaSearch className={classes.searchIcon} />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={classes.searchInput}
                  autoComplete="off"
                />
              </form>
              <button onClick={closeSearch} className={classes.searchCloseBtn} aria-label="Close search">
                <FaTimes />
              </button>
            </div>
          )}
        </div>

        {/* Search Results Dropdown — positioned below header */}
        {searchOpen && (searchResults.length > 0 || isSearching || searchQuery.length >= 2) && (
          <div className={classes.searchResults}>
            <div className={classes.searchResultsInner}>
              {isSearching ? (
                <div className={classes.searchLoading}>
                  <span className={classes.spinner}></span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  <div className={classes.searchResultsGrid}>
                    {searchResults.map((product) => (
                      <div
                        key={product.id}
                        className={classes.searchResultCard}
                        onClick={() => handleProductClick(product)}
                      >
                        {product.primary_image && (
                          <Image
                            src={product.primary_image}
                            alt={getLocalizedProductField(product as any, 'title', locale)}
                            className={classes.searchResultCardImage}
                            width={120}
                            height={120}
                            style={{ objectFit: 'cover' }}
                          />
                        )}
                        <div className={classes.searchResultCardInfo}>
                          <span className={classes.searchResultCardTitle}>{getLocalizedProductField(product as any, 'title', locale)}</span>
                          {product.sku && <span className={classes.searchResultCardSku}>{product.sku}</span>}
                          <span className={classes.searchResultCardPrice}>
                            {product.minPrice && product.maxPrice && product.minPrice !== product.maxPrice
                              ? `${convertPrice(product.minPrice)} - ${convertPrice(product.maxPrice)}`
                              : product.price && Number(product.price) > 0
                                ? convertPrice(product.price)
                                : (locale === 'tr' ? 'Fiyat için iletişime geçin' : 'Contact for price')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className={classes.searchViewAll} onClick={handleSearchSubmit}>
                    {t('viewAll')}
                  </button>
                </>
              ) : searchQuery.length >= 2 ? (
                <div className={classes.noResults}>{t('noResults')}</div>
              ) : null}
            </div>
          </div>
        )}

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={classes.mobileMenu}>
            <Link href={`/${locale}`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {menuTArray[0]}
            </Link>
            <Link href={`/${locale}/product/fabric?intent=custom_curtain`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {locale === 'tr' ? 'Tül Perdeler' : locale === 'ru' ? 'Тюлевые шторы' : locale === 'pl' ? 'Firany' : 'Tulle Curtains'}
            </Link>
            <Link href={`/${locale}/product/fabric?intent=custom_curtain&fabric_type=embroidery`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
              {locale === 'tr' ? 'Nakışlı Tül Perde' : locale === 'ru' ? 'Вышитый тюль' : locale === 'pl' ? 'Haftowane firany' : 'Embroidered Tulle Curtains'}
            </Link>
            <Link href={`/${locale}/product/fabric?intent=custom_curtain&fabric_type=solid`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
              {locale === 'tr' ? 'Düz Tül Perdeler' : locale === 'ru' ? 'Гладкий тюль' : locale === 'pl' ? 'Gładkie firany' : 'Solid Tulle Curtains'}
            </Link>

            <Link href={`/${locale}/product/ready-made_curtain`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {locale === 'tr' ? 'Hazır Perdeler' : locale === 'ru' ? 'Готовые шторы' : locale === 'pl' ? 'Gotowe zasłony' : 'Ready Made Curtains'}
            </Link>
            <Link href={`/${locale}/about`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {menuTArray[3]}
            </Link>
            <Link href={`/${locale}/contact`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {menuTArray[4]}
            </Link>
            <Link href={`/${locale}/blog`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              {t('blog')}
            </Link>

            {/* Currency selector - mobile */}
            <div className={classes.mobileCurrency}>
              <span className={classes.mobileCurrencyLabel}>
                {locale === 'tr' ? 'Para Birimi' : locale === 'ru' ? 'Валюта' : locale === 'pl' ? 'Waluta' : 'Currency'}
              </span>
              <div className={classes.mobileCurrencyChips}>
                {[{ code: 'TRY', sym: '₺' }, { code: 'USD', sym: '$' }, { code: 'EUR', sym: '€' }, { code: 'RUB', sym: '₽' }, { code: 'PLN', sym: 'zł' }].map(c => (
                  <button
                    key={c.code}
                    className={`${classes.mobileCurrencyChip} ${currency === c.code ? classes.mobileCurrencyChipActive : ''}`}
                    onClick={() => { setCurrency(c.code); setMobileMenuOpen(false); }}
                  >
                    {c.sym} {c.code}
                  </button>
                ))}
              </div>
            </div>

            <div className={classes.mobileLocale} style={{ paddingBottom: 0 }}>
              <LocaleSwitcher />
            </div>

            <hr className={classes.mobileDivider} />

            <div className={classes.mobileSectionTitle}>
              {locale === 'tr' ? 'Yardımcı Sayfalar' : locale === 'ru' ? 'Полезные страницы' : locale === 'pl' ? 'Pomocne strony' : 'Helper Pages'}
            </div>

            <Link href={`/${locale}/order-tracking`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              <FaBox className={classes.mobileIcon} /> {t('trackOrder')}
            </Link>
            <Link href={`/${locale}/help`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              <FaHeadset className={classes.mobileIcon} /> {t('helpSupport')}
            </Link>

            <hr className={classes.mobileDivider} />

            <Link href={`/${locale}/favorites`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
              <FaHeart className={classes.mobileIcon} /> {locale === 'tr' ? 'Favorilerim' : locale === 'ru' ? 'Избранное' : locale === 'pl' ? 'Ulubione' : 'Favorites'}
            </Link>

            {session?.user && (
              <>
                <Link href={`/${locale}/account/orders`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
                  {locale === 'tr' ? 'Siparişlerim' : locale === 'ru' ? 'Мои заказы' : locale === 'pl' ? 'Moje zamówienia' : 'My Orders'}
                </Link>
                <button
                  onClick={() => { signOut(); setMobileMenuOpen(false); }}
                  className={classes.mobileNavLink}
                >
                  {locale === 'tr' ? 'Çıkış Yap' : locale === 'ru' ? 'Выйти' : locale === 'pl' ? 'Wyloguj' : 'Sign Out'}
                </button>
              </>
            )}

            <hr className={classes.mobileDivider} />
          </div>
        )}
      </header>

      {/* Search backdrop — dims page below header */}
      {searchOpen && (
        <div className={classes.searchBackdrop} onClick={closeSearch} />
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </>
  );
}

export default memo(Header);
