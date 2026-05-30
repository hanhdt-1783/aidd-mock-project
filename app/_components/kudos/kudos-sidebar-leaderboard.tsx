import type { ReactNode } from 'react';
import type { GiftRecipient } from './types';
import KudosAvatarHover from './kudos-avatar-hover';

type KudosSidebarLeaderboardProps = {
  title: ReactNode;
  recipients: GiftRecipient[];
};

// "10 SUNNER NHẬN QUÀ MỚI NHẤT" sidebar list (Figma D.3).
// Row = 64px avatar (white border) + gold name (22/700) + white prize (16/700).
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
      {/* D.3.1 Title */}
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

      {/* Recipients list — show 5 rows (5×64 + 4×16 gap = 384px), scroll the rest */}
      <ul
        className="kudos-leaderboard-scroll"
        style={{
          margin: 0,
          padding: 0,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          maxHeight: 384,
          overflowY: 'auto',
        }}
      >
        {recipients.map((recipient) => (
          <li key={recipient.id}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                height: 64,
              }}
            >
              {/* D.3.x Avatar — 64px, gold ring + profile preview on hover */}
              <KudosAvatarHover user={recipient.user} size={64} />

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
                    fontSize: 22,
                    fontWeight: 700,
                    lineHeight: '28px',
                    color: '#FFEA9E',
                    textDecoration: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'block',
                  }}
                >
                  {recipient.name}
                </a>
                <span
                  style={{
                    fontFamily: 'Montserrat, sans-serif',
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: '24px',
                    letterSpacing: '0.15px',
                    color: '#FFFFFF',
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
