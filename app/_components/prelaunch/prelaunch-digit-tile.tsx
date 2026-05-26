/**
 * Single LED-style digit tile for the prelaunch countdown.
 *
 * Figma node: Group 5 / Group 4 (component 186:2619)
 * Desktop size: 77×123px
 * Inner rect: gradient bg + #FFEA9E border at 0.5 opacity, border-radius 12px, blur 25px
 * Digit: DSEG7 Classic Bold (7-segment LCD font with ghost segments — matches Figma "Digital Numbers"),
 *        ~73.7px (desktop), white, centered. Loaded via @font-face in globals.css.
 * Scales responsively via clamp on smaller viewports.
 */

type PrelaunchDigitTileProps = {
  /** Single character digit, e.g. "0" */
  digit: string;
};

export default function PrelaunchDigitTile({ digit }: PrelaunchDigitTileProps) {
  return (
    <div
      className="relative flex items-center justify-center"
      style={{
        width: "clamp(40px, 6vw, 77px)",
        height: "clamp(64px, 9.6vw, 123px)",
      }}
    >
      {/* Background rect — frosted glass with gradient + border */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          borderRadius: "clamp(6px, 1vw, 12px)",
          border: "0.75px solid #FFEA9E",
          background:
            "linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%)",
          opacity: 0.5,
          backdropFilter: "blur(25px)",
          WebkitBackdropFilter: "blur(25px)",
        }}
      />
      {/* Digit text */}
      <span
        className="relative z-10"
        style={{
          fontFamily: 'var(--font-dseg7), "Digital Numbers", monospace',
          fontSize: "clamp(38px, 5.8vw, 73.73px)",
          fontWeight: 700,
          lineHeight: 1,
          color: "#FFFFFF",
          letterSpacing: 0,
          userSelect: "none",
        }}
      >
        {digit}
      </span>
    </div>
  );
}
