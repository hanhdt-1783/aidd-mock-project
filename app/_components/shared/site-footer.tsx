"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { t, type Language } from "@/lib/i18n/dictionary";

type FooterNavItem = {
  labelKey:
    | "home.footer.nav.about"
    | "home.footer.nav.awards"
    | "home.footer.nav.kudos"
    | "home.footer.nav.standards";
  href: string;
};

const FOOTER_NAV: FooterNavItem[] = [
  { labelKey: "home.footer.nav.about", href: "/" },
  { labelKey: "home.footer.nav.awards", href: "/awards" },
  { labelKey: "home.footer.nav.kudos", href: "/kudos" },
  { labelKey: "home.footer.nav.standards", href: "/standards" },
];

// Active = exact match for "/", prefix match for sub-routes.
function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export type SiteFooterProps = {
  lang: Language;
  /** 'full' (default): logo + nav + copyright. 'minimal': just centered copyright (auth/landing pages). */
  variant?: "full" | "minimal";
  /** Translation key for copyright. Default: 'home.footer.copyright'. Use 'login.footer.copyright' for minimal/login. */
  copyrightKey?: "home.footer.copyright" | "login.footer.copyright";
};

export default function SiteFooter({
  lang,
  variant = "full",
  copyrightKey,
}: SiteFooterProps) {
  const pathname = usePathname();
  const isMinimal = variant === "minimal";
  const effectiveCopyrightKey =
    copyrightKey ?? (isMinimal ? "login.footer.copyright" : "home.footer.copyright");

  if (isMinimal) {
    return (
      <footer
        className="flex items-center justify-center w-full px-page py-6 sm:py-8 lg:py-10"
        style={{ borderTop: "1px solid #2E3940" }}
      >
        <p
          className="font-bold text-white text-center"
          style={{
            fontFamily: "'Montserrat Alternates', Montserrat, sans-serif",
            fontSize: 16,
            fontWeight: 700,
            lineHeight: "24px",
          }}
        >
          {t(lang, effectiveCopyrightKey)}
        </p>
      </footer>
    );
  }

  // Fluid side gutters that scale with the viewport (same centered-content
  // pattern as .px-page, but capped at 1360px — just wide enough for the footer
  // content ≈1335px so it stays one row). Gutters grow on wide screens and
  // shrink to 24px minimum on small ones. Footer content is wider than the
  // header's (4 nav items + copyright), hence a wider cap than .px-page's 1152.
  // Labels never break (whitespace-nowrap); below ~1408px it wraps gracefully
  // (copyright drops below) instead of squishing text.
  const fluidGutter = "max(1.5rem, calc((100vw - 1360px) / 2))";
  return (
    <footer
      className="w-full flex flex-wrap items-center justify-between gap-x-10 gap-y-4 py-10"
      style={{
        paddingLeft: fluidGutter,
        paddingRight: fluidGutter,
        borderTop: "1px solid #2E3940",
        backgroundColor: "#00101A",
      }}
    >
      <div className="flex flex-wrap items-center gap-x-20 gap-y-4">
        <Link href="/" aria-label={t(lang, "home.meta.title")} className="shrink-0">
          <Image
            src="/shared/logo-footer.png"
            alt={t(lang, "home.meta.title")}
            width={69}
            height={64}
            className="object-contain"
          />
        </Link>

        <nav aria-label={t(lang, "aria.nav.footer")}>
          <ul
            className="flex flex-wrap items-center gap-x-12 gap-y-1"
            style={{ listStyle: "none", margin: 0, padding: 0 }}
          >
            {FOOTER_NAV.map((item) => {
              const isActive = isActiveHref(pathname, item.href);
              return (
                <li key={item.labelKey}>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center whitespace-nowrap rounded text-white transition-colors duration-200 ${
                      isActive
                        ? "bg-[rgba(255,234,158,0.10)]"
                        : "bg-transparent hover:bg-[rgba(255,234,158,0.10)]"
                    }`}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: "24px",
                      letterSpacing: "0.15px",
                      textDecoration: "none",
                      padding: "16px",
                    }}
                  >
                    {t(lang, item.labelKey)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      <p
        className="font-bold text-white whitespace-nowrap"
        style={{
          fontFamily: "Montserrat Alternates, Montserrat, sans-serif",
          fontSize: 16,
          fontWeight: 700,
          lineHeight: "24px",
          margin: 0,
          color: "#FFFFFF",
        }}
      >
        {t(lang, effectiveCopyrightKey)}
      </p>
    </footer>
  );
}
