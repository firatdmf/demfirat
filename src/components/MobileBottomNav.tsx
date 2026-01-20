'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { FaHome, FaTh, FaShoppingCart, FaBox, FaHeart, FaUser, FaTimes } from 'react-icons/fa';
import { useCart } from '@/contexts/CartContext';
import styles from './MobileBottomNav.module.css';

const MobileBottomNav = () => {
    const pathname = usePathname();
    const locale = useLocale();
    const t = useTranslations('MobileNav');
    const { cartCount, guestCart } = useCart();
    const [showProductsMenu, setShowProductsMenu] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Ensure client-side only rendering of dynamic values
    useEffect(() => {
        setMounted(true);
    }, []);

    // Calculate total cart count (authenticated + guest)
    const totalCartCount = mounted ? cartCount + guestCart.length : 0;

    const isActive = (path: string) => {
        const currentPath = pathname.replace(`/${locale}`, '') || '/';
        return currentPath === path || currentPath.startsWith(path + '/');
    };

    const navItems = [
        {
            key: 'home',
            href: `/${locale}`,
            icon: FaHome,
            label: t('Home'),
            isActiveCheck: () => pathname === `/${locale}` || pathname === `/${locale}/`,
        },
        {
            key: 'products',
            href: '#',
            icon: FaTh,
            label: t('Products'),
            isActiveCheck: () => isActive('/product'),
            hasSubmenu: true,
        },
        {
            key: 'cart',
            href: `/${locale}/cart`,
            icon: FaShoppingCart,
            label: t('Cart'),
            isActiveCheck: () => isActive('/cart') || isActive('/checkout'),
            badge: totalCartCount > 0 ? totalCartCount : undefined,
        },
        {
            key: 'tracking',
            href: `/${locale}/order-tracking`,
            icon: FaBox,
            label: t('Tracking'),
            isActiveCheck: () => isActive('/order-tracking'),
        },
        {
            key: 'favorites',
            href: `/${locale}/favorites`,
            icon: FaHeart,
            label: t('Favorites'),
            isActiveCheck: () => isActive('/favorites'),
        },
        {
            key: 'account',
            href: `/${locale}/account/profile`,
            icon: FaUser,
            label: t('Account'),
            isActiveCheck: () => isActive('/account') || isActive('/login'),
        },
    ];

    const productSubmenuItems = [
        { href: `/${locale}/product/fabric`, label: t('Fabrics') },
        { href: `/${locale}/product/ready-made_curtain`, label: t('ReadyCurtains') },
        { href: `/${locale}/product/fabric`, label: t('CustomCurtains') },
    ];

    const handleProductsClick = (e: React.MouseEvent) => {
        e.preventDefault();
        setShowProductsMenu(!showProductsMenu);
    };

    const closeSubmenu = () => {
        setShowProductsMenu(false);
    };

    return (
        <>
            {/* Products Submenu Overlay */}
            {showProductsMenu && (
                <div className={styles.submenuOverlay} onClick={closeSubmenu}>
                    <div className={styles.submenuContainer} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.submenuHeader}>
                            <span>{t('Products')}</span>
                            <button onClick={closeSubmenu} className={styles.closeButton}>
                                <FaTimes />
                            </button>
                        </div>
                        <div className={styles.submenuItems}>
                            {productSubmenuItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={styles.submenuItem}
                                    onClick={closeSubmenu}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Navigation */}
            <nav className={styles.mobileNav}>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = item.isActiveCheck();

                    if (item.hasSubmenu) {
                        return (
                            <button
                                key={item.key}
                                className={`${styles.navItem} ${active || showProductsMenu ? styles.active : ''}`}
                                onClick={handleProductsClick}
                            >
                                <div className={styles.iconWrapper}>
                                    <Icon className={styles.icon} />
                                </div>
                                <span className={styles.label}>{item.label}</span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`${styles.navItem} ${active ? styles.active : ''}`}
                        >
                            <div className={styles.iconWrapper}>
                                <Icon className={styles.icon} />
                                {item.badge && item.badge > 0 && (
                                    <span className={styles.badge}>
                                        {item.badge > 99 ? '99+' : item.badge}
                                    </span>
                                )}
                            </div>
                            <span className={styles.label}>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
};

export default MobileBottomNav;
