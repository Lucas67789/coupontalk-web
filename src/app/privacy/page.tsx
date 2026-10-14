export const metadata = { title: '개인정보처리방침 | 쿠폰톡', description: '쿠폰톡의 개인정보 처리 및 이용자 권리 안내입니다.', alternates: { canonical: 'https://coupontalk.kr/privacy' }, robots: { index: false, follow: true } };
export default function PrivacyPage() {
    const email = process.env.CONTACT_EMAIL;
    const operator = process.env.OPERATOR_NAME;
    return <article className="container mx-auto max-w-3xl px-6 py-12 prose">
        <h1>개인정보 처리 안내</h1>
        <p>쿠폰톡의 일반 방문자는 회원가입 없이 할인 정보를 열람할 수 있습니다.</p>
        <h2>방문 및 클릭 통계</h2><p>방문 경로, 방문 세션 식별자, 브라우저 정보, 유입 페이지 및 할인 링크 클릭 내역을 서비스 이용 통계에 사용합니다. 일반 방문자에게 이름, 결제정보 또는 비밀번호 입력을 요청하지 않습니다.</p>
        <h2>외부 쇼핑몰</h2><p>할인 링크를 누르면 외부 쇼핑몰로 이동합니다. 이동 후 수집되는 정보는 해당 쇼핑몰의 개인정보처리방침을 확인해주세요.</p>
        <h2>문의</h2>
        {operator && email ? <p>{operator} / <a href={`mailto:${email}`}>{email}</a></p> : <p>운영자 및 개인정보 문의 연락처를 확인 중입니다.</p>}
        <p>보관기간과 처리 위탁 등 상세 운영사항은 확인 후 이 페이지에 반영할 예정입니다.</p>
    </article>;
}
