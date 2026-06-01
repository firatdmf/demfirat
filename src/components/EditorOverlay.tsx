'use client';

/**
 * Visual editor overlay (ported from Belino). Only renders when the page
 * is loaded with `?edit=1` query — i.e. the ERP storefront preview iframe.
 *
 * - Hovering an element with `data-edit-zone="<kind>"` highlights it +
 *   "Düzenle" badge; clicking dispatches a postMessage so the parent ERP
 *   jumps to that section's edit form.
 * - `data-edit-text="<model>:<pk>:<field>"` enables inline contentEditable.
 * - `data-edit-image="<model>:<pk>:<field>"` opens a file picker; uploads
 *   are base64-encoded and shipped via postMessage so the ERP parent
 *   (same-origin with the API) handles the actual POST — sidesteps cross-
 *   origin SameSite cookie pain.
 * - `data-edit-sort-list="<model>"` enables drag-drop reorder via SortableJS.
 *
 * Same contract as the Belino EditorOverlay; the ERP whitelists both
 * `belino-editor` and `demfirat-editor` source strings.
 */

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const EDITOR_SOURCE = 'demfirat-editor';

type HoverState = {
  rect: DOMRect;
  zone: string;
  label: string;
};

const ZONE_LABELS: Record<string, string> = {
  hero: 'Hero',
  trust: 'Güven Bandı',
  seasons: 'Sezon Kartları',
  featured: 'Vitrin Ürünleri',
};

