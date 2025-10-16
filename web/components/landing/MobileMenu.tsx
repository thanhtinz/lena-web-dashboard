"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className="p-1.5 text-white hover:bg-slate-800 rounded"
        onClick={() => setIsOpen(!isOpen)}
      >
        <FontAwesomeIcon icon={isOpen ? faTimes : faBars} className="h-4 w-4" />
      </button>

      <div 
        className={`fixed inset-0 bg-black transition-transform duration-300 md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ top: '56px', zIndex: 9999 }}
      >
        <div className="p-6 space-y-1">
          <Link href="/#features" className="block text-white py-3 border-b border-gray-800" onClick={() => setIsOpen(false)}>Features</Link>
          <Link href="/commands" className="block text-white py-3 border-b border-gray-800" onClick={() => setIsOpen(false)}>Commands</Link>
          <Link href="/#pricing" className="block text-white py-3 border-b border-gray-800" onClick={() => setIsOpen(false)}>Pricing</Link>
          <Link href="/status" className="block text-white py-3 border-b border-gray-800" onClick={() => setIsOpen(false)}>Status</Link>
          <Link href="/docs" className="block text-white py-3 border-b border-gray-800" onClick={() => setIsOpen(false)}>Docs</Link>
          <Link href="/support" className="block text-white py-3 border-b border-gray-800" onClick={() => setIsOpen(false)}>Support</Link>
          <Link href="/dashboard" className="block bg-blue-600 text-white py-2 rounded text-center mt-4 hover:bg-blue-700" onClick={() => setIsOpen(false)}>Dashboard</Link>
        </div>
      </div>
    </>
  );
}
