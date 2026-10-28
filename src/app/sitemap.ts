import { MetadataRoute } from 'next';
import { supabase, fetchAllRows } from '@/lib/supabase';
import { contentImages } from '@/lib/content-images';
import { isCouponExpired } from '@/lib/utils';
import { latestGuideUpdatedAt } from '@/lib/latest-guide';
import { ALIAS_STORE_FILTER } from '@/lib/store-aliases';

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://coupontalk.kr'; // 배포된 실제 도메인
    const { data: stores } = await fetchAllRows(supabase.from('stores').select('id, created_at, updated_at, guide_content').not('id', 'in', ALIAS_STORE_FILTER));
    const { data: categories } = await fetchAllRows(supabase.from('categories').select('id'));
    const now = new Date().toISOString();
    const { data: coupons } = await fetchAllRows(supabase.from('coupons')
        .select('id, store_id, created_at, updated_at, published_at, content_body, expiry, title')
        .eq('status', 'published')
        .lte('published_at', now));

    const storeUrls = (stores || []).map((store) => ({
        url: `${baseUrl}/store/${encodeURIComponent(store.id)}`,
        images: [...new Set([...contentImages(store.guide_content), ...(coupons || []).filter(c => c.store_id === store.id && !isCouponExpired(c.expiry, c.title)).flatMap(c => contentImages(c.content_body))])],
        lastModified: [...[store.updated_at, store.created_at], ...(coupons || []).filter(c => c.store_id === store.id).map(c => c.updated_at || c.published_at || c.created_at)].filter(Boolean).sort().at(-1),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const categoryUrls = (categories || []).map((cat) => ({
        url: `${baseUrl}/category/${encodeURIComponent(cat.id)}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    const couponUrls = (coupons || []).map((coupon) => ({
        url: `${baseUrl}/store/${encodeURIComponent(coupon.store_id)}/coupon/${encodeURIComponent(coupon.id)}`,
        images: isCouponExpired(coupon.expiry, coupon.title) ? (coupons || []).filter(c => c.store_id === coupon.store_id && !isCouponExpired(c.expiry, c.title)).flatMap(c => contentImages(c.content_body)) : contentImages(coupon.content_body),
        lastModified: isCouponExpired(coupon.expiry, coupon.title) ? [latestGuideUpdatedAt, coupon.updated_at || coupon.published_at || coupon.created_at, ...(coupons || []).filter(c => c.store_id === coupon.store_id).map(c => c.updated_at || c.published_at || c.created_at)].filter(Boolean).sort().at(-1) : coupon.updated_at || coupon.published_at || coupon.created_at || undefined,
        changeFrequency: 'daily' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/store`,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...categoryUrls,
        ...['faq', 'contact', 'terms'].map(path => ({ url: `${baseUrl}/${path}` })),
        ...storeUrls,
        ...couponUrls,
    ];
}
