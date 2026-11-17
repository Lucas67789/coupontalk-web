import SocarBenefits from '@/components/SocarBenefits';
import AliStoreLanding from '@/components/AliStoreLanding';
import { aliCouponTiers } from '@/lib/ali-coupon-tiers';
import { storeEventStatus } from '@/lib/store-event-status';
import { storeCoverImages } from '@/lib/store-cover-images';
import type { CouponRow, ProductRow, Faq } from '@/lib/models';
import { defaultStoreFaqs, parseFaqs } from '@/lib/faq';
import { contentImages } from '@/lib/content-images';
import { isCouponExpired, couponStatus } from '@/lib/utils';
import { jsonLd as serializeJsonLd } from '@/lib/content-safety';
import { supabase } from '@/lib/supabase';
import AgodaGuide, { agodaFaqs, agodaGuideUpdatedAt } from '@/components/AgodaGuide';
import { hasStoreGuide, storeGuideTitle } from '@/lib/store-guide';
import { hasCouponCode, safeAffiliateUrl } from '@/lib/affiliate';
import { notFound } from 'next/navigation';
import StoreGuide from '@/components/StoreGuide';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import type { Metadata } from 'next';
import RelatedStores from '@/components/RelatedStores';
import TravelOfferGuide, { travelStoreIntros, travelGuideUpdatedAt } from '@/components/TravelOfferGuide';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const storeId = decodeURIComponent(params.id);
    const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).single();
    if (!store) return { title: 'Not Found' };

    const koreaNow = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const currentMonth = koreaNow.getUTCMonth() + 1;
    const currentYear = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).getUTCFullYear();


    // 우선순위 4: 메타 디스크립션 동적 키워드 보강
    const { data: topCoupons } = await supabase
        .from('coupons')
        .select('id, code, discount, title, expiry, content_body')
        .eq('store_id', storeId)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

    const activeCoupons = (topCoupons || []).filter(c => !isCouponExpired(c.expiry, c.title));
    const codeCount = activeCoupons.reduce((n: number, c: { id: string; code: string; content_body?: string | null }) => n + (aliCouponTiers(c).length || (hasCouponCode(c.code) ? c.code.split(/\r?\n/).filter(Boolean).length : 0)), 0);
    const guided = storeId !== 'usimsa' && hasStoreGuide(store.tags);
    const previewImages = [...new Set([...(storeId === 'aliexpress' ? ['https://coupontalk.kr/images/ali-store/campaign.webp', 'https://coupontalk.kr/images/ali-store/payment.webp', 'https://coupontalk.kr/images/ali-store/guide.webp'] : []), ...contentImages(guided ? store.guide_content : ''), ...activeCoupons.flatMap(c => contentImages(c.content_body))])].slice(0, 8);

    const title = guided ? storeGuideTitle(store.name, store.guide_content) : activeCoupons.length ? (storeId === 'hotelskr' ? '호텔스닷컴 할인코드' : `${store.name} 할인코드 | ${currentYear}년 ${currentMonth}월 혜택·조건 비교`) : `${store.name} 할인 정보 | 현재 등록된 활성 쿠폰 없음`;
    const description = guided ? store.description : travelStoreIntros[storeId] || (activeCoupons.length
        ? `${store.name} 행사 ${activeCoupons.length}개 · 할인코드 ${codeCount}종. ${activeCoupons.slice(0, 2).map(c => c.discount).join(', ')}. 쿠폰별 적용 대상과 할인 한도, 사용 기간을 비교하세요.`
        : `${store.name}의 현재 등록된 활성 쿠폰은 없습니다. 지난 프로모션과 이용 시 확인할 조건을 안내하며, 새 혜택이 등록되면 이 페이지에서 확인할 수 있습니다.`);


    return {
        title,
        description,
        robots: { index: true, follow: true, 'max-image-preview': 'large' },
        alternates: {
            canonical: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}`,
        },
        openGraph: {
            title,
            description,
            url: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}`,
            type: 'article',
            locale: 'ko_KR',
            siteName: '쿠폰톡',
            images: previewImages.length ? previewImages.map(url => ({ url, alt: `${store.name} 상품·이용 안내` })) : [{ url: storeCoverImages[storeId] || 'https://coupontalk.kr/og-image.png?fit=square-v1', alt: `${store.name} 이용 안내` }],
        }
    };
}

