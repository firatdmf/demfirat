// Single source of truth for navigation menu items.
// Used by Header (desktop + hamburger), MobileBottomNav, etc.

export type NavLink = { href: string; label: string };
export type NavSection = {
    title: string;
    href: string;
    image?: string;
    links: NavLink[];
};

export function getCurtainSections(locale: string): NavSection[] {
    return [
        {
            title: locale === 'tr' ? 'Tül Perdeler' : 'Tulle Curtains',
            href: `/${locale}/product/fabric?intent=custom_curtain`,
            image: '/media/header_pictures/curtain_solid.avif',
            links: [
                { href: `/${locale}/product/fabric?intent=custom_curtain`, label: locale === 'tr' ? 'Tüm Tül Perdeler' : 'All Tulle Curtains' },
                { href: `/${locale}/product/fabric?intent=custom_curtain&fabric_type=embroidery`, label: locale === 'tr' ? 'Nakışlı Tül Perde' : 'Embroidered Tulle Curtains' },
                { href: `/${locale}/product/fabric?intent=custom_curtain&fabric_type=solid`, label: locale === 'tr' ? 'Düz Tül Perdeler' : 'Solid Tulle Curtains' },
            ],
        },
        {
            title: locale === 'tr' ? 'Fon Perdeler' : 'Blackout Curtains',
            href: `/${locale}/product/fabric?intent=custom_curtain&fabric_type=blackout`,
            image: '/media/header_pictures/curtain_blackout.avif',
            links: [
                { href: `/${locale}/product/fabric?intent=custom_curtain&fabric_type=blackout`, label: locale === 'tr' ? 'Tüm Fon Perdeler' : 'All Blackout Curtains' },
            ],
        },
        {
            title: locale === 'tr' ? 'Rustik Perdeler' : 'Rustic Curtains',
            href: `/${locale}/product/ready-made_curtain`,
            image: 'https://demfiratkarven.b-cdn.net/media/product_images/product_RK72010/rk72010gw-08-white-sheer-floral-dandelion-embroidered-curtain-grommet-header-installation-top.avif',
            links: [
                { href: `/${locale}/product/ready-made_curtain`, label: locale === 'tr' ? 'Tüm Rustik Perdeler' : 'All Rustic Curtains' },
            ],
        },
    ];
}

export type TopNavItem = { href: string; label: string };

export function getTopNavItems(locale: string): TopNavItem[] {
    return [
        { href: `/${locale}/product/bed`, label: locale === 'tr' ? 'Yatak Odası' : 'Bedroom' },
    ];
}
