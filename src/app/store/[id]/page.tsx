import { supabase } from '@/lib/supabase';
import CouponCard from '@/components/CouponCard';
import CouponListRow from '@/components/CouponListRow';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, ExternalLink, CalendarDays, HelpCircle, CheckCircle, CreditCard, Info, AlertTriangle } from 'lucide-react';
import SafeImage from '@/components/SafeImage';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import TableOfContents from '@/components/TableOfContents';
import type { Metadata } from 'next';

export const revalidate = 2592000;

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
    const params = await props.params;
    const storeId = decodeURIComponent(params.id);
    const { data: store } = await supabase.from('stores').select('*').eq('id', storeId).single();
    if (!store) return { title: 'Not Found' };

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const title = `[${currentYear}년 ${currentMonth}월] ${store.name} 할인코드 및 카드 프로모션 총정리 | 쿠폰톡`;
    
    // 우선순위 4: 메타 디스크립션 동적 키워드 보강
    const { data: topCoupons } = await supabase
        .from('coupons')
        .select('code, discount, title')
        .eq('store_id', storeId)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(2);

    let description = `${currentYear}년 ${currentMonth}월 ${store.name} 할인코드 및 프로모션을 총정리하였습니다. 검증된 최신 할인쿠폰과 카드 혜택을 확인하세요.`;
    if (topCoupons && topCoupons.length > 0) {
        const dynamicHints = topCoupons.map(c => {
            const isNoCode = !c.code || c.code === 'NO_CODE_REQUIRED' || c.code === '없음';
            return isNoCode ? c.title : `${c.code}(${c.discount})`;
        }).join(', ');
        description = `${store.name} ${currentMonth}월 할인코드 ${dynamicHints} 등 검증된 쿠폰을 한눈에 확인하세요. 누구나 쉽게 적용 가능한 쿠폰톡만의 혜택을 제공합니다.`;
    }

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
            coupons(*),
            products(*)
        `)
        .eq('id', storeId)
        .single();

    if (!store) notFound();

    const publishedCoupons = store.coupons?.filter((c: any) => c.status === 'published' && (!c.published_at || new Date(c.published_at) <= new Date(now))) || [];
    const publishedProducts = store.products?.filter((p: any) => p.status === 'published' && (!p.published_at || new Date(p.published_at) <= new Date(now))) || [];

    publishedCoupons.sort((a: any, b: any) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime());
    publishedProducts.sort((a: any, b: any) => new Date(b.published_at || b.created_at || 0).getTime() - new Date(a.published_at || a.created_at || 0).getTime());

    const { isCouponExpired } = await import('@/lib/utils');

    const tableCoupons = publishedCoupons.map((c: any) => ({
        ...c,
        isExpired: isCouponExpired(c.expiry, c.title)
    })).sort((a: any, b: any) => (a.isExpired === b.isExpired ? 0 : a.isExpired ? 1 : -1));

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentDate = new Date().getDate();

    // 우선순위 5: dateModified는 실제 쿠폰/상품 데이터의 최근 업데이트 시점 기준
    const latestCouponUpdate = publishedCoupons[0]?.updated_at || publishedCoupons[0]?.created_at;
    const dateModified = latestCouponUpdate ? new Date(latestCouponUpdate).toISOString() : now;

    // 우선순위 3: 동적 FAQ 생성 로직 (DB에 없으면 기본 템플릿 사용)
    const defaultFaqs = [
        { question: `${store.name} 할인코드는 어떻게 적용하나요?`, answer: `원하시는 상품을 장바구니에 담은 후, 결제 단계의 [프로모션/할인코드 입력] 란에 쿠폰톡에서 복사하신 코드를 붙여넣으시면 즉시 할인 금액이 반영됩니다.` },
        { question: `${store.name} 쿠폰이 적용되지 않을 때는 어떻게 하나요?`, answer: `쿠폰 유효기간이 만료되었거나, 타 이벤트와 중복 적용이 불가능한 상품일 수 있습니다. 또한 영문 대소문자나 띄어쓰기 오타가 없는지 다시 한번 확인해 주세요.` },
        { question: `결제수단별 혜택과 중복 할인이 되나요?`, answer: `대부분의 경우 전용 결제수단(네이버페이, 토스페이, 특정 카드사 등) 혜택과 일반 할인코드는 중복 적용되지 않으므로, 둘 중 혜택이 더 큰 것을 선택하시는 것이 좋습니다.` },
        { question: `${store.name} 예약 취소 시 쿠폰은 어떻게 되나요?`, answer: `사용하신 쿠폰의 규정에 따라 다릅니다. 일반적인 할인코드는 취소 시 복구되어 재사용이 가능하지만, 선착순 쿠폰이나 프로모션 기간이 종료된 경우에는 복구되지 않을 수 있으니 주의 바랍니다.` }
    ];
    const faqs = (store.faqs && store.faqs.length > 0) ? store.faqs : defaultFaqs;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `[${currentYear}년 ${currentMonth}월] ${store.name} 할인코드 및 카드 프로모션 총정리`,
        description: `${currentYear}년 ${currentMonth}월 ${store.name} 할인코드 및 프로모션을 총정리하였습니다.`,
        datePublished: store.created_at || now,
        dateModified: dateModified,
        author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr' },
        publisher: { '@type': 'Organization', name: '쿠폰톡', logo: { '@type': 'ImageObject', url: 'https://coupontalk.kr/og-image.png' } },
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
        mainEntity: faqs.map((faq: any) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: { '@type': 'Answer', text: faq.answer }
        }))
    };

    const itemListLd = tableCoupons.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: tableCoupons.map((coupon: any, index: number) => {
            let imageUrl = store?.logo || 'https://coupontalk.kr/og-image.png';
            if (coupon.content_body) {
                const imgMatch = coupon.content_body.match(/!\[.*?\]\((.*?)\)/);
                if (imgMatch && imgMatch[1]) imageUrl = imgMatch[1];
            }
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

    return (
        <div className="container mx-auto max-w-4xl border-x min-h-screen bg-white shadow-sm" style={{ borderColor: 'var(--border-color)' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
            
            <div className="p-6 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> 전체 목록으로
                </Link>
            </div>

            <div className="p-6 md:p-10 border-b flex flex-col md:flex-row gap-8 items-start md:items-center relative overflow-hidden" style={{ borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full mix-blend-multiply opacity-50 transform translate-x-1/2 -translate-y-1/2 blur-2xl"></div>
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl overflow-hidden border border-gray-100 flex items-center justify-center bg-white p-4 shadow-md flex-shrink-0 relative z-10">
                    <SafeImage src={store.logo} alt={store.name} />
                </div>
                <div className="relative z-10">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-2">
                        [{currentYear}년 {currentMonth}월] <br className="hidden md:block" />
                        {store.name} 할인코드 총정리
                    </h1>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-1 rounded text-sm font-medium">
                            <Star size={16} className="fill-yellow-500 text-yellow-500" />
                            <span>{parseFloat(store.rating || 5).toFixed(1)}</span>
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

            <div className="px-6 md:px-10 py-4 bg-gray-50 border-b flex items-center gap-3 text-gray-700" style={{ borderColor: 'var(--border-color)' }}>
                <CheckCircle size={20} className="text-green-600" />
                <p className="font-semibold text-sm">
                    최신 업데이트: <span className="text-gray-900 font-bold">{currentYear}년 {currentMonth}월 {currentDate}일</span> 기준 검증 완료
                </p>
            </div>

            <div className="bg-gray-50/50 border-b px-6 py-3 text-xs text-gray-400 text-center font-medium" style={{ borderColor: 'var(--border-color)' }}>
                이 포스팅은 제휴마케팅이 포함된 광고로 일정 커미션을 지급 받을 수 있습니다.
            </div>

            {tableCoupons.length > 0 && (
                <div className="p-6 md:p-10 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold mb-4 text-gray-900">📋 {currentMonth}월 {store.name} 혜택 요약표</h2>
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
                                    
                                    // 우선순위 2: 방어 로직 (날짜 형식이 아니거나 알 수 없는 경우 예외 처리)
                                    let displayExpiry = coupon.expiry;
                                    if (!displayExpiry || displayExpiry.length < 2) displayExpiry = '선착순 조기종료';
                                    
                                    return (
                                        <tr key={coupon.id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-blue-700">{coupon.discount}</td>
                                            <td className="px-4 py-3 font-mono bg-blue-50/50 text-blue-900 font-bold">
                                                {coupon.code === 'NO_CODE_REQUIRED' || !coupon.code ? '결제 시 자동적용' : coupon.code}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{parsedCond}</td>
                                            <td className="px-4 py-3 text-gray-500">{displayExpiry}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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

            {tableCoupons.length > 0 && (
                <div className="p-6 md:p-10 bg-gray-50/50 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        💰 사용 가능한 할인코드 <span className="text-blue-600">({tableCoupons.filter((c: any) => !c.isExpired).length})</span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {tableCoupons.map((coupon: any) => (
                            <CouponListRow key={coupon.id} coupon={coupon} storeName={store.name} storeId={store.id} storeLogo={store.logo} isExpired={coupon.isExpired} />
                        ))}
                    </div>
                </div>
            )}

            {publishedProducts.length > 0 && (
                <div className="p-6 md:p-10 bg-white border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        🎁 추천 특가 상품 <span className="text-blue-600">({publishedProducts.length})</span>
                    </h2>
                    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                        {publishedProducts.map((product: any) => (
                            <ProductCard key={product.id} product={product} storeName={store.name} />
                        ))}
                    </div>
                </div>
            )}

            {publishedCoupons.length === 0 && publishedProducts.length === 0 && (
                <div className="p-6 md:p-10 bg-gray-50/50">
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">현재 등록된 할인코드 및 상품이 없습니다.</p>
                    </div>
                </div>
            )}

            {/* 우선순위 3: 콘텐츠 대폭 확장 (4단계 적용 가이드, 결제수단별 혜택, 예약 꿀팁, 브랜드 안내) */}
            <div className="p-6 md:p-10 bg-white border-b" style={{ borderColor: 'var(--border-color)' }}>

                {/* 1. 결제수단 혜택 가이드 */}
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                    <CreditCard size={24} className="text-blue-600" /> {store.name} 결제수단 혜택 비교
                </h2>
                <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-10 text-gray-700 leading-relaxed">
                    {store.name}에서는 신용카드, 카카오페이, 네이버페이, 토스페이 등 다양한 결제 수단을 지원합니다. 각 카드사나 간편결제사에서 진행하는 매월 게릴라 프로모션(청구할인, 캐시백 등)을 적용하면 가장 저렴하게 예약할 수 있습니다. 상단의 할인코드 요약표를 참고하여 중복 적용이 가능한 가장 혜택이 큰 결제 수단을 선택해 보세요!
                </div>

                {/* 2. 4단계 적용 가이드 */}
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                    <CheckCircle size={24} className="text-blue-600" /> {store.name} 할인코드 적용 4단계
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="text-sm font-bold text-blue-600 mb-1">STEP 1</div>
                        <h3 className="font-bold text-gray-900 mb-2">마음에 드는 상품 선택하기</h3>
                        <p className="text-gray-600 text-sm">{store.name} 홈페이지에 접속하여 구매 또는 예약하고자 하는 상품을 찾아 장바구니에 담습니다.</p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="text-sm font-bold text-blue-600 mb-1">STEP 2</div>
                        <h3 className="font-bold text-gray-900 mb-2">할인코드 꼼꼼히 복사하기</h3>
                        <p className="text-gray-600 text-sm">쿠폰톡에서 제공하는 가장 조건이 좋은 쿠폰 코드를 확인 후 클립보드에 복사해 둡니다.</p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="text-sm font-bold text-blue-600 mb-1">STEP 3</div>
                        <h3 className="font-bold text-gray-900 mb-2">결제 페이지에서 코드 입력</h3>
                        <p className="text-gray-600 text-sm">최종 결제 전 [쿠폰/할인코드 입력] 란에 복사해둔 코드를 붙여넣기 한 후 '적용' 버튼을 누릅니다.</p>
                    </div>
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                        <div className="text-sm font-bold text-blue-600 mb-1">STEP 4</div>
                        <h3 className="font-bold text-gray-900 mb-2">할인 차감 내역 최종 확인</h3>
                        <p className="text-gray-600 text-sm">기본가에서 할인된 금액이 정상적으로 크게 차감되었는지 우측의 최종 결제 금액을 확인합니다.</p>
                    </div>
                </div>

                {/* 3. 예약 꿀팁 및 주의사항 */}
                <h2 className="text-2xl font-bold flex items-center gap-2 mb-6 text-gray-900">
                    <AlertTriangle size={24} className="text-orange-500" /> 놓치기 쉬운 결제 꿀팁 & 주의사항
                </h2>
                <ul className="list-disc list-inside space-y-3 text-gray-600 mb-8 px-2">
                    <li>해외 결제 플랫폼의 경우 DCC(원화결제 수수료)를 방지하기 위해 <strong>결제 통화를 현지 통화나 달러($)로 변경</strong>하는 것이 유리할 수 있습니다.</li>
                    <li>모바일 앱 전용 프로모션 코드는 PC 웹브라우저에서 적용되지 않으니 디바이스를 확인해 주세요.</li>
                    <li>선착순 한정 수량 쿠폰은 예고 없이 조기 마감될 수 있으므로, <strong>발급 즉시 사용하는 것</strong>을 권장합니다.</li>
                    <li>상품 자체 특가(프로모션 상품)와 일반 할인코드는 중복 적용이 불가능한 경우가 많습니다.</li>
                </ul>

            </div>

            {/* FAQs */}
            <div className="p-6 md:p-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle size={24} className="text-blue-600" /> {store.name} 자주 묻는 질문 (FAQ)
                </h2>
                <div className="flex flex-col gap-4">
                    {faqs.map((faq: any, i: number) => (
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

            {/* Guide Content */}
            {store.guide_content && (
                <div className="px-6 md:px-10 py-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">📖 상세 가이드 및 팁</h2>
                    <TableOfContents content={store.guide_content} />
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                        <MarkdownRenderer content={store.guide_content} storeName={store.name} />
                    </div>
                </div>
            )}

            {/* Sticky Bottom CTA */}
            {store.website_url && (
                <div className="fixed bottom-0 left-0 w-full z-50 p-4 bg-white/90 backdrop-blur-md border-t border-gray-200 flex justify-center shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
                    <a 
                        href={store.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="w-full max-w-4xl py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg text-center transition-colors flex items-center justify-center gap-2 shadow-lg hover:-translate-y-1"
                    >
                        {store.name} 특가 보러가기 <ExternalLink size={20} />
                    </a>
                </div>
            )}
        </div>
    );
}
