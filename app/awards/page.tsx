import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/get-lang";
import { t } from "@/lib/i18n/dictionary";
import SiteHeader from "@/app/_components/shared/site-header";
import HomeKudosSection from "@/app/_components/home/home-kudos-section";
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

      <main className="flex flex-col w-full" style={{ paddingTop: 80 }}>
        {/* Section A — Page title */}
        <section
          className="w-full px-6 sm:px-10 lg:px-36"
          style={{
            paddingTop: 40,
            paddingBottom: 32,
            backgroundColor: "#00101A",
          }}
        >
          <AwardsPageTitle lang={lang} />
        </section>

        {/* Section B — side menu + awards list.
            Single tree: stacked on mobile (flex-col), side-by-side on lg+ (flex-row).
            CSS handles the responsive split — DOM ids stay unique so the
            IntersectionObserver in AwardsSideMenu works on all viewports. */}
        <section
          className="w-full px-6 sm:px-10 lg:px-36 flex flex-col lg:flex-row lg:items-start"
          style={{
            paddingBottom: 96,
            backgroundColor: "#00101A",
            gap: 40,
          }}
        >
          <div className="shrink-0 lg:sticky lg:self-start" style={{ top: 100, width: 178 }}>
            <AwardsSideMenu lang={lang} />
          </div>
          <AwardsList lang={lang} />
        </section>

        {/* Section D1/D2 — Sun* Kudos banner (reused from homepage) */}
        <HomeKudosSection lang={lang} />
      </main>

      <SiteFooter lang={lang} />
    </div>
  );
}
