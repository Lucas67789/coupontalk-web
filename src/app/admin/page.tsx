"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/admin/AdminSidebar';
import StatCard from '@/components/admin/StatCard';
import SectionStatCard from '@/components/admin/SectionStatCard';
import TopRankingTable from '@/components/admin/TopRankingTable';
import PeriodFilter from '@/components/admin/PeriodFilter';
import { BarChart3, Users, Eye, MousePointerClick, Copy, Percent, Store, Ticket, Package, LayoutGrid } from 'lucide-react';
import { useToast } from '@/components/ToastProvider';

export default function AdminDashboard() {
    const [user, setUser] = useState<any>(null);
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    
    // Stats state
    const [stats, setStats] = useState({
        mainViews: 0,
        totalSessions: 0,
        totalViews: 0,
        totalClicks: 0,
        codeCopies: 0,
        conversionRate: 0,
    });
    
    const [sectionStats, setSectionStats] = useState({
        stores: { count: 0, views: 0, clicks: 0, conversion: 0 },
        coupons: { total: 0, active: 0, expired: 0, clicks: 0 },
        products: { count: 0, views: 0, clicks: 0 },
        categories: { travel: 0, fashion: 0, tech: 0, health: 0 }
    });

    const [topCoupons, setTopCoupons] = useState<any[]>([]);
    const [topStores, setTopStores] = useState<any[]>([]);

    const router = useRouter();

    const fetchStats = async () => {
        setIsLoading(true);
        try {
            // Calculate time filter
            let timeFilter = new Date(0).toISOString(); // all time
            const now = new Date();
            if (period === 'daily') {
                now.setHours(0, 0, 0, 0);
                timeFilter = now.toISOString();
            } else if (period === 'weekly') {
                now.setDate(now.getDate() - 7);
                timeFilter = now.toISOString();
            } else if (period === 'monthly') {
                now.setMonth(now.getMonth() - 1);
                timeFilter = now.toISOString();
            }

            // --- 1. Basic Counts (Stores, Coupons, Products) ---
            const { count: storeCount } = await supabase.from('stores').select('*', { count: 'exact', head: true });
            const { count: productCount } = await supabase.from('products').select('*', { count: 'exact', head: true });
            const { count: activeCoupons } = await supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('status', 'published');
            const { count: allCoupons } = await supabase.from('coupons').select('*', { count: 'exact', head: true });
            
            // --- 2. Analytics Tables (page_views, click_events) ---
            // Note: Since we are querying everything for demo purposes and we might not have a huge db yet, 
            // we will fetch aggregate data. In a production app with huge data, RPC functions should be used.
            
            // Page Views
            const { data: viewsData, error: viewsError } = await supabase
                .from('page_views')
                .select('path, session_id, store_id')
                .gte('created_at', timeFilter);
                
            const views = viewsData || [];
            const mainViews = views.filter(v => v.path === '/').length;
            const totalViews = views.length;
            const uniqueSessions = new Set(views.map(v => v.session_id)).size;
            
            // Click Events
            const { data: clicksData, error: clicksError } = await supabase
                .from('click_events')
                .select('type, store_id, coupon_id')
                .gte('created_at', timeFilter);
                
            const clicks = clicksData || [];
            const totalClicks = clicks.length;
            const codeCopies = clicks.filter(c => c.type === 'code_copy').length;
            const conversionRate = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

            setStats({
                mainViews,
                totalSessions: uniqueSessions,
                totalViews,
                totalClicks,
                codeCopies,
                conversionRate: Number(conversionRate)
            });

            // --- 3. Section Stats ---
            // Store Views & Clicks
            const storeViews = views.filter(v => v.store_id).length;
            const storeClicks = clicks.filter(c => c.store_id).length;
            const storeConv = storeViews > 0 ? ((storeClicks / storeViews) * 100).toFixed(1) : '0.0';

            setSectionStats({
                stores: { count: storeCount || 0, views: storeViews, clicks: storeClicks, conversion: Number(storeConv) },
                coupons: { total: allCoupons || 0, active: activeCoupons || 0, expired: (allCoupons || 0) - (activeCoupons || 0), clicks: totalClicks },
                products: { count: productCount || 0, views: 0, clicks: clicks.filter(c => c.type === 'product_click').length },
                categories: { travel: 0, fashion: 0, tech: 0, health: 0 } // Mock category data for now
            });

            // --- 4. TOP Rankings ---
            // Aggregate coupon clicks
            const couponClickMap = new Map();
            clicks.filter(c => c.coupon_id).forEach(c => {
                couponClickMap.set(c.coupon_id, (couponClickMap.get(c.coupon_id) || 0) + 1);
            });
            
            if (period === 'all') {
                let { data: topC } = await supabase.from('coupons').select('id, title, discount, stores(name), click_count').order('click_count', { ascending: false }).limit(10);
                if (topC) {
                    const mergedTopC = topC.map(c => ({
                        id: c.id,
                        title: c.title,
                        subtitle: `${Array.isArray(c.stores) ? c.stores[0]?.name : (c.stores as any)?.name} · ${c.discount}`,
                        val1: (couponClickMap.get(c.id) || 0) + (c.click_count || 0)
                    })).sort((a, b) => b.val1 - a.val1).slice(0, 10);
                    setTopCoupons(mergedTopC);
                }
            } else {
                const clickedCouponIds = Array.from(couponClickMap.keys());
                if (clickedCouponIds.length > 0) {
                    let { data: activeC } = await supabase.from('coupons').select('id, title, discount, stores(name)').in('id', clickedCouponIds);
                    if (activeC) {
                        const mergedTopC = activeC.map(c => ({
                            id: c.id,
                            title: c.title,
                            subtitle: `${Array.isArray(c.stores) ? c.stores[0]?.name : (c.stores as any)?.name} · ${c.discount}`,
                            val1: couponClickMap.get(c.id) || 0
                        })).sort((a, b) => b.val1 - a.val1).slice(0, 10);
                        setTopCoupons(mergedTopC);
                    }
                } else {
                    setTopCoupons([]);
                }
            }

            // Aggregate store views
            const storeViewMap = new Map();
            views.filter(v => v.store_id).forEach(v => {
                storeViewMap.set(v.store_id, (storeViewMap.get(v.store_id) || 0) + 1);
            });
            
            const storeClickMap = new Map();
            clicks.filter(c => c.store_id).forEach(c => {
                storeClickMap.set(c.store_id, (storeClickMap.get(c.store_id) || 0) + 1);
            });

            if (period === 'all') {
                const { data: allStores } = await supabase.from('stores').select('id, name');
                if (allStores) {
                    const topS = allStores.map(s => ({
                        id: s.id,
                        title: s.name,
                        val1: storeViewMap.get(s.id) || 0,
                        val2: storeClickMap.get(s.id) || 0,
                    })).sort((a, b) => b.val1 - a.val1).slice(0, 10);
                    setTopStores(topS);
                }
            } else {
                const activeStoreIds = Array.from(new Set([...storeViewMap.keys(), ...storeClickMap.keys()]));
                if (activeStoreIds.length > 0) {
                    const { data: activeStores } = await supabase.from('stores').select('id, name').in('id', activeStoreIds);
                    if (activeStores) {
                        const topS = activeStores.map(s => ({
                            id: s.id,
                            title: s.name,
                            val1: storeViewMap.get(s.id) || 0,
                            val2: storeClickMap.get(s.id) || 0,
                        })).sort((a, b) => b.val1 - a.val1).slice(0, 10);
                        setTopStores(topS);
                    }
                } else {
                    setTopStores([]);
                }
            }
            
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        const checkUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.push('/admin/login');
            } else {
                setUser(session.user);
                fetchStats();
            }
        };
        checkUser();
    }, [router, period]);

    const handleClearCache = async () => {
        try {
            const res = await fetch('/api/revalidate?path=/');
            if (res.ok) {
                showToast("프론트엔드 캐시가 초기화되었습니다.");
            } else {
                showToast("캐시 초기화 실패");
            }
        } catch (e) {
            showToast("캐시 초기화 중 오류가 발생했습니다.");
        }
    };

    if (!user) return <div className="min-h-screen flex items-center justify-center">인증 확인 중...</div>;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <AdminSidebar />

            <main className="flex-1 p-6 md:p-10 overflow-y-auto h-screen">
                
                {/* Header & Filter */}
                <header className="mb-8 flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2 flex items-center gap-3">
                            <BarChart3 className="text-blue-600" size={32} />
                            사이트 종합 대시보드
                        </h2>
                        <p className="text-gray-500 font-medium">쿠폰톡 전체 통계를 한눈에 확인합니다. 조회수, 클릭수, 콘텐츠 현황을 실시간으로 모니터링하세요.</p>
                    </div>
                    
                    <PeriodFilter 
                        period={period} 
                        onChange={setPeriod} 
                        onClearCache={handleClearCache}
                    />
                </header>

                {/* 1. Main Stat Cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
                    <StatCard 
                        title="메인 페이지 방문" 
                        value={stats.mainViews} 
                        subtitle="홈 화면 접속 수" 
                        colorScheme="green" 
                        icon={<HomeIcon />} 
                    />
                    <StatCard 
                        title="전체 방문자 (세션)" 
                        value={stats.totalSessions} 
                        subtitle="전체 누적" 
                        colorScheme="orange" 
                        icon={<Users size={16} />} 
                    />
                    <StatCard 
                        title="총 조회수 (전체)" 
                        value={stats.totalViews} 
                        subtitle="페이지 뷰" 
                        colorScheme="blue" 
                        icon={<Eye size={16} />} 
                    />
                    <StatCard 
                        title="총 클릭수 (전체)" 
                        value={stats.totalClicks} 
                        subtitle="링크+버튼 클릭" 
                        colorScheme="yellow" 
                        icon={<MousePointerClick size={16} />} 
                    />
                    <StatCard 
                        title="코드 복사 (전체)" 
                        value={stats.codeCopies} 
                        subtitle="수동 복사 이벤트" 
                        colorScheme="red" 
                        icon={<Copy size={16} />} 
                    />
                    <StatCard 
                        title="전체 전환율" 
                        value={`${stats.conversionRate}%`} 
                        subtitle="클릭 ÷ 조회" 
                        colorScheme="green" 
                        icon={<Percent size={16} />} 
                    />
                </div>

                {/* 2. Section Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                    <SectionStatCard
                        title="스토어"
                        icon={Store}
                        color="#3b82f6"
                        href="/admin/stores"
                        stats={[
                            { label: '등록 수', value: sectionStats.stores.count },
                            { label: '조회수', value: sectionStats.stores.views },
                            { label: '클릭수', value: sectionStats.stores.clicks },
                            { label: '순수 전환율', value: `${sectionStats.stores.conversion}%` },
                        ]}
                    />
                    <SectionStatCard
                        title="쿠폰"
                        icon={Ticket}
                        color="#8b5cf6"
                        href="/admin/coupons"
                        stats={[
                            { label: '전체', value: sectionStats.coupons.total },
                            { label: '활성 중', value: sectionStats.coupons.active },
                            { label: '만료됨', value: sectionStats.coupons.expired },
                            { label: '총 클릭수', value: sectionStats.coupons.clicks },
                        ]}
                    />
                    <SectionStatCard
                        title="상품"
                        icon={Package}
                        color="#f59e0b"
                        href="/admin/products"
                        stats={[
                            { label: '등록 수', value: sectionStats.products.count },
                            { label: '총 조회수', value: sectionStats.products.views },
                            { label: '클릭수', value: sectionStats.products.clicks },
                        ]}
                    />
                    <SectionStatCard
                        title="카테고리별 조회"
                        icon={LayoutGrid}
                        color="#ec4899"
                        stats={[
                            { label: '여행', value: '준비중' },
                            { label: '패션', value: '준비중' },
                            { label: '전자제품', value: '준비중' },
                            { label: '건강', value: '준비중' },
                        ]}
                    />
                </div>

                {/* 3. Top Rankings */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                    <TopRankingTable 
                        title={<><Ticket className="text-rose-500" /> 쿠폰 클릭 TOP 10</>}
                        items={topCoupons}
                        col1Label="클릭"
                        viewAllHref="/admin/coupons"
                    />
                    <TopRankingTable 
                        title={<><Store className="text-blue-500" /> 스토어 조회수 TOP 10</>}
                        items={topStores}
                        col1Label="조회"
                        col2Label="클릭"
                        viewAllHref="/admin/stores"
                    />
                </div>
                
            </main>
        </div>
    );
}

function HomeIcon() {
    return <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>;
}
