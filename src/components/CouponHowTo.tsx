import { Copy, ExternalLink, ShoppingBag, BadgeCheck } from 'lucide-react';

export default function CouponHowTo({ storeName, hasCode }: { storeName: string; hasCode: boolean }) {
    const steps = hasCode ? [
        { title: '코드 복사·이동', text: '쿠폰 버튼을 누르면 코드가 복사되고 판매처가 열립니다.', icon: Copy },
        { title: '상품·예약 선택', text: `${storeName}에서 쿠폰 대상 상품이나 예약을 선택하세요.`, icon: ShoppingBag },
        { title: '코드 입력·적용', text: '결제 화면의 쿠폰·프로모션 코드 칸에 붙여넣고 적용하세요.', icon: Copy },
        { title: '할인 확인 후 결제', text: '최소 금액과 대상 조건을 확인하고 최종 할인액을 확인하세요.', icon: BadgeCheck },
    ] : [
        { title: '혜택 페이지 열기', text: '할인 페이지로 이동 버튼을 누르세요. 별도 코드는 없습니다.', icon: ExternalLink },
        { title: '대상 상품 선택', text: '이동한 페이지에서 행사 대상 상품·예약을 선택하세요.', icon: ShoppingBag },
        { title: '적용 조건 확인', text: '회원·결제수단·예약 기간 등 해당 혜택의 조건을 확인하세요.', icon: BadgeCheck },
        { title: '최종 금액 확인', text: '할인이 반영됐는지 확인한 뒤 결제를 진행하세요.', icon: BadgeCheck },
    ];
    return <section aria-label={`${storeName} 쿠폰 사용 순서`} className="mt-5 rounded-2xl bg-slate-50 p-4 sm:p-5">
        <h2 className="text-lg font-bold text-slate-900">{hasCode ? '복사한 할인코드, 이렇게 쓰세요' : '코드 없이 혜택 받는 방법'}</h2>
        <ol className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">{steps.map(({title,text,icon:Icon},i)=><li key={title} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="mb-3 flex items-center justify-between"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">{i+1}</span><Icon size={22} className="text-blue-600" aria-hidden="true" /></div>
            <h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-5 text-slate-600">{text}</p>
        </li>)}</ol>
        {hasCode && <p className="mt-3 text-xs text-slate-600">복사만으로 할인되지는 않습니다. 자동 복사가 안 되면 표시된 코드를 직접 입력하세요.</p>}
    </section>;
}
