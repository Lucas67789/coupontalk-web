import type { CouponRow, Faq } from '@/lib/models';
import { defaultStoreFaqs } from '@/lib/faq';
import { couponImages as contentImages, publicContentImages } from '@/lib/content-images';
import { jsonLd as serializeJsonLd } from '@/lib/content-safety';
import { isCouponExpired } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, ChevronRight } from 'lucide-react';
import CouponDetailClient from '@/components/CouponDetailClient';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import { hasCouponCode } from '@/lib/affiliate';
import { agodaFaqs } from '@/components/AgodaGuide';
import type { Metadata } from 'next';
import LatestCouponGuide from '@/components/LatestCouponGuide';
import { uniqueGuideTitle, latestGuideUpdatedAt } from '@/lib/latest-guide';

type RelatedCoupon = Pick<CouponRow, 'id' | 'title' | 'discount' | 'code' | 'store_id' | 'expiry' | 'published_at'>;

export const dynamic = 'force-dynamic';

// Parse packed JSON condition
function parseCondition(coupon: CouponRow) {
    let condText = coupon.condition;
    let affUrl = coupon.affiliate_url || '';
    try {
        if (condText && condText.startsWith('{')) {
            const p = JSON.parse(condText);
            if (p.text !== undefined) {
                condText = p.text;
                affUrl = p.url;
            }
        }
    } catch (e) { }
    return { condText, affUrl };
}

export async function generateMetadata(props: { params: Promise<{ id: string; couponId: string }> }): Promise<Metadata> {
    const params = await props.params;
    const storeId = decodeURIComponent(params.id);
    const couponId = decodeURIComponent(params.couponId);

    const now = new Date().toISOString();
    const { data: coupon } = await supabase
        .from('coupons')
        .select('*, stores(name, description, logo)')
        .eq('id', couponId)
        .eq('store_id', storeId)
        .eq('status', 'published')
        .lte('published_at', now)
        .single();

    if (!coupon) return { title: 'Not Found' };

    const storeName = coupon.stores?.name || '';

    // Smart title generation to prevent keyword stuffing (e.g. "슈마커 슈마커")
    let defaultTitlePart1 = coupon.title;
    if (storeName && !defaultTitlePart1.includes(storeName)) {
        defaultTitlePart1 = `${storeName} ${defaultTitlePart1}`;
    }

    let defaultTitlePart2 = coupon.discount || '';
    if (defaultTitlePart2 && !defaultTitlePart2.includes('할인')) {
        defaultTitlePart2 = `${defaultTitlePart2} 할인`;
    }

    const expired = isCouponExpired(coupon.expiry, coupon.title);
    const originalTitle = coupon.seo_title || [defaultTitlePart1, defaultTitlePart2, '쿠폰톡'].filter(Boolean).join(' | ');

    let title = originalTitle;

    // Smart description generation
    let defaultDescPart1 = coupon.title;
    if (storeName && !defaultDescPart1.includes(storeName)) {
        defaultDescPart1 = `${storeName} ${defaultDescPart1}`;
    }
    const description = expired ? `${storeName} 최신 혜택과 대상 조건을 확인하세요. 이전 「${coupon.title.replace(/\[종료\]/g, "").trim()}」 행사의 후속 안내이며, 종료된 코드는 사용할 수 없습니다.` : coupon.seo_description || `${defaultDescPart1}. ${defaultTitlePart2} 혜택의 적용 조건과 유효기간, 이용 방법을 확인하세요.`;

    const { data: latest } = expired ? await supabase.from('coupons').select('id, code, title, expiry, content_body, updated_at, published_at, created_at').eq('store_id', storeId).eq('status', 'published').lte('published_at', now).order('published_at', { ascending: false }) : { data: [] };
    if (expired) title = uniqueGuideTitle(storeName, coupon, latest || []);
    const guideOffers = (latest || []).filter(c => !isCouponExpired(c.expiry, c.title));
    const images = expired ? guideOffers.flatMap(c => contentImages(c.content_body)) : contentImages(coupon.content_body);
    const modified = [latestGuideUpdatedAt, coupon.updated_at || coupon.created_at, ...(latest || []).map(c => c.updated_at || c.published_at || c.created_at)].filter(Boolean).sort().at(-1);
    return {
        title,
        description,
        robots: { index: true, follow: true, 'max-image-preview': 'large' },
        alternates: {
            canonical: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(couponId)}`,
        },
        openGraph: {
            title,
            description,
            url: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(couponId)}`,
            type: 'article',
            locale: 'ko_KR',
            siteName: '쿠폰톡',
            images: images.map(url => ({ url, alt: expired ? title : coupon.title })),
            modifiedTime: expired ? modified : coupon.updated_at,
            publishedTime: new Date(coupon.published_at || coupon.created_at).toISOString(),
        },
    };
}

