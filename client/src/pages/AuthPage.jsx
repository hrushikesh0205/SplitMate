import { useState } from 'react';
import { Link, useRouter } from '../context/RouterContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Field, Input } from '../components/ui/Input.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { Mail, Lock, Sparkles, ArrowRight, Check, Star } from 'lucide-react';

const HIGHLIGHTS = [
  'Split bills across any group size',
  'See who owes whom at a glance',
  'Settle up in one tap',
  'Private, secure, and free',
];

function AuthAside({ title, subtitle }) {
  return (
    <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary-600 via-violet-600 to-accent-600 p-12 text-white">
      <div className="absolute inset-0 bg-grid-dark opacity-30" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
      <div className="absolute bottom-0 -left-24 h-72 w-72 rounded-full bg-accent-300/20 blur-3xl" />

      <Link to="/" className="relative flex items-center gap-2.5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
          <Sparkles size={18} />
        </span>
        <span className="text-lg font-bold">SplitMate</span>
      </Link>

      <div className="relative">
        <h2 className="text-3xl font-bold leading-tight">{title}</h2>
        <p className="mt-3 max-w-sm text-white/80">{subtitle}</p>
        <ul className="mt-8 space-y-3">
          {HIGHLIGHTS.map((h) => (
            <li key={h} className="flex items-center gap-3 text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                <Check size={13} />
              </span>
              {h}
            </li>
          ))}
        </ul>
      </div>

      <div className="relative flex items-center gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur">
        <div className="flex -space-x-2">
          {['MC', 'DM', 'AP', 'TW'].map((n) => (
            <span key={n} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-[11px] font-bold ring-2 ring-white/40">{n}</span>
          ))}
        </div>
        <div>
          <div className="flex gap-0.5 text-warn-300">
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
          </div>
          <p className="text-xs text-white/80">Joined by 12M+ groups worldwide</p>
        </div>
      </div>
    </div>
  );
}

export function AuthPage({ mode = 'login' }) {
  const isLogin = mode === 'login';
  const { signIn, signUp } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const e = {};
    if (!isLogin && fullName.trim().length < 2) e.fullName = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email';
    if (password.length < 6) e.password = 'At least 6 characters';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isLogin) {
        await signIn(email, password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        await signUp(email, password, fullName);
        toast.success('Account created — welcome to SplitMate');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = err?.message || 'Something went wrong';
      if (msg.toLowerCase().includes('already')) {
        toast.error('An account with this email already exists');
      } else if (msg.toLowerCase().includes('credentials') || msg.toLowerCase().includes('invalid')) {
        toast.error('Incorrect email or password');
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AuthAside
        title={isLogin ? 'Welcome back to fair splits.' : 'Start splitting smarter today.'}
        subtitle={isLogin ? 'Sign in to pick up where you left off and settle up with your groups.' : 'Create a free account and start tracking shared expenses in under a minute.'}
      />

      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-fade-up">
          <Link to="/" className="mb-8 flex items-center gap-2.5 lg:hidden">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white">
              <Sparkles size={18} />
            </span>
            <span className="text-lg font-bold text-[var(--fg)]">SplitMate</span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight text-[var(--fg)]">
            {isLogin ? 'Sign in to SplitMate' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm text-muted">
            {isLogin ? 'Enter your details to access your groups.' : 'Free forever. No credit card required.'}
          </p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            {!isLogin && (
              <Field label="Full name" error={errors.fullName}>
                <Input
                  placeholder="Jordan Rivera"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </Field>
            )}
            <Field label="Email" error={errors.email}>
              <Input
                type="email"
                icon={Mail}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Field>
            <Field label="Password" error={errors.password} hint={isLogin ? '' : 'Use at least 6 characters'}>
              <Input
                type="password"
                icon={Lock}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
              />
            </Field>

            {isLogin && (
              <div className="flex items-center justify-end">
                <button type="button" className="text-xs font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400" onClick={() => toast.info('Password reset is coming soon')}>
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" loading={loading} rightIcon={!loading && <ArrowRight size={15} />}>
              {isLogin ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            {isLogin ? "Don't have an account? " : 'Already have an account? '}
            <Link to={isLogin ? '/register' : '/login'} className="font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400">
              {isLogin ? 'Sign up' : 'Sign in'}
            </Link>
          </p>

          <p className="mt-6 text-center text-[11px] text-muted">
            By continuing you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}
