import { useEffect, useState, type ReactNode } from 'react';
import { Activity, BookOpen, Boxes, ChevronRight, CircleUserRound, Crosshair, Database, Gauge, PackageCheck, Settings, ShoppingBag, Trophy, Wifi, Zap } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { getGetGameProfileQueryKey, useGetGameProfile } from '@/lib/api-client-react';

const nav = [
  { href: '/tcg', label: 'Command', mobileLabel: 'Home', icon: Gauge, code: '00' },
  { href: '/tcg/arena', label: 'Arena', mobileLabel: 'Arena', icon: Wifi, code: '01' },
  { href: '/tcg/deck-builder', label: 'Deck Builder', mobileLabel: 'Deck', icon: PackageCheck, code: '02' },
  { href: '/tcg/battle', label: 'Practice Field', mobileLabel: 'Practice', icon: Crosshair, code: '07' },
  { href: '/tcg/online', label: 'Account', mobileLabel: 'Account', icon: CircleUserRound, code: '08' },
  { href: '/tcg/story', label: 'Solo story', mobileLabel: 'Story', icon: BookOpen, code: '03' },
  { href: '/tcg/collection', label: 'Collection', mobileLabel: 'Cards', icon: Boxes, code: '04' },
  { href: '/tcg/shop', label: 'Market', mobileLabel: 'Shop', icon: ShoppingBag, code: '05' },
  { href: '/tcg/matches', label: 'Match logs', mobileLabel: 'Logs', icon: Trophy, code: '06' },
];

const mobileExtraNav = [
  { href: '/tcg/profile', label: 'Player Profile' },
  { href: '/world', label: '403 World Hub' },
  { href: '/', label: 'Read Comic' },
];

function SkeletonProfile() {
  return <div className="h-9 w-32 animate-pulse bg-[hsl(var(--muted))]" data-testid="skeleton-profile" />;
}

