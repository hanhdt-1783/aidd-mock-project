'use client';

import Image from 'next/image';
import type { KudosCard } from './types';

type RankBadgeProps = {
  title: string | null;
  stars: 0 | 1 | 2 | 3;
};

function RankBadge({ title, stars }: RankBadgeProps) {
  const starColor = '#FFEA9E';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {Array.from({ length: stars }).map((_, i) => (
        <svg
          key={i}
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill={starColor}
          aria-hidden="true"
        >
          <path d="M6 1l1.545 3.13 3.455.502-2.5 2.436.59 3.44L6 8.893l-3.09 1.615.59-3.44L1 4.632l3.455-.502z" />
        </svg>
      ))}
      {title && (
        <span
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 10,
            fontWeight: 700,
            color: starColor,
            marginLeft: 2,
            letterSpacing: '0.5px',
          }}
        >
          {title}
        </span>
      )}
    </div>
  );
}

type UserInfoBlockProps = {
  user: KudosCard['sender'];
  align?: 'left' | 'right';
};

function UserInfoBlock({ user, align = 'left' }: UserInfoBlockProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'right' ? 'flex-end' : 'flex-start',
        gap: 6,
        flex: 1,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid #FFEA9E',
          flexShrink: 0,
          backgroundColor: '#1A2430',
        }}
      >
        <Image
          src={user.avatarUrl}
          alt={user.name}
          width={64}
          height={64}
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            // fallback to initials background
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      </div>
      {/* Name */}
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: 700,
          color: '#FFEA9E',
          textAlign: align,
        }}
      >
        {user.name}
      </span>
      {/* Department */}
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.6)',
          textAlign: align,
        }}
      >
        {user.department}
      </span>
      {/* Rank */}
      <RankBadge title={user.title} stars={user.rankStars} />
    </div>
  );
}

type KudosCardHighlightProps = {
  card: KudosCard;
  prominent?: boolean;
  onLike: (id: string) => void;
  onCopyLink: (id: string) => void;
};

export default function KudosCardHighlight({
  card,
  prominent = false,
  onLike,
  onCopyLink,
}: KudosCardHighlightProps) {
  const timeAgo = (() => {
    const diff = Date.now() - new Date(card.createdAt).getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Hôm nay';
    if (days === 1) return 'Hôm qua';
    return `${days} ngày trước`;
  })();

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 24px 16px 24px',
        borderRadius: 16,
        border: `4px solid ${prominent ? '#FFEA9E' : 'rgba(255,234,158,0.3)'}`,
        background: '#FFF8E1',
        flexShrink: 0,
        width: prominent ? 528 : 480,
        opacity: prominent ? 1 : 0.7,
        transform: prominent ? 'scale(1)' : 'scale(0.96)',
        transition: 'opacity 0.3s ease, transform 0.3s ease, border-color 0.3s ease',
      }}
    >
      {/* Sender → Receiver row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <UserInfoBlock user={card.sender} align="left" />

        {/* Arrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            paddingTop: 20,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path
              d="M6 16h20M20 10l6 6-6 6"
              stroke="#FFEA9E"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <UserInfoBlock user={card.receiver} align="right" />
      </div>

      {/* Time */}
      <p
        style={{
          margin: 0,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 12,
          fontWeight: 500,
          color: 'rgba(0,16,26,0.5)',
        }}
      >
        {timeAgo}
      </p>

      {/* Content */}
      <p
        style={{
          margin: 0,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: '#00101A',
          lineHeight: '22px',
          display: '-webkit-box',
          WebkitLineClamp: 4,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {card.content}
      </p>

      {/* Hashtags */}
      {card.hashtags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {card.hashtags.map((tag) => (
            <span
              key={tag}
              style={{
                fontFamily: 'Montserrat, sans-serif',
                fontSize: 12,
                fontWeight: 600,
                color: '#6D5B00',
                background: 'rgba(109,91,0,0.10)',
                borderRadius: 4,
                padding: '2px 8px',
              }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Action bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          paddingTop: 8,
          borderTop: '1px solid rgba(0,16,26,0.1)',
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
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            if (card.canLike) {
              (e.currentTarget as HTMLButtonElement).style.background =
                'rgba(0,16,26,0.06)';
            }
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'none';
          }}
        >
          <svg
            width="24"
            height="24"
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
          <span
            style={{
              fontFamily: 'Montserrat, sans-serif',
              fontSize: 13,
              fontWeight: 700,
              color: card.likedByMe ? '#E53935' : '#00101A',
            }}
          >
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
            background: 'rgba(0,16,26,0.06)',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 16px',
            borderRadius: 8,
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#00101A',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(0,16,26,0.12)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(0,16,26,0.06)';
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
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
          Sao chép link
        </button>

        {/* Xem chi tiết */}
        <a
          href={`/kudos/${card.id}`}
          style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: 13,
            fontWeight: 600,
            color: '#6D5B00',
            textDecoration: 'none',
            padding: '4px 0',
            borderBottom: '1px solid transparent',
            transition: 'border-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor =
              '#6D5B00';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLAnchorElement).style.borderBottomColor =
              'transparent';
          }}
        >
          Xem chi tiết
        </a>
      </div>
    </article>
  );
}
