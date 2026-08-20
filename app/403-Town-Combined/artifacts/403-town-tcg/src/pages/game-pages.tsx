import { useEffect, useRef, useState } from 'react';
import { Activity, ArrowUpRight, Check, Coins, Crosshair, HeartPulse, PackageOpen, Plus, Radio, RotateCcw, Save, Search, Shield, ShoppingCart, Sparkles, Swords, Target, Trophy, X, Zap } from 'lucide-react';
import { Link } from 'wouter';
import { getListCardsQueryKey, getListRecentMatchesQueryKey, getListShopItemsQueryKey, useGetGameProfile, useListCards, useListRecentMatches, useListShopItems, type Card, type MatchSummary, type ShopItem } from '@/lib/api-client-react';
import { DataState, SectionHeading } from '@/components/game-shell';

const cardImage = (group: 'Heroes' | 'Villains' | 'Extras', file: string) => `${import.meta.env.BASE_URL}cards/named/403-Town-Cards-Named-Split/${group}/${file}.webp`;
const fallbackCards: Card[] = [
  { id: 'atrisk', name: 'atRisk', faction: '403 Town', role: 'Signal Leader', rarity: 'LEGENDARY', image: cardImage('Heroes', 'atRisk'), attack: 84, health: 92, ability: 'Signal Rally', owned: 2 },
  { id: 'koding', name: 'KODING', faction: '403 Town', role: 'Street Defender', rarity: 'EPIC', image: cardImage('Heroes', 'Koding'), attack: 88, health: 86, ability: 'Code Swing', owned: 2 },
  { id: 'chroma', name: 'CHROMA', faction: '403 Town', role: 'Color Keeper', rarity: 'EPIC', image: cardImage('Heroes', 'Chroma'), attack: 72, health: 104, ability: 'Restore Hue', owned: 2 },
  { id: 'grid', name: 'GRID', faction: '403 Town', role: 'Firewall Guard', rarity: 'RARE', image: cardImage('Heroes', 'Grid'), attack: 70, health: 112, ability: 'Block Packet', owned: 3 },
  { id: 'flicker', name: 'FLICKER', faction: '403 Town', role: 'Speed Signal', rarity: 'RARE', image: cardImage('Heroes', 'Flicker'), attack: 76, health: 82, ability: 'Quick Blink', owned: 2 },
  { id: 'sue-shi', name: 'SUE-SHI', faction: '403 Town', role: 'Blade Cook', rarity: 'EPIC', image: cardImage('Heroes', 'Sue-Shi'), attack: 90, health: 84, ability: 'Neon Slice', owned: 2 },
  { id: 'backslash', name: 'BACKSLASH', faction: 'Blackout Protocol', role: 'Code Cutter', rarity: 'RARE', image: cardImage('Villains', 'Backslash'), attack: 87, health: 86, ability: 'Slash Route', owned: 1 },
  { id: 'crosstalk', name: 'CROSSTALK', faction: 'Blackout Protocol', role: 'Signal Jammer', rarity: 'RARE', image: cardImage('Villains', 'CrossTalk'), attack: 93, health: 97, ability: 'Static Spill', owned: 2 },
  { id: 'ghostroute', name: 'GHOSTROUTE', faction: 'Blackout Protocol', role: 'Path Haunter', rarity: 'RARE', image: cardImage('Villains', 'GhostRoute'), attack: 82, health: 88, ability: 'Route Fade', owned: 1 },
  { id: 'latch', name: 'LATCH', faction: 'Blackout Protocol', role: 'Grappler', rarity: 'RARE', image: cardImage('Villains', 'Latch'), attack: 92, health: 96, ability: 'Catch Hold', owned: 2 },
  { id: 'redkey', name: 'REDKEY', faction: 'Blackout Protocol', role: 'Breacher', rarity: 'EPIC', image: cardImage('Villains', 'RedKey'), attack: 98, health: 95, ability: 'Master Override', owned: 1 },
  { id: 'softlock', name: 'SOFTLOCK', faction: 'Blackout Protocol', role: 'Turn Freezer', rarity: 'EPIC', image: cardImage('Villains', 'SoftLock'), attack: 80, health: 108, ability: 'Freeze Input', owned: 1 },
  { id: 'zerobyte', name: 'ZEROBYTE', faction: 'Static Void', role: 'Corruptor', rarity: 'LEGENDARY', image: cardImage('Villains', 'ZeroByte'), attack: 106, health: 96, ability: 'USB Tendrils', owned: 1 },
  { id: '5miles', name: '5MILES', faction: 'Extras', role: 'Runner', rarity: 'COMMON', image: cardImage('Extras', '5miles'), attack: 66, health: 72, ability: 'Long Route', owned: 2 },
  { id: 'darkcomit', name: 'DARKCOMIT.exe', faction: 'System Anarchy', role: 'Autonomous Threat', rarity: 'LEGENDARY', image: cardImage('Extras', 'DarkComit.exe'), attack: 96, health: 94, ability: 'Rollback Bite', owned: 1 },
  { id: 'err0r', name: 'ERR0R', faction: 'Extras', role: 'Crash Signal', rarity: 'COMMON', image: cardImage('Extras', 'Err0r'), attack: 68, health: 70, ability: 'Error Burst', owned: 2 },
  { id: 'hunta', name: 'HUNTA.exe', faction: 'Blackout Protocol', role: 'Virus Hunter', rarity: 'EPIC', image: cardImage('Extras', 'HUNTA.exe'), attack: 94, health: 90, ability: 'Trace Hunt', owned: 1 },
  { id: 'proxy', name: 'PROXY', faction: 'Extras', role: 'Mask Signal', rarity: 'COMMON', image: cardImage('Extras', 'Proxy'), attack: 64, health: 88, ability: 'Mirror Ping', owned: 2 },
  { id: 'ravenkey', name: 'RAVENKEY', faction: 'Extras', role: 'Key Runner', rarity: 'RARE', image: cardImage('Extras', 'RavenKey'), attack: 83, health: 80, ability: 'Key Drop', owned: 1 },
];

const fallbackCardArt: Record<string, string> = {
  ...Object.fromEntries(fallbackCards.map((card) => [card.id, card.image ?? ''])),
};

const ownedStorageKey = '403-card-copies';
const creditsStorageKey = '403-credits';
const adminCardsStorageKey = '403-admin-cards';
const adminPacksStorageKey = '403-admin-packs';
const deckStorageKey = '403-active-deck';

type AdminPack = ShopItem & { size: number; guaranteedRare: boolean; pool?: string };

function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
}

function adminCards(): Card[] {
  return readStored<Card[]>(adminCardsStorageKey, []);
}

function adminPacks(): AdminPack[] {
  return readStored<AdminPack[]>(adminPacksStorageKey, []);
}

function fullCardPool(cards: Card[] = []): Card[] {
  const byId = new Map([...cards, ...packPool, ...adminCards()].map((card) => [card.id, card]));
  return [...byId.values()];
}

function ownedOverrides(): Record<string, number> {
  try {
    return JSON.parse(localStorage.getItem(ownedStorageKey) ?? '{}') as Record<string, number>;
  } catch {
    return {};
  }
}

function mergeOwned(cards: Card[]): Card[] {
  const overrides = ownedOverrides();
  return fullCardPool(cards).map((card) => ({ ...card, owned: Math.max(card.owned || 0, overrides[card.id] ?? 0) }));
}

function saveOwned(cards: Card[]) {
  localStorage.setItem(ownedStorageKey, JSON.stringify(Object.fromEntries(cards.map((card) => [card.id, card.owned || 0]))));
}

function localCredits(defaultValue: number) {
  const stored = Number(localStorage.getItem(creditsStorageKey));
  return Number.isFinite(stored) ? stored : defaultValue;
}

function saveCredits(value: number) {
  localStorage.setItem(creditsStorageKey, String(value));
}

const rarityWeight: Record<string, number> = { COMMON: 0, RARE: 1, EPIC: 2, LEGENDARY: 3 };
const packPool: Card[] = fallbackCards;
const maxBattleHand = 4;
const maxBattleField = 3;

function openPack(size: number, guaranteedRare = false, pool: Card[] = fullCardPool()) {
  return Array.from({ length: size }, (_, index) => {
    const eligible = pool.filter((card) => !(guaranteedRare && index === size - 1) || rarityWeight[card.rarity.toUpperCase()] >= 1);
    return eligible[Math.floor(Math.random() * eligible.length)];
  });
}

function StatChip({ label, value, color = 'primary' }: { label: string; value: string | number; color?: 'primary' | 'secondary' | 'accent' }) {
  return <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] px-3 py-2"><div className="font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{label}</div><div className={`mt-0.5 font-mono-ui text-sm font-bold text-[hsl(var(--${color}))]`}>{value}</div></div>;
}

function rarityStars(rarity: string) {
  const count = rarity.toUpperCase() === 'LEGENDARY' ? 4 : rarity.toUpperCase() === 'EPIC' ? 3 : rarity.toUpperCase() === 'RARE' ? 2 : 1;
  return '★'.repeat(count);
}

function cardLore(card: Card) {
  const lore: Record<string, string> = {
    atrisk: 'atRisk carries the loudest signal on Date Street. His voice cuts through drained zones and helps the crew remember who they are.',
    koding: 'KODING protects the crew with street-smart code and a bat marked by every fight he survived before the color drain reached Sultan.',
    chroma: 'CHROMA keeps lost color alive inside her signal. When the town turns gray, she can still find the hidden hue under the static.',
    grid: 'GRID is the firewall bodyguard of the crew, built to hold a line when the Blackout Protocol tries to push through.',
    flicker: 'FLICKER moves like a skipped frame, appearing between signals before corrupted code can lock onto his route.',
    'sue-shi': 'SUE-SHI is a robot chef and blade fighter in loose urban gear, slicing through corrupted code without ever losing her style.',
    backslash: 'BACKSLASH cuts paths apart and turns clean routes into broken commands for the Blackout Protocol.',
    crosstalk: 'CROSSTALK floods the air with false signals until allies cannot tell which sound is real.',
    ghostroute: 'GHOSTROUTE haunts old network roads and pulls travelers into dead paths that should not still exist.',
    latch: 'LATCH grabs onto active code and refuses to let go, holding targets in place while the static closes in.',
    redkey: 'REDKEY carries stolen access commands and opens doors that were sealed to keep the town safe.',
    softlock: 'SOFTLOCK traps decisions in a loop. The card looks still, but every frozen turn gives the enemy more control.',
    zerobyte: 'Zerobyte was Zero before the Static Void answered him. Now his broken code tries to drain color from every digital creature in 403 Town.',
    '5miles': '5MILES runs messages across unstable roads where normal signals fail.',
    darkcomit: 'DARKCOMIT.exe is a rollback threat that rewrites progress and bites into the last clean save point.',
    err0r: 'ERR0R is a crash signal with a harmless grin and dangerous timing.',
    hunta: 'HUNTA.exe tracks active signals through the dark and marks targets for the Blackout Protocol.',
    proxy: 'PROXY hides a true signal behind mirrored noise and keeps allies from being traced.',
    ravenkey: 'RAVENKEY carries hidden access through back routes, dropping keys where the crew needs them most.',
  };
  return lore[card.id] ?? `${card.name} is a ${card.role} from ${card.faction}, carrying a signal shaped by the color drain across 403 Town.`;
}

function abilityEffectDescription(card: Card) {
  const ability = card.ability.toLowerCase();
  if (ability.includes('restore') || ability.includes('rally') || ability.includes('phase') || ability.includes('future')) {
    return 'Effect: Spend 1 energy to restore 14 HP to your signal.';
  }
  if (ability.includes('spill') || ability.includes('block') || ability.includes('mute')) {
    return 'Effect: Spend 1 energy to jam the enemy field for 8 damage.';
  }
  if (ability.includes('freeze')) {
    return 'Effect: Spend 1 energy to slow the enemy counter and deal 8 damage.';
  }
  if (ability.includes('route') || ability.includes('mirror') || ability.includes('key')) {
    return 'Effect: Spend 1 energy to redirect pressure and deal 12 damage.';
  }
  return 'Effect: Spend 1 energy to strike the enemy signal for 18 damage.';
}

