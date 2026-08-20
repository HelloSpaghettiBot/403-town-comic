import { useMemo, useState, type ReactNode } from 'react';
import { Check, Download, PackagePlus, Plus, Save, Upload } from 'lucide-react';
import type { Card, ShopItem } from '@/lib/api-client-react';

const adminComicsKey = '403-admin-comics';
const adminProfilesKey = '403-admin-profiles';
const adminCardsKey = '403-admin-cards';
const adminPacksKey = '403-admin-packs';

type ComicDraft = {
  id: string;
  slug: string;
  number: number;
  title: string;
  summary: string;
  status: string;
  cover: string;
  pages: string;
};

type ProfileDraft = {
  id: string;
  name: string;
  role: string;
  faction: string;
  image: string;
  notes: string;
};

type AdminPack = ShopItem & { size: number; guaranteedRare: boolean; pool?: string };

function readStored<T>(key: string, fallback: T): T {
  try {
    return JSON.parse(localStorage.getItem(key) ?? '') as T;
  } catch {
    return fallback;
  }
}

function downloadJson(name: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="block font-mono-ui text-[9px] uppercase tracking-widest text-white/45">{label}<div className="mt-2">{children}</div></label>;
}

const inputClass = 'w-full border border-white/10 bg-[#080a0d] px-3 py-2 font-mono-ui text-[11px] uppercase tracking-wider text-white outline-none focus:border-[hsl(var(--primary))]';

