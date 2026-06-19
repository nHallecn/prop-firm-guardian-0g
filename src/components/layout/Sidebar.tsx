// src/components/layout/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, KeyRound } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Terminal Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Verification Vault', href: '/history', icon: ShieldAlert },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-69px)]">
      <div className="space-y-6">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-3 block">Navigation</span>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-slate-900 text-white border border-slate-800' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="bg-slate-900/50 border border-slate-800/60 p-4 rounded-xl space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <KeyRound className="w-3.5 h-3.5 text-blue-500" />
          <span>Security Protocol</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          All reports are processed locally and securely compiled into Merkle trees before submission to 0G storage nodes.
        </p>
      </div>
    </aside>
  );
}