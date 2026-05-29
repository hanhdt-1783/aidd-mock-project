import Image from "next/image";
import { t, type Language } from "@/lib/i18n/dictionary";
import AwardsValueBlock from "./awards-value-block";
import { TargetIcon, DiamondIcon } from "./awards-icons";

export type AwardData = {
  slug: string;
  /** Image on left of content on lg+ (true) or on right (false). Mobile always stacks image on top. */
  imageLeft: boolean;
  imageSrc: string;
  titleKey:
    | "awards.section.top-talent.title"
    | "awards.section.top-project.title"
    | "awards.section.top-project-leader.title"
    | "awards.section.best-manager.title"
    | "awards.section.signature-2025-creator.title"
    | "awards.section.mvp.title";
  descriptionKey:
    | "awards.section.top-talent.description"
    | "awards.section.top-project.description"
    | "awards.section.top-project-leader.description"
    | "awards.section.best-manager.description"
    | "awards.section.signature-2025-creator.description"
    | "awards.section.mvp.description";
  countKey:
    | "awards.section.top-talent.count"
    | "awards.section.top-project.count"
    | "awards.section.top-project-leader.count"
    | "awards.section.best-manager.count"
    | "awards.section.signature-2025-creator.count"
    | "awards.section.mvp.count";
  countUnitKey:
    | "awards.section.top-talent.count_unit"
    | "awards.section.top-project.count_unit"
    | "awards.section.top-project-leader.count_unit"
    | "awards.section.best-manager.count_unit"
    | "awards.section.signature-2025-creator.count_unit"
    | "awards.section.mvp.count_unit";
  valueKey:
    | "awards.section.top-talent.value"
    | "awards.section.top-project.value"
    | "awards.section.top-project-leader.value"
    | "awards.section.best-manager.value"
    | "awards.section.signature-2025-creator.value"
    | "awards.section.mvp.value";
  valueUnitKey:
    | "awards.section.top-talent.value_unit"
    | "awards.section.top-project.value_unit"
    | "awards.section.top-project-leader.value_unit"
    | "awards.section.best-manager.value_unit"
    | "awards.section.signature-2025-creator.value_unit"
    | "awards.section.mvp.value_unit";
  /** Only for Signature 2025 Creator — second tier prize. */
  value2Key?: "awards.section.signature-2025-creator.value2";
  value2UnitKey?: "awards.section.signature-2025-creator.value2_unit";
  orKey?: "awards.section.signature-2025-creator.or";
};

type AwardsSectionProps = {
  lang: Language;
  award: AwardData;
  /** Last award (MVP): skip the bottom divider — Figma mms_D.6_MVP has no
      Rectangle 14, so no line between the last award and the Kudos section. */
  isLast?: boolean;
};

const DIVIDER_STYLE = {
  width: "100%",
  height: 1,
  backgroundColor: "#2E3940",
} as const;

export default function AwardsSection({ lang, award, isLast = false }: AwardsSectionProps) {
  const { slug, imageLeft, imageSrc, titleKey, descriptionKey, countKey, countUnitKey } = award;

  return (
    <section
      id={slug}
      aria-label={t(lang, titleKey)}
      className="w-full"
      style={{ scrollMarginTop: 120 }}
    >
      {/* Layout: stacked on mobile, side-by-side on lg+; flex-row-reverse flips
          the image to the right when imageLeft=false. Mobile always stacks
          image-on-top because flex-col + the image being the first child. */}
      <div
        className={`flex flex-col lg:flex-row items-start ${imageLeft ? "" : "lg:flex-row-reverse"}`}
        style={{ gap: 40 }}
      >
        {/* Image */}
        <div
          aria-hidden="true"
          // Stacked layout (< lg): full-width but capped near the design size
          // (336px) so the orb doesn't balloon on tablet; on lg+ it's the fixed
          // 336×336 beside the text.
          className="shrink-0 w-full max-w-[360px] aspect-square lg:max-w-none lg:w-[336px] lg:h-[336px]"
          style={{
            borderRadius: 24,
            border: "0.955px solid #FFEA9E",
            boxShadow: "0 4px 4px 0 rgba(0,0,0,0.25), 0 0 6px 0 #FAE287",
            overflow: "hidden",
            position: "relative",
            backgroundColor: "#0A1A26",
          }}
        >
          <Image
            src={imageSrc}
            alt={t(lang, titleKey)}
            fill
            sizes="336px"
            className="object-cover"
            // Serve the raw file (skip Next image-optimizer): the thumbnails
            // are already 672px (shown ≤336@2x) so optimization adds nothing,
            // and it avoids the optimizer's URL-keyed cache serving a stale
            // version after a thumbnail is replaced.
            unoptimized
          />
        </div>

        {/* Content */}
        <div className="flex flex-col" style={{ gap: 32, flex: 1, minWidth: 0 }}>
          <div className="flex flex-col" style={{ gap: 24 }}>
            {/* Title row — Target icon (Figma) + title, gold. */}
            <div
              className="flex items-center"
              style={{ gap: 8, color: "#FFFFFF" }}
            >
              <span className="shrink-0" aria-hidden="true">
                <TargetIcon />
              </span>
              <h2
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  lineHeight: "32px",
                  color: "#FFEA9E",
                  margin: 0,
                }}
              >
                {t(lang, titleKey)}
              </h2>
            </div>
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
              {t(lang, descriptionKey)}
            </p>
          </div>

          <div aria-hidden="true" style={DIVIDER_STYLE} />

          {/* Count row — Diamond icon (Figma) + label, gold. */}
          <div className="flex items-center" style={{ gap: 16 }}>
            <div className="flex items-center" style={{ gap: 8, color: "#FFFFFF" }}>
              <span className="shrink-0" aria-hidden="true">
                <DiamondIcon />
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
                {t(lang, "awards.section.count.label")}
              </span>
            </div>
            <div className="flex items-center" style={{ gap: 8 }}>
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 36,
                  fontWeight: 700,
                  lineHeight: "44px",
                  color: "#FFFFFF",
                }}
              >
                {t(lang, countKey)}
              </span>
              <span
                style={{
                  fontFamily: "Montserrat, sans-serif",
                  fontSize: 14,
                  fontWeight: 700,
                  lineHeight: "20px",
                  letterSpacing: "0.1px",
                  color: "#FFFFFF",
                }}
              >
                {t(lang, countUnitKey)}
              </span>
            </div>
          </div>

          <div aria-hidden="true" style={DIVIDER_STYLE} />

          <AwardsValueBlock lang={lang} award={award} />
        </div>
      </div>

      {!isLast && (
        <div
          aria-hidden="true"
          style={{ ...DIVIDER_STYLE, marginTop: 80 }}
        />
      )}
    </section>
  );
}
