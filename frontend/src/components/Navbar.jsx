import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { clearAuthSession, getStoredUser, isAuthenticated } from '../services/authStorage';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const user = getStoredUser();
  const authed = isAuthenticated();

  const navItems = [
    { to: '/', label: 'Home' },
    { to: '/team', label: 'Team' },
    ...(authed ? [{ to: '/dashboard', label: 'Dashboard' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Admin' }] : []),
    ...(!authed
      ? [
          { to: '/login', label: 'Login' },
          { to: '/signup', label: 'Signup' }
        ]
      : [])
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/30 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="font-heading text-2xl font-bold text-primary">
          ForensIQ
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive ? 'text-accent' : 'text-slate-700 hover:text-primary'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          {authed && (
            <button
              onClick={() => {
                clearAuthSession();
                window.location.href = '/';
              }}
              className="rounded-md bg-primary px-3 py-1.5 text-sm text-white"
            >
              Logout
            </button>
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

      {isOpen && (
        <div className="border-t border-white/40 bg-white/80 px-4 py-3 md:hidden">
          <div className="flex flex-col gap-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-slate-700"
              >
                {item.label}
              </NavLink>
            ))}
            {authed && (
              <button
                onClick={() => {
                  clearAuthSession();
                  window.location.href = '/';
                }}
                className="rounded-md bg-primary px-3 py-2 text-left text-sm text-white"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
