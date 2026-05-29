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
      className="relative min-h-screen w-full flex flex-col overflow-hidden"
      style={{ backgroundColor: "#00101A" }}
    >
      {/* Unified top background — keyvisual image fades into solid dark via gradient.
          Sized to the design hero aspect; image sits at top, dark continues below. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-0 left-0 right-0 z-0 overflow-hidden"
        style={{ aspectRatio: "1512 / 1392", minHeight: 900 }}
      >
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/home/keyvisual-bg.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(12deg, #00101A 23.7%, rgba(0, 18, 29, 0.46) 38.34%, rgba(0, 19, 32, 0.00) 48.92%)",
          }}
        />
      </div>

      {/* Sticky header */}
      <SiteHeader
        lang={lang}
        isAuthenticated={true}
        isAdmin={isAdmin}
        activeNav="about"
      />

      <main className="relative z-10 flex flex-col w-full" style={{ paddingTop: 80 }}>
        <HomeHero lang={lang} />

        {/* Section 2 — Root Further content block. */}
        <section
          className="w-full flex justify-center px-6 sm:px-12 lg:px-60 xl:px-72"
          style={{
            paddingTop: "clamp(24px, 5vw, 48px)",
            paddingBottom: "clamp(48px, 8vw, 96px)",
          }}
        >
          <HomeRootFurther lang={lang} />
        </section>

        {/* Section 3 — Awards */}
        <section
          className="w-full px-6 sm:px-12 lg:px-60 xl:px-72"
          style={{
            backgroundColor: "#00101A",
            paddingTop: 0,
            paddingBottom: "clamp(48px, 8vw, 96px)",
          }}
        >
          <HomeAwardsSection lang={lang} />
        </section>

        {/* Section 4 — Sun* Kudos */}
        <section
          className="w-full flex justify-center px-6 sm:px-12 lg:px-60 xl:px-72"
          style={{
            backgroundColor: "#00101A",
            paddingTop: "clamp(48px, 8vw, 96px)",
            paddingBottom: "clamp(48px, 8vw, 96px)",
          }}
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
