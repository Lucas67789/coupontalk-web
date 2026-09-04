import { MetadataRoute } from 'next';
import { supabase, fetchAllRows } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://coupontalk.kr'; // 배포된 실제 도메인
    // 주의: stores/coupons 테이블에는 created_at만 있고 updated_at 컬럼이 없음 (supabase_setup.sql,
    // seo_migration.sql, coupon_scheduling_update.sql 기준). categories 테이블은 created_at도 없음.
    // 존재하지 않는 컬럼을 select 하면 fetchAllRows가 에러를 삼키고 빈 배열을 반환하기 때문에,
    // 스토어/쿠폰/카테고리 URL 전체가 사이트맵에서 통째로 빠지는 심각한 문제가 생길 수 있어 되돌림.
    const { data: stores } = await fetchAllRows(supabase.from('stores').select('id, created_at'));
    const { data: categories } = await fetchAllRows(supabase.from('categories').select('id'));
    const now = new Date().toISOString();
    const { data: coupons } = await fetchAllRows(supabase.from('coupons')
        .select('id, store_id, created_at')
        .eq('status', 'published')
        .lte('published_at', now));

    const storeUrls = (stores || []).map((store) => ({
        url: `${baseUrl}/store/${store.id}`,
        lastModified: store.created_at ? new Date(store.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const categoryUrls = (categories || []).map((cat) => ({
        url: `${baseUrl}/category/${cat.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const couponUrls = (coupons || []).map((coupon) => ({
        url: `${baseUrl}/store/${coupon.store_id}/coupon/${coupon.id}`,
        lastModified: coupon.created_at ? new Date(coupon.created_at) : new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(), // fallback
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/store`,
            lastModified: new Date(), // fallback
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(), // fallback
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...categoryUrls,
        ...storeUrls,
        ...couponUrls,
    ];
}
