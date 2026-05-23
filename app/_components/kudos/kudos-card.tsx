'use client';

import Image from 'next/image';
import type { KudosCard as KudosCardType } from './types';

type KudosCardProps = {
  card: KudosCardType;
  onLike: (id: string) => void;
  onCopyLink: (id: string) => void;
};

function Avatar({ src, alt, size = 64 }: { src: string; alt: string; size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        overflow: 'hidden',
        border: '2px solid rgba(255,234,158,0.4)',
        backgroundColor: '#1A2430',
        flexShrink: 0,
      }}
    >
      <Image
        src={src}
        alt={alt}
        width={size}
        height={size}
        style={{ objectFit: 'cover' }}
      />
    </div>
  );
}

function StarRating({ stars }: { stars: 0 | 1 | 2 | 3 }) {
  return (
    <div style={{ display: 'flex', gap: 2, alignItems: 'center' }}>
      {Array.from({ length: stars }).map((_, i) => (
        <svg key={i} width="10" height="10" viewBox="0 0 12 12" fill="#FFEA9E" aria-hidden="true">
          <path d="M6 1l1.545 3.13 3.455.502-2.5 2.436.59 3.44L6 8.893l-3.09 1.615.59-3.44L1 4.632l3.455-.502z" />
        </svg>
      ))}
    </div>
  );
}

export default function KudosCard({ card, onLike, onCopyLink }: KudosCardProps) {
  const timeAgo = (() => {
    const diff = Date.now() - new Date(card.createdAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
  })();

  return (
    <article
      id={`kudos-${card.id}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 24px 16px',
        borderRadius: 16,
        border: '1px solid rgba(255,234,158,0.2)',
        background: 'rgba(255,248,225,0.04)',
        width: '100%',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s ease',
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,234,158,0.5)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,234,158,0.2)';
      }}
    >
      {/* Sender → arrow → Receiver */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        {/* Sender */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
          <Avatar src={card.sender.avatarUrl} alt={card.sender.name} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#FFEA9E' }}>
            {card.sender.name}
          </span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
            {card.sender.department}
          </span>
          <StarRating stars={card.sender.rankStars} />
          {card.sender.title && (
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: '#FFEA9E', letterSpacing: '0.5px' }}>
              {card.sender.title}
            </span>
          )}
        </div>

        {/* Send icon */}
        <div style={{ paddingTop: 16, flexShrink: 0 }} aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M4 16h24M22 10l6 6-6 6" stroke="#FFEA9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        {/* Receiver */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1, alignItems: 'flex-end' }}>
          <Avatar src={card.receiver.avatarUrl} alt={card.receiver.name} />
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, fontWeight: 700, color: '#FFEA9E', textAlign: 'right' }}>
            {card.receiver.name}
          </span>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.5)', textAlign: 'right' }}>
            {card.receiver.department}
          </span>
          <StarRating stars={card.receiver.rankStars} />
          {card.receiver.title && (
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, fontWeight: 700, color: '#FFEA9E', letterSpacing: '0.5px' }}>
              {card.receiver.title}
            </span>
          )}
        </div>
      </div>

      {/* Time */}
      <p style={{ margin: 0, fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>
        {timeAgo}
      </p>

      {/* Content */}
      <p
        style={{
          margin: 0,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.87)',
          lineHeight: '22px',
        }}
      >
        {card.content}
      </p>

      {/* Hashtags */}
      {card.hashtags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="#FFEA9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FFEA9E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {card.hashtags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#FFEA9E',
                background: 'rgba(255,234,158,0.08)',
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Images */}
      {card.images.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {card.images.map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={src}
              alt={`Ảnh đính kèm ${idx + 1}`}
              style={{ width: 88, height: 88, objectFit: 'cover', borderRadius: 8, border: '1px solid rgba(255,234,158,0.2)' }}
            />
          ))}
        </div>
      )}

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingTop: 8,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* Like */}
        <button
          type="button"
          disabled={!card.canLike}
          onClick={() => onLike(card.id)}
          aria-label={card.likedByMe ? 'Bỏ thích' : 'Thích'}
          aria-pressed={card.likedByMe}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'none',
            border: 'none',
            cursor: card.canLike ? 'pointer' : 'not-allowed',
            opacity: card.canLike ? 1 : 0.4,
            padding: '4px 8px',
            borderRadius: 6,
            color: card.likedByMe ? '#E53935' : 'rgba(255,255,255,0.7)',
            transition: 'background 0.15s ease',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={card.likedByMe ? '#E53935' : 'none'} aria-hidden="true">
            <path
              d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, fontWeight: 700 }}>
            {card.likeCount}
          </span>
        </button>

        {/* Copy link */}
        <button
          type="button"
          onClick={() => onCopyLink(card.id)}
          aria-label="Sao chép liên kết"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'rgba(255,234,158,0.06)',
            border: '1px solid rgba(255,234,158,0.2)',
            cursor: 'pointer',
            padding: '6px 12px',
            borderRadius: 8,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            color: '#FFEA9E',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,234,158,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,234,158,0.06)';
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Sao chép link
        </button>

        {/* Xem chi tiết */}
        <a
          href={`/kudos/${card.id}`}
          style={{
            marginLeft: 'auto',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 12,
            fontWeight: 600,
            color: 'rgba(255,234,158,0.7)',
            textDecoration: 'none',
            padding: '4px 0',
            borderBottom: '1px solid transparent',
            transition: 'color 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = '#FFEA9E';
            el.style.borderBottomColor = '#FFEA9E';
          }}
          onMouseLeave={(e) => {
            const el = e.currentTarget as HTMLAnchorElement;
            el.style.color = 'rgba(255,234,158,0.7)';
            el.style.borderBottomColor = 'transparent';
          }}
        >
          Xem chi tiết →
        </a>
      </div>
    </article>
  );
}