function CardThumb({ card, large = false, onClick }: { card: Card; large?: boolean; onClick?: () => void }) {
  return <button onClick={onClick} className={`tcg-card-thumb group relative overflow-hidden border border-[hsl(var(--border))] bg-[#080a0d] text-left transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary))] ${large ? 'aspect-[3/4] w-full' : 'aspect-[3/4] w-full'}`} data-testid={`card-card-${card.id}`}>
    <CardArtwork card={card} />
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#07090b] via-[#07090b]/86 to-transparent px-2 pb-2 pt-10">
      <div className="card-thumb-name truncate font-display text-base font-bold uppercase tracking-wide text-white">{card.name}</div>
      <div className="card-thumb-stats mt-0.5 font-mono-ui text-[8px] uppercase leading-3 tracking-wide text-[hsl(var(--primary))]">{card.rarity} // {card.attack} ATK // {card.health} HP</div>
      <div className="card-thumb-ability mt-0.5 hidden truncate font-mono-ui text-[8px] uppercase tracking-wide text-white/45 sm:block">{card.ability}</div>
    </div>
    <span className="card-thumb-owned absolute right-1.5 top-1.5 border border-[hsl(var(--primary)/.55)] bg-[#080a0d]/80 px-1.5 py-0.5 font-mono-ui text-[9px] text-[hsl(var(--primary))]">x{card.owned || 0}</span>
  </button>;
}

function CardArtwork({ card }: { card: Card }) {
  const image = card.image || fallbackCardArt[card.id];
  if (image) {
    return <img src={image} alt={`${card.name} card art`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />;
  }
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[radial-gradient(circle_at_50%_30%,rgba(0,216,255,.22),transparent_34%),linear-gradient(135deg,#06080c,#12141a_48%,#050609)] p-4">
      <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(0,216,255,.18)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,153,.16)_1px,transparent_1px)] [background-size:18px_18px]" />
      <div className="relative font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--primary))]">{card.faction}</div>
      <div className="relative grid flex-1 place-items-center">
        <div className="grid h-24 w-24 place-items-center rounded-full border border-[hsl(var(--primary)/.45)] bg-black/55 shadow-[0_0_34px_rgba(0,216,255,.18)]">
          <span className="font-display text-4xl font-black uppercase text-white">{card.name.slice(0, 2)}</span>
        </div>
      </div>
      <div className="relative pb-12">
        <div className="font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--secondary))]">{card.rarity}</div>
        <div className="mt-1 font-mono-ui text-[9px] uppercase tracking-wider text-white/45">{card.role}</div>
      </div>
    </div>
  );
}

function StoryBattleCard({ card, selected, removable, action, onSelect, onRemove }: { card: Card; selected?: boolean; removable?: boolean; action?: string; onSelect?: () => void; onRemove?: () => void }) {
  return (
    <div className={`story-battle-card group overflow-hidden border bg-[#080a0d] shadow-[0_10px_24px_rgba(0,0,0,.35)] ${selected ? 'border-[hsl(var(--primary))] ring-1 ring-[hsl(var(--primary))]' : 'border-white/10'}`}>
      <button type="button" onClick={onSelect} className="block w-full text-left">
        <div className="aspect-[3/4] bg-black">
          <CardArtwork card={card} />
        </div>
        <div className="story-battle-card-copy p-2">
          <div className="story-battle-card-name truncate font-display text-xs font-black uppercase text-white sm:text-sm">{card.name}</div>
          <div className="story-battle-card-stats mt-1 font-mono-ui text-[8px] uppercase tracking-wider text-[hsl(var(--primary))]">{card.attack} ATK // {card.health} HP</div>
          <div className="story-battle-card-ability mt-1 line-clamp-2 font-mono-ui text-[8px] uppercase leading-3 tracking-wider text-[hsl(var(--accent))]">{card.ability}</div>
        </div>
      </button>
      {removable && (
        <button type="button" onClick={onRemove} className="w-full border-t border-[hsl(var(--secondary)/.45)] py-1.5 font-mono-ui text-[8px] uppercase tracking-widest text-[hsl(var(--secondary))]">
          Remove
        </button>
      )}
      {action && (
        <div className="border-t border-white/10 py-1.5 text-center font-mono-ui text-[8px] uppercase tracking-widest text-white/35">
          {action}
        </div>
      )}
    </div>
  );
}

function CardDetailModal({ card, title, primaryLabel, secondaryLabel, onPrimary, onSecondary, onClose }: { card: Card | null; title: string; primaryLabel?: string; secondaryLabel?: string; onPrimary?: () => void; onSecondary?: () => void; onClose: () => void }) {
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
        <div className="grid grid-cols-[112px_1fr] gap-4 p-4">
          <div className="aspect-[3/4] overflow-hidden border border-white/10 bg-black">
            <CardArtwork card={card} />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-2xl font-black uppercase text-white">{card.name}</div>
            <div className="mt-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{card.rarity} // {rarityStars(card.rarity)}</div>
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
            <p className="mt-1 font-mono-ui text-[10px] uppercase leading-5 tracking-wider text-[hsl(var(--accent))]">{abilityEffectDescription(card)}</p>
          </div>
          <div>
            <div className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--muted-foreground))]">About</div>
            <p className="mt-1 font-mono-ui text-[10px] uppercase leading-5 tracking-wider text-white/55">{cardLore(card)}</p>
          </div>
          {(primaryLabel || secondaryLabel) && (
            <div className="grid grid-cols-2 gap-2 pt-2">
              {secondaryLabel && <button onClick={onSecondary} className="border border-[hsl(var(--secondary))] px-3 py-3 font-display text-xs font-black uppercase tracking-widest text-[hsl(var(--secondary))]">{secondaryLabel}</button>}
              {primaryLabel && <button onClick={onPrimary} className="bg-[hsl(var(--primary))] px-3 py-3 font-display text-xs font-black uppercase tracking-widest text-[#071014]">{primaryLabel}</button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PackRevealModal({ cards, collectionCards, revealCount, onRevealAll, onClose }: { cards: Card[] | null; collectionCards: Card[]; revealCount: number; onRevealAll: () => void; onClose: () => void }) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!cards) return;
    const previousBodyOverflow = document.body.style.overflow;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      dialogRef.current?.focus();
    });
    return () => {
      document.body.style.overflow = previousBodyOverflow;
      document.documentElement.style.overflow = previousHtmlOverflow;
    };
  }, [cards]);
  if (!cards) return null;
  const complete = revealCount >= cards.length;
  return (
    <div className="pack-reveal-overlay fixed inset-0 z-50 overflow-hidden bg-[#020304]/95 p-3 text-white backdrop-blur-md" role="dialog" aria-modal="true">
      <div ref={dialogRef} tabIndex={-1} className="mx-auto flex h-full max-w-6xl flex-col justify-center py-4 outline-none">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <div className="font-mono-ui text-[10px] uppercase tracking-[.26em] text-[hsl(var(--secondary))]">Pack opened // server saved</div>
            <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none text-white sm:text-6xl">Signal Reveal</h2>
          </div>
          <button onClick={onClose} className="grid h-10 w-10 place-items-center border border-white/15 text-white/65 hover:text-white" aria-label="Close pack reveal"><X size={18} /></button>
        </div>
        <div className="pack-reveal-stage relative overflow-hidden border border-[hsl(var(--primary)/.45)] bg-[radial-gradient(circle_at_50%_20%,rgba(0,216,255,.2),transparent_36%),radial-gradient(circle_at_50%_80%,rgba(255,0,153,.18),transparent_42%),#05070a] p-4 shadow-[0_0_120px_rgba(0,216,255,.14)] sm:p-7">
          <div className="absolute inset-x-0 top-0 h-px animate-signal bg-[hsl(var(--primary))]" />
          <div className="mb-5 grid grid-cols-3 gap-2 font-mono-ui text-[8px] uppercase tracking-widest text-white/45 sm:text-[10px]">
            <div className="border border-white/10 bg-black/30 p-2">Cards<br /><span className="text-white">{Math.min(revealCount, cards.length)} / {cards.length}</span></div>
            <div className="border border-white/10 bg-black/30 p-2">Status<br /><span className="text-[hsl(var(--primary))]">{complete ? 'Complete' : 'Revealing'}</span></div>
            <div className="border border-white/10 bg-black/30 p-2">Vault<br /><span className="text-[hsl(var(--accent))]">Saved</span></div>
          </div>
          <div className="pack-reveal-grid grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
            {cards.map((card, index) => {
              const revealed = index < revealCount;
              const owned = collectionCards.find((ownedCard) => ownedCard.id === card.id)?.owned ?? card.owned;
              return (
                <button key={`${card.id}-${index}`} onClick={() => revealed && setSelectedCard({ ...card, owned })} className={`pack-reveal-card group relative aspect-[3/4] overflow-hidden border text-left ${revealed ? 'is-revealed border-[hsl(var(--primary)/.55)] bg-[#080a0d]' : 'border-[hsl(var(--secondary)/.45)] bg-[#05070a]'}`} style={{ animationDelay: `${index * 120}ms` }}>
                  {revealed ? (
                    <>
                      <CardArtwork card={{ ...card, owned }} />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#05070a] via-[#05070a]/90 to-transparent px-2 pb-2 pt-12">
                        <div className="truncate font-display text-sm font-black uppercase text-white sm:text-base">{card.name}</div>
                        <div className="mt-1 font-mono-ui text-[8px] uppercase tracking-wider text-[hsl(var(--primary))]">{card.rarity}</div>
                      </div>
                    </>
                  ) : (
                    <div className="grid h-full place-items-center bg-[radial-gradient(circle_at_center,rgba(255,0,153,.24),transparent_44%),linear-gradient(135deg,#11151c,#050609)]">
                      <div className="grid h-[78%] w-[70%] place-items-center border border-white/10 bg-[linear-gradient(135deg,rgba(0,216,255,.18),rgba(255,0,153,.16)),#020304] font-display text-3xl font-black text-white">403</div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--accent))]"><Trophy size={14} className="mr-1 inline" /> Every revealed card is already in your collection.</div>
            <button onClick={complete ? onClose : onRevealAll} className="bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]">{complete ? 'Close reveal' : 'Reveal all'}</button>
          </div>
        </div>
      </div>
      <CardDetailModal card={selectedCard} title="Revealed card" onClose={() => setSelectedCard(null)} />
    </div>
  );
}

function LivePanel() {
  const [mode, setMode] = useState('ranked');
  return <div className="relative overflow-hidden border border-[hsl(var(--primary)/.45)] bg-[linear-gradient(120deg,rgba(0,216,255,.09),transparent_55%),hsl(var(--card))] p-6 sm:p-8">
    <div className="absolute right-0 top-0 h-24 w-24 border-l border-b border-[hsl(var(--primary)/.18)]" />
    <div className="mb-5 flex items-center justify-between"><div className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-[.22em] text-[hsl(var(--primary))]"><span className="h-2 w-2 animate-pulse bg-[hsl(var(--primary))]" /> Online arena</div><Radio size={18} className="text-[hsl(var(--secondary))]" /></div>
    <h2 className="max-w-xl font-display text-4xl font-black uppercase leading-[.9] tracking-wide text-white sm:text-6xl">The town is<br /><span className="text-[hsl(var(--primary))]">already playing.</span></h2>
    <p className="mt-5 max-w-md font-mono-ui text-[11px] leading-5 text-[hsl(var(--muted-foreground))]">Create a player profile, save a deck, and face another player across a live 403 Town battlefield.</p>
    <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-end">
      <label className="font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Match protocol<select value={mode} onChange={(e) => setMode(e.target.value)} className="mt-2 block w-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] px-3 py-2 font-display text-sm uppercase tracking-wider text-white outline-none focus:border-[hsl(var(--primary))]" data-testid="select-match-mode"><option value="ranked">Ranked / ladder</option><option value="casual">Casual / open net</option></select></label>
      <Link href="/tcg/online" className="flex h-10 items-center justify-center gap-2 bg-[hsl(var(--primary))] px-5 font-display text-sm font-black uppercase tracking-[.12em] text-[#071014] transition-transform hover:-translate-y-0.5" data-testid="link-find-online-match"><Swords size={15} /> Enter online arena</Link>
    </div>
    <div className="mt-5 border-t border-[hsl(var(--primary)/.2)] pt-4 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]" data-testid="status-live-online">Online matchmaking is open.</div>
  </div>;
}

export function HomePage() {
  const profileQuery = useGetGameProfile({ query: { queryKey: ['home-profile'] } });
  const cardsQuery = useListCards({ query: { queryKey: getListCardsQueryKey() } });
  const matchesQuery = useListRecentMatches({ query: { queryKey: getListRecentMatchesQueryKey() } });
  const profile = profileQuery.data;
  const cards = mergeOwned(cardsQuery.data?.length ? cardsQuery.data : fallbackCards);
  const matches = matchesQuery.data ?? [];
  return <div className="animate-data-in space-y-7">
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><div className="mb-2 font-mono-ui text-[10px] uppercase tracking-[.24em] text-[hsl(var(--secondary))]">Chapter 01 // Color Missing</div><h1 className="font-display text-5xl font-black uppercase leading-[.85] tracking-tight text-white sm:text-7xl">Welcome back,<br /><span className="text-[hsl(var(--primary))]">{profile?.handle ?? 'player'}.</span></h1></div><div className="font-mono-ui text-[10px] uppercase leading-5 tracking-widest text-[hsl(var(--muted-foreground))] sm:text-right">Rank: {profile?.rank ?? 'Unranked'}<br />Rating: {profile?.rating ?? '—'} // Sector 403</div></div>
    <LivePanel />
    <section className="grid gap-5 xl:grid-cols-[1fr_1fr_1.25fr]">
      <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-5"><div className="mb-5 flex items-center justify-between"><div className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Player record</div><Activity size={15} className="text-[hsl(var(--accent))]" /></div><div className="grid grid-cols-2 gap-3"><StatChip label="Rating" value={profile?.rating ?? '—'} /><StatChip label="Rank" value={profile?.rank ?? '—'} color="secondary" /><StatChip label="Credits" value={profile?.credits ?? '—'} /><StatChip label="Shards" value={profile?.shards ?? '—'} color="secondary" /></div></div>
      <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-5"><div className="mb-5 flex items-center justify-between"><div className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Deck status</div><Shield size={15} className="text-[hsl(var(--primary))]" /></div><div className="flex items-end gap-4"><div className="font-display text-5xl font-black uppercase text-white">Ready</div></div><div className="mt-4 h-1 bg-[hsl(var(--muted))]"><div className="h-full w-[82%] bg-[hsl(var(--primary))]" /></div><Link href="/tcg/collection" className="mt-5 flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))] hover:text-white" data-testid="link-open-collection">Build deck <ArrowUpRight size={13} /></Link></div>
      <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-5"><div className="mb-4 flex items-center justify-between"><div className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Recent matches</div><Link href="/tcg/matches" className="font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--primary))]" data-testid="link-all-matches">Match history</Link></div>{matchesQuery.isLoading ? <DataState type="loading" message="Reading match record" /> : matchesQuery.isError ? <DataState type="error" message="Match record unavailable" /> : matches.length === 0 ? <DataState type="empty" message="No matches on record" /> : <div className="space-y-2">{matches.slice(0, 3).map((match) => <MatchRow match={match} key={match.id} />)}</div>}</div>
    </section>
    <section><div className="mb-4 flex items-center justify-between"><div className="font-mono-ui text-[10px] uppercase tracking-[.2em] text-[hsl(var(--muted-foreground))]">Featured owned cards</div><Link href="/tcg/collection" className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]" data-testid="link-view-collection">View all <ArrowUpRight size={13} className="inline" /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-5">{cards.slice(0, 5).map((card) => <CardThumb card={card} key={card.id} />)}</div></section>
  </div>;
}

