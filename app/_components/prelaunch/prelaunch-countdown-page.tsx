"use client";

/**
 * Prelaunch countdown page — full-viewport presentational component.
 *
 * Figma: "Countdown - Prelaunch page" (screenId: 8PJQswPZmU)
 * Frame: 1512×1077px
 *
 * Layers (bottom → top):
 *   1. MM_MEDIA_BG Image — background photo (root/organic pattern, dark)
 *   2. Cover — gradient overlay: 18deg, #00101A → rgba(0,18,29,0.46) → transparent
 *   3. Bìa — centered content frame: title + countdown
 *
 * Responsive breakpoints:
 *   - mobile (<640px): smaller gap/font, tiles scale via CSS custom property
 *   - tablet (640–1024px): intermediate scaling
 *   - desktop (≥1024px): full Figma values
 */

import { useState, useEffect } from "react";
import { t, type Language } from "@/lib/i18n/dictionary";
import { computeCountdownState } from "@/lib/event/compute-countdown-state";
import PrelaunchCountdownUnit from "./prelaunch-countdown-unit";

type PrelaunchCountdownPageProps = {
  lang: Language;
  /** ISO 8601 target datetime, or null to show "00" tiles */
  targetIso: string | null;
};

export default function PrelaunchCountdownPage({
  lang,
  targetIso,
}: PrelaunchCountdownPageProps) {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // showComingSoon is ignored here — this page has its own title.
  const state = computeCountdownState(targetIso, now);

  const unitLabels: Record<"days" | "hours" | "minutes", string> = {
    days: t(lang, "prelaunch.days"),
    hours: t(lang, "prelaunch.hours"),
    minutes: t(lang, "prelaunch.minutes"),
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: "100svh", backgroundColor: "#00101A" }}
    >
      {/* Layer 1: Background image */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/prelaunch/bg-image.png')",
          backgroundPosition: "-142px -789.753px",
          backgroundSize: "109.392% 216.017%",
        }}
      />

      {/* Layer 2: Gradient overlay (Cover) */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(18deg, #00101A 15.48%, rgba(0,18,29,0.46) 52.13%, rgba(0,19,32,0.00) 63.41%)",
        }}
      />

      {/* Layer 3: Content (Bìa) — vertically + horizontally centered */}
      <div
        className="relative z-[2] flex flex-col items-center justify-center w-full px-6 sm:px-10 lg:px-36"
        style={{ minHeight: "100svh", paddingTop: 96, paddingBottom: 96 }}
      >
        {/* Countdown time wrapper — gap 24px between title and tiles row */}
        <div
          className="flex flex-col items-center"
          style={{ gap: 24 }}
        >
          {/* Title — scales down on mobile */}
          <h1
            className="text-center"
            style={{
              fontFamily: "Montserrat, sans-serif",
              fontSize: "clamp(20px, 4vw, 36px)",
              fontWeight: 700,
              lineHeight: 1.33,
              color: "#FFFFFF",
              letterSpacing: 0,
              margin: 0,
            }}
          >
            {t(lang, "prelaunch.title")}
          </h1>

          {/* Three countdown units — responsive gap */}
          <div
            className="flex items-start flex-wrap justify-center"
            style={{ gap: "clamp(20px, 5vw, 60px)" }}
          >
            {state.units.map((unit) => (
              <PrelaunchCountdownUnit
                key={unit.unit}
                display={unit.display}
                label={unitLabels[unit.unit]}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
