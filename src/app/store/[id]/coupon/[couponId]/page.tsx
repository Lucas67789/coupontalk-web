import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, Tag, Clock, CheckCircle2, ChevronRight } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import CouponDetailClient from '@/components/CouponDetailClient';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

// Parse packed JSON condition
function parseCondition(coupon: any) {
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

// Simple markdown-like renderer for content_body
function renderContentBody(content: string) {
    // Normalize <img ... /> tags to standard ![Image](url) so they don't break across newlines
    const normalizedContent = content.replace(/<img[^>]*>/gi, (match) => {
        const srcMatch = match.match(/src=["'](.*?)["']/);
        if (srcMatch) {
            return `![Image](${srcMatch[1]})`;
        }
        return match;
    });

    const lines = normalizedContent.split('\n');
    const elements: React.ReactNode[] = [];
    let key = 0;

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            elements.push(<div key={key++} className="h-3" />);
        } else if (trimmed.startsWith('### ')) {
            elements.push(
                <h3 key={key++} className="text-lg font-bold text-gray-800 mt-6 mb-2">
                    {trimmed.slice(4)}
                </h3>
            );
        } else if (trimmed.startsWith('## ')) {
            elements.push(
                <h2 key={key++} className="text-xl font-bold text-gray-900 mt-8 mb-3 pb-2 border-b border-gray-100">
                    {trimmed.slice(3)}
                </h2>
            );
        } else if (trimmed.startsWith('- ')) {
            elements.push(
                <li key={key++} className="ml-4 text-gray-700 leading-relaxed list-disc">
                    {trimmed.slice(2)}
                </li>
            );
        } else if (/^\d+\.\s/.test(trimmed)) {
            const text = trimmed.replace(/^\d+\.\s/, '');
            elements.push(
                <li key={key++} className="ml-4 text-gray-700 leading-relaxed list-decimal">
                    {text}
                </li>
            );
        } else if (trimmed === '/>' || trimmed === '>') {
            // Ignore stray closing brackets from multiline html tags that couldn't be fully squashed
            continue;
        } else if (trimmed.match(/!\[(.*?)\]\((.*?)\)/)) {
            const match = trimmed.match(/!\[(.*?)\]\((.*?)\)/);
            if (match) {
                elements.push(
                    <div key={key++} className="my-6">
                        <img src={match[2]} alt={match[1]} className="rounded-xl border border-gray-100 max-w-full h-auto shadow-sm" />
                    </div>
                );
            }
        } else {
            elements.push(
                <p key={key++} className="text-gray-700 leading-relaxed">
                    {trimmed}
                </p>
            );
        }
    }
    return elements;
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
        .eq('status', 'published')
        .lte('published_at', now)
        .single();

    if (!coupon) return { title: 'Not Found' };

    const storeName = coupon.stores?.name || '';
    const currentMonth = new Date().getMonth() + 1;

    const title = coupon.seo_title || `${storeName} ${coupon.title} | ${coupon.discount} 할인 ${currentMonth}월 | 쿠폰톡`;
    const description = coupon.seo_description || `${storeName} ${coupon.title}. ${coupon.discount} 할인을 받으세요. 검증된 할인코드를 지금 바로 사용하세요.`;

    return {
        title,
        description,
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
            images: coupon.stores?.logo ? [{ url: coupon.stores.logo, alt: storeName }] : undefined,
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
    const { data: coupon } = await supabase
        .from('coupons')
        .select('*, stores(name, description, logo, rating, website_url, faqs, guide_content)')
        .eq('id', couponId)
        .eq('status', 'published')
        .lte('published_at', now)
        .single();

    if (!coupon || coupon.store_id !== storeId) {
        notFound();
    }

    const { condText, affUrl } = parseCondition(coupon);
    const store = coupon.stores;
    const storeName = store?.name || '';
    const currentMonth = new Date().getMonth() + 1;

    // Fetch related coupons (same store, different coupon)
    const { data: relatedCoupons } = await supabase
        .from('coupons')
        .select('id, title, discount, code, store_id')
        .eq('store_id', storeId)
        .eq('status', 'published')
        .lte('published_at', now)
        .neq('id', couponId)
        .limit(4);

    // H1 title
    const h1Title = coupon.seo_title || `${storeName} ${coupon.title}`;

    // JSON-LD structured data
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: h1Title,
        description: coupon.seo_description || `${storeName} ${coupon.title} - ${coupon.discount} 할인`,
        datePublished: new Date(coupon.published_at || coupon.created_at).toISOString(),
        dateModified: new Date().toISOString(),
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
        mainEntity: store.faqs.map((faq: any) => ({
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
        <div className="container mx-auto max-w-4xl border-x min-h-screen bg-white shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
            {/* JSON-LD Schema Graph */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
            />

            {/* Breadcrumb */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <nav className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/" className="hover:text-blue-600 transition-colors">홈</Link>
                    <ChevronRight size={14} />
                    <Link href={`/store/${encodeURIComponent(storeId)}`} className="hover:text-blue-600 transition-colors">{storeName}</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-800 font-medium truncate max-w-[200px]">{coupon.title}</span>
                </nav>
            </div>

            {/* Store Mini Header */}
            <div className="p-6 border-b flex items-center gap-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="w-16 h-16 rounded-2xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white p-2 shadow-sm flex-shrink-0">
                    <SafeImage src={store?.logo} alt={storeName} />
                </div>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href={`/store/${encodeURIComponent(storeId)}`} className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                            {storeName}
                        </Link>
                        {store?.rating && (
                            <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded text-xs font-medium">
                                <Star size={12} className="fill-yellow-500 text-yellow-500" />
                                <span>{Number(store.rating).toFixed(1)}</span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{store?.description}</p>
                </div>
            </div>

            {/* H1 Title */}
            <div className="p-6 md:p-10">
                <div className="flex items-center gap-3 mb-4">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">
                        {coupon.discount}
                    </span>
                    <span className="text-sm text-gray-400">
                        {currentMonth}월 최신
                    </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight mb-6">
                    {h1Title}
                </h1>

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
                            affiliate_url: affUrl,
                        }}
                        storeName={storeName}
                        affiliateUrl={affUrl}
                    />
                </div>

                {/* Automated SEO Content Block (Naver Keyword Targeting) */}
                <div className="prose prose-blue max-w-none mb-8">
                    <p className="text-gray-700 leading-relaxed text-lg mb-4">
                        <strong>{currentMonth}월 최신 검증된 {storeName} 할인코드</strong>를 찾고 계신가요? 
                        본 페이지에서는 <strong className="text-blue-700">{coupon.title}</strong> 프로모션 혜택을 통해 {storeName}에서 결제 시 
                        <span className="bg-blue-50 px-1 mx-1 font-bold text-blue-800">{coupon.discount}</span> 할인을 적용받을 수 있는 공식적이고 안전한 방법을 자세히 안내해 드립니다.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-4">
                        해당 프로모션은 <strong>{condText ? condText : '스토어 전 가입자 대상'}</strong>으로 진행되며, 
                        유효기간은 <strong className="text-red-500">{coupon.expiry ? coupon.expiry : '상시 진행 (조기 종료 가능)'}</strong>까지입니다. 
                        수많은 정보 속에서 헤매지 마시고, 쿠폰톡이 매일 직접 테스트하여 신뢰성을 담보하는 본 추가 할인코드를 사용하여 가장 저렴하게 쇼핑을 즐겨보세요!
                    </p>
                    {coupon.is_verified && (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3 my-6">
                            <CheckCircle2 className="text-green-600 mt-0.5 flex-shrink-0" size={20} />
                            <div>
                                <h4 className="font-bold text-green-900 mb-1">매니저 수동 검증 완료</h4>
                                <p className="text-green-800 text-sm">해당 {storeName} 프로모션 코드는 {currentMonth}월 현재 정상 작동 여부가 쿠폰톡 매니저에 의해 최종 확인되었습니다. 안심하고 바로 사용하실 수 있습니다.</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Content Body (H2/H3 SEO content) */}
            {coupon.content_body && (
                <div className="px-6 md:px-10 pb-8">
                    <div className="bg-gray-50 rounded-2xl p-6 md:p-8">
                        {renderContentBody(coupon.content_body)}
                    </div>
                </div>
            )}

            {/* Store FAQs */}
            {store?.faqs && store.faqs.length > 0 && (
                <div className="px-6 md:px-10 pb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {storeName} 자주 묻는 질문
                    </h2>
                    <div className="flex flex-col gap-3">
                        {store.faqs.map((faq: any, i: number) => (
                            <div key={i} className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                                <h3 className="text-base font-bold text-gray-900 mb-2 flex items-start gap-2">
                                    <span className="text-blue-600 flex-shrink-0">Q.</span>
                                    {faq.question}
                                </h3>
                                <p className="text-gray-600 pl-6 leading-relaxed text-sm">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Guide Content */}
            {store?.guide_content && (
                <div className="px-6 md:px-10 pb-10">
                    <div className="bg-blue-50/50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-blue-900 border-b border-blue-100/50 pb-4">
                            💡 초보자를 위한 {storeName} 쿠폰코드 사용법
                        </h2>
                        <p className="text-blue-800 mb-6 text-sm">할인 혜택을 처음 이용해보시는 분들도 아래 가이드에 따라 천천히 진행하시면 누구나 쉽게 최종 결제 단계에서 {coupon.discount} 할인을 확정받으실 수 있습니다.</p>
                        <div className="flex flex-col gap-2">
                            {renderContentBody(store.guide_content)}
                        </div>
                    </div>
                </div>
            )}

            {/* Related Coupons */}
            {relatedCoupons && relatedCoupons.length > 0 && (
                <div className="px-6 md:px-10 pb-10 border-t pt-8" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                        {storeName}의 다른 할인코드
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {relatedCoupons.map((rc: any) => (
                            <Link
                                key={rc.id}
                                href={`/store/${rc.store_id}/coupon/${rc.id}`}
                                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md hover:border-blue-200 transition-all group"
                            >
                                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold flex-shrink-0">
                                    {rc.discount}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                                        {rc.title}
                                    </p>
                                    <p className="text-xs text-gray-400 font-mono mt-1">
                                        {rc.code === 'NO_CODE_REQUIRED' ? '코드 필요없음' : rc.code}
                                    </p>
                                </div>
                                <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400 transition-colors flex-shrink-0" />
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Back to Store */}
            <div className="p-6 border-t text-center" style={{ borderColor: 'var(--border-color)' }}>
                <Link
                    href={`/store/${encodeURIComponent(storeId)}`}
                    className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
                >
                    <ArrowLeft size={16} />
                    {storeName}의 모든 할인코드 보기
                </Link>
            </div>
        </div>
    );
}
