import { useState, useEffect } from 'react';
import { Link, useRouter } from '../context/RouterContext.jsx';
import { Button } from '../components/ui/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import {
  ArrowRight, Users, Receipt, HandCoins, ShieldCheck,
  BarChart3, Bell, Zap, Check, Star, ChevronDown, Menu, X, Moon, Sun,
  PieChart, Wallet, Globe, Smartphone,
} from 'lucide-react';

const FEATURES = [
  { icon: Users, title: 'Smart groups', desc: 'Create groups for trips, apartments, or couples. Add members and start splitting instantly.' },
  { icon: Receipt, title: 'Effortless expenses', desc: 'Log any expense with smart categories. SplitMate divides the cost across the right people.' },
  { icon: HandCoins, title: 'Easy settle up', desc: 'See exactly who owes whom. Settle with a tap and watch balances update in real time.' },
  { icon: BarChart3, title: 'Insightful analytics', desc: 'Monthly trends, category breakdowns, and spend patterns at a glance.' },
  { icon: Bell, title: 'Real-time alerts', desc: 'Get notified the moment an expense is added or a settlement is recorded.' },
  { icon: ShieldCheck, title: 'Multiple Currency Support', desc: 'Choose your preferred currency and track expenses across different countries with consistent formatting.' },
];

const STEPS = [
  { icon: Users, title: 'Create a group', desc: 'Invite your friends, roommates, or travel companions into a shared space.' },
  { icon: Receipt, title: 'Add expenses', desc: 'Log who paid and how it should be split. SplitMate handles the math.' },
  { icon: HandCoins, title: 'Settle up', desc: 'View simplified debts and record payments to clear the balance.' },
];

const TESTIMONIALS = [
  { name: 'Maya Chen', role: 'Product Designer', quote: 'SplitMate replaced three spreadsheets and four awkward conversations. It just works.', rating: 5 },
  { name: 'Diego Martinez', role: 'Flatmate, Berlin', quote: 'The settle-up flow is the cleanest I have seen. No more "who paid for what" debates.', rating: 5 },
  { name: 'Aisha Patel', role: 'Trip organizer', quote: 'We tracked a two-week Japan trip across six people without a single argument. Unreal.', rating: 5 },
  { name: 'Tom Wright', role: 'Software Engineer', quote: 'It looks like a product I would happily pay for. The dashboard is genuinely beautiful.', rating: 5 },
];

const FAQS = [
  { q: 'Is SplitMate free to use?', a: 'Yes. SplitMate is free for personal groups of any size — roommates, trips, couples, and more.' },
  { q: 'Do my friends need an account?', a: 'Only members of a group can see its expenses. Each person creates a free account to join.' },
  { q: 'How does splitting work?', a: 'You pick who paid and who shares the cost. SplitMate divides it equally, by exact amounts, or by percentage.' },
  { q: 'Can I settle up in any currency?', a: 'SplitMate supports major currencies. Set your preferred currency in your profile and every balance updates accordingly.' },
  { q: 'Is my financial data secure?', a: 'Every record is protected by row-level security. Only members of your group can read or write its data.' },
];

const STATS = [
  { value: '12M+', label: 'Expenses tracked' },
  { value: '160+', label: 'Countries' },
  { value: '4.9★', label: 'Average rating' },
  { value: '0', label: 'Awkward conversations' },
];

