'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { useCart } from '@/contexts/CartContext';
import Icon from './Icon';
import { useCurrency } from '@/contexts/CurrencyContext';

export default function CartDrawer() {
  const locale = useLocale() as 'tr' | 'en';
  const tCart = useTranslations('cart');
  const tCommon = useTranslations('common');
  const cart = useCart();
  const { convertPrice } = useCurrency();

  if (!cart.isOpen) return null;

  return (
    <>
      <div className="bel-scrim" onClick={cart.close} />
      <aside className="bel-drawer right">
        <div className="drawer-head">
          <span className="bel-eyebrow">
            {tCart('title')} · {cart.items.length}
          </span>
          <button className="drawer-close" onClick={cart.close} aria-label="Close">
            <Icon name="close" size={18} />
          </button>
        </div>
        <div className="drawer-body cart-body">
          {cart.items.length === 0 ? (
            <div className="cart-empty">
              <div className="bel-h3" style={{ marginBottom: 8 }}>
                {tCart('empty')}
              </div>
              <p>{tCart('emptyDesc')}</p>
            </div>
          ) : (
            cart.items.map((it) => (
              <div key={it.id} className="cart-item">
                <div className="cart-img" style={{ background: it.bg }} />
                <div className="cart-info">
                  <div className="bel-eyebrow">{it.category[locale]}</div>
                  <div className="cart-name">{it.name[locale]}</div>
                  <div className="cart-meta">
                    {it.variant[locale]} · {it.size}
                  </div>
                  <div className="cart-row">
                    <div className="qty">
                      <button onClick={() => cart.setQty(it.id, -1)} aria-label="-">
                        <Icon name="minus" size={12} />
                      </button>
                      <span>{it.qty}</span>
                      <button onClick={() => cart.setQty(it.id, 1)} aria-label="+">
                        <Icon name="plus" size={12} />
                      </button>
                    </div>
                    <span className="cart-price">{convertPrice(it.price * it.qty)}</span>
                  </div>
                  <button className="cart-remove" onClick={() => cart.remove(it.id)}>
                    {tCommon('remove')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        {cart.items.length > 0 && (
          <div className="drawer-foot cart-foot">
            <div className="cart-line">
              <span>{tCommon('subtotal')}</span>
              <span>{convertPrice(cart.subtotal)}</span>
            </div>
            <div className="cart-line muted">
              <span>{tCommon('vatNote')}</span>
            </div>
            <Link
              href={`${locale === 'tr' ? '' : `/${locale}`}/checkout`}
              className="bel-btn-primary lg block"
              onClick={cart.close}
              style={{ textAlign: 'center' }}
            >
              {tCommon('completeOrder')} →
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
