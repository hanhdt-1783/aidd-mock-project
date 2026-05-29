import Image from "next/image";
import Link from "next/link";
import { t, type Language } from "@/lib/i18n/dictionary";
import HomeCountdown from "./home-countdown";

type HomeHeroProps = {
  lang: Language;
};

function ArrowUpRightIcon() {
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
        d="M7 17L17 7M17 7H7M17 7V17"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomeHero({ lang }: HomeHeroProps) {
  return (
    <section
      aria-label={t(lang, "aria.home.hero")}
      className="relative w-full"
    >
      {/* Background image + dark gradient live on the page wrapper now —
          this section is transparent so content sits on the unified backdrop. */}

      {/* Content wrapper — fills outer padded area so left/right edges align
          with header/footer at every viewport. */}
      <div
        className="relative z-10 flex flex-col px-6 sm:px-12 lg:px-60 xl:px-72"
        style={{
          gap: "clamp(24px, 5vw, 40px)",
          paddingTop: "clamp(96px, 12vw, 144px)",
          paddingBottom: "clamp(48px, 8vw, 96px)",
        }}
      >
        {/* ROOT FURTHER logo — scales down on mobile */}
        <div style={{ width: "100%", maxWidth: 451, aspectRatio: "451 / 200" }}>
          <Image
            src="/home/root-further-logo.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="object-contain w-full h-auto"
          />
        </div>

        {/* Countdown + event info block */}
        <div className="flex flex-col" style={{ gap: 16 }}>
          <HomeCountdown lang={lang} />

          {/* Event info */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            {/* Time + Location — same row, Livestream-style typography */}
            <div
              className="flex flex-wrap items-center"
              style={{ gap: "clamp(16px, 4vw, 40px)" }}
            >
              {/* Time (date string) */}
              <div className="flex items-center" style={{ gap: 14 }}>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: "24px",
                    letterSpacing: "0.15px",
                    color: "#FFFFFF",
                  }}
                >
                  {t(lang, "home.hero.event.time.label")}
                </span>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "clamp(18px, 3.5vw, 24px)",
                    fontWeight: 700,
                    lineHeight: "1.33",
                    letterSpacing: "0px",
                    color: "#FFEA9E",
                  }}
                >
                  {t(lang, "home.hero.event.time")}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center" style={{ gap: 14 }}>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 16,
                    fontWeight: 700,
                    lineHeight: "24px",
                    letterSpacing: "0.15px",
                    color: "#FFFFFF",
                  }}
                >
                  {t(lang, "home.hero.event.location.label")}
                </span>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: "clamp(18px, 3.5vw, 24px)",
                    fontWeight: 700,
                    lineHeight: "1.33",
                    letterSpacing: "0px",
                    color: "#FFEA9E",
                  }}
                >
                  {t(lang, "home.hero.event.location")}
                </span>
              </div>
            </div>

            {/* Livestream */}
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 16,
                fontWeight: 700,
                lineHeight: "24px",
                letterSpacing: "0.5px",
                color: "#FFFFFF",
              }}
            >
              {t(lang, "home.hero.event.livestream")}
            </span>
          </div>
        </div>

        {/* CTA buttons — filled yellow style matching Sun* Kudos section "Chi tiết". */}
        <div
          className="flex flex-wrap items-center"
          style={{ gap: "clamp(16px, 4vw, 40px)" }}
        >
          {/* About Awards — filled variant per Figma 2167:9063 */}
          <Link
            href="/awards"
            className="inline-flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
            style={{
              padding: "16px 24px",
              borderRadius: 8,
              backgroundColor: "#FFEA9E",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: "28px",
              color: "#00101A",
              textDecoration: "none",
              height: 60,
              justifyContent: "center",
            }}
          >
            <span>{t(lang, "home.hero.cta.about")}</span>
            <ArrowUpRightIcon />
          </Link>

          {/* About Kudos — outline variant per Figma 2167:9064 */}
          <Link
            href="/kudos"
            className="inline-flex items-center justify-center gap-2 transition-all duration-200 hover:bg-[rgba(255,234,158,0.20)] hover:-translate-y-0.5 active:scale-95"
            style={{
              padding: "16px 24px",
              borderRadius: 8,
              border: "1px solid #998C5F",
              backgroundColor: "rgba(255, 234, 158, 0.10)",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 22,
              fontWeight: 700,
              lineHeight: "28px",
              color: "#FFFFFF",
              textDecoration: "none",
              height: 60,
              justifyContent: "center",
            }}
          >
            <span>{t(lang, "home.hero.cta.kudos")}</span>
            <ArrowUpRightIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
