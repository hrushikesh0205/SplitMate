import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from '../context/RouterContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button, IconButton } from '../components/ui/Button.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  fetchNotifications, markNotificationRead, markAllNotificationsRead, deleteNotification,
} from '../lib/api.jsx';
import { relativeTime, formatDate, classNames, groupSortDateKey } from '../lib/utils.jsx';
import {
  Bell, CheckCheck, Trash2, Receipt, HandCoins, Users, Info, Check,
} from 'lucide-react';

const TYPE_ICON = {
  expense: Receipt,
  settlement: HandCoins,
  group: Users,
  general: Info,
};

function NotificationItem({ n, onRead, onDelete }) {
  const Icon = TYPE_ICON[n.type] || Bell;
  return (
    <div className={classNames(
      'group flex items-start gap-3 rounded-xl border p-4 transition',
      n.read ? 'border-token bg-elev' : 'border-primary-200 bg-primary-50/50 dark:border-primary-500/30 dark:bg-primary-500/5'
    )}>
      <span className={classNames('mt-0.5 flex h-9 w-9 items-center justify-center rounded-xl',
        n.read ? 'bg-elev text-muted' : 'bg-primary-500/10 text-primary-500')}>
        <Icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-[var(--fg)]">{n.title}</p>
          {!n.read && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-500" />}
        </div>
        {n.body && <p className="mt-0.5 text-xs text-muted">{n.body}</p>}
        <p className="mt-1.5 text-[11px] text-muted">{relativeTime(n.created_at)}</p>
      </div>
      <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
        {!n.read && (
          <IconButton onClick={() => onRead(n)} aria-label="Mark read" className="!h-8 !w-8">
            <Check size={14} />
          </IconButton>
        )}
        <IconButton onClick={() => onDelete(n)} aria-label="Delete" className="!h-8 !w-8">
          <Trash2 size={14} />
        </IconButton>
      </div>
    </div>
  );
}

export function NotificationsPage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('all');

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const n = await fetchNotifications();
      setItems(n);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const unread = items.filter((n) => !n.read).length;

  const grouped = useMemo(() => {
    let list = items;
    if (filter === 'unread') list = list.filter((n) => !n.read);
    const map = new Map();
    for (const n of list) {
      const key = groupSortDateKey(n);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(n);
    }
    return Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]));
  }, [items, filter]);

  const handleRead = async (n) => {
    try { await markNotificationRead(n.id, true); load(); }
    catch (e) { toast.error('Could not mark as read'); }
  };
  const handleDelete = async (n) => {
    try { await deleteNotification(n.id); toast.success('Notification deleted'); load(); }
    catch (e) { toast.error('Could not delete'); }
  };
  const handleAll = async () => {
    try { await markAllNotificationsRead(); toast.success('All marked as read'); load(); }
    catch (e) { toast.error('Something went wrong'); }
  };

  const labelFor = (key) => {
    const today = new Date().toISOString().slice(0, 10);
    const yest = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (key === today) return 'Today';
    if (key === yest) return 'Yesterday';
    return formatDate(key, 'long');
  };

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">Notifications</h2>
          <p className="text-sm text-muted">{unread} unread · {items.length} total</p>
        </div>
        {unread > 0 && (
          <Button variant="ghost" onClick={handleAll} leftIcon={<CheckCheck size={15} />}>Mark all read</Button>
        )}
      </div>

      {/* Filter tabs */}
      <div className="mt-5 flex gap-1 rounded-xl border border-token bg-elev p-1 w-fit">
        {[
          { key: 'all', label: 'All', count: items.length },
          { key: 'unread', label: 'Unread', count: unread },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setFilter(t.key)}
            className={classNames(
              'rounded-lg px-3 py-1.5 text-xs font-semibold transition',
              filter === t.key ? 'bg-primary-500 text-white shadow-soft' : 'text-muted hover:text-[var(--fg)]'
            )}
          >
            {t.label} <span className="opacity-70">{t.count}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 space-y-6">
        {loading ? (
          <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : grouped.length ? (
          grouped.map(([key, list]) => (
            <div key={key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">{labelFor(key)}</p>
              <div className="space-y-2">
                {list.map((n) => <NotificationItem key={n.id} n={n} onRead={handleRead} onDelete={handleDelete} />)}
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            icon={Bell}
            title={filter === 'unread' ? 'No unread notifications' : 'No notifications yet'}
            description={filter === 'unread' ? 'You are all caught up.' : 'Activity from your groups will show up here.'}
            action={items.length === 0 ? <Button onClick={() => navigate('/dashboard')} leftIcon={<Receipt size={15} />}>Go to dashboard</Button> : null}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
