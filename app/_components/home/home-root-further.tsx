import Image from "next/image";
import { t, type Language } from "@/lib/i18n/dictionary";

type HomeRootFurtherProps = {
  lang: Language;
};

export default function HomeRootFurther({ lang }: HomeRootFurtherProps) {
  return (
    <section
      id="about-saa-2025"
      aria-label="Root Further — content"
      className="relative w-full"
      style={{
        backgroundColor: "#00101A",
        padding: "0",
      }}
    >
      {/* Outer frame with rounded border */}
      <div
        className="relative mx-auto flex flex-col items-center px-6 sm:px-16 lg:px-[104px]"
        style={{
          maxWidth: 1152,
          borderRadius: 8,
          paddingTop: 80,
          paddingBottom: 80,
          gap: 32,
          overflow: "hidden",
        }}
      >
        {/* Decorative background ROOT / FURTHER text images */}
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none"
          style={{ zIndex: 0, opacity: 0.06 }}
        >
          <Image
            src="/home/root-text.png"
            alt=""
            width={189}
            height={67}
            className="object-contain"
          />
          <Image
            src="/home/further-text.png"
            alt=""
            width={290}
            height={67}
            className="object-contain"
            style={{ marginTop: 0 }}
          />
        </div>

        {/* Body text content */}
        <div
          className="relative z-10 flex flex-col"
          style={{ gap: 32, width: "100%" }}
        >
          {/* Paragraph 1 */}
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              lineHeight: "24px",
              letterSpacing: "0.5px",
              color: "#FFFFFF",
              whiteSpace: "pre-line",
              textAlign: "justify",
            }}
          >
            {t(lang, "home.root.body1")}
          </p>

          {/* Quote */}
          <blockquote
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              lineHeight: "24px",
              letterSpacing: "0.5px",
              color: "#FFEA9E",
              whiteSpace: "pre-line",
              margin: 0,
              padding: 0,
              borderLeft: "none",
              fontStyle: "italic",
            }}
          >
            {t(lang, "home.root.quote")}
          </blockquote>

          {/* Paragraph 2 */}
          <p
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: 16,
              fontWeight: 700,
              lineHeight: "24px",
              letterSpacing: "0.5px",
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
