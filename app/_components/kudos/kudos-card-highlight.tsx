'use client';

import type { KudosCard } from './types';
import UserInfoBlock from './kudos-card-user-info';

type KudosCardHighlightProps = {
  card: KudosCard;
  onLike: (id: string) => void;
  onCopyLink: (id: string) => void;
};

const pad = (n: number) => String(n).padStart(2, '0');

export default function KudosCardHighlight({
  card,
  onLike,
  onCopyLink,
}: KudosCardHighlightProps) {
  // Absolute timestamp "HH:mm - MM/DD/YYYY" (Figma node 335:9449). UTC getters
  // keep the server and client render identical (no hydration drift).
  const dt = new Date(card.createdAt);
  const timeLabel = `${pad(dt.getUTCHours())}:${pad(dt.getUTCMinutes())} - ${pad(
    dt.getUTCMonth() + 1,
  )}/${pad(dt.getUTCDate())}/${dt.getUTCFullYear()}`;

  // Vietnamese thousands grouping with '.' — deterministic (no toLocaleString).
  const likeLabel = String(card.likeCount).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

  // Rectangle 14 / 15 — gold dividers around the content (Figma #FFEA9E).
  const goldDivider = (
    <div
      aria-hidden="true"
      style={{ width: '100%', height: 1, backgroundColor: '#FFEA9E' }}
    />
  );

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 24px 16px 24px',
        borderRadius: 16,
        border: '4px solid #FFEA9E',
        background: '#FFF8E1',
        flexShrink: 0,
        width: 528,
      }}
    >
      {/* Sender → Receiver row (Frame 482) */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24 }}>
        <UserInfoBlock user={card.sender} />

        {/* Send icon — Figma MM_MEDIA_Send (filled paper-plane), centered with
            the avatars. Dark fill so it reads on the cream card. */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: 16,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            style={{ color: '#00101A' }}
          >
            <path
              d="M2.9043 20.4797V4.47974L21.9043 12.4797M4.9043 17.4797L16.7543 12.4797L4.9043 7.47974V10.9797L10.9043 12.4797L4.9043 13.9797M4.9043 17.4797V7.47974V13.9797V17.4797Z"
              fill="currentColor"
            />
          </svg>
        </div>

        <UserInfoBlock user={card.receiver} />
      </div>

      {goldDivider}

      {/* Content (Figma node 335:9448) */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, width: '100%' }}>
        {/* Time */}
        <p
          style={{
            margin: 0,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 16,
            fontWeight: 700,
            lineHeight: '24px',
            letterSpacing: '0.5px',
            color: '#999999',
          }}
        >
          {timeLabel}
        </p>

        {/* Title */}
        {card.title && (
          <p
            style={{
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.5px',
              color: '#00101A',
              textAlign: 'center',
            }}
          >
            {card.title}
          </p>
        )}

        {/* Message — highlighted box (Figma Frame 425) */}
        <div
          style={{
            border: '1px solid #FFEA9E',
            background: 'rgba(255,234,158,0.40)',
            borderRadius: 12,
            padding: '16px 24px',
          }}
        >
          <p
            style={{
              margin: 0,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 20,
              fontWeight: 700,
              lineHeight: '32px',
              color: '#00101A',
              textAlign: 'justify',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {card.content}
          </p>
        </div>

        {/* Hashtags — Figma node 335:9459: single red line, 16/700, one line
            truncated with ellipsis (not separate chips). */}
        {card.hashtags.length > 0 && (
          <p
            style={{
              margin: 0,
              width: '100%',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.5px',
              color: '#D4271D',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {card.hashtags.map((t) => `#${t}`).join(' ')}
          </p>
        )}
      </div>

      {goldDivider}

      {/* Action bar (Frame 485): hearts left, Copy Link + Xem chi tiết right */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Hearts — like count + heart icon */}
        <button
          type="button"
          disabled={!card.canLike}
          onClick={() => onLike(card.id)}
          aria-label={card.likedByMe ? 'Bỏ thích' : 'Thích'}
          aria-pressed={card.likedByMe}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            background: 'none',
            border: 'none',
            padding: 0,
            cursor: card.canLike ? 'pointer' : 'not-allowed',
            opacity: card.canLike ? 1 : 0.5,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 24,
              fontWeight: 700,
              lineHeight: '32px',
              color: '#00101A',
            }}
          >
            {likeLabel}
          </span>
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill={card.likedByMe ? '#E53935' : 'none'}
            aria-hidden="true"
          >
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke={card.likedByMe ? '#E53935' : '#00101A'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        {/* Copy Link + Xem chi tiết */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={() => onCopyLink(card.id)}
            aria-label="Copy Link"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 16,
              borderRadius: 4,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.15px',
              color: '#00101A',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(0,16,26,0.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background = 'none';
            }}
          >
            Copy Link
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <a
            href={`/kudos/${card.id}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: 16,
              borderRadius: 4,
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 16,
              fontWeight: 700,
              lineHeight: '24px',
              letterSpacing: '0.15px',
              color: '#00101A',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
              transition: 'background 0.15s ease',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background =
                'rgba(0,16,26,0.06)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.background = 'none';
            }}
          >
            Xem chi tiết
            {/* Arrow up-right ↗ (Figma IC 186:2691) — matches home CTA pattern */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </div>
      </div>
    </article>
  );
}
