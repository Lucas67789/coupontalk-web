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
    const lines = content.split('\n');
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

    const { data: coupon } = await supabase
        .from('coupons')
        .select('*, stores(name, description, logo)')
        .eq('id', couponId)
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
        },
    };
}

export default async function CouponDetailPage(props: { params: Promise<{ id: string; couponId: string }> }) {
    const params = await props.params;
    const storeId = decodeURIComponent(params.id);
    const couponId = decodeURIComponent(params.couponId);

    // Fetch coupon with store info
    const { data: coupon } = await supabase
        .from('coupons')
        .select('*, stores(name, description, logo, rating, website_url, faqs, guide_content)')
        .eq('id', couponId)
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
        dateModified: new Date().toISOString(),
        author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr' },
        publisher: {
            '@type': 'Organization',
            name: '쿠폰톡',
            url: 'https://coupontalk.kr',
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://coupontalk.kr/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(couponId)}`,
        },
    };

    return (
        <div className="container mx-auto max-w-4xl border-x min-h-screen bg-white shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
            {/* JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
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
                <div className="px-6 md:px-10 pb-8">
                    <div className="bg-blue-50/50 rounded-2xl p-6 md:p-8 border border-blue-100 shadow-sm">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-blue-900 border-b border-blue-100/50 pb-4">
                            💡 {storeName} 쿠폰코드 사용방법 가이드
                        </h2>
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
