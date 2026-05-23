import Image from 'next/image';
import type { ReactNode } from 'react';
import type { GiftRecipient } from './types';

type KudosSidebarLeaderboardProps = {
  title: ReactNode;
  recipients: GiftRecipient[];
};

export default function KudosSidebarLeaderboard({
  title,
  recipients,
}: KudosSidebarLeaderboardProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: '24px 16px 24px 24px',
        borderRadius: 17,
        border: '1px solid #998C5F',
        background: '#00070C',
        width: '100%',
      }}
    >
      {/* Title */}
      <h3
        style={{
          margin: 0,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          lineHeight: '28px',
          color: '#FFEA9E',
          textAlign: 'center',
        }}
      >
        {title}
      </h3>

      {/* Recipients list */}
      <ul
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {recipients.map((recipient, index) => (
          <li key={recipient.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
              }}
            >
              {/* Rank number */}
              <span
                style={{
                  fontFamily: 'Montserrat, sans-serif',
                  fontSize: 13,
                  fontWeight: 700,
                  color: index < 3 ? '#FFEA9E' : 'rgba(255,255,255,0.4)',
                  width: 20,
                  flexShrink: 0,
                  textAlign: 'center',
                }}
              >
                {index + 1}
              </span>

              {/* Avatar */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  border: `1px solid ${index < 3 ? '#FFEA9E' : 'rgba(255,234,158,0.2)'}`,
                  backgroundColor: '#1A2430',
                  flexShrink: 0,
                }}
              >
                <Image
                  src={recipient.avatarUrl}
                  alt={recipient.name}
                  width={40}
                  height={40}
                  style={{ objectFit: 'cover' }}
                />
              </div>

              {/* Name + prize */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  flex: 1,
                  minWidth: 0,
                }}
              >
                <a
                  href={`/profile/${recipient.id}`}
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    color: index < 3 ? '#FFEA9E' : 'rgba(255,255,255,0.87)',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                    transition: 'color 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color = '#FFEA9E';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.color =
                      index < 3 ? '#FFEA9E' : 'rgba(255,255,255,0.87)';
                  }}
                >
                  {recipient.name}
                </a>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 11,
                    fontWeight: 500,
                    color: 'rgba(255,255,255,0.45)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {recipient.prizeDescription}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
