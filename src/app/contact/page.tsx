export const metadata = { title: '제휴 및 문의 | 쿠폰톡', description: '쿠폰톡 제휴 제안과 할인 정보 수정 요청에 필요한 내용을 안내합니다.', alternates: { canonical: 'https://coupontalk.kr/contact' } };
export default function ContactPage() {
    const email = process.env.CONTACT_EMAIL;
    const operator = process.env.OPERATOR_NAME;
    return <article className="container mx-auto max-w-3xl px-6 py-12 prose">
        <h1>제휴 및 문의</h1>
        {operator && <p>운영 주체: {operator}</p>}
        <p>제휴 제안이나 할인 정보 수정 요청 시 쇼핑몰 이름, 해당 쿠폰 페이지 주소와 요청 내용을 함께 알려주세요.</p>
        {email ? <p>문의: <a href={`mailto:${email}`}>{email}</a></p> : <p>온라인 문의 창구를 준비 중입니다. 주문·예약·결제 문의는 구매하신 쇼핑몰 고객센터를 이용해주세요.</p>}
        <h2>할인 정보 수정 요청</h2>
        <ul><li>쇼핑몰 이름과 쿠폰톡 페이지 주소</li><li>잘못된 조건 또는 종료 여부와 확인 날짜</li><li>확인할 수 있는 공식 공지 주소 또는 오류 안내 문구</li></ul>
        <p>쿠폰 코드가 적용되지 않았다면 대상 상품, 최소 구매 금액, 결제수단과 행사 기간을 먼저 확인해주세요. 개인정보가 포함된 주문 내역 전체를 보내실 필요는 없습니다.</p>
        <p>비밀번호, 카드번호 등 민감한 정보는 보내지 마세요.</p>
    </article>;
}
