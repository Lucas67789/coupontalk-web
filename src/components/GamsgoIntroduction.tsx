import { gamsgoPromoCode } from '@/lib/gamsgo-promotion';
import GamsgoPromoCode from '@/components/GamsgoPromoCode';
import { subscriptionAffiliateUrl } from '@/lib/subscription-guides';

export default function GamsgoIntroduction({ service }: { service?: string }) {
  return <section id="gamsgo" className="my-8 scroll-mt-28 overflow-hidden rounded-3xl border border-blue-100 bg-white">
    <div className="grid gap-8 p-6 md:grid-cols-2 md:p-9">
      <div>
        <p className="text-sm font-bold text-blue-700">처음 이용한다면 여기부터</p>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 md:text-3xl">겜스고는 어떤 서비스인가요?</h2>
        <p className="mt-4 leading-8 text-gray-700">겜스고(GamsGo)는 유튜브 프리미엄·디즈니플러스 같은 영상 서비스부터 챗GPT·제미나이 등 AI 도구까지, 여러 유료 구독 상품을 모아 판매하는 플랫폼입니다. 원하는 서비스와 이용 기간을 골라 구매할 수 있습니다.</p>
        <p className="mt-4 leading-8 text-gray-700">{service ? `${service} 구독료를 아끼고 싶다면, 공식 구독 요금과 겜스고의 상품 가격을 비교해보세요.` : '여러 서비스를 구독하고 있다면, 자주 쓰는 서비스부터 공식 요금과 겜스고 상품 가격을 비교해보세요.'} 같은 기간의 총 결제액을 나란히 보면 내게 더 알맞은 구독 방법을 고르기 쉽습니다.</p>
        <p className="mt-4 text-sm leading-7 text-gray-500">상품에 따라 내 계정 충전, 제공 계정, 공유 이용 등 방식이 다릅니다. 모든 상품이 공식 직접 구독과 같은 조건은 아니므로 상품 설명에서 이용 방식을 확인하세요.</p>
      </div>
      <div className="rounded-2xl bg-slate-900 p-5 text-white md:p-6">
        <p className="text-sm font-semibold text-blue-200">결제 전에 챙길 프로모션 코드</p>
        <h3 className="mt-2 text-2xl font-bold">코드 복사하고, 적용 가격 확인하기</h3>
        <GamsgoPromoCode />
        <a href={subscriptionAffiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-5 py-4 text-center font-bold text-white hover:bg-blue-500">겜스고에서 {service || '구독 상품'} 가격 보기 ↗</a>
        <p className="mt-3 text-xs leading-6 text-slate-300">겜스고 첫 화면으로 이동합니다.{service ? ` 검색창에서 ‘${service}’ 상품을 찾아주세요.` : ' 원하는 서비스를 검색해 상품을 선택하세요.'}</p>
      </div>
    </div>
    <div className="border-t border-blue-100 bg-blue-50/50 p-6 md:p-9">
      <h3 className="text-xl font-bold text-gray-900">겜스고 이용 방법, 이 순서로 따라오세요</h3>
      <ol className="mt-5 grid gap-5 md:grid-cols-3">
        {[
          ['01', '서비스와 기간 고르기', `${service || '원하는 서비스'} 상품을 찾고 이용 기간과 계정 제공 방식을 선택하세요.`],
          ['02', '프로모션 코드 입력하기', `${gamsgoPromoCode}를 복사해 겜스고 결제 화면의 코드 입력란에 붙여넣고, 할인 반영 여부와 총액을 확인하세요.`],
          ['03', '주문 안내에 따라 이용하기', '구매 후 주문 화면의 계정 정보·초대·충전 안내를 확인하세요. 이용 시작 방법과 제공 시간은 상품마다 다릅니다.'],
        ].map(([number, title, text]) => <li key={number}><span className="text-sm font-extrabold text-blue-700">{number}</span><h4 className="mt-2 font-bold text-gray-900">{title}</h4><p className="mt-2 text-sm leading-7 text-gray-600">{text}</p></li>)}
      </ol>
      <p className="mt-5 text-sm leading-7 text-gray-600">가격을 비교할 때는 월 환산 금액과 실제 선결제 총액을 구분하고, 갱신·환불 조건도 함께 확인하세요.</p>
    </div>
    <p className="px-6 py-4 text-xs leading-6 text-gray-500 md:px-9">제휴 안내: 겜스고 링크를 통해 구매하면 쿠폰톡이 수수료를 받을 수 있습니다. 구매·이용 지원·환불은 판매처에서 진행됩니다.</p>
  </section>;
}