export function GameShell({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const profileQuery = useGetGameProfile({ query: { queryKey: getGetGameProfileQueryKey() } });
  const profile = profileQuery.data;
  const activeNav = [...nav, ...mobileExtraNav].find((item) => item.href === location);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="scanlines client-shell min-h-[100dvh] text-foreground">
      <header className="tcg-topbar sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--sidebar)/.92)] backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          <Link href="/tcg" className="group flex min-w-fit items-center gap-3" data-testid="link-brand-home">
            <div className="relative flex h-10 w-10 items-center justify-center border border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.08)] font-mono-ui text-xs font-bold text-[hsl(var(--primary))]">
              <span className="absolute -right-1 -top-1 h-1.5 w-1.5 bg-[hsl(var(--secondary))]" />
              403
            </div>
            <div className="hidden leading-none sm:block">
              <div className="font-display text-lg font-black tracking-[.12em] text-white transition-colors group-hover:text-[hsl(var(--primary))]">TOWN</div>
              <div className="font-mono-ui text-[9px] tracking-[.2em] text-[hsl(var(--muted-foreground))]">TCG // LIVE CLIENT</div>
            </div>
          </Link>
          <div className="hidden items-center gap-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] md:flex">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--accent))]" />
            Server 03 // Online
          </div>
          <div className="flex items-center gap-3">
            <a href="https://theailabel.com" className="hidden border border-[hsl(var(--border))] px-3 py-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))] xl:inline-flex">AI Label</a>
            <Link href="/world" className="hidden border border-[hsl(var(--border))] px-3 py-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--secondary))] hover:text-[hsl(var(--secondary))] md:inline-flex">World</Link>
            <Link href="/" className="hidden border border-[hsl(var(--border))] px-3 py-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] md:inline-flex">Read comic</Link>
            {profileQuery.isLoading ? <SkeletonProfile /> : profileQuery.isError ? <span className="font-mono-ui text-[10px] text-[hsl(var(--destructive))]" data-testid="status-profile-error">PROFILE OFFLINE</span> : (
              <div className="hidden items-center gap-4 sm:flex" data-testid="text-profile-summary">
                <span className="font-mono-ui text-xs text-[hsl(var(--primary))]">{profile?.credits ?? 0} CR</span>
                <span className="font-mono-ui text-xs text-[hsl(var(--secondary))]">{profile?.shards ?? 0} SH</span>
                <span className="h-5 w-px bg-[hsl(var(--border))]" />
                <span className="font-display text-sm font-bold text-white">{profile?.handle ?? 'UNKNOWN'}</span>
              </div>
            )}
            <Link href="/tcg/profile" className="hidden h-9 w-9 items-center justify-center border border-[hsl(var(--border))] text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] md:flex" data-testid="link-profile">
              <CircleUserRound size={17} />
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-expanded={mobileMenuOpen}
              aria-controls="tcg-mobile-menu"
              className="flex h-9 items-center gap-2 border border-[hsl(var(--primary)/.45)] bg-[hsl(var(--primary)/.08)] px-3 font-display text-xs font-black uppercase tracking-[.14em] text-white lg:hidden"
            >
              Menu
              <ChevronRight className={`transition-transform ${mobileMenuOpen ? 'rotate-90' : ''}`} size={15} />
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="border-t border-[hsl(var(--border))] bg-[#07090d] px-4 py-3 lg:hidden">
            <div className="mb-2 font-mono-ui text-[9px] uppercase tracking-[.22em] text-[hsl(var(--muted-foreground))]">Navigate // {activeNav?.label ?? 'TCG'}</div>
            <nav id="tcg-mobile-menu" className="grid border border-[hsl(var(--border))] bg-[#05070a]">
            {nav.map(({ href, label, code }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`flex items-center justify-between border-b border-[hsl(var(--border))] px-4 py-3 font-display text-sm font-bold uppercase tracking-[.1em] ${location === href ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : 'text-white/78'}`}>
                <span>{label}</span>
                <span className="font-mono-ui text-[9px] text-[hsl(var(--muted-foreground))]">{code}</span>
              </Link>
            ))}
            {mobileExtraNav.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMobileMenuOpen(false)} className={`border-b border-[hsl(var(--border))] px-4 py-3 font-display text-sm font-bold uppercase tracking-[.1em] ${location === href ? 'bg-[hsl(var(--primary)/.12)] text-[hsl(var(--primary))]' : 'text-white/78'}`}>
                {label}
              </Link>
            ))}
            <a href="https://theailabel.com" onClick={() => setMobileMenuOpen(false)} className="px-4 py-3 font-display text-sm font-bold uppercase tracking-[.1em] text-white/78">The AI Label</a>
            </nav>
          </div>
        )}
      </header>
      <div className="mx-auto flex max-w-[1600px]">
        <aside className="hidden w-60 shrink-0 border-r border-[hsl(var(--border))] px-4 py-8 lg:block">
          <div className="mb-7 px-3 font-mono-ui text-[10px] uppercase tracking-[.25em] text-[hsl(var(--muted-foreground))]">Navigation // 403</div>
          <nav className="space-y-1">
            {nav.map(({ href, label, icon: Icon, code }) => {
              const active = location === href;
              return <Link key={href} href={href} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} className={`group flex items-center gap-3 border-l-2 px-3 py-3 transition-all ${active ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.1)] text-[hsl(var(--primary))]' : 'border-transparent text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--secondary))] hover:bg-[hsl(var(--muted)/.7)] hover:text-white'}`}>
                <span className="font-mono-ui text-[10px] opacity-50">{code}</span><Icon size={17} strokeWidth={1.8} /><span className="font-display text-sm font-semibold uppercase tracking-[.1em]">{label}</span>
                {active && <ChevronRight className="ml-auto" size={14} />}
              </Link>;
            })}
          </nav>
          <div className="mt-12 border-t border-[hsl(var(--border))] pt-5">
            <div className="mb-3 flex items-center justify-between px-3 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]"><span>Connection</span><Wifi size={13} className="text-[hsl(var(--accent))]" /></div>
            <div className="px-3 font-mono-ui text-[10px] leading-5 text-[hsl(var(--muted-foreground))]">DOWNLINK 18ms<br /><span className="text-[hsl(var(--accent))]">ENCRYPTED / STABLE</span></div>
          </div>
          <Link href="/tcg/profile" className="mt-12 flex items-center gap-3 px-3 py-2 font-display text-sm uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-white" data-testid="link-nav-profile"><Settings size={15} /> Player profile</Link>
          <div className="mt-4 grid gap-2 border-t border-[hsl(var(--border))] pt-4">
            <Link href="/world" className="px-3 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-white">World hub</Link>
            <a href="https://theailabel.com" className="px-3 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] hover:text-white">The AI Label</a>
          </div>
        </aside>
        <main className="min-w-0 flex-1 px-3 pb-24 pt-4 sm:px-6 lg:px-10 lg:pb-12 lg:pt-9">{children}</main>
      </div>
      <div className="pointer-events-none fixed bottom-3 right-5 z-30 hidden items-center gap-2 font-mono-ui text-[9px] uppercase tracking-widest text-[hsl(var(--muted-foreground))] lg:flex"><Activity size={12} className="text-[hsl(var(--accent))]" /> Signal alive <span className="text-[hsl(var(--border))]">///</span> v0.4.03</div>
      <nav className="tcg-bottom-nav fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-[hsl(var(--border))] bg-[#05070a]/95 px-2 pb-[calc(env(safe-area-inset-bottom)+.35rem)] pt-2 shadow-[0_-18px_38px_rgba(0,0,0,.45)] backdrop-blur-md lg:hidden" aria-label="TCG app navigation">
        {nav.filter((item) => ['/tcg', '/tcg/arena', '/tcg/story', '/tcg/collection', '/tcg/shop'].includes(item.href)).map(({ href, mobileLabel, icon: Icon }) => {
          const active = location === href;
          return (
            <Link key={href} href={href} className={`grid min-w-0 place-items-center gap-1 px-1 py-1 font-mono-ui text-[8px] uppercase tracking-normal ${active ? 'text-[hsl(var(--primary))]' : 'text-white/50'}`} data-testid={`link-bottom-${mobileLabel.toLowerCase()}`}>
              <span className={`grid h-8 w-10 place-items-center border ${active ? 'border-[hsl(var(--primary))] bg-[hsl(var(--primary)/.12)]' : 'border-transparent'}`}><Icon size={17} /></span>
              <span className="truncate">{mobileLabel}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, detail }: { eyebrow: string; title: string; detail?: string }) {
  return <div className="mb-7 flex flex-col gap-3 border-b border-[hsl(var(--border))] pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div><div className="mb-1 font-mono-ui text-[10px] uppercase tracking-[.24em] text-[hsl(var(--secondary))]">{eyebrow}</div><h1 className="font-display text-4xl font-black uppercase leading-none tracking-[.02em] text-white sm:text-5xl">{title}</h1></div>
    {detail && <div className="max-w-xs font-mono-ui text-[10px] uppercase leading-5 tracking-wider text-[hsl(var(--muted-foreground))] sm:text-right">{detail}</div>}
  </div>;
}

export function DataState({ type, message, action }: { type: 'loading' | 'error' | 'empty'; message: string; action?: () => void }) {
  return <div className="bracket-frame flex min-h-44 flex-col items-center justify-center border border-[hsl(var(--border))] bg-[hsl(var(--card)/.75)] px-6 text-center" data-testid={`state-${type}`}>
    {type === 'loading' && <div className="mb-4 h-1 w-32 animate-pulse bg-[hsl(var(--primary))]" />}
    {type === 'error' && <Zap className="mb-3 text-[hsl(var(--destructive))]" size={22} />}
    {type === 'empty' && <Database className="mb-3 text-[hsl(var(--muted-foreground))]" size={22} />}
    <p className="font-mono-ui text-[11px] uppercase tracking-widest text-[hsl(var(--muted-foreground))]">{message}</p>
    {action && <button onClick={action} className="mt-4 border border-[hsl(var(--primary))] px-4 py-2 font-mono-ui text-[10px] uppercase tracking-widest text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/.12)]" data-testid="button-retry">Retry uplink</button>}
  </div>;
}
