import { NavLink, useNavigate } from 'react-router-dom';
import { HiMoon, HiSun, HiLogout } from 'react-icons/hi';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ title, links, children }) {
  const { user, logout, darkMode, setDarkMode } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-stone-950">
      <aside className="hidden md:flex w-64 flex-col border-r border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900">
        <div className="px-6 py-5 border-b border-stone-200 dark:border-stone-800">
          <span className="font-display text-lg font-semibold text-brand-700 dark:text-brand-300">
            Labor<span className="text-accent-500">Link</span>
          </span>
          <p className="text-xs text-stone-500 mt-0.5 capitalize">{user?.role} panel</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'bg-brand-600 text-white'
                    : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                }`
              }
            >
              {l.icon} {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-stone-200 dark:border-stone-800 space-y-1">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            {darkMode ? <HiSun size={18} /> : <HiMoon size={18} />} {darkMode ? 'Light mode' : 'Dark mode'}
          </button>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            <HiLogout size={18} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-stone-200 dark:border-stone-800 bg-white/90 dark:bg-stone-900/90 backdrop-blur px-5 py-4 md:px-8">
          <h1 className="text-lg font-semibold">{title}</h1>
          <div className="text-sm text-stone-500">Hi, {user?.name?.split(' ')[0]}</div>
        </div>
        <div className="p-5 md:p-8">{children}</div>
      </main>
    </div>
  );
}