function MiniDashboard() {
  return (
    <div className="relative w-full rounded-2xl border border-token bg-surface p-4 shadow-lift">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">Total balance</p>
          <p className="text-2xl font-bold text-[var(--fg)]">₹10,284</p>
        </div>
        <span className="chip border-accent-200 bg-accent-50 text-accent-700">+ ₹320 this month</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {[
          { label: 'You owe', value: '₹48.20', tone: 'text-danger-500' },
          { label: 'You are owed', value: '₹300', tone: 'text-accent-600' },
          { label: 'Net', value: '+₹320.20', tone: 'text-primary-600' },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-token bg-elev p-2.5">
            <p className="text-[10px] text-muted">{s.label}</p>
            <p className={`text-sm font-bold ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-2">
        {[
          { name: 'Sushi night', who: 'Maya paid', amt: '₹84.00', cat: 'food' },
          { name: 'Uber to airport', who: 'Diego paid', amt: '₹42.00', cat: 'transport' },
          { name: 'Airbnb Kyoto', who: 'Aisha paid', amt: '₹640.00', cat: 'rent' },
        ].map((e) => (
          <div key={e.name} className="flex items-center gap-3 rounded-xl border border-token bg-elev p-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500">
              <Receipt size={15} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold text-[var(--fg)]">{e.name}</p>
              <p className="text-[10px] text-muted">{e.who}</p>
            </div>
            <p className="text-xs font-bold text-[var(--fg)]">{e.amt}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="card-surface overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
        <span className="text-sm font-semibold text-[var(--fg)]">{q}</span>
        <ChevronDown size={18} className={`shrink-0 text-muted transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="px-5 pb-5 -mt-1 text-sm text-muted animate-fade-in">{a}</p>}
    </div>
  );
}

export function LandingPage() {
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen overflow-hidden">
      {/* Floating gradient background */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl animate-float-slow" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-0 left-1/4 h-96 w-96 rounded-full bg-accent-500/15 blur-3xl animate-float-slow" style={{ animationDelay: '4s' }} />
      </div>

      {/* Nav */}
      <header className={`fixed inset-x-0 top-0 z-40 transition-all ${scrolled ? 'glass border-b border-token' : ''}`}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="SplitMate logo" className="h-9 w-9 rounded-xl object-cover shadow-glow" />
            <span className="text-base font-bold tracking-tight text-[var(--fg)]">SplitMate</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {['Features', 'How it works', 'Reviews', 'FAQ'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} className="rounded-lg px-3 py-2 text-sm font-medium text-muted hover:text-[var(--fg)] hover:bg-elev transition">
                {l}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <Button onClick={() => navigate('/dashboard')} rightIcon={<ArrowRight size={15} />}>Open app</Button>
            ) : (
              <>
                <Button variant="ghost" className="hidden sm:inline-flex" onClick={() => navigate('/login')}>Sign in</Button>
                <Button onClick={() => navigate('/register')} className="hidden sm:inline-flex">Get started</Button>
              </>
            )}
            <button onClick={() => setMenuOpen((o) => !o)} className="rounded-xl p-2 text-muted hover:bg-elev md:hidden">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="glass border-t border-token px-4 py-3 md:hidden animate-fade-down">
            {['Features', 'How it works', 'Testimonials', 'FAQ'].map((l) => (
              <a key={l} href={`#${l.toLowerCase().replace(/\s/g, '-')}`} onClick={() => setMenuOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted hover:text-[var(--fg)] hover:bg-elev">
                {l}
              </a>
            ))}
            {!user && (
              <div className="mt-2 flex gap-2">
                <Button variant="ghost" className="flex-1" onClick={() => navigate('/login')}>Sign in</Button>
                <Button className="flex-1" onClick={() => navigate('/register')}>Get started</Button>
              </div>
            )}
          </div>
        )}
      </header>

      <section className="relative pt-28 pb-16 sm:pt-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="animate-fade-up">
              
              <h1 className="mt-5 text-4xl font-bold tracking-tight text-[var(--fg)] sm:text-5xl lg:text-6xl">
                Split expenses.<br />
                <span className="gradient-text">Not Friendships.</span><br />
              </h1>
              <p className="mt-5 max-w-md text-base text-muted sm:text-lg">
                The smartest way to track shared expenses with friends,family and colleagues.No more awkward money conversations.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button size="lg" onClick={() => navigate(user ? '/dashboard' : '/register')} rightIcon={<ArrowRight size={16} />}>
                  {user ? 'Start Splitting Free' : 'Start for free'}
                </Button>
                <Button size="lg" variant="ghost" onClick={() => navigate('/login')}>Login to Account</Button>
              </div>
            </div>
            <div className="relative animate-fade-up delay-200">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary-500/20 via-violet-500/10 to-accent-500/20 blur-2xl" />
              <div className="relative">
                <MiniDashboard />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by / stats */}
      <section className="py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted">Trusted by groups everywhere</p>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="card-surface p-6 text-center">
                <p className="text-3xl font-bold gradient-text">{s.value}</p>
                <p className="mt-1 text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">Everything you need to split fairly</h2>
            <p className="mt-4 text-muted">A complete toolkit for shared money — from the first coffee to the final settle-up.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="card-surface p-6 transition hover:shadow-lift hover:-translate-y-0.5 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500/15 to-violet-500/10 text-primary-500">
                  <f.icon size={20} />
                </span>
                <h3 className="mt-4 text-base font-semibold text-[var(--fg)]">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-16 bg-elev/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">Split smarter in 3 simple steps</h2>
            <p className="mt-4 text-muted">Create a group, invite your friends, add expenses, and settle up effortlessly.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.title} className="relative card-surface p-7">
                <span className="absolute right-5 top-5 text-5xl font-bold text-primary-500/10">{i + 1}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-violet-500 text-white shadow-glow">
                  <s.icon size={22} />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-[var(--fg)]">{s.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">Loved by people who hate math</h2>
            <p className="mt-4 text-muted">Real groups. Real settle-ups. Zero drama.</p>
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="card-surface p-6">
                <div className="flex gap-0.5 text-warn-400">
                  {Array.from({ length: t.rating }).map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
                <p className="mt-3 text-sm text-[var(--fg)]">"{t.quote}"</p>
                <div className="mt-4 flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-violet-500 text-xs font-bold text-white">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-[var(--fg)]">{t.name}</p>
                    <p className="text-[11px] text-muted">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-16 bg-elev/40">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-[var(--fg)] sm:text-4xl">Frequently asked questions</h2>
            <p className="mt-4 text-muted">Everything you want to know before you start splitting.</p>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => <FaqItem key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary-600 via-violet-600 to-accent-600 p-10 text-center shadow-lift sm:p-16">
            <div className="absolute inset-0 bg-grid-dark opacity-30" />
            <div className="relative">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Ready to split smarter?</h2>
              <p className="mt-4 text-white/80">Create a free account and start splitting expenses with your friends and groups today
              </p>
              <div className="mt-8 flex justify-center">
                <button
                  onClick={() => navigate(user ? '/dashboard' : '/register')}
                  className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-lift transition hover:-translate-y-0.5"
                >
                  {user ? 'Create Free Account' : 'Get started — it’s free'} <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-token py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <img src="/logo.png" alt="SplitMate logo" className="h-8 w-8 rounded-lg object-cover" />
                <span className="font-bold text-[var(--fg)]">SplitMate</span>
              </Link>
              <p className="mt-3 text-sm text-muted">The premium way to share expenses and settle debts with friends.</p>
            </div>
           <div className="flex flex-wrap items-center gap-x-10 gap-y-5">
  {['Features', 'How it works', 'Security'].map((link) => (
    <a
      key={link}
      href="#"
      className="text-sm text-muted hover:text-[var(--fg)] transition-colors"
    >
      {link}
    </a>
  ))}
</div>

          </div>
          <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-token pt-6 sm:flex-row">
            <p className="text-xs text-muted">© 2026 SplitMate. Built for fair splits.</p>
            <div className="flex items-center gap-4 text-muted">
              <Globe size={16} /><Smartphone size={16} /><Wallet size={16} />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
