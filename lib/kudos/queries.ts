// Server-side data fetchers for the Sun* Kudos Live Board.
// All functions assume the caller is authenticated; the page-level redirect handles anon visitors.

import { createClient } from '@/lib/supabase/server';
import type {
  GiftRecipient,
  KudosCard,
  KudosFilters,
  KudosUser,
  RecipientOption,
  SidebarStats,
  SpotlightName,
} from './types';

type RankStars = 0 | 1 | 2 | 3;

type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  department: string | null;
  title: string | null;
  rank_stars: number | null;
};

type KudosRow = {
  id: string;
  sender_id: string;
  receiver_id: string;
  title: string | null;
  content: string;
  image_urls: string[] | null;
  created_at: string;
  like_count: number;
};

function toUser(
  row: ProfileRow,
  received: number,
  sent: number,
): KudosUser {
  return {
    id: row.id,
    name: row.display_name ?? 'Sunner',
    avatarUrl: row.avatar_url ?? '',
    department: row.department ?? '',
    title: row.title,
    rankStars: ((row.rank_stars ?? 0) as RankStars),
    kudosReceived: received,
    kudosSent: sent,
  };
}

function fallbackUser(id: string): KudosUser {
  return {
    id,
    name: 'Sunner',
    avatarUrl: '',
    department: '',
    title: null,
    rankStars: 0,
    kudosReceived: 0,
    kudosSent: 0,
  };
}

// Count kudos sent/received per user in a single query (no N+1). Only rows
// touching the requested ids are pulled; counts are tallied in memory.
async function fetchKudosCountsByUser(
  ids: string[],
): Promise<{ received: Map<string, number>; sent: Map<string, number> }> {
  const received = new Map<string, number>();
  const sent = new Map<string, number>();
  if (ids.length === 0) return { received, sent };

  const supabase = await createClient();
  const { data } = await supabase
    .from('kudos')
    .select('sender_id, receiver_id')
    .or(`sender_id.in.(${ids.join(',')}),receiver_id.in.(${ids.join(',')})`);

  const idSet = new Set(ids);
  for (const r of (data ?? []) as { sender_id: string; receiver_id: string }[]) {
    if (idSet.has(r.receiver_id)) {
      received.set(r.receiver_id, (received.get(r.receiver_id) ?? 0) + 1);
    }
    if (idSet.has(r.sender_id)) {
      sent.set(r.sender_id, (sent.get(r.sender_id) ?? 0) + 1);
    }
  }
  return { received, sent };
}

async function fetchProfilesByIds(ids: string[]): Promise<Map<string, KudosUser>> {
  if (ids.length === 0) return new Map();
  const supabase = await createClient();
  const [{ data }, counts] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, display_name, avatar_url, department, title, rank_stars')
      .in('id', ids),
    fetchKudosCountsByUser(ids),
  ]);

  const map = new Map<string, KudosUser>();
  for (const row of (data ?? []) as ProfileRow[]) {
    map.set(
      row.id,
      toUser(row, counts.received.get(row.id) ?? 0, counts.sent.get(row.id) ?? 0),
    );
  }
  return map;
}

async function fetchKudosLikesForUser(
  kudosIds: string[],
  viewerId: string,
): Promise<Set<string>> {
  if (kudosIds.length === 0) return new Set();
  const supabase = await createClient();
  const { data } = await supabase
    .from('kudos_likes')
    .select('kudos_id')
    .eq('user_id', viewerId)
    .in('kudos_id', kudosIds);
  return new Set(((data ?? []) as { kudos_id: string }[]).map((r) => r.kudos_id));
}

