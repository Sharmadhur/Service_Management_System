import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { HiMenu, HiX, HiMoon, HiSun } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

const dashboardPath = { customer: '/customer', worker: '/worker', admin: '/admin' };

export default function Navbar() {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { label: 'Home', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'About', to: '/about' },
    { label: 'Contact', to: '/contact' },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 dark:border-stone-800 bg-stone-50/90 dark:bg-stone-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="font-display text-xl font-semibold tracking-tight text-brand-700 dark:text-brand-300">
          Labor<span className="text-accent-500">Link</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600 dark:text-stone-300">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="hover:text-brand-600 dark:hover:text-brand-300 transition">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-200 dark:hover:bg-stone-800"
            aria-label="Toggle dark mode"
          >
            {darkMode ? <HiSun size={18} /> : <HiMoon size={18} />}
          </button>
          {user ? (
            <>
              <button className="btn-secondary" onClick={() => navigate(dashboardPath[user.role])}>
                Dashboard
              </button>
              <button className="btn-primary" onClick={() => { logout(); navigate('/'); }}>
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Log in</Link>
              <Link to="/register" className="btn-primary">Get started</Link>
            </>
          )}
        </div>

        <button className="md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <HiX size={24} /> : <HiMenu size={24} />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-stone-200 dark:border-stone-800 px-5 py-4 space-y-3">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="block text-sm font-medium" onClick={() => setOpen(false)}>
              {l.label}
            </Link>
          ))}
          <div className="flex gap-3 pt-2">
            {user ? (
              <>
                <button className="btn-secondary flex-1" onClick={() => navigate(dashboardPath[user.role])}>Dashboard</button>
                <button className="btn-primary flex-1" onClick={() => { logout(); navigate('/'); }}>Log out</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary flex-1 text-center">Log in</Link>
                <Link to="/register" className="btn-primary flex-1 text-center">Get started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
