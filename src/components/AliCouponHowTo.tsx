import { Copy, ShoppingBag, ClipboardPaste, BadgeCheck, ArrowRight } from 'lucide-react';

export default function AliCouponHowTo({ code = 'LTIK04', compact = false }: { code?: string; compact?: boolean }) {
  const steps = [
    { title: '쿠폰 복사', text: '구매 금액에 맞는 쿠폰 버튼을 누르세요.', icon: Copy },
    { title: '상품 선택', text: '새로 열린 알리에서 대상 상품을 담으세요.', icon: ShoppingBag },
    { title: '코드 붙여넣기', text: '주문·결제 화면의 프로모션 코드 칸에 입력하세요.', icon: ClipboardPaste },
    { title: '할인 확인', text: '코드를 적용하고 할인액을 확인한 뒤 결제하세요.', icon: BadgeCheck },
  ];
  return <section aria-label="알리 할인코드 적용 방법" className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-6">
    <h2 className="text-xl font-extrabold text-slate-900">알리 할인코드는 어디에 입력하나요?</h2>
    <ol className={`mt-4 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 lg:grid-cols-4'}`}>
      {steps.map(({title,text,icon:Icon},i)=><li key={title} className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">{i+1}</span><Icon size={25} className="text-red-500" aria-hidden="true" /></div>
        <h3 className="font-bold text-slate-900">{title}</h3><p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
      </li>)}
    </ol>
    {!compact && <figure className="mt-4 rounded-xl border-2 border-orange-200 bg-white p-4 sm:p-5">
      <figcaption className="mb-3 flex flex-wrap items-center gap-2 text-sm font-bold text-slate-900">결제창에서 찾을 곳 <ArrowRight size={16} /><span className="text-red-600">프로모션 코드</span><span className="text-xs font-normal text-slate-500">입력 위치 안내용 예시</span></figcaption>
      <div className="flex items-center gap-2 rounded-lg border border-slate-300 p-2"><span className="min-w-0 flex-1 break-all px-2 font-mono text-lg font-bold">{code}</span><span className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-bold text-white">적용</span></div>
      <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-green-700"><BadgeCheck size={18} className="shrink-0" />할인 금액이 반영됐는지 확인 → 결제</p>
      <p className="mt-2 text-xs leading-5 text-slate-500">실제 화면은 앱·웹에 따라 다를 수 있습니다. 복사만으로 할인이 자동 적용되지는 않습니다.</p>
    </figure>}
    <p className="mt-3 text-xs leading-5 text-slate-600">적용되지 않나요? 최소 구매 금액·행사 기간·제외 상품을 확인하세요. 복사가 안 되면 카드의 코드를 직접 입력하세요.</p>
  </section>;
}
