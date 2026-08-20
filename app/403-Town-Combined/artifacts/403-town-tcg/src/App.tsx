import { useEffect, type ReactNode } from 'react';
import { ErrorBoundary } from '@/components/error-boundary';
import { GameShell } from '@/components/game-shell';
import { SiteShell } from '@/components/site-shell';
import NotFound from '@/pages/not-found';
import { AdminHomePage, TcgAdminPage } from '@/pages/admin-pages';
import { ComicArchivePage, ComicHomePage, ComicReaderPage } from '@/pages/comic-pages';
import { WorldPage } from '@/pages/world-page';
import { ArenaPage, DeckBuilderPage, OnlinePage, ProfilePage } from '@/pages/online-page';
import {
  BattlePage,
  CollectionPage,
  HomePage as TcgHomePage,
  MatchesPage,
  SettingsPage,
  ShopPage,
  StoryPage,
} from '@/pages/game-pages';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';

function StorySite() {
  return (
    <SiteShell>
      <Switch>
        <Route path="/" component={ComicHomePage} />
        <Route path="/world" component={WorldPage} />
        <Route path="/archive" component={ComicArchivePage} />
        <Route path="/read/:slug" component={ComicReaderPage} />
        <Route path="/admin" component={AdminHomePage} />
        <Route path="/admin/tcg" component={TcgAdminPage} />
        <Route component={NotFound} />
      </Switch>
    </SiteShell>
  );
}

function TcgSite() {
  return (
    <GameShell>
      <Switch>
        <Route path="/tcg" component={TcgHomePage} />
        <Route path="/tcg/online" component={OnlinePage} />
        <Route path="/tcg/arena" component={ArenaPage} />
        <Route path="/tcg/deck-builder" component={DeckBuilderPage} />
        <Route path="/tcg/battle" component={BattlePage} />
        <Route path="/tcg/story" component={StoryPage} />
        <Route path="/tcg/collection" component={CollectionPage} />
        <Route path="/tcg/shop" component={ShopPage} />
        <Route path="/tcg/matches" component={MatchesPage} />
        <Route path="/tcg/profile" component={ProfilePage} />
        <Route path="/tcg/settings" component={SettingsPage} />
        <Route path="/tcg/admin" component={TcgAdminPage} />
        <Route component={NotFound} />
      </Switch>
    </GameShell>
  );
}

function RoutedApp() {
  const [location, navigate] = useLocation();
  const normalizedLocation = location.toLowerCase();

  useEffect(() => {
    if (location !== normalizedLocation && normalizedLocation.startsWith('/tcg')) {
      navigate(normalizedLocation, { replace: true });
    }
  }, [location, navigate, normalizedLocation]);

  return normalizedLocation === '/tcg' || normalizedLocation.startsWith('/tcg/') ? <TcgSite /> : <StorySite />;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

export default function App() {
  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');

  return (
    <WouterRouter base={basePath}>
      <RoutedErrorBoundary>
        <RoutedApp />
      </RoutedErrorBoundary>
    </WouterRouter>
  );
}
