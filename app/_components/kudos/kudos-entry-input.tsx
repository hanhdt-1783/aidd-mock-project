'use client';

type KudosEntryInputProps = {
  onAction: () => void;
};

export default function KudosEntryInput({ onAction }: KudosEntryInputProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        width: '100%',
        maxWidth: 738,
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
      aria-label="Viết lời cảm ơn đồng nghiệp"
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
      {/* Pen icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0, color: '#FFEA9E' }}
      >
        <path
          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Placeholder text */}
      <span
        style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: 16,
          fontWeight: 500,
          color: 'rgba(255, 234, 158, 0.6)',
          flex: 1,
          userSelect: 'none',
        }}
      >
        Viết lời cảm ơn tới đồng nghiệp của bạn...
      </span>

      {/* Search icon */}
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
        style={{ flexShrink: 0, color: 'rgba(255,234,158,0.5)' }}
      >
        <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
        <path
          d="M21 21l-4.35-4.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
