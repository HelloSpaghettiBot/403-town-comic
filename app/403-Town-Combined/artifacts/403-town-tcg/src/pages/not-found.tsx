import { AlertCircle } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="w-full max-w-lg border border-[hsl(var(--border))] bg-[hsl(var(--card)/.8)] p-8 text-center">
        <AlertCircle className="mx-auto h-8 w-8 text-[hsl(var(--secondary))]" />
        <h1 className="mt-4 font-display text-4xl font-black uppercase text-white">404 // Signal lost</h1>
        <p className="mt-3 font-mono-ui text-[11px] uppercase leading-5 tracking-wider text-[hsl(var(--muted-foreground))]">
          That route does not exist in Sector 403.
        </p>
        <Link href="/" className="mt-6 inline-block bg-[hsl(var(--primary))] px-5 py-3 font-display text-sm font-black uppercase tracking-widest text-[#071014]">
          Return to 403 Town
        </Link>
      </div>
    </div>
  );
}
