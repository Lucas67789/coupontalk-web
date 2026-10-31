import Image from 'next/image';
import { subscriptionImagePath } from '@/lib/subscription-image';
import { subscriptionPrices, subscriptionPriceCheckedAt, won } from '@/lib/subscription-prices';

export default function SubscriptionVisualGuide({ slug }: { slug: string }) {
  const quote = subscriptionPrices[slug];
  if (!quote) return null;
  const priceCaption = `${quote.service} ${quote.months}개월 ${quote.soldOut ? '품절 참고가' : quote.listing ? '판매 목록가' : '선택 옵션 금액'} ${won(quote.total)} · ${quote.plan}`;
  return <section id="visual-guide" className="my-8 scroll-mt-28">
    <h2 className="text-2xl font-bold">{quote.service}, 가격과 이용 방법을 이미지로 확인하세요</h2>
    <p className="mt-2 text-sm leading-6 text-gray-600">{subscriptionPriceCheckedAt} 확인 기준입니다. 이미지를 누르면 큰 원본을 볼 수 있습니다.</p>
    <div className="mt-5 grid items-start gap-6 lg:grid-cols-2">
      <figure className="min-w-0 overflow-hidden rounded-2xl border bg-white">
        <a href={subscriptionImagePath(slug, 'price')} target="_blank" rel="noopener noreferrer" aria-label={`${quote.service} 가격 비교 이미지 크게 보기`}>
          <Image src={subscriptionImagePath(slug, 'price')} alt={priceCaption} width={1200} height={1200} className="h-auto w-full" sizes="(max-width: 1023px) 100vw, 560px" />
        </a>
        <figcaption className="p-4 text-sm leading-6"><strong>{priceCaption}</strong><p className="mt-1 text-gray-600">{quote.conditions}</p></figcaption>
      </figure>
      <figure className="min-w-0 overflow-hidden rounded-2xl border bg-white">
        <a href={subscriptionImagePath(slug, 'how')} target="_blank" rel="noopener noreferrer" aria-label={`${quote.service} 이용 방법 이미지 크게 보기`}>
          <Image src={subscriptionImagePath(slug, 'how')} alt={`${quote.service} 겜스고 이용 방법: 상품 검색, ${quote.soldOut ? '재고' : '옵션'} 확인, 최종 결제액 확인, 주문 안내에 따라 이용 시작`} width={1200} height={1200} className="h-auto w-full" sizes="(max-width: 1023px) 100vw, 560px" />
        </a>
        <figcaption className="p-4 text-sm leading-6"><strong>상품 선택 → 조건 확인 → 결제 → 이용 시작</strong><p className="mt-1 text-gray-600">개인형·공유형·충전형에 따라 계정과 이용 절차가 달라집니다.</p></figcaption>
      </figure>
    </div>
  </section>;
}
