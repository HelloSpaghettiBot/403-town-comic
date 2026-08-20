import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, Check, Eye, ImagePlus, LogIn, PackageCheck, Save, Shield, ShoppingBag, Swords, UserPlus, Wifi, X, type LucideIcon } from 'lucide-react';
import { Link } from 'wouter';
import { DataState, SectionHeading } from '@/components/game-shell';

type Card = { id: string; name: string; faction: string; role: string; rarity: string; image?: string; attack: number; health: number; ability: string; owned?: number };
type User = { id: string; handle: string; email: string; avatar?: string; credits: number };
type Deck = { id: string; name: string; cardIds: string[] };
type MatchPlayer = { userId: string; handle: string; board: Card[]; boardHp?: number[]; handCount: number; hand: Card[]; deckCount: number; discard: Card[]; hp: number; energy: number; isYou: boolean };
type MatchView = { id: string; status: 'waiting' | 'active' | 'complete'; turnUserId: string; winnerUserId?: string; log: string[]; players: MatchPlayer[] };

const TOKEN_KEY = '403-town-account-token';
const avatarPresets = [
  { id: 'sigil-403', label: '403' },
  { id: 'atrisk', label: 'AR' },
  { id: 'koding', label: 'KO' },
  { id: 'chroma', label: 'CH' },
  { id: 'grid', label: 'GR' },
  { id: 'zero', label: 'ZE' },
  { id: 'zerobyte', label: 'ZB' },
];

