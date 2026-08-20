import { useEffect, type ReactNode } from 'react';
import { BookOpen, Boxes, ChevronRight, Radio } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'wouter';

const navigation = [
  { href: '/', label: 'Latest' },
  { href: '/world', label: 'World' },
  { href: '/archive', label: 'Episodes' },
  { href: '/tcg', label: 'TCG' },
];

export function SiteShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  return (
    <div className="story-shell scanlines min-h-[100dvh] text-foreground">
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#090b0f]/92 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1500px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-10">
          <Link href="/" className="group flex items-center gap-3" onClick={() => setMenuOpen(false)}>
            <div className="relative grid h-10 w-10 place-items-center border border-[hsl(var(--primary)/.7)] bg-[hsl(var(--primary)/.06)] font-mono-ui text-xs font-black text-[hsl(var(--primary))]">
              403
              <span className="absolute -bottom-1 -right-1 h-2 w-2 bg-[hsl(var(--secondary))]" />
            </div>
            <div className="leading-none">
              <div className="font-display text-xl font-black tracking-[.14em] text-white group-hover:text-[hsl(var(--primary))]">TOWN</div>
              <div className="mt-1 font-mono-ui text-[8px] uppercase tracking-[.28em] text-white/45">Story uplink // sector 403</div>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navigation.map((item) => {
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-4 py-2 font-mono-ui text-[10px] uppercase tracking-[.2em] transition-colors ${active ? 'text-[hsl(var(--primary))]' : 'text-white/55 hover:text-white'}`}
                >
                  {item.label}
                </Link>
              );
            })}
            <a
              href="https://theailabel.com"
              className="px-4 py-2 font-mono-ui text-[10px] uppercase tracking-[.2em] text-white/55 transition-colors hover:text-[hsl(var(--accent))]"
            >
              AI Label
            </a>
          </nav>

          <div className="hidden items-center gap-3 font-mono-ui text-[9px] uppercase tracking-widest text-white/40 md:flex">
            <a href="https://theailabel.com" className="hover:text-white">TheAIlabel.com</a>
            <span className="text-white/15">/</span>
            <span className="flex items-center gap-2"><Radio size={13} className="text-[hsl(var(--accent))]" /> Canon feed online</span>
          </div>

          <button
            type="button"
            className="flex h-9 items-center gap-2 border border-[hsl(var(--primary)/.45)] bg-[hsl(var(--primary)/.08)] px-3 font-display text-xs font-black uppercase tracking-[.14em] text-white md:hidden"
            onClick={() => setMenuOpen((open) => !open)}
            aria-expanded={menuOpen}
            aria-controls="story-mobile-menu"
          >
            Menu
            <ChevronRight className={`transition-transform ${menuOpen ? 'rotate-90' : ''}`} size={15} />
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-white/10 bg-[#090b0f] px-4 py-3 md:hidden">
            <div className="mb-2 font-mono-ui text-[9px] uppercase tracking-[.22em] text-white/45">Navigate // 403 Town</div>
            <nav id="story-mobile-menu" className="grid border border-white/10 bg-[#05070a]">
            {navigation.map((item) => {
              const active = item.href === '/' ? location === '/' : location.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center justify-between border-b border-white/5 px-4 py-3 font-display text-sm font-bold uppercase tracking-[.1em] ${active ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : 'text-white/78'}`}
                >
                  {item.label}
                  {item.href === '/tcg' ? <Boxes size={15} className="text-[hsl(var(--secondary))]" /> : <BookOpen size={15} className="text-[hsl(var(--primary))]" />}
                </Link>
              );
            })}
            <a
              href="https://theailabel.com"
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between px-4 py-3 font-display text-sm font-bold uppercase tracking-[.1em] text-white/78"
            >
              The AI Label
              <Radio size={15} className="text-[hsl(var(--accent))]" />
            </a>
            </nav>
          </div>
        )}
      </header>
      {children}
      <footer className="border-t border-white/10 bg-[#080a0d]">
        <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-8 font-mono-ui text-[9px] uppercase tracking-[.18em] text-white/35 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <span>403 Town // story, world, and game connected</span>
          <span className="flex flex-wrap gap-x-4 gap-y-2"><Link href="/world" className="hover:text-white">World hub</Link><Link href="/tcg" className="hover:text-white">TCG</Link><a href="https://theailabel.com" className="hover:text-white">The AI Label</a></span>
        </div>
      </footer>
    </div>
  );
}
