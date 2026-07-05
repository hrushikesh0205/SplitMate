import { useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useRouter } from '../context/RouterContext.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { Card, CardHeader, CardBody } from '../components/ui/Card.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import api from '../lib/axios.jsx';
import { formatMoney, formatDate, classNames } from '../lib/utils.jsx';
import {
  Mail, Lock, User, Globe, Shield, LogOut, Camera, Check, KeyRound, Bell,
  Receipt, Users, HandCoins, Calendar,
} from 'lucide-react';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AUD', 'CAD', 'JPY', 'CNY', 'SGD', 'AED'];

export function ProfilePage() {
  const { user, profile, updateProfile, signOut } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [currency, setCurrency] = useState(profile?.currency || 'INR');
  const [saving, setSaving] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const saveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({ full_name: fullName, avatar_url: avatarUrl, currency });
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.message || 'Could not save');
    } finally {
      setSaving(false);
    }
  };

  // dummy stats (derived from session metadata would require fetching; keep simple)
  const stats = [
    { label: 'Member since', value: formatDate(profile?.created_at || user?.created_at, 'medium'), icon: Calendar, accent: 'primary' },
    { label: 'Account ID', value: (user?.id || '').slice(0, 8), icon: Shield, accent: 'accent' },
    { label: 'Currency', value: currency, icon: Globe, accent: 'warn' },
    { label: 'Plan', value: 'Free', icon: Check, accent: 'primary' },
  ];

  const changePassword = async (e) => {
    e.preventDefault();
    if (!currentPw || !newPw) return toast.error('Fill in both password fields');
    if (newPw.length < 6) return toast.error('New password must be at least 6 characters');
    setPwLoading(true);
    try {
      await api.put('/users/change-password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully');
      setCurrentPw('');
      setNewPw('');
    } catch (err) {
      toast.error(err.message || 'Could not change password');
    } finally {
      setPwLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">Profile</h2>
          <p className="text-sm text-muted">Manage your account and preferences</p>
        </div>
        <Button variant="ghost" onClick={() => { signOut(); navigate('/'); }} leftIcon={<LogOut size={15} />} className="!text-danger-600 !border-danger-200">
          Sign out
        </Button>
      </div>

      {/* User card */}
      <Card className="mt-6 overflow-hidden">
        <div className="relative h-28 bg-gradient-to-br from-primary-600 via-violet-600 to-accent-600">
          <div className="absolute inset-0 bg-grid-dark opacity-25" />
        </div>
        <div className="px-5 pb-5">
          <div className="-mt-10 flex flex-wrap items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <Avatar name={fullName || 'User'} src={avatarUrl} size="xl" ring className="ring-4 ring-[var(--card)]" />
              <div className="pb-1">
                <h3 className="text-lg font-bold text-[var(--fg)]">{fullName || 'Your name'}</h3>
                <p className="text-sm text-muted">{user?.email}</p>
              </div>
            </div>
            <Badge tone="accent" dot>Active</Badge>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} accent={s.accent} />)}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Edit profile */}
        <Card className="lg:col-span-2">
          <CardHeader title="Edit profile" subtitle="Update your personal information" />
          <CardBody>
            <form onSubmit={saveProfile} className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar name={fullName || 'User'} src={avatarUrl} size="lg" />
                <div className="flex-1">
                  <Field label="Avatar URL" hint="Paste a link to your profile picture">
                    <Input placeholder="https://…" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} icon={Camera} />
                  </Field>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full name">
                  <Input icon={User} value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" />
                </Field>
                <Field label="Email">
                  <Input icon={Mail} value={user?.email || ''} disabled />
                </Field>
              </div>
              <Field label="Preferred currency" hint="Used for all your balances and totals">
                <Select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </Select>
              </Field>
              <div className="flex justify-end">
                <Button type="submit" loading={saving} leftIcon={<Check size={15} />}>Save changes</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader title="Security" subtitle="Keep your account safe" />
          <CardBody className="space-y-3">
            <form onSubmit={changePassword} className="rounded-xl border border-token bg-elev p-4 space-y-3">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500"><KeyRound size={16} /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--fg)]">Change password</p>
                  <p className="text-[11px] text-muted">Update your account password</p>
                </div>
              </div>
              <Input
                type="password"
                placeholder="Current password"
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                icon={Lock}
              />
              <Input
                type="password"
                placeholder="New password (min 6 chars)"
                value={newPw}
                onChange={(e) => setNewPw(e.target.value)}
                icon={Lock}
              />
              <Button type="submit" variant="ghost" size="sm" className="w-full" loading={pwLoading}>
                Change password
              </Button>
            </form>
            <div className="rounded-xl border border-token bg-elev p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-500/10 text-accent-500"><Shield size={16} /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--fg)]">Two-factor auth</p>
                  <p className="text-[11px] text-muted">Coming soon</p>
                </div>
              </div>
              <Badge tone="neutral" className="mt-3">Not enabled</Badge>
            </div>
            <div className="rounded-xl border border-token bg-elev p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warn-500/10 text-warn-500"><Bell size={16} /></span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-[var(--fg)]">Notifications</p>
                  <p className="text-[11px] text-muted">In-app alerts are on</p>
                </div>
              </div>
              <Badge tone="accent" className="mt-3" dot>Enabled</Badge>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Danger zone */}
      <Card className="mt-6 border-danger-200 dark:border-danger-500/20">
        <CardBody>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-danger-600">Sign out</p>
              <p className="text-xs text-muted">End your session on this device.</p>
            </div>
            <Button variant="ghost" onClick={() => { signOut(); navigate('/'); }} leftIcon={<LogOut size={15} />} className="!text-danger-600 !border-danger-200">
              Sign out
            </Button>
          </div>
        </CardBody>
      </Card>
    </DashboardLayout>
  );
}