async function fetchHashtagsByKudosIds(
  kudosIds: string[],
): Promise<Map<string, string[]>> {
  if (kudosIds.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase
    .from('kudos_hashtags')
    .select('kudos_id, tag')
    .in('kudos_id', kudosIds);

  const map = new Map<string, string[]>();
  for (const row of (data ?? []) as { kudos_id: string; tag: string }[]) {
    const arr = map.get(row.kudos_id) ?? [];
    arr.push(row.tag);
    map.set(row.kudos_id, arr);
  }
  return map;
}

async function hydrateKudosRows(
  rows: KudosRow[],
  viewerId: string,
): Promise<KudosCard[]> {
  const userIds = Array.from(
    new Set(rows.flatMap((r) => [r.sender_id, r.receiver_id])),
  );
  const ids = rows.map((r) => r.id);

  const [profiles, likedSet, tagMap] = await Promise.all([
    fetchProfilesByIds(userIds),
    fetchKudosLikesForUser(ids, viewerId),
    fetchHashtagsByKudosIds(ids),
  ]);

  return rows.map<KudosCard>((r) => ({
    id: r.id,
    sender: profiles.get(r.sender_id) ?? fallbackUser(r.sender_id),
    receiver: profiles.get(r.receiver_id) ?? fallbackUser(r.receiver_id),
    createdAt: r.created_at,
    title: r.title,
    content: r.content,
    hashtags: tagMap.get(r.id) ?? [],
    images: r.image_urls ?? [],
    likeCount: r.like_count,
    likedByMe: likedSet.has(r.id),
    canLike: r.sender_id !== viewerId,
  }));
}

// Returns array of kudos IDs to intersect, or null when no filters are active.
// Exported so the page can resolve once and feed both list fetchers.
export async function resolveFilteredKudosIds(
  filters: KudosFilters,
): Promise<string[] | null> {
  if (!filters.hashtag && !filters.department) return null;
  const supabase = await createClient();

  let ids: string[] | null = null;
  if (filters.hashtag) {
    const { data } = await supabase
      .from('kudos_hashtags')
      .select('kudos_id')
      .eq('tag', filters.hashtag);
    ids = ((data ?? []) as { kudos_id: string }[]).map((r) => r.kudos_id);
  }

  if (filters.department) {
    const { data } = await supabase
      .from('profiles')
      .select('id')
      .eq('department', filters.department);
    const userIds = ((data ?? []) as { id: string }[]).map((r) => r.id);

    if (userIds.length === 0) return [];

    const { data: kudosRows } = await supabase
      .from('kudos')
      .select('id')
      .or(
        `sender_id.in.(${userIds.join(',')}),receiver_id.in.(${userIds.join(',')})`,
      );
    const deptKudosIds = ((kudosRows ?? []) as { id: string }[]).map((r) => r.id);

    ids = ids === null ? deptKudosIds : ids.filter((id) => deptKudosIds.includes(id));
  }

  return ids ?? [];
}

// ============================================================================
// Public API
// ============================================================================

export async function getViewerId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function listHighlightKudos(
  viewerId: string,
  filteredIds: string[] | null,
  limit = 5,
): Promise<KudosCard[]> {
  try {
    const supabase = await createClient();
    if (filteredIds !== null && filteredIds.length === 0) return [];

    let query = supabase
      .from('kudos')
      .select(
        'id, sender_id, receiver_id, title, content, image_urls, created_at, like_count',
      )
      .order('like_count', { ascending: false })
      .limit(limit);
    if (filteredIds !== null) query = query.in('id', filteredIds);
    const { data, error } = await query;
    if (error) {
      console.error('[listHighlightKudos] Query error:', error);
      return [];
    }
    return hydrateKudosRows((data ?? []) as KudosRow[], viewerId);
  } catch (err) {
    console.error('[listHighlightKudos] Exception:', err);
    return [];
  }
}

export async function listAllKudos(
  viewerId: string,
  filteredIds: string[] | null,
  limit = 20,
): Promise<KudosCard[]> {
  try {
    const supabase = await createClient();
    if (filteredIds !== null && filteredIds.length === 0) return [];

    let query = supabase
      .from('kudos')
      .select(
        'id, sender_id, receiver_id, title, content, image_urls, created_at, like_count',
      )
      .order('created_at', { ascending: false })
      .limit(limit);
    if (filteredIds !== null) query = query.in('id', filteredIds);
    const { data, error } = await query;
    if (error) {
      console.error('[listAllKudos] Query error:', error);
      return [];
    }
    return hydrateKudosRows((data ?? []) as KudosRow[], viewerId);
  } catch (err) {
    console.error('[listAllKudos] Exception:', err);
    return [];
  }
}

export async function getSidebarStats(viewerId: string): Promise<SidebarStats> {
  try {
    const supabase = await createClient();

    const [received, sent, heartsAgg, boxesOpened, boxesUnopened] = await Promise.all([
      supabase
        .from('kudos')
        .select('id', { count: 'exact', head: true })
        .eq('receiver_id', viewerId),
      supabase
        .from('kudos')
        .select('id', { count: 'exact', head: true })
        .eq('sender_id', viewerId),
      // supabase-js keys aggregate selects by COLUMN name, not the aggregate name:
      // `.select('like_count.sum()')` → `{ like_count: number | null }`.
      supabase
        .from('kudos')
        .select('like_count.sum()')
        .eq('receiver_id', viewerId)
        .single<{ like_count: number | null }>(),
      supabase
        .from('secret_boxes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', viewerId)
        .eq('opened', true),
      supabase
        .from('secret_boxes')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', viewerId)
        .eq('opened', false),
    ]);

    return {
      kudosReceived: received.count ?? 0,
      kudosSent: sent.count ?? 0,
      heartsReceived: heartsAgg.data?.like_count ?? 0,
      secretBoxesOpened: boxesOpened.count ?? 0,
      secretBoxesUnopened: boxesUnopened.count ?? 0,
    };
  } catch (err) {
    console.error('[getSidebarStats] Exception:', err);
    return {
      kudosReceived: 0,
      kudosSent: 0,
      heartsReceived: 0,
      secretBoxesOpened: 0,
      secretBoxesUnopened: 0,
    };
  }
}

export async function listGiftRecipients(limit = 10): Promise<GiftRecipient[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('gift_recipients')
      .select('id, user_id, prize_description')
      .order('awarded_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[listGiftRecipients] Query error:', error);
      return [];
    }

    const rows = (data ?? []) as {
      id: string;
      user_id: string;
      prize_description: string;
    }[];

    const profiles = await fetchProfilesByIds(rows.map((r) => r.user_id));

    return rows.map<GiftRecipient>((r) => {
      const u = profiles.get(r.user_id) ?? fallbackUser(r.user_id);
      return {
        id: r.id,
        name: u.name,
        avatarUrl: u.avatarUrl,
        prizeDescription: r.prize_description,
        user: u,
      };
    });
  } catch (err) {
    console.error('[listGiftRecipients] Exception:', err);
    return [];
  }
}

