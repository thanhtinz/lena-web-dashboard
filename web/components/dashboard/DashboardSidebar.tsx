'use client';

import Link from 'next/link';
import { usePathname, useParams } from 'next/navigation';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faServer,
  faGift,
  faMessage,
  faEnvelope,
  faChartLine,
  faCog,
  faRobot,
  faBell,
  faDollarSign,
  faLifeRing,
  faBars,
  faTimes,
  faCrown,
  faCode,
  faShield,
  faListCheck,
  faClock,
  faUserTag,
  faTerminal,
  faCalendarDays,
  faGavel,
  faShieldHalved,
  faGraduationCap,
  faBullhorn,
  faThumbtack
} from '@fortawesome/free-solid-svg-icons';
import { cn } from '@/lib/utils';

export default function DashboardSidebar({ isPremium = false }: { isPremium?: boolean }) {
  const pathname = usePathname();
  const params = useParams();
  const serverId = params?.id as string;
  const [isOpen, setIsOpen] = useState(false);

  // Menu items that require server selection
  const serverMenuItems = [
    { href: '/analytics', label: 'Analytics', icon: faChartLine },
    { href: '/giveaways', label: 'Giveaways', icon: faGift },
    { href: '/embeds', label: 'Embed Builder', icon: faCode },
    { href: '/responses', label: 'Auto-Responses', icon: faMessage },
    { href: '/confession', label: 'Confession', icon: faEnvelope },
    { href: '/welcome-system', label: 'Announcements', icon: faBullhorn },
    { href: '/training', label: 'Train Lena', icon: faCrown, premium: true },
    { 
      section: 'Automation & Moderation',
      items: [
        { href: '/moderation', label: 'Moderation Module', icon: faShieldHalved },
        { href: '/automod', label: 'Auto Mod', icon: faShield },
        { href: '/action-logs', label: 'Action Logs', icon: faListCheck },
        { href: '/auto-delete', label: 'Auto Delete', icon: faClock, premium: true },
        { href: '/custom-commands', label: 'Custom Commands', icon: faTerminal, premium: true },
        { href: '/scheduled-messages', label: 'Scheduled Messages', icon: faCalendarDays, premium: true },
        { href: '/sticky-messages', label: 'Sticky Messages', icon: faThumbtack },
        { href: '/auto-ban', label: 'Auto Ban', icon: faGavel, premium: true },
      ]
    },
    {
      section: 'Role Management',
      items: [
        { href: '/auto-roles', label: 'Auto Roles', icon: faUserTag },
        { href: '/temp-roles', label: 'Temp Roles', icon: faClock },
        { href: '/timed-roles', label: 'Timed Roles', icon: faCalendarDays },
        { href: '/reaction-roles', label: 'Reaction Roles', icon: faMessage },
      ]
    }
  ];

  // Global menu items
  const globalMenuItems = [
    { href: '/dashboard', label: 'My Servers', icon: faServer },
    { href: '/dashboard/custom-bots', label: 'Custom Bots', icon: faRobot, premium: true },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-5 w-5" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'w-64 bg-slate-800 border-r border-slate-700 h-screen fixed lg:static z-40 transition-transform duration-300 flex flex-col',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      )}>
        <div className="p-5 border-b border-slate-700 flex-shrink-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <FontAwesomeIcon icon={faRobot} className="h-7 w-7 text-blue-400" />
            <div>
              <div className="text-lg font-bold text-white">Dashboard</div>
              <div className="text-xs text-slate-400">Lena Bot</div>
            </div>
          </Link>
        </div>

        <nav className="p-3 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
          {/* Global Items */}
          <div className="space-y-1 mb-6">
            {globalMenuItems.map((item) => {
              if (item.premium && !isPremium) {
                return null;
              }

              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm',
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-700 text-slate-300'
                  )}
                >
                  <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                  <span>{item.label}</span>
                  {item.premium && (
                    <FontAwesomeIcon 
                      icon={faCrown} 
                      className="h-3 w-3 text-yellow-500 ml-auto" 
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Server-specific Items */}
          <div className="border-t border-slate-700 pt-3">
            <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Server Management
            </div>
            
            {!serverId ? (
              <div className="px-3 py-2 text-xs text-slate-500">
                Select a server first →
              </div>
            ) : (
              <div className="space-y-1">
                {serverMenuItems.map((item: any, index) => {
                  // Check if it's a section with nested items
                  if (item.section && item.items) {
                    return (
                      <div key={index} className="mt-4">
                        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          {item.section}
                        </div>
                        <div className="space-y-1 mt-1">
                          {item.items.map((subItem: any) => {
                            if (subItem.premium && !isPremium) {
                              return null;
                            }
                            const fullHref = `/dashboard/server/${serverId}${subItem.href}`;
                            const isActive = pathname === fullHref;

                            return (
                              <Link
                                key={subItem.href}
                                href={fullHref}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  'flex items-center gap-3 px-3 py-2 rounded-md transition text-sm',
                                  isActive
                                    ? 'bg-blue-600 text-white'
                                    : 'hover:bg-slate-700 text-slate-300'
                                )}
                              >
                                <FontAwesomeIcon icon={subItem.icon} className="h-4 w-4" />
                                <span>{subItem.label}</span>
                                {subItem.premium && (
                                  <FontAwesomeIcon 
                                    icon={faCrown} 
                                    className="h-3 w-3 text-yellow-500 ml-auto" 
                                  />
                                )}
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    );
                  }

                  // Regular menu item
                  if (item.premium && !isPremium) {
                    return null;
                  }

                  const fullHref = `/dashboard/server/${serverId}${item.href}`;
                  const isActive = pathname === fullHref;

                  return (
                    <Link
                      key={item.href}
                      href={fullHref}
                      onClick={() => setIsOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm',
                        isActive
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-slate-700 text-slate-300'
                      )}
                    >
                      <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                      <span>{item.label}</span>
                      {item.premium && (
                        <FontAwesomeIcon 
                          icon={faCrown} 
                          className="h-3 w-3 text-yellow-500 ml-auto" 
                        />
                      )}
                    </Link>
                  );
                })}
                
                {/* Settings link */}
                <Link
                  href={`/dashboard/server/${serverId}`}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-md transition text-sm',
                    pathname === `/dashboard/server/${serverId}`
                      ? 'bg-blue-600 text-white'
                      : 'hover:bg-slate-700 text-slate-300'
                  )}
                >
                  <FontAwesomeIcon icon={faCog} className="h-4 w-4" />
                  <span>Server Settings</span>
                </Link>
              </div>
            )}
          </div>

          <div className="mt-6 pt-6 border-t border-slate-700 space-y-2">
            <Link
              href="/dashboard/pricing"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:opacity-90 transition text-sm"
            >
              <FontAwesomeIcon icon={faDollarSign} className="h-4 w-4" />
              <span>Pricing & Premium</span>
            </Link>
            
            <Link
              href="/dashboard/support"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-slate-600 text-slate-300 hover:bg-slate-700 transition text-sm"
            >
              <FontAwesomeIcon icon={faLifeRing} className="h-4 w-4" />
              <span>Support</span>
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
