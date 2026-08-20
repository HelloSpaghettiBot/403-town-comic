import { useEffect, useMemo, useState } from 'react';

export type ComicEpisode = {
  id: string;
  slug: string;
  number: number;
  title: string;
  subtitle?: string;
  summary: string;
  status?: string;
  published?: string;
  cover?: string;
  download?: string;
  pages: string[];
};

type EpisodeManifest = {
  episodes: ComicEpisode[];
};

type EpisodeState = {
  episodes: ComicEpisode[];
  isLoading: boolean;
  error: string | null;
};

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const adminComicsKey = '403-admin-comics';

function withBase(path: string | undefined): string | undefined {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

function normalizeEpisode(episode: ComicEpisode): ComicEpisode {
  return {
    ...episode,
    cover: withBase(episode.cover),
    download: withBase(episode.download),
    pages: episode.pages.map((page) => withBase(page) ?? page),
  };
}

function adminEpisodes(): ComicEpisode[] {
  try {
    const stored = JSON.parse(localStorage.getItem(adminComicsKey) ?? '[]') as Array<Omit<ComicEpisode, 'pages'> & { pages: string[] | string }>;
    return stored.map((episode) => ({
      ...episode,
      pages: Array.isArray(episode.pages) ? episode.pages : episode.pages.split('\n').map((page) => page.trim()).filter(Boolean),
    }));
  } catch {
    return [];
  }
}

export function useComicEpisodes(): EpisodeState {
  const [state, setState] = useState<EpisodeState>({ episodes: [], isLoading: true, error: null });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch(`${base}/content/episodes.json`, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Episode manifest returned ${response.status}`);
        const data = (await response.json()) as EpisodeManifest;
        const bySlug = new Map([...(data.episodes ?? []), ...adminEpisodes()].map((episode) => [episode.slug, episode]));
        const episodes = [...bySlug.values()]
          .map(normalizeEpisode)
          .sort((a, b) => b.number - a.number);
        if (!cancelled) setState({ episodes, isLoading: false, error: null });
      } catch (error) {
        if (!cancelled) {
          setState({
            episodes: [],
            isLoading: false,
            error: error instanceof Error ? error.message : 'Unable to load episodes',
          });
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useComicEpisode(slug: string | undefined) {
  const state = useComicEpisodes();
  const episode = useMemo(
    () => state.episodes.find((item) => item.slug === slug) ?? null,
    [slug, state.episodes],
  );
  return { ...state, episode };
}
