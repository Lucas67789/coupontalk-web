import { MetadataRoute } from 'next';
import { supabase, fetchAllRows } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://coupontalk.kr'; // 배포된 실제 도메인
    // updated_at 컬럼이 추가된 이후 select에 포함 (add_updated_at_column.sql 실행 완료 확인 후 적용)
    const { data: stores } = await fetchAllRows(supabase.from('stores').select('id, created_at, updated_at'));
    const { data: categories } = await fetchAllRows(supabase.from('categories').select('id'));
    const now = new Date().toISOString();
    const { data: coupons } = await fetchAllRows(supabase.from('coupons')
        .select('id, store_id, created_at, updated_at')
        .eq('status', 'published')
        .lte('published_at', now));

    const storeUrls = (stores || []).map((store) => ({
        url: `${baseUrl}/store/${store.id}`,
        lastModified: store.updated_at ? new Date(store.updated_at) : (store.created_at ? new Date(store.created_at) : new Date()),
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
        lastModified: coupon.updated_at ? new Date(coupon.updated_at) : (coupon.created_at ? new Date(coupon.created_at) : new Date()),
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
