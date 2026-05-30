import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/i18n/get-lang';
import { t } from '@/lib/i18n/dictionary';
import SiteHeader from '@/app/_components/shared/site-header';

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return { title: t(lang, 'kudos.detail.meta.title') };
}

// Kudo detail — placeholder until the detail view is built. Mirrors the
// profile "Coming Soon" pattern so unbuilt links land somewhere consistent.
export default async function KudoDetailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  const isAdmin = profile?.role === 'admin';

  const lang = await getLang();
  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#00101A' }}
    >
      <SiteHeader lang={lang} isAuthenticated={true} isAdmin={isAdmin} activeNav="kudos" />
      <main
        className="flex flex-1 items-center justify-center text-white"
        style={{ paddingTop: 80 }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-semibold">{t(lang, 'kudos.detail.title')}</h1>
          <p className="mt-4 text-lg text-zinc-300">{t(lang, 'kudos.comingSoon')}</p>
        </div>
      </main>
    </div>
  );
}
