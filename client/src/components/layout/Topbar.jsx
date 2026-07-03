import { useEffect, useState } from 'react';
import { Link, useRouter } from '../../context/RouterContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { IconButton } from '../ui/Button.jsx';
import { fetchNotifications } from '../../lib/api.jsx';
import { Menu, Bell, Search, Plus } from 'lucide-react';

export function Topbar({ onMenu, onCreateExpense }) {
  const { profile } = useAuth();
  const { navigate, path } = useRouter();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!profile?.id) return;
      try {
        const n = await fetchNotifications();
        if (active) setUnread(n.filter((x) => !x.read).length);
      } catch {}
    }
    load();
    const t = setInterval(load, 30000);
    return () => { active = false; clearInterval(t); };
  }, [profile?.id]);

  const pageLabel = (() => {
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/groups')) return 'Groups';
    if (path.startsWith('/expenses')) return 'Expenses';
    if (path.startsWith('/settlement')) return 'Settlement';
    if (path.startsWith('/notifications')) return 'Notifications';
    if (path.startsWith('/profile')) return 'Profile';
    return 'SplitMate';
  })();

  return (
    <header className="sticky top-0 z-20 glass border-b border-token">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        <button onClick={onMenu} className="rounded-xl p-2 text-muted hover:bg-even lg:hidden">
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-3 flex-1">
          <h1 className="text-sm font-semibold text-[var(--fg)] hidden sm:block">{pageLabel}</h1>
          <div className="relative ml-auto hidden md:block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              placeholder="Search…"
              className="input-field !py-2 pl-9 pr-3 w-56 text-xs"
              onKeyDown={(e) => { if (e.key === 'Enter') navigate('/expenses'); }}
            />
          </div>
        </div>

        <button
          onClick={onCreateExpense}
          className="btn-primary !py-2 !px-3 text-xs hidden sm:inline-flex"
        >
          <Plus size={15} /> Add expense
        </button>

        <Link to="/notifications" className="relative">
          <IconButton aria-label="Notifications">
            <Bell size={18} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-bold text-white">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </IconButton>
        </Link>

        <Link to="/profile">
          <Avatar name={profile?.full_name || 'You'} src={profile?.avatar_url} size="sm" />
        </Link>
      </div>
    </header>
  );
}
