import Link from 'next/link';
import { Store } from '@/data';
import { Star, ChevronRight } from 'lucide-react';

export default function StoreCard({ store }: { store: Store }) {
    const latestEventTitle = store.events?.length > 0 ? store.events[0].title : `${store.coupons?.length || 0}개의 할인코드`;

    return (
        <Link href={`/store/${store.id}`} className="card block overflow-hidden group">
            <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-white p-2">
                        {/* Using img for external logo URLs without next/image config for now */}
                        <img src={store.logo} alt={store.name} className="max-w-full max-h-full object-contain" />
                    </div>
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                        <Star size={14} className="fill-yellow-500 text-yellow-500" />
                        <span>{store.rating.toFixed(1)}</span>
                    </div>
                </div>

                <h3 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {store.name}
                </h3>

                <p className="text-sm text-gray-500 mb-4 line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                    {store.description}
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