async function api<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`/api/tcg${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'The 403 TCG server did not accept that command.');
  return payload as T;
}

function useAccount() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api<{ user: User }>('/me', {}, token)
      .then((payload) => {
        if (alive) setUser(payload.user);
      })
      .catch((error) => {
        localStorage.removeItem(TOKEN_KEY);
        if (alive) {
          setToken(null);
          setUser(null);
          setMessage(error instanceof Error ? error.message : 'Sign in to continue.');
        }
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  return { token, setToken, user, setUser, loading, message, setMessage };
}

export function OnlinePage() {
  const { setToken, user, setUser, loading, message, setMessage } = useAccount();
  const [mode, setMode] = useState<'login' | 'register'>('register');
  const [busy, setBusy] = useState(false);

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const data = new FormData(event.currentTarget);
    try {
      const payload = await api<{ token: string; user: User }>(mode === 'register' ? '/auth/register' : '/auth/login', {
        method: 'POST',
        body: JSON.stringify({ handle: data.get('handle'), email: data.get('email'), password: data.get('password') }),
      });
      localStorage.setItem(TOKEN_KEY, payload.token);
      setToken(payload.token);
      setUser(payload.user);
      setMessage(mode === 'register' ? 'Account created. Starter deck saved server side.' : 'Signed in. Your server profile is loaded.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Account command failed.');
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setMessage('Signed out.');
  }

  return (
    <section className="animate-data-in">
      <SectionHeading eyebrow="Account // Server save" title="Player Account" detail="Profiles, decks, story progress, wallet, collection, and live matches are saved on the 403 server." />
      {message && <Notice>{message}</Notice>}
      {loading ? (
        <DataState type="loading" message="Opening account" />
      ) : !user ? (
        <div className="grid gap-4 lg:grid-cols-[.9fr_1.1fr]">
          <form onSubmit={submitAuth} className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <div className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--secondary))]">403 login</div>
                <h2 className="mt-2 font-display text-3xl font-black uppercase text-white">{mode === 'register' ? 'Create player' : 'Sign in'}</h2>
              </div>
              {mode === 'register' ? <UserPlus className="text-[hsl(var(--primary))]" /> : <LogIn className="text-[hsl(var(--primary))]" />}
            </div>
            {mode === 'register' && <Field name="handle" label="Handle" autoComplete="nickname" />}
            <Field name="email" label="Email" type="email" autoComplete="email" />
            <Field name="password" label="Password" type="password" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} />
            <button disabled={busy} className="mt-5 w-full bg-white px-5 py-4 font-display text-sm font-black uppercase tracking-[.16em] text-black hover:bg-[hsl(var(--primary))] disabled:opacity-60">
              {mode === 'register' ? 'Create profile' : 'Sign in'}
            </button>
            <button type="button" onClick={() => setMode(mode === 'register' ? 'login' : 'register')} className="mt-3 w-full border border-[hsl(var(--border))] px-5 py-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-white">
              {mode === 'register' ? 'I already have an account' : 'Create a new account'}
            </button>
          </form>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Server-side story progress', 'Saved deck lists', 'Saved pack pulls', 'Resume live battles'].map((item) => (
              <div key={item} className="border border-white/10 bg-[#090b0f] p-5 font-display text-base font-black uppercase tracking-[.08em] text-white">
                <Check className="mb-6 text-[hsl(var(--accent))]" size={18} />
                {item}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <aside className="border border-[hsl(var(--border))] bg-[#080a0d] p-5">
            <div className="flex items-center gap-4">
              <AvatarBadge avatar={user.avatar} handle={user.handle} />
              <div className="min-w-0">
                <div className="truncate font-display text-3xl font-black uppercase text-white">{user.handle}</div>
                <div className="mt-1 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]">{user.credits} coins</div>
              </div>
            </div>
            <button onClick={signOut} className="mt-5 w-full border border-[hsl(var(--border))] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-white">Sign out</button>
          </aside>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <AppTile href="/tcg/arena" icon={Wifi} eyebrow="Online" title="Arena" detail="Resume or start a live versus match." />
            <AppTile href="/tcg/deck-builder" icon={PackageCheck} eyebrow="Deck" title="Builder" detail="Edit the deck saved to your account." />
            <AppTile href="/tcg/story" icon={Swords} eyebrow="Solo" title="Story" detail="Earn coins and save campaign progress." />
            <AppTile href="/tcg/collection" icon={Eye} eyebrow="Cards" title="Collection" detail="Review the cards you own." />
            <AppTile href="/tcg/shop" icon={ShoppingBag} eyebrow="Market" title="Shop" detail="Open packs with earned coins." />
            <AppTile href="/tcg/profile" icon={Shield} eyebrow="Profile" title="Icon" detail="Set the identity other players see." />
          </div>
        </div>
      )}
    </section>
  );
}

export function ArenaPage() {
  const { token, user, loading, message, setMessage } = useAccount();
  const [match, setMatch] = useState<MatchView | null>(null);
  const [queued, setQueued] = useState(false);
  const [busy, setBusy] = useState(false);
  const you = match?.players.find((player) => player.isYou);
  const opponent = match?.players.find((player) => !player.isYou);
  const isYourTurn = Boolean(match && you && match.turnUserId === you.userId && match.status === 'active');

  useEffect(() => {
    if (!token) return;
    api<{ match: MatchView | null }>('/matches/active', {}, token).then((payload) => setMatch(payload.match)).catch(() => undefined);
  }, [token]);

  useEffect(() => {
    if (!token || !queued || match) return;
    const interval = window.setInterval(() => {
      api<{ status: 'queued' | 'matched'; match?: MatchView }>('/matchmaking/join', { method: 'POST', body: '{}' }, token)
        .then((payload) => {
          if (payload.match) {
            setMatch(payload.match);
            setQueued(false);
            setMessage('Opponent connected. The arena is live.');
          }
        })
        .catch((error) => setMessage(error instanceof Error ? error.message : 'Matchmaking failed.'));
    }, 3000);
    return () => window.clearInterval(interval);
  }, [token, queued, match, setMessage]);

  useEffect(() => {
    if (!token || !match || match.status !== 'active') return;
    const interval = window.setInterval(() => {
      api<{ match: MatchView }>(`/matches/${match.id}`, {}, token).then((payload) => setMatch(payload.match)).catch(() => undefined);
    }, 2500);
    return () => window.clearInterval(interval);
  }, [token, match?.id, match?.status]);

  async function joinQueue() {
    if (!token) return;
    setBusy(true);
    setMessage('');
    try {
      const payload = await api<{ status: 'queued' | 'matched'; match?: MatchView }>('/matchmaking/join', { method: 'POST', body: '{}' }, token);
      if (payload.match) {
        setMatch(payload.match);
        setQueued(false);
        setMessage('Match resumed from the server.');
      } else {
        setQueued(true);
        setMessage('Searching for an opponent.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Matchmaking failed.');
    } finally {
      setBusy(false);
    }
  }

  async function sendAction(action: 'play' | 'attack' | 'endTurn', cardId?: string) {
    if (!token || !match) return;
    setBusy(true);
    try {
      const payload = await api<{ match: MatchView }>(`/matches/${match.id}/actions`, { method: 'POST', body: JSON.stringify({ action, cardId }) }, token);
      setMatch(payload.match);
      setMessage('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'That move could not be played.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="animate-data-in">
      {!(match && you && opponent) && <SectionHeading eyebrow="Arena // Versus" title="Online Arena" detail="A compact live battlefield built for phone play first." />}
      {message && <Notice>{message}</Notice>}
      {loading ? (
        <DataState type="loading" message="Opening arena" />
      ) : !user || !token ? (
        <AuthRequired title="Sign in before entering the arena." />
      ) : match && you && opponent ? (
        <VersusBattlefield match={match} you={you} opponent={opponent} isYourTurn={isYourTurn} busy={busy} onAction={sendAction} />
      ) : (
        <div className="tcg-arena-lobby grid min-h-[62dvh] place-items-center border border-[hsl(var(--border))] bg-[radial-gradient(circle_at_center,rgba(0,216,255,.16),transparent_42%),#05070a] p-5 text-center">
          <div className="max-w-sm">
            <div className="mx-auto mb-5 grid h-24 w-24 place-items-center border border-[hsl(var(--primary)/.55)] bg-[hsl(var(--primary)/.08)] font-display text-3xl font-black text-white shadow-[0_0_42px_rgba(0,216,255,.18)]">403</div>
            <h2 className="font-display text-4xl font-black uppercase leading-none text-white">Find a rival signal.</h2>
            <p className="mt-4 font-mono-ui text-[10px] uppercase leading-5 tracking-widest text-[hsl(var(--muted-foreground))]">Matches save on the server. Close the browser and return here to continue the same battlefield.</p>
            <button onClick={joinQueue} disabled={busy || queued} className="mt-7 inline-flex w-full items-center justify-center gap-2 bg-[hsl(var(--primary))] px-5 py-4 font-display text-sm font-black uppercase tracking-[.16em] text-[#071014] disabled:opacity-60">
              <Wifi size={16} /> {queued ? 'Searching...' : 'Enter matchmaking'}
            </button>
            <Link href="/tcg/deck-builder" className="mt-3 inline-flex w-full items-center justify-center gap-2 border border-[hsl(var(--border))] px-5 py-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-white">
              <PackageCheck size={14} /> Edit deck
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export function DeckBuilderPage() {
  const { token, user, loading, message, setMessage } = useAccount();
  const [cards, setCards] = useState<Card[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState('');
  const [deckIds, setDeckIds] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const selectedDeck = useMemo(() => decks.find((deck) => deck.id === selectedDeckId) ?? decks[0], [decks, selectedDeckId]);
  const cardMap = useMemo(() => new Map(cards.map((card) => [card.id, card])), [cards]);
  const deckCounts = useMemo(() => deckIds.reduce<Record<string, number>>((counts, id) => {
    counts[id] = (counts[id] ?? 0) + 1;
    return counts;
  }, {}), [deckIds]);

  useEffect(() => {
    if (!token) return;
    let alive = true;
    api<{ decks: Deck[]; cards: Card[] }>('/decks', {}, token)
      .then((payload) => {
        if (!alive) return;
        setCards(payload.cards);
        setDecks(payload.decks);
        setSelectedDeckId((current) => current || payload.decks[0]?.id || '');
        setDeckIds(payload.decks[0]?.cardIds || []);
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Decks are unavailable.'));
    return () => {
      alive = false;
    };
  }, [token, setMessage]);

  useEffect(() => {
    if (selectedDeck) setDeckIds(selectedDeck.cardIds);
  }, [selectedDeck]);

  function addCard(cardId: string) {
    const card = cardMap.get(cardId);
    const owned = card?.owned ?? 0;
    const inDeck = deckIds.filter((id) => id === cardId).length;
    if (deckIds.length >= 30) return setMessage('Deck is full.');
    if (owned && inDeck >= owned) return setMessage('You have already added every owned copy of that card.');
    setDeckIds((current) => [...current, cardId]);
  }

  function removeCard(index: number) {
    setDeckIds((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  async function saveDeck() {
    if (!token || !selectedDeck) return;
    setBusy(true);
    try {
      const payload = await api<{ deck: Deck }>(`/decks/${selectedDeck.id}`, { method: 'PUT', body: JSON.stringify({ name: selectedDeck.name, cardIds: deckIds }) }, token);
      setDecks((current) => current.map((deck) => (deck.id === payload.deck.id ? payload.deck : deck)));
      setMessage('Deck saved server side.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Deck save failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="animate-data-in">
      <SectionHeading eyebrow="Deck // Builder" title="Deck Builder" detail="Build one saved arena deck without scrolling through the full online lobby." />
      {message && <Notice>{message}</Notice>}
      {loading ? (
        <DataState type="loading" message="Opening deck builder" />
      ) : !user || !token ? (
        <AuthRequired title="Sign in before editing decks." />
      ) : (
        <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
          <aside className="border border-[hsl(var(--border))] bg-[#080a0d] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--secondary))]">Saved list</div>
                <h2 className="mt-1 truncate font-display text-2xl font-black uppercase text-white">{selectedDeck?.name || 'Starter deck'}</h2>
              </div>
              <button onClick={saveDeck} disabled={busy || deckIds.length < 5} className="grid h-11 w-11 place-items-center border border-[hsl(var(--primary))] text-[hsl(var(--primary))] disabled:opacity-40" aria-label="Save deck"><Save size={17} /></button>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 font-mono-ui text-[8px] uppercase tracking-wider text-white/45">
              <div className="border border-white/10 p-2">Cards<br /><span className="text-white">{deckIds.length}/30</span></div>
              <div className="border border-white/10 p-2">Min<br /><span className="text-white">5</span></div>
              <div className="border border-white/10 p-2">Save<br /><span className="text-[hsl(var(--primary))]">Server</span></div>
            </div>
            <div className="mt-4 max-h-[48dvh] space-y-2 overflow-auto pr-1">
              {deckIds.map((cardId, index) => {
                const card = cardMap.get(cardId);
                return (
                  <button key={`${cardId}-${index}`} onClick={() => removeCard(index)} className="flex w-full items-center justify-between gap-3 border border-white/10 bg-white/[.025] px-3 py-2 text-left hover:border-[hsl(var(--secondary))]">
                    <span className="min-w-0">
                      <span className="block truncate font-display text-sm font-black uppercase text-white">{card?.name || cardId}</span>
                      <span className="font-mono-ui text-[8px] uppercase tracking-wider text-white/45">{card ? `${card.attack} ATK // ${card.health} HP` : 'Card'}</span>
                    </span>
                    <X size={14} className="shrink-0 text-[hsl(var(--secondary))]" />
                  </button>
                );
              })}
            </div>
          </aside>
          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-3 sm:p-4">
            <div className="mb-3 flex items-center justify-between font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
              <span>Owned card library</span>
              <span className="text-[hsl(var(--primary))]">Owned / in deck / left</span>
            </div>
            <div className="deck-library-grid grid grid-cols-2 gap-3 overflow-auto pr-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {cards.map((card) => {
                const owned = card.owned ?? 0;
                const inDeck = deckCounts[card.id] ?? 0;
                const left = Math.max(0, owned - inDeck);
                const canAdd = deckIds.length < 30 && left > 0;
                return (
                  <button key={card.id} onClick={() => addCard(card.id)} disabled={!canAdd} className={`group overflow-hidden border bg-[#080a0d] text-left transition-colors ${canAdd ? 'border-white/10 hover:border-[hsl(var(--primary))]' : 'border-white/5 opacity-45'}`}>
                    <div className="aspect-[3/4] bg-black"><CardArt card={card} /></div>
                    <div className="p-2">
                      <div className="truncate font-display text-sm font-black uppercase text-white">{card.name}</div>
                      <div className="mt-1 font-mono-ui text-[8px] uppercase tracking-wider text-[hsl(var(--primary))]">{card.rarity}</div>
                      <div className="mt-2 grid grid-cols-3 gap-1 text-center font-mono-ui text-[7px] uppercase tracking-wider text-white/45">
                        <span className="border border-white/10 py-1">Own {owned}</span>
                        <span className="border border-white/10 py-1">Deck {inDeck}</span>
                        <span className={`border py-1 ${left ? 'border-[hsl(var(--primary)/.4)] text-[hsl(var(--primary))]' : 'border-[hsl(var(--secondary)/.35)] text-[hsl(var(--secondary))]'}`}>Add {left}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export function ProfilePage() {
  const [token] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState<User | null>(null);
  const [handle, setHandle] = useState('');
  const [avatar, setAvatar] = useState('sigil-403');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!token) return;
    api<{ user: User }>('/me', {}, token)
      .then((payload) => {
        setUser(payload.user);
        setHandle(payload.user.handle);
        setAvatar(payload.user.avatar || 'sigil-403');
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : 'Profile unavailable.'));
  }, [token]);

  async function saveProfile() {
    if (!token) return;
    setBusy(true);
    setMessage('');
    try {
      const payload = await api<{ user: User }>('/me/profile', { method: 'PATCH', body: JSON.stringify({ handle, avatar }) }, token);
      setUser(payload.user);
      setHandle(payload.user.handle);
      setAvatar(payload.user.avatar || 'sigil-403');
      setMessage('Profile saved.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Profile save failed.');
    } finally {
      setBusy(false);
    }
  }

  function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return setMessage('Choose an image file for your profile icon.');
    if (file.size > 500_000) return setMessage('Profile images need to be under 500 KB.');
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <section>
      <SectionHeading eyebrow="Player profile // account icon" title="Profile" detail="Set the handle and icon other players see in the 403 Town TCG." />
      {message && <Notice>{message}</Notice>}
      {!token ? (
        <AuthRequired title="Sign in to build your profile." />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <aside className="border border-[hsl(var(--border))] bg-[#080a0d] p-6">
            <div className="grid place-items-center">
              <AvatarBadge avatar={avatar} handle={handle || user?.handle || '403'} large />
              <div className="mt-5 text-center">
                <div className="font-display text-3xl font-black uppercase text-white">{handle || user?.handle || 'Player'}</div>
                <div className="mt-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]">{user?.credits ?? 0} coins</div>
              </div>
            </div>
          </aside>
          <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] p-5 sm:p-6">
            <label className="block">
              <span className="mb-2 block font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Player handle</span>
              <input value={handle} onChange={(event) => setHandle(event.target.value)} className="w-full border border-[hsl(var(--border))] bg-black px-4 py-3 font-display text-xl font-black uppercase text-white outline-none focus:border-[hsl(var(--primary))]" />
            </label>
            <div className="mt-6">
              <div className="mb-3 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">403 icon presets</div>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-7">
                {avatarPresets.map((preset) => (
                  <button key={preset.id} onClick={() => setAvatar(preset.id)} className={`grid h-16 place-items-center border font-display text-lg font-black uppercase ${avatar === preset.id ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : 'border-white/10 bg-black/30 text-white/65 hover:border-[hsl(var(--secondary))]'}`}>
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="mt-6 flex cursor-pointer items-center justify-center gap-2 border border-dashed border-[hsl(var(--primary)/.45)] px-4 py-4 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.08)]">
              <ImagePlus size={16} /> Upload profile image
              <input type="file" accept="image/*" className="sr-only" onChange={uploadAvatar} />
            </label>
            <button onClick={saveProfile} disabled={busy || handle.trim().length < 2} className="mt-6 flex w-full items-center justify-center gap-2 bg-white px-5 py-4 font-display text-sm font-black uppercase tracking-[.16em] text-black hover:bg-[hsl(var(--primary))] disabled:opacity-50">
              <Save size={16} /> Save profile
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

function VersusBattlefield({ match, you, opponent, isYourTurn, busy, onAction }: { match: MatchView; you: MatchPlayer; opponent: MatchPlayer; isYourTurn: boolean; busy: boolean; onAction: (action: 'play' | 'attack' | 'endTurn', cardId?: string) => void }) {
  const [detail, setDetail] = useState<{ card: Card; zone: 'hand' | 'board' | 'enemy' } | null>(null);
  const status = match.status === 'complete' ? (match.winnerUserId === you.userId ? 'Victory saved' : 'Match complete') : isYourTurn ? 'Your turn' : `${opponent.handle}'s turn`;

  return (
    <div className="tcg-app-board overflow-hidden border border-[hsl(var(--border))] bg-[#05070a]">
      <div className="tcg-app-board-header grid grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-[hsl(var(--border))] bg-[linear-gradient(90deg,rgba(0,216,255,.08),rgba(255,0,153,.08),transparent)] px-2 py-2 sm:px-3">
        <PlayerPill player={opponent} tone="secondary" align="left" />
        <div className={`border px-3 py-2 text-center font-display text-[10px] font-black uppercase tracking-widest ${isYourTurn ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]' : 'border-[hsl(var(--secondary))] text-[hsl(var(--secondary))]'}`}>{status}</div>
        <PlayerPill player={you} tone="primary" align="right" />
      </div>
      <div className="tcg-app-table p-2">
        <div className="mb-2 flex items-center justify-center gap-1.5">
          {Array.from({ length: opponent.handCount }).map((_, index) => <CardBack key={index} />)}
        </div>
        <div className="grid gap-2">
          <BoardLane label={`${opponent.handle} field`} cards={opponent.board} cardHp={opponent.boardHp} zone="enemy" onInspect={(card) => setDetail({ card, zone: 'enemy' })} />
          <div className="grid grid-cols-3 gap-1 text-center font-mono-ui text-[8px] uppercase tracking-wider text-white/35">
            <div className="border border-white/10 bg-black/30 py-1.5">Draw</div>
            <div className={`border py-1.5 ${isYourTurn ? 'border-[hsl(var(--accent))] text-[hsl(var(--accent))]' : 'border-white/10 bg-black/30'}`}>Main</div>
            <div className="border border-white/10 bg-black/30 py-1.5">End</div>
          </div>
          <BoardLane label="Your field" cards={you.board} cardHp={you.boardHp} zone="board" onInspect={(card) => setDetail({ card, zone: 'board' })} />
        </div>
        <div className="tcg-log-ticker mt-2 grid gap-1 border border-white/10 bg-black/30 px-2 py-2">
          {(match.log.length ? match.log.slice(0, 2) : ['Match waiting for the next command.']).map((item, index) => (
            <div key={`${item}-${index}`} className="truncate font-mono-ui text-[8px] uppercase tracking-wider text-white/45">{item}</div>
          ))}
        </div>
      </div>
      <div className="tcg-hand-dock border-t border-[hsl(var(--border))] bg-[#07090d] p-2">
        <div className="mb-1 flex items-center justify-between font-mono-ui text-[8px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
          <span>Your hand</span>
          <span className="text-[hsl(var(--primary))]">{you.energy} energy // {you.deckCount} deck</span>
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {you.hand.map((card, index) => <BattleMiniCard key={`${card.id}-${index}`} card={card} onClick={() => setDetail({ card, zone: 'hand' })} />)}
        </div>
        <button onClick={() => onAction('endTurn')} disabled={!isYourTurn || busy || match.status === 'complete'} className="mt-2 flex w-full items-center justify-center gap-2 bg-[hsl(var(--secondary))] px-4 py-2.5 font-display text-xs font-black uppercase tracking-widest text-[#190810] disabled:opacity-40">
          <ArrowRight size={15} /> Pass turn
        </button>
      </div>
      <CardDetailModal
        card={detail?.card ?? null}
        title={detail?.zone === 'enemy' ? 'Enemy card' : detail?.zone === 'hand' ? 'Hand card' : 'Field card'}
        primaryLabel={detail?.zone === 'hand' ? 'Play to field' : detail?.zone === 'board' ? 'Attack rival core' : undefined}
        secondaryLabel="Close"
        onPrimary={() => {
          if (!detail) return;
          if (detail.zone === 'hand') onAction('play', detail.card.id);
          if (detail.zone === 'board') onAction('attack', detail.card.id);
          setDetail(null);
        }}
        onSecondary={() => setDetail(null)}
        onClose={() => setDetail(null)}
        disabledPrimary={busy || !isYourTurn || match.status === 'complete'}
      />
    </div>
  );
}

function BoardLane({ label, cards, cardHp, zone, onInspect }: { label: string; cards: Card[]; cardHp?: number[]; zone: 'board' | 'enemy'; onInspect: (card: Card) => void }) {
  const slots = Array.from({ length: 3 });
  return (
    <div className={`tcg-board-lane border border-white/10 ${zone === 'enemy' ? 'bg-[hsl(var(--secondary)/.035)]' : 'bg-[hsl(var(--primary)/.035)]'} p-2`}>
      <div className="mb-1 font-mono-ui text-[8px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{label}</div>
      <div className="grid grid-cols-3 gap-1.5">
        {slots.map((_, index) => {
          const card = cards[index];
          const fieldCard = card ? { ...card, health: cardHp?.[index] ?? card.health } : null;
          return (
            <div key={`${label}-${index}`} className="min-h-24 border border-dashed border-white/10 bg-black/25 p-1 sm:min-h-32">
              {fieldCard ? <BattleMiniCard card={fieldCard} onClick={() => onInspect(fieldCard)} field /> : <div className="grid h-full min-h-20 place-items-center font-mono-ui text-[7px] uppercase tracking-wider text-white/18">Slot</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BattleMiniCard({ card, onClick, field = false }: { card: Card; onClick: () => void; field?: boolean }) {
  return (
    <button onClick={onClick} className={`${field ? 'w-full' : 'min-w-[4.7rem] sm:min-w-[5.4rem]'} group overflow-hidden border border-white/10 bg-[#080a0d] text-left shadow-[0_8px_18px_rgba(0,0,0,.35)]`}>
      <div className="aspect-[3/4] bg-black"><CardArt card={card} /></div>
      <div className="px-1.5 py-1">
        <div className="truncate font-display text-[9px] font-black uppercase leading-none text-white sm:text-[10px]">{card.name}</div>
        <div className="mt-0.5 font-mono-ui text-[7px] uppercase leading-none tracking-normal text-[hsl(var(--primary))]">{card.attack} ATK // {card.health} HP</div>
      </div>
    </button>
  );
}

function CardDetailModal({ card, title, primaryLabel, secondaryLabel, onPrimary, onSecondary, onClose, disabledPrimary }: { card: Card | null; title: string; primaryLabel?: string; secondaryLabel?: string; onPrimary?: () => void; onSecondary?: () => void; onClose: () => void; disabledPrimary?: boolean }) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!card) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => dialogRef.current?.focus());
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [card]);
  if (!card) return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-hidden bg-black/70 p-3 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="card-detail-modal w-full max-w-md overflow-hidden border border-[hsl(var(--primary)/.45)] bg-[#080a0d] shadow-[0_0_80px_rgba(0,216,255,.16)]">
        <div ref={dialogRef} tabIndex={-1} className="flex items-center justify-between border-b border-white/10 px-4 py-3 outline-none">
          <div className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--primary))]">{title}</div>
          <button onClick={onClose} className="grid h-8 w-8 place-items-center border border-white/10 text-white/60 hover:text-white" aria-label="Close card details"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-[108px_1fr] gap-4 p-4">
          <div className="aspect-[3/4] overflow-hidden border border-white/10 bg-black"><CardArt card={card} /></div>
          <div className="min-w-0">
            <div className="truncate font-display text-2xl font-black uppercase text-white">{card.name}</div>
            <div className="mt-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{card.rarity}</div>
            <div className="mt-4 grid grid-cols-2 gap-2 font-mono-ui text-[9px] uppercase tracking-widest">
              <div className="border border-[hsl(var(--secondary)/.35)] bg-[hsl(var(--secondary)/.07)] p-2 text-[hsl(var(--secondary))]">Attack<br /><span className="text-white">{card.attack}</span></div>
              <div className="border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.07)] p-2 text-[hsl(var(--primary))]">HP<br /><span className="text-white">{card.health}</span></div>
            </div>
          </div>
        </div>
        <div className="space-y-3 border-t border-white/10 p-4">
          <div>
            <div className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--accent))]">Ability</div>
            <div className="mt-1 font-display text-lg font-black uppercase text-white">{card.ability}</div>
          </div>
          <p className="font-mono-ui text-[10px] uppercase leading-5 tracking-wider text-white/55">{card.faction} // {card.role}</p>
          <div className="grid grid-cols-2 gap-2 pt-2">
            {secondaryLabel && <button onClick={onSecondary} className="border border-[hsl(var(--border))] px-3 py-3 font-display text-xs font-black uppercase tracking-widest text-white/70">{secondaryLabel}</button>}
            {primaryLabel && <button onClick={onPrimary} disabled={disabledPrimary} className="bg-[hsl(var(--primary))] px-3 py-3 font-display text-xs font-black uppercase tracking-widest text-[#071014] disabled:opacity-45">{primaryLabel}</button>}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlayerPill({ player, tone, align }: { player: MatchPlayer; tone: 'primary' | 'secondary'; align: 'left' | 'right' }) {
  return (
    <div className={`min-w-0 ${align === 'right' ? 'text-right' : ''}`}>
      <div className={`truncate font-display text-sm font-black uppercase text-[hsl(var(--${tone}))]`}>{player.handle}</div>
      <div className="mt-1 h-1.5 bg-white/10"><div className={`h-full bg-[hsl(var(--${tone}))]`} style={{ width: `${Math.max(0, Math.min(100, (player.hp / 240) * 100))}%` }} /></div>
      <div className="mt-1 font-mono-ui text-[7px] uppercase tracking-wider text-white/45">{player.hp} HP // {player.energy} EN</div>
    </div>
  );
}

function AppTile({ href, icon: Icon, eyebrow, title, detail }: { href: string; icon: LucideIcon; eyebrow: string; title: string; detail: string }) {
  return (
    <Link href={href} className="group border border-[hsl(var(--border))] bg-[#080a0d] p-5 transition-colors hover:border-[hsl(var(--primary))]">
      <div className="mb-8 flex items-center justify-between">
        <span className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--primary))]">{eyebrow}</span>
        <Icon size={18} className="text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))]" />
      </div>
      <div className="font-display text-3xl font-black uppercase leading-none text-white">{title}</div>
      <p className="mt-3 font-mono-ui text-[10px] uppercase leading-5 tracking-widest text-[hsl(var(--muted-foreground))]">{detail}</p>
    </Link>
  );
}

