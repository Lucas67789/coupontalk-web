import React from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

// Map database tags to user-friendly Korean category names
const TAG_MAP: Record<string, string> = {
    'travel': '여행 쿠폰',
    'electronics': '가전/디지털',
    'tech': '가전/디지털',
    'fashion': '패션/잡화',
    '신발': '패션/잡화',
    'lifestyle': '라이프/쇼핑',
};

// Priority order for displaying categories
const CATEGORY_ORDER = ['여행 쿠폰', '라이프/쇼핑', '가전/디지털', '패션/잡화', '기타'];

export default async function StickySidebar() {
    // Fetch all stores that have tags
    const { data: stores } = await supabase
        .from('stores')
        .select('id, name, tags')
        .not('tags', 'is', null);

    if (!stores || stores.length === 0) return null;

    // Group stores by normalized category
    const groupedStores: Record<string, typeof stores> = {};

    stores.forEach(store => {
        if (!store.tags || store.tags.length === 0) return;
        
        // Take the first tag for primary categorization
        const rawTag = store.tags[0];
        const categoryName = TAG_MAP[rawTag] || '기타';

        if (!groupedStores[categoryName]) {
            groupedStores[categoryName] = [];
        }
        groupedStores[categoryName].push(store);
    });

    // Sort categories based on CATEGORY_ORDER
    const sortedCategories = Object.keys(groupedStores).sort((a, b) => {
        const idxA = CATEGORY_ORDER.indexOf(a);
        const idxB = CATEGORY_ORDER.indexOf(b);
        if (idxA === -1 && idxB === -1) return a.localeCompare(b);
        if (idxA === -1) return 1;
        if (idxB === -1) return -1;
        return idxA - idxB;
    });

    return (
        <aside className="sticky top-24 w-full bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hidden lg:block">
            <h2 className="text-lg font-extrabold text-gray-900 mb-6 border-b border-gray-100 pb-3">
                🔥 인기 쿠폰 모음집
            </h2>
            <div className="flex flex-col gap-6">
                {sortedCategories.map(category => (
                    <div key={category}>
                        <h3 className="text-sm font-bold text-blue-600 mb-3 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                            {category}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {groupedStores[category].map(store => (
                                <Link
                                    key={store.id}
                                    href={`/store/${store.id}`}
                                    className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-sm font-medium text-gray-700 hover:text-blue-700 transition-colors"
                                >
                                    {store.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
}
