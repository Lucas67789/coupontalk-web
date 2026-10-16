import { ALIAS_STORE_FILTER } from '@/lib/store-aliases';
import { jsonLd as serializeJsonLd } from '@/lib/content-safety';
import { supabase, fetchAllRows } from '@/lib/supabase';
import { isCouponExpired } from '@/lib/utils';
import StoreList from '@/components/StoreList';
import type { Metadata } from 'next';
import type { SearchOffer } from '@/lib/search';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
    title: '전체 쇼핑몰 할인코드 및 프로모션 모음 | 쿠폰톡',
    description: '쿠폰톡에 등록된 모든 쇼핑몰과 브랜드의 최신 할인코드, 프로모션 혜택을 한눈에 확인하세요.',
    alternates: {
        // ?q= 검색 파라미터가 붙어도 항상 대표 URL(/store)로 정규화
        canonical: 'https://coupontalk.kr/store',
    },
};

export default async function AllStoresPage({
    searchParams,
}: {
    searchParams: Promise<{ q?: string }>;
}) {
    // Note: We need to pull tags and description to allow search matching
    const { data: stores } = await fetchAllRows(supabase.from('stores').select('id,name,description,logo,rating,tags,events,coupons(id,expiry,title)')
        .not('id', 'in', ALIAS_STORE_FILTER).eq('coupons.status', 'published').lte('coupons.published_at', new Date().toISOString()));
    for (const store of stores || []) store.coupons = store.coupons.filter((coupon: { expiry: string; title: string }) => !isCouponExpired(coupon.expiry, coupon.title));
    const { q } = await searchParams;
    const now = new Date().toISOString();
    const [{ data: coupons }, { data: products }] = await Promise.all([
        fetchAllRows(supabase.from('coupons').select('id,store_id,title,discount,code,expiry,content_body').eq('status', 'published').lte('published_at', now)),
        fetchAllRows(supabase.from('products').select('id,store_id,title,description,discount_badge').eq('status', 'published').lte('published_at', now)),
    ]);
    const names = new Map(stores.map(store => [store.id, store.name]));
    const offers: SearchOffer[] = [
        ...coupons.filter(c => !isCouponExpired(c.expiry, c.title)).map(c => ({ id: c.id, storeId: c.store_id, storeName: names.get(c.store_id) || '', title: c.title, discount: c.discount, href: `/store/${encodeURIComponent(c.store_id)}/coupon/${encodeURIComponent(c.id)}`, keywords: `${c.code} ${(c.content_body || '').replace(/<[^>]*>|https?:\/\/\S+/g, ' ')}` })),
        ...products.map(p => ({ id: p.id, storeId: p.store_id, storeName: names.get(p.store_id) || '', title: p.title, discount: p.discount_badge || '', href: `/store/${encodeURIComponent(p.store_id)}#products`, keywords: p.description || '' })),
    ];

    const itemListLd = {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: (stores || []).slice(0, 100).map((store, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: store.name,
            url: `https://coupontalk.kr/store/${encodeURIComponent(store.id)}`,
        })),
    };

    return (
        <div className="container mx-auto">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(itemListLd) }}
            />
            <StoreList initialStores={stores || []} initialQuery={q || ''} offers={offers} />
        </div>
    );
}