function AuthRequired({ title }: { title: string }) {
  return (
    <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] p-6">
      <div className="font-display text-3xl font-black uppercase text-white">{title}</div>
      <p className="mt-3 max-w-xl font-mono-ui text-[10px] uppercase leading-5 tracking-widest text-[hsl(var(--muted-foreground))]">Online TCG data is tied to a player account so progress can come back on the next device or browser session.</p>
      <Link href="/tcg/online" className="mt-6 inline-flex items-center gap-2 bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]"><LogIn size={16} /> Open account</Link>
    </div>
  );
}

function Notice({ children }: { children: string }) {
  return <div className="mb-4 border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.08)] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]">{children}</div>;
}

function Field({ name, label, type = 'text', autoComplete }: { name: string; label: string; type?: string; autoComplete?: string }) {
  return (
    <label className="mb-3 block">
      <span className="mb-2 block font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{label}</span>
      <input name={name} type={type} autoComplete={autoComplete} required className="w-full border border-[hsl(var(--border))] bg-black px-4 py-3 font-mono-ui text-sm text-white outline-none focus:border-[hsl(var(--primary))]" />
    </label>
  );
}

function CardArt({ card }: { card: Card }) {
  if (card.image) return <img src={card.image} alt={card.name} className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />;
  return (
    <div className="relative grid h-full w-full place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,rgba(0,216,255,.22),transparent_34%),linear-gradient(135deg,#06080c,#12141a_48%,#050609)]">
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,216,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,153,.16)_1px,transparent_1px)] [background-size:18px_18px]" />
      <span className="relative font-display text-2xl font-black uppercase text-white">{card.name.slice(0, 2)}</span>
    </div>
  );
}

