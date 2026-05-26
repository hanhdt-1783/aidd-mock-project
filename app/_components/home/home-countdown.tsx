"use client";

import { useState, useEffect } from "react";
import { t, type Language } from "@/lib/i18n/dictionary";
import {
  computeCountdownState,
  type CountdownUnit,
} from "@/lib/event/compute-countdown-state";

const LABEL_KEY: Record<CountdownUnit["unit"], "home.hero.days" | "home.hero.hours" | "home.hero.minutes"> = {
  days: "home.hero.days",
  hours: "home.hero.hours",
  minutes: "home.hero.minutes",
};

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
    <div className="flex flex-col" style={{ gap: 14 }}>
      {/* Two digit tiles */}
      <div className="flex items-center" style={{ gap: 14, height: 82 }}>
        {[d1, d2].map((digit, i) => (
          <div
            key={i}
            className="relative flex items-center justify-center"
            style={{ width: 51, height: 82 }}
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
                fontSize: 48,
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
          fontSize: 24,
          fontWeight: 700,
          lineHeight: "32px",
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
  /** ISO 8601 target. null/undefined/invalid → "--" tiles + "Coming soon" hidden. */
  targetIso?: string | null;
};

export default function HomeCountdown({ lang, targetIso }: HomeCountdownProps) {
  // Lazy-init keeps server and client first render aligned. Interval ticks the
  // clock; computeCountdownState recomputes from `now` each render.
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const state = computeCountdownState(targetIso, now);

  return (
    <div className="flex flex-col" style={{ gap: 16 }}>
      {state.showComingSoon && (
        <span
          style={{
            fontFamily: "Montserrat, sans-serif",
            fontSize: 24,
            fontWeight: 700,
            lineHeight: "32px",
            color: "#FFFFFF",
          }}
        >
          {t(lang, "home.hero.coming.soon")}
        </span>
      )}

      <div className="flex items-center" style={{ gap: 40 }}>
        {state.units.map((unit) => (
          <CountdownTile
            key={unit.unit}
            display={unit.display}
            label={t(lang, LABEL_KEY[unit.unit])}
          />
        ))}
      </div>
    </div>
  );
}
