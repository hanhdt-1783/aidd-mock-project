import { t, type Language } from "@/lib/i18n/dictionary";
import HomeAwardCard, { type AwardCardData } from "./home-award-card";

// Card photos are shared with the Awards page (/shared/<slug>-v2.png) — the
// orb + award name are baked into each image, so no separate name overlay.
const AWARDS: AwardCardData[] = [
  { slug: "top-talent", titleKey: "home.awards.top-talent.title", descriptionKey: "home.awards.top-talent.description" },
  { slug: "top-project", titleKey: "home.awards.top-project.title", descriptionKey: "home.awards.top-project.description" },
  { slug: "top-project-leader", titleKey: "home.awards.top-project-leader.title", descriptionKey: "home.awards.top-project-leader.description" },
  { slug: "best-manager", titleKey: "home.awards.best-manager.title", descriptionKey: "home.awards.best-manager.description" },
  { slug: "signature-2025-creator", titleKey: "home.awards.signature-2025-creator.title", descriptionKey: "home.awards.signature-2025-creator.description" },
  { slug: "mvp", titleKey: "home.awards.mvp.title", descriptionKey: "home.awards.mvp.description" },
];

type HomeAwardsSectionProps = {
  lang: Language;
};

export default function HomeAwardsSection({ lang }: HomeAwardsSectionProps) {
  return (
    <section
      id="awards"
      aria-label={t(lang, "home.awards.title")}
      className="w-full"
      style={{ backgroundColor: "#00101A" }}
    >
      <div
        className="flex flex-col w-full"
        style={{ gap: "clamp(40px, 8vw, 80px)", padding: "0" }}
      >
        {/* Section header */}
        <div className="flex flex-col" style={{ gap: 16 }}>
          {/* Caption */}
          <span
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(18px, 3.5vw, 24px)",
              fontWeight: 700,
              lineHeight: "1.33",
              color: "#FFFFFF",
            }}
          >
            {t(lang, "home.awards.caption")}
          </span>

          {/* Divider line */}
          <div
            aria-hidden="true"
            style={{ height: 1, backgroundColor: "#2E3940", width: "100%" }}
          />

          {/* Title — Figma 2167:9073 — scales down on narrow viewports, wraps if needed */}
          <h2
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(32px, 6vw, 57px)",
              fontWeight: 700,
              lineHeight: "1.12",
              letterSpacing: "-0.25px",
              color: "#FFEA9E",
              margin: 0,
            }}
          >
            {t(lang, "home.awards.title")}
          </h2>
        </div>

        {/* Awards grid — 3 cols desktop, 2 cols tablet, 1 col mobile */}
        <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {AWARDS.map((award) => (
            <HomeAwardCard key={award.slug} lang={lang} award={award} />
          ))}
        </div>
      </div>
    </section>
  );
}
