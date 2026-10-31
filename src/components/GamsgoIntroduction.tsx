import { ArrowRight, Building2, CircleUserRound, Layers3, TicketPercent } from 'lucide-react';
import { gamsgoPromoCode } from '@/lib/gamsgo-promotion';
import GamsgoPromoCode from '@/components/GamsgoPromoCode';
import { subscriptionAffiliateUrl } from '@/lib/subscription-guides';

export default function GamsgoIntroduction({ service, slug }: { service?: string; slug?: string }) {
  const name = service || '영상·AI 서비스';
  const account = slug === 'chatgpt-discount' ? '개인형·공유형·충전형 상품별 선택'
    : slug === 'netflix-discount' ? '판매자별 계정·프로필 제공 상품'
    : slug === 'youtube-premium-cheap' ? '내 계정 충전 등 상품별 제공 방식'
    : '내 계정 적용·계정 제공 등 상품별 상이';
  const distinction = slug === 'chatgpt-discount' ? '챗GPT는 개인형과 공유형에 따라 대화 기록 접근과 계정 관리 권한이 달라집니다.'
    : slug === 'netflix-discount' ? '넷플릭스는 판매 상품별 프로필·기기·가구 이용 조건을 확인해야 합니다.'
    : '선택한 상품의 이용 기간·계정 권한·포함 기능을 같은 기준으로 비교하세요.';
  const rows = [
    ['구매하는 곳', `${service || '각 서비스'} 공식 사이트·앱`, '겜스고 또는 입점 판매자'],
    ['가격 기준', '공식 요금제·결제 주기에 따른 금액', '상품·기간·옵션별 판매가'],
    ['이용 계정', '직접 가입한 계정·선택한 공식 플랜', account],
    ['코드 혜택', '공식 프로모션 조건에 따름', `${gamsgoPromoCode} 입력 후 적용 확인`],
    ['이용 시작', '공식 가입·결제 안내에 따라 시작', '구매 후 계정·초대·충전 안내에 따라 시작'],
    ['결제·환불 문의', '서비스사 또는 결제 사업자', '겜스고·판매자의 지원 및 환불 기준'],
  ];
  return <section id="gamsgo" className="my-6 scroll-mt-28">
    <div className="mb-5 flex flex-wrap items-center gap-2 text-xs font-semibold text-blue-800">
      <span className="rounded-full bg-blue-100 px-3 py-2">영상 구독</span><span className="rounded-full bg-blue-100 px-3 py-2">AI 도구</span><span className="rounded-full bg-blue-100 px-3 py-2">소프트웨어</span>
      <span className="ml-1">구독 할인 상품을 한곳에서, GamsGo</span>
    </div>
    <h2 className="text-2xl font-extrabold tracking-tight text-gray-950 md:text-3xl">{service ? `${service}, 어디서 구독할까요?` : '공식 구독과 겜스고, 한눈에 비교'}</h2>
    <p className="mt-2 text-sm leading-6 text-gray-600">겜스고는 여러 서비스의 구독 상품을 판매하는 할인 플랫폼입니다. 구매 경로와 계정 제공 방식이 다릅니다.</p>
    <div className="mt-5 grid grid-cols-2 gap-3 md:gap-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-7">
        <Building2 aria-hidden="true" className="mb-3 h-7 w-7 text-slate-500" />
        <p className="text-xs font-semibold text-gray-500">서비스사에서 직접</p>
        <h3 className="mt-1 text-xl font-extrabold md:text-2xl">공식 구독</h3>
        <div className="my-5 flex flex-wrap items-center gap-2 text-sm font-bold"><span className="rounded-lg bg-gray-100 px-3 py-2">나</span><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="rounded-lg bg-gray-100 px-3 py-2">공식</span></div>
        <p className="font-bold text-gray-900">공식 요금제 선택</p><p className="mt-2 text-sm leading-6 text-gray-600">내 계정에서 플랜을 선택하고 직접 구독</p>
      </div>
      <div className="rounded-2xl border-2 border-blue-600 bg-blue-50 p-4 md:p-7">
        <TicketPercent aria-hidden="true" className="mb-3 h-7 w-7 text-blue-700" />
        <p className="text-xs font-semibold text-blue-700">구독 할인 상품 비교</p>
        <h3 className="mt-1 text-xl font-extrabold text-blue-950 md:text-2xl">겜스고 구매</h3>
        <div className="my-5 flex flex-wrap items-center gap-2 text-sm font-bold text-blue-900"><span className="rounded-lg bg-white px-3 py-2">나</span><ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /><span className="rounded-lg bg-white px-3 py-2">겜스고</span></div>
        <p className="font-bold text-blue-950">판매 상품·기간 선택</p><p className="mt-2 text-sm leading-6 text-blue-900">이용 방식과 가격을 비교하고 코드 적용</p>
      </div>
    </div>
    <div className="mt-4 flex items-start gap-3 rounded-xl bg-slate-900 p-4 text-white"><Layers3 aria-hidden="true" className="mt-1 h-5 w-5 shrink-0 text-blue-300"/><p className="text-sm leading-6"><strong>가격과 함께 달라지는 것은 ‘이용 조건’입니다.</strong><br />{distinction}</p></div>
    <div className="mt-6 overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <table className="w-full table-fixed text-left text-xs leading-6 md:text-sm">
        <caption className="sr-only">{name} 공식 구독과 겜스고 구매 차이</caption>
        <colgroup><col className="w-[22%]"/><col className="w-[39%]"/><col className="w-[39%]"/></colgroup>
        <thead><tr className="border-b"><th scope="col" className="p-3 md:p-4">비교 항목</th><th scope="col" className="bg-gray-50 p-3 md:p-4">공식 구독</th><th scope="col" className="bg-blue-50 p-3 text-blue-900 md:p-4">겜스고 구매</th></tr></thead>
        <tbody>{rows.map(([label, official, gamsgo]) => <tr key={label} className="border-b last:border-0"><th scope="row" className="break-words p-3 font-semibold md:p-4">{label}</th><td className="break-words p-3 text-gray-600 md:p-4">{official}</td><td className="break-words bg-blue-50/40 p-3 font-medium text-blue-950 md:p-4">{gamsgo}</td></tr>)}</tbody>
      </table>
    </div>
    <p className="mt-3 text-xs leading-6 text-gray-500">실제 절약액은 같은 기간·기능·계정 조건의 최종 결제액으로 비교하세요. 월 환산 금액은 실제 월 결제액과 다를 수 있습니다.</p>
    <div className="mt-6 grid items-center gap-5 rounded-2xl border border-blue-100 bg-white p-5 md:grid-cols-2 md:p-7">
      <div><p className="text-sm font-bold text-blue-700">겜스고에서 구매한다면</p><h3 className="mt-2 text-xl font-extrabold">결제 전, 프로모션 코드 챙기세요</h3><GamsgoPromoCode /></div>
      <div><a href={subscriptionAffiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-4 text-center font-bold text-white hover:bg-blue-800">{service || '구독 상품'} 겜스고 가격 보기 <ArrowRight aria-hidden="true" className="h-5 w-5 shrink-0"/></a><p className="mt-3 text-xs leading-6 text-gray-500">겜스고 첫 화면에서 {service ? `‘${service}’` : '원하는 서비스'} 검색 → 상품·기간 선택 → 코드 입력</p></div>
    </div>
    <details className="mt-4 rounded-xl border bg-white p-4"><summary className="flex cursor-pointer items-center gap-2 text-sm font-semibold"><CircleUserRound aria-hidden="true" className="h-5 w-5"/>처음 구매한 뒤에는 어떻게 이용하나요?</summary><p className="mt-3 text-sm leading-7 text-gray-600">결제 후 주문 화면의 안내를 따라주세요. 상품에 따라 계정 정보가 제공되거나, 초대를 수락하거나, 내 계정에 구독이 적용됩니다. 제공 시간과 갱신·환불 조건은 선택한 상품에서 확인할 수 있습니다.</p></details>
    <p className="mt-4 text-xs leading-6 text-gray-500">제휴 안내: 겜스고 링크를 통해 구매하면 쿠폰톡이 수수료를 받을 수 있습니다.</p>
  </section>;
}
