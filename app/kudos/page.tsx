import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/i18n/get-lang';
import HomeHeader from '@/app/_components/home/home-header';

export const metadata: Metadata = {
  title: 'Sun* Kudos — Sun* Annual Awards 2025',
};

const COMING_SOON = { vi: 'Sắp ra mắt', en: 'Coming Soon' } as const;

export default async function KudosPage() {
  const lang = await getLang();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  }

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#00101A' }}
    >
      <HomeHeader
        lang={lang}
        isAuthenticated={!!user}
        isAdmin={isAdmin}
        activeNav="kudos"
      />
      <main
        className="flex flex-1 items-center justify-center text-white"
        style={{ paddingTop: 80 }}
      >
        <div className="text-center">
          <h1 className="text-4xl font-semibold">Sun* Kudos</h1>
          <p className="mt-4 text-lg text-zinc-300">{COMING_SOON[lang]}</p>
        </div>
      </main>
    </div>
  );
}