export async function listHashtags(): Promise<string[]> {
  try {
    const supabase = await createClient();
    // Bounded fetch — the create form needs a suggestion list, not the universe
    // of every tag ever used. 500 rows is plenty for a dropdown autocomplete.
    const { data, error } = await supabase
      .from('kudos_hashtags')
      .select('tag')
      .limit(500);
    if (error) {
      console.error('[listHashtags] Query error:', error);
      return [];
    }
    const tags = new Set<string>(((data ?? []) as { tag: string }[]).map((r) => r.tag));
    return Array.from(tags).sort();
  } catch (err) {
    console.error('[listHashtags] Exception:', err);
    return [];
  }
}

export async function listDepartments(): Promise<string[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('department')
      .not('department', 'is', null);
    if (error) {
      console.error('[listDepartments] Query error:', error);
      return [];
    }
    const set = new Set<string>(
      ((data ?? []) as { department: string }[]).map((r) => r.department ?? ''),
    );
    return Array.from(set).filter(Boolean).sort();
  } catch (err) {
    console.error('[listDepartments] Exception:', err);
    return [];
  }
}

export async function getTotalKudosCount(): Promise<number> {
  try {
    const supabase = await createClient();
    const { count, error } = await supabase
      .from('kudos')
      .select('id', { count: 'exact', head: true });
    if (error) {
      console.error('[getTotalKudosCount] Query error:', error);
      return 0;
    }
    return count ?? 0;
  } catch (err) {
    console.error('[getTotalKudosCount] Exception:', err);
    return 0;
  }
}

// Recipients for the Viết Kudo autocomplete — every profile except the viewer.
export async function listRecipients(viewerId: string): Promise<RecipientOption[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('id, display_name, avatar_url, department')
      .neq('id', viewerId)
      .order('display_name', { ascending: true });

    if (error) {
      console.error('[listRecipients] Query error:', error);
      return [];
    }

    return ((data ?? []) as ProfileRow[]).map<RecipientOption>((r) => ({
      id: r.id,
      displayName: r.display_name ?? 'Sunner',
      avatarUrl: r.avatar_url,
      department: r.department,
    }));
  } catch (err) {
    console.error('[listRecipients] Exception:', err);
    return [];
  }
}

// Returns up to `limit` distinct receiver names, with deterministic size variation.
// Static board — no interactivity per scope.
export async function listSpotlightNames(limit = 80): Promise<SpotlightName[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('kudos')
      .select('receiver_id')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[listSpotlightNames] Query error:', error);
      return [];
    }

    const receiverIds = Array.from(
      new Set(((data ?? []) as { receiver_id: string }[]).map((r) => r.receiver_id)),
    );
    const profiles = await fetchProfilesByIds(receiverIds);

    // Deterministic size + highlight assignment so SSR + client render match.
    return Array.from(profiles.values()).map((u, idx) => {
      const sizeBucket = idx % 5;
      const size: SpotlightName['size'] =
        sizeBucket === 0 ? 'lg' : sizeBucket < 3 ? 'md' : 'sm';
      return {
        id: u.id,
        name: u.name,
        size,
        highlighted: idx === 0, // first receiver highlighted, like the design
      };
    });
  } catch (err) {
    console.error('[listSpotlightNames] Exception:', err);
    return [];
  }
}