function MatchRow({ match }: { match: MatchSummary }) {
  const won = /victory|win/.test(match.result.toLowerCase());
  return <div className="flex items-center gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--background)/.5)] px-3 py-2.5" data-testid={`row-match-${match.id}`}><div className={`h-1.5 w-1.5 ${won ? 'bg-[hsl(var(--accent))]' : 'bg-[hsl(var(--secondary))]'}`} /><div className="min-w-0 flex-1"><div className="truncate font-display text-sm font-bold uppercase text-white">vs. {match.opponent}</div><div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">{match.mode} // {match.date}</div></div><div className={`font-mono-ui text-[10px] uppercase ${won ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--secondary))]'}`}>{match.result}<br /><span className="text-[hsl(var(--muted-foreground))]">{match.score}</span></div></div>;
}

export function BattlePage() {
  const query = useListCards({ query: { queryKey: getListCardsQueryKey() } });
  const cards = mergeOwned(query.data?.length ? query.data : fallbackCards);
  const [phase, setPhase] = useState<'ready' | 'live' | 'ended'>('ready');
  const [turn, setTurn] = useState(1);
  const [energy, setEnergy] = useState(3);
  const [enemyHp, setEnemyHp] = useState(180);
  const [playerHp, setPlayerHp] = useState(120);
  const [hand, setHand] = useState<Card[]>(cards.slice(0, 4));
  const [board, setBoard] = useState<Card[]>([]);
  const [enemyBoard, setEnemyBoard] = useState<Card[]>([]);
  const [selected, setSelected] = useState<Card | null>(null);
  const [log, setLog] = useState(['Battlefield ready', 'Choose a card and take the first lane']);
  useEffect(() => { if (hand.length === 0 && cards.length) setHand(cards.slice(0, 4)); }, [cards, hand.length]);
  const addLog = (entry: string) => setLog((items) => [entry, ...items].slice(0, 7));
  const resetBattle = () => {
    setPhase('ready'); setTurn(1); setEnergy(3); setEnemyHp(180); setPlayerHp(120);
    setHand(cards.slice(0, 4)); setBoard([]); setEnemyBoard([]); setSelected(null);
    setLog(['Battlefield reset', 'Choose a card and take the first lane']);
  };
  const playCard = (card: Card) => {
    if (phase === 'ended' || board.some((item) => item.id === card.id) || energy < 1) return;
    setPhase('live'); setEnergy((value) => value - 1); setBoard((items) => [...items, card]); setHand((items) => items.filter((item) => item.id !== card.id)); setSelected(card);
    addLog(`${card.name} joined the board with ${card.ability}`);
  };
  const endTurn = () => {
    if (phase !== 'live' || board.length === 0) return;
    const damage = board.reduce((total, card) => total + Math.max(8, Math.round(card.attack / 4)), 0);
    const enemyCounter = enemyBoard.length ? enemyBoard.reduce((total, card) => total + Math.round(card.attack / 5), 0) : 12 + Math.floor(Math.random() * 9);
    const nextEnemy = Math.max(0, enemyHp - damage);
    const nextPlayer = Math.max(0, playerHp - enemyCounter);
    setEnemyHp(nextEnemy); setPlayerHp(nextPlayer);
    addLog(`Turn ${turn}: your board dealt ${damage} damage`);
    if (nextEnemy === 0) { setPhase('ended'); addLog('Victory. Null Apostle lost the lane.'); return; }
    if (nextPlayer === 0) { setPhase('ended'); addLog('Defeat. Your signal collapsed.'); return; }
    const enemy = cards[(turn + 1) % cards.length];
    setEnemyBoard([enemy]);
    setTurn((value) => value + 1); setEnergy(Math.min(6, 3 + Math.floor(turn / 2)));
    setHand((items) => [...items, cards[(turn + 3) % cards.length]].slice(-maxBattleHand));
    addLog(`${enemy.name} entered the enemy lane for ${enemyCounter} damage`);
  };
  const useAbility = () => {
    if (!selected || phase === 'ended' || energy < 1) return;
    setEnergy((value) => value - 1);
    if (selected.ability === 'STATIC SPILL' || selected.ability === 'NO SIGNAL') {
      setEnemyBoard([]); addLog(`${selected.name} jammed the counter lane`);
    } else if (selected.ability === 'ROLLBACK BITE' || selected.ability === 'CATCH HOLD') {
      setEnemyHp((value) => Math.max(0, value - 18)); addLog(`${selected.ability} landed for 18 damage`);
    } else {
      setPlayerHp((value) => Math.min(120, value + 14)); addLog(`${selected.ability} restored 14 HP`);
    }
  };
  const status = phase === 'ready' ? 'Practice match' : phase === 'ended' ? (enemyHp === 0 ? 'Lane secured' : 'Signal lost') : 'Combat live';
  return <div className="animate-data-in"><SectionHeading eyebrow="Practice arena // Tactical card combat" title="Battlefield" detail="Test your deck against a local enemy before entering online play." /><div className="grid gap-5 xl:grid-cols-[1fr_280px]">
    <div className="overflow-hidden border border-[hsl(var(--border))] bg-[#0b0d11]">
      <div className="flex items-center justify-between border-b border-[hsl(var(--border))] bg-[hsl(var(--card))] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest"><span className="flex items-center gap-2 text-[hsl(var(--accent))]"><span className="h-2 w-2 animate-pulse bg-[hsl(var(--accent))]" /> {status}</span><span className="text-[hsl(var(--muted-foreground))]">Turn {turn} // {energy} energy</span></div>
      <div className="relative min-h-[520px] space-y-10 p-4 sm:p-8">
        <div><div className="mb-2 flex justify-between font-mono-ui text-[9px] uppercase text-[hsl(var(--secondary))]"><span>Null Apostle // enemy board</span><span>{enemyHp} HP</span></div><div className="h-2 bg-[hsl(var(--muted))]"><div className="h-full bg-[hsl(var(--secondary))] transition-all" style={{ width: `${(enemyHp / 180) * 100}%` }} /></div><div className="mt-3 flex min-h-20 gap-2 border border-dashed border-[hsl(var(--secondary)/.28)] p-2">{enemyBoard.length ? enemyBoard.map((card) => <div key={card.id} className="w-12 opacity-75"><CardThumb card={card} /></div>) : <span className="self-center font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Enemy lane is empty</span>}</div></div>
        <div className="flex items-center justify-center gap-3"><div className="border border-[hsl(var(--primary)/.3)] px-4 py-3 text-center font-mono-ui text-[9px] uppercase text-[hsl(var(--primary))]"><Target className="mx-auto mb-1" size={16} /> Center lane</div><div className="font-mono-ui text-[10px] uppercase text-[hsl(var(--muted-foreground))]">Board pressure decides<br />the next exchange</div></div>
        <div><div className="mb-2 flex justify-between font-mono-ui text-[9px] uppercase text-[hsl(var(--primary))]"><span>YOU // operator board</span><span>{playerHp} HP</span></div><div className="h-2 bg-[hsl(var(--muted))]"><div className="h-full bg-[hsl(var(--primary))] transition-all" style={{ width: `${(playerHp / 120) * 100}%` }} /></div><div className="mt-3 flex min-h-28 gap-2 border border-dashed border-[hsl(var(--primary)/.35)] p-2">{board.length ? board.map((card) => <div key={card.id} onClick={() => setSelected(card)} className={`w-16 cursor-pointer ${selected?.id === card.id ? 'ring-2 ring-[hsl(var(--primary))]' : ''}`}><CardThumb card={card} /></div>) : <span className="self-center font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Deploy a card from hand</span>}</div></div>
        <div className="flex flex-wrap justify-end gap-2"><button onClick={useAbility} disabled={!selected || phase === 'ended' || energy < 1} className="flex items-center gap-2 border border-[hsl(var(--accent))] px-3 py-2 font-display text-xs font-bold uppercase text-[hsl(var(--accent))] disabled:opacity-40"><Zap size={14} /> Use ability</button><button onClick={endTurn} disabled={phase !== 'live' || board.length === 0} className="flex items-center gap-2 bg-[hsl(var(--secondary))] px-4 py-2 font-display text-xs font-black uppercase text-[#190810] disabled:opacity-40"><Crosshair size={15} /> End turn</button></div>
      </div>
      <div className="border-t border-[hsl(var(--border))] p-4"><div className="mb-3 flex items-center justify-between gap-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><span className="flex items-center gap-2"><PackageOpen size={13} /> Hand // deploy one signal</span><span className="text-[hsl(var(--primary))]">{hand.length}/{maxBattleHand} cards</span></div><div className="grid grid-cols-4 gap-2">{hand.map((card) => <div key={card.id} className={selected?.id === card.id ? 'ring-1 ring-[hsl(var(--primary))]' : ''}><CardThumb card={card} onClick={() => playCard(card)} /></div>)}</div></div>
    </div>
    <aside className="space-y-4"><div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] p-4"><div className="mb-3 flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><Radio size={13} className="text-[hsl(var(--primary))]" /> Event feed</div><div className="space-y-3">{log.map((entry, index) => <div key={`${entry}-${index}`} className="border-l border-[hsl(var(--primary)/.4)] pl-3 font-mono-ui text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{entry}</div>)}</div></div><div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] p-4"><div className="mb-3 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Arena notes</div><p className="font-mono-ui text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">Every card adds pressure to the lane. Abilities can break a counterattack, restore your signal, or push the enemy closer to collapse.</p><button onClick={resetBattle} className="mt-4 flex items-center gap-2 text-[hsl(var(--primary))] font-mono-ui text-[10px] uppercase tracking-widest" data-testid="button-reset-battle"><RotateCcw size={13} /> Reset battle</button></div></aside>
  </div></div>;
}

const storyChapters = [
  { title: 'The Color Drain', location: 'SECTOR 403 // LOWER TOWN', text: 'The streetlights blink out one by one. A dead channel whispers your handle, then sends a fragment of impossible color.', enemy: 'SOFTLOCK', hp: 108, reward: 120, choices: ['Trace the whisper', 'Follow the color'] },
  { title: 'Blackout Protocol', location: 'EASTERN RELAY // NODE 9', text: 'The trail leads to a relay being stripped for parts by an old faction. They know why the color is disappearing, but they want your signal first.', enemy: 'LATCH', hp: 116, reward: 180, choices: ['Offer a trade', 'Force the relay open'] },
  { title: 'Zero Echo', location: 'DATE STREET // SULTAN', text: 'A broken recording of Zero repeats under the rain. The voice still sounds like a friend, but the code behind it belongs to Zerobyte.', enemy: 'GHOSTROUTE', hp: 126, reward: 260, choices: ['Protect the recording', 'Break the corruption'] },
  { title: 'Grayline March', location: 'SULTAN BRIDGE // DRAINED EDGE', text: 'Converted minions gather beneath the bridge. Their colors are gone, but pieces of their old signals still fight inside the static.', enemy: 'BACKSLASH', hp: 148, reward: 320, choices: ['Hold the bridge', 'Cut through the line'] },
  { title: 'The Null Choir', location: 'ABANDONED CHURCH // STARTUP', text: 'The Static Void sings through old speakers and turns every echo into a command. The crew has to answer with a stronger signal.', enemy: 'REDKEY', hp: 172, reward: 420, choices: ['Overload the speakers', 'Match the rhythm'] },
  { title: 'Before Zerobyte', location: 'DATE STREET // LOST MEMORY', text: 'Zero appears in a saved memory, still bright and still one of the gang. Then the breach opens, and the first USB tendril reaches for his code.', enemy: 'ZEROBYTE', hp: 196, reward: 560, choices: ['Reach for Zero', 'Shield the crew'] },
];

const storyEnemyCards: Card[] = [
  { ...fallbackCards.find((card) => card.id === 'softlock')!, owned: 0 },
  { ...fallbackCards.find((card) => card.id === 'latch')!, owned: 0 },
  { ...fallbackCards.find((card) => card.id === 'ghostroute')!, owned: 0 },
  { ...fallbackCards.find((card) => card.id === 'backslash')!, owned: 0 },
  { ...fallbackCards.find((card) => card.id === 'redkey')!, owned: 0 },
  { ...fallbackCards.find((card) => card.id === 'zerobyte')!, owned: 0 },
];

const accountTokenKey = '403-town-account-token';
type StoryStage = 'briefing' | 'choice' | 'battle' | 'complete';
type StoryBattleState = {
  enemyHp: number;
  playerHp: number;
  energy: number;
  turn: number;
  deckIds?: string[];
  discardIds?: string[];
  enemyBoardIds?: string[];
  enemyBoardHp?: number[];
  handIds: string[];
  boardIds: string[];
  boardHp?: number[];
  selectedId?: string | null;
  undoableIds: string[];
  log: string[];
};
type StoryProgress = { chapter: number; stage: StoryStage; version: string; updatedAt: string; battleState?: StoryBattleState | null };

function storyDeckForChapter(cards: Card[], chapterIndex: number) {
  const heroIds = ['atrisk', 'koding', 'chroma', 'grid', 'flicker', 'sue-shi'];
  const supportIds = ['5miles', 'proxy', 'ravenkey', 'err0r'];
  const byId = new Map(cards.map((card) => [card.id, card]));
  const selected = [...heroIds, ...supportIds, ...heroIds.slice(0, 2 + (chapterIndex % 3))]
    .map((id) => byId.get(id))
    .filter(Boolean) as Card[];
  return selected.length >= 10 ? selected : cards.slice(0, 12);
}

function enemyDeckForChapter(chapterIndex: number) {
  return Array.from({ length: maxBattleField }, (_, index) => storyEnemyCards[(chapterIndex + index) % storyEnemyCards.length]);
}

function removeOneCard(cards: Card[], cardId: string) {
  const index = cards.findIndex((card) => card.id === cardId);
  if (index < 0) return cards;
  const next = [...cards];
  next.splice(index, 1);
  return next;
}

function removeOneAt<T>(items: T[], index: number) {
  return items.filter((_, itemIndex) => itemIndex !== index);
}

function absorbDamage(cards: Card[], hp: number[], damage: number) {
  let remaining = damage;
  const nextCards: Card[] = [];
  const nextHp: number[] = [];
  const destroyed: string[] = [];
  cards.forEach((card, index) => {
    if (remaining <= 0) {
      nextCards.push(card);
      nextHp.push(hp[index] ?? card.health);
      return;
    }
    const currentHp = hp[index] ?? card.health;
    const afterHit = currentHp - remaining;
    if (afterHit > 0) {
      nextCards.push(card);
      nextHp.push(afterHit);
      remaining = 0;
    } else {
      destroyed.push(card.name);
      remaining = Math.abs(afterHit);
    }
  });
  return { cards: nextCards, hp: nextHp, spill: remaining, destroyed };
}

async function tcgApi<T>(path: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const response = await fetch(`/api/tcg${path}`, { ...options, headers });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || 'The 403 TCG server did not accept that command.');
  return payload as T;
}

