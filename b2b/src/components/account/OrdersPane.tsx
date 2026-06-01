'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { type Order } from '@/lib/account';
import { accountCache } from '@/lib/account-cache';
import OrderDetail from './OrderDetail';

function formatOrderTotal(o: Order, convertPrice: (n: number) => string) {
  const price = Number(o.original_price);
  if (!o.original_price || isNaN(price)) return null;
  // Product prices in this catalogue are *always* stored as USD on the
  // backend. The order's `original_currency` column was tagged incorrectly
  // in early test orders, so we ignore it and always treat the stored
  // amount as a USD base price → convert to the currently selected
  // display currency.
  return convertPrice(price);
}

type StatusKey =
  | 'pending' | 'confirmed' | 'preparing' | 'shipped'
  | 'in_transit' | 'out_for_delivery' | 'delivered' | 'cancelled' | 'returned';

function statusKey(o: Order): StatusKey {
  const raw = (o.order_status || o.status || 'pending').toLowerCase().trim();
  const known: StatusKey[] = [
    'pending', 'confirmed', 'preparing', 'shipped',
    'in_transit', 'out_for_delivery', 'delivered', 'cancelled', 'returned',
  ];
  if (known.includes(raw as StatusKey)) return raw as StatusKey;
  if (raw === 'completed') return 'delivered';
  return 'pending';
}

const TONE: Record<StatusKey, string> = {
  pending: '#B89968',
  confirmed: '#2F7D5F',
  preparing: '#6E685D',
  shipped: '#B07A1A',
  in_transit: '#B07A1A',
  out_for_delivery: '#B07A1A',
  delivered: '#2F7D5F',
  cancelled: '#A24B3D',
  returned: '#A24B3D',
};

const STATUS_T_KEY: Record<StatusKey,
  'statusPending' | 'statusConfirmed' | 'statusPreparing' | 'statusShipped'
  | 'statusInTransit' | 'statusOutForDelivery' | 'statusDelivered'
  | 'statusCancelled' | 'statusReturned'> = {
  pending: 'statusPending',
  confirmed: 'statusConfirmed',
  preparing: 'statusPreparing',
  shipped: 'statusShipped',
  in_transit: 'statusInTransit',
  out_for_delivery: 'statusOutForDelivery',
  delivered: 'statusDelivered',
  cancelled: 'statusCancelled',
  returned: 'statusReturned',
};

export default function OrdersPane() {
  const t = useTranslations('account');
  const { user } = useAuth();
  const { convertPrice } = useCurrency();
  const [orders, setOrders] = useState<Order[] | null>(() =>
    user ? accountCache.orders(user.id).cached : null,
  );
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    const { cached, fresh } = accountCache.orders(user.id);
    if (cached) setOrders(cached);
    fresh.then(setOrders).catch(() => {});
  }, [user]);

  if (orders === null) return <div className="bel-meta">…</div>;

  return (
    <div>
      <div className="pane-head">
        <span className="pane-num">03</span>
        <h2 className="pane-title">{t('orders')}</h2>
        <p className="pane-sub">{t('ordersPaneSub')}</p>
      </div>

      {orders.length === 0 ? (
        <div className="bel-meta" style={{ padding: '40px 0' }}>{t('noOrders')}</div>
      ) : (
        <div className="ord-list">
          {orders.map((o) => {
            const sk = statusKey(o);
            const tone = TONE[sk];
            const date = new Date(o.created_at).toLocaleDateString();
            const statusLabel = t(STATUS_T_KEY[sk]);
            const number = o.order_number || `#${o.id}`;
            const isExpanded = expandedId === o.id;

            return (
              <article key={o.id} className={`ord-card ${isExpanded ? 'expanded' : ''}`}>
                <header className="ord-card-head">
                  <div className="ord-card-l">
                    <span className="bel-mono ord-num">{number}</span>
                    <span className="ord-date">{date} · {o.items_count} {t('orderItems')}</span>
                  </div>
                  <div className="ord-card-r">
                    {(() => {
                      const formatted = formatOrderTotal(o, convertPrice);
                      return formatted ? (
                        <div className="ord-amount">
                          {formatted}
                          <span className="ord-amount-tax">{t('vatExclShort').toUpperCase()}</span>
                        </div>
                      ) : null;
                    })()}
                    <span className="ord-pill" style={{ borderColor: tone, color: tone }}>
                      <span className="dot" style={{ background: tone }} />
                      {statusLabel}
                    </span>
                  </div>
                </header>

                {!isExpanded ? (
                  <button
                    type="button"
                    className="ord-expand-btn"
                    onClick={() => setExpandedId(o.id)}
                  >
                    {t('viewItems')} →
                  </button>
                ) : (
                  <OrderDetail
                    order={o}
                    statusLabel={statusLabel}
                    tone={tone}
                    onClose={() => setExpandedId(null)}
                  />
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
