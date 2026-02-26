"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import AdminSidebar from '@/components/admin/AdminSidebar';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function AdminStores() {
    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [currentStore, setCurrentStore] = useState<any>(null);
    const router = useRouter();

    const fetchStores = async () => {
        setLoading(true);
        const { data } = await supabase.from('stores').select('*').order('created_at', { ascending: false });
        setStores(data || []);
        setLoading(false);
    };

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) router.push('/admin/login');
            else fetchStores();
        };
        checkAuth();
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure tags exists as array
        const tagsArray = typeof currentStore.tags === 'string'
            ? currentStore.tags.split(',').map((t: string) => t.trim())
            : currentStore.tags;

        const payload = {
            name: currentStore.name,
            description: currentStore.description,
            logo: currentStore.logo,
            website_url: currentStore.website_url || null,
            rating: parseFloat(currentStore.rating) || 0,
            tags: tagsArray || [],
            events: currentStore.events || [],
            faqs: currentStore.faqs || []
        };

        if (currentStore.id) {
            // Update
            await supabase.from('stores').update(payload).eq('id', currentStore.id);
        } else {
            // Insert
            await supabase.from('stores').insert([payload]);
        }

        setIsEditing(false);
        setCurrentStore(null);
        fetchStores();
    };

    const handleDelete = async (id: string) => {
        if (confirm("정말로 이 스토어를 삭제하시겠습니까? 관련 쿠폰도 영향을 받을 수 있습니다.")) {
            await supabase.from('stores').delete().eq('id', id);
            fetchStores();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
            <AdminSidebar />
            <main className="flex-1 p-8 md:p-12 overflow-y-auto max-h-screen">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">스토어 관리</h2>
                        <p className="text-gray-500">제휴 쇼핑몰을 추가하거나 수정합니다.</p>
                    </div>
                    {!isEditing && (
                        <button
                            onClick={() => { setIsEditing(true); setCurrentStore({ tags: '' }); }}
                            className="btn-primary py-2 px-4 text-sm flex items-center gap-2"
                        >
                            <Plus size={16} /> 새 스토어 추가
                        </button>
                    )}
                </header>

                {isEditing ? (
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
                        <div className="flex justify-between items-center mb-6 border-b pb-4">
                            <h3 className="text-xl font-bold">{currentStore.id ? '스토어 수정' : '새 스토어 추가'}</h3>
                            <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSave} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">스토어 이름</label>
                                    <input required type="text" value={currentStore?.name || ''} onChange={e => setCurrentStore({ ...currentStore, name: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">별점 (0.0 과 5.0 사이)</label>
                                    <input required type="number" step="0.1" value={currentStore?.rating || ''} onChange={e => setCurrentStore({ ...currentStore, rating: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                                <textarea required value={currentStore?.description || ''} onChange={e => setCurrentStore({ ...currentStore, description: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" rows={3}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">웹사이트 URL (제휴 링크 등)</label>
                                <input type="text" value={currentStore?.website_url || ''} onChange={e => setCurrentStore({ ...currentStore, website_url: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">로고 URL (이미지 주소)</label>
                                <input required type="text" value={currentStore?.logo || ''} onChange={e => setCurrentStore({ ...currentStore, logo: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리 태그 (쉼표로 구분. 예: travel, fashion, tech)</label>
                                <input required type="text" value={Array.isArray(currentStore?.tags) ? currentStore.tags.join(', ') : currentStore?.tags || ''} onChange={e => setCurrentStore({ ...currentStore, tags: e.target.value })} className="w-full p-3 border rounded-xl bg-gray-50 bg-gray-50" />
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
                        ) : stores.length === 0 ? (
                            <div className="p-8 text-center text-gray-500">등록된 스토어가 없습니다.</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b border-gray-100 text-gray-600 font-medium text-sm">
                                        <tr>
                                            <th className="p-4">로고</th>
                                            <th className="p-4">이름</th>
                                            <th className="p-4 hidden md:table-cell">별점</th>
                                            <th className="p-4 hidden md:table-cell">태그</th>
                                            <th className="p-4 text-right">관리</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {stores.map(store => (
                                            <tr key={store.id} className="hover:bg-gray-50/50">
                                                <td className="p-4">
                                                    <div className="w-10 h-10 rounded border bg-white flex items-center justify-center p-1">
                                                        <img src={store.logo} alt={store.name} className="max-w-full max-h-full object-contain" />
                                                    </div>
                                                </td>
                                                <td className="p-4 font-bold text-gray-900">{store.name}</td>
                                                <td className="p-4 hidden md:table-cell text-gray-600">{store.rating}</td>
                                                <td className="p-4 hidden md:table-cell text-sm text-gray-500">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {store.tags?.map((t: string) => <span key={t} className="px-2 py-0.5 bg-gray-100 rounded text-xs">{t}</span>)}
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => { setCurrentStore({ ...store }); setIsEditing(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"><Edit2 size={16} /></button>
                                                        <button onClick={() => handleDelete(store.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
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
