import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getLang } from '@/lib/i18n/get-lang';
import HomeHeader from '@/app/_components/home/home-header';
import HomeFooter from '@/app/_components/home/home-footer';
import KudosPage from '@/app/_components/kudos/kudos-page';
import {
  getSidebarStats,
  getTotalKudosCount,
  listAllKudos,
  listDepartments,
  listGiftRecipients,
  listHashtags,
  listHighlightKudos,
  listSpotlightNames,
} from '@/lib/kudos/queries';
import type { KudosFilters } from '@/lib/kudos/types';

export const metadata: Metadata = {
  title: 'Sun* Kudos — Sun* Annual Awards 2025',
};

// Filters arrive via URL: /kudos?hashtag=Inspiring&department=CEVC10
type KudosRouteSearchParams = Promise<{
  hashtag?: string | string[];
  department?: string | string[];
}>;

function pickSingle(v: string | string[] | undefined): string | null {
  if (v == null) return null;
  if (Array.isArray(v)) return v[0] ?? null;
  return v;
}

export default async function KudosRoute({
  searchParams,
}: {
  searchParams: KudosRouteSearchParams;
}) {
  const lang = await getLang();

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

  const params = await searchParams;
  const filters: KudosFilters = {
    hashtag: pickSingle(params.hashtag),
    department: pickSingle(params.department),
  };

  const [
    highlightCards,
    allCards,
    hashtags,
    departments,
    sidebarStats,
    giftRecipients,
    spotlightNames,
    totalKudos,
  ] = await Promise.all([
    listHighlightKudos(user.id, filters, 5),
    listAllKudos(user.id, filters, 20),
    listHashtags(),
    listDepartments(),
    getSidebarStats(user.id),
    listGiftRecipients(10),
    listSpotlightNames(80),
    getTotalKudosCount(),
  ]);

  // Type guards — ensure all arrays/objects are defined
  const safeHashtags = Array.isArray(hashtags) ? hashtags : [];
  const safeDepartments = Array.isArray(departments) ? departments : [];
  const safeHighlightCards = Array.isArray(highlightCards) ? highlightCards : [];
  const safeAllCards = Array.isArray(allCards) ? allCards : [];
  const safeSidebarStats = sidebarStats ?? {
    kudosReceived: 0,
    kudosSent: 0,
    heartsReceived: 0,
    secretBoxesOpened: 0,
    secretBoxesUnopened: 0,
  };
  const safeGiftRecipients = Array.isArray(giftRecipients) ? giftRecipients : [];
  const safeSpotlightNames = Array.isArray(spotlightNames) ? spotlightNames : [];
  const safeTotalKudos = typeof totalKudos === 'number' ? totalKudos : 0;

  return (
    <div
      className="relative min-h-screen w-full flex flex-col"
      style={{ backgroundColor: '#00101A' }}
    >
      <HomeHeader
        lang={lang}
        isAuthenticated={true}
        isAdmin={isAdmin}
        activeNav="kudos"
      />

      <main className="flex-1 w-full">
        <KudosPage
          highlightCards={safeHighlightCards}
          allCards={safeAllCards}
          hashtags={safeHashtags}
          departments={safeDepartments}
          selectedHashtag={filters.hashtag}
          selectedDepartment={filters.department}
          sidebarStats={safeSidebarStats}
          giftRecipients={safeGiftRecipients}
          spotlightNames={safeSpotlightNames}
          totalKudos={safeTotalKudos}
        />
      </main>

      <HomeFooter lang={lang} />
    </div>
  );
}
