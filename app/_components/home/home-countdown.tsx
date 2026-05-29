import { t, type Language } from "@/lib/i18n/dictionary";

// Home-page countdown is intentionally STATIC at 20:20:20 (per product spec).
// The prelaunch page still runs the real ticking countdown — see
// app/_components/prelaunch/prelaunch-countdown-page.tsx.
const STATIC_UNITS: ReadonlyArray<{
  unit: "days" | "hours" | "minutes";
  display: string;
  labelKey: "home.hero.days" | "home.hero.hours" | "home.hero.minutes";
}> = [
  { unit: "days", display: "20", labelKey: "home.hero.days" },
  { unit: "hours", display: "20", labelKey: "home.hero.hours" },
  { unit: "minutes", display: "20", labelKey: "home.hero.minutes" },
];

type CountdownTileProps = {
  /** Two-character display value, e.g. "05" or "--". */
  display: string;
  label: string;
};

// One unit (two digit tiles + label underneath).
// Style mirrors /prelaunch (DSEG7 LCD + frosted glass + gold border)
// but at home's compact 51x82 tile size — see compute-countdown-state.ts for shared logic.
function CountdownTile({ display, label }: CountdownTileProps) {
  const [d1, d2] =
    display.length >= 2
      ? [display[0], display[1]]
      : [display[0] ?? "0", display[0] ?? "0"];

  return (
    <div className="flex flex-col" style={{ gap: "clamp(8px, 2vw, 14px)" }}>
      {/* Two digit tiles */}
      <div
        className="flex items-center"
        style={{
          gap: "clamp(8px, 2vw, 14px)",
          height: "clamp(60px, 14vw, 82px)",
        }}
      >
        {[d1, d2].map((digit, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{
              width: "clamp(38px, 9vw, 51px)",
              height: "clamp(60px, 14vw, 82px)",
            }}
          >
            {/* Frosted glass background — matches /prelaunch tile aesthetic */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                borderRadius: 8,
                border: "0.75px solid #FFEA9E",
                background:
                  "linear-gradient(180deg, #FFF 0%, rgba(255,255,255,0.10) 100%)",
                opacity: 0.5,
                backdropFilter: "blur(25px)",
                WebkitBackdropFilter: "blur(25px)",
              }}
            />
            <span
              className="relative z-10"
              style={{
                fontFamily: 'var(--font-dseg7), "Digital Numbers", monospace',
                fontSize: "clamp(32px, 8vw, 48px)",
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
        ))}
      </div>
      {/* Label */}
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(16px, 3.5vw, 24px)",
          fontWeight: 700,
          lineHeight: "1.33",
          color: "#FFFFFF",
          letterSpacing: 0,
        }}
      >
        {label}
      </span>
    </div>
  );
}

type HomeCountdownProps = {
  lang: Language;
};

export default function HomeCountdown({ lang }: HomeCountdownProps) {
  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      <span
        style={{
          fontFamily: "Montserrat, sans-serif",
          fontSize: "clamp(18px, 3.5vw, 24px)",
          fontWeight: 700,
          lineHeight: "1.33",
          color: "#FFFFFF",
        }}
      >
        {t(lang, "home.hero.coming.soon")}
      </span>

      <div
        className="flex items-center"
        style={{ gap: "clamp(12px, 4vw, 40px)" }}
      >
        {STATIC_UNITS.map((unit) => (
          <CountdownTile
            key={unit.unit}
            display={unit.display}
            label={t(lang, unit.labelKey)}
          />
        ))}
      </div>
    </div>
  );
}
