import { jsonLd as serializeJsonLd } from '@/lib/content-safety';
import { supabase, fetchAllRows } from '@/lib/supabase';
import { isCouponExpired } from '@/lib/utils';
import StoreList from '@/components/StoreList';
import type { Metadata } from 'next';

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
    const { data: stores } = await fetchAllRows(supabase.from('stores').select('id,name,description,rating,tags,events,coupons(id,expiry,title)')
        .eq('coupons.status', 'published').lte('coupons.published_at', new Date().toISOString()));
    for (const store of stores || []) store.coupons = store.coupons.filter((coupon: { expiry: string; title: string }) => !isCouponExpired(coupon.expiry, coupon.title));
    const { q } = await searchParams;

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
            <StoreList initialStores={stores || []} initialQuery={q || ''} />
        </div>
    );
}
