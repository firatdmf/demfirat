"use client";
import React, { useState } from "react";
import classes from "@/components/Header.module.css";
import Link from "next/link";
import { FaSignOutAlt, FaUser, FaHeart, FaShoppingCart, FaChevronDown } from "react-icons/fa";
import { signOut } from "next-auth/react";
import LocaleSwitcher from "./LocaleSwitcher";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";
import { useCart } from "@/contexts/CartContext";

interface HeaderProps {
  menuTArray: string[];
}

function Header({ menuTArray }: HeaderProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const { cartCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const [fabricDropdownOpen, setFabricDropdownOpen] = useState(false);
  const [mobileFabricOpen, setMobileFabricOpen] = useState(false);

  // Çeviriler
  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      login: { en: 'Sign In', tr: 'Giriş Yap', ru: 'Войти', pl: 'Zaloguj się' },
      myAccount: { en: 'My Account', tr: 'Hesabım', ru: 'Мой аккаунт', pl: 'Moje konto' },
      favorites: { en: 'Favorites', tr: 'Favorilerim', ru: 'Избранное', pl: 'Ulubione' },
      cart: { en: 'Cart', tr: 'Sepetim', ru: 'Корзина', pl: 'Koszyk' },
      myOrders: { en: 'My Orders', tr: 'Siparişlerim', ru: 'Мои заказы', pl: 'Moje zamówienia' },
      accountInfo: { en: 'Account Info', tr: 'Kullanıcı Bilgilerim', ru: 'Информация об аккаунте', pl: 'Informacje o koncie' },
      myReviews: { en: 'My Reviews', tr: 'Değerlendirmelerim', ru: 'Мои отзывы', pl: 'Moje recenzje' },
      signOut: { en: 'Sign Out', tr: 'Çıkış Yap', ru: 'Выйти', pl: 'Wyloguj się' },
      flatFabric: { en: 'Flat Fabric', tr: 'Düz Kumaş', ru: 'Гладкая ткань', pl: 'Gładka tkanina' },
      patternedFabric: { en: 'Patterned Fabric', tr: 'Desenli Kumaş', ru: 'Узорчатая ткань', pl: 'Wzorzysta tkanina' },
    };
    const lang = locale === 'tr' ? 'tr' : locale === 'ru' ? 'ru' : locale === 'pl' ? 'pl' : 'en';
    return translations[key]?.[lang] || key;
  };

  return (
    <header className={classes.HeaderPage}>
      <div className={classes.headerContainer}>
        {/* Logo - Left Side */}
        <div className={classes.logoSection}>
          <Link href={`/${locale}`} className={classes.logoLink}>
            <img
              src="/media/karvenLogo.webp"
              alt="Demfirat Karven Logo"
              className={classes.logo}
            />
          </Link>
          <span className={classes.slogan}>
            {locale === 'tr' ? 'Bütünsel Düşünün, Nakışlı Düşünün' :
              locale === 'ru' ? 'Мыслите целостно, Мыслите вышивкой' :
                locale === 'pl' ? 'Myśl całościowo, Myśl haftem' :
                  'Think Holistic, Think Embroidered'}
          </span>
        </div>

        {/* Middle Section - Navigation Menu (Desktop) */}
        <div className={classes.middleSection}>
          <nav className={classes.mainNav}>
            <Link href={`/${locale}`} className={classes.navLink}>
              {menuTArray[0]}
            </Link>
            <div
              className={classes.navDropdown}
              onMouseEnter={() => setFabricDropdownOpen(true)}
              onMouseLeave={() => setFabricDropdownOpen(false)}
            >
              <Link href={`/${locale}/product/fabric`} className={classes.navLink}>
                {menuTArray[1]}
                <FaChevronDown className={classes.navDropdownIcon} />
              </Link>
              {fabricDropdownOpen && (
                <div className={classes.navDropdownMenu}>
                  <Link href={`/${locale}/product/fabric?fabric_type=flat`} className={classes.dropdownItem}>
                    {t('flatFabric')}
                  </Link>
                  <Link href={`/${locale}/product/fabric?fabric_type=patterned`} className={classes.dropdownItem}>
                    {t('patternedFabric')}
                  </Link>
                </div>
              )}
            </div>
            <Link href={`/${locale}/product/ready-made_curtain`} className={classes.navLink}>
              {menuTArray[2]}
            </Link>
            <Link href={`/${locale}/about`} className={classes.navLink}>
              {menuTArray[3]}
            </Link>
            <Link href={`/${locale}/contact`} className={classes.navLink}>
              {menuTArray[4]}
            </Link>
          </nav>
        </div>

        {/* Right Side - Actions */}
        <div className={classes.actionsSection}>
          {/* Language Switcher */}
          <div className={classes.languageSection}>
            <LocaleSwitcher />
          </div>

          {/* User Authentication - Desktop */}
          <div className={classes.desktopActions}>
            {!session?.user ? (
              // Not logged in
              <>
                <Link href={`/${locale}/login`} className={classes.actionButton}>
                  <FaUser className={classes.actionIcon} />
                  <span className={classes.actionText}>{t('login')}</span>
                </Link>
                <Link href={`/${locale}/favorites`} className={classes.actionButton}>
                  <FaHeart className={classes.actionIcon} />
                  <span className={classes.actionText}>{t('favorites')}</span>
                </Link>
                <Link href={`/${locale}/cart`} className={classes.actionButton}>
                  <div className={classes.cartIconWrapper}>
                    <FaShoppingCart className={classes.actionIcon} />
                    {cartCount > 0 && (
                      <span className={classes.cartBadge}>{cartCount}</span>
                    )}
                  </div>
                  <span className={classes.actionText}>{t('cart')}</span>
                </Link>
              </>
            ) : (
              // Logged in
              <>
                {/* My Account - Dropdown */}
                <div
                  className={classes.accountDropdown}
                  onMouseEnter={() => setAccountDropdownOpen(true)}
                  onMouseLeave={() => setAccountDropdownOpen(false)}
                >
                  <button className={classes.actionButton}>
                    <FaUser className={classes.actionIcon} />
                    <span className={classes.actionText}>{t('myAccount')}</span>
                    <FaChevronDown className={classes.dropdownIcon} />
                  </button>

                  {accountDropdownOpen && (
                    <div className={classes.dropdownMenu}>
                      <Link href={`/${locale}/account/orders`} className={classes.dropdownItem}>
                        {t('myOrders')}
                      </Link>
                      <Link href={`/${locale}/account/profile`} className={classes.dropdownItem}>
                        {t('accountInfo')}
                      </Link>
                      <Link href={`/${locale}/account/reviews`} className={classes.dropdownItem}>
                        {t('myReviews')}
                      </Link>
                      <hr className={classes.dropdownDivider} />
                      <button
                        onClick={() => signOut()}
                        className={`${classes.dropdownItem} ${classes.signOutBtn}`}
                      >
                        <FaSignOutAlt className={classes.dropdownItemIcon} />
                        {t('signOut')}
                      </button>
                    </div>
                  )}
                </div>

                <Link href={`/${locale}/favorites`} className={classes.actionButton}>
                  <FaHeart className={classes.actionIcon} />
                  <span className={classes.actionText}>{t('favorites')}</span>
                </Link>
                <Link href={`/${locale}/cart`} className={classes.actionButton}>
                  <div className={classes.cartIconWrapper}>
                    <FaShoppingCart className={classes.actionIcon} />
                    {cartCount > 0 && (
                      <span className={classes.cartBadge}>{cartCount}</span>
                    )}
                  </div>
                  <span className={classes.actionText}>{t('cart')}</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className={classes.mobileActions}>
            {!session?.user ? (
              <Link href={`/${locale}/login`} className={classes.iconButton} title={t('login')}>
                <FaUser />
              </Link>
            ) : (
              <Link href={`/${locale}/account/profile`} className={classes.iconButton} title={t('myAccount')}>
                <FaUser />
              </Link>
            )}
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
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className={classes.mobileMenu}>
          <Link
            href={`/${locale}`}
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            {menuTArray[0]}
          </Link>
          <div className={classes.mobileNavDropdown}>
            <button
              className={classes.mobileNavLink}
              onClick={() => setMobileFabricOpen(!mobileFabricOpen)}
            >
              {menuTArray[1]}
              <FaChevronDown className={`${classes.mobileDropdownIcon} ${mobileFabricOpen ? classes.rotated : ''}`} />
            </button>
            {mobileFabricOpen && (
              <div className={classes.mobileSubMenu}>
                <Link
                  href={`/${locale}/product/fabric`}
                  className={classes.mobileSubLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {locale === 'tr' ? 'Tüm Kumaşlar' : locale === 'ru' ? 'Все ткани' : locale === 'pl' ? 'Wszystkie tkaniny' : 'All Fabrics'}
                </Link>
                <Link
                  href={`/${locale}/product/fabric?fabric_type=flat`}
                  className={classes.mobileSubLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('flatFabric')}
                </Link>
                <Link
                  href={`/${locale}/product/fabric?fabric_type=patterned`}
                  className={classes.mobileSubLink}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t('patternedFabric')}
                </Link>
              </div>
            )}
          </div>
          <Link
            href={`/${locale}/product/ready-made_curtain`}
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            {menuTArray[2]}
          </Link>
          <Link
            href={`/${locale}/about`}
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            {menuTArray[3]}
          </Link>
          <Link
            href={`/${locale}/contact`}
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            {menuTArray[4]}
          </Link>

          {session?.user && (
            <>
              <hr className={classes.mobileDivider} />
              <Link
                href={`/${locale}/account/orders`}
                className={classes.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('myOrders')}
              </Link>
              <Link
                href={`/${locale}/account/profile`}
                className={classes.mobileNavLink}
                onClick={() => setMobileMenuOpen(false)}
              >
                {t('accountInfo')}
              </Link>
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className={classes.mobileNavLink}
              >
                {t('signOut')}
              </button>
            </>
          )}
        </div>
      )}
    </header>
  );
}

export default Header;
