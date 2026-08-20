import { ArrowRight, BookOpen, Boxes, ImageIcon, Map, Play, Radio, Swords } from 'lucide-react';
import { Link } from 'wouter';

const base = import.meta.env.BASE_URL.replace(/\/$/, '');
const asset = (path: string) => `${base}${path}`;
const gallery = [
  {
    src: '/world-assets/date-street-at-risk-kode.jpg',
    title: 'Date Street Signal',
    text: 'atRisk and Kode stand in the drained Sultan streets while their color still cuts through the gray.',
  },
  {
    src: '/world-assets/bridge-walk-at-risk-kode.jpg',
    title: 'Under The Bridge',
    text: 'The ordinary town routes become dangerous after the color drain reaches the edges of Sultan.',
  },
  {
    src: '/world-assets/sultan-street-standoff.jpg',
    title: 'Street Standoff',
    text: 'The crew faces corrupted minions in the same world that feeds the comic and card game.',
  },
  {
    src: '/world-assets/sultan-bridge-showdown.jpg',
    title: 'Bridge Showdown',
    text: 'Sultan residents fade into the background while the remaining colorful signals hold the line.',
  },
];

export function WorldPage() {
  return (
    <main className="bg-[#07090c]">
      <section className="relative overflow-hidden border-b border-white/10 bg-[#090b0f]">
        <div className="story-grid absolute inset-0 opacity-45" />
        <div className="relative mx-auto grid min-h-[76vh] max-w-[1500px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[.86fr_1.14fr] lg:px-10 lg:py-16">
          <div className="flex flex-col justify-center">
            <div className="mb-4 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.24em] text-[hsl(var(--secondary))]">
              <Radio size={14} />
              One world // one signal
            </div>
            <h1 className="font-display text-6xl font-black uppercase leading-[.78] text-white sm:text-8xl">
              403<br /><span className="text-[hsl(var(--primary))]">World</span>
            </h1>
            <p className="mt-7 max-w-xl font-mono-ui text-[11px] uppercase leading-6 tracking-[.08em] text-white/50">
              The comic, TCG, and character files all happen inside the same digital world. Sultan, Startup, and Gold Bar are connected by one corridor, and the Static Void is pushing in from the edges.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/archive" className="inline-flex items-center gap-2 bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-[.14em] text-[#071014]">
                Read the comic <BookOpen size={16} />
              </Link>
              <Link href="/tcg" className="inline-flex items-center gap-2 border border-[hsl(var(--secondary)/.75)] px-5 py-3 font-display text-sm font-black uppercase tracking-[.14em] text-[hsl(var(--secondary))]">
                Play the TCG <Boxes size={16} />
              </Link>
            </div>
          </div>
          <div className="relative flex items-center">
            <div className="absolute -inset-3 border border-[hsl(var(--primary)/.15)]" />
            <img src={asset('/world-assets/map.png')} alt="403 Town world map" className="relative w-full border border-white/10 shadow-2xl" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1500px] gap-5 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-10 lg:py-16">
        <WorldTile title="Sultan" tone="Drained. Ordered. Empty." text="The grayscale side of the world shows what happens when individuality gets squeezed out of the signal." />
        <WorldTile title="Startup" tone="Unstable. Creative. Alive." text="The creative middle ground is full of murals, experiments, hideouts, and glitches that refuse to flatten out." />
        <WorldTile title="Gold Bar" tone="Wild. Resilient. Real." text="The power-heavy side of the corridor is rugged, bright, and practical, with current moving through everything." />
      </section>

      <section className="mx-auto max-w-[1500px] px-4 pb-14 sm:px-6 lg:px-10">
        <div className="grid gap-8 border border-white/10 bg-[#0b0d11] p-4 sm:p-6 lg:grid-cols-[1.15fr_.85fr] lg:p-8">
          <div className="overflow-hidden border border-white/10 bg-[#07090c]">
            <img src={asset('/world-assets/403-town-character-roster.png')} alt="403 Town character roster with atRisk, Koding, Chroma, Grid, Zero, and Zerobyte" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-mono-ui text-[9px] uppercase tracking-[.25em] text-[hsl(var(--primary))]">Roster file // clearance denied</div>
            <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">The lineup is part of the lore.</h2>
            <p className="mt-6 max-w-xl font-mono-ui text-[10px] uppercase leading-6 tracking-[.08em] text-white/45">
              atRisk, Koding, Chroma, Grid, Zero, and Zerobyte are connected by the same breach that drained Sultan and pulled the crew into the fight for 403 Town.
            </p>
            <div className="mt-7 grid gap-2 font-mono-ui text-[10px] uppercase tracking-widest text-white/40 sm:grid-cols-2">
              <span className="border border-white/10 px-3 py-2">Heroes // retained color</span>
              <span className="border border-white/10 px-3 py-2">Threats // static breach</span>
              <span className="border border-white/10 px-3 py-2">Symbols // identity marks</span>
              <span className="border border-white/10 px-3 py-2">403 // shared universe</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b0d11]">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[.85fr_1.15fr] lg:px-10">
          <div className="flex flex-col justify-center">
            <div className="font-mono-ui text-[9px] uppercase tracking-[.25em] text-[hsl(var(--secondary))]">Extra signal // motion file</div>
            <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">The signal moves.</h2>
            <p className="mt-6 max-w-xl font-mono-ui text-[10px] uppercase leading-6 tracking-[.08em] text-white/45">
              Motion files capture the same world in another form: rain on Sultan streets, corrupted signals under the bridge, and the crew holding color against the drain.
            </p>
            <a href="https://youtu.be/8wkvDgEpiXg" className="mt-7 inline-flex w-fit items-center gap-2 border border-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-[.14em] text-[hsl(var(--primary))]">
              Open on YouTube <ArrowRight size={15} />
            </a>
          </div>
          <div className="overflow-hidden border border-white/10 bg-[#07090c] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 font-mono-ui text-[9px] uppercase tracking-widest text-white/35">
              <span className="flex items-center gap-2 text-[hsl(var(--primary))]"><Play size={13} /> 403 video uplink</span>
              <span>YouTube</span>
            </div>
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/8wkvDgEpiXg"
                title="403 Town video transmission"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
          <div className="overflow-hidden border border-white/10 bg-[#07090c] shadow-2xl lg:col-start-2">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 font-mono-ui text-[9px] uppercase tracking-widest text-white/35">
              <span className="flex items-center gap-2 text-[hsl(var(--secondary))]"><Play size={13} /> Local motion file</span>
              <span>MP4</span>
            </div>
            <video className="aspect-video w-full bg-black" src={asset('/world-assets/403-town-stitched-clean.mp4')} controls preload="metadata" poster={asset('/world-assets/403-town-character-roster.png')} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-14 sm:px-6 lg:px-10">
        <div className="mb-7 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="font-mono-ui text-[9px] uppercase tracking-[.25em] text-[hsl(var(--primary))]">World extras // Sultan field files</div>
            <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white">Gallery</h2>
          </div>
          <p className="max-w-sm font-mono-ui text-[10px] uppercase leading-5 tracking-[.08em] text-white/40 sm:text-right">These pieces keep the same visual rule: Sultan is drained and gray, while characters who still have individuality keep their color.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {gallery.map((item) => (
            <figure key={item.src} className="group overflow-hidden border border-white/10 bg-[#090b0f]">
              <div className="relative aspect-[4/3] overflow-hidden">
                <img src={asset(item.src)} alt={item.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07090c] via-transparent to-transparent" />
                <div className="absolute left-4 top-4 flex items-center gap-2 border border-white/10 bg-[#080a0d]/80 px-3 py-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--primary))]"><ImageIcon size={13} /> Field image</div>
              </div>
              <figcaption className="p-5">
                <h3 className="font-display text-2xl font-black uppercase text-white">{item.title}</h3>
                <p className="mt-2 font-mono-ui text-[10px] uppercase leading-5 tracking-[.06em] text-white/40">{item.text}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b0d11]">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[.95fr_1.05fr] lg:px-10">
          <div className="grid gap-4">
            <div className="grid min-h-[360px] place-items-center overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_50%_32%,rgba(0,216,255,.14),transparent_34%),linear-gradient(180deg,#0b0d11,#050609)] p-4">
              <img src={asset('/world-assets/zero-transparent.png')} alt="Zero before corruption" className="h-full max-h-[560px] w-full object-contain drop-shadow-[0_0_32px_rgba(255,0,153,.22)]" />
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <div className="font-mono-ui text-[9px] uppercase tracking-[.25em] text-[hsl(var(--secondary))]">Character file // Zero to Zerobyte</div>
            <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white sm:text-6xl">A friend became the breach.</h2>
            <p className="mt-6 max-w-2xl font-mono-ui text-[10px] uppercase leading-6 tracking-[.08em] text-white/45">
              Zero was part of the crew before corruption changed him into Zerobyte. The comic shows the emotional canon. The TCG lets players battle through the same color drain with cards, packs, decks, and solo story missions.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <Link href="/read/zeros-perspective" className="group flex items-center justify-between border border-white/10 px-4 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
                Zero's Perspective <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/tcg/battle" className="group flex items-center justify-between border border-white/10 px-4 py-4 font-display text-sm font-bold uppercase tracking-widest text-white hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]">
                Enter Battle <Swords size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function WorldTile({ title, tone, text }: { title: string; tone: string; text: string }) {
  return (
    <div className="border border-white/10 bg-white/[.018] p-6">
      <div className="flex items-center justify-between text-[hsl(var(--primary))]">
        <Map size={18} />
        <span className="font-mono-ui text-[9px] uppercase tracking-widest text-white/25">{tone}</span>
      </div>
      <h2 className="mt-8 font-display text-4xl font-black uppercase text-white">{title}</h2>
      <p className="mt-3 font-mono-ui text-[10px] uppercase leading-5 tracking-[.06em] text-white/40">{text}</p>
    </div>
  );
}
