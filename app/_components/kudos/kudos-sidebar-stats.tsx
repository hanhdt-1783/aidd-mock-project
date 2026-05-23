'use client';

import type { SidebarStats } from './types';

type StatRowProps = {
  label: string;
  value: number;
};

function StatRow({ label, value }: StatRowProps) {
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
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 14,
          fontWeight: 500,
          color: 'rgba(255,255,255,0.7)',
          flex: 1,
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 20,
          fontWeight: 700,
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
        gap: 16,
        padding: 24,
        borderRadius: 17,
        border: '1px solid #998C5F',
        background: '#00070C',
        width: '100%',
      }}
    >
      {/* Stats rows */}
      <StatRow label="Kudos đã nhận" value={stats.kudosReceived} />
      <StatRow label="Kudos đã gửi" value={stats.kudosSent} />

      {/* Divider */}
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: 1,
          background: '#2E3940',
        }}
      />

      <StatRow label="Trái tim đã nhận" value={stats.heartsReceived} />

      {/* Divider */}
      <div
        aria-hidden="true"
        style={{
          width: '100%',
          height: 1,
          background: '#2E3940',
        }}
      />

      <StatRow label="Hộp quà đã mở" value={stats.secretBoxesOpened} />
      <StatRow label="Hộp quà chưa mở" value={stats.secretBoxesUnopened} />

      {/* Mở quà button */}
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
          fontSize: 16,
          fontWeight: 700,
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
        {/* Gift icon */}
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M20 12v10H4V12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M22 7H2v5h20V7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 22V7"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Mở quà
      </button>
    </div>
  );
}
