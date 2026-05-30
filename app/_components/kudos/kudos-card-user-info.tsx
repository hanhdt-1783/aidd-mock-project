'use client';

import type { KudosCard } from './types';
import { HERO_BADGE } from './kudos-hero-badge';
import KudosAvatarHover from './kudos-avatar-hover';
import KudosHeroTag from './kudos-hero-tag';
import type { Language } from '@/lib/i18n/dictionary';

type UserInfoBlockProps = {
  user: KudosCard['sender'];
  lang: Language;
};

// Sender / receiver identity block — avatar + name + (department · hero badge).
// Shared by the Highlight carousel card and the All-Kudos list card so the
// avatar treatment stays identical in both (Figma B.3.* / C.3.* "Infor").
export default function UserInfoBlock({ user, lang }: UserInfoBlockProps) {
  const badgeSrc = user.title ? HERO_BADGE[user.title] : undefined;
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
      {/* Avatar — gold ring + profile preview on hover (Figma "Hover Avatar"). */}
      <KudosAvatarHover user={user} size={64} lang={lang} />
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
        {user.title && badgeSrc && <KudosHeroTag title={user.title} height={20} lang={lang} />}
      </div>
    </div>
  );
}
