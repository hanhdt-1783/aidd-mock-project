/**
 * One time unit block: two digit tiles side-by-side + label underneath.
 *
 * Figma nodes: 1_Days / 2_Hours / 3_Minutes
 * Block size: 175×192px (desktop), gap 21px between tiles row and label
 * Tiles row: two 77×123px tiles, gap 21px
 * Label: Montserrat 700 36px/48px (desktop), scales down via clamp on smaller viewports
 */

import PrelaunchDigitTile from "./prelaunch-digit-tile";

type PrelaunchCountdownUnitProps = {
  /** Two-character padded display value, e.g. "05" */
  display: string;
  /** Uppercase label e.g. "DAYS" */
  label: string;
};

export default function PrelaunchCountdownUnit({
  display,
  label,
}: PrelaunchCountdownUnitProps) {
  const [d1, d2] = display.length >= 2 ? [display[0], display[1]] : ["0", display[0] ?? "0"];

  return (
    <div className="flex flex-col" style={{ gap: "clamp(12px, 1.5vw, 21px)" }}>
      {/* Two digit tiles */}
      <div
        className="flex items-center"
        style={{ gap: "clamp(8px, 1.5vw, 21px)" }}
      >
        <PrelaunchDigitTile digit={d1} />
        <PrelaunchDigitTile digit={d2} />
      </div>

      {/* Unit label */}
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(16px, 2.5vw, 36px)",
          fontWeight: 700,
          lineHeight: 1.33,
          color: "#FFFFFF",
          letterSpacing: 0,
          userSelect: "none",
        }}
      >
        {label}
      </span>
    </div>
  );
}
