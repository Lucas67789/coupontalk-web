import type { CouponRow, ProductRow, Faq } from '@/lib/models';
import { defaultStoreFaqs, parseFaqs } from '@/lib/faq';
import { contentImages } from '@/lib/content-images';
import { isCouponExpired, couponStatus } from '@/lib/utils';
import { jsonLd as serializeJsonLd } from '@/lib/content-safety';
import { supabase } from '@/lib/supabase';
import AgodaGuide, { agodaFaqs, agodaGuideUpdatedAt } from '@/components/AgodaGuide';
import { hasStoreGuide, storeGuideTitle } from '@/lib/store-guide';
import { hasCouponCode, safeAffiliateUrl } from '@/lib/affiliate';
import CouponListRow from '@/components/CouponListRow';
import ProductCard from '@/components/ProductCard';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, CalendarDays, HelpCircle, CheckCircle } from 'lucide-react';
import StoreGuide from '@/components/StoreGuide';
import { MarkdownRenderer } from '@/components/MarkdownRenderer';
import TableOfContents from '@/components/TableOfContents';
import type { Metadata } from 'next';

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
        .select('code, discount, title, expiry, content_body')
        .eq('store_id', storeId)
        .eq('status', 'published')
        .lte('published_at', new Date().toISOString())
        .order('published_at', { ascending: false });

    const activeCoupons = (topCoupons || []).filter(c => !isCouponExpired(c.expiry, c.title));
    const guided = hasStoreGuide(store.tags);
    const previewImages = [...new Set([...contentImages(guided ? store.guide_content : ''), ...activeCoupons.flatMap(c => contentImages(c.content_body))])].slice(0, 8);

    const title = guided ? storeGuideTitle(store.name, store.guide_content) : activeCoupons.length ? `${store.name} 할인코드 | ${currentYear}년 ${currentMonth}월 혜택·조건 비교` : `${store.name} 할인 정보 | 현재 등록된 활성 쿠폰 없음`;
    const description = guided ? store.description : activeCoupons.length
        ? `${store.name} 할인 혜택 ${activeCoupons.length}개. ${activeCoupons.slice(0, 2).map(c => c.discount).join(', ')}. 쿠폰별 적용 대상과 할인 한도, 사용 기간을 비교하세요.`
        : `${store.name}의 현재 등록된 활성 쿠폰은 없습니다. 지난 프로모션과 이용 시 확인할 조건을 안내하며, 새 혜택이 등록되면 이 페이지에서 확인할 수 있습니다.`;


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
            images: previewImages.length ? previewImages.map(url => ({ url, alt: `${store.name} 상품·이용 안내` })) : [{ url: 'https://coupontalk.kr/og-image.png', alt: '쿠폰톡 할인 혜택 안내' }],
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
    const guided = hasStoreGuide(store.tags);
    const guideTitle = storeGuideTitle(store.name, store.guide_content);
    const storeUrl = safeAffiliateUrl(store.website_url);
    const offerImages = [...new Set<string>([...contentImages(guided ? store.guide_content : ''), ...activeCoupons.flatMap((c: CouponRow) => contentImages(c.content_body))])];
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
        image: offerImages.length ? offerImages : ['https://coupontalk.kr/og-image.png'],
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

    return (
        <div className="container mx-auto max-w-5xl border-x min-h-screen bg-white shadow-sm pb-28" style={{ borderColor: 'var(--border-color)' }}>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(schemaGraph) }} />

            <div className="px-5 py-3 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors">
                    <ArrowLeft size={16} /> 전체 목록으로
                </Link>
            </div>

            <header className="p-5 md:p-6 border-b border-gray-200">

                <p className="text-sm font-semibold text-blue-700 mb-3">{guided ? "상품·이용 가이드" : activeCoupons.length ? `${currentYear}년 ${currentMonth}월 · 진행 기간 내 ${ongoingCount}개 · 예정 ${upcomingCount}개` : "현재 등록된 활성 쿠폰 없음"}</p>
                <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900">{guided ? guideTitle : `${store.name} 할인코드`}</h1>
                <p className="mt-3 text-sm text-gray-600 leading-6">{guided ? store.description : "적용 대상 · 할인 한도 · 사용 기간을 비교하고 내게 맞는 혜택을 선택하세요."}</p>
                <nav aria-label={`${store.name} 페이지 목차`} className="mt-4 flex flex-wrap gap-2">
                    {(guided ? [["#store-guide", "상품·이용 안내"], ...(activeCoupons.length ? [["#coupons", "쿠폰·혜택"]] : []), ["#faq", "자주 묻는 질문"]] : [...(activeCoupons.length ? [["#benefit-summary", "혜택 비교표"]] : []), ["#coupons", "할인 혜택 보기"], ["#choose-offer", "내게 맞는 혜택"], ["#how-to-use", "사용 방법"], ["#faq", "자주 묻는 질문"]]).map(([href, label], index) => <a key={href} href={href} className={`rounded-lg px-4 py-3 text-sm font-semibold ${index === 0 ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{label}</a>)}
                </nav>
            </header>

            <div className="px-5 md:px-6 py-2 bg-gray-50 border-b flex items-center gap-3 text-gray-700" style={{ borderColor: 'var(--border-color)' }}>
                <CheckCircle size={20} className="text-green-600" />
                <p className="font-semibold text-sm">
                    {dateModified ? <>최근 내용 수정: <span className="text-gray-900 font-bold">{new Date(dateModified).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</span></> : '쿠폰별 유효기간과 적용 조건을 확인하세요.'}
                </p>
            </div>

            <div className="bg-gray-50/50 border-b px-6 py-3 text-xs text-gray-600 text-center font-medium" style={{ borderColor: 'var(--border-color)' }}>
                이 포스팅은 제휴마케팅이 포함된 광고로 커미션을 지급 받습니다.
            </div>

            {guided && <section id="store-guide" className="p-5 md:p-8 scroll-mt-24 border-b">
                {storeUrl && <div className="mb-8 rounded-2xl bg-blue-50 border border-blue-100 p-5 md:p-6">
                    <p className="font-bold text-lg text-slate-900">{store.name}에서 상품과 이용 조건 확인</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">판매처의 상품·요금·예약 조건은 변경될 수 있습니다. 최종 조건은 이동한 사이트에서 확인하세요.</p>
                    <a data-store-affiliate={store.id} href={storeUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-4 inline-flex items-center justify-center min-h-12 rounded-xl bg-blue-600 text-white px-6 py-3 font-bold hover:bg-blue-700">{store.name} 상품·서비스 보기 ↗</a>
                    <p className="mt-2 text-xs text-slate-500">제휴 링크 · 새 창에서 열립니다</p>
                </div>}
                <MarkdownRenderer content={store.guide_content || ''} storeName={store.name} />
                {storeUrl && <a data-store-affiliate={store.id} href={storeUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-8 inline-flex rounded-xl border border-blue-600 px-6 py-3 font-bold text-blue-700">{store.name} 상품·서비스 확인 ↗</a>}
            </section>}

            {activeCoupons.length > 0 && (
                <div id="benefit-summary" className="p-5 md:p-6 border-b scroll-mt-24" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold mb-4 text-gray-900">📋 {currentMonth}월 {store.name} 혜택 요약표</h2>
                    <p className="text-sm text-gray-600 leading-6 mb-4">등록된 사용·예약 마감일이 지나지 않은 혜택입니다. 대상 고객·상품과 실제 적용 여부는 각 프로모션 조건을 확인하세요.</p>
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
                                {activeCoupons.map((coupon: CouponRow) => {
                                    let parsedCond = coupon.condition;
                                    try {
                                        if (coupon.condition && coupon.condition.startsWith('{')) {
                                            parsedCond = JSON.parse(coupon.condition).text || parsedCond;
                                        }
                                    } catch {}

                                    // 우선순위 2: 방어 로직 (날짜 형식이 아니거나 알 수 없는 경우 예외 처리)
                                    let displayExpiry = coupon.expiry;
                                    if (!displayExpiry || displayExpiry.length < 2) displayExpiry = '판매처에서 확인';

                                    return (
                                        <tr key={coupon.id} className="bg-white hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-semibold text-blue-700"><Link className="underline underline-offset-4" href={`/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(coupon.id)}`}>{couponStatus(coupon, new Date(now).getTime()) === "upcoming" ? "[예정] " : "[진행 기간 내] "}{coupon.discount}</Link></td>
                                            <td className="px-4 py-3 font-mono bg-blue-50/50 text-blue-900 font-bold">
                                                {!hasCouponCode(coupon.code) ? (
    '전용 링크에서 확인'
) : (
    <div className="flex flex-col gap-1">
        {coupon.code.split(/\r?\n/).map((codeStr: string, idx: number) => (
            <span key={idx} className="bg-blue-100 text-blue-900 px-2 py-1 rounded font-bold whitespace-nowrap text-xs md:text-sm inline-block w-fit">
                {codeStr}
            </span>
        ))}
    </div>
)}
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

            {(!guided || activeCoupons.length > 0) && (
                <div id="coupons" className="p-4 md:p-6 bg-slate-50 border-b scroll-mt-24" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        할인코드와 결제 혜택 <span className="text-blue-600">({activeCoupons.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                        {activeCoupons.map((coupon: CouponRow) => (
                            <CouponListRow key={coupon.id} coupon={coupon} storeName={store.name} storeId={store.id} storeLogo={store.logo} isExpired={coupon.isExpired} />
                        ))}
                    </div>
                    {activeCoupons.length === 0 && <p className="text-gray-600">현재 등록된 활성 쿠폰이 없습니다. 새로운 프로모션이 등록되면 이곳에서 확인할 수 있습니다.</p>}
                </div>
            )}

            {store.events?.length > 0 && (
                <div className="p-6 md:p-10 border-b bg-blue-50/50" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-xl font-bold flex items-center gap-2 mb-4 text-blue-900">
                        <CalendarDays size={20} className="text-blue-600" /> 이달의 카드 프로모션 및 이벤트
                    </h2>
                    <ul className="flex flex-col gap-3">
                        {store.events?.map((event: { title: string; date: string }, i: number) => (
                            <li key={i} className="flex gap-4 items-center bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                                <span className="font-bold text-gray-900">{event.title}</span>
                                <span className="text-sm font-medium px-3 py-1 bg-blue-100 text-blue-700 rounded-full">{event.date}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            {publishedProducts.length > 0 && (
                <div id="products" className="p-6 md:p-10 bg-white border-b scroll-mt-24" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        🎁 추천 특가 상품 <span className="text-blue-600">({publishedProducts.length})</span>
                    </h2>
                    <div className="flex flex-col gap-6 max-w-3xl mx-auto">
                        {publishedProducts.map((product: ProductRow) => (
                            <ProductCard key={product.id} product={product} storeName={store.name} />
                        ))}
                    </div>
                </div>
            )}

            {!guided && publishedCoupons.length === 0 && publishedProducts.length === 0 && (
                <div className="p-6 md:p-10 bg-gray-50/50">
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-500">현재 등록된 할인코드 및 상품이 없습니다.</p>
                    </div>
                </div>
            )}

            {/* 우선순위 3: 콘텐츠 대폭 확장 (4단계 적용 가이드, 결제수단별 혜택, 예약 꿀팁, 브랜드 안내) */}
            {!guided && (isAgoda ? <AgodaGuide /> : <StoreGuide name={store.name} travel={store.tags?.includes("travel")} storeId={storeId} />)}

            {/* FAQs */}
            <div id="faq" className="p-6 md:p-10 border-t scroll-mt-24" style={{ borderColor: 'var(--border-color)' }}>
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                    <HelpCircle size={24} className="text-blue-600" /> {store.name} 자주 묻는 질문 (FAQ)
                </h2>
                <div className="flex flex-col gap-4">
                    {faqs.map((faq: Faq, i: number) => (
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
            {!guided && !['agoda', 'klook', 'lenovo'].includes(storeId) && store.guide_content && (
                <div className="px-6 md:px-10 py-10 border-t" style={{ borderColor: 'var(--border-color)' }}>
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 text-center">📖 상세 가이드 및 팁</h2>
                    <TableOfContents content={store.guide_content} />
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                        <MarkdownRenderer content={store.guide_content} storeName={store.name} />
                    </div>
                </div>
            )}

            {/* Sticky Bottom CTA */}
            {expiredCoupons.length > 0 && <details className="mx-6 md:mx-10 my-8 rounded-xl border border-gray-200 p-5">
                <summary className="cursor-pointer font-semibold text-gray-600">종료된 할인 혜택 ({expiredCoupons.length})</summary>
                <p className="mt-3 text-sm text-gray-500">지난 프로모션 기록입니다. 현재 구매·예약에는 사용할 수 없습니다.</p>
                <ul className="mt-4 divide-y divide-gray-100">{expiredCoupons.map((coupon: CouponRow) => <li key={coupon.id} className="py-3"><Link className="text-sm text-gray-600 hover:underline" href={`/store/${encodeURIComponent(storeId)}/coupon/${encodeURIComponent(coupon.id)}`}>{coupon.title}</Link><p className="mt-1 text-xs text-gray-500">{coupon.expiry}</p></li>)}</ul>
            </details>}
            {!guided && activeCoupons.length > 0 && <div className="fixed bottom-0 left-0 w-full z-40 p-3 bg-white border-t border-gray-200 md:hidden"><a href="#benefit-summary" className="flex justify-center rounded-xl bg-blue-600 p-3 font-bold text-white">{store.name} 쿠폰 {activeCoupons.length}개 비교하기</a></div>}

        </div>
    );
}
