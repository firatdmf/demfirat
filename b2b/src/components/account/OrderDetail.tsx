'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrency } from '@/contexts/CurrencyContext';
import { getOrderDetail, type OrderDetail as OrderDetailType, type Order } from '@/lib/account';

function exportCsv(o: OrderDetailType) {
  const cur = o.original_currency || 'USD';
  const headers = [
    'SKU', 'Ürün', 'Varyant', 'Adet',
    `Birim Fiyat (${cur})`, `Tutar (${cur}, KDV hariç)`,
  ];
  const rows = o.items.map((it) => [
    it.product_sku ?? '',
    it.product_title ?? '',
    it.variant_sku ?? '',
    it.quantity ?? '',
    it.price ?? '',
    it.subtotal ?? '',
  ]);
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => {
      const s = String(cell);
      return s.includes(',') || s.includes('"') || s.includes('\n')
        ? `"${s.replace(/"/g, '""')}"` : s;
    }).join(','))
    .join('\n');

  const bom = '﻿';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${o.order_number || `order-${o.id}`}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function printOrder(rootId: string) {
  const node = document.getElementById(rootId);
  if (!node) return window.print();
  const w = window.open('', '_blank', 'width=900,height=1200');
  if (!w) return;
  const html = node.outerHTML;
  w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Order</title>
    <style>
      body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1F1A14; padding: 32px; }
      h1, h2, h3 { font-family: Georgia, serif; font-weight: 400; }
      .ord-detail-print { max-width: 800px; margin: 0 auto; }
      .ord-d-head { display: flex; justify-content: space-between; align-items: flex-end; padding-bottom: 16px; border-bottom: 1px solid #2E2A22; }
      .ord-d-head h2 { font-size: 32px; margin: 0; }
      .ord-d-num { font-family: monospace; font-size: 14px; color: #6E685D; letter-spacing: 0.04em; }
      .ord-d-meta { display: flex; flex-direction: column; gap: 6px; margin-top: 12px; }
      .ord-d-meta-row { display: flex; gap: 16px; align-items: baseline; font-size: 12px; }
      .ord-d-meta-key { font-size: 9px; letter-spacing: 0.24em; text-transform: uppercase; color: #6E685D; min-width: 120px; }
      .ord-d-meta-val { color: #1F1A14; }
      .ord-d-img { width: 48px; height: 48px; object-fit: cover; border: 1px solid #E6DFCD; display: block; }
      .ord-d-img.placeholder { background: #F2EDDD; }
      table { width: 100%; border-collapse: collapse; margin: 24px 0; }
      th { text-align: left; font-size: 10px; letter-spacing: 0.24em; text-transform: uppercase; color: #6E685D; border-bottom: 1px solid #2E2A22; padding: 10px 8px; }
      td { padding: 12px 8px; border-bottom: 1px solid #E6DFCD; font-size: 13px; vertical-align: top; }
      td.r { text-align: right; }
      .ord-d-totals { display: flex; justify-content: flex-end; gap: 64px; padding-top: 16px; border-top: 1px solid #2E2A22; }
      .ord-d-addrs { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; margin: 24px 0; }
      .ord-d-addr { padding: 16px; border: 1px solid #E6DFCD; }
      .ord-d-addr h4 { font-size: 11px; letter-spacing: 0.24em; text-transform: uppercase; color: #6E685D; margin: 0 0 12px; font-family: 'Helvetica Neue', Arial, sans-serif; }
      .pill { display: inline-block; padding: 4px 12px; border: 1px solid #B89968; color: #B89968; font-size: 11px; letter-spacing: 0.18em; text-transform: uppercase; }
      .vat { font-size: 9px; letter-spacing: 0.24em; color: #6E685D; }
      @media print {
        body { padding: 0; }
      }
    </style></head><body>${html}<scr` + `ipt>window.onload=()=>{window.print();window.onafterprint=()=>window.close();}</scr` + `ipt></body></html>`);
  w.document.close();
}

export default function OrderDetail({ order, statusLabel, tone, onClose }: {
  order: Order;
  statusLabel: string;
  tone: string;
  onClose: () => void;
}) {
  const t = useTranslations('account');
  const { user } = useAuth();
  const { convertPrice } = useCurrency();
  const [detail, setDetail] = useState<OrderDetailType | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getOrderDetail(user.id, order.id).then(setDetail).catch((e: Error) => setErr(e.message));
  }, [user, order.id]);

  if (err) return <div className="bel-meta" style={{ padding: 20 }}>{err}</div>;
  if (!detail) return <div className="bel-meta" style={{ padding: 20 }}>…</div>;

  const printRootId = `ord-print-${order.id}`;
  const date = new Date(detail.created_at).toLocaleDateString();
  const number = detail.order_number || `#${detail.id}`;
  // All product prices on this catalogue are stored as USD on the
  // backend, so amounts coming back from the order endpoint are always
  // USD numbers regardless of the `original_currency` tag. Convert to
  // the buyer's selected display currency here.
  const fmt = (raw: string | null) => {
    if (!raw) return '—';
    const n = Number(raw);
    if (isNaN(n)) return raw;
    return convertPrice(n);
  };
  const totalNum = Number(detail.total_value || detail.original_price || 0);
  const totalFormatted = convertPrice(totalNum);

  return (
    <div className="ord-detail">
      {/* Print-ready view (also rendered visibly for the user) */}
      <div id={printRootId} className="ord-detail-print">
        <div className="ord-d-head">
          <div>
            <h2>{t('orderItemsHeader')}</h2>
            <div className="ord-d-meta">
              <div className="ord-d-meta-row">
                <span className="ord-d-meta-key">{t('orderNumberLabel')}</span>
                <span className="ord-d-meta-val bel-mono">{number}</span>
              </div>
              <div className="ord-d-meta-row">
                <span className="ord-d-meta-key">{t('orderDateLabel')}</span>
                <span className="ord-d-meta-val">{date}</span>
              </div>
            </div>
          </div>
          <span className="pill" style={{ borderColor: tone, color: tone }}>{statusLabel}</span>
        </div>

        <div className="ord-d-addrs">
          <div className="ord-d-addr">
            <h4>{t('deliveryHeader')}</h4>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, marginBottom: 6 }}>
              {detail.delivery_address_title || '—'}
            </div>
            <div style={{ fontSize: 13, color: '#3A3528', lineHeight: 1.6 }}>
              {detail.delivery_address || '—'}<br />
              {detail.delivery_city} {detail.delivery_country && `· ${detail.delivery_country}`}
              {detail.delivery_phone && <><br />{detail.delivery_phone}</>}
            </div>
          </div>
          <div className="ord-d-addr">
            <h4>{t('billingHeader')}</h4>
            <div style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 16, marginBottom: 6 }}>
              {detail.billing_address_title || detail.delivery_address_title || '—'}
            </div>
            <div style={{ fontSize: 13, color: '#3A3528', lineHeight: 1.6 }}>
              {detail.billing_address || detail.delivery_address || '—'}<br />
              {detail.billing_city || detail.delivery_city} {(detail.billing_country || detail.delivery_country) && `· ${detail.billing_country || detail.delivery_country}`}
              {(detail.billing_phone || detail.delivery_phone) && <><br />{detail.billing_phone || detail.delivery_phone}</>}
            </div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style={{ width: 64 }}>{t('image')}</th>
              <th>{t('product')}</th>
              <th>{t('variant')}</th>
              <th className="r">{t('qtyShort')}</th>
              <th className="r">{t('unitPrice')}</th>
              <th className="r">{t('lineTotal')} <span className="vat">({t('vatExclShort')})</span></th>
            </tr>
          </thead>
          <tbody>
            {detail.items.map((it) => (
              <tr key={it.id}>
                <td>
                  {it.product_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={it.product_image}
                      alt={it.product_title || ''}
                      className="ord-d-img"
                    />
                  ) : (
                    <span className="ord-d-img placeholder" />
                  )}
                </td>
                <td>
                  <div style={{ fontWeight: 500 }}>{it.product_title || '—'}</div>
                  {it.product_sku && <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#6E685D', marginTop: 2 }}>{it.product_sku}</div>}
                </td>
                <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{it.variant_sku || '—'}</td>
                <td className="r">{it.quantity || '—'}</td>
                <td className="r">{fmt(it.price)}</td>
                <td className="r">{fmt(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="ord-d-totals">
          <div>
            <div style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#6E685D' }}>
              {t('totalLabel')} ({t('vatExclShort')})
            </div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 28, marginTop: 4 }}>
              {totalFormatted}
            </div>
          </div>
        </div>

        {detail.tracking_number && (
          <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #E6DFCD', fontSize: 13 }}>
            <strong style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#6E685D' }}>{t('orderTrack')}</strong>{' '}
            <span style={{ fontFamily: 'monospace', marginLeft: 12 }}>
              {detail.carrier ? `${detail.carrier} · ` : ''}{detail.tracking_number}
            </span>
          </div>
        )}
      </div>

      {/* Action bar (excluded from print frame) */}
      <div className="ord-detail-actions">
        <button type="button" className="bel-btn-ghost" onClick={onClose}>
          {t('hideItems')}
        </button>
        <div className="ord-detail-actions-r">
          <button type="button" className="bel-btn-ghost" onClick={() => exportCsv(detail)}>
            ↓ {t('actionExcel')}
          </button>
          <button type="button" className="bel-btn-ghost" onClick={() => printOrder(printRootId)}>
            ⎙ {t('actionPdf')} / {t('actionPrint')}
          </button>
        </div>
      </div>
    </div>
  );
}
