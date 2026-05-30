'use client';

import { t, type Language } from '@/lib/i18n/dictionary';

type KudosEntryInputProps = {
  lang: Language;
  onAction: () => void;
};

export default function KudosEntryInput({ lang, onAction }: KudosEntryInputProps) {
  const placeholder = t(lang, 'kudos.hero.input.placeholder');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flex: '1 1 738px',
        maxWidth: 738,
        minWidth: 0,
        height: 72,
        padding: '24px 16px',
        borderRadius: 68,
        border: '1px solid #998C5F',
        background: 'rgba(255, 234, 158, 0.10)',
        cursor: 'pointer',
        transition: 'background 0.2s ease, border-color 0.2s ease',
      }}
      role="button"
      tabIndex={0}
      aria-label={placeholder}
      onClick={onAction}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onAction();
        }
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          'rgba(255, 234, 158, 0.18)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#FFEA9E';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.background =
          'rgba(255, 234, 158, 0.10)';
        (e.currentTarget as HTMLDivElement).style.borderColor = '#998C5F';
      }}
    >
      {/* Pen icon — exact Figma asset MM_MEDIA_Pen (filled, white) */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0, color: '#FFFFFF' }}
      >
        <path
          d="M20.8067 6.72951C21.1967 6.33951 21.1967 5.68951 20.8067 5.31951L18.4667 2.97951C18.0967 2.58951 17.4467 2.58951 17.0567 2.97951L15.2167 4.80951L18.9667 8.55951M3.09668 16.9395V20.6895H6.84668L17.9067 9.61951L14.1567 5.86951L3.09668 16.9395Z"
          fill="currentColor"
        />
      </svg>

      {/* Prompt text — matches Figma node I2940:13449;186:2760 */}
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: '24px',
          letterSpacing: '0.15px',
          color: '#FFFFFF',
          flex: 1,
          minWidth: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          userSelect: 'none',
        }}
      >
        {placeholder}
      </span>
    </div>
  );
}