export function AdminHomePage() {
  const [profiles, setProfiles] = useState<ProfileDraft[]>(() => readStored<ProfileDraft[]>(adminProfilesKey, []));
  const [comics, setComics] = useState<ComicDraft[]>(() => readStored<Array<Omit<ComicDraft, 'pages'> & { pages: string | string[] }>>(adminComicsKey, []).map((item) => ({ ...item, pages: Array.isArray(item.pages) ? item.pages.join('\n') : item.pages })));
  const [profile, setProfile] = useState<ProfileDraft>({ id: 'profile-new', name: '', role: '', faction: '', image: '', notes: '' });
  const [comic, setComic] = useState<ComicDraft>({ id: 'ep-new', slug: '', number: comics.length + 2, title: '', summary: '', status: 'Draft', cover: '', pages: '' });
  const [saved, setSaved] = useState(false);

  const saveAll = (nextProfiles = profiles, nextComics = comics) => {
    localStorage.setItem(adminProfilesKey, JSON.stringify(nextProfiles));
    localStorage.setItem(adminComicsKey, JSON.stringify(nextComics.map((item) => ({ ...item, pages: String(item.pages).split('\n').map((page) => page.trim()).filter(Boolean) }))));
    setSaved(true);
    setTimeout(() => setSaved(false), 1600);
  };

  const addProfile = () => {
    if (!profile.name.trim()) return;
    const next = [...profiles, { ...profile, id: profile.id || profile.name.toLowerCase().replace(/\s+/g, '-') }];
    setProfiles(next);
    setProfile({ id: 'profile-new', name: '', role: '', faction: '', image: '', notes: '' });
    saveAll(next, comics);
  };

  const addComic = () => {
    if (!comic.title.trim() || !comic.slug.trim()) return;
    const next = [...comics, { ...comic, id: comic.id || `ep-${comic.number}` }];
    setComics(next);
    setComic({ id: 'ep-new', slug: '', number: comic.number + 1, title: '', summary: '', status: 'Draft', cover: '', pages: '' });
    saveAll(profiles, next);
  };

  return <main className="mx-auto min-h-[70vh] max-w-[1500px] px-4 py-12 sm:px-6 lg:px-10">
    <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="font-mono-ui text-[9px] uppercase tracking-[.25em] text-[hsl(var(--secondary))]">Admin // story site</div><h1 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white">Content Dashboard</h1><p className="mt-3 max-w-2xl font-mono-ui text-[10px] uppercase leading-5 tracking-[.08em] text-white/45">Add profiles and comic entries for the web reader. Use paths like /comics/episode-02/page-1.webp after art is uploaded to the public folder.</p></div>
      <button onClick={() => downloadJson('403-town-content-export.json', { profiles, comics })} className="inline-flex items-center gap-2 border border-[hsl(var(--primary))] px-4 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]"><Download size={14} /> Export</button>
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="border border-white/10 bg-[#0c0f14] p-5">
        <h2 className="font-display text-2xl font-black uppercase text-white">Character profiles</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Name"><input className={inputClass} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></Field><Field label="Role"><input className={inputClass} value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} /></Field><Field label="Faction"><input className={inputClass} value={profile.faction} onChange={(e) => setProfile({ ...profile, faction: e.target.value })} /></Field><Field label="Image path"><input className={inputClass} value={profile.image} onChange={(e) => setProfile({ ...profile, image: e.target.value })} /></Field><div className="sm:col-span-2"><Field label="Notes"><textarea className={`${inputClass} min-h-24`} value={profile.notes} onChange={(e) => setProfile({ ...profile, notes: e.target.value })} /></Field></div></div>
        <button onClick={addProfile} className="mt-4 inline-flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 font-display text-sm font-black uppercase tracking-wider text-[#071014]"><Plus size={15} /> Add profile</button>
        <div className="mt-5 grid gap-2">{profiles.map((item) => <div key={item.id} className="border border-white/10 px-3 py-2"><div className="font-display text-sm font-bold uppercase text-white">{item.name}</div><div className="font-mono-ui text-[9px] uppercase text-white/40">{item.role} // {item.faction}</div></div>)}</div>
      </section>
      <section className="border border-white/10 bg-[#0c0f14] p-5">
        <h2 className="font-display text-2xl font-black uppercase text-white">Comic uploads</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Title"><input className={inputClass} value={comic.title} onChange={(e) => setComic({ ...comic, title: e.target.value })} /></Field><Field label="Slug"><input className={inputClass} value={comic.slug} onChange={(e) => setComic({ ...comic, slug: e.target.value })} /></Field><Field label="Number"><input type="number" className={inputClass} value={comic.number} onChange={(e) => setComic({ ...comic, number: Number(e.target.value) })} /></Field><Field label="Status"><input className={inputClass} value={comic.status} onChange={(e) => setComic({ ...comic, status: e.target.value })} /></Field><div className="sm:col-span-2"><Field label="Cover path"><input className={inputClass} value={comic.cover} onChange={(e) => setComic({ ...comic, cover: e.target.value })} /></Field></div><div className="sm:col-span-2"><Field label="Summary"><textarea className={`${inputClass} min-h-20`} value={comic.summary} onChange={(e) => setComic({ ...comic, summary: e.target.value })} /></Field></div><div className="sm:col-span-2"><Field label="Page paths, one per line"><textarea className={`${inputClass} min-h-32`} value={comic.pages} onChange={(e) => setComic({ ...comic, pages: e.target.value })} /></Field></div></div>
        <button onClick={addComic} className="mt-4 inline-flex items-center gap-2 bg-[hsl(var(--secondary))] px-4 py-2 font-display text-sm font-black uppercase tracking-wider text-[#190810]"><Upload size={15} /> Add comic</button>
        <div className="mt-5 grid gap-2">{comics.map((item) => <div key={item.id} className="border border-white/10 px-3 py-2"><div className="font-display text-sm font-bold uppercase text-white">{item.number}. {item.title}</div><div className="font-mono-ui text-[9px] uppercase text-white/40">/{item.slug} // {item.status}</div></div>)}</div>
      </section>
    </div>
    {saved && <div className="fixed bottom-5 right-5 flex items-center gap-2 border border-[hsl(var(--accent))] bg-[#080a0d] px-4 py-3 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--accent))]"><Check size={14} /> Saved</div>}
  </main>;
}

export function TcgAdminPage() {
  const [cards, setCards] = useState<Card[]>(() => readStored<Card[]>(adminCardsKey, []));
  const [packs, setPacks] = useState<AdminPack[]>(() => readStored<AdminPack[]>(adminPacksKey, []));
  const [card, setCard] = useState<Card>({ id: '', name: '', faction: '403 Town', role: '', rarity: 'COMMON', image: '', attack: 70, health: 70, ability: '', owned: 0 });
  const [pack, setPack] = useState<AdminPack>({ id: '', name: '', kind: 'PACK', price: 240, currency: 'CREDITS', detail: '5 signals // guaranteed rare', featured: false, size: 5, guaranteedRare: true, pool: '' });
  const totalCards = useMemo(() => cards.length, [cards]);

  const saveCards = (next: Card[]) => {
    setCards(next);
    localStorage.setItem(adminCardsKey, JSON.stringify(next));
  };
  const savePacks = (next: AdminPack[]) => {
    setPacks(next);
    localStorage.setItem(adminPacksKey, JSON.stringify(next));
  };
  const addCard = () => {
    if (!card.name.trim()) return;
    const id = card.id || card.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    saveCards([...cards.filter((item) => item.id !== id), { ...card, id }]);
    setCard({ id: '', name: '', faction: '403 Town', role: '', rarity: 'COMMON', image: '', attack: 70, health: 70, ability: '', owned: 0 });
  };
  const addPack = () => {
    if (!pack.name.trim()) return;
    const id = pack.id || pack.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    savePacks([...packs.filter((item) => item.id !== id), { ...pack, id }]);
    setPack({ id: '', name: '', kind: 'PACK', price: 240, currency: 'CREDITS', detail: '5 signals // guaranteed rare', featured: false, size: 5, guaranteedRare: true, pool: '' });
  };

  return <main className="animate-data-in">
    <div className="mb-8 flex flex-col gap-4 border-b border-[hsl(var(--border))] pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div><div className="font-mono-ui text-[10px] uppercase tracking-[.24em] text-[hsl(var(--secondary))]">Admin // TCG</div><h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-white">Card Control</h1><p className="mt-3 max-w-2xl font-mono-ui text-[10px] uppercase leading-5 tracking-wider text-[hsl(var(--muted-foreground))]">Create cards and packs. Saved packs appear in the shop, and saved cards enter the collection and pack pool.</p></div>
      <button onClick={() => downloadJson('403-town-tcg-export.json', { cards, packs })} className="inline-flex items-center gap-2 border border-[hsl(var(--primary))] px-4 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))]"><Download size={14} /> Export</button>
    </div>
    <div className="grid gap-6 xl:grid-cols-2">
      <section className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)] p-5">
        <h2 className="font-display text-2xl font-black uppercase text-white">New card</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Name"><input className={inputClass} value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field><Field label="Rarity"><select className={inputClass} value={card.rarity} onChange={(e) => setCard({ ...card, rarity: e.target.value })}><option>COMMON</option><option>RARE</option><option>EPIC</option><option>LEGENDARY</option></select></Field><Field label="Faction"><input className={inputClass} value={card.faction} onChange={(e) => setCard({ ...card, faction: e.target.value })} /></Field><Field label="Role"><input className={inputClass} value={card.role} onChange={(e) => setCard({ ...card, role: e.target.value })} /></Field><Field label="Attack"><input type="number" className={inputClass} value={card.attack} onChange={(e) => setCard({ ...card, attack: Number(e.target.value) })} /></Field><Field label="Health"><input type="number" className={inputClass} value={card.health} onChange={(e) => setCard({ ...card, health: Number(e.target.value) })} /></Field><div className="sm:col-span-2"><Field label="Ability"><input className={inputClass} value={card.ability} onChange={(e) => setCard({ ...card, ability: e.target.value })} /></Field></div><div className="sm:col-span-2"><Field label="Image path"><input className={inputClass} value={card.image ?? ''} onChange={(e) => setCard({ ...card, image: e.target.value })} /></Field></div></div>
        <button onClick={addCard} className="mt-4 inline-flex items-center gap-2 bg-[hsl(var(--primary))] px-4 py-2 font-display text-sm font-black uppercase tracking-wider text-[#071014]"><Save size={15} /> Save card</button>
        <div className="mt-5 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{totalCards} custom cards saved</div>
      </section>
      <section className="border border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)] p-5">
        <h2 className="font-display text-2xl font-black uppercase text-white">New pack</h2>
        <div className="mt-5 grid gap-3 sm:grid-cols-2"><Field label="Name"><input className={inputClass} value={pack.name} onChange={(e) => setPack({ ...pack, name: e.target.value })} /></Field><Field label="Price"><input type="number" className={inputClass} value={pack.price} onChange={(e) => setPack({ ...pack, price: Number(e.target.value) })} /></Field><Field label="Currency"><select className={inputClass} value={pack.currency} onChange={(e) => setPack({ ...pack, currency: e.target.value })}><option>CREDITS</option><option>SHARDS</option></select></Field><Field label="Cards per pack"><input type="number" className={inputClass} value={pack.size} onChange={(e) => setPack({ ...pack, size: Number(e.target.value) })} /></Field><div className="sm:col-span-2"><Field label="Detail"><input className={inputClass} value={pack.detail} onChange={(e) => setPack({ ...pack, detail: e.target.value })} /></Field></div><div className="sm:col-span-2"><Field label="Pool filter optional"><input className={inputClass} value={pack.pool ?? ''} onChange={(e) => setPack({ ...pack, pool: e.target.value })} placeholder="Faction, rarity, card name, or id" /></Field></div><label className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-widest text-white/50"><input type="checkbox" checked={pack.guaranteedRare} onChange={(e) => setPack({ ...pack, guaranteedRare: e.target.checked })} /> Guaranteed rare</label><label className="flex items-center gap-2 font-mono-ui text-[10px] uppercase tracking-widest text-white/50"><input type="checkbox" checked={!!pack.featured} onChange={(e) => setPack({ ...pack, featured: e.target.checked })} /> Featured</label></div>
        <button onClick={addPack} className="mt-4 inline-flex items-center gap-2 bg-[hsl(var(--secondary))] px-4 py-2 font-display text-sm font-black uppercase tracking-wider text-[#190810]"><PackagePlus size={15} /> Save pack</button>
        <div className="mt-5 grid gap-2">{packs.map((item) => <div key={item.id} className="border border-[hsl(var(--border))] px-3 py-2"><div className="font-display text-sm font-bold uppercase text-white">{item.name}</div><div className="font-mono-ui text-[9px] uppercase text-[hsl(var(--muted-foreground))]">{item.size} cards // {item.price} {item.currency}</div></div>)}</div>
      </section>
    </div>
  </main>;
}
