"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<any>(null);
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const router = useRouter();

    const filteredCoupons = selectedStore === 'all'
        ? coupons
        : coupons.filter(c => c.store_id === selectedStore);

    const fetchCouponsAndStores = async () => {
        setLoading(true);
        const { data: couponsData } = await supabase.from('coupons').select('*, stores(name)').order('created_at', { ascending: false });
        const { data: storesData } = await supabase.from('stores').select('id, name');

        setCoupons(couponsData || []);
        setStores(storesData || []);
        setLoading(false);
    };

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) router.push('/admin/login');
            else fetchCouponsAndStores();
        };
        checkAuth();
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            store_id: currentCoupon.store_id,
            title: currentCoupon.title,
            discount: currentCoupon.discount,
            code: currentCoupon.code,
            condition: currentCoupon.condition,
            expiry: currentCoupon.expiry,
            affiliate_url: currentCoupon.affiliateUrl || currentCoupon.affiliate_url,
            is_verified: currentCoupon.is_verified ?? true
        };

        if (currentCoupon.id) {
            await supabase.from('coupons').update(payload).eq('id', currentCoupon.id);
        } else {
            // Insert - generate unique ID (Unix timestamp + random string)
            const uniqueId = `coupon-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            await supabase.from('coupons').insert([{ ...payload, id: uniqueId }]);
        }

        setIsEditing(false);
        setCurrentCoupon(null);
        fetchCouponsAndStores();
    };

    const handleDelete = async (id: string) => {
        if (confirm("정말로 이 쿠폰을 삭제하시겠습니까?")) {
            await supabase.from('coupons').delete().eq('id', id);
            fetchCouponsAndStores();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <AdminSidebar />
            <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">쿠폰 관리</h2>
                        <p className="text-gray-500">할인코드 및 프로모션을 추가하거나 수정합니다.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => { setIsEditing(true); setCurrentCoupon({ is_verified: true, code: 'NO_CODE_REQUIRED' }); }}
                            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> 새 쿠폰 추가
                        </button>
                    )}
                </header>

                {!isEditing && !loading && coupons.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        <button
                            onClick={() => setSelectedStore('all')}
                            className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${selectedStore === 'all' ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            전체
                        </button>
                        {stores.map(store => (
                            <button
                                key={store.id}
                                onClick={() => setSelectedStore(store.id)}
                                className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${selectedStore === store.id ? 'bg-slate-800 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                            >
                                {store.name}
                            </button>
                        ))}
                    </div>
                )}

                {isEditing ? (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold">{currentCoupon.id ? '쿠폰 수정' : '새 쿠폰 추가'}</h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">적용 스토어</label>
                                    <select required value={currentCoupon?.store_id || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, store_id: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50">
                                        <option value="" disabled>스토어를 선택하세요</option>
                                        {stores.map(store => (
                                            <option key={store.id} value={store.id}>{store.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">할인 내용 (예: 50% 할인)</label>
                                    <input required type="text" value={currentCoupon?.discount || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, discount: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 제목/설명</label>
                                <input required type="text" value={currentCoupon?.title || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, title: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">프로모션 코드 (없으면 NO_CODE_REQUIRED)</label>
                                    <input required type="text" value={currentCoupon?.code || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, code: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 font-mono" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">조건 (예: 신규 회원 전용)</label>
                                    <input required type="text" value={currentCoupon?.condition || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, condition: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">유효기간 (예: 2024년 12월 31일 마감)</label>
                                    <input required type="text" value={currentCoupon?.expiry || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, expiry: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="is_verified" checked={currentCoupon?.is_verified ?? true} onChange={e => setCurrentCoupon({ ...currentCoupon, is_verified: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                                    <label htmlFor="is_verified" className="text-sm font-medium text-gray-700">관리자 검증 완료 (체크 시 화면에 표시됨)</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">어필리에이트 제휴 링크 URL (이 쿠폰 클릭시 이동할 주소)</label>
                                <input required type="url" value={currentCoupon?.affiliateUrl || currentCoupon?.affiliate_url || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, affiliateUrl: e.target.value, affiliate_url: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                            </div>

                            <div className="flex justify-end gap-3 mt-4">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">취소</button>
                                <button type="submit" className="btn-primary px-8 flex items-center gap-2"><Save size={18} /> 저장하기</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">데이터를 불러오는 중...</div>
                        ) : coupons.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">등록된 쿠폰이 없습니다.</div>
                        ) : filteredCoupons.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">이 스토어에 등록된 쿠폰이 없습니다.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium text-sm">
                                        <tr>
                                            <th className="p-4">단축스토어</th>
                                            <th className="p-4">쿠폰 제목</th>
                                            <th className="p-4 hidden md:table-cell">할인</th>
                                            <th className="p-4 text-center">클릭 수</th>
                                            <th className="p-4 hidden md:table-cell">상태</th>
                                            <th className="p-4 text-right">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {filteredCoupons.map(coupon => (
                                            <tr key={coupon.id} className="hover:bg-gray-50/50">
                                                <td className="p-4 font-bold text-gray-700">{coupon.stores?.name || '알수없음'}</td>
                                                <td className="p-4">
                                                    <p className="font-bold text-gray-900 line-clamp-1">{coupon.title}</p>
                                                    <p className="text-xs text-mono text-gray-500">{coupon.code}</p>
                                                </td>
                                                <td className="p-4 hidden md:table-cell text-blue-600 font-bold">{coupon.discount}</td>
                                                <td className="p-4 text-center">
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-mono text-sm font-bold">
                                                        {coupon.click_count || 0}
                                                    </span>
                                                </td>
                                                <td className="p-4 hidden md:table-cell">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold ${coupon.is_verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {coupon.is_verified ? '활성' : '비활성'}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => { setCurrentCoupon({ ...coupon }); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                                        <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
