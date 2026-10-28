import Link from 'next/link';
import type { CouponRow } from '@/lib/models';
import { couponImages } from '@/lib/content-images';
import { promotionStartsAt } from '@/lib/latest-guide';
import { MarkdownRenderer } from './MarkdownRenderer';

export default function LatestCouponGuide({ coupon, offers, storeName, title, description, modified }: {
    coupon: CouponRow; offers: CouponRow[]; storeName: string; title: string; description: string; modified: string;
}) {
    const now = new Date().getTime();
    const url = `https://coupontalk.kr/store/${encodeURIComponent(coupon.store_id)}/coupon/${encodeURIComponent(coupon.id)}`;
    return <main className="mx-auto max-w-4xl bg-white px-5 py-8 md:p-10">
        <Link className="text-blue-700 underline" href={`/store/${coupon.store_id}`}>{storeName} 전체 혜택</Link>
        <h1 className="mt-5 text-3xl font-bold">{title}</h1>
        <p className="mt-4 leading-7 text-gray-700">{description}</p>
        <p className="mt-3 text-sm text-gray-500">최근 안내 수정: {new Date(modified).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}</p>
        <p className="mt-3 text-sm text-gray-600">제휴 링크를 통해 구매하면 쿠폰톡이 수수료를 받을 수 있습니다.</p>
        <section className="mt-8" aria-label="최신 할인 안내">
            <h2 className="text-2xl font-bold">{storeName} 최신·예정 혜택</h2>
            <p className="mt-3 leading-7">같은 스토어의 혜택입니다. 아래 행사가 이전 쿠폰과 동일한 상품·모델에 적용된다는 뜻은 아닙니다. 대상 상품, 시작일, 결제 조건과 실제 할인액을 확인하세요.</p>
            {!offers.length && <p className="mt-5 rounded-xl bg-gray-50 p-5">현재 등록된 기간 내 혜택이 없습니다. 지난 할인코드는 사용할 수 없으며, 새 행사가 등록되면 이 주소에서 안내합니다.</p>}
            <div className="mt-5 grid gap-5">
                {offers.map(offer => {
                    const image = couponImages(offer.content_body)[0];
                    const start = promotionStartsAt(offer.content_body || '');
                    const upcoming = start !== null && start > now;
                    return <article key={offer.id} className="rounded-2xl border border-blue-100 p-5">
                        <p className="font-semibold text-blue-700">{upcoming ? `시작 예정 · ${new Date(start).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' })}` : '기간·적용 조건 확인'}</p>
                        <Link href={`/store/${offer.store_id}/coupon/${offer.id}`} className="block">
                            {image && <img src={image} alt={offer.title} className="mt-3 w-full max-w-md rounded-xl" />}
                            <h3 className="mt-3 text-xl font-bold text-blue-800">{offer.title}</h3>
                        </Link>
                        <p className="mt-2 font-semibold">{offer.discount}</p>
                        <p className="mt-2 text-sm">사용·예약 마감: {offer.expiry || '상세 페이지 확인'}</p>
                        <p className="mt-2 leading-7 text-gray-600">{offer.seo_description}</p>
                        <Link className="mt-4 inline-block rounded-lg bg-blue-600 px-5 py-3 font-bold text-white" href={`/store/${offer.store_id}/coupon/${offer.id}`}>대상 상품과 할인 조건 확인</Link>
                    </article>;
                })}
            </div>
        </section>
        <details className="mt-10 rounded-xl border p-5" data-nosnippet>
            <summary className="cursor-pointer font-bold">종료된 이전 행사 기록 보기</summary>
            <p className="mt-4 font-bold text-amber-800">이전 코드 {coupon.code}는 종료되었습니다. 현재 구매에 사용할 수 없습니다.</p>
            <h2 className="mt-3 text-xl font-bold">{coupon.title}</h2>
            <p className="my-3">이전 사용·예약 기간: {coupon.expiry}</p>
            <MarkdownRenderer content={coupon.content_body || ''} storeName={storeName} />
        </details>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', '@type': 'Article', headline: title, description, datePublished: coupon.published_at || coupon.created_at, dateModified: modified, mainEntityOfPage: url, image: offers.flatMap(o => couponImages(o.content_body)), author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr' } }).replace(/</g, '\\u003c') }} />
    </main>;
}
