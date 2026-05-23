import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/get-lang";
import { t } from "@/lib/i18n/dictionary";
import { getEventDatetime } from "@/lib/event/get-event-datetime";
import HomeHeader from "./_components/home/home-header";
import HomeHero from "./_components/home/home-hero";
import HomeRootFurther from "./_components/home/home-root-further";
import HomeAwardsSection from "./_components/home/home-awards-section";
import HomeKudosSection from "./_components/home/home-kudos-section";
import HomeWidgetButton from "./_components/home/home-widget-button";
import HomeFooter from "./_components/home/home-footer";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, "home.meta.title"),
    description: t(lang, "home.meta.description"),
  };
}

export default async function HomePage() {
  const lang = await getLang();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthenticated = !!user;

  // Role check: read own profile row (RLS-gated). Default to false if no row.
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    isAdmin = profile?.role === "admin";
  }

  // Countdown target — DB-first (event_config) with env fallback; null → "--".
  const eventDate = await getEventDatetime();
  const countdownTargetIso = eventDate ? eventDate.toISOString() : null;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Sticky header */}
      <HomeHeader
        lang={lang}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
      />

      <main className="flex flex-col w-full" style={{ paddingTop: 80 }}>
        <HomeHero lang={lang} countdownTargetIso={countdownTargetIso} />

        {/* Section 2 — Root Further content block */}
        <section
          className="w-full flex justify-center px-6 sm:px-10 lg:px-36"
          style={{ backgroundColor: "#00101A", paddingTop: 96, paddingBottom: 96 }}
        >
          <HomeRootFurther lang={lang} />
        </section>

        {/* Section 3 — Awards */}
        <section
          className="w-full px-6 sm:px-10 lg:px-36"
          style={{ backgroundColor: "#00101A", paddingTop: 96, paddingBottom: 96 }}
        >
          <HomeAwardsSection lang={lang} />
        </section>

        {/* Section 4 — Sun* Kudos */}
        <section
          className="w-full flex justify-center px-6 sm:px-10 lg:px-36"
          style={{ backgroundColor: "#00101A", paddingTop: 96, paddingBottom: 96 }}
        >
          <HomeKudosSection lang={lang} />
        </section>
      </main>

      {/* Fixed widget button — bottom right */}
      <HomeWidgetButton lang={lang} />

      {/* Footer */}
      <HomeFooter lang={lang} />
    </div>
  );
}
