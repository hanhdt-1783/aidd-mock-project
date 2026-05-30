'use client';

import { t, type Language } from '@/lib/i18n/dictionary';

type KudosSearchInputProps = {
  lang: Language;
  /** Optional handler — wired when profile search lands. Presentational for now. */
  onAction?: () => void;
};

/**
 * "Tìm kiếm profile Sunner" pill — sits beside the entry pill over the hero.
 * Figma node 2940:13450 (Tìm kiếm sunner): 381px, search icon + label,
 * same secondary-button styling as the entry pill.
 */
export default function KudosSearchInput({ lang, onAction }: KudosSearchInputProps) {
  const placeholder = t(lang, 'kudos.hero.search.placeholder');

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        flex: '0 1 381px',
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
          onAction?.();
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
      {/* Search icon — exact Figma asset MM_MEDIA_Search (filled, white) */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0, color: '#FFFFFF' }}
      >
        <path
          d="M9.5 3C11.2239 3 12.8772 3.68482 14.0962 4.90381C15.3152 6.12279 16 7.77609 16 9.5C16 11.11 15.41 12.59 14.44 13.73L14.71 14H15.5L20.5 19L19 20.5L14 15.5V14.71L13.73 14.44C12.59 15.41 11.11 16 9.5 16C7.77609 16 6.12279 15.3152 4.90381 14.0962C3.68482 12.8772 3 11.2239 3 9.5C3 7.77609 3.68482 6.12279 4.90381 4.90381C6.12279 3.68482 7.77609 3 9.5 3ZM9.5 5C7 5 5 7 5 9.5C5 12 7 14 9.5 14C12 14 14 12 14 9.5C14 7 12 5 9.5 5Z"
          fill="currentColor"
        />
      </svg>

      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 700,
          lineHeight: '24px',
          letterSpacing: '0.15px',
          color: '#FFFFFF',
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