export default async function CouponDetailPage(props: { params: Promise<{ id: string; couponId: string }> }) {
    const params = await props.params;
    const storeId = decodeURIComponent(params.id);
    const couponId = decodeURIComponent(params.couponId);

    // Fetch coupon with store info (and ensure it is public)
    const now = new Date().toISOString();
    const couponPromise = supabase
        .from('coupons')
        .select('*, stores(name, description, logo, rating, website_url, faqs, guide_content, tags)')
        .eq('id', couponId)
        .eq('status', 'published')
        .lte('published_at', now)
        .single();

    // Fetch related coupons (same store, different coupon)
    const relatedCouponsPromise = supabase
        .from('coupons')
        .select('*')
        .eq('store_id', storeId)
        .eq('status', 'published')
        .lte('published_at', now)
        .neq('id', couponId)
        .order('published_at', { ascending: false });

    const [
        { data: coupon },
        { data: allRelatedCoupons }
    ] = await Promise.all([
        couponPromise,
        relatedCouponsPromise
    ]);

    if (!coupon || coupon.store_id !== storeId) {
        notFound();
    }

    const { condText, affUrl } = parseCondition(coupon);
    const store = { ...coupon.stores };
    store.faqs = storeId === 'agoda' ? agodaFaqs : defaultStoreFaqs(store.name, isCouponExpired(coupon.expiry, coupon.title) ? [] : [coupon]);
    const storeName = store?.name || '';

    const expired = isCouponExpired(coupon.expiry, coupon.title);

    const validRelatedCoupons: RelatedCoupon[] = [];
    const expiredRelatedCoupons: RelatedCoupon[] = [];
    if (allRelatedCoupons) {
        allRelatedCoupons.forEach((c: RelatedCoupon) => {
            if (isCouponExpired(c.expiry, c.title)) {
                if (expiredRelatedCoupons.length < 8) expiredRelatedCoupons.push(c);
            } else {
                if (validRelatedCoupons.length < 8) validRelatedCoupons.push(c);
            }
        });
    }

    if (expired) {
        const offers = (allRelatedCoupons || []).filter(c => !isCouponExpired(c.expiry, c.title));
        const modified = [latestGuideUpdatedAt, coupon.updated_at || coupon.created_at, ...(allRelatedCoupons || []).map(c => c.updated_at || c.published_at || c.created_at)].filter(Boolean).sort().at(-1)!;
        return <LatestCouponGuide coupon={coupon} offers={offers} storeName={storeName}
            title={uniqueGuideTitle(storeName, coupon, [coupon, ...(allRelatedCoupons || [])])}
            description={`${storeName} 최신 혜택과 대상 조건을 확인하세요. 이전 「${coupon.title.replace(/\[종료\]/g, "").trim()}」 행사의 후속 안내이며, 종료된 코드는 사용할 수 없습니다.`}
            modified={modified} />;
    }

    // H1 title
    const h1Title = coupon.seo_title || (coupon.title.includes(storeName) ? coupon.title : `${storeName} ${coupon.title}`);

    // Extract Hero Image from markdown
    let mainImage: string | null = contentImages(coupon.content_body)[0];
    let mainImageAlt = h1Title;
    let remainingContent = publicContentImages(coupon.content_body || '');

    // Look for the first image in markdown (e.g. ![alt text](url))
    const imgRegex = /!\[(.*?)\]\((.*?)\)/;
    const imgMatch = remainingContent.match(imgRegex);
    if (imgMatch) {
        if (imgMatch[1]) mainImageAlt = imgMatch[1];
        mainImage = imgMatch[2];
        // Remove only the first matched image from the content
        remainingContent = remainingContent.replace(imgMatch[0], '').trim();
    }

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: h1Title,
        image: contentImages(coupon.content_body),
        description: coupon.seo_description || `${storeName} ${coupon.title} - ${coupon.discount} 할인`,
        datePublished: new Date(coupon.published_at || coupon.created_at).toISOString(),
        dateModified: new Date(coupon.updated_at || coupon.published_at || coupon.created_at).toISOString(),
        author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr' },
        publisher: {
            '@type': 'Organization',
            name: '쿠폰톡',
            logo: { '@type': 'ImageObject', url: 'https://coupontalk.kr/og-image.png' }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://coupontalk.kr/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(couponId)}`,
        },
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '홈', item: 'https://coupontalk.kr' },
            { '@type': 'ListItem', position: 2, name: storeName, item: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}` },
            { '@type': 'ListItem', position: 3, name: coupon.title, item: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(couponId)}` }
        ]
    };

    const faqLd = store?.faqs && store.faqs.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: store.faqs.slice(0, 2).map((faq: Faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
    } : null;

    const schemaGraph = {
        '@context': 'https://schema.org',
        '@graph': [jsonLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])]
    };

    return (
        <div className="container mx-auto max-w-4xl border-x min-h-screen pb-24 md:pb-0 bg-white shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
            {/* JSON-LD Schema Graph */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaGraph) }}
            />

            {/* Breadcrumb */}
            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <nav className="flex flex-wrap items-center gap-2 text-sm text-gray-500 [&>a]:shrink-0 [&>svg]:shrink-0">
                    <Link href="/" className="hover:text-blue-600 transition-colors">홈</Link>
                    <ChevronRight size={14} />
                    <Link href={`/store/${encodeURIComponent(storeId)}`} className="hover:text-blue-600 transition-colors">{storeName}</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-medium truncate max-w-[200px] hidden md:inline">{coupon.title}</span>
                </nav>
            </div>

            {/* Affiliate Disclosure (KFTC) */}
            <div className="bg-gray-50/50 border-b px-6 py-3 text-xs text-gray-600 text-center font-medium" style={{ borderColor: 'var(--border-color)' }}>
                이 포스팅은 제휴마케팅이 포함된 광고로 일정 커미션을 지급 받을 수 있습니다.
            </div>

            {/* H1 Title */}
            <div className="p-5 md:p-8">
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-6">
                    {h1Title}
                </h1>

                {expired && <aside className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-5" aria-label="종료된 쿠폰 안내">
                    <p className="font-bold text-amber-900">이 혜택은 종료되었습니다</p>
                    <p className="mt-2 text-sm leading-6 text-amber-900">아래 내용은 지난 프로모션 기록으로 현재 구매·예약에 사용할 수 없습니다.</p>
                    <Link href={`/store/${encodeURIComponent(storeId)}${validRelatedCoupons.length ? '#benefit-summary' : ''}`} className="mt-4 inline-flex rounded-lg bg-blue-600 px-5 py-3 font-bold text-white">
                        {storeName} {validRelatedCoupons.length ? '최신 혜택 비교하기' : '현재 할인 정보 확인하기'} →
                    </Link>
                </aside>}

                {/* Coupon CTA Section */}
                <div className="mb-10">
                    <CouponDetailClient
                        coupon={{
                            id: coupon.id,
                            code: coupon.code,
                            title: coupon.title,
                            discount: coupon.discount,
                            condition: condText,
                            expiry: coupon.expiry,
                            content_body: coupon.content_body,
                            affiliate_url: affUrl,
                        }}
                        storeName={storeName}
                        affiliateUrl={affUrl}
                    />
                </div>

                {/* Hero Image Extracted from Markdown */}
                {mainImage && (
                    <div className="mb-8 rounded-2xl overflow-hidden border border-gray-100 shadow-sm relative w-full">
                        <img src={mainImage} alt={mainImageAlt} className="w-full h-auto" />
                    </div>
                )}


            </div>

            {/* Markdown Content Section */}
            {remainingContent && (
                <div className="px-6 md:px-10 pb-8">
                    <div className="bg-white border border-gray-100 rounded-2xl p-6 md:p-8 shadow-sm">
                        <MarkdownRenderer content={remainingContent} storeName={storeName} />
                    </div>
                </div>
            )}

            {/* Related Coupons (Moved to replace TOC) */}
            {validRelatedCoupons.length > 0 && (
                <div className="px-6 md:px-10 pb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {storeName}의 다른 {!hasCouponCode(coupon.code) ? '혜택' : '할인코드'}
                    </h2>
                    <div className="flex flex-col gap-3">
                        {validRelatedCoupons.map((rc: RelatedCoupon) => (
                            <Link
                                key={rc.id}
                                href={`/store/${rc.store_id}/coupon/${rc.id}`}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-white border border-gray-100 rounded-xl p-4 md:p-5 hover:shadow-md hover:border-blue-300 transition-all group"
                            >
                                <div className="bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 w-full sm:w-auto text-center sm:text-left border border-blue-100/50">
                                    {rc.discount}
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <p className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition-colors line-clamp-2 sm:line-clamp-1">
                                        {rc.title}
                                    </p>
                                    <div className="flex items-center gap-2 justify-between sm:justify-end">
                                        <p className="text-sm text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded border border-gray-100">
                                            {rc.code === 'NO_CODE_REQUIRED' ? '코드 불필요' : rc.code}
                                        </p>
                                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-500 transition-colors flex-shrink-0" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className="px-6 pb-8"><Link href={`/store/${encodeURIComponent(storeId)}#how-to-use`} className="text-blue-700 underline">{storeName} 이용 가이드와 자주 묻는 질문 보기</Link></div>
            <section className="px-6 pb-8"><h2 className="text-xl font-bold mb-4">이 쿠폰의 적용 조건</h2>{store.faqs.slice(0, 2).map((faq: Faq) => <div key={faq.question} className="mb-4"><h3 className="font-semibold">{faq.question}</h3><p className="mt-2 text-sm leading-7 text-gray-600">{faq.answer}</p></div>)}</section>
            {/* Expired Related Coupons */}
            {expiredRelatedCoupons.length > 0 && (
                <div className="px-6 md:px-10 pb-10">
                    <h2 className="text-xl font-bold text-gray-400 mb-4 flex items-center gap-2">
                        <Clock size={20} /> {storeName}의 이미 종료된 혜택
                    </h2>
                    <div className="flex flex-col gap-3 opacity-50 grayscale">
                        {expiredRelatedCoupons.map((rc: RelatedCoupon) => (
                            <div
                                key={rc.id}
                                className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-5"
                            >
                                <div className="bg-gray-200 text-gray-600 px-3 py-1.5 rounded-lg text-sm font-bold flex-shrink-0 w-full sm:w-auto text-center sm:text-left">
                                    만료됨
                                </div>
                                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                    <p className="font-semibold text-gray-500 text-base line-through line-clamp-2 sm:line-clamp-1">
                                        {rc.title}
                                    </p>
                                    <p className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                        사용기간 종료
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Related Coupons originally here, now moved up */}

            {/* Back to Store */}
            <div className="p-6 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
                <Link
                    href={`/store/${encodeURIComponent(storeId)}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    {storeName}의 모든 혜택 보기
                </Link>
            </div>
        </div>
    );
}
