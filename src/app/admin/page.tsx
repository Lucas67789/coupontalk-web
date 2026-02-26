"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Key, Store, Ticket, MousePointerClick } from 'lucide-react';
import AdminSidebar from '@/components/admin/AdminSidebar';

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({ stores: 0, coupons: 0, totalClicks: 0 });
    const [topCoupons, setTopCoupons] = useState<any[]>([]);
    const router = useRouter();

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
            } else {
                setUser(session.user);

                // Fetch stats
                const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
                const { data: couponsData, count: couponCount } = await supabase.from('coupons').select('click_count', { count: 'exact' });

                const totalClicks = (couponsData || []).reduce((acc: number, curr: any) => acc + (curr.click_count || 0), 0);

                setStats({
                    stores: storeCount || 0,
                    coupons: couponCount || 0,
                    totalClicks: totalClicks
                });

                // Fetch Top 5 Coupons
                const { data: top } = await supabase.from('coupons').select('*, stores(name)').order('click_count', { ascending: false }).limit(5);
                setTopCoupons(top || []);
            }
        };
        checkUser();
    }, [router]);

    if (!user) return <div className="min-h-screen flex items-center justify-center">인증 확인 중...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <AdminSidebar />

            {/* Main Content */}
            <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">
                <header className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">환영합니다! 마스터님. 👋</h2>
                    <p className="text-gray-500">계정 이메일: {user.email}</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                            <Store size={32} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">등록된 제휴 스토어</p>
                            <div className="text-3xl font-bold text-gray-900">{stats.stores}개</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center">
                            <Ticket size={32} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">활성 쿠폰 및 할인</p>
                            <div className="text-3xl font-bold text-gray-900">{stats.coupons}개</div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-6">
                        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
                            <MousePointerClick size={32} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium mb-1">총 누적 클릭 수</p>
                            <div className="text-3xl font-bold text-gray-900">{stats.totalClicks}회</div>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Key className="text-blue-500" /> 관리자 빠른 마우스
                    </h3>
                    <div className="flex gap-4">
                        <Link href="/admin/stores" className="btn-primary">
                            스토어 관리하기
                        </Link>
                        <Link href="/admin/coupons" className="px-6 py-3 rounded-xl font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors">
                            쿠폰 관리하기
                        </Link>
                        <Link href="/" target="_blank" className="px-6 py-3 rounded-xl font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors ml-auto">
                            실제 사이트 보기
                        </Link>
                    </div>
                </div>

                {/* Top Coupons Widget */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center justify-between">
                        <span className="flex items-center gap-2 text-red-500">
                            🔥 가장 클릭이 많은 인기 쿠폰 TOP 5
                        </span>
                    </h3>

                    <div className="flex flex-col gap-4">
                        {topCoupons.map((coupon, index) => (
                            <div key={coupon.id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-sm">
                                        {index + 1}
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900">{coupon.title}</p>
                                        <p className="text-sm text-gray-500">{coupon.stores?.name} · {coupon.discount}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm">
                                    <span className="text-xs text-gray-500">총 조회수</span>
                                    <span className="font-black text-blue-600 text-lg">{coupon.click_count || 0}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
