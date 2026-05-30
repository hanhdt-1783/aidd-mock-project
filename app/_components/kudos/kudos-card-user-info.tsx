'use client';

import Image from 'next/image';
import type { KudosCard } from './types';

// Hero rank badge artwork (Figma MM_MEDIA_*Hero, 110×20, text baked in).
// Keyed by profiles.title (see supabase/seed.sql).
const HERO_BADGE: Record<string, string> = {
  'New Hero': '/kudos/badge-new-hero.png',
  'Rising Hero': '/kudos/badge-rising-hero.png',
  'Legend Hero': '/kudos/badge-legend-hero.png',
  'Super Hero': '/kudos/badge-super-hero.png',
};

type UserInfoBlockProps = {
  user: KudosCard['sender'];
};

// Sender / receiver identity block — avatar + name + (department · hero badge).
// Shared by the Highlight carousel card and the All-Kudos list card so the
// avatar treatment stays identical in both (Figma B.3.* / C.3.* "Infor").
export default function UserInfoBlock({ user }: UserInfoBlockProps) {
  const badgeSrc = user.title ? HERO_BADGE[user.title] : undefined;
  const initials =
    user.name
      ?.trim()
      .split(/\s+/)
      .slice(-2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase() || '?';
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 6,
        flex: 1,
        minWidth: 0,
      }}
    >
      {/* Avatar — Figma: 1.87px white ring, no solid background. The fill is the
          photo over a neutral #EEE placeholder (Figma MM_MEDIA_Avatar). Initials
          show behind as a fallback so a missing avatar isn't an empty circle. */}
      <div
        style={{
          position: 'relative',
          width: 64,
          height: 64,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #FFFFFF',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#EEEEEE',
          color: '#999999',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          userSelect: 'none',
        }}
      >
        <span aria-hidden="true">{initials}</span>
        {user.avatarUrl && (
          <Image
            src={user.avatarUrl}
            alt={user.name}
            width={64}
            height={64}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        )}
      </div>
      {/* Name — Figma node 256:4735: 16/700, dark on cream, centered.
          Always one line, never wraps (whiteSpace: nowrap). */}
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: '24px',
          letterSpacing: '0.15px',
          color: '#00101A',
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {user.name}
      </span>
      {/* Department · hero badge row (Figma "Huy hiệu + Sao" 256:4741) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
        }}
      >
        {user.department && (
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              lineHeight: '20px',
              letterSpacing: '0.1px',
              color: '#999999',
              whiteSpace: 'nowrap',
            }}
          >
            {user.department}
          </span>
        )}
        {user.department && badgeSrc && (
          <span
            aria-hidden="true"
            style={{
              width: 4,
              height: 4,
              borderRadius: '50%',
              backgroundColor: '#999999',
              opacity: 0.4,
              flexShrink: 0,
            }}
          />
        )}
        {badgeSrc && (
          <Image
            src={badgeSrc}
            alt={user.title ?? ''}
            width={110}
            height={20}
            style={{ width: 'auto', height: 20, flexShrink: 0 }}
          />
        )}
      </div>
    </div>
  );
}
