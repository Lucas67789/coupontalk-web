"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Plus, Edit2, Trash2, Save, X, Search, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 20;

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCoupon, setCurrentCoupon] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    
    // Filters & Pagination State
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'live'>('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    const router = useRouter();

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

    // Load Stores once
    useEffect(() => {
        const fetchStores = async () => {
            const { data } = await supabase.from('stores').select('id, name');
            if (data) setStores(data);
        };
        fetchStores();
    }, []);

    // Fetch Coupons based on dependencies
    const fetchCoupons = async () => {
        setLoading(true);
        let query = supabase.from('coupons').select('*, stores(name)', { count: 'exact' });
        
        if (selectedStore !== 'all') {
            query = query.eq('store_id', selectedStore);
        }
        
        if (searchQuery) {
            query = query.ilike('title', `%${searchQuery}%`);
        }

        if (statusFilter !== 'all') {
            const now = new Date().toISOString();
            if (statusFilter === 'draft') query = query.eq('status', 'draft');
            if (statusFilter === 'scheduled') query = query.eq('status', 'published').gt('published_at', now);
            if (statusFilter === 'live') query = query.eq('status', 'published').lte('published_at', now);
        }

        query = query.order('created_at', { ascending: false });
        
        // Pagination
        const from = (page - 1) * ITEMS_PER_PAGE;
        const to = from + ITEMS_PER_PAGE - 1;
        query = query.range(from, to);

        const { data: couponsData, count } = await query;
        setCoupons(couponsData || []);
        if (count !== null) setTotalCount(count);
        setLoading(false);
    };

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) router.push('/admin/login');
            else fetchCoupons();
        };
        checkAuthAndFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router, page, searchQuery, selectedStore, statusFilter]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        setSearchQuery(searchInput);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Handle published_at default
        let pubDate = currentCoupon.published_at;
        if (currentCoupon.status === 'published' && !pubDate) {
            pubDate = new Date().toISOString();
        }

        const payload: any = {
            store_id: currentCoupon.store_id,
            title: currentCoupon.title,
            discount: currentCoupon.discount,
            code: currentCoupon.code,
            expiry: currentCoupon.expiry,
            status: currentCoupon.status || 'draft',
            published_at: pubDate || new Date().toISOString(),
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
        fetchCoupons();
    };

    const handleDelete = async (id: string) => {
        if (confirm("정말로 이 쿠폰을 삭제하시겠습니까?")) {
            await supabase.from('coupons').delete().eq('id', id);
            fetchCoupons();
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            if (!e.target.files || e.target.files.length === 0) return;
            setUploading(true);
            const file = e.target.files[0];
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);
            const imageUrl = data.publicUrl;
            const imageMarkdown = `\n![이미지](${imageUrl})\n`;

            setCurrentCoupon({ ...currentCoupon, content_body: (currentCoupon.content_body || '') + imageMarkdown });
            
        } catch (error) {
            alert('이미지 업로드 실패: ' + (error as any).message + '\n\nSupabase Storage에 "images" 버킷이 Public으로 생성되어 있는지 확인해주세요.');
        } finally {
            setUploading(false);
        }
    };

    // Format local time safely for input
    const getLocalISOString = (isoString?: string) => {
        if (!isoString) return '';
        const d = new Date(isoString);
        if (isNaN(d.getTime())) return '';
        const offset = d.getTimezoneOffset() * 60000;
        return new Date(d.getTime() - offset).toISOString().slice(0, 16);
    };

    const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <AdminSidebar />
            <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">
                <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">쿠폰 관리</h2>
                        <p className="text-gray-500">할인코드 및 임시저장/예약발행 일정을 관리합니다.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => { 
                                setIsEditing(true); 
                                setCurrentCoupon({ 
                                    is_verified: true, code: 'NO_CODE_REQUIRED', condition: '', affiliateUrl: '', status: 'draft' 
                                }); 
                            }}
                            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> 새 쿠폰 추가
                        </button>
                    )}
                </header>

                {!isEditing && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="쿠폰 제목으로 검색..." 
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                className="flex-1 p-2 border rounded-xl bg-gray-50"
                            />
                            <button type="submit" className="px-4 bg-slate-800 text-white rounded-xl flex items-center gap-2 hover:bg-slate-700 font-bold text-sm">
                                <Search size={16} /> 검색
                            </button>
                        </form>
                        
                        {/* Filters */}
                        <div className="flex flex-col lg:flex-row gap-4 justify-between border-t pt-4">
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-bold text-gray-500 w-16">스토어:</span>
                                <select 
                                    value={selectedStore} 
                                    onChange={(e) => { setSelectedStore(e.target.value); setPage(1); }}
                                    className="p-2 border rounded-lg text-sm bg-gray-50 min-w-[150px]"
                                >
                                    <option value="all">전체 스토어</option>
                                    {stores.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <span className="text-sm font-bold text-gray-500 w-16">상태:</span>
                                <button onClick={() => { setStatusFilter('all'); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${statusFilter === 'all' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>전체</button>
                                <button onClick={() => { setStatusFilter('draft'); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${statusFilter === 'draft' ? 'bg-gray-200 text-gray-800 border-gray-300' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>임시저장</button>
                                <button onClick={() => { setStatusFilter('scheduled'); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${statusFilter === 'scheduled' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>예약발행</button>
                                <button onClick={() => { setStatusFilter('live'); setPage(1); }} className={`px-3 py-1.5 rounded-lg text-sm font-bold border transition ${statusFilter === 'live' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>발행중 (Live)</button>
                            </div>
                        </div>
                    </div>
                )}

                {isEditing ? (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8 max-w-4xl">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold">{currentCoupon.id ? '쿠폰 수정' : '새 쿠폰 추가 (초안)'}</h3>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="flex flex-col gap-5">
                            {/* 상태 및 발행 설정 */}
                            <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5 mb-2">
                                <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">🛠️ 상태 및 발행 일정</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">상태 (노출 여부)</label>
                                        <select required value={currentCoupon?.status || 'draft'} onChange={e => setCurrentCoupon({ ...currentCoupon, status: e.target.value })} className="w-full p-3 border rounded-xl bg-white shadow-sm font-bold">
                                            <option value="draft">임시저장 (비공개)</option>
                                            <option value="published">공개 (예약 및 상시발행)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">발행 시점 <span className="text-blue-600">(예약발행 시 미래 지정)</span></label>
                                        <input 
                                            type="datetime-local" 
                                            value={getLocalISOString(currentCoupon?.published_at)} 
                                            onChange={e => setCurrentCoupon({ ...currentCoupon, published_at: e.target.value ? new Date(e.target.value).toISOString() : '' })} 
                                            className="w-full p-3 border rounded-xl bg-white shadow-sm" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">한국 시간(KST) 기준. 비워두면 즉시 노출됩니다.</p>
                                    </div>
                                </div>
                            </div>

                            {/* 기본 정보 */}
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
                                    <label className="block text-sm font-medium text-gray-700 mb-1">할인 내용 <span className="text-blue-600">(목록 강조 배지)</span></label>
                                    <input required type="text" placeholder="예: 50% 할인, 7% 할인, $6 할인" value={currentCoupon?.discount || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, discount: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">쿠폰 제목 <span className="text-blue-600">(카드 표시 제목)</span></label>
                                <input required type="text" placeholder="예: 전 세계 숙소 7% 추가 할인" value={currentCoupon?.title || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, title: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">프로모션 코드</label>
                                    <input required type="text" value={currentCoupon?.code || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, code: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 font-mono" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">적용 조건</label>
                                    <input required type="text" placeholder="예: 앱으로 첫 예약 시, 신규 회원 전용" value={currentCoupon?.condition || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, condition: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">유효기간</label>
                                    <input required type="text" placeholder="예: 2026년 12월 31일 마감" value={currentCoupon?.expiry || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, expiry: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" id="is_verified" checked={currentCoupon?.is_verified ?? true} onChange={e => setCurrentCoupon({ ...currentCoupon, is_verified: e.target.checked })} className="w-5 h-5 text-blue-600 rounded" />
                                    <label htmlFor="is_verified" className="text-sm font-medium text-gray-700">관리자 검증 완료 표시</label>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">어필리에이트 제휴 링크 URL</label>
                                <input required type="url" value={currentCoupon?.affiliateUrl || currentCoupon?.affiliate_url || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, affiliateUrl: e.target.value, affiliate_url: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                            </div>

                            {/* SEO 전용 필드 */}
                            <div className="border-t border-gray-200 pt-6 mt-4">
                                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 mb-5">
                                    <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">🚀 네이버/구글 SEO 상위 노출 가이드</h4>
                                    <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
                                        <li>SEO 제목에는 키워드(할인코드, 프로모션, 쿠폰)를 자연스럽게 포함하세요. (예: 2026년 4월 레노버 공식 할인코드 모음)</li>
                                        <li>상세 콘텐츠(본문)는 <strong>단순한 링크 모음이 아닌 500자 이상의 유용한 정보글 형태</strong>로 작성해야 C-Rank 점수가 높아집니다.</li>
                                        <li>마크다운의 헤딩(##, ###)을 활용하여 문단을 나누고, 사용 팁과 주의사항을 상세히 적어주세요.</li>
                                    </ul>
                                </div>
                                <p className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">🔍 SEO 상세 설정</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📌 SEO 제목 <span className="text-blue-600">(title 태그 + H1 + 검색결과 제목)</span></label>
                                <input type="text" placeholder="예: 아고다 할인코드 3월 | 전 세계 숙소 7% 할인쿠폰" value={currentCoupon?.seo_title || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, seo_title: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                <p className="text-xs text-gray-400 mt-1">비워두면 자동생성: &quot;[스토어명] [쿠폰제목] | [할인율] 할인 [N]월 | 쿠폰톡&quot;</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">📌 SEO 설명 <span className="text-blue-600">(meta description - 검색결과 설명문)</span></label>
                                <textarea placeholder="예: 2026년 아고다 할인코드를 정리했습니다. 전 세계 숙소 7% 할인을 받으세요. 검증된 최신 할인쿠폰을 지금 바로 사용하세요." value={currentCoupon?.seo_description || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, seo_description: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 text-sm leading-relaxed" rows={2} />
                                <p className="text-xs text-gray-400 mt-1">150자 내외 권장. 비워두면 자동생성됩니다.</p>
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-medium text-gray-700">📌 상세 콘텐츠 <span className="text-blue-600">(H2/H3 본문 - 네이버가 가장 중시하는 정보성 텍스트)</span> <span className="text-xs text-blue-600 font-bold ml-2">마크다운 지원</span></label>
                                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                                        {uploading ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                                        {uploading ? '업로드 중...' : '📸 이미지 첨부'}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                    </label>
                                </div>
                                <textarea placeholder={`## 이 쿠폰 사용 방법\n1. 할인 링크를 클릭합니다\n2. 원하는 숙소를 검색합니다\n3. 결제 시 프로모션 코드를 입력합니다\n\n(참고: 가이드와 추천 이유는 최대한 길고 자세하게 적을수록 검색 노출에 유리합니다.)`} value={currentCoupon?.content_body || ''} onChange={e => setCurrentCoupon({ ...currentCoupon, content_body: e.target.value })} className="w-full p-3 border rounded-xl bg-white focus:bg-gray-50 font-mono text-sm leading-relaxed" rows={12} />
                            </div>

                            <div className="flex justify-end gap-3 mt-4 pt-4 border-t">
                                <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200">취소</button>
                                <button type="submit" className="btn-primary px-8 flex items-center gap-2"><Save size={18} /> 저장하기</button>
                            </div>
                        </form>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                        {loading ? (
                            <div className="p-12 text-center text-gray-500">데이터를 불러오는 중...</div>
                        ) : coupons.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">조건에 맞는 쿠폰이 없습니다.</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium text-sm">
                                            <tr>
                                                <th className="p-4 w-28">상태</th>
                                                <th className="p-4">단축스토어</th>
                                                <th className="p-4">쿠폰 제목</th>
                                                <th className="p-4 hidden md:table-cell">할인/조건</th>
                                                <th className="p-4 text-right">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {coupons.map(coupon => {
                                                const p = parseCondition(coupon);
                                                const now = new Date();
                                                const isPublished = coupon.status === 'published';
                                                const pubDate = coupon.published_at ? new Date(coupon.published_at) : null;
                                                const isScheduled = isPublished && pubDate && pubDate > now;

                                                return (
                                                    <tr key={coupon.id} className="hover:bg-gray-50/50">
                                                        <td className="p-4">
                                                            {coupon.status === 'draft' ? (
                                                                <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 text-gray-700">임시저장</span>
                                                            ) : isScheduled ? (
                                                                <div className="flex flex-col gap-1 items-start">
                                                                    <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-100 text-yellow-800">예약발행</span>
                                                                    <span className="text-[10px] text-gray-500">{pubDate.toLocaleDateString()}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="px-2 py-1 rounded text-xs font-bold bg-green-100 text-green-700">발행중(Live)</span>
                                                            )}
                                                        </td>
                                                        <td className="p-4 font-bold text-gray-700 text-sm whitespace-nowrap">{coupon.stores?.name || '알수없음'}</td>
                                                        <td className="p-4">
                                                            <p className="font-bold text-gray-900 line-clamp-1">{coupon.title}</p>
                                                            <p className="text-xs text-mono text-gray-500 mt-0.5">{coupon.code}</p>
                                                        </td>
                                                        <td className="p-4 hidden md:table-cell">
                                                            <p className="text-blue-600 font-bold text-sm line-clamp-1">{coupon.discount}</p>
                                                            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{p.cond}</p>
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => { 
                                                                    setCurrentCoupon({ ...coupon, condition: p.cond, affiliateUrl: p.url, is_verified: p.verified, seo_title: coupon.seo_title || '', seo_description: coupon.seo_description || '', content_body: coupon.content_body || '' }); 
                                                                    setIsEditing(true); 
                                                                }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                                                                <button onClick={() => handleDelete(coupon.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                
                                {/* Pagination Controls */}
                                {totalPages > 1 && (
                                    <div className="flex justify-center items-center gap-4 p-4 border-t border-gray-100 bg-gray-50 rounded-b-3xl">
                                        <button 
                                            disabled={page === 1} 
                                            onClick={() => setPage(page - 1)} 
                                            className="px-4 py-2 rounded-xl bg-white border shadow-sm text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                        >
                                            이전
                                        </button>
                                        <span className="text-sm font-bold text-gray-700">
                                            {page} / {totalPages}
                                        </span>
                                        <button 
                                            disabled={page === totalPages} 
                                            onClick={() => setPage(page + 1)} 
                                            className="px-4 py-2 rounded-xl bg-white border shadow-sm text-sm font-medium text-gray-700 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                                        >
                                            다음
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
