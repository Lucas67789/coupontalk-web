import { ALIAS_STORE_FILTER } from '@/lib/store-aliases';
import { supabase, fetchAllRows } from '@/lib/supabase';
import { couponStatus } from '@/lib/utils';
import { xmlText, cdata } from '@/lib/rss';
import { sanitizeContent } from '@/lib/content-safety';

export const dynamic = 'force-dynamic';
export async function GET() {
    const base = 'https://coupontalk.kr', now = new Date().getTime();
    const { data } = await fetchAllRows(supabase.from('coupons').select('id,store_id,title,expiry,content_body,seo_description,updated_at,published_at,created_at')
        .eq('status', 'published').lte('published_at', new Date(now).toISOString()).not('store_id', 'in', ALIAS_STORE_FILTER));
    const rows = data.filter(c => couponStatus(c, now) !== 'expired').sort((a, b) => Date.parse(b.updated_at || b.published_at || b.created_at) - Date.parse(a.updated_at || a.published_at || a.created_at)).slice(0, 50);
    const modified = (c: typeof rows[number]) => new Date(c.updated_at || c.published_at || c.created_at).toUTCString();
    const items = rows.map(c => {
        const url = `${base}/store/${encodeURIComponent(c.store_id)}/coupon/${encodeURIComponent(c.id)}`;
        const status = couponStatus(c, now) === 'upcoming' ? '시작 예정' : '진행 기간 내 · 실제 적용 조건 확인';
        const body = /<[a-z][\s\S]*>/i.test(c.content_body || '') ? sanitizeContent(c.content_body) : `<pre>${xmlText(c.content_body || '')}</pre>`;
        return `<item><title>${xmlText(`[${status}] ${c.title}`)}</title><link>${xmlText(url)}</link><guid isPermaLink="true">${xmlText(url)}</guid><pubDate>${modified(c)}</pubDate><description>${cdata(`<p>${xmlText(status)} · 마감: ${xmlText(c.expiry || '상세 확인')}</p><p>${xmlText(c.seo_description || '')}</p>${body}`)}</description></item>`;
    }).join('\n');
    return new Response(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel><title>쿠폰톡 최신 할인정보</title><link>${base}</link><description>신규·수정 쿠폰의 대상 조건과 진행·예정 상태 안내</description><language>ko-kr</language>${rows.length ? `<lastBuildDate>${modified(rows[0])}</lastBuildDate>` : ''}<atom:link href="${base}/rss.xml" rel="self" type="application/rss+xml"/>${items}</channel></rss>`, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
