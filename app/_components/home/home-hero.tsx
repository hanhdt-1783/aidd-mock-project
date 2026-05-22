import Image from "next/image";
import Link from "next/link";
import { t, type Language } from "@/lib/i18n/dictionary";
import HomeCountdown from "./home-countdown";

type HomeHeroProps = {
  lang: Language;
  /** ISO target for countdown. null when env unset/invalid. */
  countdownTargetIso?: string | null;
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
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function HomeHero({ lang, countdownTargetIso }: HomeHeroProps) {
  return (
    <section
      aria-label="Hero — Root Further"
      className="relative w-full overflow-hidden"
      style={{ minHeight: 900, backgroundColor: "#00101A" }}
    >
      {/* Background keyvisual — decorative root pattern */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/home/keyvisual-bg.png')" }}
      />

      {/* Dark overlay for legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,16,26,0.50) 0%, rgba(0,16,26,0.20) 50%, rgba(0,16,26,0.85) 100%)",
        }}
      />

      {/* Content wrapper */}
      <div
        className="relative z-10 flex flex-col px-6 sm:px-10 lg:px-36"
        style={{ gap: 40, paddingTop: 184, paddingBottom: 96 }}
      >
        {/* ROOT FURTHER logo */}
        <div style={{ width: 451, height: 200 }}>
          <Image
            src="/home/root-further-logo.png"
            alt="ROOT FURTHER"
            width={451}
            height={200}
            priority
            className="object-contain"
          />
        </div>

        {/* Countdown + event info block */}
        <div className="flex flex-col" style={{ gap: 40 }}>
          <HomeCountdown lang={lang} targetIso={countdownTargetIso} />

          {/* Event info */}
          <div className="flex flex-col" style={{ gap: 8 }}>
            {/* Date + time row */}
            <div className="flex flex-wrap items-center" style={{ gap: 60 }}>
              <div className="flex items-center" style={{ gap: 14 }}>
                {/* Date pill */}
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: "32px",
                    color: "#FFFFFF",
                    opacity: 0.6,
                  }}
                >
                  {t(lang, "home.hero.event.date.label")}
                </span>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: "32px",
                    color: "#FFEA9E",
                  }}
                >
                  {t(lang, "home.hero.event.date")}
                </span>
              </div>

              {/* Time */}
              <div className="flex items-center" style={{ gap: 14 }}>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: "32px",
                    color: "#FFFFFF",
                    opacity: 0.6,
                  }}
                >
                  {t(lang, "home.hero.event.time.label")}
                </span>
                <span
                  style={{
                    fontFamily: "Montserrat, sans-serif",
                    fontSize: 24,
                    fontWeight: 700,
                    lineHeight: "32px",
                    color: "#FFEA9E",
                  }}
                >
                  {t(lang, "home.hero.event.time")}
                </span>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-center" style={{ gap: 14 }}>
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: "32px",
                  color: "#FFFFFF",
                  opacity: 0.6,
                }}
              >
                {t(lang, "home.hero.event.location.label")}
              </span>
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: "32px",
                  color: "#FFEA9E",
                }}
              >
                {t(lang, "home.hero.event.location")}
              </span>
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

        {/* CTA buttons */}
        <div className="flex flex-wrap items-center" style={{ gap: 40 }}>
          {/* About Awards — filled yellow */}
          <Link
            href="/awards"
            className="flex items-center gap-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
            style={{
              padding: "16px 24px",
              borderRadius: 8,
              backgroundColor: "#FFEA9E",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              lineHeight: "24px",
              letterSpacing: "0.5px",
              color: "#00101A",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              width: 276,
              height: 60,
            }}
          >
            <span>{t(lang, "home.hero.cta.about")}</span>
            <ArrowUpRightIcon />
          </Link>

          {/* About Kudos — outline */}
          <Link
            href="/kudos"
            className="flex items-center gap-2 transition-all duration-200 hover:bg-[rgba(255,234,158,0.20)] active:scale-95"
            style={{
              padding: "16px 24px",
              borderRadius: 8,
              border: "1px solid #998C5F",
              backgroundColor: "rgba(255,234,158,0.10)",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              lineHeight: "24px",
              letterSpacing: "0.5px",
              color: "#FFEA9E",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              height: 60,
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
