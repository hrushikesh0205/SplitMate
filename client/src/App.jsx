import { useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { RouterProvider, useRouter } from './context/RouterContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ToastProvider } from './components/ui/Toast.jsx';
import { LandingPage } from './pages/LandingPage.jsx';
import { AuthPage } from './pages/AuthPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { GroupsPage } from './pages/GroupsPage.jsx';
import { ExpensesPage } from './pages/ExpensesPage.jsx';
import { SettlementPage } from './pages/SettlementPage.jsx';
import { NotificationsPage } from './pages/NotificationsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { Skeleton } from './components/ui/Skeleton.jsx';

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 via-violet-500 to-accent-500 text-white shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 animate-spin"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" opacity="0.3" /><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
        </span>
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  );
}

function Routes() {
  const { path, navigate } = useRouter();
  const { user, loading } = useAuth();

  // redirect authenticated users away from login/register
  useEffect(() => {
    if (loading) return;
    if (user && (path === '/login' || path === '/register')) {
      navigate('/dashboard');
      return;
    }
    const protectedRoute = ['/dashboard', '/groups', '/expenses', '/settlement', '/notifications', '/profile']
      .some((p) => path.startsWith(p));
    if (!user && protectedRoute) {
      navigate('/login');
    }
  }, [loading, user, path, navigate]);

  if (loading) return <FullScreenLoader />;

  // public routes
  if (path === '/' || path === '') return <LandingPage />;
  if (path === '/login') return <AuthPage mode="login" />;
  if (path === '/register') return <AuthPage mode="register" />;

  // protected routes
  if (!user) return <AuthPage mode="login" />;

  if (path.startsWith('/dashboard')) return <DashboardPage />;
  if (path.startsWith('/groups')) return <GroupsPage />;
  if (path.startsWith('/expenses')) return <ExpensesPage />;
  if (path.startsWith('/settlement')) return <SettlementPage />;
  if (path.startsWith('/notifications')) return <NotificationsPage />;
  if (path.startsWith('/profile')) return <ProfilePage />;

  return <LandingPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <RouterProvider>
          <ToastProvider>
            <Routes />
          </ToastProvider>
        </RouterProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
