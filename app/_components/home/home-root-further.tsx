import Image from "next/image";
import { t, type Language } from "@/lib/i18n/dictionary";

type HomeRootFurtherProps = {
  lang: Language;
};

export default function HomeRootFurther({ lang }: HomeRootFurtherProps) {
  return (
    <section
      aria-label={t(lang, "aria.home.root-further")}
      className="relative w-full"
    >
      <div
        className="relative mx-auto flex flex-col items-center w-full"
        style={{
          maxWidth: 1152,
          paddingTop: 24,
          paddingBottom: "clamp(40px, 7vw, 80px)",
          gap: "clamp(20px, 4vw, 32px)",
        }}
      >
        {/* ROOT FURTHER headline — two stacked prominent text images.
            Figma node 3204:10153 (Group 434): ROOT 189x67 centered above FURTHER 290x67. */}
        <div className="relative z-10 flex flex-col items-center" style={{ gap: 0 }}>
          <Image
            src="/home/root-text.png"
            alt="ROOT"
            width={189}
            height={67}
            className="object-contain"
            priority
          />
          <Image
            src="/home/further-text.png"
            alt="FURTHER"
            width={290}
            height={67}
            className="object-contain"
            priority
          />
        </div>

        {/* Body text content */}
        <div
          className="relative z-10 flex flex-col"
          style={{ gap: 32, width: "100%" }}
        >
          {/* Paragraph 1 — Figma 3204:10156: 24/32/letterSpacing 0 */}
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(16px, 3vw, 24px)",
              fontWeight: 700,
              lineHeight: "1.4",
              letterSpacing: "0px",
              color: "#FFFFFF",
              whiteSpace: "pre-line",
              textAlign: "justify",
            }}
          >
            {t(lang, "home.root.body1")}
          </p>

          {/* Quote — line 1 24/32 (matches paragraphs); line 2 16/24 (smaller per user). */}
          <blockquote
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontWeight: 700,
              color: "#FFFFFF",
              textAlign: "center",
              margin: 0,
              padding: 0,
              borderLeft: "none",
            }}
          >
            {t(lang, "home.root.quote")
              .split("\n")
              .map((line, idx) => (
                <div
                  key={idx}
                  style={{
                    fontSize:
                      idx === 0 ? "clamp(16px, 3vw, 24px)" : "clamp(14px, 2.2vw, 16px)",
                    lineHeight: "1.4",
                    letterSpacing: "0px",
                  }}
                >
                  {line}
                </div>
              ))}
          </blockquote>

          {/* Paragraph 2 — Figma 3204:10162: 24/32/letterSpacing 0 */}
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(16px, 3vw, 24px)",
              fontWeight: 700,
              lineHeight: "1.4",
              letterSpacing: "0px",
              color: "#FFFFFF",
              whiteSpace: "pre-line",
              textAlign: "justify",
            }}
          >
            {t(lang, "home.root.body2")}
          </p>
        </div>
      </div>
    </section>
  );
}
