import type { Metadata } from "next";
import Image from "next/image";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/get-lang";
import { t } from "@/lib/i18n/dictionary";
import SiteHeader from "@/app/_components/shared/site-header";
import KudosSection from "@/app/_components/shared/kudos-section";
import SiteFooter from "@/app/_components/shared/site-footer";
import AwardsPageTitle from "@/app/_components/awards/awards-page-title";
import AwardsSideMenu from "@/app/_components/awards/awards-side-menu";
import AwardsList from "@/app/_components/awards/awards-list";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, "awards.meta.title"),
  };
}

export default async function AwardsPage() {
  const lang = await getLang();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Per spec ID-1: /awards requires authentication. Anonymous users → /login.
  if (!user) redirect("/login");

  // Role check — same pattern as app/page.tsx
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Sticky header — awards nav item active */}
      <SiteHeader
        lang={lang}
        isAuthenticated={true}
        isAdmin={isAdmin}
        activeNav="awards"
      />

      <main className="relative z-10 flex flex-col w-full" style={{ paddingTop: 80 }}>
        {/* Section A — Keyvisual hero: ROOT FURTHER logo + page title.
            The keyvisual artwork is the background of THIS section, so its
            bottom edge always sits just below the title across viewports
            (Figma: image y80–627, title ends y583 → ~44px below title). */}
        <section
          className="relative w-full overflow-hidden px-page flex flex-col"
          style={{
            paddingTop: "clamp(48px, 8vw, 96px)",
            // Image extends ~44px below the title (Figma y583 → y627).
            paddingBottom: "clamp(24px, 4vw, 44px)",
            gap: "clamp(40px, 8vw, 120px)",
          }}
        >
          {/* Keyvisual artwork (Figma node 2167:5138) + dark fade
              (Figma "Cover" gradient 313:8439): solid #00101A at the bottom,
              transparent by ~53% up — so the title sits on the dark lower edge. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-cover bg-center bg-no-repeat"
              style={{ backgroundImage: "url('/awards/keyvisual-bg.png')" }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(0deg, #00101A -4.23%, rgba(0, 19, 32, 0.00) 52.79%)",
              }}
            />
          </div>

          {/* ROOT FURTHER logo (Figma node 2789:12915) — 338×150, scales down on mobile */}
          <div
            className="relative z-10"
            style={{ width: "100%", maxWidth: 338, aspectRatio: "169 / 75" }}
          >
            <Image
              src="/awards/root-further-logo.png"
              alt="ROOT FURTHER"
              width={338}
              height={150}
              priority
              className="object-contain w-full h-auto"
            />
          </div>

          <div className="relative z-10">
            <AwardsPageTitle lang={lang} />
          </div>
        </section>

        {/* Section B — side menu + awards list.
            Single tree: stacked on mobile (flex-col), side-by-side on lg+ (flex-row).
            CSS handles the responsive split — DOM ids stay unique so the
            IntersectionObserver in AwardsSideMenu works on all viewports. */}
        <section
          className="w-full px-page flex flex-col lg:flex-row lg:items-start"
          style={{
            // Space below the keyvisual image (Figma: image bottom y627 →
            // awards list y703 = ~76px).
            paddingTop: "clamp(40px, 6vw, 76px)",
            paddingBottom: 96,
            backgroundColor: "#00101A",
            // Figma mms_B gap between side menu and award list = 80.
            gap: 80,
          }}
        >
          <div className="shrink-0 lg:sticky lg:self-start" style={{ top: 100, width: 178 }}>
            <AwardsSideMenu lang={lang} />
          </div>
          <AwardsList lang={lang} />
        </section>

        {/* Section D1/D2 — Sun* Kudos banner (shared "Phong trào ghi nhận" section).
            Bottom gap before the footer (Figma "Bìa" 96px bottom padding: kudos
            ends y6156 → footer divider y6266). Without it the footer's top divider
            sits flush against the dark banner — no visible line + wrong spacing.
            Matches the homepage kudos section's bottom rhythm. */}
        <section
          className="w-full"
          style={{
            backgroundColor: "#00101A",
            paddingBottom: "clamp(48px, 8vw, 96px)",
          }}
        >
          <KudosSection lang={lang} />
        </section>
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
