"use client";

import { useState, useEffect } from "react";
import { t, type Language } from "@/lib/i18n/dictionary";

type CountdownUnit = {
  display: string;
  labelKey: "home.hero.days" | "home.hero.hours" | "home.hero.minutes";
};

type CountdownState = {
  units: CountdownUnit[];
  showComingSoon: boolean;
};

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

// targetIso null/empty/invalid → "--" tiles, "Coming soon" hidden.
// Past target → "00" tiles, "Coming soon" hidden.
// Future target → real diff, "Coming soon" visible.
function computeState(
  targetIso: string | null | undefined,
  now: number,
): CountdownState {
  const placeholder = (display: string): CountdownState => ({
    units: [
      { display, labelKey: "home.hero.days" },
      { display, labelKey: "home.hero.hours" },
      { display, labelKey: "home.hero.minutes" },
    ],
    showComingSoon: false,
  });

  if (!targetIso) return placeholder("--");
  const target = new Date(targetIso).getTime();
  if (Number.isNaN(target)) return placeholder("--");

  const diff = target - now;
  if (diff <= 0) return placeholder("00");

  const totalMinutes = Math.floor(diff / 1000 / 60);
  const totalHours = Math.floor(totalMinutes / 60);
  return {
    units: [
      { display: pad(Math.floor(totalHours / 24)), labelKey: "home.hero.days" },
      { display: pad(totalHours % 24), labelKey: "home.hero.hours" },
      { display: pad(totalMinutes % 60), labelKey: "home.hero.minutes" },
    ],
    showComingSoon: true,
  };
}

type CountdownDisplayProps = {
  /** Two-digit number string to show, e.g. "05" */
  display: string;
  label: string;
};

function CountdownTile({ display, label }: CountdownDisplayProps) {
  return (
    <div
      className="flex flex-col"
      style={{ gap: 14, width: 116 }}
    >
      {/* Number — two large digit blocks */}
      <div className="flex items-center" style={{ gap: 14, height: 82 }}>
        {display.split("").map((digit, i) => (
          <div
            key={i}
            className="flex items-center justify-center"
            style={{
              width: 51,
              height: 82,
              borderRadius: 4,
              backgroundColor: "rgba(255,255,255,0.08)",
              fontFamily: "Montserrat, sans-serif",
              fontSize: 57,
              fontWeight: 700,
              lineHeight: "64px",
              color: "#FFEA9E",
              letterSpacing: "-0.25px",
            }}
          >
            {digit}
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
  // clock; computeState recomputes from `now` each render — no cascading setState.
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const state = computeState(targetIso, now);

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
            key={unit.labelKey}
            display={unit.display}
            label={t(lang, unit.labelKey)}
          />
        ))}
      </div>
    </div>
  );
}
