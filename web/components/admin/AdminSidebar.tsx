"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHouse,
  faToggleOn,
  faRobot,
  faDollarSign,
  faUsers,
  faChartLine,
  faShieldAlt,
  faClipboardList,
  faDatabase,
  faCog
} from "@fortawesome/free-solid-svg-icons";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: faHouse },
  { href: "/admin/features", label: "Feature Flags", icon: faToggleOn },
  { href: "/admin/bots", label: "Bot Instances", icon: faRobot },
  { href: "/admin/pricing", label: "Pricing Plans", icon: faDollarSign },
  { href: "/admin/users", label: "Users & Subscriptions", icon: faUsers },
  { href: "/admin/analytics", label: "Analytics", icon: faChartLine },
  { href: "/admin/database", label: "Database", icon: faDatabase },
  { href: "/admin/settings", label: "Settings", icon: faCog },
  { href: "/admin/logs", label: "Admin Logs", icon: faClipboardList },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-60 border-r bg-slate-900 text-white h-screen sticky top-0">
      <div className="p-5 border-b border-slate-800">
        <Link href="/admin" className="flex items-center gap-2">
          <FontAwesomeIcon icon={faShieldAlt} className="h-7 w-7 text-primary" />
          <div>
            <div className="text-lg font-bold">Admin Panel</div>
            <div className="text-xs text-slate-400">Lena Bot</div>
          </div>
        </Link>
      </div>

      <nav className="p-3">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md transition text-sm",
                  isActive
                    ? "bg-primary text-white"
                    : "hover:bg-slate-800 text-slate-300"
                )}
              >
                <FontAwesomeIcon icon={item.icon} className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-slate-800">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-md border border-slate-700 hover:bg-slate-800 transition text-slate-300 text-sm"
          >
            <FontAwesomeIcon icon={faHouse} className="h-4 w-4" />
            <span>User Dashboard</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}