export default async function StorePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const storeId = decodeURIComponent(params.id);
    const now = new Date().toISOString();
    const { data: store } = await supabase
        .from('stores')
        .select(`
            *,
            coupons(*),
            products(*)
        `)
        .eq('id', storeId)
        .eq('coupons.status','published').lte('coupons.published_at',now)
        .eq('products.status','published').lte('products.published_at',now)
        .single();

    if (!store) notFound();

    const publishedCoupons = store.coupons?.filter((c: CouponRow) => c.status === 'published' && (!c.published_at || new Date(c.published_at) <= new Date(now))) || [];
    const publishedProducts = store.products?.filter((p: ProductRow) => p.status === 'published' && (!p.published_at || new Date(p.published_at) <= new Date(now))) || [];

    publishedCoupons.sort((a: CouponRow, b: CouponRow) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime());
    publishedProducts.sort((a: ProductRow, b: ProductRow) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime());

    const tableCoupons = publishedCoupons.map((c: CouponRow) => ({
        ...c,
        isExpired: isCouponExpired(c.expiry, c.title)
    })).sort((a: CouponRow, b: CouponRow) => (a.isExpired === b.isExpired ? 0 : a.isExpired ? 1 : -1));

    const activeCoupons = tableCoupons.filter((c: CouponRow) => !c.isExpired);
    const ongoingCount = activeCoupons.filter((c: CouponRow) => couponStatus(c, new Date(now).getTime()) === 'active').length;
    const upcomingCount = activeCoupons.length - ongoingCount;
    const codeCount = activeCoupons.reduce((n: number, c: { id: string; code: string; content_body?: string | null }) => n + (aliCouponTiers(c).length || (hasCouponCode(c.code) ? c.code.split(/\r?\n/).filter(Boolean).length : 0)), 0);
    const guided = storeId !== 'usimsa' && hasStoreGuide(store.tags);
    const guideTitle = storeGuideTitle(store.name, store.guide_content);
    const storeUrl = safeAffiliateUrl(store.website_url);
    const offerImages = [...new Set<string>([...(storeId === 'aliexpress' ? ['https://coupontalk.kr/images/ali-store/campaign.webp', 'https://coupontalk.kr/images/ali-store/payment.webp', 'https://coupontalk.kr/images/ali-store/guide.webp'] : []), ...contentImages(guided ? store.guide_content : ''), ...activeCoupons.flatMap((c: CouponRow) => contentImages(c.content_body))])];
    const expiredCoupons = tableCoupons.filter((c: CouponRow) => c.isExpired);
    const isAgoda = storeId === 'agoda';

    const currentYear = new Date(new Date().getTime() + 9 * 60 * 60 * 1000).getUTCFullYear();
    const koreaNow = new Date(new Date().getTime() + 9 * 60 * 60 * 1000);
    const currentMonth = koreaNow.getUTCMonth() + 1;

    // 우선순위 5: dateModified는 실제 쿠폰/상품 데이터의 최근 업데이트 시점 기준
    const updateTimes = [store, ...publishedCoupons, ...publishedProducts]
        .map(row => Date.parse(row.updated_at || row.published_at || row.created_at || ''))
        .filter(Number.isFinite);
    if (isAgoda) updateTimes.push(Date.parse(agodaGuideUpdatedAt));
    if (travelStoreIntros[storeId]) updateTimes.push(Date.parse(travelGuideUpdatedAt));
    const dateModified = updateTimes.length ? new Date(Math.max(...updateTimes)).toISOString() : undefined;

    // 우선순위 3: 동적 FAQ 생성 로직 (DB에 없으면 기본 템플릿 사용)
    const defaultFaqs = defaultStoreFaqs(store.name, activeCoupons);
    const faqs = guided ? parseFaqs(store.faqs) : isAgoda ? agodaFaqs : defaultFaqs;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: guided ? guideTitle : `${store.name} 할인코드와 적용 조건`,
        description: guided ? store.description : `${store.name} 등록된 진행·예정 혜택 ${activeCoupons.length}개와 이용 조건 안내.`,
        datePublished: store.created_at || now,
        dateModified: dateModified,
        image: offerImages.length ? offerImages : ['https://coupontalk.kr/og-image.png?fit=square-v1'],
        author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr' },
        publisher: { '@type': 'Organization', name: '쿠폰톡', logo: { '@type': 'ImageObject', url: 'https://coupontalk.kr/og-image.png?fit=square-v1' } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `https://coupontalk.kr/store/${encodeURIComponent(storeId)}` }
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '홈', item: 'https://coupontalk.kr' },
            { '@type': 'ListItem', position: 2, name: store.name, item: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}` }
        ]
    };

    // 우선순위 1: FAQPage 스키마
    const faqLd = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq: Faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
    };

    const itemListLd = activeCoupons.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: activeCoupons.map((coupon: CouponRow, index: number) => {
            const imageUrl = contentImages(coupon.content_body)[0] || undefined;
            return {
                '@type': 'ListItem',
                position: index + 1,
                name: coupon.title,
                url: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(coupon.id)}`,
                image: imageUrl,
                description: coupon.discount || coupon.seo_description || '할인코드 및 프로모션'
            };
        })
    } : null;

    const schemaGraph = {
        '@context': 'https://schema.org',
        '@graph': [jsonLd, breadcrumbLd, faqLd, ...(itemListLd ? [itemListLd] : [])]
    };

    return <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaGraph) }} />
        <AliStoreLanding store={store} coupons={activeCoupons} expiredCoupons={expiredCoupons} products={publishedProducts} faqs={faqs.length ? faqs : defaultFaqs} dateModified={dateModified} now={now} guided={guided}>
            <TravelOfferGuide storeId={storeId} offers={activeCoupons} />
            {storeId === 'socar' && <SocarBenefits />}
            {guided ? <MarkdownRenderer content={store.guide_content || ''} storeName={store.name} /> : isAgoda ? <AgodaGuide /> : storeId !== 'aliexpress' ? <StoreGuide name={store.name} travel={Boolean(travelStoreIntros[storeId]) || store.tags?.includes("travel")} storeId={storeId} showHowTo={false} /> : null}
            {!guided && !['aliexpress', 'agoda', 'klook', 'hotelskr', 'lenovo', 'usimsa'].includes(storeId) && store.guide_content && <MarkdownRenderer content={store.guide_content} storeName={store.name} />}
            {!!store.events?.length && <details className="mt-6 rounded-xl border p-4"><summary>스토어 행사 일정과 기록</summary><ul className="mt-3 space-y-3">{store.events.map((event: {title: string; date: string}, i: number) => <li key={i}>{event.title} · {event.date}<span className="ml-2 text-xs text-slate-500">{storeEventStatus(event.date, new Date(now)) === 'record' ? '지난 행사·기간 확인 필요' : '진행·예정'}</span></li>)}</ul></details>}
            <RelatedStores storeId={storeId} />
        </AliStoreLanding>
    </>;
}
