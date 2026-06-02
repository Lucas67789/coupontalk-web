"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Plus, Edit2, Trash2, Save, X, Search, Image as ImageIcon, Loader2, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';

const ITEMS_PER_PAGE = 20;

export default function AdminProducts() {
    const [products, setProducts] = useState<any[]>([]);
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentProduct, setCurrentProduct] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
    
    // Filters & Pagination State
    const [selectedStore, setSelectedStore] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'scheduled' | 'live'>('all');
    const [searchInput, setSearchInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    
    const router = useRouter();

    // Load Stores once
    useEffect(() => {
        const fetchStores = async () => {
            const { data } = await supabase.from('stores').select('id, name');
            if (data) setStores(data);
        };
        fetchStores();
    }, []);

    // Fetch Products based on dependencies
    const fetchProducts = async () => {
        setLoading(true);
        // Supabase query to public.products, which doesn't exist yet but user will create
        let query = supabase.from('products').select('*, stores(name)', { count: 'exact' });
        
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

        const { data: productsData, count, error } = await query;
        if (error) {
            console.error(error);
            setProducts([]);
        } else {
            setProducts(productsData || []);
        }
        
        if (count !== null) setTotalCount(count);
        setLoading(false);
    };

    useEffect(() => {
        const checkAuthAndFetch = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) router.push('/admin/login');
            else fetchProducts();
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
        let pubDate = currentProduct.published_at;
        if (currentProduct.status === 'published' && !pubDate) {
            pubDate = new Date().toISOString();
        }

        const payload: any = {
            store_id: currentProduct.store_id,
            title: currentProduct.title,
            image_url: currentProduct.image_url || null,
            price: currentProduct.price,
            original_price: currentProduct.original_price || null,
            discount_badge: currentProduct.discount_badge || null,
            affiliate_url: currentProduct.affiliate_url,
            status: currentProduct.status || 'draft',
            published_at: pubDate || new Date().toISOString(),
        };

        if (currentProduct.id) {
            await supabase.from('products').update(payload).eq('id', currentProduct.id);
        } else {
            // Insert - generate unique ID (Unix timestamp + random string)
            const uniqueId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            await supabase.from('products').insert([{ ...payload, id: uniqueId }]);
        }

        setIsEditing(false);
        setCurrentProduct(null);
        fetchProducts();
    };

    const handleDelete = async (id: string) => {
        if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
            await supabase.from('products').delete().eq('id', id);
            fetchProducts();
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

            setCurrentProduct({ ...currentProduct, image_url: imageUrl });
            
        } catch (error) {
            alert('이미지 업로드 실패: ' + (error as any).message);
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
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">상품 관리</h2>
                        <p className="text-gray-500">어필리에이트 제휴 상품을 등록하고 관리합니다.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => { 
                                setIsEditing(true); 
                                setCurrentProduct({ 
                                    status: 'draft', affiliate_url: '' 
                                }); 
                            }}
                            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> 새 상품 추가
                        </button>
                    )}
                </header>

                {!isEditing && (
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col gap-4">
                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="상품명으로 검색..." 
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
                            <h3 className="text-xl font-bold">{currentProduct.id ? '상품 수정' : '새 상품 추가 (초안)'}</h3>
                            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="flex flex-col gap-5">
                            {/* 상태 및 발행 설정 */}
                            <div className="bg-yellow-50/50 border border-yellow-100 rounded-xl p-5 mb-2">
                                <h4 className="font-bold text-yellow-800 mb-4 flex items-center gap-2">🛠️ 상태 및 발행 일정</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">상태 (노출 여부)</label>
                                        <select required value={currentProduct?.status || 'draft'} onChange={e => setCurrentProduct({ ...currentProduct, status: e.target.value })} className="w-full p-3 border rounded-xl bg-white shadow-sm font-bold">
                                            <option value="draft">임시저장 (비공개)</option>
                                            <option value="published">공개 (예약 및 상시발행)</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">발행 시점 <span className="text-blue-600">(예약발행 시 미래 지정)</span></label>
                                        <input 
                                            type="datetime-local" 
                                            value={getLocalISOString(currentProduct?.published_at)} 
                                            onChange={e => setCurrentProduct({ ...currentProduct, published_at: e.target.value ? new Date(e.target.value).toISOString() : '' })} 
                                            className="w-full p-3 border rounded-xl bg-white shadow-sm" 
                                        />
                                        <p className="text-xs text-gray-500 mt-1">한국 시간(KST) 기준. 비워두면 즉시 노출됩니다.</p>
                                    </div>
                                </div>
                            </div>

                            {/* 기본 정보 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">적용 스토어 (판매처)</label>
                                    <select required value={currentProduct?.store_id || ''} onChange={e => setCurrentProduct({ ...currentProduct, store_id: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50">
                                        <option value="" disabled>스토어를 선택하세요</option>
                                        {stores.map(store => (
                                            <option key={store.id} value={store.id}>{store.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                                    <input required type="text" placeholder="예: 레노버 씽크패드 X1" value={currentProduct?.title || ''} onChange={e => setCurrentProduct({ ...currentProduct, title: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">현재 판매가</label>
                                    <input required type="text" placeholder="예: 1,990,000원" value={currentProduct?.price || ''} onChange={e => setCurrentProduct({ ...currentProduct, price: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 font-bold" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">기존 정가 <span className="text-gray-400">(선택)</span></label>
                                    <input type="text" placeholder="예: 2,500,000원" value={currentProduct?.original_price || ''} onChange={e => setCurrentProduct({ ...currentProduct, original_price: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">강조 라벨 배지 <span className="text-gray-400">(선택)</span></label>
                                    <input type="text" placeholder="예: 50% 할인, 특가" value={currentProduct?.discount_badge || ''} onChange={e => setCurrentProduct({ ...currentProduct, discount_badge: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">썸네일 이미지 <span className="text-gray-400">(URL 직접 입력 또는 업로드)</span></label>
                                    <div className="flex gap-2">
                                        <input type="url" placeholder="업로드하면 URL이 생성됩니다" value={currentProduct?.image_url || ''} onChange={e => setCurrentProduct({ ...currentProduct, image_url: e.target.value })} className="flex-1 p-3 border rounded-xl bg-gray-50 text-sm" />
                                        <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-sm font-medium transition-colors">
                                            {uploading ? <Loader2 size={16} className="animate-spin" /> : <ImageIcon size={16} />}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">어필리에이트 제휴 링크 URL</label>
                                <input required type="url" value={currentProduct?.affiliate_url || ''} onChange={e => setCurrentProduct({ ...currentProduct, affiliate_url: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
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
                        ) : products.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">등록된 상품이 없습니다. (Supabase에서 products 테이블을 먼저 생성해주세요.)</div>
                        ) : (
                            <>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium text-sm">
                                            <tr>
                                                <th className="p-4 w-28">상태</th>
                                                <th className="p-4 w-20">썸네일</th>
                                                <th className="p-4">상품명</th>
                                                <th className="p-4 hidden md:table-cell">가격 정보</th>
                                                <th className="p-4 text-right">관리</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {products.map(prod => {
                                                const now = new Date();
                                                const isPublished = prod.status === 'published';
                                                const pubDate = prod.published_at ? new Date(prod.published_at) : null;
                                                const isScheduled = isPublished && pubDate && pubDate > now;

                                                return (
                                                    <tr key={prod.id} className="hover:bg-gray-50/50">
                                                        <td className="p-4">
                                                            {prod.status === 'draft' ? (
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
                                                        <td className="p-4">
                                                            {prod.image_url ? (
                                                                // eslint-disable-next-line @next/next/no-img-element
                                                                <img src={prod.image_url} alt="thumb" className="w-12 h-12 object-cover rounded-lg border border-gray-100" />
                                                            ) : (
                                                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xs text-gray-400">없음</div>
                                                            )}
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="text-xs text-blue-600 font-bold mb-1">{prod.stores?.name}</div>
                                                            <p className="font-bold text-gray-900 line-clamp-1">{prod.title}</p>
                                                        </td>
                                                        <td className="p-4 hidden md:table-cell">
                                                            <p className="text-gray-900 font-bold text-sm">{prod.price}</p>
                                                            {prod.original_price && <p className="text-xs text-gray-400 line-through">{prod.original_price}</p>}
                                                            {prod.discount_badge && <p className="text-[10px] font-bold text-red-500 mt-1">{prod.discount_badge}</p>}
                                                        </td>
                                                        <td className="p-4 text-right">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button onClick={() => { 
                                                                    setCurrentProduct({ ...prod, id: '', title: `${prod.title} (복사본)`, published_at: '' }); 
                                                                    setIsEditing(true); 
                                                                }} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="복사"><Copy size={16} /></button>
                                                                <button onClick={() => { 
                                                                    setCurrentProduct(prod); 
                                                                    setIsEditing(true); 
                                                                }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="수정"><Edit2 size={16} /></button>
                                                                <button onClick={() => handleDelete(prod.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="삭제"><Trash2 size={16} /></button>
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
