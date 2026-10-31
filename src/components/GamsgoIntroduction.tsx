import SubscriptionPriceComparison from '@/components/SubscriptionPriceComparison';
import { ArrowRight } from 'lucide-react';
import GamsgoPromoCode from '@/components/GamsgoPromoCode';
import { subscriptionAffiliateUrl } from '@/lib/subscription-guides';

export default function GamsgoIntroduction({ service, slug }: { service?: string; slug?: string }) {
  return <section id="gamsgo" className="my-6 scroll-mt-28">
    <p className="text-sm leading-6 text-gray-600">겜스고는 챗GPT·넷플릭스 등 여러 서비스의 구독 상품을 판매하는 할인 플랫폼입니다.</p>
    <SubscriptionPriceComparison slug={slug} />
    <div id="gamsgo-purchase" className="mt-6 scroll-mt-28 grid items-center gap-5 rounded-2xl border border-blue-100 bg-white p-5 md:grid-cols-2 md:p-7">
      <div><p className="text-sm font-bold text-blue-700">겜스고에서 구매한다면</p><h3 className="mt-2 text-xl font-extrabold">결제 전, 프로모션 코드 챙기세요</h3><GamsgoPromoCode /></div>
      <div><a href={subscriptionAffiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 text-center font-bold text-white hover:bg-blue-800">{service || '구독 상품'} 겜스고 가격 보기 <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0"/></a><p className="mt-3 text-xs leading-6 text-gray-500">겜스고 첫 화면에서 {service ? `‘${service}’` : '원하는 서비스'} 검색 → 상품·기간 선택 → 코드 입력</p></div>
    </div>
  </section>;
}
