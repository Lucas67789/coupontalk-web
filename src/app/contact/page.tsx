export const metadata = { title: '제휴 및 문의 | 쿠폰톡' };
export default function ContactPage() {
    const email = process.env.CONTACT_EMAIL;
    return <article className="container mx-auto max-w-3xl px-6 py-12 prose">
        <h1>제휴 및 문의</h1>
        <p>제휴 제안이나 할인 정보 수정 요청 시 쇼핑몰 이름, 해당 쿠폰 페이지 주소와 요청 내용을 함께 알려주세요.</p>
        {email ? <p>문의: <a href={`mailto:${email}`}>{email}</a></p> : <p>온라인 문의 창구를 준비 중입니다. 주문·예약·결제 문의는 구매하신 쇼핑몰 고객센터를 이용해주세요.</p>}
        <p>비밀번호, 카드번호 등 민감한 정보는 보내지 마세요.</p>
    </article>;
}