function resetStoryCombat(chapterIndex: number, cards: Card[]) {
  const deck = storyDeckForChapter(cards, chapterIndex);
  const enemyBoard = enemyDeckForChapter(chapterIndex).slice(0, 1);
  return {
    enemyHp: storyChapters[Math.min(chapterIndex, storyChapters.length - 1)].hp,
    playerHp: 120,
    energy: 3,
    turn: 1,
    deck: deck.slice(maxBattleHand),
    discard: [] as Card[],
    enemyBoard,
    enemyBoardHp: enemyBoard.map((card) => card.health),
    board: [] as Card[],
    boardHp: [] as number[],
    hand: deck.slice(0, maxBattleHand),
    selected: null as Card | null,
    undoableCards: [] as string[],
    log: cards.length ? ['STORY // server progress loaded', 'DRAW // opening hand ready'] : ['STORY // server progress loaded'],
  };
}

function hydrateStoryBattle(state: StoryBattleState, cards: Card[]) {
  const byId = new Map(cards.map((card) => [card.id, card]));
  const board = state.boardIds.map((id) => byId.get(id)).filter(Boolean).slice(0, maxBattleField) as Card[];
  const hand = state.handIds.map((id) => byId.get(id)).filter(Boolean).slice(0, maxBattleHand) as Card[];
  const deck = (state.deckIds ?? []).map((id) => byId.get(id)).filter(Boolean) as Card[];
  const discard = (state.discardIds ?? []).map((id) => byId.get(id)).filter(Boolean) as Card[];
  const enemyBoard = (state.enemyBoardIds ?? []).map((id) => byId.get(id)).filter(Boolean).slice(0, maxBattleField) as Card[];
  const enemyBoardHp = enemyBoard.map((card, index) => state.enemyBoardHp?.[index] ?? card.health);
  const selected = state.selectedId ? byId.get(state.selectedId) ?? null : null;
  return {
    enemyHp: state.enemyHp,
    playerHp: state.playerHp,
    energy: state.energy,
    turn: state.turn,
    deck,
    discard,
    enemyBoard,
    enemyBoardHp,
    board,
    boardHp: board.map((card, index) => state.boardHp?.[index] ?? card.health),
    hand,
    selected,
    undoableCards: state.undoableIds,
    log: state.log.length ? state.log : ['STORY // battle resumed from server'],
  };
}

