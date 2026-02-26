"use client";

import { supabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { LogOut, Home, Key, Store, Ticket } from 'lucide-react';

export default function AdminSidebar() {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/admin/login');
    };

    const navItems = [
        { name: '대시보드 홈', href: '/admin', icon: Home },
        { name: '스토어 관리', href: '/admin/stores', icon: Store },
        { name: '쿠폰 관리', href: '/admin/coupons', icon: Ticket },
    ];

    return (
        <aside className="w-full md:w-64 bg-slate-900 text-white flex flex-col min-h-screen">
            <div className="p-6 border-b border-slate-800">
                <Link href="/admin">
                    <h1 className="text-2xl font-black text-white flex items-center gap-2">
                        <Key size={24} className="text-blue-400" />
                        관리자 패널
                    </h1>
                </Link>
            </div>
            <nav className="flex-1 p-4 flex flex-col gap-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                    const isExactHome = item.href === '/admin' && pathname !== '/admin';
                    const activeClass = (isActive && !isExactHome) || (pathname === '/admin' && item.href === '/admin')
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white';

                    return (
                        <Link key={item.name} href={item.href} className={`px-4 py-3 rounded-xl font-medium flex items-center gap-3 transition-colors ${activeClass}`}>
                            <item.icon size={18} />
                            {item.name}
                        </Link>
                    )
                })}
            </nav>
            <div className="p-4 border-t border-slate-800">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors">
                    <LogOut size={18} />
                    로그아웃
                </button>
            </div>
        </aside>
    );
}
