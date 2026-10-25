export const agodaGuideUpdatedAt = '2026-10-25T00:00:00+09:00';

export const agodaFaqs = [
    { question: '아고다 할인코드는 어디에 입력하나요?', answer: '숙소와 객실을 선택한 뒤 예약·결제 화면에서 프로모션 코드 입력란을 확인하세요. 코드를 입력하고 결제를 완료하기 전에 요금 내역에 할인액이 반영됐는지 확인합니다. 전용 링크로 적용되는 혜택은 코드 입력이 필요하지 않을 수 있습니다.' },
    { question: '국내 호텔과 해외 호텔에 같은 쿠폰을 쓸 수 있나요?', answer: '쿠폰마다 대상 지역과 숙소가 다릅니다. 국내 전용, 해외 전용, 전 지역 혜택을 구분하고 해당 객실이 프로모션 대상인지 확인하세요. 일본·베트남 등 여행지가 대상에 포함되더라도 모든 숙소에 적용되는 것은 아닙니다.' },
    { question: '신규 고객 할인코드를 기존 고객도 쓸 수 있나요?', answer: '신규 고객 한정 혜택은 프로모션에서 정한 신규 고객 조건을 충족해야 합니다. 기존 예약 이력이 있다면 일반 고객 대상 코드나 이용 가능한 결제수단 혜택을 비교하세요.' },
    { question: '네이버페이·토스페이·카드 할인과 쿠폰을 중복 적용할 수 있나요?', answer: '중복 적용 여부는 각 프로모션 약관에 따라 다릅니다. 할인율을 단순히 더하지 말고 전용 링크, 대상 결제수단, 최대 할인액을 확인한 뒤 같은 객실의 최종 결제 금액을 비교하세요.' },
    { question: '쿠폰이 적용되지 않는 이유는 무엇인가요?', answer: '예약 마감일, 숙박 가능일, 대상 국가·객실, 최소 예약 금액, 최대 할인액, 신규 고객 조건을 차례로 확인하세요. 앱·웹 제한이나 전용 링크 접속 조건이 있을 수 있습니다. 조건을 충족해도 적용되지 않으면 아고다 고객센터에서 확인하세요.' },
    { question: '숙박 가능일이 남았는데 왜 종료된 쿠폰인가요?', answer: '예약 기간과 숙박 기간은 서로 다릅니다. 예를 들어 4월 30일까지 예약하고 다음 해 3월까지 숙박하는 혜택은 5월부터 새 예약에 사용할 수 없습니다. 쿠폰톡은 예약 마감일을 우선하여 종료 여부를 표시합니다.' },
];

