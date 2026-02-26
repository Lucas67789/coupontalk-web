import { supabase } from '@/lib/supabase';

export async function GET() {
    const baseUrl = 'https://coupontalk.kr';

    // Fetch categories and stores
    const { data: categories } = await supabase.from('categories').select('*');
    const { data: stores } = await supabase.from('stores').select('*').order('created_at', { ascending: false });

    // Build RSS items
    let itemsXml = '';

    // Add Store Pages to RSS
    if (stores) {
        stores.forEach(store => {
            const storeUrl = `${baseUrl}/store/${store.id}`;
            const pubDate = new Date(store.created_at || Date.now()).toUTCString();

            itemsXml += `
        <item>
            <title><![CDATA[${store.name} 최신 할인코드 및 프로모션]]></title>
            <link>${storeUrl}</link>
            <guid isPermaLink="true">${storeUrl}</guid>
            <description><![CDATA[${store.description || `${store.name}의 실시간 할인 쿠폰과 혜택을 확인하세요.`}]]></description>
            <pubDate>${pubDate}</pubDate>
        </item>`;
        });
    }

    // Add Category Pages to RSS
    if (categories) {
        categories.forEach(category => {
            const catUrl = `${baseUrl}/category/${category.id}`;
            const pubDate = new Date().toUTCString(); // Categories might not have created_at, use current date

            itemsXml += `
        <item>
            <title><![CDATA[${category.name} 관련 스토어 할인 총정리]]></title>
            <link>${catUrl}</link>
            <guid isPermaLink="true">${catUrl}</guid>
            <description><![CDATA[${category.description || `다양한 ${category.name} 스토어들의 할인 정보를 한곳에서 만나보세요.`}]]></description>
            <pubDate>${pubDate}</pubDate>
        </item>`;
        });
    }

    const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>쿠폰톡(coupontalk)</title>
        <link>${baseUrl}</link>
        <description>가장 최신의 검증된 할인코드 모음. 쿠팡, 알리익스프레스, 아고다 등 인기 쇼핑몰 할인 쿠폰 및 프로모션 코드를 매일 업데이트합니다.</description>
        <language>ko-kr</language>
        <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
        <atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />
        ${itemsXml}
    </channel>
</rss>`;

    return new Response(rssFeed, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
}
