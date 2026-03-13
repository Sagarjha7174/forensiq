import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Menu, UserCircle2, X } from 'lucide-react';
import { clearAuthSession, getStoredUser, isAuthenticated } from '../services/authStorage';
import AnimatedButton from './ui/AnimatedButton';
import ThemeToggle from './ThemeToggle';
import useTheme from '../hooks/useTheme';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const user = getStoredUser();
  const authed = isAuthenticated();

  const navItems = authed
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/dashboard#courses', label: 'Courses' },
        { to: '/dashboard#my-courses', label: 'My Courses' },
        { to: '/dashboard#notifications', label: 'Notifications' },
        { to: '/profile', label: 'Profile' },
        ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : [])
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/#courses', label: 'Courses' },
        { to: '/#team', label: 'Team' },
        { to: '/login', label: 'Login' },
        { to: '/signup', label: 'Signup' }
      ];

  const isActive = (target) => {
    const [path, hash] = target.split('#');

    if (path !== location.pathname) {
      return false;
    }

    if (!hash) {
      return !location.hash;
    }

    return location.hash === `#${hash}`;
  };

  const navItemClass = (target) =>
    `relative text-sm font-medium transition after:absolute after:bottom-[-6px] after:left-0 after:h-[2px] after:rounded-full after:bg-primary after:transition-all after:duration-300 ${
      isActive(target)
        ? 'text-primary after:w-full dark:text-indigo-400'
        : 'text-slate-600 after:w-0 hover:text-primary hover:after:w-full dark:text-slate-300 dark:hover:text-indigo-400'
    }`;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/78 backdrop-blur-2xl dark:border-slate-800 dark:bg-slate-950/72"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
        <Link to="/" className="font-heading text-2xl font-bold text-indigo-600 dark:text-indigo-400 md:text-3xl">
          ForensIQ
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={navItemClass(item.to)}
            >
              {item.label}
            </Link>
          ))}
          {authed && (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu((prev) => !prev)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/80 px-3 py-2 text-sm font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-900/85 dark:text-slate-100"
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
                    className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200/70 bg-white/95 p-2 shadow-xl shadow-slate-900/5 dark:border-slate-800 dark:bg-slate-900/95"
                  >
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
            className="border-t border-slate-200/70 bg-white/92 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/95 md:hidden"
          >
            <div className="mb-3">
              <ThemeToggle theme={theme} onToggle={toggleTheme} />
            </div>
            <div className="flex flex-col gap-3">
              {navItems.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-lg px-2 py-2 text-sm font-medium transition ${
                    isActive(item.to)
                      ? 'bg-indigo-50 text-primary dark:bg-slate-800 dark:text-indigo-300'
                      : 'text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
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
