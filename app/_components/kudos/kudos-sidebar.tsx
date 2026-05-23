'use client';

import type { SidebarStats, GiftRecipient } from './types';
import KudosSidebarStats from './kudos-sidebar-stats';
import KudosSidebarLeaderboard from './kudos-sidebar-leaderboard';
import { KudosToast, useKudosToast } from './kudos-toast';

type KudosSidebarProps = {
  stats: SidebarStats;
  giftRecipients: GiftRecipient[];
};

export default function KudosSidebar({ stats, giftRecipients }: KudosSidebarProps) {
  const { toast, showToast, dismissToast } = useKudosToast();

  return (
    <>
      <aside
        aria-label="Thống kê và danh sách nhận quà"
        style={{
          width: 422,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          gap: 24,
          // sticky so sidebar follows scroll
          position: 'sticky',
          top: 96, // below the 80px header + 16px breathing room
          alignSelf: 'flex-start',
        }}
      >
        {/* D.1 Stats + gift button */}
        <KudosSidebarStats
          stats={stats}
          onOpenGift={() => showToast('Coming soon')}
        />

        {/* D.3 Gift recipients leaderboard */}
        <KudosSidebarLeaderboard
          title="10 SUNNER NHẬN QUÀ MỚI NHẤT"
          recipients={giftRecipients}
        />
      </aside>

      {toast && <KudosToast message={toast} onDismiss={dismissToast} />}
    </>
  );
}
