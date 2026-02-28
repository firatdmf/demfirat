"use client";
import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import classes from "@/components/Header.module.css";
import Link from "next/link";
import Image from 'next/image';
import { FaUser, FaHeart, FaShoppingCart, FaSearch, FaTimes, FaBox, FaBook, FaHeadset } from "react-icons/fa";
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
  product_category?: string; // Added field
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
  const searchRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch - always render logged-out state on server
  const [hasMounted, setHasMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    setHasMounted(true);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Çeviriler
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      search: { en: 'Search products...', tr: 'Ürün ara...', ru: 'Поиск товаров...', pl: 'Szukaj produktów...' },
      login: { en: 'Sign In', tr: 'Giriş', ru: 'Войти', pl: 'Zaloguj' },
      noResults: { en: 'No products found', tr: 'Ürün bulunamadı', ru: 'Товары не найдены', pl: 'Nie znaleziono produktów' },
      viewAll: { en: 'View all results', tr: 'Tüm sonuçları gör', ru: 'Все результаты', pl: 'Wszystkie wyniki' },
      solidFabric: { en: 'Solid Fabric', tr: 'Düz Kumaş', ru: 'Гладкая ткань', pl: 'Gładka tkanina' },
      embroideredFabric: { en: 'Embroidered Fabric', tr: 'Nakışlı Kumaş', ru: 'Вышитая ткань', pl: 'Haftowana tkanina' },
      followUs: { en: 'Follow Us', tr: 'Takip Edin', ru: 'Подписаться', pl: 'Obserwuj' },
      trackOrder: { en: 'Order Tracking', tr: 'Sipariş Takibi', ru: 'Отслеживание', pl: 'Śledzenie' },
      blog: { en: 'Blog', tr: 'Blog', ru: 'Блог', pl: 'Blog' },
      helpSupport: { en: 'Help & Support', tr: 'Yardım & Destek', ru: 'Помощь', pl: 'Pomoc' },
      freeShipping: { en: 'Free Shipping on Domestic Orders Over 2000 TL', tr: 'Türkiye İçi 2000 TL ve Üzeri Siparişlerde Kargo Bedava', ru: 'Бесплатная доставка при заказе от 2000 TL (по Турции)', pl: 'Darmowa wysyłka przy zamówieniach powyżej 2000 TL (w Turcji)' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  // Click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Client-side product cache for instant search
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [productsLoaded, setProductsLoaded] = useState(false);

  // Load products once when search is focused - memoized
  const loadProductsForSearch = useCallback(async () => {
    if (productsLoaded || allProducts.length > 0) return;

    try {
      const response = await fetch(`/api/search?q=__all__&limit=500`);
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data.products || []);
        setProductsLoaded(true);
      }
    } catch (error) {
      // Silent fail
    }
  }, [productsLoaded, allProducts.length]);

  // Preload products automatically on mount (with delay to not block initial render)
  useEffect(() => {
    const timer = setTimeout(() => {
      loadProductsForSearch();
    }, 1000); // 1 second delay to allow page to fully render first
    return () => clearTimeout(timer);
  }, [loadProductsForSearch]);

  // Instant client-side search (no API calls after initial load)
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // If products are loaded, search instantly
    if (allProducts.length > 0) {
      const query = searchQuery.toLowerCase();
      const filtered = allProducts.filter(p =>
        p.title?.toLowerCase().includes(query) ||
        p.sku?.toLowerCase().includes(query) ||
        p.description?.toLowerCase().includes(query)
      ).slice(0, 8);

      setSearchResults(filtered);
      setShowResults(true);
      setIsSearching(false);
      return;
    }

    // Fallback to API if products not loaded yet
    setIsSearching(true);
    const timeout = setTimeout(async () => {
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
        if (response.ok) {
          const data = await response.json();
          setSearchResults(data.products || []);
          setShowResults(true);
        }
      } catch (error) { }
      setIsSearching(false);
    }, 150);

    return () => clearTimeout(timeout);
  }, [searchQuery, allProducts]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Meta Pixel: Search Event
      if (typeof window !== 'undefined' && (window as any).fbq) {
        (window as any).fbq('track', 'Search', {
          search_string: searchQuery.trim(),
          content_category: 'products'
        });
        console.log('[Meta Pixel] Search event fired', { query: searchQuery.trim() });
      }

      // Changed to 'search' to trigger the multi-category search
      router.push(`/${locale}/product/search?search=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchQuery("");
    }
  };

  const handleProductClick = (product: Product) => {
    // Use SKU for URL, fallback to ID if SKU not available
    const productIdentifier = product.sku || product.id;
    // Fabric products → custom curtain (özel dikim) page; ready-made curtains go to their own page
    if (product.product_category === 'ready-made_curtain') {
      router.push(`/${locale}/product/ready-made_curtain/${productIdentifier}`);
    } else {
      // All fabric products redirect to the custom curtain configurator
      router.push(`/${locale}/product/fabric/${productIdentifier}?intent=custom_curtain`);
    }
    setShowResults(false);
    setSearchQuery("");
  };

  return (
    <header className={`${classes.header} ${isScrolled ? classes.scrolled : ''}`}>
      {/* Utility Bar - Top strip */}
      <div className={classes.utilityBar}>
        <div className={classes.utilityContent}>
          <span className={classes.utilityPromo}>{t('freeShipping')}</span>
          <div className={classes.utilityLinks}>
            <Link href={`/${locale}/blog`} className={classes.utilityLink}>{t('blog')}</Link>
            <Link href={`/${locale}/order-tracking`} className={classes.utilityLink}>
              <FaBox className={classes.utilityIcon} />
              {t('trackOrder')}
            </Link>
            <Link href={`/${locale}/help`} className={classes.utilityLink}>{t('helpSupport')}</Link>
          </div>
        </div>
      </div>

      {/* Top Bar */}
      <div className={classes.topBar}>
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

        {/* Search Bar */}
        <div className={classes.searchContainer} ref={searchRef}>
          <form onSubmit={handleSearchSubmit} className={classes.searchForm}>
            <FaSearch className={classes.searchIcon} />
            <input
              type="text"
              placeholder={t('search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={loadProductsForSearch}
              className={classes.searchInput}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => { setSearchQuery(""); setShowResults(false); }}
                className={classes.clearButton}
              >
                <FaTimes />
              </button>
            )}
          </form>

          {/* Search Results Dropdown */}
          {showResults && (
            <div className={classes.searchResults}>
              {isSearching ? (
                <div className={classes.searchLoading}>
                  <span className={classes.spinner}></span>
                </div>
              ) : searchResults.length > 0 ? (
                <>
                  {searchResults.slice(0, 6).map((product) => (
                    <div
                      key={product.id}
                      className={classes.searchResultItem}
                      onClick={() => handleProductClick(product)}
                    >
                      {product.primary_image && (
                        <Image
                          src={product.primary_image}
                          alt={getLocalizedProductField(product as any, 'title', locale)}
                          className={classes.resultImage}
                          width={50}
                          height={50}
                          style={{ objectFit: 'cover', borderRadius: '4px' }}
                        />
                      )}
                      <div className={classes.resultInfo}>
                        <span className={classes.resultTitle}>{getLocalizedProductField(product as any, 'title', locale)}</span>
                        {product.sku && (
                          <span className={classes.resultSku}>{product.sku}</span>
                        )}
                        <span className={classes.resultPrice}>
                          {product.minPrice && product.maxPrice && product.minPrice !== product.maxPrice
                            ? `${convertPrice(product.minPrice)} - ${convertPrice(product.maxPrice)}`
                            : product.price && Number(product.price) > 0
                              ? convertPrice(product.price)
                              : (locale === 'tr' ? 'Fiyat için iletişime geçin' :
                                locale === 'ru' ? 'Свяжитесь для цены' :
                                  locale === 'pl' ? 'Skontaktuj się' : 'Contact for price')}
                        </span>
                        {product.colors && product.colors.length > 0 && (
                          <div className={classes.resultColors}>
                            {product.colors.slice(0, 4).map((color, idx) => (
                              <span
                                key={idx}
                                className={classes.colorSwatch}
                                style={{ backgroundColor: getColorCode(color) }}
                                title={color}
                              />
                            ))}
                            {product.colors.length > 4 && (
                              <span className={classes.moreColors}>+{product.colors.length - 4}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 6 && (
                    <button
                      className={classes.viewAllButton}
                      onClick={handleSearchSubmit}
                    >
                      {t('viewAll')} ({searchResults.length})
                    </button>
                  )}
                </>
              ) : (
                <div className={classes.noResults}>{t('noResults')}</div>
              )}
            </div>
          )}
        </div>

        {/* Action Icons */}
        <div className={classes.actionIcons}>
          <Link href={`/${locale}/order-tracking`} className={classes.iconButton} title={t('trackOrder')}>
            <FaBox />
          </Link>
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
            <button
              onClick={() => setShowLoginModal(true)}
              className={classes.iconButton}
              title={t('login')}
            >
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

        {/* Mobile Menu Toggle */}
        <button
          className={classes.mobileMenuToggle}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={mobileMenuOpen ? classes.active : ''}></span>
          <span className={mobileMenuOpen ? classes.active : ''}></span>
          <span className={mobileMenuOpen ? classes.active : ''}></span>
        </button>
      </div>

      {/* Navigation Bar */}
      <nav className={classes.navBar}>
        <div className={classes.navContent}>
          <Link href={`/${locale}`} className={classes.navLink}>
            {menuTArray[0]}
          </Link>

          {/* TÜL PERDELER Mega Menu (Replacing Kumaşlar) */}
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

          {/* TEMPORARILY HIDDEN - Kumaşlar Mega Menu
          <div className={classes.navDropdown}>
            <span className={classes.navLink}>
              {menuTArray[1]}
              <svg className={classes.dropdownArrow} width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                <path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </span>
            <div className={classes.megaMenu}>
              <div className={classes.megaMenuContent}>
                <div className={classes.megaMenuCategories}>
                  <div className={classes.megaMenuColumn}>
                    <h4 className={classes.megaMenuTitle}>
                      {locale === 'tr' ? 'Kumaş Çeşitleri' : locale === 'ru' ? 'Виды тканей' : locale === 'pl' ? 'Rodzaje tkanin' : 'Fabric Types'}
                    </h4>
                    <Link href={`/${locale}/product/fabric?fabric_type=solid`} className={classes.megaMenuItem}>
                      {t('solidFabric')}
                    </Link>
                    <Link href={`/${locale}/product/fabric?fabric_type=embroidery`} className={classes.megaMenuItem}>
                      {t('embroideredFabric')}
                    </Link>
                    <Link href={`/${locale}/product/fabric`} className={classes.megaMenuItem}>
                      {locale === 'tr' ? 'Tüm Kumaşlar' : locale === 'ru' ? 'Все ткани' : locale === 'pl' ? 'Wszystkie tkaniny' : 'All Fabrics'}
                    </Link>
                  </div>
                  <div className={classes.megaMenuColumn}>
                    <h4 className={classes.megaMenuTitle}>
                      {locale === 'tr' ? 'Özel Dikim Perde' : locale === 'ru' ? 'Пошив штор' : locale === 'pl' ? 'Szycie na miarę' : 'Custom Curtains'}
                    </h4>
                    <Link href={`/${locale}/product/fabric?intent=custom_curtain`} className={classes.megaMenuItem}>
                      {locale === 'tr' ? 'Perde Diktir' : locale === 'ru' ? 'Заказать пошив' : locale === 'pl' ? 'Zamów szycie' : 'Order Custom Curtain'}
                    </Link>
                    <Link href={`/${locale}/blog/ozel-dikim-perde-siparisi`} className={classes.megaMenuItem}>
                      {locale === 'tr' ? 'Sipariş Nasıl Yapılır?' : locale === 'ru' ? 'Как заказать?' : locale === 'pl' ? 'Jak zamówić?' : 'How to Order?'}
                    </Link>
                    <Link href={`/${locale}/blog/dogru-olcu-nasil-alinir`} className={classes.megaMenuItem}>
                      {locale === 'tr' ? 'Ölçü Nasıl Alınır?' : locale === 'ru' ? 'Как измерить?' : locale === 'pl' ? 'Jak mierzyć?' : 'How to Measure?'}
                    </Link>
                  </div>
                </div>
                <Link href={`/${locale}/product/fabric`} className={classes.megaMenuImage}>
                  <Image src="/media/hero/fabric-hero.png" alt="Kumaş Koleksiyonu" width={300} height={200} style={{ objectFit: 'cover', borderRadius: '4px' }} />
                  <div className={classes.megaMenuImageOverlay}>
                    <h3>{locale === 'tr' ? 'Kumaş Koleksiyonu' : locale === 'ru' ? 'Коллекция тканей' : locale === 'pl' ? 'Kolekcja tkanin' : 'Fabric Collection'}</h3>
                    <span>{locale === 'tr' ? 'ALIŞVERİŞE BAŞLA' : locale === 'ru' ? 'НАЧАТЬ ПОКУПКИ' : locale === 'pl' ? 'ZACZNIJ ZAKUPY' : 'START SHOPPING'}</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          */}

          {/* TEMPORARILY HIDDEN - Ready-made curtains
          <Link href={`/${locale}/product/ready-made_curtain`} className={classes.navLink}>
            {menuTArray[2]}
          </Link>
          */}

          <Link href={`/${locale}/about`} className={classes.navLink}>
            {menuTArray[3]}
          </Link>
          <Link href={`/${locale}/contact`} className={classes.navLink}>
            {menuTArray[4]}
          </Link>
          <Link href={`/${locale}/blog`} className={classes.navLink}>
            {t('blog')}
          </Link>
          <Link href={`/${locale}/follow-us`} className={`${classes.navLink} ${classes.instagramLink}`}>
            {t('followUs')}
          </Link>
        </div>
      </nav>

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
          <Link href={`/${locale}/product/fabric?intent=custom_curtain`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
            {locale === 'tr' ? 'Tüm Perdeler' : locale === 'ru' ? 'Все шторы' : locale === 'pl' ? 'Wszystkie zasłony' : 'All Curtains'}
          </Link>

          {/* TEMPORARILY HIDDEN - Kumaşlar
          <Link href={`/${locale}/product/fabric`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            {menuTArray[1]}
          </Link>
          <Link href={`/${locale}/product/fabric?fabric_type=solid`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
            {t('solidFabric')}
          </Link>
          <Link href={`/${locale}/product/fabric?fabric_type=embroidery`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
            {t('embroideredFabric')}
          </Link>

          <div className={classes.mobileSectionTitle} style={{ paddingLeft: '1.5rem', marginTop: '0.5rem', fontSize: '0.85rem' }}>
            {locale === 'tr' ? 'Özel Dikim Perde' : locale === 'ru' ? 'Пошив штор' : locale === 'pl' ? 'Szycie na miarę' : 'Custom Curtains'}
          </div>
          <Link href={`/${locale}/product/fabric?intent=custom_curtain`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
            {locale === 'tr' ? 'Perde Diktir' : locale === 'ru' ? 'Заказать пошив' : locale === 'pl' ? 'Zamów szycie' : 'Order Custom Curtain'}
          </Link>
          <Link href={`/${locale}/blog/ozel-dikim-perde-siparisi`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
            {locale === 'tr' ? 'Sipariş Nasıl Yapılır?' : locale === 'ru' ? 'Как заказать?' : locale === 'pl' ? 'Jak zamówić?' : 'How to Order?'}
          </Link>
          <Link href={`/${locale}/blog/dogru-olcu-nasil-alinir`} className={classes.mobileSubLink} onClick={() => setMobileMenuOpen(false)}>
            {locale === 'tr' ? 'Ölçü Nasıl Alınır?' : locale === 'ru' ? 'Как измерить?' : locale === 'pl' ? 'Jak mierzyć?' : 'How to Measure?'}
          </Link>
          */}

          {/* TEMPORARILY HIDDEN - Ready-made curtains
          <Link href={`/${locale}/product/ready-made_curtain`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            {menuTArray[2]}
          </Link>
          */}
          <Link href={`/${locale}/about`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            {menuTArray[3]}
          </Link>
          <Link href={`/${locale}/contact`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            {menuTArray[4]}
          </Link>
          <Link href={`/${locale}/blog`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            {t('blog')}
          </Link>
          <Link href={`/${locale}/follow-us`} className={`${classes.mobileNavLink} ${classes.instagramLink}`} onClick={() => setMobileMenuOpen(false)}>
            {t('followUs')}
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
          <Link href={`/${locale}/blog`} className={classes.mobileNavLink} onClick={() => setMobileMenuOpen(false)}>
            <FaBook className={classes.mobileIcon} /> {t('blog')}
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

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </header>
  );
}

export default memo(Header);
