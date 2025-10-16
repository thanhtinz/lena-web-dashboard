'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShieldAlt,
  faHouse,
  faToggleOn,
  faRobot,
  faDollarSign,
  faUsers,
  faChartLine,
  faDatabase,
  faCog,
  faClipboardList,
  faTicket,
  faRightFromBracket,
  faBars,
  faTimes,
  faNewspaper,
  faBook
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: faHouse },
  { href: '/admin/features', label: 'Features', icon: faToggleOn },
  { href: '/admin/bots', label: 'Bots', icon: faRobot },
  { href: '/admin/pricing', label: 'Pricing', icon: faDollarSign },
  { href: '/admin/users', label: 'Users', icon: faUsers },
  { href: '/admin/blog', label: 'Blog', icon: faNewspaper },
  { href: '/admin/docs', label: 'Docs', icon: faBook },
  { href: '/admin/tickets', label: 'Tickets', icon: faTicket },
  { href: '/admin/analytics', label: 'Analytics', icon: faChartLine },
  { href: '/admin/database', label: 'Database', icon: faDatabase },
  { href: '/admin/logs', label: 'Logs', icon: faClipboardList },
  { href: '/admin/settings', label: 'Settings', icon: faCog },
];

export default function AdminTopNav({ user }: { user: any }) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed w-full bg-slate-800 border-b border-slate-700" style={{ height: '64px', zIndex: 100 }}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2">
          <FontAwesomeIcon icon={faShieldAlt} className="h-6 w-6 text-blue-400" />
          <div>
            <div className="text-lg font-bold text-white">Admin Panel</div>
            <div className="text-xs text-slate-400">Lena Bot</div>
          </div>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-md transition text-sm',
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-300 hover:bg-slate-700'
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* User Menu */}
        <div className="hidden lg:flex items-center gap-3">
          <Link href="/dashboard" className="text-sm text-slate-400 hover:text-white">
            User Dashboard
          </Link>
          {user.avatar && (
            <img
              src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
              alt={user.username}
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="text-sm text-white">{user.username}</span>
          <Link
            href="/api/auth/logout"
            className="text-sm text-red-400 hover:text-red-500"
            title="Sign out"
          >
            <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white p-2"
          >
            <FontAwesomeIcon icon={mobileMenuOpen ? faTimes : faBars} className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-t border-slate-700 max-h-96 overflow-y-auto">
          <div className="px-4 py-3 space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm',
                    isActive ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            <div className="border-t border-slate-700 pt-3 mt-3">
              <Link
                href="/dashboard"
                className="block text-sm text-slate-400 hover:text-white py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                User Dashboard
              </Link>
              <div className="flex items-center gap-3 py-2">
                {user.avatar && (
                  <img
                    src={`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm text-white">{user.username}</span>
              </div>
              <Link
                href="/api/auth/logout"
                className="block text-sm text-red-400 hover:text-red-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4 mr-2" />
                Sign Out
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