export function StoryPage() {
  const [token, setToken] = useState(() => localStorage.getItem(accountTokenKey));
  const [chapter, setChapter] = useState(0);
  const [stage, setStage] = useState<StoryStage>('briefing');
  const [storyLoading, setStoryLoading] = useState(Boolean(token));
  const [saveStatus, setSaveStatus] = useState('');
  const [enemyHp, setEnemyHp] = useState(() => storyChapters[0].hp);
  const [playerHp, setPlayerHp] = useState(120);
  const [energy, setEnergy] = useState(3);
  const [turn, setTurn] = useState(1);
  const [deck, setDeck] = useState<Card[]>([]);
  const [discard, setDiscard] = useState<Card[]>([]);
  const [enemyBoard, setEnemyBoard] = useState<Card[]>([]);
  const [enemyBoardHp, setEnemyBoardHp] = useState<number[]>([]);
  const [hand, setHand] = useState<Card[]>([]);
  const [board, setBoard] = useState<Card[]>([]);
  const [boardHp, setBoardHp] = useState<number[]>([]);
  const [selected, setSelected] = useState<Card | null>(null);
  const [detailCard, setDetailCard] = useState<{ card: Card; zone: 'hand' | 'board' | 'enemy' } | null>(null);
  const [undoableCards, setUndoableCards] = useState<string[]>([]);
  const [impact, setImpact] = useState<{ enemy: number; player: number; key: number } | null>(null);
  const [resultBanner, setResultBanner] = useState<'win' | 'lose' | null>(null);
  const [log, setLog] = useState<string[]>(['STORY // uplink restored', 'Choose a route to begin']);
  const [serverCards, setServerCards] = useState<Card[]>([]);
  const cardsQuery = useListCards({ query: { queryKey: getListCardsQueryKey() } });
  const cards = mergeOwned(serverCards.length ? serverCards : cardsQuery.data?.length ? cardsQuery.data : fallbackCards);
  const current = storyChapters[Math.min(chapter, storyChapters.length - 1)];
  const enemyCard = storyEnemyCards[Math.min(chapter, storyEnemyCards.length - 1)];
  const toBattleState = (override: Partial<{
    enemyHp: number;
    playerHp: number;
    energy: number;
    turn: number;
    deck: Card[];
    discard: Card[];
    enemyBoard: Card[];
    enemyBoardHp: number[];
    hand: Card[];
    board: Card[];
    boardHp: number[];
    selected: Card | null;
    undoableCards: string[];
    log: string[];
  }> = {}): StoryBattleState => {
    const snapshot = {
      enemyHp,
      playerHp,
      energy,
      turn,
      deck,
      discard,
      enemyBoard,
      enemyBoardHp,
      hand,
      board,
      boardHp,
      selected,
      undoableCards,
      log,
      ...override,
    };
    return {
      enemyHp: snapshot.enemyHp,
      playerHp: snapshot.playerHp,
      energy: snapshot.energy,
      turn: snapshot.turn,
      deckIds: snapshot.deck.map((card) => card.id),
      discardIds: snapshot.discard.map((card) => card.id),
      enemyBoardIds: snapshot.enemyBoard.map((card) => card.id),
      enemyBoardHp: snapshot.enemyBoardHp,
      handIds: snapshot.hand.map((card) => card.id),
      boardIds: snapshot.board.map((card) => card.id),
      boardHp: snapshot.boardHp,
      selectedId: snapshot.selected?.id ?? null,
      undoableIds: snapshot.undoableCards,
      log: snapshot.log,
    };
  };

  useEffect(() => {
    localStorage.removeItem('403-story-progress-version');
    localStorage.removeItem('403-story-chapter');
    localStorage.removeItem('403-story-stage');
  }, []);

  useEffect(() => {
    let alive = true;
    tcgApi<{ cards: Card[] }>('/cards')
      .then((payload) => {
        if (alive) setServerCards(payload.cards);
      })
      .catch(() => undefined);
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!token) {
      setStoryLoading(false);
      return;
    }
    let alive = true;
    setStoryLoading(true);
    tcgApi<{ progress: StoryProgress }>('/story-progress', {}, token)
      .then((payload) => {
        if (!alive) return;
        const nextChapter = Math.min(Math.max(payload.progress.chapter, 0), storyChapters.length - 1);
        const reset = payload.progress.stage === 'battle' && payload.progress.battleState ? hydrateStoryBattle(payload.progress.battleState, cards) : resetStoryCombat(nextChapter, cards);
        setChapter(nextChapter);
        setStage(payload.progress.stage);
        setEnemyHp(reset.enemyHp);
        setPlayerHp(reset.playerHp);
        setEnergy(reset.energy);
        setTurn(reset.turn);
        setDeck(reset.deck);
        setDiscard(reset.discard);
        setEnemyBoard(reset.enemyBoard.length ? reset.enemyBoard : enemyDeckForChapter(nextChapter).slice(0, 1));
        setEnemyBoardHp(reset.enemyBoardHp?.length ? reset.enemyBoardHp : (reset.enemyBoard.length ? reset.enemyBoard : enemyDeckForChapter(nextChapter).slice(0, 1)).map((card) => card.health));
        setBoard(reset.board);
        setBoardHp(reset.boardHp ?? reset.board.map((card) => card.health));
        setHand(reset.hand);
        setSelected(reset.selected);
        setUndoableCards(reset.undoableCards);
        setLog(reset.log);
        setSaveStatus('Progress is saved to your 403 account.');
      })
      .catch((error) => {
        localStorage.removeItem(accountTokenKey);
        if (!alive) return;
        setToken(null);
        setSaveStatus(error instanceof Error ? error.message : 'Sign in to save story progress server side.');
      })
      .finally(() => {
        if (alive) setStoryLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token, cards.length]);

  const save = (nextChapter: number, nextStage: StoryStage, battleState?: StoryBattleState | null) => {
    if (!token) return;
    tcgApi<{ progress: StoryProgress }>('/story-progress', {
      method: 'PUT',
      body: JSON.stringify({ chapter: nextChapter, stage: nextStage, battleState: nextStage === 'battle' ? battleState ?? toBattleState() : null }),
    }, token)
      .then(() => setSaveStatus('Progress saved to your 403 account.'))
      .catch((error) => setSaveStatus(error instanceof Error ? error.message : 'Story progress could not be saved.'));
  };
  const beginChoices = () => {
    setStage('choice');
    save(chapter, 'choice');
  };
  const choose = (choice: string) => {
    const storyDeck = storyDeckForChapter(cards, chapter);
    const nextHand = storyDeck.slice(0, maxBattleHand);
    const nextDeck = storyDeck.slice(maxBattleHand);
    const nextEnemyBoard = enemyDeckForChapter(chapter).slice(0, 1);
    const nextLog = [`CHOICE // ${choice}`, 'DRAW // opening hand ready', `${nextEnemyBoard[0]?.name ?? enemyCard.name} entered the enemy field`];
    setLog(nextLog);
    setImpact(null);
    setResultBanner(null);
    const nextEnemyBoardHp = nextEnemyBoard.map((card) => card.health);
    setEnemyHp(current.hp); setPlayerHp(120); setEnergy(3); setTurn(1); setDeck(nextDeck); setDiscard([]); setEnemyBoard(nextEnemyBoard); setEnemyBoardHp(nextEnemyBoardHp); setBoard([]); setBoardHp([]); setHand(nextHand); setSelected(null); setUndoableCards([]);
    setStage('battle');
    save(chapter, 'battle', toBattleState({ enemyHp: current.hp, playerHp: 120, energy: 3, turn: 1, deck: nextDeck, discard: [], enemyBoard: nextEnemyBoard, enemyBoardHp: nextEnemyBoardHp, hand: nextHand, board: [], boardHp: [], selected: null, undoableCards: [], log: nextLog }));
  };
  const playCard = (card: Card) => {
    if (energy < 1 || board.length >= maxBattleField || !hand.some((item) => item.id === card.id)) return;
    const nextEnergy = energy - 1;
    const nextBoard = [...board, card];
    const nextBoardHp = [...boardHp, card.health];
    const nextHand = removeOneCard(hand, card.id);
    const nextUndoable = [...undoableCards, card.id];
    const nextLog = [`DEPLOY // ${card.name} joined the story board`, ...log].slice(0, 6);
    setEnergy(nextEnergy); setBoard(nextBoard); setBoardHp(nextBoardHp); setHand(nextHand); setSelected(card);
    setUndoableCards(nextUndoable);
    setLog(nextLog);
    save(chapter, 'battle', toBattleState({ energy: nextEnergy, board: nextBoard, boardHp: nextBoardHp, hand: nextHand, selected: card, undoableCards: nextUndoable, log: nextLog }));
  };
  const removeCardFromBattle = (card: Card) => {
    if (!undoableCards.includes(card.id)) return;
    const index = board.findIndex((item) => item.id === card.id);
    const nextBoard = index >= 0 ? removeOneAt(board, index) : removeOneCard(board, card.id);
    const nextBoardHp = index >= 0 ? removeOneAt(boardHp, index) : boardHp;
    const nextHand = [card, ...hand];
    const nextEnergy = Math.min(6, energy + 1);
    const nextUndoable = undoableCards.filter((id) => id !== card.id);
    const nextSelected = selected?.id === card.id ? null : selected;
    const nextLog = [`UNDO // ${card.name} returned to hand`, ...log].slice(0, 6);
    setBoard(nextBoard);
    setBoardHp(nextBoardHp);
    setHand(nextHand);
    setEnergy(nextEnergy);
    setUndoableCards(nextUndoable);
    setSelected(nextSelected);
    setLog(nextLog);
    save(chapter, 'battle', toBattleState({ energy: nextEnergy, board: nextBoard, boardHp: nextBoardHp, hand: nextHand, selected: nextSelected, undoableCards: nextUndoable, log: nextLog }));
  };
  const useAbility = () => {
    if (!selected || energy < 1) return;
    const nextEnergy = energy - 1;
    const nextUndoable = undoableCards.filter((id) => id !== selected.id);
    const ability = selected.ability.toLowerCase();
    let nextPlayerHp = playerHp;
    let nextEnemyHp = enemyHp;
    let nextEnemyBoard = enemyBoard;
    let nextEnemyBoardHp = enemyBoardHp;
    let nextLog: string[];
    if (ability.includes('restore') || ability.includes('rally') || ability.includes('phase') || ability.includes('future')) {
      nextPlayerHp = Math.min(120, playerHp + 14);
      nextLog = [`ABILITY // ${selected.ability} restored 14 HP`, ...log].slice(0, 6);
    } else if (ability.includes('spill') || ability.includes('block') || ability.includes('mute')) {
      const hit = absorbDamage(enemyBoard, enemyBoardHp, 8);
      nextEnemyBoard = hit.cards;
      nextEnemyBoardHp = hit.hp;
      nextEnemyHp = Math.max(0, enemyHp - hit.spill);
      nextLog = [`ABILITY // ${selected.ability} dealt 8 to enemy cards${hit.spill ? ` and ${hit.spill} to core` : ''}`, ...hit.destroyed.map((name) => `BREAK // ${name} collapsed`), ...log].slice(0, 6);
    } else {
      const hit = absorbDamage(enemyBoard, enemyBoardHp, 18);
      nextEnemyBoard = hit.cards;
      nextEnemyBoardHp = hit.hp;
      nextEnemyHp = Math.max(0, enemyHp - hit.spill);
      nextLog = [`ABILITY // ${selected.ability} dealt 18 to enemy cards${hit.spill ? ` and ${hit.spill} to core` : ''}`, ...hit.destroyed.map((name) => `BREAK // ${name} collapsed`), ...log].slice(0, 6);
    }
    setEnergy(nextEnergy);
    setUndoableCards(nextUndoable);
    setPlayerHp(nextPlayerHp);
    setEnemyHp(nextEnemyHp);
    setEnemyBoard(nextEnemyBoard);
    setEnemyBoardHp(nextEnemyBoardHp);
    if (nextEnemyHp < enemyHp || nextEnemyBoard.length !== enemyBoard.length) {
      setImpact({ enemy: Math.max(0, enemyHp - nextEnemyHp) || 8, player: 0, key: Date.now() });
    }
    setLog(nextLog);
    if (nextEnemyHp === 0) {
      setResultBanner('win');
      setStage('complete');
      save(chapter, 'complete');
    } else {
      save(chapter, 'battle', toBattleState({ energy: nextEnergy, undoableCards: nextUndoable, playerHp: nextPlayerHp, enemyHp: nextEnemyHp, enemyBoard: nextEnemyBoard, enemyBoardHp: nextEnemyBoardHp, log: nextLog }));
    }
  };
  const endStoryTurn = () => {
    if (board.length === 0 || stage !== 'battle') return;
    const damage = board.reduce((total, card) => total + Math.max(7, Math.round(card.attack / 5)), 0);
    const enemyPressure = enemyBoard.reduce((total, card) => total + Math.max(5, Math.round(card.attack / 8)), 0);
    const retaliation = enemyPressure + (enemyBoard.length ? 0 : Math.max(8, Math.round(enemyCard.attack / 7))) + (turn > 2 ? 3 : 0);
    const enemyHit = absorbDamage(enemyBoard, enemyBoardHp, damage);
    const playerHit = absorbDamage(board, boardHp, retaliation);
    const nextEnemyBoardAfterHit = enemyHit.cards;
    const nextEnemyBoardHpAfterHit = enemyHit.hp;
    const nextBoardAfterHit = playerHit.cards;
    const nextBoardHpAfterHit = playerHit.hp;
    const nextEnemy = Math.max(0, enemyHp - enemyHit.spill);
    const nextPlayer = Math.max(0, playerHp - playerHit.spill);
    setEnemyHp(nextEnemy); setPlayerHp(nextPlayer);
    setEnemyBoard(nextEnemyBoardAfterHit);
    setEnemyBoardHp(nextEnemyBoardHpAfterHit);
    setBoard(nextBoardAfterHit);
    setBoardHp(nextBoardHpAfterHit);
    setImpact({ enemy: damage, player: retaliation, key: Date.now() });
    setUndoableCards([]);
    const nextLog = [
      `TURN ${turn} // board dealt ${damage}; ${enemyHit.spill} reached core`,
      `COUNTER // enemy dealt ${retaliation}; ${playerHit.spill} reached you`,
      ...enemyHit.destroyed.map((name) => `BREAK // ${name} collapsed`),
      ...playerHit.destroyed.map((name) => `KNOCKOUT // ${name} left your field`),
      ...log,
    ].slice(0, 6);
    setLog(nextLog);
    if (nextEnemy === 0) {
      setResultBanner('win');
      setStage('complete');
      save(chapter, 'complete');
    } else if (nextPlayer === 0) {
      setResultBanner('lose');
      setStage('briefing');
      setEnemyHp(current.hp);
      setPlayerHp(120); setEnergy(3); setTurn(1); setDeck([]); setDiscard([]); setEnemyBoard([]); setEnemyBoardHp([]); setBoard([]); setBoardHp([]); setHand([]); setUndoableCards([]);
      setLog(['DEFEAT // the signal broke', 'Try the chapter again']);
      save(chapter, 'briefing');
    } else {
      const nextEnergy = Math.min(6, 3 + Math.floor(turn / 2));
      const nextTurn = turn + 1;
      const drawn = deck[0] ? [deck[0]] : [];
      const nextDeck = deck.slice(1);
      const nextHand = [...hand, ...drawn].slice(-maxBattleHand);
      const enemyAdds = enemyDeckForChapter(chapter)[turn % 5];
      const nextEnemyBoard = [...nextEnemyBoardAfterHit, enemyAdds].slice(-maxBattleField);
      const nextEnemyBoardHp = [...nextEnemyBoardHpAfterHit, enemyAdds.health].slice(-maxBattleField);
      const nextDiscard = discard;
      const drawLog = drawn[0] ? [`DRAW // ${drawn[0].name} joined your hand`] : ['DRAW // deck is empty'];
      const enemyLog = [`ENEMY // ${enemyAdds.name} joined the enemy field`];
      const fullLog = [...drawLog, ...enemyLog, ...nextLog].slice(0, 6);
      setEnergy(nextEnergy); setTurn(nextTurn); setDeck(nextDeck); setDiscard(nextDiscard); setEnemyBoard(nextEnemyBoard); setEnemyBoardHp(nextEnemyBoardHp); setHand(nextHand); setLog(fullLog);
      save(chapter, 'battle', toBattleState({ enemyHp: nextEnemy, playerHp: nextPlayer, energy: nextEnergy, turn: nextTurn, deck: nextDeck, discard: nextDiscard, enemyBoard: nextEnemyBoard, enemyBoardHp: nextEnemyBoardHp, board: nextBoardAfterHit, boardHp: nextBoardHpAfterHit, hand: nextHand, undoableCards: [], log: fullLog }));
    }
  };
  const nextChapter = () => {
    const replaying = chapter >= storyChapters.length - 1;
    const next = replaying ? 0 : chapter + 1;
    setChapter(next);
    setEnemyHp(storyChapters[next].hp);
    setPlayerHp(120); setEnergy(3); setTurn(1); setDeck([]); setDiscard([]); setEnemyBoard([]); setEnemyBoardHp([]); setBoard([]); setBoardHp([]); setHand([]); setUndoableCards([]);
    setImpact(null);
    setResultBanner(null);
    setStage('briefing');
    save(next, 'briefing');
    setLog([replaying ? 'Campaign restarted' : `Chapter ${String(next + 1).padStart(2, '0')}: new signal received`]);
  };

  if (storyLoading) {
    return <div className="animate-data-in"><SectionHeading eyebrow="Solo campaign // account save" title="Loading Story" detail="Reading your saved campaign state from the 403 server." /><DataState type="loading" message="Loading saved story progress" /></div>;
  }

  if (!token) {
    return (
      <div className="animate-data-in">
        <SectionHeading eyebrow="Solo campaign // account required" title="The Color Missing" detail="Story progress saves to your 403 Town account." />
        <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] p-6 sm:p-8">
          <div className="font-display text-3xl font-black uppercase text-white sm:text-5xl">Sign in to play solo story.</div>
          <p className="mt-4 max-w-xl font-mono-ui text-[10px] uppercase leading-6 tracking-widest text-[hsl(var(--muted-foreground))]">Campaign chapter progress is saved server side with your player profile, deck, and online arena account.</p>
          <Link href="/tcg/online" className="mt-6 inline-flex bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]">Create account / sign in</Link>
          {saveStatus && <div className="mt-5 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--secondary))]">{saveStatus}</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-data-in">
      {stage === 'battle' ? (
        <div className="story-battle-strip mb-2 flex items-center justify-between gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--card)/.76)] px-3 py-2">
          <div className="min-w-0">
            <div className="truncate font-mono-ui text-[8px] uppercase tracking-widest text-[hsl(var(--secondary))]">Solo // Ch {String(chapter + 1).padStart(2, '0')} // {current.location}</div>
            <h1 className="truncate font-display text-xl font-black uppercase text-white sm:text-2xl">{current.title}</h1>
          </div>
          <div className="shrink-0 text-right font-mono-ui text-[8px] uppercase leading-4 tracking-wider text-[hsl(var(--primary))]">{saveStatus || 'Server save active'}</div>
        </div>
      ) : (
        <>
          <SectionHeading
            eyebrow={`Solo campaign // Chapter ${String(Math.min(chapter + 1, storyChapters.length)).padStart(2, '0')}`}
            title="The Color Missing"
            detail="Win story fights, earn coins, and push back Zerobyte's color drain."
          />
          {saveStatus && <div className="mb-4 border border-[hsl(var(--primary)/.28)] bg-[hsl(var(--primary)/.06)] px-3 py-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--primary))]">{saveStatus}</div>}
        </>
      )}
      {resultBanner && stage !== 'battle' && (
        <div className={`mb-4 border px-4 py-3 ${resultBanner === 'win' ? 'border-[hsl(var(--accent)/.55)] bg-[hsl(var(--accent)/.08)] text-[hsl(var(--accent))]' : 'border-[hsl(var(--secondary)/.55)] bg-[hsl(var(--secondary)/.08)] text-[hsl(var(--secondary))]'}`}>
          <div className="font-display text-2xl font-black uppercase text-white">{resultBanner === 'win' ? 'You win.' : 'You lose.'}</div>
          <div className="mt-1 font-mono-ui text-[10px] uppercase tracking-widest">{resultBanner === 'win' ? `Chapter reward unlocked: ${current.reward} coins.` : 'The chapter reset. Choose a route and try the battle again.'}</div>
        </div>
      )}
      <div className={stage === 'battle' ? 'grid gap-3' : 'grid gap-5 xl:grid-cols-[1fr_300px]'}>
        <div className={`border border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)] ${stage === 'battle' ? 'p-0' : 'p-4 sm:p-9'}`}>
          {stage !== 'battle' && <><div className="font-mono-ui text-[10px] uppercase tracking-[.22em] text-[hsl(var(--secondary))]">{current.location}</div>
          <h2 className="mt-3 font-display text-3xl font-black uppercase leading-none text-white sm:text-6xl">{current.title}</h2></>}

          {stage === 'briefing' && (
            <>
              <p className="mt-6 max-w-2xl font-mono-ui text-xs leading-6 text-[hsl(var(--muted-foreground))]">{current.text}</p>
              <button onClick={beginChoices} className="mt-8 bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]">Continue story</button>
            </>
          )}

          {stage === 'choice' && (
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              {current.choices.map((choice) => (
                <button key={choice} onClick={() => choose(choice)} className="border border-[hsl(var(--primary)/.5)] p-5 text-left font-display text-xl font-bold uppercase text-white hover:bg-[hsl(var(--primary)/.1)]">
                  {choice}
                  <span className="mt-3 block font-mono-ui text-[9px] tracking-widest text-[hsl(var(--primary))]">Choose route</span>
                </button>
              ))}
            </div>
          )}

          {stage === 'battle' && (
            <div className="tcg-story-battlefield overflow-hidden bg-[#05070a]">
              <div className="story-enemy-panel border-b border-[hsl(var(--border))] bg-[#07090d] p-2 sm:p-3">
                <div className="flex items-center justify-between gap-2 font-mono-ui text-[9px] uppercase tracking-wider text-[hsl(var(--secondary))]">
                  <span>{enemyCard.name}</span>
                  <span>Turn {turn} // {enemyHp} HP</span>
                </div>
                <div className="mt-2 h-2 bg-[hsl(var(--muted))]">
                  <div className="h-full bg-[hsl(var(--secondary))] transition-all" style={{ width: `${(enemyHp / current.hp) * 100}%` }} />
                </div>
                <div className="story-enemy-card mt-2 grid grid-cols-[74px_1fr] gap-2 sm:grid-cols-[110px_1fr]">
                  <CardThumb card={{ ...enemyCard, health: current.hp }} onClick={() => setDetailCard({ card: { ...enemyCard, health: current.hp }, zone: 'enemy' })} />
                  <div className="border border-[hsl(var(--secondary)/.28)] bg-black/30 p-2 sm:p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="story-enemy-role font-display text-lg font-black uppercase text-white sm:text-xl">{enemyCard.role}</div>
                        <div className="story-enemy-meta mt-1 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{enemyCard.rarity} // {enemyCard.attack} ATK // {current.hp} HP</div>
                      </div>
                      <div className="story-enemy-faction font-mono-ui text-[9px] uppercase text-[hsl(var(--secondary))]">{enemyCard.faction}</div>
                    </div>
                    <div className="story-enemy-stars mt-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--accent))]">{rarityStars(enemyCard.rarity)}</div>
                    <div className="story-enemy-ability mt-3 border-t border-white/10 pt-3 font-mono-ui text-[11px] uppercase leading-5 tracking-wider text-[hsl(var(--secondary))]">
                      Enemy ability: {enemyCard.ability}
                    </div>
                  </div>
                </div>
              </div>

              <div className="story-playmat relative space-y-2 p-2 sm:space-y-3 sm:p-3">
                {impact && (
                  <div key={impact.key} className="damage-pop pointer-events-none absolute left-1/2 top-[42%] z-30 grid -translate-x-1/2 gap-1 text-center font-display font-black uppercase">
                    <span className="text-3xl text-[hsl(var(--secondary))] drop-shadow-[0_0_16px_rgba(255,0,153,.5)]">-{impact.enemy}</span>
                    <span className="text-sm text-[hsl(var(--primary))]">Enemy hit</span>
                    <span className="text-xl text-white/80">-{impact.player} back</span>
                  </div>
                )}
                <div className="story-lane story-enemy-lane border border-dashed border-[hsl(var(--secondary)/.35)] p-2">
                  <div className="mb-2 flex items-center justify-between gap-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--secondary))]"><span>Enemy field</span><span className="text-[hsl(var(--muted-foreground))]">Tap cards for details</span></div>
                  {enemyBoard.length ? (
                    <div className="story-card-row grid grid-cols-3 gap-1.5 sm:gap-2">
                      {enemyBoard.map((card, index) => {
                        const fieldCard = { ...card, health: enemyBoardHp[index] ?? card.health };
                        return (
                          <StoryBattleCard
                            key={`${card.id}-${index}`}
                            card={fieldCard}
                            action="Enemy"
                            onSelect={() => setDetailCard({ card: fieldCard, zone: 'enemy' })}
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-3 text-center font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Enemy field is empty</div>
                  )}
                </div>

                <div className="story-stat-row grid grid-cols-4 gap-2 font-mono-ui text-[9px] uppercase tracking-wider">
                  <div className="border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.06)] p-2 text-[hsl(var(--primary))]">You<br /><span className="text-white">{playerHp} HP</span></div>
                  <div className="border border-white/10 bg-black/30 p-2 text-white/55">Energy<br /><span className="text-white">{energy}</span></div>
                  <div className="border border-white/10 bg-black/30 p-2 text-white/55">Deck<br /><span className="text-white">{deck.length}</span></div>
                  <div className="border border-white/10 bg-black/30 p-2 text-white/55">Discard<br /><span className="text-white">{discard.length}</span></div>
                </div>

                <div className="story-selected-card border border-[hsl(var(--accent)/.35)] bg-[hsl(var(--accent)/.05)] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Selected card</div>
                      <div className="mt-1 font-display text-lg font-black uppercase text-white">{selected ? selected.name : 'Tap a deployed card'}</div>
                      {selected && <div className="mt-1 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--accent))]">{rarityStars(selected.rarity)} // {selected.attack} ATK // {selected.health} HP</div>}
                    </div>
                    {selected && <button onClick={() => setDetailCard({ card: selected, zone: 'board' })} className="border border-[hsl(var(--primary))] px-2 py-1 font-mono-ui text-[8px] uppercase tracking-widest text-[hsl(var(--primary))]">Details</button>}
                  </div>
                  <div className="mt-2 border-t border-white/10 pt-2 font-mono-ui text-[10px] uppercase leading-5 tracking-wider text-[hsl(var(--accent))]">
                    {selected ? selected.ability : 'Ability appears here before you spend energy.'}
                  </div>
                </div>

                <div className="story-actions grid grid-cols-2 gap-2">
                  <button onClick={() => selected && setDetailCard({ card: selected, zone: 'board' })} disabled={!selected || energy < 1} className="border border-[hsl(var(--accent))] px-3 py-2.5 font-display text-xs font-bold uppercase text-[hsl(var(--accent))] disabled:opacity-40"><Zap size={14} className="mr-1 inline" /> Card details</button>
                  <button onClick={endStoryTurn} disabled={!board.length} className="bg-[hsl(var(--secondary))] px-4 py-2.5 font-display text-xs font-black uppercase text-[#190810] disabled:opacity-40"><Crosshair size={15} className="mr-1 inline" /> Attack / end turn</button>
                </div>

                <div className="story-lane border border-dashed border-[hsl(var(--primary)/.35)] p-2">
                  <div className="mb-2 flex items-center justify-between gap-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--primary))]"><span>Your lane</span><span className="hidden text-[hsl(var(--muted-foreground))] sm:inline">Turn phone sideways for the table view</span></div>
                  {board.length ? (
                    <div className="story-card-row grid grid-cols-3 gap-1.5 sm:gap-2">
                      {board.map((card, index) => {
                        const fieldCard = { ...card, health: boardHp[index] ?? card.health };
                        return (
                        <StoryBattleCard
                          key={`${card.id}-${index}`}
                          card={fieldCard}
                          selected={selected?.id === card.id}
                          removable={undoableCards.includes(card.id)}
                          onSelect={() => {
                            setSelected(card);
                            setDetailCard({ card: fieldCard, zone: 'board' });
                          }}
                          onRemove={() => removeCardFromBattle(card)}
                        />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-3 text-center font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Deploy a card from hand</div>
                  )}
                </div>

                <div className="story-hand">
                  <div className="mb-2 flex justify-between font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">
                    <span>Hand</span>
                    <span className="text-[hsl(var(--primary))]">{hand.length}/{maxBattleHand} cards</span>
                  </div>
                  <div className="story-card-row grid grid-cols-4 gap-1.5 sm:gap-2">
                    {hand.map((card) => <CardThumb key={card.id} card={card} onClick={() => setDetailCard({ card, zone: 'hand' })} />)}
                    {Array.from({ length: Math.max(0, maxBattleHand - hand.length) }).map((_, index) => (
                      <div key={`empty-hand-${index}`} className="grid aspect-[3/4] place-items-center border border-dashed border-white/10 bg-black/25 font-mono-ui text-[7px] uppercase tracking-wider text-white/18">Empty</div>
                    ))}
                  </div>
                </div>

                <div className="story-log border-t border-[hsl(var(--border))] pt-2">
                  <div className="mb-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Latest story log</div>
                  <div className="grid gap-1.5">
                    {log.slice(0, 2).map((entry, i) => (
                      <div key={`${entry}-${i}`} className="truncate border-l border-[hsl(var(--primary)/.4)] pl-2 font-mono-ui text-[8px] uppercase leading-4 tracking-wider text-[hsl(var(--muted-foreground))]">{entry}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {stage === 'battle' && (
            <CardDetailModal
              card={detailCard?.card ?? null}
              title={detailCard?.zone === 'hand' ? 'Hand card' : detailCard?.zone === 'enemy' ? 'Enemy card' : 'Field card'}
              primaryLabel={detailCard?.zone === 'hand' ? 'Deploy for 1 energy' : detailCard?.zone === 'board' ? `Use ${detailCard.card.ability}` : undefined}
              secondaryLabel={detailCard?.zone === 'board' && undoableCards.includes(detailCard.card.id) ? 'Remove from field' : undefined}
              onPrimary={() => {
                if (!detailCard) return;
                if (detailCard.zone === 'hand') playCard(detailCard.card);
                if (detailCard.zone === 'board') useAbility();
                setDetailCard(null);
              }}
              onSecondary={() => {
                if (detailCard?.zone === 'board') removeCardFromBattle(detailCard.card);
                setDetailCard(null);
              }}
              onClose={() => setDetailCard(null)}
            />
          )}

          {stage === 'complete' && (
            <div className="mt-8 border border-[hsl(var(--accent)/.5)] bg-[hsl(var(--accent)/.06)] p-6">
              <div className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--accent))]">Chapter cleared // +{current.reward} coins</div>
              <p className="mt-3 font-display text-3xl font-black uppercase text-white">You win.</p>
              <p className="mt-2 font-mono-ui text-[10px] uppercase leading-5 tracking-widest text-[hsl(var(--muted-foreground))]">{chapter >= storyChapters.length - 1 ? 'Campaign complete. The town remembers.' : 'The next signal is waiting.'}</p>
              <button onClick={nextChapter} className="mt-6 bg-[hsl(var(--accent))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]">{chapter >= storyChapters.length - 1 ? 'Replay campaign' : 'Next chapter'}</button>
            </div>
          )}
        </div>

        <aside className={`${stage === 'battle' ? 'hidden xl:block' : ''} border border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)] p-5`}>
          <div className="mb-4 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Story log</div>
          <div className="space-y-3">{log.map((entry, i) => <div key={`${entry}-${i}`} className="border-l border-[hsl(var(--primary)/.4)] pl-3 font-mono-ui text-[10px] leading-4 text-[hsl(var(--muted-foreground))]">{entry}</div>)}</div>
          <div className="mt-8 border-t border-[hsl(var(--border))] pt-4 font-mono-ui text-[10px] uppercase leading-5 text-[hsl(var(--muted-foreground))]">Campaign progress<br /><span className="text-[hsl(var(--primary))]">{Math.min(chapter, storyChapters.length)} / {storyChapters.length} chapters cleared</span></div>
        </aside>
      </div>
    </div>
  );
}

function DeckBuilder({ cards }: { cards: Card[] }) {
  const [deck, setDeck] = useState<string[]>(() => readStored<string[]>(deckStorageKey, []));
  const selectedCards = deck.map((id) => cards.find((card) => card.id === id)).filter(Boolean) as Card[];
  const addCard = (card: Card) => {
    const inDeck = deck.filter((id) => id === card.id).length;
    if (deck.length >= 23 || inDeck >= (card.owned || 0)) return;
    setDeck((items) => [...items, card.id]);
  };
  const removeCard = (card: Card) => setDeck((items) => {
    const next = [...items];
    const index = next.indexOf(card.id);
    if (index >= 0) next.splice(index, 1);
    return next;
  });
  const saveDeck = () => localStorage.setItem(deckStorageKey, JSON.stringify(deck));
  const clearDeck = () => {
    setDeck([]);
    localStorage.setItem(deckStorageKey, JSON.stringify([]));
  };

  return <div className="mt-8 grid gap-5 xl:grid-cols-[1fr_360px]">
    <div className="border border-[hsl(var(--secondary)/.32)] bg-[hsl(var(--secondary)/.05)] p-5">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="font-display text-xl font-bold uppercase text-white">Deck workshop</div><p className="mt-1 font-mono-ui text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Shape a fast 23-card list for practice battles and collection testing.</p></div>
        <div className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--secondary))]">{deck.length} / 23 cards</div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-6">
        {selectedCards.length ? selectedCards.map((card, index) => <button key={`${card.id}-${index}`} onClick={() => removeCard(card)} className="border border-[hsl(var(--border))] bg-[#080a0d] px-2 py-2 text-left font-mono-ui text-[9px] uppercase leading-4 text-white hover:border-[hsl(var(--secondary))]"><span className="block truncate">{card.name}</span><span className="text-[hsl(var(--muted-foreground))]">{card.attack} ATK // {card.health} HP</span></button>) : <div className="col-span-full border border-dashed border-[hsl(var(--border))] px-4 py-8 text-center font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Deck is empty</div>}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <button onClick={saveDeck} className="bg-[hsl(var(--secondary))] px-4 py-2 font-display text-sm font-black uppercase tracking-wider text-[#190810]" data-testid="button-save-deck"><Check size={15} className="mr-1 inline" /> Save deck</button>
        <button onClick={clearDeck} className="border border-[hsl(var(--border))] px-4 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-white" data-testid="button-clear-deck">Clear deck</button>
        <Link href="/tcg/battle" className="flex items-center gap-2 border border-[hsl(var(--primary))] px-4 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]" data-testid="link-test-deck"><Plus size={15} /> Practice battle</Link>
      </div>
    </div>
    <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)] p-5">
      <div className="mb-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Owned cards</div>
      <div className="max-h-[420px] space-y-2 overflow-auto pr-1">
        {cards.filter((card) => (card.owned || 0) > 0).map((card) => <button key={card.id} onClick={() => addCard(card)} className="flex w-full items-center justify-between gap-3 border border-[hsl(var(--border))] px-3 py-2 text-left hover:border-[hsl(var(--primary))]"><span><span className="block font-display text-sm font-bold uppercase text-white">{card.name}</span><span className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">{card.rarity} // owned {card.owned}</span></span><Plus size={14} className="text-[hsl(var(--primary))]" /></button>)}
      </div>
    </div>
  </div>;
}

export function CollectionPage() {
  const query = useListCards({ query: { queryKey: getListCardsQueryKey() } });
  const [token, setToken] = useState(() => localStorage.getItem(accountTokenKey));
  const [serverCards, setServerCards] = useState<Card[]>([]);
  const [serverLoading, setServerLoading] = useState(Boolean(token));
  const [message, setMessage] = useState('');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  useEffect(() => {
    if (!token) {
      setServerLoading(false);
      setMessage('Sign in to see server-saved ownership from packs and rewards.');
      return;
    }
    let alive = true;
    setServerLoading(true);
    tcgApi<{ cards: Card[] }>('/collection', {}, token)
      .then((payload) => {
        if (!alive) return;
        setServerCards(payload.cards);
        setMessage('Showing your server-saved card ownership.');
      })
      .catch((error) => {
        localStorage.removeItem(accountTokenKey);
        if (!alive) return;
        setToken(null);
        setMessage(error instanceof Error ? error.message : 'Collection save data is unavailable.');
      })
      .finally(() => {
        if (alive) setServerLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);
  const allCards = token ? serverCards : mergeOwned(query.data?.length ? query.data : fallbackCards);
  const cards = allCards.filter((card) => `${card.name} ${card.faction} ${card.role}`.toLowerCase().includes(search.toLowerCase())).filter((card) => filter === 'ALL' || card.rarity.toUpperCase() === filter);
  return (
    <div className="animate-data-in">
      <SectionHeading eyebrow="Archive 02 // Owned cards" title="Collection" detail="Tap any card to inspect stats, ability, ownership, and 403 Town lore." />
      {message && <div className="mb-5 border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.08)] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]">{message}</div>}
      <div className="mb-6 flex flex-col gap-3 border-b border-[hsl(var(--border))] pb-5 md:flex-row md:items-center md:justify-between">
        <label className="flex max-w-sm items-center gap-2 border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-[hsl(var(--muted-foreground))]">
          <Search size={15} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search card collection" className="w-full bg-transparent font-mono-ui text-[10px] uppercase tracking-wider text-white outline-none placeholder:text-[hsl(var(--muted-foreground))]" data-testid="input-search-cards" />
        </label>
        <div className="flex gap-1 overflow-auto">
          {['ALL', 'LEGENDARY', 'EPIC', 'RARE', 'COMMON'].map((value) => <button key={value} onClick={() => setFilter(value)} className={`whitespace-nowrap px-3 py-2 font-mono-ui text-[9px] uppercase tracking-widest ${filter === value ? 'bg-[hsl(var(--primary))] text-[#071014]' : 'border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] hover:text-white'}`} data-testid={`button-filter-${value.toLowerCase()}`}>{value}</button>)}
        </div>
      </div>
      {serverLoading || (!token && query.isLoading) ? <DataState type="loading" message="Opening collection" /> : query.isError && !token ? <DataState type="error" message="Collection unavailable" /> : cards.length === 0 ? <DataState type="empty" message="No cards match this search" /> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {cards.map((card) => <CardThumb key={card.id} card={card} onClick={() => setSelectedCard(card)} />)}
        </div>
      )}
      <div className="mt-8 flex flex-col gap-4 border border-[hsl(var(--secondary)/.32)] bg-[hsl(var(--secondary)/.05)] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div><div className="font-display text-xl font-bold uppercase text-white">Server deck builder</div><p className="mt-1 font-mono-ui text-[10px] uppercase tracking-wider text-[hsl(var(--muted-foreground))]">Build and save your account deck from the deck builder.</p></div>
        <Link href="/tcg/deck-builder" className="inline-flex items-center justify-center gap-2 bg-[hsl(var(--secondary))] px-4 py-3 font-display text-sm font-black uppercase tracking-wider text-[#190810]"><Save size={15} /> Manage deck</Link>
      </div>
      <CardDetailModal card={selectedCard} title="Card file" onClose={() => setSelectedCard(null)} />
    </div>
  );
}

export function ShopPage() {
  const [token, setToken] = useState(() => localStorage.getItem(accountTokenKey));
  const [items, setItems] = useState<ShopItem[]>([]);
  const [collectionCards, setCollectionCards] = useState<Card[]>([]);
  const [bought, setBought] = useState<string | null>(null);
  const [credits, setCredits] = useState<number | null>(null);
  const [shards, setShards] = useState<number | null>(null);
  const [opened, setOpened] = useState<Card[] | null>(null);
  const [revealCount, setRevealCount] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([
      tcgApi<{ items: ShopItem[] }>('/shop'),
      token ? tcgApi<{ cards: Card[]; credits: number; shards: number }>('/collection', {}, token) : Promise.resolve(null),
    ])
      .then(([shop, collection]) => {
        if (!alive) return;
        setItems(shop.items);
        if (collection) {
          setCollectionCards(collection.cards);
          setCredits(collection.credits);
          setShards(collection.shards);
          setMessage('Wallet and collection loaded from your 403 account.');
        } else {
          setMessage('Sign in before buying packs so every pull saves server side.');
        }
      })
      .catch((error) => {
        if (!alive) return;
        if (token) {
          localStorage.removeItem(accountTokenKey);
          setToken(null);
        }
        setMessage(error instanceof Error ? error.message : 'Market connection failed.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  useEffect(() => {
    if (!opened) {
      setRevealCount(0);
      return;
    }
    setRevealCount(0);
    const timers = opened.map((_, index) => window.setTimeout(() => {
      setRevealCount((value) => Math.max(value, index + 1));
    }, 450 + index * 320));
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [opened]);

  const purchase = async (item: ShopItem) => {
    if (!token) {
      setMessage('Sign in before buying packs so your collection saves server side.');
      return;
    }
    setBought(null);
    try {
      const payload = await tcgApi<{ opened: Card[]; cards: Card[]; credits: number; shards: number }>('/shop/purchase', {
        method: 'POST',
        body: JSON.stringify({ itemId: item.id }),
      }, token);
      setCredits(payload.credits);
      setShards(payload.shards);
      setCollectionCards(payload.cards);
      setOpened(payload.opened);
      setBought(item.id);
      setMessage('Pack opened and saved to your account collection.');
    } catch (error) {
      setBought('insufficient');
      setMessage(error instanceof Error ? error.message : 'Pack purchase failed.');
    }
  };
  return <div className="animate-data-in"><SectionHeading eyebrow="Market 03 // Server vault" title="Shop" detail="Spend earned coins on packs. Every pull is saved to your account collection." />{message && <div className="mb-5 border border-[hsl(var(--primary)/.35)] bg-[hsl(var(--primary)/.08)] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]">{message}</div>}<div className="mb-6 flex flex-col gap-3 border border-[hsl(var(--border))] bg-[hsl(var(--card)/.7)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Server wallet</div><div className="flex gap-4 font-mono-ui text-xs"><span className="text-[hsl(var(--primary))]"><Coins size={13} className="mr-1 inline" />{credits ?? '—'} CR</span><span className="text-[hsl(var(--secondary))]"><Sparkles size={13} className="mr-1 inline" />{shards ?? '—'} SH</span></div></div>{!token ? <div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.78)] p-6"><div className="font-display text-3xl font-black uppercase text-white">Sign in before opening packs.</div><p className="mt-3 max-w-xl font-mono-ui text-[10px] uppercase leading-5 tracking-widest text-[hsl(var(--muted-foreground))]">Pack purchases, coin balance, shards, and card ownership are account data. Open the arena account page first.</p><Link href="/tcg/online" className="mt-6 inline-flex bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]">Create account / sign in</Link></div> : loading ? <DataState type="loading" message="Opening server market" /> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <div key={item.id} className={`relative border bg-[hsl(var(--card)/.8)] p-5 ${item.featured ? 'border-[hsl(var(--secondary))]' : 'border-[hsl(var(--border))]'}`} data-testid={`card-shop-${item.id}`}>{item.featured && <div className="absolute right-3 top-3 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--secondary))]">Featured drop</div>}<div className="mb-10 flex h-32 items-center justify-center border border-dashed border-[hsl(var(--border))] bg-[radial-gradient(circle,rgba(0,216,255,.12),transparent_60%)]"><PackageOpen size={48} strokeWidth={1} className={item.featured ? 'text-[hsl(var(--secondary))]' : 'text-[hsl(var(--primary))]'} /></div><div className="font-display text-2xl font-black uppercase text-white">{item.name}</div><div className="mt-2 font-mono-ui text-[10px] uppercase leading-5 text-[hsl(var(--muted-foreground))]">{item.kind} // {item.detail}</div><div className="mt-5 flex items-center justify-between border-t border-[hsl(var(--border))] pt-4"><div className="font-mono-ui text-sm font-bold text-white">{item.price} <span className="text-[10px] text-[hsl(var(--muted-foreground))]">{item.currency}</span></div><button onClick={() => purchase(item)} disabled={bought === item.id} className="flex items-center gap-2 border border-[hsl(var(--primary))] px-3 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.12)] disabled:opacity-70" data-testid={`button-buy-${item.id}`}>{bought === item.id ? <Check size={14} /> : <ShoppingCart size={14} />}{bought === item.id ? 'Saved' : bought === 'insufficient' ? 'Check wallet' : 'Buy pack'}</button></div></div>)}</div>}<PackRevealModal cards={opened} collectionCards={collectionCards} revealCount={revealCount} onRevealAll={() => setRevealCount(opened?.length ?? 0)} onClose={() => setOpened(null)} /></div>;
}

export function MatchesPage() {
  const query = useListRecentMatches({ query: { queryKey: getListRecentMatchesQueryKey() } });
  const matches = query.data ?? [];
  return <div className="animate-data-in"><SectionHeading eyebrow="Logs 04 // Competitive record" title="Match history" detail="A clean record is suspicious. Every result is retained in the Town's memory." />{query.isLoading ? <DataState type="loading" message="Reading match ledger" /> : query.isError ? <DataState type="error" message="Ledger unavailable" /> : matches.length === 0 ? <DataState type="empty" message="No match records yet" /> : <div className="overflow-x-auto border border-[hsl(var(--border))]"><table className="w-full min-w-[650px] text-left"><thead className="bg-[hsl(var(--card))] font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><tr><th className="px-5 py-4">Result</th><th className="px-5 py-4">Opponent</th><th className="px-5 py-4">Mode</th><th className="px-5 py-4">Score</th><th className="px-5 py-4">Date</th></tr></thead><tbody>{matches.map((match) => <tr key={match.id} className="border-t border-[hsl(var(--border))] font-mono-ui text-[11px] hover:bg-[hsl(var(--muted)/.35)]" data-testid={`table-match-${match.id}`}><td className={`px-5 py-4 font-bold uppercase ${/victory|win/.test(match.result.toLowerCase()) ? 'text-[hsl(var(--accent))]' : 'text-[hsl(var(--secondary))]' }`}>{match.result}</td><td className="px-5 py-4 font-display text-base font-bold uppercase text-white">{match.opponent}</td><td className="px-5 py-4 uppercase text-[hsl(var(--muted-foreground))]">{match.mode}</td><td className="px-5 py-4 text-[hsl(var(--primary))]">{match.score}</td><td className="px-5 py-4 text-[hsl(var(--muted-foreground))]">{match.date}</td></tr>)}</tbody></table></div>}</div>;
}

export function SettingsPage() {
  const [sound, setSound] = useState(() => localStorage.getItem('403-sound') !== 'off');
  const [scanlines, setScanlines] = useState(() => localStorage.getItem('403-scanlines') !== 'off');
  const [saved, setSaved] = useState(false);
  const updateScanlines = (active: boolean) => {
    setScanlines(active);
    document.documentElement.dataset.scanlines = active ? 'on' : 'off';
  };
  const saveSettings = () => {
    localStorage.setItem('403-sound', sound ? 'on' : 'off');
    localStorage.setItem('403-scanlines', scanlines ? 'on' : 'off');
    setSaved(true);
  };
  return <div className="animate-data-in max-w-3xl"><SectionHeading eyebrow="System 05 // Local preferences" title="Settings" detail="Tune the client shell. Account security remains bound to the Town uplink." /><div className="space-y-4"><SettingsRow label="Battle audio" detail="Signal pings, impacts, and queue confirmations" active={sound} setActive={setSound} /><SettingsRow label="Scanline layer" detail="CRT interference over the command client" active={scanlines} setActive={updateScanlines} /><div className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-5"><div className="mb-4 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">Account relay</div><div className="grid gap-4 sm:grid-cols-2"><div><div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Handle</div><div className="mt-1 font-display text-xl font-bold uppercase text-white">OPERATOR_403</div></div><div><div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">Session</div><div className="mt-1 font-mono-ui text-xs uppercase text-[hsl(var(--accent))]">Encrypted / stable</div></div></div></div></div><button onClick={saveSettings} className="mt-6 flex items-center gap-2 bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]" data-testid="button-save-settings">{saved ? <Check size={15} /> : <Zap size={15} />}{saved ? 'Preferences saved' : 'Save preferences'}</button></div>;
}

function SettingsRow({ label, detail, active, setActive }: { label: string; detail: string; active: boolean; setActive: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 border border-[hsl(var(--border))] bg-[hsl(var(--card)/.72)] p-5"><div><div className="font-display text-xl font-bold uppercase text-white">{label}</div><div className="mt-1 font-mono-ui text-[10px] text-[hsl(var(--muted-foreground))]">{detail}</div></div><button onClick={() => setActive(!active)} className={`relative h-6 w-11 border ${active ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.15)]' : 'border-[hsl(var(--border))] bg-[hsl(var(--muted))]'}`} data-testid={`button-toggle-${label.toLowerCase().replace(' ', '-')}`}><span className={`absolute top-1 h-3.5 w-3.5 transition-transform ${active ? 'translate-x-5 bg-[hsl(var(--primary))]' : 'translate-x-1 bg-[hsl(var(--muted-foreground))]'}`} /></button></div>;
}
