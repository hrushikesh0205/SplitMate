import { useState } from 'react';
import { Link, useRouter } from '../../context/RouterContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { classNames, initials } from '../../lib/utils.jsx';
import {
  LayoutDashboard, Users, Receipt, HandCoins, Bell, User as UserIcon,
  LogOut, Sparkles, X, Plus,
} from 'lucide-react';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/groups', label: 'Groups', icon: Users },
  { to: '/expenses', label: 'Expenses', icon: Receipt },
  { to: '/settlement', label: 'Settlement', icon: HandCoins },
  { to: '/notifications', label: 'Notifications', icon: Bell },
  { to: '/profile', label: 'Profile', icon: UserIcon },
];

export function Sidebar({ open, onClose }) {
  const { path } = useRouter();
  const { profile, signOut } = useAuth();
  const { theme, toggle } = useTheme();
  const name = profile?.full_name || 'Friend';

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-ink-950/40 backdrop-blur-sm lg:hidden animate-fade-in" onClick={onClose} />}
      <aside
        className={classNames(
          'fixed inset-y-0 left-0 z-40 flex w-72 flex-col glass border-r border-token transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SplitMate logo" className="h-9 w-9 rounded-xl object-cover shadow-glow" />
            <span className="text-base font-bold tracking-tight text-[var(--fg)]">SplitMate</span>
          </Link>
          <button onClick={onClose} className="rounded-lg p-1.5 text-muted hover:bg-even lg:hidden">
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {NAV.map((item) => {
            const active = path.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={classNames(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'bg-primary-500/10 text-primary-700 dark:text-primary-300 shadow-soft'
                    : 'text-muted hover:bg-elev hover:text-[var(--fg)]'
                )}
              >
                <item.icon size={18} className={classNames(active ? 'text-primary-500' : 'text-muted group-hover:text-[var(--fg)]')} />
                {item.label}
                {item.label === 'Notifications' && (
                  <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-3 rounded-2xl bg-gradient-to-br from-primary-500/10 to-violet-500/10 p-4">
          <div className="flex items-center gap-2 text-primary-600 dark:text-primary-300">
            <Sparkles size={15} />
            <span className="text-xs font-semibold">Pro tip</span>
          </div>
          <p className="mt-1.5 text-xs text-muted">Add all housemates to a group to track every shared bill in one place.</p>
        </div>

        <div className="border-t border-token p-3">
          <div className="flex items-center gap-3 rounded-xl p-2">
            <Avatar name={name} src={profile?.avatar_url} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-[var(--fg)]">{name}</p>
              <p className="truncate text-xs text-muted">Personal account</p>
            </div>
            <button
              onClick={toggle}
              className="rounded-lg p-1.5 text-muted hover:bg-elev hover:text-[var(--fg)] transition"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button
              onClick={signOut}
              className="rounded-lg p-1.5 text-muted hover:bg-elev hover:text-danger-500 transition"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