export default function EditorOverlay() {
  const params = useSearchParams();
  const enabled = params?.get('edit') === '1';
  const [hover, setHover] = useState<HoverState | null>(null);
  const ticking = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add('sf-edit-mode');

    function findEditZone(target: Element | null): HTMLElement | null {
      let el: Element | null = target;
      while (el && el !== document.body) {
        if (el instanceof HTMLElement && el.dataset.editZone) return el;
        el = el.parentElement;
      }
      return null;
    }
    function findSortItem(target: Element | null): HTMLElement | null {
      let el: Element | null = target;
      while (el && el !== document.body) {
        if (el instanceof HTMLElement && el.dataset.editSortId) return el;
        el = el.parentElement;
      }
      return null;
    }

    function onMove(e: MouseEvent) {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        const el = findEditZone(document.elementFromPoint(e.clientX, e.clientY));
        if (!el) {
          setHover(null);
          return;
        }
        const zone = el.dataset.editZone || '';
        setHover({
          rect: el.getBoundingClientRect(),
          zone,
          label: ZONE_LABELS[zone] || zone,
        });
      });
    }

    function findEditText(target: Element | null): HTMLElement | null {
      let el: Element | null = target;
      while (el && el !== document.body) {
        if (el instanceof HTMLElement && el.dataset.editText) return el;
        el = el.parentElement;
      }
      return null;
    }
    function findEditImage(target: Element | null): HTMLElement | null {
      let el: Element | null = target;
      while (el && el !== document.body) {
        if (el instanceof HTMLElement && el.dataset.editImage) return el;
        el = el.parentElement;
      }
      return null;
    }

    let pendingImageEl: HTMLElement | null = null;
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files?.[0];
      const el = pendingImageEl;
      pendingImageEl = null;
      if (!file || !el) return;
      const spec = el.dataset.editImage || '';
      const [model, pkRaw, field] = spec.split(':');
      const pk = parseInt(pkRaw, 10);
      if (!model || !pk || !field) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || '');
        window.parent.postMessage(
          {
            source: EDITOR_SOURCE,
            type: 'image-upload',
            model,
            pk,
            field,
            filename: file.name,
            dataUrl,
          },
          '*',
        );
      };
      reader.readAsDataURL(file);
      fileInput.value = '';
    });

    function commitText(el: HTMLElement) {
      const spec = el.dataset.editText || '';
      const [model, pkRaw, field] = spec.split(':');
      const pk = parseInt(pkRaw, 10);
      const value = (el.innerText || '').trim();
      if (!model || !pk || !field) return;
      window.parent.postMessage(
        { source: EDITOR_SOURCE, type: 'text', model, pk, field, value },
        '*',
      );
    }

    function onClick(e: MouseEvent) {
      const imgEl = findEditImage(e.target as Element);
      if (imgEl) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        pendingImageEl = imgEl;
        fileInput.click();
        return;
      }
      const textEl = findEditText(e.target as Element);
      if (textEl) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (textEl.isContentEditable) return;
        textEl.contentEditable = 'true';
        textEl.classList.add('sf-edit-active-text');
        textEl.focus();
        const range = document.createRange();
        range.selectNodeContents(textEl);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        const stop = () => {
          textEl.contentEditable = 'false';
          textEl.classList.remove('sf-edit-active-text');
          textEl.removeEventListener('blur', stop);
          textEl.removeEventListener('keydown', keyHandler);
          commitText(textEl);
        };
        const keyHandler = (k: KeyboardEvent) => {
          if (k.key === 'Enter' && !k.shiftKey) {
            k.preventDefault();
            textEl.blur();
          } else if (k.key === 'Escape') {
            k.preventDefault();
            textEl.blur();
          }
        };
        textEl.addEventListener('blur', stop);
        textEl.addEventListener('keydown', keyHandler);
        return;
      }
      if (findSortItem(e.target as Element)) return;
      const el = findEditZone(e.target as Element);
      if (!el) return;
      e.preventDefault();
      e.stopPropagation();
      const zone = el.dataset.editZone || '';
      window.parent.postMessage(
        { source: EDITOR_SOURCE, type: 'select', zone },
        '*',
      );
    }

    function onLeave() {
      setHover(null);
    }

    // In edit mode the page is LOCKED — clicking nav/cards/buttons must
    // not navigate away. The ERP picks the preview URL via its own page
    // selector.
    function blockNavigation(e: MouseEvent) {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
      const link = (e.target as Element)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!link) return;
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#')) return;
      e.preventDefault();
      e.stopPropagation();
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('click', blockNavigation, true);
    document.addEventListener('click', onClick, true);
    document.addEventListener('mouseleave', onLeave);

    const sortInstances: any[] = [];
    let cancelled = false;

    function attachSortable(SortableLib: any) {
      if (cancelled) return;
      const lists = document.querySelectorAll<HTMLElement>('[data-edit-sort-list]');
      lists.forEach((list) => {
        const model = list.dataset.editSortList || '';
        const sec = list.dataset.editSortSection || '';
        const inst = SortableLib.create(list, {
          animation: 200,
          ghostClass: 'sf-edit-ghost',
          chosenClass: 'sf-edit-chosen',
          onStart: () => list.classList.add('sf-edit-sorting'),
          onEnd: () => {
            list.classList.remove('sf-edit-sorting');
            const items = Array.from(list.querySelectorAll<HTMLElement>('[data-edit-sort-id]'))
              .map((el, idx) => {
                const raw = el.dataset.editSortId;
                const id = raw && /^\d+$/.test(raw) ? parseInt(raw, 10) : null;
                return id != null ? { id, order: idx } : null;
              })
              .filter(Boolean);
            if (items.length === 0) return;
            window.parent.postMessage(
              {
                source: EDITOR_SOURCE,
                type: 'reorder',
                model,
                section: sec ? parseInt(sec, 10) : null,
                items,
              },
              '*',
            );
          },
        });
        sortInstances.push(inst);
      });
    }

    const existing = document.getElementById('sortable-cdn');
    if (existing && (window as any).Sortable) {
      attachSortable((window as any).Sortable);
    } else {
      const script = document.createElement('script');
      script.id = 'sortable-cdn';
      script.src = 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js';
      script.onload = () => attachSortable((window as any).Sortable);
      document.head.appendChild(script);
    }

    return () => {
      cancelled = true;
      document.documentElement.classList.remove('sf-edit-mode');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('click', blockNavigation, true);
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('mouseleave', onLeave);
      sortInstances.forEach((s) => s && s.destroy && s.destroy());
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <style jsx global>{`
        .sf-edit-mode { cursor: crosshair; }
        .sf-edit-mode a, .sf-edit-mode button { cursor: crosshair !important; }
        [data-edit-zone] { position: relative; }
        .sf-edit-mode [data-edit-sort-id] { cursor: grab; transition: transform 200ms; }
        .sf-edit-mode [data-edit-sort-id]:active { cursor: grabbing; }
        .sf-edit-mode [data-edit-sort-list].sf-edit-sorting [data-edit-sort-id] {
          transition: transform 220ms cubic-bezier(.22,1,.36,1);
        }
        .sf-edit-ghost {
          opacity: 0.35 !important;
          background: rgba(0, 128, 128, 0.1);
          outline: 2px dashed #008080;
          outline-offset: -2px;
        }
        .sf-edit-chosen {
          box-shadow:
            0 12px 28px rgba(0, 128, 128, 0.20),
            0 28px 56px rgba(0, 128, 128, 0.15);
          z-index: 10;
        }
        .sf-edit-mode [data-edit-text] {
          cursor: text;
          outline: 1px dashed transparent;
          outline-offset: 4px;
          transition: outline-color 160ms;
        }
        .sf-edit-mode [data-edit-text]:hover {
          outline-color: rgba(0, 128, 128, 0.45);
        }
        .sf-edit-mode .sf-edit-active-text {
          outline: 2px solid #008080 !important;
          outline-offset: 4px;
          background: rgba(0, 128, 128, 0.04);
          border-radius: 2px;
        }
        .sf-edit-mode [data-edit-image] {
          cursor: pointer;
          position: relative;
          outline: 1px dashed transparent;
          outline-offset: -2px;
          transition: outline-color 160ms;
        }
        .sf-edit-mode [data-edit-image]:hover {
          outline-color: rgba(0, 128, 128, 0.65);
        }
        .sf-edit-mode [data-edit-image]::after {
          content: '✎ Görsel';
          position: absolute;
          top: 12px;
          right: 12px;
          padding: 5px 10px;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.06em;
          color: #fff;
          background: rgba(0, 128, 128, 0.92);
          border-radius: 4px;
          opacity: 0;
          transform: translateY(-4px);
          transition: opacity 160ms, transform 160ms;
          pointer-events: none;
          z-index: 5;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        }
        .sf-edit-mode [data-edit-image]:hover::after {
          opacity: 1;
          transform: translateY(0);
        }
        .sf-hero-image-handle { display: none; }
        .sf-edit-mode .sf-hero-image-handle {
          display: flex;
          position: absolute;
          top: 16px;
          right: 16px;
          z-index: 9990;
          padding: 8px 14px;
          font: 700 11px 'Plus Jakarta Sans', system-ui, sans-serif;
          letter-spacing: 0.06em;
          color: #fff;
          background: rgba(0, 128, 128, 0.92);
          border-radius: 6px;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          transition: background 160ms;
          pointer-events: auto;
          align-items: center;
          gap: 6px;
        }
        .sf-edit-mode .sf-hero-image-handle::before {
          content: '✎ Hero görseli değiştir';
        }
        .sf-edit-mode .sf-hero-image-handle:hover {
          background: rgba(0, 128, 128, 1);
        }
      `}</style>
      {hover && (
        <div
          aria-hidden
          style={{
            position: 'fixed',
            left: hover.rect.left,
            top: hover.rect.top,
            width: hover.rect.width,
            height: hover.rect.height,
            outline: '2px solid #008080',
            outlineOffset: '-2px',
            background: 'rgba(0, 128, 128, 0.06)',
            pointerEvents: 'none',
            zIndex: 9998,
            transition: 'left 90ms, top 90ms, width 90ms, height 90ms',
          }}
        >
          <span
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              transform: 'translateY(-100%)',
              padding: '4px 10px',
              fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: '#fff',
              background: '#008080',
              borderTopLeftRadius: 4,
              borderTopRightRadius: 4,
              whiteSpace: 'nowrap',
            }}
          >
            ✎ {hover.label} · Düzenle
          </span>
        </div>
      )}
    </>
  );
}