export default function AgodaGuide() {
    return (
        <div className="p-6 md:p-10 space-y-10 border-b border-gray-200">
            <section id="choose-offer" className="scroll-mt-24">
                <p className="text-sm font-semibold text-blue-600 mb-2">내 예약에 맞는 혜택 찾기</p>
                <h2 className="text-2xl font-bold text-gray-900 mb-5">아고다 할인코드, 어떤 혜택을 선택할까요?</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                    {[
                        ['처음 예약하는 고객', '신규 고객 전용 코드의 예약 이력 조건과 할인 한도를 먼저 확인하세요.'],
                        ['기존 고객 · 국내 숙소', '신규 고객 한정 코드는 제외하고 국내 숙소에 적용되는 혜택을 비교하세요.'],
                        ['일본·베트남 등 해외 숙소', '해외 대상 코드의 국가·숙소 제한과 예약 기간, 숙박 기간을 함께 확인하세요.'],
                        ['네이버페이·토스페이·카드 결제', '보유한 결제수단의 전용 링크와 할인 한도를 확인하고 최종 결제액을 비교하세요.'],
                    ].map(([title, text]) => <div key={title} className="rounded-xl border border-gray-200 p-5"><h3 className="font-bold text-gray-900 mb-2">{title}</h3><p className="text-sm leading-7 text-gray-600">{text}</p></div>)}
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-600">할인율이 높아도 최대 할인액이나 대상 객실에 따라 결과가 달라집니다. 같은 날짜·객실·인원·취소 조건에서 세금과 수수료를 포함한 총액을 비교하세요.</p>
            </section>
            <section aria-labelledby="discount-example">
                <h2 id="discount-example" className="text-2xl font-bold text-gray-900 mb-4">12%와 11% 할인, 예약 금액에 따라 비교하는 방법</h2>
                <p className="text-sm leading-7 text-gray-600 mb-4">할인율보다 최대 할인액이 중요할 수 있습니다. 아래는 12%·최대 $30과 11%·최대 $100 조건을 비교한 계산 예시이며, 현재 적용 가능한 쿠폰을 보장하는 표가 아닙니다. 할인 대상 금액과 통화를 동일하게 가정하고 세금·수수료, 환율, 추가 결제 혜택은 제외했습니다.</p>
                <div className="overflow-x-auto rounded-xl border border-gray-200">
                    <table className="w-full text-sm text-left">
                        <caption className="sr-only">동일한 할인 대상 금액에서 최대 할인액을 반영한 예시</caption>
                        <thead className="bg-slate-50"><tr><th scope="col" className="p-4">할인 대상 금액</th><th scope="col" className="p-4">12% · 최대 $30</th><th scope="col" className="p-4">11% · 최대 $100</th></tr></thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr><th scope="row" className="p-4">$100</th><td className="p-4">$12 할인</td><td className="p-4">$11 할인</td></tr>
                            <tr><th scope="row" className="p-4">$300</th><td className="p-4">$30 할인</td><td className="p-4">$33 할인</td></tr>
                            <tr><th scope="row" className="p-4">$500</th><td className="p-4">$30 할인</td><td className="p-4">$55 할인</td></tr>
                        </tbody>
                    </table>
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-600">각 쿠폰의 대상 고객·국가·객실·결제수단 조건을 먼저 확인하세요. 전용 페이지별 객실 가격이 다르면 할인액이 더 커도 최종 결제액은 더 높을 수 있습니다.</p>
            </section>
            <section id="how-to-use" className="scroll-mt-24">
                <h2 className="text-2xl font-bold text-gray-900 mb-5">아고다 할인코드 적용 방법</h2>
                <ol className="space-y-4">
                    {[
                        ['조건 확인 후 혜택 선택', '위 목록에서 예약 기간과 대상 조건을 확인하세요. 코드형은 코드를 복사하고, 전용 링크형은 해당 혜택의 링크로 이동합니다.'],
                        ['여행 날짜와 객실 선택', '목적지·체크인·체크아웃 날짜·인원을 입력하고 프로모션 대상 숙소와 객실을 선택하세요.'],
                        ['코드 또는 결제수단 적용', '예약·결제 화면에서 코드를 입력하거나 혜택에 지정된 결제수단을 선택하세요. 앱·웹 및 전용 링크 조건도 확인합니다.'],
                        ['할인 내역 확인 후 예약', '결제를 완료하기 전에 할인액, 세금·수수료를 포함한 총액, 취소·환불 조건을 확인하세요.'],
                    ].map(([title, text], index) => <li key={title} className="flex gap-4"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 font-bold text-blue-700">{index + 1}</span><div><h3 className="font-bold text-gray-900">{title}</h3><p className="mt-1 text-sm leading-7 text-gray-600">{text}</p></div></li>)}
                </ol>
            </section>
            <section id="offer-terms" className="scroll-mt-24 rounded-xl bg-slate-50 p-5">
                <h2 className="text-xl font-bold text-gray-900 mb-3">예약 전 확인할 조건과 공식 안내</h2>
                <p className="text-sm leading-7 text-gray-600">목록은 등록된 예약 마감일을 기준으로 분류합니다. 실시간 잔여 수량이나 모든 객실의 적용 성공을 보장하는 표시는 아닙니다. 예약·숙박 기간과 대상 고객을 확인하고, 세부 조건은 각 혜택의 프로모션 페이지를 우선해 주세요.</p>
                <div className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-blue-700">
                    <a href="https://www.agoda.com/ko-kr/deals" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">아고다 공식 할인 안내 ↗</a>
                    <a href="https://www.agoda.com/info/termsofuse.html" target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">아고다 이용약관·프로모션 조건 ↗</a>
                </div>
                <p className="mt-3 text-xs text-gray-500">공식 안내 확인: 2026. 10. 14. · 개별 할인율은 각 프로모션 조건을 확인하세요.</p>
            </section>
        </div>
    );
}
