// src/components/layout/Sidebar.tsx
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, KeyRound, ShieldCheck } from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();

  const navigation = [
    { name: 'Terminal Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Verification Vault', href: '/history', icon: ShieldAlert },
  ];

  return (
    <aside className="sticky top-[65px] hidden h-[calc(100vh-65px)] w-64 shrink-0 flex-col justify-between border-r border-slate-800 bg-[#08111d] p-4 md:flex">
      <div className="space-y-6">
        <span className="block px-3 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">Workspace</span>
        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive 
                    ? 'border border-cyan-500/30 bg-cyan-500/10 text-white shadow-[inset_3px_0_0_rgba(34,211,238,0.75)]' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <item.icon className={`h-4 w-4 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="space-y-3 rounded-md border border-slate-800 bg-[#070d17] p-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
          <KeyRound className="h-3.5 w-3.5 text-cyan-300" />
          <span>Proof Pipeline</span>
        </div>
        <p className="text-[11px] leading-5 text-slate-500">
          Trades are scored, serialized, Merkle-rooted, and anchored to 0G Storage for root-hash verification.
        </p>
        <div className="flex items-center gap-2 rounded-md border border-emerald-400/15 bg-emerald-400/10 px-2.5 py-2 text-[11px] font-medium text-emerald-200">
          <ShieldCheck className="h-3.5 w-3.5" />
          Demo-ready flow
        </div>
      </div>
    </aside>
  );
}
