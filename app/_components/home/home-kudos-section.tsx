import Image from "next/image";
import Link from "next/link";
import { t, type Language } from "@/lib/i18n/dictionary";

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

type HomeKudosSectionProps = {
  lang: Language;
};

export default function HomeKudosSection({ lang }: HomeKudosSectionProps) {
  return (
    <section
      id="kudos"
      aria-label={t(lang, "home.kudos.title")}
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Desktop: fixed-height banner with absolute positioned content */}
      <div
        className="relative mx-auto hidden sm:block"
        style={{ maxWidth: 1120, height: 500 }}
      >
        {/* Background image */}
        <Image
          src="/home/kudos-bg.png"
          alt=""
          fill
          sizes="1120px"
          className="object-cover"
          aria-hidden="true"
        />

        {/* Dark overlay */}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,16,26,0.95) 0%, rgba(0,16,26,0.70) 55%, rgba(0,16,26,0.10) 100%)",
          }}
        />

        {/* Content — left side */}
        <div
          className="relative z-10 flex flex-col justify-center"
          style={{
            position: "absolute",
            left: 64,
            top: 0,
            bottom: 0,
            width: 457,
            gap: 32,
          }}
        >
          <KudosContent lang={lang} />
        </div>

        {/* Kudos logo — right side */}
        <div
          className="absolute"
          style={{ right: 40, top: "50%", transform: "translateY(-50%)" }}
        >
          <Image
            src="/home/kudos-logo.svg"
            alt="Sun* Kudos"
            width={364}
            height={72}
            className="object-contain"
          />
        </div>
      </div>

      {/* Mobile: stacked layout */}
      <div
        className="relative sm:hidden"
        style={{ backgroundColor: "#00101A" }}
      >
        {/* Background image */}
        <div className="relative w-full" style={{ height: 200 }}>
          <Image
            src="/home/kudos-bg.png"
            alt=""
            fill
            sizes="375px"
            className="object-cover object-right"
            aria-hidden="true"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,16,26,0.10) 0%, rgba(0,16,26,0.95) 100%)",
            }}
          />
          {/* Kudos logo centred on the image */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Image
              src="/home/kudos-logo.svg"
              alt="Sun* Kudos"
              width={200}
              height={40}
              className="object-contain"
            />
          </div>
        </div>

        {/* Text content below image */}
        <div className="flex flex-col px-6" style={{ gap: 32, paddingTop: 32, paddingBottom: 48 }}>
          <KudosContent lang={lang} />
        </div>
      </div>
    </section>
  );
}

function KudosContent({ lang }: { lang: Language }) {
  return (
    <>
      {/* Text block */}
      <div className="flex flex-col" style={{ gap: 16 }}>
        {/* Label */}
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: "32px",
            color: "#FFFFFF",
          }}
        >
          {t(lang, "home.kudos.label")}
        </span>

        {/* Title */}
        <h2
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 57,
            fontWeight: 700,
            lineHeight: "64px",
            letterSpacing: "-0.25px",
            color: "#FFEA9E",
            margin: 0,
          }}
        >
          {t(lang, "home.kudos.title")}
        </h2>

        {/* Description */}
        <p
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: "24px",
            letterSpacing: "0.5px",
            color: "#FFFFFF",
            margin: 0,
            textAlign: "justify",
          }}
        >
          <span
            style={{
              display: "block",
              fontWeight: 800,
              color: "#FFFFFF",
              marginBottom: 4,
            }}
          >
            {t(lang, "home.kudos.highlight")}
          </span>
          {t(lang, "home.kudos.description")}
        </p>
      </div>

      {/* CTA button */}
      <div>
        <Link
          href="/kudos"
          className="inline-flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 hover:-translate-y-0.5 active:scale-95"
          style={{
            padding: 16,
            borderRadius: 4,
            backgroundColor: "#FFEA9E",
            fontFamily: "Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: "24px",
            color: "#00101A",
            textDecoration: "none",
            width: 126,
            height: 56,
            justifyContent: "center",
          }}
        >
          {t(lang, "home.kudos.cta")}
          <ArrowUpRightIcon />
        </Link>
      </div>
    </>
  );
}
