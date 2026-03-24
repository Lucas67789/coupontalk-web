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

    // Helper to parse condition JSON
    const parseCondition = (coupon: any) => {
        let cond = coupon.condition;
        let url = coupon.affiliate_url || coupon.affiliateUrl || '';
        let verified = coupon.is_verified ?? true;
        try {
            if (cond && cond.startsWith('{')) {
                const p = JSON.parse(cond);
                if (p.text !== undefined) {
                    cond = p.text;
                    url = p.url;
                    verified = p.v;
                }
            }
        } catch (e) { }
        return { cond, url, verified };
    };

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

        const payload: any = {
            store_id: currentCoupon.store_id,
            title: currentCoupon.title,
            discount: currentCoupon.discount,
            code: currentCoupon.code,
            expiry: currentCoupon.expiry,
            seo_title: currentCoupon.seo_title || null,
            seo_description: currentCoupon.seo_description || null,
            content_body: currentCoupon.content_body || null,
            condition: JSON.stringify({
                text: currentCoupon.condition,
                url: currentCoupon.affiliateUrl,
                v: currentCoupon.is_verified ?? true
            })
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
                            onClick={() => { setIsEditing(true); setCurrentCoupon({ is_verified: true, code: 'NO_CODE_REQUIRED', condition: '', affiliateUrl: '' }); }}
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
                            {/* SEO 가이드 안내 */}
                            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
                                <p className="font-bold mb-1">📌 네이버 SEO 가이드</p>
                                <p>각 필드의 <span className="font-semibold">(괄호)</span> 안 설명은 네이버 검색엔진이 해당 값을 어떻게 활용하는지 나타냅니다. 키워드를 자연스럽게 포함해주세요.</p>
                            </div>

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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">할인 내용 <span className="text-blue-600">(배지 - 목록에서 강조 표시)</span></label>
                                    <input required type="text" placeholder="예: 50% 할인, 7% 할인, $6 할인" value={currentCoupon?.discount || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, discount: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 제목 <span className="text-blue-600">(H3 - 카드에 표시되는 짧은 제목)</span></label>
                                <input required type="text" placeholder="예: 전 세계 숙소 7% 추가 할인" value={currentCoupon?.title || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, title: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">프로모션 코드 (없으면 NO_CODE_REQUIRED)</label>
                                    <input required type="text" value={currentCoupon?.code || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, code: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 font-mono" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">적용 조건 <span className="text-blue-600">(본문 표시 - 할인 받을 수 있는 조건)</span></label>
                                    <input required type="text" placeholder="예: 앱으로 첫 예약 시, 신규 회원 전용" value={currentCoupon?.condition || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, condition: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">유효기간 <span className="text-blue-600">(기간 표시)</span></label>
                                    <input required type="text" placeholder="예: 2026년 12월 31일 마감" value={currentCoupon?.expiry || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, expiry: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
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

                            {/* SEO 전용 필드 */}
                            <div className="border-t border-gray-200 pt-4 mt-2">
                                <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                    🔍 SEO 전용 (네이버 검색 최적화)
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📌 SEO 제목 <span className="text-blue-600">(title 태그 + H1 + 검색결과 제목)</span></label>
                                <input type="text" placeholder="예: 아고다 할인코드 3월 | 전 세계 숙소 7% 할인쿠폰" value={currentCoupon?.seo_title || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, seo_title: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                <p className="text-xs text-gray-400 mt-1">비워두면 자동생성: &quot;스토어명 쿠폰제목 | 할인율 할인 N월 | 쿠폰톡&quot;</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📌 SEO 설명 <span className="text-blue-600">(meta description - 검색결과 설명문)</span></label>
                                <textarea placeholder="예: 2026년 아고다 할인코드를 정리했습니다. 전 세계 숙소 7% 할인을 받으세요. 검증된 최신 할인쿠폰을 지금 바로 사용하세요." value={currentCoupon?.seo_description || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, seo_description: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" rows={2} />
                                <p className="text-xs text-gray-400 mt-1">150자 내외 권장. 비워두면 자동생성됩니다.</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📌 상세 콘텐츠 <span className="text-blue-600">(H2/H3 본문 - 네이버가 가장 중시하는 정보성 텍스트)</span></label>
                                <textarea placeholder={`마크다운 형식으로 작성하세요.

## 이 쿠폰 사용 방법
1. 할인 링크를 클릭합니다
2. 원하는 숙소를 검색합니다
3. 결제 시 프로모션 코드를 입력합니다

## 주의사항
- 다른 할인과 중복 적용 불가
- 특정 숙소에만 적용될 수 있음

### 코드가 작동하지 않을 때
- 전용 링크를 통해 접속했는지 확인
- 유효기간이 만료되지 않았는지 점검`}
                                    value={currentCoupon?.content_body || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, content_body: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 font-mono text-sm" rows={10} />
                                <p className="text-xs text-gray-400 mt-1">## = H2 제목, ### = H3 제목, - = 목록, 1. = 번호 목록. 비워두면 상세페이지에 본문이 표시되지 않습니다.</p>
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
                                        {filteredCoupons.map(coupon => {
                                            const p = parseCondition(coupon);
                                            return (
                                                <tr key={coupon.id} className="hover:bg-gray-50/50">
                                                    <td className="p-4 font-bold text-gray-700">{coupon.stores?.name || '알수없음'}</td>
                                                    <td className="p-4">
                                                        <p className="font-bold text-gray-900 line-clamp-1">{coupon.title}</p>
                                                        <p className="text-xs text-mono text-gray-500">{coupon.code}</p>
                                                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.cond}</p>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell text-blue-600 font-bold">{coupon.discount}</td>
                                                    <td className="p-4 text-center">
                                                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full font-mono text-sm font-bold">
                                                            {coupon.click_count || 0}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 hidden md:table-cell">
                                                        <span className={`px-2 py-1 rounded text-xs font-bold ${p.verified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                            {p.verified ? '활성' : '비활성'}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <button onClick={() => { setCurrentCoupon({ ...coupon, condition: p.cond, affiliateUrl: p.url, is_verified: p.verified, seo_title: coupon.seo_title || '', seo_description: coupon.seo_description || '', content_body: coupon.content_body || '' }); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                                            <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
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
