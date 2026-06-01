'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { addAddress, createOrder, getAddresses, type Address } from '@/lib/account';
import { accountCache } from '@/lib/account-cache';

export default function CheckoutClient({ locale }: { locale: 'tr' | 'en' }) {
  const t = useTranslations('account');
  const tCommon = useTranslations('common');
  const { user } = useAuth();
  const { items, subtotal, clear: clearCart } = useCart();
  const { convertPrice, currency, rateOf } = useCurrency();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [deliveryId, setDeliveryId] = useState<string | null>(null);
  const [billingId, setBillingId] = useState<string | null>(null);
  const [billingSame, setBillingSame] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [showAddForm, setShowAddForm] = useState(false);
  const [aTitle, setATitle] = useState('');
  const [aLine, setALine] = useState('');
  const [aCity, setACity] = useState('');
  const [aCountry, setACountry] = useState('Türkiye');
  const [aBusy, setABusy] = useState(false);

  const localePrefix = locale === 'tr' ? '' : `/${locale}`;

  useEffect(() => {
    if (!user) return;
    getAddresses(user.id).then((list) => {
      setAddresses(list);
      accountCache.setAddresses(user.id, list);
      const def = list.find((a) => a.isDefault) ?? list[0];
      if (def) {
        setDeliveryId(def.id);
        setBillingId(def.id);
      } else {
        setShowAddForm(true);
      }
    });
  }, [user]);

  const onAddAddress = async () => {
    if (!user) return;
    if (!aTitle || !aLine || !aCity || !aCountry) return;
    setABusy(true);
    try {
      await addAddress(user.id, { title: aTitle, address: aLine, city: aCity, country: aCountry });
      accountCache.invalidateAddresses(user.id);
      const fresh = await getAddresses(user.id);
      accountCache.setAddresses(user.id, fresh);
      setAddresses(fresh);
      const last = fresh[fresh.length - 1];
      if (last) {
        setDeliveryId(last.id);
        if (billingSame) setBillingId(last.id);
      }
      setATitle(''); setALine(''); setACity(''); setACountry('Türkiye');
      setShowAddForm(false);
    } finally { setABusy(false); }
  };

  const onPlace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy || !user) return;
    if (!deliveryId) return;
    if (!billingSame && !billingId) return;
    if (items.length === 0) return;

    const delivery = addresses.find((a) => a.id === deliveryId);
    const billing = billingSame ? delivery : addresses.find((a) => a.id === billingId);
    if (!delivery) return;

    setBusy(true);
    setErrorMsg(null);
    try {
      // Product prices are stored as USD; subtotal is USD too. Save the
      // base value as USD and the converted-at-checkout amount in the
      // currency the buyer was actually using.
      const rate = currency === 'USD' ? 1 : rateOf(currency);
      const paidAmount = +(subtotal * rate).toFixed(2);
      const result = await createOrder({
        web_client_id: user.id,
        status: 'pending',
        order_status: 'pending',
        original_currency: 'USD',
        original_price: +subtotal.toFixed(2),
        paid_currency: currency,
        paid_amount: paidAmount,
        exchange_rate: +rate.toFixed(4),
        delivery_address_title: delivery.title,
        delivery_address: delivery.address,
        delivery_city: delivery.city,
        delivery_country: delivery.country,
        billing_address_title: billing?.title,
        billing_address: billing?.address,
        billing_city: billing?.city,
        billing_country: billing?.country,
        items: items.map((it) => ({
          product_sku: it.productSku,
          product_variant_sku: it.variantSku || undefined,
          quantity: it.qty,
          price: it.price,
          description: `${it.variant[locale]} · ${it.size}`,
        })),
      });
      setOrderNumber(result.order_number);
      accountCache.invalidateOrders(user.id);
      await clearCart();
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'order_failed';
      setErrorMsg(msg);
    } finally {
      setBusy(false);
    }
  };

  const canPlace = items.length > 0 && !!deliveryId && (billingSame || !!billingId);
  const itemCount = useMemo(() => items.reduce((s, i) => s + i.qty, 0), [items]);

  if (submitted) {
    return (
      <section className="prof-section">
        <div className="bel-container" style={{ maxWidth: 640, textAlign: 'center', padding: '80px 32px' }}>
          <div className="bel-eyebrow">{t('orders')}</div>
          <h1 className="bel-h2" style={{ marginTop: 16 }}>{t('orderSuccess')}</h1>
          {orderNumber && (
            <div className="check-success-num">
              <span>{t('orderNumber')}</span>
              <span className="bel-mono">#{orderNumber}</span>
            </div>
          )}
          <p className="bel-lede" style={{ marginTop: 16 }}>{t('orderSuccessSub')}</p>
          <div style={{ marginTop: 32, display: 'inline-flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href={`${localePrefix}/account/orders`} className="bel-btn-primary lg" style={{ textDecoration: 'none' }}>
              {t('orders')} →
            </Link>
            <Link href={`${localePrefix}/products`} className="bel-btn-ghost lg" style={{ textDecoration: 'none' }}>
              {t('backToShopping')}
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="prof-section">
      <div className="bel-container">
        <div className="check-head">
          <div>
            <h1 className="pane-title" style={{ margin: 0 }}>{t('checkoutTitle')}</h1>
            <p className="pane-sub" style={{ marginTop: 12 }}>{t('checkoutSub')}</p>
          </div>
          <div className="check-steps">
            <span className="check-step done"><i>01</i>{t('stepReview')}</span>
            <span className="check-step on"><i>02</i>{t('stepAddress')}</span>
            <span className="check-step"><i>03</i>{t('stepConfirm')}</span>
          </div>
        </div>

        <form className="check-grid" onSubmit={onPlace}>
          <div className="check-main">
            {/* DELIVERY ADDRESS */}
            <section className="check-card">
              <header className="check-card-head">
                <span className="pane-num" style={{ position: 'static', fontSize: 56, opacity: 0.18 }}>01</span>
                <div>
                  <span className="bel-eyebrow">{t('deliveryAddress')}</span>
                  <h3 className="check-card-title">{t('deliveryAddress')}</h3>
                </div>
              </header>

              {addresses.length === 0 ? (
                <div className="check-empty">
                  <p className="bel-meta">{t('addAddressFirst')}</p>
                </div>
              ) : (
                <div className="check-addrs">
                  {addresses.map((a) => (
                    <label key={a.id} className={`check-addr ${deliveryId === a.id ? 'on' : ''}`}>
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryId === a.id}
                        onChange={() => {
                          setDeliveryId(a.id);
                          if (billingSame) setBillingId(a.id);
                        }}
                      />
                      <div className="check-addr-body">
                        <div className="check-addr-row">
                          <span className="check-addr-title">{a.title}</span>
                          {a.isDefault && <span className="addr-default">{t('default')}</span>}
                        </div>
                        <div className="check-addr-line">{a.address}</div>
                        <div className="check-addr-meta">{a.city} · {a.country}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              {!showAddForm ? (
                <button type="button" className="check-add-btn" onClick={() => setShowAddForm(true)}>
                  <span>+</span> {t('addInline')}
                </button>
              ) : (
                <div className="check-add-form">
                  <div className="check-add-grid">
                    <Field label={t('addressTitle')}>
                      <input className="pane-input" value={aTitle} onChange={(e) => setATitle(e.target.value)}
                             placeholder={t('addressTitlePh')} autoFocus />
                    </Field>
                    <Field label={t('city')}>
                      <input className="pane-input" value={aCity} onChange={(e) => setACity(e.target.value)} />
                    </Field>
                    <Field label={t('addressLine')} full>
                      <input className="pane-input" value={aLine} onChange={(e) => setALine(e.target.value)}
                             placeholder={t('addressLinePh')} />
                    </Field>
                    <Field label={t('country')}>
                      <input className="pane-input" value={aCountry} onChange={(e) => setACountry(e.target.value)} />
                    </Field>
                  </div>
                  <div className="check-add-actions">
                    <button type="button" className="bel-btn-primary" onClick={onAddAddress} disabled={aBusy}>
                      {aBusy ? '…' : t('save')}
                    </button>
                    {addresses.length > 0 && (
                      <button type="button" className="bel-btn-ghost" onClick={() => setShowAddForm(false)} disabled={aBusy}>
                        {t('cancel')}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </section>

            {/* BILLING ADDRESS */}
            <section className="check-card">
              <header className="check-card-head">
                <span className="pane-num" style={{ position: 'static', fontSize: 56, opacity: 0.18 }}>02</span>
                <div>
                  <span className="bel-eyebrow">{t('billingAddress')}</span>
                  <h3 className="check-card-title">{t('billingAddress')}</h3>
                </div>
              </header>

              <label className="check-switch">
                <input
                  type="checkbox"
                  checked={billingSame}
                  onChange={(e) => {
                    setBillingSame(e.target.checked);
                    if (e.target.checked) setBillingId(deliveryId);
                    else setBillingId(null);
                  }}
                />
                <span>{t('billingSame')}</span>
              </label>

              {!billingSame && (
                addresses.length === 0 ? (
                  <p className="bel-meta" style={{ marginTop: 16 }}>{t('addAddressFirst')}</p>
                ) : (
                  <div className="check-addrs" style={{ marginTop: 16 }}>
                    {addresses.map((a) => (
                      <label key={a.id} className={`check-addr ${billingId === a.id ? 'on' : ''}`}>
                        <input
                          type="radio"
                          name="billing"
                          checked={billingId === a.id}
                          onChange={() => setBillingId(a.id)}
                        />
                        <div className="check-addr-body">
                          <div className="check-addr-row">
                            <span className="check-addr-title">{a.title}</span>
                          </div>
                          <div className="check-addr-line">{a.address}</div>
                          <div className="check-addr-meta">{a.city} · {a.country}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                )
              )}
            </section>
          </div>

          {/* SUMMARY */}
          <aside className="check-side">
            <div className="check-card sticky">
              <header className="check-card-head">
                <span className="pane-num" style={{ position: 'static', fontSize: 56, opacity: 0.18 }}>03</span>
                <div>
                  <span className="bel-eyebrow">{t('summary')}</span>
                  <h3 className="check-card-title">{t('summary')}</h3>
                </div>
              </header>

              {items.length === 0 ? (
                <p className="bel-meta">{t('subtotalExcl')}: —</p>
              ) : (
                <>
                  <div className="check-items">
                    {items.map((it) => (
                      <div key={it.id} className="check-item">
                        <span className="check-item-img" style={{ background: it.bg }} />
                        <div className="check-item-body">
                          <div className="check-item-name">{it.name[locale]}</div>
                          <div className="bel-meta">{it.variant[locale]} · {it.size} · ×{it.qty}</div>
                        </div>
                        <div className="check-item-price">
                          {convertPrice(it.price * it.qty)}
                          <span className="check-item-tax">{tCommon('vatExcluded')}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="check-line">
                    <span>{t('subtotalExcl')}</span>
                    <span>{convertPrice(subtotal)}</span>
                  </div>
                  <div className="check-line muted">
                    <span>{itemCount} {t('orderItems')}</span>
                    <span>{tCommon('vatNote')}</span>
                  </div>

                  <button
                    type="submit"
                    className="bel-btn-primary lg block"
                    style={{ marginTop: 24 }}
                    disabled={busy || !canPlace}
                  >
                    {busy ? '…' : t('placeOrder')} →
                  </button>
                  {!canPlace && (
                    <p className="bel-meta" style={{ marginTop: 12, textAlign: 'center' }}>
                      {t('addAddressFirst')}
                    </p>
                  )}
                  {errorMsg && (
                    <p className="check-error">{errorMsg}</p>
                  )}
                </>
              )}
            </div>
          </aside>
        </form>
      </div>
    </section>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <label className={`pane-field ${full ? 'full' : ''}`}>
      <span className="pane-key">{label}</span>
      {children}
    </label>
  );
}
