'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { KudosUser } from './types';
import { HERO_BADGE } from './kudos-hero-badge';

type KudosAvatarHoverProps = {
  user: KudosUser;
  /** Avatar diameter in px (default 64, matching the card). */
  size?: number;
};

// Fixed-position anchor for the portal popover. `place` flips to 'bottom' when
// opening above would collide with the fixed 80px site header.
type Anchor = { x: number; y: number; place: 'top' | 'bottom' };

const POPOVER_EST_HEIGHT = 170;
const POPOVER_HALF_WIDTH = 140;
const GAP = 10;
const HEADER_H = 80;
const MARGIN = 8;

function initialsOf(name: string): string {
  return (
    name
      ?.trim()
      .split(/\s+/)
      .slice(-2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase() || '?'
  );
}

// Circular avatar that gains a gold ring on hover/focus (Figma "Hover Avatar
// info user": border #FFF → #FFEA9E) and reveals a profile-preview popover.
// The popover renders in a PORTAL so it escapes the Highlight carousel's
// `overflow: hidden` and sits above the fixed header (z-index), and it flips
// below the avatar when there isn't room above the header.
export default function KudosAvatarHover({ user, size = 64 }: KudosAvatarHoverProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [anchor, setAnchor] = useState<Anchor | null>(null);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  }, []);

  const open = useCallback(() => {
    cancelClose();
    const el = triggerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const place: Anchor['place'] =
      r.top - GAP - POPOVER_EST_HEIGHT < HEADER_H ? 'bottom' : 'top';
    const cx = Math.min(
      Math.max(r.left + r.width / 2, POPOVER_HALF_WIDTH + MARGIN),
      window.innerWidth - POPOVER_HALF_WIDTH - MARGIN,
    );
    const y = place === 'top' ? r.top - GAP : r.bottom + GAP;
    setAnchor({ x: cx, y, place });
  }, [cancelClose]);

  // Delay close so the cursor can travel from the avatar onto the popover
  // (which renders in a portal across a small gap) without it dismissing.
  const scheduleClose = useCallback(() => {
    cancelClose();
    closeTimer.current = setTimeout(() => setAnchor(null), 140);
  }, [cancelClose]);

  const closeNow = useCallback(() => {
    cancelClose();
    setAnchor(null);
  }, [cancelClose]);

  // Close on scroll/resize so a stale fixed position never lingers.
  useEffect(() => {
    if (!anchor) return;
    window.addEventListener('scroll', closeNow, true);
    window.addEventListener('resize', closeNow);
    return () => {
      window.removeEventListener('scroll', closeNow, true);
      window.removeEventListener('resize', closeNow);
    };
  }, [anchor, closeNow]);

  // Open the compose modal (owned by the hero banner) for this recipient.
  const sendKudo = useCallback(() => {
    closeNow();
    window.dispatchEvent(
      new CustomEvent('kudos:open-compose', { detail: { recipientId: user.id } }),
    );
  }, [closeNow, user.id]);

  const initials = initialsOf(user.name);
  const badgeSrc = user.title ? HERO_BADGE[user.title] : undefined;

  return (
    <span
      ref={triggerRef}
      style={{ position: 'relative', display: 'inline-flex', flexShrink: 0 }}
      tabIndex={0}
      aria-label={user.name}
      onMouseEnter={open}
      onMouseLeave={scheduleClose}
      onFocus={open}
      onBlur={scheduleClose}
    >
      <AvatarCircle
        user={user}
        initials={initials}
        size={size}
        ring={anchor ? '#FFEA9E' : '#FFFFFF'}
        glow={!!anchor}
      />

      {anchor &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="tooltip"
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{
              position: 'fixed',
              left: anchor.x,
              top: anchor.y,
              transform:
                anchor.place === 'top'
                  ? 'translate(-50%, -100%)'
                  : 'translate(-50%, 0)',
              zIndex: 100,
              width: 'max-content',
              maxWidth: 280,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: 8,
              padding: 16,
              borderRadius: 16,
              border: '1px solid #2E3940',
              background: '#00070C',
              boxShadow: '0 12px 32px rgba(0,0,0,0.55)',
              pointerEvents: 'auto',
            }}
          >
            {/* Full name — gold, on top */}
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 18,
                fontWeight: 700,
                lineHeight: '24px',
                color: '#FFEA9E',
              }}
            >
              {user.name}
            </span>

            {/* Department — white, smaller than the name */}
            {user.department && (
              <span
                style={{
                  marginTop: -4,
                  marginBottom: 4,
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 13,
                  fontWeight: 600,
                  lineHeight: '18px',
                  color: '#999999',
                }}
              >
                Tên đơn vị: {user.department}
              </span>
            )}

            {/* Hero tag */}
            {badgeSrc && (
              <Image
                src={badgeSrc}
                alt={user.title ?? ''}
                width={110}
                height={20}
                style={{ width: 'auto', height: 20, flexShrink: 0 }}
              />
            )}

            {/* Divider */}
            <div
              aria-hidden="true"
              style={{ width: '100%', height: 1, background: '#2E3940', margin: '2px 0' }}
            />

            {/* Kudos stats — white label + gold value, matching the
                "Thống kê chung" sidebar panel convention. */}
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: '20px',
                color: '#FFFFFF',
              }}
            >
              Số Kudos nhận được: <span style={{ color: '#FFEA9E' }}>{user.kudosReceived}</span>
            </span>
            <span
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 14,
                fontWeight: 700,
                lineHeight: '20px',
                color: '#FFFFFF',
              }}
            >
              Số Kudos đã gửi: <span style={{ color: '#FFEA9E' }}>{user.kudosSent}</span>
            </span>

            {/* "Gửi KUDO" — same style as the "Mở Secret Box" button, pencil left */}
            <button
              type="button"
              onClick={sendKudo}
              style={{
                marginTop: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 16px',
                borderRadius: 8,
                border: 'none',
                background: '#FFEA9E',
                cursor: 'pointer',
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 16,
                fontWeight: 700,
                lineHeight: '20px',
                color: '#00101A',
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFD54F';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFEA9E';
              }}
            >
              {/* Pencil icon (left) — same Figma MM_MEDIA_Pen used in ALL KUDOS */}
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                <path
                  d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
                  fill="currentColor"
                />
              </svg>
              Gửi KUDO
            </button>
          </div>,
          document.body,
        )}
    </span>
  );
}

type AvatarCircleProps = {
  user: KudosUser;
  initials: string;
  size: number;
  ring: string;
  glow?: boolean;
};

// Shared circular avatar (photo over initials fallback) with a coloured ring.
function AvatarCircle({ user, initials, size, ring, glow }: AvatarCircleProps) {
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        overflow: 'hidden',
        border: `1.87px solid ${ring}`,
        boxShadow: glow ? '0 0 0 2px rgba(255,234,158,0.35)' : 'none',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#EEEEEE',
        color: '#999999',
        fontFamily: 'Montserrat, sans-serif',
        fontSize: Math.round(size * 0.34),
        fontWeight: 700,
        userSelect: 'none',
      }}
    >
      <span aria-hidden="true">{initials}</span>
      {user.avatarUrl && (
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={size}
          height={size}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}
    </span>
  );
}
