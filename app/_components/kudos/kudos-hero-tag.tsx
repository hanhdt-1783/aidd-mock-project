'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { HERO_BADGE } from './kudos-hero-badge';

// Per-title hover copy (Figma "Hover danh hiệu *" frames).
const HERO_TOOLTIP: Record<string, { count: string; body: string }> = {
  'New Hero': {
    count: 'Có 1–4 người gửi Kudos cho bạn',
    body: 'Hành trình lan tỏa điều tốt đẹp bắt đầu – những lời cảm ơn và ghi nhận đầu tiên đã tìm đến.',
  },
  'Rising Hero': {
    count: 'Có 5-9 người gửi Kudos cho bạn',
    body: 'Hình ảnh bạn đang lớn dần trong trái tim đồng đội bằng sự tử tế và cống hiến của mình.',
  },
  'Super Hero': {
    count: 'Có 10–20 người gửi Kudos cho bạn',
    body: 'Bạn đã trở thành biểu tượng được tin tưởng và yêu quý, người luôn sẵn sàng hỗ trợ và được nhiều đồng đội nhớ đến.',
  },
  'Legend Hero': {
    count: 'Có hơn 20 người gửi Kudos cho bạn',
    body: 'Bạn đã trở thành huyền thoại – người để lại dấu ấn khó quên trong tập thể bằng trái tim và hành động của mình.',
  },
};

type Anchor = { x: number; y: number; place: 'top' | 'bottom' };

const EST_HEIGHT = 170;
const HALF_WIDTH = 150;
const GAP = 10;
const HEADER_H = 80;
const MARGIN = 8;

type KudosHeroTagProps = {
  title: string;
  /** Rendered badge height in px (default 20, matching the card). */
  height?: number;
};

// Hero rank badge that reveals a description tooltip on hover/focus.
// The tooltip renders in a portal so it escapes the carousel `overflow:hidden`
// and the fixed header, flipping below when there's no room above.
export default function KudosHeroTag({ title, height = 20 }: KudosHeroTagProps) {
  const src = HERO_BADGE[title];
  const copy = HERO_TOOLTIP[title];
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
        copy &&
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
              {copy.count}
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
              {copy.body}
            </span>
          </div>,
          document.body,
        )}
    </span>
  );
}