function CardBack() {
  return (
    <div className="grid h-16 w-11 shrink-0 place-items-center border border-[hsl(var(--secondary)/.45)] bg-[radial-gradient(circle_at_center,rgba(255,0,153,.22),transparent_45%),linear-gradient(135deg,#11151c,#050609)] p-1 shadow-[0_0_18px_rgba(255,0,153,.12)] sm:h-20 sm:w-14">
      <div className="grid h-full w-full place-items-center border border-white/10 bg-[linear-gradient(135deg,rgba(0,216,255,.16),rgba(255,0,153,.14)),#020304] font-display text-sm font-black text-white sm:text-lg">403</div>
    </div>
  );
}

function AvatarBadge({ avatar, handle, large = false }: { avatar?: string; handle: string; large?: boolean }) {
  const size = large ? 'h-36 w-36 text-5xl' : 'h-14 w-14 text-xl';
  if (avatar?.startsWith('data:image/')) return <img src={avatar} alt={`${handle} profile icon`} className={`${size} border border-[hsl(var(--primary)/.55)] object-cover shadow-[0_0_32px_rgba(0,216,255,.18)]`} />;
  const preset = avatarPresets.find((item) => item.id === avatar);
  return (
    <div className={`${size} grid shrink-0 place-items-center border border-[hsl(var(--primary)/.55)] bg-[radial-gradient(circle_at_35%_30%,rgba(0,216,255,.28),transparent_38%),radial-gradient(circle_at_70%_65%,rgba(255,0,153,.24),transparent_40%),#05070a] font-display font-black uppercase text-white shadow-[0_0_32px_rgba(0,216,255,.18)]`}>
      {preset?.label || handle.slice(0, 2)}
    </div>
  );
}
