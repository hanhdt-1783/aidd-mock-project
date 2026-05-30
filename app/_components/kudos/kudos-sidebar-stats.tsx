'use client';

import type { ReactNode } from 'react';
import type { SidebarStats } from './types';
import KudosDoubleHeartsBadge from './kudos-double-hearts-badge';

type StatRowProps = {
  label: string;
  value: number;
  /** Optional badge rendered between the label and the value (e.g. 🔥 x2). */
  badge?: ReactNode;
};

// One "label .... value" row. Matches Figma D.1.x: 40px tall, label left
// (22/700 white), value right (32/700 gold #FFEA9E).
function StatRow({ label, value, badge }: StatRowProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
        width: '100%',
        height: 40,
      }}
    >
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          minWidth: 0,
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          lineHeight: '28px',
          color: '#FFFFFF',
        }}
      >
        {label}
        {badge}
      </span>
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 32,
          fontWeight: 700,
          lineHeight: '40px',
          color: '#FFEA9E',
          flexShrink: 0,
        }}
      >
        {value}
      </span>
    </div>
  );
}

type KudosSidebarStatsProps = {
  stats: SidebarStats;
  onOpenGift: () => void;
};

export default function KudosSidebarStats({ stats, onOpenGift }: KudosSidebarStatsProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 16,
        padding: 24,
        borderRadius: 17,
        border: '1px solid #998C5F',
        background: '#00070C',
        width: '100%',
      }}
    >
      {/* D.1.2 / D.1.3 / D.1.4 */}
      <StatRow label="Số Kudos bạn nhận được:" value={stats.kudosReceived} />
      <StatRow label="Số Kudos bạn đã gửi:" value={stats.kudosSent} />
      <StatRow
        label="Số tim bạn nhận được:"
        value={stats.heartsReceived}
        badge={<KudosDoubleHeartsBadge />}
      />

      {/* D.1.5 Divider */}
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: 1,
          background: '#2E3940',
        }}
      />

      {/* D.1.6 / D.1.7 */}
      <StatRow label="Số Secret Box bạn đã mở:" value={stats.secretBoxesOpened} />
      <StatRow label="Số Secret Box chưa mở:" value={stats.secretBoxesUnopened} />

      {/* D.1.8 "Mở Secret Box" button — text left, gift icon right */}
      <button
        type="button"
        onClick={onOpenGift}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          height: 60,
          padding: 16,
          borderRadius: 8,
          border: 'none',
          background: '#FFEA9E',
          cursor: 'pointer',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 22,
          fontWeight: 700,
          lineHeight: '28px',
          color: '#00101A',
          transition: 'background 0.15s ease, transform 0.1s ease',
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#FFD54F';
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = '#FFEA9E';
        }}
        onMouseDown={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(0.98)';
        }}
        onMouseUp={(e) => {
          (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
        }}
      >
        Mở Secret Box
        {/* Gift icon (MM_MEDIA_Open Gift, Figma I2940:13497;186:1766) */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <path
            d="M22.5 10.3698L19.76 8.77984C20 8.56984 20.23 8.29984 20.4 7.99984C21.23 6.56984 20.74 4.72984 19.3 3.89984C18.44 3.39984 17.43 3.39984 16.58 3.75984L16.59 3.74984L15.71 4.13984L15.6 3.17984L15.59 3.18984C15.5 2.27984 14.97 1.39984 14.11 0.899841C12.67 0.0748415 10.84 0.569842 10 1.99984C9.83 2.29984 9.72 2.62984 9.66 2.94984L6.91 1.36984C5.95 0.819842 4.73 1.13984 4.18 2.09984L2.68 4.69984C2.4 5.17984 2.57 5.78984 3.05 6.05984L4.78 7.05984L9 9.49984H2.5V19.4998C2.5 20.6098 3.4 21.4998 4.5 21.4998H20.5C21.61 21.4998 22.5 20.6098 22.5 19.4998V14.3698L23.23 13.0998C23.78 12.1398 23.46 10.9198 22.5 10.3698ZM16.94 5.99984C17.21 5.49984 17.83 5.35984 18.3 5.62984C18.78 5.90984 18.95 6.49984 18.67 6.99984C18.39 7.49984 17.78 7.63984 17.3 7.36984C16.83 7.08984 16.66 6.49984 16.94 5.99984ZM14.57 8.09984L21.5 12.0998L20.5 13.8298L13.57 9.82984L14.57 8.09984ZM11.5 19.4998H4.5V11.4998H11.5V19.4998ZM11.84 8.82984L4.91 4.82984L5.91 3.09984L12.84 7.09984L11.84 8.82984ZM12.11 4.36984C11.63 4.08984 11.47 3.49984 11.74 2.99984C12 2.49984 12.63 2.35984 13.11 2.62984C13.59 2.90984 13.75 3.49984 13.47 3.99984C13.2 4.49984 12.59 4.63984 12.11 4.36984ZM13.5 19.4998V12.0998L20.5 16.1398V19.4998H13.5Z"
            fill="currentColor"
          />
        </svg>
      </button>
    </div>
  );
}
