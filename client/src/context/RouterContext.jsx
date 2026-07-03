import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';

const RouterContext = createContext(null);

function parsePath() {
  const hash = window.location.hash.replace(/^#/, '');
  return hash || '/';
}

export function RouterProvider({ children }) {
  const [path, setPath] = useState(parsePath());

  useEffect(() => {
    const onChange = () => setPath(parsePath());
    window.addEventListener('hashchange', onChange);
    if (!window.location.hash) window.location.hash = '/';
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to) => {
    const target = to.startsWith('/') ? to : `/${to}`;
    if (window.location.hash === `#${target}`) {
      setPath(target);
    } else {
      window.location.hash = target;
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const value = useMemo(() => {
    const segments = path.split('?')[0].split('/').filter(Boolean);
    return { path, navigate, segments };
  }, [path, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error('useRouter must be used within RouterProvider');
  return ctx;
}

export function Link({ to, children, className, onClick, ...rest }) {
  const { navigate } = useRouter();
  return (
    <a
      href={`#${to}`}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
