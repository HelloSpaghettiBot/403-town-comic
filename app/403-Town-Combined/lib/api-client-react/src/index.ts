export * from "./generated/api";
export * from "./generated/api.schemas";
export { setBaseUrl, setAuthTokenGetter } from "./custom-fetch";
export type { AuthTokenGetter } from "./custom-fetch";

import { useMutation, useQuery } from "@tanstack/react-query";

export interface Card {
  id: string;
  name: string;
  faction: string;
  role: string;
  rarity: string;
  image?: string;
  attack: number;
  health: number;
  ability: string;
  owned?: number;
}

export interface GameProfile {
  handle: string;
  rank: string;
  rating: number;
  credits: number;
  shards: number;
}

export interface MatchSummary {
  id: string;
  opponent: string;
  mode: string;
  result: string;
  score: string;
  date: string;
}

export interface ShopItem {
  id: string;
  name: string;
  kind: string;
  price: number;
  currency: string;
  detail: string;
  featured?: boolean;
}

export const getListCardsQueryKey = () => ["cards"] as const;
export const getGetGameProfileQueryKey = () => ["game-profile"] as const;
export const getListRecentMatchesQueryKey = () => ["recent-matches"] as const;
export const getListShopItemsQueryKey = () => ["shop-items"] as const;

export function useListCards(options?: { query?: { queryKey?: readonly unknown[] } }) {
  return useQuery<Card[]>({
    queryKey: options?.query?.queryKey ?? getListCardsQueryKey(),
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useGetGameProfile(options?: { query?: { queryKey?: readonly unknown[] } }) {
  return useQuery<GameProfile>({
    queryKey: options?.query?.queryKey ?? getGetGameProfileQueryKey(),
    queryFn: async () => ({
      handle: localStorage.getItem("403-player-handle") || "Operator",
      rank: "Story Mode",
      rating: 403,
      credits: Number(localStorage.getItem("403-credits") || 2840),
      shards: 90,
    }),
    staleTime: 1000,
  });
}

export function useListRecentMatches(options?: { query?: { queryKey?: readonly unknown[] } }) {
  return useQuery<MatchSummary[]>({
    queryKey: options?.query?.queryKey ?? getListRecentMatchesQueryKey(),
    queryFn: async () => [
      { id: "m-001", opponent: "Static Wraith", mode: "Solo", result: "Victory", score: "120-0", date: "Today" },
      { id: "m-002", opponent: "Relay Enforcer", mode: "Solo", result: "Victory", score: "94-18", date: "Yesterday" },
    ],
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useListShopItems(options?: { query?: { queryKey?: readonly unknown[] } }) {
  return useQuery<ShopItem[]>({
    queryKey: options?.query?.queryKey ?? getListShopItemsQueryKey(),
    queryFn: async () => [],
    staleTime: Number.POSITIVE_INFINITY,
  });
}

export function useQueueForMatch() {
  return useMutation({
    mutationFn: async ({ data }: { data: { mode: string } }) => ({
      status: `${data.mode} queue open`,
      estimatedSeconds: data.mode === "ranked" ? 18 : 9,
    }),
  });
}
