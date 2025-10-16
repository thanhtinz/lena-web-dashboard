'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faRightFromBracket,
  faBars,
  faTimes,
  faHouse,
  faBook,
  faDollarSign,
  faLifeRing,
  faShieldAlt
} from '@fortawesome/free-solid-svg-icons';

export default function DashboardNav({ user }: { user: any }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const ADMIN_USER_IDS = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
  const isAdmin = user && ADMIN_USER_IDS.includes(user.id);

  return (
    <nav className="fixed w-full bg-slate-900 border-b border-slate-700" style={{ height: '56px', zIndex: 100 }}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRobot} className="h-7 w-7 text-blue-500" />
          <span className="text-lg font-bold text-white">Lena Bot</span>
        </Link>
        
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          <Link href="/dashboard" className="text-sm text-slate-300 hover:text-blue-500 flex items-center gap-2">
            <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
            Dashboard
          </Link>
          <Link href="/#features" className="text-sm text-slate-300 hover:text-blue-500">Features</Link>
          <Link href="/commands" className="text-sm text-slate-300 hover:text-blue-500">
            <FontAwesomeIcon icon={faBook} className="h-4 w-4 mr-1" />
            Commands
          </Link>
          <Link href="/dashboard/pricing" className="text-sm text-slate-300 hover:text-blue-500">
            <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 mr-1" />
            Pricing
          </Link>
          <Link href="/dashboard/support" className="text-sm text-slate-300 hover:text-blue-500">
            <FontAwesomeIcon icon={faLifeRing} className="h-4 w-4 mr-1" />
            Support
          </Link>
          {isAdmin && (
            <Link href="/admin" className="text-sm text-blue-400 hover:text-blue-500 flex items-center gap-2">
              <FontAwesomeIcon icon={faShieldAlt} className="h-4 w-4" />
              Admin
            </Link>
          )}
        </div>

        {/* User Menu */}
        <div className="hidden md:flex items-center gap-3">
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
        <div className="md:hidden">
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
        <div className="md:hidden bg-slate-800 border-t border-slate-700">
          <div className="px-4 py-3 space-y-3">
            <Link 
              href="/dashboard" 
              className="block text-sm text-slate-300 hover:text-blue-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faHouse} className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
            <Link 
              href="/#features" 
              className="block text-sm text-slate-300 hover:text-blue-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/commands" 
              className="block text-sm text-slate-300 hover:text-blue-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faBook} className="h-4 w-4 mr-2" />
              Commands
            </Link>
            <Link 
              href="/dashboard/pricing" 
              className="block text-sm text-slate-300 hover:text-blue-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4 mr-2" />
              Pricing
            </Link>
            <Link 
              href="/dashboard/support" 
              className="block text-sm text-slate-300 hover:text-blue-500 py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <FontAwesomeIcon icon={faLifeRing} className="h-4 w-4 mr-2" />
              Support
            </Link>
            {isAdmin && (
              <Link 
                href="/admin" 
                className="block text-sm text-blue-400 hover:text-blue-500 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <FontAwesomeIcon icon={faShieldAlt} className="h-4 w-4 mr-2" />
                Admin Panel
              </Link>
            )}
            
            <div className="border-t border-slate-700 pt-3 mt-3">
              <div className="flex items-center gap-3 mb-3">
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
