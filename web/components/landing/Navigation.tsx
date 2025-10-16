'use client';

import Link from "next/link"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faRobot } from "@fortawesome/free-solid-svg-icons"
import MobileMenu from "@/components/landing/MobileMenu"

export default function Navigation() {
  return (
    <nav className="fixed w-full bg-slate-900 border-b border-slate-700" style={{ height: '56px', zIndex: 100 }}>
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <FontAwesomeIcon icon={faRobot} className="h-7 w-7 text-blue-500" />
          <span className="text-lg font-bold text-white">Lena Bot</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
          <Link href="/#features" className="text-sm text-slate-300 hover:text-blue-500">
            Features
          </Link>
          <Link href="/commands" className="text-sm text-slate-300 hover:text-blue-500">
            Commands
          </Link>
          <Link href="/#pricing" className="text-sm text-slate-300 hover:text-blue-500">
            Pricing
          </Link>
          <Link href="/status" className="text-sm text-slate-300 hover:text-blue-500">
            Status
          </Link>
          <Link href="/docs" className="text-sm text-slate-300 hover:text-blue-500">
            Docs
          </Link>
          <Link href="/support" className="text-sm text-slate-300 hover:text-blue-500">
            Support
          </Link>
          
          <Link href="/dashboard" className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700">
            Dashboard
          </Link>
        </div>
        
        <div className="md:hidden">
          <MobileMenu />
        </div>
      </div>
    </nav>
  );
}
