import { MetadataRoute } from 'next';
import { supabase } from '@/lib/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://coupontalk.kr'; // 배포될 실제 도메인
    const { data: stores, error } = await supabase.from('stores').select('id');
    const { data: categories } = await supabase.from('categories').select('id');

    if (error) {
        console.error("Sitemap fetch error:", error);
    }

    const storeUrls = (stores || []).map((store) => ({
        url: `${baseUrl}/store/${store.id}`,
        lastModified: new Date(),
        changeFrequency: 'daily' as const,
        priority: 0.8,
    }));

    const categoryUrls = (categories || []).map((cat) => ({
        url: `${baseUrl}/category/${cat.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/store`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...categoryUrls,
        ...storeUrls,
    ];
}
