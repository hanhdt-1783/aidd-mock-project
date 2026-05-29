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

  return (
    <footer
      className="w-full flex items-center justify-between px-page py-10"
      style={{
        borderTop: "1px solid #2E3940",
        backgroundColor: "#00101A",
      }}
    >
      <div className="flex items-center" style={{ gap: 80 }}>
        <Link href="/" aria-label={t(lang, "home.meta.title")}>
          <Image
            src="/home/logo-footer.png"
            alt={t(lang, "home.meta.title")}
            width={69}
            height={64}
            className="object-contain"
          />
        </Link>

        <nav aria-label={t(lang, "aria.nav.footer")}>
          <ul
            className="flex items-center"
            style={{ gap: 48, listStyle: "none", margin: 0, padding: 0 }}
          >
            {FOOTER_NAV.map((item) => {
              const isActive = isActiveHref(pathname, item.href);
              return (
                <li key={item.labelKey}>
                  <Link
                    href={item.href}
                    className={`inline-flex items-center rounded text-white/[0.87] transition-colors duration-200 ${
                      isActive
                        ? "bg-[rgba(255,234,158,0.20)]"
                        : "bg-transparent hover:bg-[rgba(255,234,158,0.10)]"
                    }`}
                    style={{
                      fontFamily: "Montserrat, sans-serif",
                      fontSize: 16,
                      fontWeight: 700,
                      lineHeight: "24px",
                      letterSpacing: "0.5px",
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
        className="font-bold text-white"
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
