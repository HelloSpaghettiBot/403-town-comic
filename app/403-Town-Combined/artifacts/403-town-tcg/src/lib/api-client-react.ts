import { useState } from 'react';

export type Card = {
  id: string;
  name: string;
  faction: string;
  role: string;
  rarity: string;
  image: string;
  attack: number;
  health: number;
  ability: string;
  owned: number;
};

export type MatchSummary = {
  id: string;
  opponent: string;
  result: string;
  mode: string;
  date: string;
  score: string;
};

export type ShopItem = {
  id: string;
  name: string;
  kind: string;
  price: number;
  currency: string;
  detail: string;
  featured?: boolean;
};

export type GameProfile = {
  id: string;
  handle: string;
  rank: string;
  rating: number;
  credits: number;
  shards: number;
};

export type QueueState = {
  id: string;
  mode: string;
  status: string;
  estimatedSeconds: number;
};

const cardAsset = (name: string) => `${import.meta.env.BASE_URL}cards/${name}`;

const profile: GameProfile = {
  id: 'player-403',
  handle: 'AT_RISK',
  rank: 'SILVER // 03',
  rating: 1248,
  credits: 2840,
  shards: 18,
};

const cards: Card[] = [
  {
    id: 'darkcomit',
    name: 'DARKCOMIT.exe',
    faction: 'SYSTEM ANARCHY',
    role: 'VIRUS / AUTONOMOUS THREAT',
    rarity: 'LEGENDARY',
    image: cardAsset('file_000000001ca881fb82b3a2016fe6eb81_1787170099114.webp'),
    attack: 96,
    health: 94,
    ability: 'ROLLBACK BITE',
    owned: 1,
  },
  {
    id: 'hunta',
    name: 'HUNTA.exe',
    faction: 'BLACKOUT PROTOCOL',
    role: 'VIRUS / HUNTER',
    rarity: 'EPIC',
    image: cardAsset('file_00000000bc4081f7adc8ab344169d8a4_1787170099192.webp'),
    attack: 94,
    health: 90,
    ability: 'TRACE HUNT',
    owned: 2,
  },
  {
    id: 'redkey',
    name: 'REDKEY',
    faction: 'BLACKOUT PROTOCOL',
    role: 'BREACHER / OVERRIDE',
    rarity: 'LEGENDARY',
    image: cardAsset('file_00000000d81481fd8e8b3ab6a03391e5_1787170099213.webp'),
    attack: 98,
    health: 95,
    ability: 'MASTER OVERRIDE',
    owned: 2,
  },
  {
    id: 'crosstalk',
    name: 'CROSSTALK',
    faction: 'BLACKOUT PROTOCOL',
    role: 'SIGNAL JAMMER / DISRUPTOR',
    rarity: 'EPIC',
    image: cardAsset('file_00000000c3fc81fda7ea25538d8d4e6d_1787170099237.webp'),
    attack: 93,
    health: 95,
    ability: 'STATIC SPILL',
    owned: 3,
  },
  {
    id: 'latch',
    name: 'LATCH',
    faction: 'BLACKOUT PROTOCOL',
    role: 'GRAPPLER / ENFORCER',
    rarity: 'RARE',
    image: cardAsset('file_000000005b4881fd90271cb2c338fe8e_1787170099260.webp'),
    attack: 92,
    health: 93,
    ability: 'CATCH HOLD',
    owned: 4,
  },
];

const shopItems: ShopItem[] = [
  { id: 'neon-pack', name: 'NEON BREACH', kind: 'BOOSTER PACK', price: 240, currency: 'CREDITS', detail: '5 cards // guaranteed rare+', featured: true },
  { id: 'blackout-pack', name: 'BLACKOUT PROTOCOL', kind: 'FACTION PACK', price: 300, currency: 'CREDITS', detail: '6 cards // faction weighted' },
  { id: 'signal-shards', name: 'SIGNAL SHARDS', kind: 'CRAFTING CURRENCY', price: 80, currency: 'CREDITS', detail: 'Unlock a targeted card imprint' },
];

const matches: MatchSummary[] = [
  { id: 'm-01', opponent: 'VANTA_404', result: 'VICTORY', mode: 'Ranked', date: '18 AUG 2026', score: '2 — 1' },
  { id: 'm-02', opponent: 'NULLBLOOM', result: 'DEFEAT', mode: 'Ranked', date: '17 AUG 2026', score: '0 — 2' },
  { id: 'm-03', opponent: 'KERNEL_PANIC', result: 'VICTORY', mode: 'Solo // Episode 01', date: '16 AUG 2026', score: '3 — 0' },
];

type QueryResult<T> = {
  data: T;
  isLoading: false;
  isError: false;
};

const query = <T,>(data: T): QueryResult<T> => ({ data, isLoading: false, isError: false });

export const getGetGameProfileQueryKey = () => ['game-profile'] as const;
export const getListCardsQueryKey = () => ['game-cards'] as const;
export const getListRecentMatchesQueryKey = () => ['game-matches'] as const;
export const getListShopItemsQueryKey = () => ['game-shop'] as const;

export function useGetGameProfile(_options?: unknown): QueryResult<GameProfile> {
  return query(profile);
}

export function useListCards(_options?: unknown): QueryResult<Card[]> {
  return query(cards);
}

export function useListRecentMatches(_options?: unknown): QueryResult<MatchSummary[]> {
  return query(matches);
}

export function useListShopItems(_options?: unknown): QueryResult<ShopItem[]> {
  return query(shopItems);
}

export function useQueueForMatch() {
  const [isPending, setIsPending] = useState(false);

  const mutate = (
    input: { data: { mode: string } },
    options?: { onSuccess?: (state: QueueState) => void; onError?: (error: Error) => void },
  ) => {
    if (isPending) return;
    setIsPending(true);

    window.setTimeout(() => {
      try {
        const state: QueueState = {
          id: `queue-${Date.now()}`,
          mode: input.data.mode,
          status: 'SEARCHING',
          estimatedSeconds: input.data.mode === 'ranked' ? 18 : 4,
        };
        options?.onSuccess?.(state);
      } catch (error) {
        options?.onError?.(error instanceof Error ? error : new Error('Queue failed'));
      } finally {
        setIsPending(false);
      }
    }, 250);
  };

  return { mutate, isPending };
}
