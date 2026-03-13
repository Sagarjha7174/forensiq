import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, UserCircle2, X } from 'lucide-react';
import { clearAuthSession, getStoredUser, isAuthenticated } from '../services/authStorage';
import AnimatedButton from './ui/AnimatedButton';
import ThemeToggle from './ThemeToggle';
import useTheme from '../hooks/useTheme';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const user = getStoredUser();
  const authed = isAuthenticated();

  const navItems = [
    { to: '/', label: 'Home' },
    ...(!authed ? [{ to: '/team', label: 'Team' }] : []),
    ...(authed ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(authed ? [{ to: '/profile', label: 'Profile' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(!authed
      ? [
          { to: '/login', label: 'Login' },
          { to: '/signup', label: 'Signup' }
        ]
      : [])
  ];

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-white/30 bg-white/65 backdrop-blur-2xl dark:border-slate-700 dark:bg-slate-950/65"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="font-heading text-2xl font-bold text-primary dark:text-slate-100 md:text-3xl">
          ForensIQ
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-accent' : 'text-slate-700 hover:text-primary dark:text-slate-200 dark:hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {authed && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/50 bg-white/70 px-3 py-2 text-sm font-medium text-primary dark:border-slate-700 dark:bg-slate-900/90 dark:text-slate-100"
              >
                <UserCircle2 size={16} />
                {user?.first_name || 'Account'}
                <ChevronDown size={14} className={`transition ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {showUserMenu ? (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.96 }}
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-white/50 bg-white/90 p-2 shadow-glow dark:border-slate-700 dark:bg-slate-950/90"
                  >
                    <Link
                      to="/profile"
                      onClick={() => setShowUserMenu(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setShowUserMenu(false)}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-100 dark:hover:bg-slate-800"
                    >
                      Notifications
                    </Link>
                    <button
                      onClick={() => {
                        clearAuthSession();
                        window.location.href = '/';
                      }}
                      className="mt-1 block w-full rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      Logout
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </nav>

        <button
          className="md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="text-primary" /> : <Menu className="text-primary" />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-white/40 bg-white/85 px-4 py-3 dark:border-slate-700 dark:bg-slate-950/95 md:hidden"
          >
            <div className="mb-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg px-2 py-1 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  {item.label}
                </NavLink>
              ))}
              {authed && (
                <AnimatedButton
                  onClick={() => {
                    clearAuthSession();
                    window.location.href = '/';
                  }}
                  className="w-full"
                >
                  Logout
                </AnimatedButton>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}

export default Navbar;
