import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLang } from "@/lib/i18n/get-lang";
import { t } from "@/lib/i18n/dictionary";
import { listHashtags, listRecipients } from "@/lib/kudos/queries";
import SiteHeader from "./_components/shared/site-header";
import HomeHero from "./_components/home/home-hero";
import HomeRootFurther from "./_components/home/home-root-further";
import HomeAwardsSection from "./_components/home/home-awards-section";
import HomeKudosSection from "./_components/home/home-kudos-section";
import HomeWidgetButton from "./_components/home/home-widget-button";
import SiteFooter from "./_components/shared/site-footer";

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
  if (!user) redirect("/login");

  // Role check: read own profile row (RLS-gated). Default to false if no row.
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";

  // FAB "Viết Kudo" modal data — fetched in parallel for fewer RTTs.
  const [recipients, hashtags] = await Promise.all([
    listRecipients(user.id),
    listHashtags(),
  ]);
  const safeRecipients = Array.isArray(recipients) ? recipients : [];
  const safeHashtags = Array.isArray(hashtags) ? hashtags : [];

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Sticky header */}
      <SiteHeader
        lang={lang}
        isAuthenticated={true}
        isAdmin={isAdmin}
        activeNav="about"
      />

      <main className="flex flex-col w-full" style={{ paddingTop: 80 }}>
        <HomeHero lang={lang} />

        {/* Section 2 — Root Further content block */}
        <section
          className="w-full flex justify-center px-6 sm:px-12 lg:px-60 xl:px-72"
          style={{ backgroundColor: "#00101A", paddingTop: 0, paddingBottom: 96 }}
        >
          <HomeRootFurther lang={lang} />
        </section>

        {/* Section 3 — Awards */}
        <section
          className="w-full px-6 sm:px-12 lg:px-60 xl:px-72"
          style={{ backgroundColor: "#00101A", paddingTop: 0, paddingBottom: 96 }}
        >
          <HomeAwardsSection lang={lang} />
        </section>

        {/* Section 4 — Sun* Kudos */}
        <section
          className="w-full flex justify-center px-6 sm:px-12 lg:px-60 xl:px-72"
          style={{ backgroundColor: "#00101A", paddingTop: 96, paddingBottom: 96 }}
        >
          <HomeKudosSection lang={lang} />
        </section>
      </main>

      {/* Fixed widget button — bottom right. Opens Viết Kudo modal. */}
      <HomeWidgetButton
        lang={lang}
        recipients={safeRecipients}
        existingHashtags={safeHashtags}
        currentUserId={user.id}
      />

      {/* Footer */}
      <SiteFooter lang={lang} />
    </div>
  );
}
