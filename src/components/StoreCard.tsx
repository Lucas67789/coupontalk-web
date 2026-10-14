import Link from 'next/link';
import type { StoreSummary } from '@/lib/models';
import { ChevronRight } from 'lucide-react';

const getGradientClass = (name: string) => {
    const gradients = [
        'from-blue-400 to-indigo-500',
        'from-emerald-400 to-teal-500',
        'from-orange-400 to-rose-500',
        'from-purple-400 to-pink-500',
        'from-cyan-400 to-blue-500',
        'from-rose-400 to-orange-500',
        'from-indigo-400 to-purple-500',
        'from-teal-400 to-emerald-500',
        'from-pink-400 to-rose-500',
        'from-amber-400 to-orange-500',
        'from-violet-400 to-fuchsia-500'
    ];
    if (!name) return gradients[0];
    let hash = 5381;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) + hash) + name.charCodeAt(i);
    }
    return gradients[Math.abs(hash) % gradients.length];
};

export default function StoreCard({ store }: { store: StoreSummary }) {
    const latestEventTitle = store.coupons?.length ? `${store.coupons.length}개의 할인 혜택` : '현재 등록된 활성 쿠폰 없음';

    return (
        <Link href={`/store/${store.id}`} className="card block overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-2xl bg-gradient-to-br ${getGradientClass(store.name)} shadow-sm`}>
                        {store.name.charAt(0)}
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {store.name}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {/\d{1,2}월 최신 할인 정보를 제공합니다/.test(store.description || '') ? `${store.name}의 할인 혜택과 적용 조건을 비교하세요.` : store.description}
                </p>

                <div className="pt-4 border-t flex items-center justify-between" style={{ borderColor: 'var(--border-color)' }}>
                    <span className="text-sm font-semibold text-blue-600 truncate mr-2">
                        {latestEventTitle}
                    </span>
                    <ChevronRight size={18} className="text-gray-400 group-hover:text-blue-600 transition-transform group-hover:translate-x-1" />
                </div>
            </div>
        </Link>
    );
}
