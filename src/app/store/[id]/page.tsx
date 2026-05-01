import { supabase } from '@/lib/supabase';
import CouponCard from '@/components/CouponCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, ExternalLink, CalendarDays, HelpCircle } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import TableOfContents from '@/components/TableOfContents';
import { CheckCircle } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const storeId = decodeURIComponent(params.id);
    const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).single();
    if (!store) return { title: 'Not Found' };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const title = `[${currentYear}년 ${currentMonth}월] ${store.name} 할인코드 및 카드 프로모션 총정리 | 쿠폰톡`;
    const description = `${currentYear}년 ${currentMonth}월 ${store.name} 할인코드 및 프로모션을 총정리하였습니다. 검증된 최신 할인쿠폰과 카드 혜택을 확인하세요.`;

    let ogImageUrl = store.logo;
    if (ogImageUrl && ogImageUrl.trim().startsWith('<')) {
        const match = ogImageUrl.match(/<img[^>]+src=["']([^"']+)["']/i);
        ogImageUrl = match ? match[1] : undefined;
    }

    return {
        title,
        description,
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
            images: ogImageUrl ? [{ url: ogImageUrl, alt: store.name }] : undefined,
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
            coupons(*)
        `)
        .eq('id', storeId)
        .eq('coupons.status', 'published')
        .lte('coupons.published_at', now)
        .single();

    if (!store) {
        notFound();
    }

    if (store && store.coupons) {
        store.coupons.sort((a: any, b: any) => {
            const dateA = new Date(a.published_at || a.created_at || 0).getTime();
            const dateB = new Date(b.published_at || b.created_at || 0).getTime();
            return dateB - dateA;
        });
    }

    const isCouponExpired = (expiry: string) => {
        if (!expiry) return false;
        const match = expiry.match(/(\d{4})[.-](\d{1,2})[.-](\d{1,2})/);
        if (match) {
            const year = parseInt(match[1], 10);
            const month = parseInt(match[2], 10) - 1;
            const day = parseInt(match[3], 10);
            const expiryDate = new Date(year, month, day, 23, 59, 59);
            return expiryDate.getTime() < new Date().getTime();
        }
        return false;
    };

    const tableCoupons = store?.coupons?.filter((c: any) => !isCouponExpired(c.expiry)) || [];

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDate = new Date().getDate();

    // JSON-LD structured data for Hub Page
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `[${currentYear}년 ${currentMonth}월] ${store.name} 할인코드 및 카드 프로모션 총정리`,
        description: `${currentYear}년 ${currentMonth}월 ${store.name} 할인코드 및 프로모션을 총정리하였습니다.`,
        datePublished: store.created_at || now,
        dateModified: now,
        author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr' },
        publisher: {
            '@type': 'Organization',
            name: '쿠폰톡',
            logo: { '@type': 'ImageObject', url: 'https://coupontalk.kr/og-image.png' }
        },
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `https://coupontalk.kr/store/${encodeURIComponent(storeId)}`,
        },
    };

    const breadcrumbLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: '홈', item: 'https://coupontalk.kr' },
            { '@type': 'ListItem', position: 2, name: store.name, item: `https://coupontalk.kr/store/${encodeURIComponent(storeId)}` }
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
            {/* Back Button */}
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> 전체 목록으로
                </Link>
            </div>

            {/* Store Header */}
            <div className="p-6 md:p-10 border-b flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply opacity-50 transform translate-x-1/2 -translate-y-1/2 blur-2xl"></div>

                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white p-4 shadow-md flex-shrink-0 relative z-10">
                    <SafeImage src={store.logo} alt={store.name} />
                </div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-2">
                        <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
                            [{currentYear}년 {currentMonth}월] <br className="hidden md:block" />
                            {store.name} 할인코드 및 카드 프로모션 총정리
                        </h1>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                            <Star size={16} className="fill-yellow-500 text-yellow-500" />
                            <span>{store.rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <p className="text-lg text-gray-600 mb-4">{store.description}</p>
                    {store.website_url && (
                        <a href={store.website_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-blue-600 font-semibold text-sm hover:underline">
                            {store.name} 바로가기 <ExternalLink size={14} />
                        </a>
                    )}
                </div>
            </div>

            {/* Update History */}
            <div className="px-6 md:px-10 py-4 bg-gray-50 border-b flex items-center gap-3 text-gray-700" style={{ borderColor: 'var(--border-color)' }}>
                <CheckCircle size={20} className="text-green-600" />
                <p className="font-semibold text-sm">
                    최신 업데이트: <span className="text-gray-900 font-bold">{currentYear}년 {currentMonth}월 {currentDate}일</span> 기준 쿠폰 및 프로모션 검증 완료
                </p>
            </div>

            {/* Summary Table */}
            {tableCoupons.length > 0 && (
                <div className="p-6 md:p-10 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold mb-4 text-gray-900">📋 {currentMonth}월 {store.name} 할인코드 요약표</h2>
                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-100 text-gray-800 font-bold border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap">할인 혜택</th>
                                    <th className="px-4 py-3 whitespace-nowrap">할인코드</th>
                                    <th className="px-4 py-3 whitespace-nowrap">조건</th>
                                    <th className="px-4 py-3 whitespace-nowrap">유효기간</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {tableCoupons.map((coupon: any) => {
                                    let parsedCond = coupon.condition;
                                    try {
                                        if (coupon.condition && coupon.condition.startsWith('{')) {
                                            parsedCond = JSON.parse(coupon.condition).text || parsedCond;
                                        }
                                    } catch(e) {}
                                    return (
                                        <tr key={coupon.id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-blue-700">{coupon.discount}</td>
                                            <td className="px-4 py-3 font-mono bg-blue-50/50 text-blue-900 font-bold">
                                                {coupon.code === 'NO_CODE_REQUIRED' ? '코드 불필요' : coupon.code}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{parsedCond}</td>
                                            <td className="px-4 py-3 text-gray-500">{coupon.expiry}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Events / Notices */}
            {store.events?.length > 0 && (
                <div className="p-6 md:p-10 border-b bg-blue-50/50" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-blue-900">
                        <CalendarDays size={20} className="text-blue-600" /> 이달의 카드 프로모션 및 이벤트
                    </h2>
                    <ul className="flex flex-col gap-3">
                        {store.events?.map((event: any, i: number) => (
                            <li key={i} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                <span className="font-bold text-gray-900">{event.title}</span>
                                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{event.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Coupons List */}
            <div className="p-6 md:p-10 bg-gray-50/50">
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    💰 사용 가능한 할인코드 <span className="text-blue-600">({store.coupons?.length || 0})</span>
                </h2>

                {store.coupons?.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {store.coupons?.map((coupon: any) => (
                            <CouponCard key={coupon.id} coupon={coupon} storeName={store.name} storeId={store.id} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">현재 사용 가능한 할인코드가 없습니다.</p>
                    </div>
                )}
            </div>

            {/* Guide Content / Hub Articles */}
            {store.guide_content && (
                <div className="px-6 md:px-10 py-10 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">📖 상세 가이드 및 꿀팁</h2>
                    <TableOfContents content={store.guide_content} />
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                        <MarkdownRenderer content={store.guide_content} storeName={store.name} />
                    </div>
                </div>
            )}

            {/* FAQs */}
            {store.faqs?.length > 0 && (
                <div className="p-6 md:p-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <HelpCircle size={24} className="text-blue-600" /> {store.name} 할인코드 FAQ
                    </h2>
                    <div className="flex flex-col gap-4">
                        {store.faqs?.map((faq: any, i: number) => (
                            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-start gap-2">
                                    <span className="text-blue-600">Q.</span> {faq.question}
                                </h3>
                                <p className="text-gray-600 pl-6 leading-relaxed">
                                    {faq.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}

        </div>
    );
}
