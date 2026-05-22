import { t, type Language } from "@/lib/i18n/dictionary";

type AwardsPageTitleProps = {
  lang: Language;
};

export default function AwardsPageTitle({ lang }: AwardsPageTitleProps) {
  return (
    <div
      className="w-full flex flex-col"
      style={{ gap: 16 }}
    >
      {/* Caption: Sun* Annual Awards 2025 */}
      <p
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: 24,
          fontWeight: 700,
          lineHeight: "32px",
          letterSpacing: 0,
          color: "#FFFFFF",
          margin: 0,
          textAlign: "center",
        }}
      >
        {t(lang, "awards.label")}
      </p>

      {/* Divider line */}
      <div
        aria-hidden="true"
        style={{
          width: "100%",
          height: 1,
          backgroundColor: "rgba(255,255,255,0.15)",
        }}
      />

      {/* Main title */}
      <h1
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(32px, 4vw, 57px)",
          fontWeight: 700,
          lineHeight: "1.12",
          letterSpacing: "-0.25px",
          color: "#FFEA9E",
          margin: 0,
        }}
      >
        {t(lang, "awards.title")}
      </h1>
    </div>
  );
}
