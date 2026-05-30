'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HERO_BADGE } from './kudos-hero-badge';
import { t, type Language } from '@/lib/i18n/dictionary';

// Per-title tooltip key pairs (Figma "Hover danh hiệu *" frames).
const HERO_TOOLTIP_KEYS: Record<string, { countKey: Parameters<typeof t>[1]; bodyKey: Parameters<typeof t>[1] }> = {
  'New Hero': {
    countKey: 'kudos.hero.tag.new-hero.count',
    bodyKey: 'kudos.hero.tag.new-hero.body',
  },
  'Rising Hero': {
    countKey: 'kudos.hero.tag.rising-hero.count',
    bodyKey: 'kudos.hero.tag.rising-hero.body',
  },
  'Super Hero': {
    countKey: 'kudos.hero.tag.super-hero.count',
    bodyKey: 'kudos.hero.tag.super-hero.body',
  },
  'Legend Hero': {
    countKey: 'kudos.hero.tag.legend-hero.count',
    bodyKey: 'kudos.hero.tag.legend-hero.body',
  },
};

type Anchor = { x: number; y: number; place: 'top' | 'bottom' };

const EST_HEIGHT = 170;
const HALF_WIDTH = 150;
const GAP = 10;
const HEADER_H = 80;
const MARGIN = 8;

type KudosHeroTagProps = {
  lang: Language;
  title: string;
  /** Rendered badge height in px (default 20, matching the card). */
  height?: number;
};

// Hero rank badge that reveals a description tooltip on hover/focus.
// The tooltip renders in a portal so it escapes the carousel `overflow:hidden`
// and the fixed header, flipping below when there's no room above.
export default function KudosHeroTag({ lang, title, height = 20 }: KudosHeroTagProps) {
  const src = HERO_BADGE[title];
  const keys = HERO_TOOLTIP_KEYS[title];
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const open = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const place: Anchor['place'] =
      r.top - GAP - EST_HEIGHT < HEADER_H ? 'bottom' : 'top';
    const cx = Math.min(
      Math.max(r.left + r.width / 2, HALF_WIDTH + MARGIN),
      window.innerWidth - HALF_WIDTH - MARGIN,
    );
    const y = place === 'top' ? r.top - GAP : r.bottom + GAP;
    setAnchor({ x: cx, y, place });
  }, []);

  const close = useCallback(() => setAnchor(null), []);

  useEffect(() => {
    if (!anchor) return;
    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    return () => {
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
    };
  }, [anchor, close]);

  if (!src) return null;

  return (
    <span
      ref={triggerRef}
      style={{ display: 'inline-flex', flexShrink: 0 }}
      tabIndex={0}
      onMouseEnter={open}
      onMouseLeave={close}
      onFocus={open}
      onBlur={close}
    >
      <Image src={src} alt={title} width={110} height={20} style={{ width: 'auto', height, display: 'block' }} />

      {anchor &&
        keys &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            style={{
              position: 'fixed',
              left: anchor.x,
              top: anchor.y,
              transform:
                anchor.place === 'top' ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
              zIndex: 100,
              width: 'max-content',
              maxWidth: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              padding: 16,
              borderRadius: 16,
              border: '1px solid #2E3940',
              background: '#00070C',
              boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
              pointerEvents: 'none',
            }}
          >
            <Image src={src} alt={title} width={110} height={20} style={{ width: 'auto', height: 28, display: 'block' }} />
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: '20px',
                color: '#FFFFFF',
              }}
            >
              {t(lang, keys.countKey)}
            </span>
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 14,
                fontWeight: 500,
                lineHeight: '20px',
                color: '#999999',
              }}
            >
              {t(lang, keys.bodyKey)}
            </span>
          </div>,
          document.body,
        )}
    </span>
  );
}
