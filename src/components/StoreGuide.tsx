export default function StoreGuide({ name, travel, storeId }: { name: string; travel: boolean; storeId?: string }) {
    const specific = storeId === 'klook' ? [
        ['호텔과 액티비티 구분', '일본 호텔 전용 코드는 호텔 예약에, 투어·티켓 혜택은 명시된 상품에 사용하세요. 같은 클룩 코드라도 대상이 다릅니다.'],
        ['예약일과 이용일 구분', '예약 마감일 전에 결제해야 하는지, 투숙·입장 가능한 날짜가 별도로 있는지 확인하세요.'],
    ] : storeId === 'lenovo' ? [
        ['제품명보다 정확한 모델번호', 'ThinkPad·Legion·IdeaPad·Yoga 제품군이 같아도 모델번호, CPU·메모리·저장장치 옵션에 따라 가격과 적용 조건이 다릅니다.'],
        ['옵션을 맞춰 결제액 비교', '운영체제 포함 여부, 배송 예정일, 보증 옵션과 장바구니 할인액을 함께 확인하세요. 아래 상품명에서 모델번호를 확인할 수 있습니다.'],
    ] : [];
    return <div className="p-6 md:p-10 space-y-10 border-b border-gray-200">
        <section id="choose-offer" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-5">{name} 할인 혜택 선택하기</h2>
            <div className="grid sm:grid-cols-2 gap-4">
                {[
                    ...specific,
                    ['대상 확인', travel ? '국가·지역·숙소 또는 상품별 적용 범위를 확인하세요. 예약일과 실제 이용일의 조건을 구분해야 합니다.' : '상품명·모델번호·옵션이 할인 대상과 일치하는지 확인하세요. 일부 브랜드나 특가 상품은 제외될 수 있습니다.'],
                    ['고객 조건', '신규·기존 고객, 회원 등급 등 쿠폰에 명시된 자격을 확인하세요. 신규 고객 전용 혜택을 모든 고객이 쓸 수 있는 것은 아닙니다.'],
                    ['할인 방식', '코드형은 결제 단계에 입력하고, 링크형은 해당 프로모션 페이지에서 조건을 확인하세요. 결제수단 할인은 지정된 수단이 필요합니다.'],
                    ['최종 금액 비교', '최소 결제 금액·최대 할인액·중복 적용 조건을 비교하세요. 할인율만으로 선택하지 말고 추가 비용을 포함한 결제 금액을 확인하세요.'],
                ].map(([title, text]) => <div key={title} className="rounded-xl border border-gray-200 p-5"><h3 className="font-bold mb-2">{title}</h3><p className="text-sm leading-7 text-gray-600">{text}</p></div>)}
            </div>
        </section>
        <section id="how-to-use" className="scroll-mt-24">
            <h2 className="text-2xl font-bold mb-5">{name} 할인코드 사용 방법</h2>
            <ol className="space-y-4 list-decimal pl-5 text-gray-700 leading-7">
                <li>위 쿠폰에서 유효기간과 대상 조건을 확인하고 상세 페이지를 엽니다.</li>
                <li>{travel ? '이용 날짜·인원·상품을 선택하고 취소 조건을 확인합니다.' : '대상 상품의 모델번호·색상·용량 등 옵션과 수량을 확인합니다.'}</li>
                <li>코드를 입력하거나 전용 링크의 안내에 따라 혜택을 적용합니다.</li>
                <li>할인액과 추가 비용, 취소·환불 조건을 확인한 후 결제합니다.</li>
            </ol>
            <p className="mt-5 text-sm leading-7 text-gray-500">쿠폰별 상세 조건과 연결된 프로모션 페이지의 안내를 우선해 주세요. 목록은 등록된 마감일을 기준으로 분류하며 실시간 잔여 수량이나 적용 성공을 보장하지 않습니다.</p>
        </section>
    </div>;
}
