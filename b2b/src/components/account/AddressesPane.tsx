'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import {
  addAddress, deleteAddress, getAddresses, setDefaultAddress, type Address,
} from '@/lib/account';
import { accountCache } from '@/lib/account-cache';

export default function AddressesPane() {
  const t = useTranslations('account');
  const { user } = useAuth();

  const [addresses, setAddresses] = useState<Address[] | null>(() =>
    user ? accountCache.addresses(user.id).cached : null,
  );
  const [adding, setAdding] = useState(false);

  const [title, setTitle] = useState('');
  const [line, setLine] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('Türkiye');
  const [busy, setBusy] = useState(false);

  const reload = async () => {
    if (!user) return;
    accountCache.invalidateAddresses(user.id);
    const fresh = await getAddresses(user.id);
    accountCache.setAddresses(user.id, fresh);
    setAddresses(fresh);
  };

  useEffect(() => {
    if (!user) return;
    const { cached, fresh } = accountCache.addresses(user.id);
    if (cached) setAddresses(cached);
    fresh.then((a) => {
      accountCache.setAddresses(user.id, a);
      setAddresses(a);
    }).catch(() => {});
  }, [user]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    try {
      await addAddress(user.id, { title, address: line, city, country });
      setTitle(''); setLine(''); setCity(''); setCountry('Türkiye');
      setAdding(false);
      await reload();
    } finally { setBusy(false); }
  };

  if (addresses === null) return <div className="bel-meta">…</div>;

  return (
    <div>
      <div className="pane-head">
        <span className="pane-num">02</span>
        <h2 className="pane-title">{t('addresses')}</h2>
        <p className="pane-sub">{t('addressesPaneSub')}</p>
      </div>

      {adding && (
        <form onSubmit={onAdd} style={{ marginBottom: 32 }}>
          <div className="pane-fields">
            <Field label={t('addressTitle')}>
              <input className="pane-input" value={title} onChange={(e) => setTitle(e.target.value)}
                     placeholder={t('addressTitlePh')} required autoFocus />
            </Field>
            <Field label={t('city')}>
              <input className="pane-input" value={city} onChange={(e) => setCity(e.target.value)} required />
            </Field>
            <Field label={t('addressLine')}>
              <input className="pane-input" value={line} onChange={(e) => setLine(e.target.value)}
                     placeholder={t('addressLinePh')} required />
            </Field>
            <Field label={t('country')}>
              <input className="pane-input" value={country} onChange={(e) => setCountry(e.target.value)} required />
            </Field>
          </div>
          <div className="pane-actions">
            <button type="submit" className="bel-btn-primary" disabled={busy}>
              {busy ? '…' : t('save')}
            </button>
            <button type="button" className="bel-btn-ghost" onClick={() => setAdding(false)} disabled={busy}>
              {t('cancel')}
            </button>
          </div>
        </form>
      )}

      <div className="addr-grid">
        {addresses.map((a) => (
          <div key={a.id} className={`addr-card ${a.isDefault ? 'is-default' : ''}`}>
            <div className="addr-head">
              <span className="bel-eyebrow">{a.title}</span>
              {a.isDefault && <span className="addr-default">{t('default')}</span>}
            </div>
            <div className="addr-name">{a.title}</div>
            <div className="addr-lines">
              <div>{a.address}</div>
              <div>{a.city} · {a.country}</div>
            </div>
            <div className="addr-foot">
              {!a.isDefault && (
                <>
                  <button onClick={() => user && setDefaultAddress(user.id, a.id).then(reload)}>
                    {t('setDefault')}
                  </button>
                  <span className="div">·</span>
                </>
              )}
              <button onClick={() => user && deleteAddress(user.id, a.id).then(reload)}>
                {t('delete')}
              </button>
            </div>
          </div>
        ))}

        {!adding && (
          <button className="addr-add" onClick={() => setAdding(true)}>
            <span className="addr-plus">+</span>
            <span>{t('addNewAddress')}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="pane-field">
      <span className="pane-key">{label}</span>
      {children}
    </label>
  );
}
