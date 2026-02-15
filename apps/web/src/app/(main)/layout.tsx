'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';
import SyncIndicator from '@/components/ui/SyncIndicator';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import MatrixRain from '@/components/ui/MatrixRain';
import MatrixBackground from '@/components/ui/MatrixBackground';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: '♠' },
  { href: '/sessions/new', label: 'Add Session', icon: '◎' },
  { href: '/statistics', label: 'Statistics', icon: '📈' },
  { href: '/reports', label: 'Reports', icon: '📊' },
  { href: '/bankroll', label: 'Bankroll', icon: '₯' },
  { href: '/hands', label: 'Hands', icon: '🃏' },
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { pendingCount } = useOfflineSync();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  return (
    <div className="flex min-h-screen relative">
      {/* Matrix effects */}
      <MatrixBackground />
      <MatrixRain />
      
      {/* Sidebar: matrix character as logo + background */}
      <aside className="w-56 bg-bg-surface/98 backdrop-blur-md border-r border-border/50 flex flex-col shrink-0 relative z-10 shadow-[2px_0_20px_rgba(0,0,0,0.5)] overflow-hidden">
        {/* Matrix character background in sidebar */}
        <div
          className="absolute inset-0 opacity-[0.06] bg-cover bg-center bg-no-repeat pointer-events-none"
          style={{ backgroundImage: 'url(/matrixsnek.png)', backgroundSize: 'contain' }}
        />
        <div className="p-4 flex items-center gap-3 border-b border-border relative z-10">
          <img src="/matrixsnek.png" alt="Bankroll Tracker" className="w-10 h-10 rounded-md shadow-[0_0_16px_rgba(0,229,255,0.6)]" />
          <span className="text-primary font-bold text-lg">Bankroll Tracker</span>
        </div>

        <nav className="flex-1 p-3 space-y-1 relative z-10">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item-glow flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium border border-transparent ${
                  active
                    ? 'active bg-primary/15 text-primary border-primary/30'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-card hover:border-primary/20'
                }`}
              >
                <span className="text-base opacity-90" aria-hidden>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border space-y-2 relative z-10">
          <SyncIndicator pendingCount={pendingCount} />
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 rounded-lg text-sm font-medium text-loss hover:bg-loss/10 transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6 relative z-10">{children}</main>
    </div>
  );
}
