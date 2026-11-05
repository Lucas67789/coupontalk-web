const cardSource = 'https://www.hyundaicard.com/cpb/ev/CPBEV0101_06.hc?bnftWebEvntCd=8I7843';
const benefitSource = 'https://www.socar.kr/benefit';
const naverSource = 'https://help.naver.com/service/23168/contents/24145?lang=ko&osType=COMMONOS';

export default function SocarBenefits() {
    const cardEnded = Date.now() >= Date.parse('2026-12-02T00:00:00+09:00');
    const seasonalEnded = Date.now() >= Date.parse('2027-01-01T00:00:00+09:00');
    const offers = [
        { label: '지역 제휴 · 4시간 이상', title: '김해시·양산시 제휴 10%', text: '각 지역 제휴 쿠폰은 4시간 이상 대여 조건입니다. 대상 계정·쏘카존·차량과 쿠폰 발급 방법은 앱에서 확인하세요.', period: '2026.10.07~12.31 23:00', ended: Date.now() >= Date.parse('2026-12-31T23:00:00+09:00') },
        { label: '결제수단 · 포인트 적립', title: '토스포인트 3,000원', text: '토스페이 결제 행사. 즉시 요금 할인이 아닌 포인트 적립입니다. 최소 결제액·횟수·지급일은 앱 이벤트에서 확인하세요.', period: '2026.09.30~12.31', ended: seasonalEnded },
        { label: '초대 쿠폰', title: '친구 초대 10,000원 쿠폰', text: '공식 기본 혜택에 안내된 쿠폰입니다. 초대하는 사람·초대받는 사람의 지급 조건과 사용기한은 앱에서 확인하세요.', period: '종료일 별도 표기 없음', ended: false },
        { label: '이용 장소 할인', title: '신규 쏘카존 15%', text: '신규 쏘카존 대상 할인입니다. 전국 모든 장소에 적용되는 혜택이 아니므로 예약할 쏘카존과 차량 조건을 확인하세요.', period: '공식 상시 혜택 안내', ended: false },
        { label: '배달 서비스', title: '첫 쏘카배달 무료', text: '첫 배달 대상 혜택입니다. 차량 대여요금 전체가 무료라는 뜻은 아닙니다. 대상 지역·최소 대여시간 등은 앱에서 확인하세요.', period: '2026.03.31~12.31', ended: seasonalEnded },
    ];
    return <section id="socar-benefits" className="scroll-mt-24 border-b bg-slate-50 p-5 md:p-8">
        <p className="text-xs font-bold tracking-wide text-blue-700">2026년 11월 5일 공식 안내 확인</p>
        <h2 className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">쏘카 카드 할인·쿠폰 한눈에 비교</h2>
        <p className="mt-3 text-sm leading-7 text-slate-600">카드 보유 여부 → 쿠폰 대상 → 예약 채널 순서로 비교하세요. 즉시 할인과 나중에 받는 크레딧·포인트는 구분해야 합니다.</p>
        <nav aria-label="쏘카 할인 목차" className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
            {[['#socar-card','카드 할인'],['#socar-other','쿠폰·결제 혜택'],['#socar-booking','예약 방식 비교'],['#socar-questions','중복 할인·총비용']].map(([href,label])=><a key={href} href={href} className="rounded-full border bg-white px-4 py-3 text-blue-800">{label}</a>)}
        </nav>
        <article id="socar-card" className="mt-6 scroll-mt-24 rounded-2xl border border-blue-200 bg-white p-5 md:p-7">
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-900">쏘카카드 보유자 · 조건 충족 시</span><span className="text-xs text-slate-500">{cardEnded ? '안내 기간 종료 · 최신 행사 확인' : '2026.11.02~12.01'}</span></div>
            <h3 className="mt-4 text-xl font-bold">쏘카카드 카셰어링 대여요금</h3>
            <p className="mt-2 text-3xl font-extrabold text-blue-800 md:text-4xl">최대 60,000원 즉시 할인</p>
            <dl className="mt-5 grid gap-4 text-sm leading-7 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-4"><dt className="font-bold">누가 받을 수 있나요?</dt><dd>참여월 직전 6개월 쏘카카드 결제 이력이 없는 기존 보유자. 11월 참여자는 5월 1일~10월 31일 이력을 확인합니다. 과거 즉시 할인 참여자는 제외됩니다.</dd></div>
                <div className="rounded-xl bg-slate-50 p-4"><dt className="font-bold">어떻게 결제하나요?</dt><dd>쏘카 앱에서 해당 카드로 대여요금 첫 결제 시 적용합니다. 네이버페이를 거친 결제는 제외되며, 남은 금액도 쏘카카드로 결제해야 합니다.</dd></div>
                <div className="rounded-xl bg-slate-50 p-4"><dt className="font-bold">쿠폰과 같이 쓸 수 있나요?</dt><dd>대여요금 쿠폰과 중복 가능합니다. 쿠폰·크레딧 적용 후 금액에서 최대 6만원까지이며, 결제액보다 더 할인되지는 않습니다. 쏘카구독 첫 결제 혜택과는 중복 불가입니다.</dd></div>
                <div className="rounded-xl bg-slate-50 p-4"><dt className="font-bold">할인에서 빠지는 비용</dt><dd>주행요금·면책상품요금·기업 프로필 예약은 제외됩니다. 대여요금 할인만으로 예약 총비용이 0원이 되는 것은 아닙니다.</dd></div>
            </dl>
            <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm leading-7 text-amber-950">본인 최초 1회이며, 혜택 제공월을 포함한 12개월 내 다른 현대카드 이벤트 수혜 이력에 따른 제외 조건이 있습니다. 혜택을 받은 달부터 13개월 내 해지·탈회하면 혜택이 환수될 수 있습니다. 연회비는 국내전용·Visa 모두 1만원입니다.</p>
            <details className="mt-4 rounded-xl border p-4"><summary className="cursor-pointer font-bold">‘최대 10% 크레딧’은 즉시 할인과 다릅니다</summary><p className="mt-3 text-sm leading-7">공식 안내는 카드 기본 1%·추가 최대 2%, 프로모션 최대 2%, 앱 이용회원 5% 적립을 구분합니다. 당월 30만원 이상 이용 등 실적 조건과 추가·프로모션 적립 대상 업종 합산 월 이용금액 30만원 한도가 있습니다. 앱 내 해당 카드 결제가 기준이며 각 적립의 인정 금액·지급 시점은 다릅니다. 앱 이용회원 적립분은 90일 유효하므로 현금 할인율처럼 합산하지 마세요.</p></details>
            <a href={cardSource} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex min-h-11 items-center font-bold text-blue-800 underline underline-offset-4">현대카드 공식 대상·제외 조건 확인 ↗</a>
        </article>
        <section id="socar-other" className="mt-8 scroll-mt-24"><h3 className="text-xl font-bold">카드 외에 확인할 할인·적립 혜택</h3><div className="mt-4 grid gap-4 sm:grid-cols-2">{offers.map(o=><article key={o.title} className="rounded-2xl border bg-white p-5"><p className="text-xs font-bold text-blue-700">{o.label}</p><h4 className="mt-2 text-xl font-bold">{o.title}</h4><p className="mt-3 text-sm leading-7 text-slate-600">{o.text}</p><p className="mt-3 text-xs font-semibold text-slate-500">{o.ended ? '안내 기간 종료 · 최신 행사 확인' : o.period}</p></article>)}</div><a href={benefitSource} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center text-sm font-bold text-blue-800 underline">쏘카 공식 혜택 · 세부 조건은 앱에서 확인 ↗</a></section>
        <section id="socar-booking" className="mt-8 scroll-mt-24"><h3 className="text-xl font-bold">오늘 예약·미리 예약·멤버십 중 무엇이 맞을까요?</h3>
            <div className="mt-4 space-y-4">
                <article className="rounded-2xl border bg-white p-5"><h4 className="font-bold">오늘 필요하다면: 당일최저가존·특가존</h4><p className="mt-2 text-sm leading-7 text-slate-600">당일최저가존은 당일 대여 후 다음 날 오전 8시 이내 반납 조건을 확인하세요. 특가존 쿠폰은 해당 쏘카존 차량 예약용이며 부름 예약에는 사용할 수 없습니다. 쿠폰 혜택과 제외 차종은 매월 달라질 수 있습니다.</p><a href="https://help.socar.kr/hc/ko/articles/46851279399833" target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-blue-800 underline">특별 쏘카존 공식 안내 ↗</a></article>
                <article className="rounded-2xl border bg-white p-5"><h4 className="font-bold">일정이 정해졌다면: 장기 대여·얼리버드</h4><p className="mt-2 text-sm leading-7 text-slate-600">공식 혜택 FAQ는 장기 대여와 2주 이상 미리 예약하는 얼리버드 할인을 안내합니다. 고정 할인율을 가정하지 말고 같은 차량·시간의 예약 금액과 취소 조건을 비교하세요.</p></article>
                <article className="rounded-2xl border border-emerald-200 bg-white p-5"><p className="text-xs font-bold text-emerald-700">네이버예약 전용 · 앱 제휴 링크와 다른 예약 경로</p><h4 className="mt-2 text-xl font-bold">네이버플러스 멤버십 대여요금 5%</h4><p className="mt-3 text-sm leading-7 text-slate-600">네이버예약에서 쏘카 카셰어링을 예약하는 멤버십 회원 대상이며 이용 횟수 제한은 없습니다. 제주지역·연장대여요금·면책상품요금·주행요금은 제외됩니다. 쏘카 앱 카드 혜택과 동시에 적용된다고 가정하지 마세요.</p><a href={naverSource} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex min-h-11 items-center text-sm font-bold text-emerald-800 underline">네이버 멤버십 공식 안내·예약 경로 확인 ↗</a></article>
            </div>
        </section>
        <section id="socar-questions" className="mt-8 scroll-mt-24 rounded-2xl bg-slate-900 p-5 text-white md:p-7"><h3 className="text-xl font-bold">쏘카 할인, 최종 금액은 이렇게 비교하세요</h3><p className="mt-3 text-lg font-bold leading-8">할인 후 대여요금 + 보장상품 요금 + 예상 주행요금 + 배달·통행 등 추가 비용</p><p className="mt-3 text-sm leading-7 text-slate-200">카드 즉시 할인과 쿠폰은 공식적으로 허용된 조합만 적용하세요. 토스포인트나 크레딧은 나중에 지급되는 혜택이므로 오늘 결제액에서 미리 빼지 않습니다. 유료 멤버십은 회비·갱신 조건·실제 이용 횟수까지 비교하고, 과거 패스포트 안내를 현재 신규 가입 혜택으로 판단하지 마세요.</p></section>
    </section>;
}
