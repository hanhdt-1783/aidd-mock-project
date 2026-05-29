import { t, type Language } from "@/lib/i18n/dictionary";
import type { AwardData } from "./awards-section";
import { LicenseIcon } from "./awards-icons";

type AwardsValueBlockProps = {
  lang: Language;
  award: Pick<
    AwardData,
    "valueKey" | "valueUnitKey" | "value2Key" | "value2UnitKey" | "orKey"
  >;
};

const LABEL_STYLE = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: 24,
  fontWeight: 700,
  lineHeight: "32px",
  color: "#FFEA9E",
} as const;

const AMOUNT_STYLE = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: 36,
  fontWeight: 700,
  lineHeight: "44px",
  color: "#FFFFFF",
} as const;

const UNIT_STYLE = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: 14,
  fontWeight: 700,
  lineHeight: "20px",
  letterSpacing: "0.1px",
  color: "#FFFFFF",
} as const;

const OR_STYLE = {
  fontFamily: "Montserrat, sans-serif",
  fontSize: 14,
  fontWeight: 700,
  lineHeight: "20px",
  letterSpacing: "0.1px",
  color: "rgba(255,255,255,0.4)",
} as const;

/** Prize value block — single value plus optional second tier for Signature 2025 Creator. */
export default function AwardsValueBlock({ lang, award }: AwardsValueBlockProps) {
  const { valueKey, valueUnitKey, value2Key, value2UnitKey, orKey } = award;
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {/* Value label — License/medal icon (Figma) + label, gold. */}
      <div className="flex items-center" style={{ gap: 8, color: "#FFFFFF" }}>
        <span className="shrink-0" aria-hidden="true">
          <LicenseIcon />
        </span>
        <span style={LABEL_STYLE}>{t(lang, "awards.section.value.label")}</span>
      </div>

      <div className="flex flex-col" style={{ gap: 4 }}>
        <span style={AMOUNT_STYLE}>{t(lang, valueKey)}</span>
        <span style={UNIT_STYLE}>{t(lang, valueUnitKey)}</span>
      </div>

      {value2Key && value2UnitKey && orKey && (
        <>
          <div className="flex items-center" style={{ gap: 16 }}>
            <span style={OR_STYLE}>{t(lang, orKey)}</span>
            <div
              aria-hidden="true"
              style={{ flex: 1, height: 1, backgroundColor: "#2E3940" }}
            />
          </div>
          <div className="flex flex-col" style={{ gap: 4 }}>
            <span style={AMOUNT_STYLE}>{t(lang, value2Key)}</span>
            <span style={UNIT_STYLE}>{t(lang, value2UnitKey)}</span>
          </div>
        </>
      )}
    </div>
  );
}
