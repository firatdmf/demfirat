"use client";
import React from "react";
import classes from "@/components/Header.module.css";
import Link from "next/link";
import { FaSignOutAlt, FaUser } from "react-icons/fa";
import { signIn, signOut } from "next-auth/react";
import LocaleSwitcher from "./LocaleSwitcher";
import { useSession } from "next-auth/react";
import { useLocale } from "next-intl";

interface HeaderProps {
  menuTArray: string[];
}

function Header({ menuTArray }: HeaderProps) {
  const { data: session } = useSession();
  const locale = useLocale();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

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
             locale === 'de' ? 'Ganzheitlich denken, Bestickt denken' :
             'Think Holistic, Think Embroidered'}
          </span>
        </div>

        {/* Middle Section - Navigation Menu (Desktop) */}
        <div className={classes.middleSection}>
          <nav className={classes.mainNav}>
            <Link href={`/${locale}`} className={classes.navLink}>
              {menuTArray[0]}
            </Link>
            <Link href={`/${locale}/product/fabric`} className={classes.navLink}>
              Fabrics
            </Link>
            <Link href={`/${locale}/product/ready-made_curtain`} className={classes.navLink}>
              Curtains
            </Link>
            <Link href={`/${locale}/about`} className={classes.navLink}>
              {menuTArray[2]}
            </Link>
            <Link href={`/${locale}/contact`} className={classes.navLink}>
              {menuTArray[3]}
            </Link>
          </nav>
        </div>

        {/* Right Side - Actions */}
        <div className={classes.actionsSection}>
          {/* Language Switcher */}
          <div className={classes.languageSection}>
            <LocaleSwitcher />
          </div>

          {/* User Authentication */}
          {!session?.user?.name ? (
            <Link
              href={`/${locale}/login`}
              className={classes.iconButton}
              title="Log In"
            >
              <FaUser />
            </Link>
          ) : (
            <div className={classes.userSection}>
              <span className={classes.userName}>{session?.user?.name}</span>
              <button
                onClick={() => signOut()}
                className={classes.iconButton}
                title="Sign Out"
              >
                <FaSignOutAlt />
              </button>
            </div>
          )}

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
          <Link 
            href={`/${locale}/product/fabric`} 
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Fabrics
          </Link>
          <Link 
            href={`/${locale}/product/ready-made_curtain`} 
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            Curtains
          </Link>
          <Link 
            href={`/${locale}/about`} 
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            {menuTArray[2]}
          </Link>
          <Link 
            href={`/${locale}/contact`} 
            className={classes.mobileNavLink}
            onClick={() => setMobileMenuOpen(false)}
          >
            {menuTArray[3]}
          </Link>
        </div>
      )}
    </header>
  );
}

export default Header;
