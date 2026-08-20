import type { ReactNode } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, Boxes, ChevronRight, Download, Layers3, Map, Radio, Sparkles } from 'lucide-react';
import { Link, useRoute } from 'wouter';
import { useComicEpisode, useComicEpisodes, type ComicEpisode } from '@/lib/comics';

const cardPreviews = [
  `${import.meta.env.BASE_URL}cards/file_000000001ca881fb82b3a2016fe6eb81_1787170099114.webp`,
  `${import.meta.env.BASE_URL}cards/file_00000000d81481fd8e8b3ab6a03391e5_1787170099213.webp`,
  `${import.meta.env.BASE_URL}cards/file_00000000c3fc81fda7ea25538d8d4e6d_1787170099237.webp`,
];

function EpisodeNumber({ episode }: { episode: ComicEpisode }) {
  return <span>{String(episode.number).padStart(2, '0')}</span>;
}

function LoadingPanel({ text }: { text: string }) {
  return (
    <div className="mx-auto grid min-h-[50vh] max-w-6xl place-items-center px-4">
      <div className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-white/45">{text}</div>
    </div>
  );
}

export function ComicHomePage() {
  const { episodes, isLoading, error } = useComicEpisodes();
  const latest = episodes[0];

  if (isLoading) return <LoadingPanel text="Opening story channel" />;

  return (
    <main>
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="story-grid absolute inset-0 opacity-60" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_68%_18%,rgba(0,216,255,.16),transparent_36%),radial-gradient(circle_at_20%_55%,rgba(255,0,153,.11),transparent_32%)]" />
        <div className="relative mx-auto grid min-h-[78vh] max-w-[1500px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-10 lg:py-24">
          <div className="max-w-3xl">
            <div className="mb-5 flex items-center gap-3 font-mono-ui text-[10px] uppercase tracking-[.24em] text-[hsl(var(--secondary))]">
              <span className="h-px w-12 bg-[hsl(var(--secondary))]" />
              Main story feed
            </div>
            <h1 className="story-title font-display text-[clamp(4.6rem,13vw,10rem)] font-black uppercase leading-[.72] tracking-[-.055em] text-white">
              403<br /><span className="text-[hsl(var(--primary))]">Town</span>
            </h1>
            <p className="mt-8 max-w-xl font-mono-ui text-[11px] uppercase leading-6 tracking-[.08em] text-white/55 sm:text-xs">
              A living digital town, a crew caught inside its glitches, and a story that starts before anybody understands what is really breaking.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {latest ? (
                <Link href={`/read/${latest.slug}`} className="group inline-flex items-center gap-3 bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-[.14em] text-[#071014] transition-transform hover:-translate-y-0.5">
                  Read episode <EpisodeNumber episode={latest} /> <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ) : null}
              <Link href="/archive" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 font-display text-sm font-black uppercase tracking-[.14em] text-white hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))]">
                Episode archive <BookOpen size={16} />
              </Link>
              <Link href="/world" className="inline-flex items-center gap-3 border border-white/15 px-5 py-3 font-display text-sm font-black uppercase tracking-[.14em] text-white hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]">
                World hub <Map size={16} />
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div className="absolute -inset-6 border border-[hsl(var(--primary)/.12)]" />
            <div className="relative overflow-hidden border border-white/12 bg-[#0c0f14]/92 p-4 shadow-2xl sm:p-6">
              <div className="mb-4 flex items-center justify-between font-mono-ui text-[9px] uppercase tracking-[.2em] text-white/40">
                <span>Latest transmission</span>
                <span className="flex items-center gap-2 text-[hsl(var(--accent))]"><Radio size={12} /> Live</span>
              </div>
              {latest ? (
                <>
                  <div className="relative aspect-[16/9] overflow-hidden border border-white/10 bg-[linear-gradient(135deg,rgba(0,216,255,.12),rgba(255,0,153,.08)),#090b0f]">
                    {latest.cover && <img src={latest.cover} alt="Episode storyboard preview" className="h-full w-full object-cover object-top opacity-45 grayscale" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#07090c] via-[#07090c]/35 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 sm:p-7">
                      <div className="font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--secondary))]">Episode <EpisodeNumber episode={latest} /> // {latest.status}</div>
                      <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none text-white sm:text-5xl">{latest.title}</h2>
                    </div>
                  </div>
                  <p className="mt-5 font-mono-ui text-[10px] uppercase leading-5 tracking-[.07em] text-white/45">{latest.summary}</p>
                  <Link href={`/read/${latest.slug}`} className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 font-display text-sm font-bold uppercase tracking-[.14em] text-white hover:text-[hsl(var(--primary))]">
                    Enter reader <ChevronRight size={16} />
                  </Link>
                </>
              ) : (
                <div className="grid min-h-80 place-items-center font-mono-ui text-[10px] uppercase tracking-widest text-white/40">No episodes published yet</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {error && <div className="mx-auto max-w-[1500px] px-4 pt-6 font-mono-ui text-[10px] uppercase text-[hsl(var(--destructive))] sm:px-6 lg:px-10">Story feed notice: {error}</div>}

      <section className="border-b border-white/10 bg-[#0b0d11]">
        <div className="mx-auto grid max-w-[1500px] gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1fr_1fr] lg:px-10 lg:py-20">
          <div>
            <div className="font-mono-ui text-[9px] uppercase tracking-[.25em] text-[hsl(var(--primary))]">One universe // two ways in</div>
            <h2 className="mt-3 max-w-2xl font-display text-4xl font-black uppercase leading-[.9] text-white sm:text-6xl">The comic is canon.<br />The TCG lets you play inside it.</h2>
            <p className="mt-6 max-w-xl font-mono-ui text-[10px] uppercase leading-6 tracking-[.08em] text-white/45">
              Follow the comic, collect the cards, and play through the same conflict from a different angle as the Static Void spreads across the town.
            </p>
            <Link href="/tcg" className="mt-7 inline-flex items-center gap-3 border border-[hsl(var(--secondary)/.7)] px-5 py-3 font-display text-sm font-black uppercase tracking-[.14em] text-[hsl(var(--secondary))] hover:bg-[hsl(var(--secondary)/.08)]">
              Enter the TCG <Boxes size={16} />
            </Link>
          </div>
          <div className="relative flex min-h-80 items-center justify-center overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_center,rgba(255,0,153,.10),transparent_60%)] px-8 py-10">
            {cardPreviews.map((src, index) => (
              <img
                key={src}
                src={src}
                alt="403 Town TCG card preview"
                className={`absolute w-[38%] max-w-52 border border-white/10 shadow-2xl transition-transform duration-300 ${index === 0 ? '-translate-x-[58%] -rotate-6' : index === 1 ? 'z-10 scale-110' : 'translate-x-[58%] rotate-6'}`}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1500px] px-4 py-16 sm:px-6 lg:px-10 lg:py-20">
        <div className="grid gap-4 md:grid-cols-4">
          <InfoTile icon={<BookOpen size={19} />} index="01" title="Read in order" text="Every chapter maps directly to an episode, keeping the webcomic and core story synchronized." />
          <InfoTile icon={<Map size={19} />} index="02" title="Know the map" text="The world hub keeps Sultan, Startup, Gold Bar, Zero, and Zerobyte in one canon view." />
          <InfoTile icon={<Layers3 size={19} />} index="03" title="Color has meaning" text="Characters who hold onto their identity keep their color while drained residents fade into black and white." />
          <InfoTile icon={<Sparkles size={19} />} index="04" title="One connected world" text="The reader, world files, and TCG share the same locations, characters, and conflict." />
        </div>
      </section>
    </main>
  );
}

function InfoTile({ icon, index, title, text }: { icon: ReactNode; index: string; title: string; text: string }) {
  return (
    <div className="border border-white/10 bg-white/[.018] p-6">
      <div className="flex items-center justify-between text-[hsl(var(--primary))]">{icon}<span className="font-mono-ui text-[9px] text-white/25">// {index}</span></div>
      <h3 className="mt-8 font-display text-2xl font-black uppercase text-white">{title}</h3>
      <p className="mt-3 font-mono-ui text-[10px] uppercase leading-5 tracking-[.06em] text-white/40">{text}</p>
    </div>
  );
}

export function ComicArchivePage() {
  const { episodes, isLoading, error } = useComicEpisodes();
  if (isLoading) return <LoadingPanel text="Indexing episode archive" />;

  return (
    <main className="mx-auto min-h-[70vh] max-w-[1500px] px-4 py-12 sm:px-6 lg:px-10 lg:py-16">
      <div className="border-b border-white/10 pb-8">
        <div className="font-mono-ui text-[9px] uppercase tracking-[.25em] text-[hsl(var(--secondary))]">Archive // canonical episodes</div>
        <h1 className="mt-3 font-display text-5xl font-black uppercase leading-none text-white sm:text-7xl">Episode Index</h1>
        <p className="mt-4 max-w-2xl font-mono-ui text-[10px] uppercase leading-5 tracking-[.08em] text-white/45">Start at the beginning or jump back into the latest 403 Town release.</p>
      </div>
      {error && <div className="mt-6 font-mono-ui text-[10px] uppercase text-[hsl(var(--destructive))]">{error}</div>}
      <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {episodes.map((episode) => (
          <Link key={episode.id} href={`/read/${episode.slug}`} className="group overflow-hidden border border-white/10 bg-[#0c0f14] transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary)/.65)]">
            <div className="relative aspect-[16/10] overflow-hidden bg-[#090b0e]">
              {episode.cover && <img src={episode.cover} alt="" className="h-full w-full object-cover object-top opacity-35 grayscale transition-transform duration-500 group-hover:scale-[1.03]" />}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090b0e] via-transparent to-transparent" />
              <div className="absolute bottom-4 left-4 font-display text-7xl font-black leading-none text-white/10"><EpisodeNumber episode={episode} /></div>
            </div>
            <div className="p-5">
              <div className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[hsl(var(--secondary))]">Episode <EpisodeNumber episode={episode} /> // {episode.status}</div>
              <h2 className="mt-2 font-display text-3xl font-black uppercase text-white">{episode.title}</h2>
              <p className="mt-3 font-mono-ui text-[10px] uppercase leading-5 tracking-[.05em] text-white/40">{episode.summary}</p>
              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4 font-display text-xs font-bold uppercase tracking-[.14em] text-white/70 group-hover:text-[hsl(var(--primary))]">Read episode <ChevronRight size={15} /></div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export function ComicReaderPage() {
  const [, params] = useRoute('/read/:slug');
  const { episode, episodes, isLoading } = useComicEpisode(params?.slug);

  if (isLoading) return <LoadingPanel text="Loading reader" />;
  if (!episode) {
    return (
      <main className="mx-auto min-h-[70vh] max-w-5xl px-4 py-20 text-center">
        <div className="font-mono-ui text-[10px] uppercase tracking-[.25em] text-[hsl(var(--destructive))]">Signal not found</div>
        <h1 className="mt-3 font-display text-5xl font-black uppercase text-white">Episode unavailable</h1>
        <Link href="/archive" className="mt-8 inline-flex items-center gap-2 border border-white/15 px-5 py-3 font-display text-sm font-bold uppercase tracking-widest text-white"><ArrowLeft size={15} /> Return to archive</Link>
      </main>
    );
  }

  const ascending = [...episodes].sort((a, b) => a.number - b.number);
  const currentIndex = ascending.findIndex((item) => item.id === episode.id);
  const previous = currentIndex > 0 ? ascending[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < ascending.length - 1 ? ascending[currentIndex + 1] : null;

  return (
    <main className="bg-[#07090c]">
      <section className="border-b border-white/10 bg-[linear-gradient(180deg,rgba(0,216,255,.05),transparent),#0a0c10]">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
          <Link href="/archive" className="inline-flex items-center gap-2 font-mono-ui text-[9px] uppercase tracking-[.2em] text-white/40 hover:text-white"><ArrowLeft size={13} /> Episode archive</Link>
          <div className="mt-6 flex flex-col gap-5 border-l-2 border-[hsl(var(--primary))] pl-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="font-mono-ui text-[9px] uppercase tracking-[.23em] text-[hsl(var(--secondary))]">Episode <EpisodeNumber episode={episode} /> // {episode.status}</div>
              <h1 className="mt-2 font-display text-5xl font-black uppercase leading-none text-white sm:text-7xl">{episode.title}</h1>
              <p className="mt-4 max-w-2xl font-mono-ui text-[10px] uppercase leading-5 tracking-[.06em] text-white/45">{episode.summary}</p>
            </div>
            {episode.download && (
              <a href={episode.download} target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center gap-2 border border-white/15 px-4 py-2 font-mono-ui text-[9px] uppercase tracking-widest text-white/60 hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]">
                <Download size={13} /> Source PDF
              </a>
            )}
          </div>
          {episode.status?.toLowerCase().includes('storyboard') && (
            <div className="mt-6 border border-[hsl(var(--secondary)/.35)] bg-[hsl(var(--secondary)/.05)] px-4 py-3 font-mono-ui text-[9px] uppercase leading-5 tracking-[.08em] text-white/45">
              Early access episode: this story is available now as the first signal from 403 Town.
            </div>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-[1050px] px-2 py-8 sm:px-4 sm:py-12">
        <div className="space-y-3 sm:space-y-5">
          {episode.pages.map((page, index) => (
            <figure key={page} className="episode-paper mx-auto overflow-hidden border border-white/10 bg-white shadow-2xl">
              <img src={page} alt={`${episode.title} page ${index + 1}`} loading={index < 2 ? 'eager' : 'lazy'} className="h-auto w-full" />
            </figure>
          ))}
        </div>
      </section>

      <section className="border-t border-white/10 bg-[#0a0c10]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-8 sm:px-6 lg:px-8">
          {previous ? (
            <Link href={`/read/${previous.slug}`} className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-white/55 hover:text-white"><ArrowLeft size={15} /> Episode <EpisodeNumber episode={previous} /></Link>
          ) : <span />}
          <Link href="/archive" className="font-mono-ui text-[9px] uppercase tracking-[.2em] text-[hsl(var(--primary))]">All episodes</Link>
          {next ? (
            <Link href={`/read/${next.slug}`} className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-widest text-white/55 hover:text-white">Episode <EpisodeNumber episode={next} /> <ArrowRight size={15} /></Link>
          ) : <span />}
        </div>
      </section>
    </main>
  );
}
