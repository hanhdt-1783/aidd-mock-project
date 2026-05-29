"use client";

import { useEffect, useRef, useState } from "react";
import { t, type Language } from "@/lib/i18n/dictionary";
import { TargetIcon } from "./awards-icons";

type MenuItem = {
  slug: string;
  labelKey:
    | "awards.menu.top-talent.label"
    | "awards.menu.top-project.label"
    | "awards.menu.top-project-leader.label"
    | "awards.menu.best-manager.label"
    | "awards.menu.signature-2025-creator.label"
    | "awards.menu.mvp.label";
};

const MENU_ITEMS: MenuItem[] = [
  { slug: "top-talent", labelKey: "awards.menu.top-talent.label" },
  { slug: "top-project", labelKey: "awards.menu.top-project.label" },
  { slug: "top-project-leader", labelKey: "awards.menu.top-project-leader.label" },
  { slug: "best-manager", labelKey: "awards.menu.best-manager.label" },
  { slug: "signature-2025-creator", labelKey: "awards.menu.signature-2025-creator.label" },
  { slug: "mvp", labelKey: "awards.menu.mvp.label" },
];

type AwardsSideMenuProps = {
  lang: Language;
};

export default function AwardsSideMenu({ lang }: AwardsSideMenuProps) {
  // Initial active slug: seed from URL hash on mount; otherwise first item.
  const [activeSlug, setActiveSlug] = useState<string>(MENU_ITEMS[0].slug);
  const manualScrollRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Hash-driven initial active state is handled by the browser: it natively
    // scrolls to the URL hash on load, then the IntersectionObserver below
    // fires for whichever section is in view and syncs activeSlug.

    const observers: IntersectionObserver[] = [];

    MENU_ITEMS.forEach(({ slug }) => {
      const el = document.getElementById(slug);
      if (!el) return;

      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !manualScrollRef.current) {
              setActiveSlug(slug);
            }
          });
        },
        { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
      );

      obs.observe(el);
      observers.push(obs);
    });

    return () => {
      observers.forEach((o) => o.disconnect());
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function handleClick(slug: string) {
    setActiveSlug(slug);
    manualScrollRef.current = true;

    // Update the URL hash without polluting the history stack.
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", `#${slug}`);
    }

    const el = document.getElementById(slug);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      manualScrollRef.current = false;
    }, 800);
  }

  return (
    <nav
      aria-label="Awards navigation"
      className="flex flex-col"
      style={{ gap: 16, width: 178 }}
    >
      {MENU_ITEMS.map(({ slug, labelKey }) => {
        const isActive = activeSlug === slug;
        const label = t(lang, labelKey);
        return (
          <button
            key={slug}
            type="button"
            onClick={() => handleClick(slug)}
            aria-current={isActive ? "location" : undefined}
            className="flex items-center text-left transition-colors duration-200"
            style={{
              gap: 4,
              padding: 16,
              background: "none",
              borderTop: "none",
              borderLeft: "none",
              borderRight: "none",
              borderBottomWidth: 1,
              borderBottomStyle: "solid",
              borderBottomColor: isActive ? "#FFEA9E" : "transparent",
              cursor: "pointer",
            }}
          >
            {/* Target icon — Figma MM_MEDIA_Target. Gold when active,
                white otherwise (color drives the inline SVG currentColor). */}
            <span
              aria-hidden="true"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                color: isActive ? "#FFEA9E" : "rgba(255,255,255,0.87)",
                transition: "color 0.2s ease",
              }}
            >
              <TargetIcon />
            </span>

            {/* Label */}
            <span
              style={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 14,
                fontWeight: 700,
                lineHeight: "20px",
                letterSpacing: "0.25px",
                color: isActive ? "#FFEA9E" : "rgba(255,255,255,0.87)",
                transition: "color 0.2s ease",
                whiteSpace: "pre-line",
              }}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
