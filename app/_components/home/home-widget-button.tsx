import { t, type Language } from "@/lib/i18n/dictionary";

function PenIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M12 20h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SaaIcon() {
  return (
    <svg
      width="20"
      height="18"
      viewBox="0 0 20 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Simplified SAA trophy/shield icon placeholder — orchestrator can replace with real SVG from Figma */}
      <path
        d="M10 1L12.39 7.26L19 8.27L14.5 12.64L15.78 19.02L10 16L4.22 19.02L5.5 12.64L1 8.27L7.61 7.26L10 1Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type HomeWidgetButtonProps = {
  lang: Language;
};

export default function HomeWidgetButton({ lang }: HomeWidgetButtonProps) {
  return (
    <div
      className="fixed z-50"
      style={{ bottom: 32, right: 32 }}
    >
      <button
        type="button"
        aria-label={t(lang, "home.widget.label")}
        className="flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E]/60"
        style={{
          width: 105,
          height: 64,
          borderRadius: 32,
          backgroundColor: "#FFEA9E",
          color: "#00101A",
          border: "none",
          cursor: "pointer",
          boxShadow: "0 4px 16px rgba(0,0,0,0.32)",
        }}
      >
        <PenIcon />
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: "24px",
            color: "#00101A",
            userSelect: "none",
          }}
        >
          /
        </span>
        <SaaIcon />
      </button>
    </div>
  );
}
