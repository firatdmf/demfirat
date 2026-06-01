'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/contexts/AuthContext';
import { updateProfile, type Profile } from '@/lib/account';
import { accountCache } from '@/lib/account-cache';

export default function ProfilePane() {
  const t = useTranslations('account');
  const { user } = useAuth();

  const [profile, setProfile] = useState<Profile | null>(() =>
    user ? accountCache.profile(user.id).cached : null,
  );
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedNote, setSavedNote] = useState(false);
  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [birthdate, setBirthdate] = useState(profile?.birthdate ?? '');

  useEffect(() => {
    if (!user) return;
    const { cached, fresh } = accountCache.profile(user.id);
    if (cached && !profile) {
      setProfile(cached);
      setName(cached.name);
      setPhone(cached.phone);
      setBirthdate(cached.birthdate || '');
    }
    fresh.then((p) => {
      setProfile(p);
      if (!editing) {
        setName(p.name);
        setPhone(p.phone);
        setBirthdate(p.birthdate || '');
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, { name, phone, birthdate: birthdate || '' });
      setProfile((p) => {
        const next = p ? { ...p, name, phone, birthdate } : p;
        if (next) accountCache.setProfile(user.id, next);
        return next;
      });
      setEditing(false);
      setSavedNote(true);
      setTimeout(() => setSavedNote(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  if (!profile) return <div className="bel-meta">…</div>;

  const displayName = profile.name || user?.username || t('notSet');

  return (
    <div>
      <div className="pane-head">
        <span className="pane-num">01</span>
        <h2 className="pane-title">{t('profile')}</h2>
        <p className="pane-sub">{t('profileSub')}</p>
      </div>

      {savedNote && <p className="bel-meta" style={{ marginBottom: 24 }}>{t('saved')}</p>}

      {!editing ? (
        <>
          {/* Primary contact section */}
          <div className="prof-section-head">
            <span className="bel-eyebrow">{t('contactInfo')}</span>
            <p className="bel-meta">{t('contactInfoSub')}</p>
          </div>
          <div className="pane-fields">
            <div className="pane-field">
              <span className="pane-key">{t('fullName')}</span>
              <span className="pane-val">{displayName}</span>
            </div>
            <div className="pane-field">
              <span className="pane-key">{t('email')}</span>
              <span className="pane-val">
                {profile.email}
                <span className="pane-val-hint">{t('emailRequired')}</span>
              </span>
            </div>
            <div className="pane-field">
              <span className="pane-key">{t('phone')}</span>
              <span className="pane-val">{profile.phone || t('notSet')}</span>
            </div>
            <div className="pane-field">
              <span className="pane-key">{t('birthdate')}</span>
              <span className="pane-val">{profile.birthdate || t('notSet')}</span>
            </div>
          </div>

          <div className="pane-actions">
            <button className="bel-btn-primary" onClick={() => setEditing(true)}>
              {t('editDetails')} →
            </button>
            <button className="bel-btn-ghost">{t('changePassword')}</button>
          </div>
        </>
      ) : (
        <form onSubmit={onSave}>
          <div className="prof-section-head">
            <span className="bel-eyebrow">{t('contactInfo')}</span>
            <p className="bel-meta">{t('contactInfoSub')}</p>
          </div>
          <div className="pane-fields">
            <Field label={t('fullName')}>
              <input className="pane-input" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <Field label={t('email')} hint={t('emailRequired')}>
              <input className="pane-input" value={profile.email} disabled />
            </Field>
            <Field label={t('phone')}>
              <input className="pane-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+90" />
            </Field>
            <Field label={t('birthdate')}>
              <input className="pane-input" type="date" value={birthdate} onChange={(e) => setBirthdate(e.target.value)} />
            </Field>
          </div>
          <div className="pane-actions">
            <button type="submit" className="bel-btn-primary" disabled={saving}>
              {saving ? '…' : t('save')}
            </button>
            <button
              type="button"
              className="bel-btn-ghost"
              onClick={() => {
                setEditing(false);
                setName(profile.name);
                setPhone(profile.phone);
                setBirthdate(profile.birthdate || '');
              }}
            >
              {t('cancel')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="pane-field">
      <span className="pane-key">{label}</span>
      {children}
      {hint && <span className="pane-val-hint">{hint}</span>}
    </label>
  );
}
