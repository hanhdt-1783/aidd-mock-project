import { t, type Language } from '@/lib/i18n/dictionary';

type KudosEmptyStateProps = {
  lang: Language;
};

export default function KudosEmptyState({ lang }: KudosEmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px',
        borderRadius: 16,
        border: '1px dashed #998C5F',
        color: 'rgba(255,255,255,0.5)',
        fontFamily: 'Montserrat, sans-serif',
        fontSize: 16,
        fontWeight: 600,
        textAlign: 'center',
        width: '100%',
      }}
    >
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        style={{ marginBottom: 16, opacity: 0.4 }}
      >
        <circle cx="24" cy="24" r="22" stroke="#FFEA9E" strokeWidth="2" />
        <path
          d="M16 24c0-4.418 3.582-8 8-8s8 3.582 8 8"
          stroke="#FFEA9E"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="22" r="2" fill="#FFEA9E" />
        <circle cx="30" cy="22" r="2" fill="#FFEA9E" />
      </svg>
      <p style={{ margin: 0 }}>{t(lang, 'kudos.empty.list')}</p>
    </div>
  );
}
