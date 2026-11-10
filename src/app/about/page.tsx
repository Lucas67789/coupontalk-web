export const metadata = { title: '쿠폰톡 소개 | 할인 정보 운영 안내', description: '쿠폰톡의 할인 정보 제공 방식과 제휴 링크, 이용 시 확인할 사항을 안내합니다.', alternates: { canonical: 'https://coupontalk.kr/about' } };
import Link from 'next/link';
import { Info, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
    const operator = process.env.OPERATOR_NAME;
    const email = process.env.CONTACT_EMAIL;
    return (
        <div className="container mx-auto max-w-4xl py-12">

            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                    쿠폰톡(coupontalk) <span className="text-blue-600">소개</span>
                </h1>
                <p className="text-xl text-gray-600">
                    온라인 쇼핑의 즐거움을 더하는 스마트한 선택.
                </p>
            </div>

            <div className="bg-blue-50 bg-opacity-50 rounded-3xl p-8 md:p-12 mb-16 border border-blue-100">
                <h2 className="text-2xl font-bold mb-4 text-blue-900 flex items-center gap-2">
                    <Info className="text-blue-600" /> 쿠폰톡은 어떤 곳인가요?
                </h2>
                <p className="text-gray-700 leading-relaxed text-lg mb-4">
                    쿠폰톡은 국내외 유명 온라인 쇼핑몰, 호텔 예약 사이트, 패션 플랫폼 등 다양한 제휴사의 <strong className="text-blue-700">할인 쿠폰과 프로모션 코드</strong>를 한 곳에 모아 제공하는 플랫폼입니다.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                    숨겨져 있는 시크릿 할인코드나 선착순 쿠폰 등 놓치기 쉬운 혜택을 모아 안내하여, 누구나 회원가입 없이 쉽게 이용할 수 있도록 돕습니다.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-center">우리의 핵심 가치</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">조건 확인</h3>
                    <p className="text-gray-600">
                        할인 조건과 유효기간을 함께 안내합니다. 최종 적용 여부는 쇼핑몰 결제 화면에서 확인해주세요.
                    </p>
                </div>

                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">갱신 기준 안내</h3>
                    <p className="text-gray-600">
                        안내된 기간과 조건을 기준으로 진행 중인 혜택과 종료된 행사를 구분합니다. 내용 수정일이 실제 결제 적용을 확인한 날짜를 뜻하지는 않습니다.
                    </p>
                </div>

                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartHandshake size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">제휴 관계 공개</h3>
                    <p className="text-gray-600">
                        제휴 링크를 통한 구매 등으로 수수료를 지급받습니다. 제휴 링크 자체가 할인 적용을 보장하지 않으며, 최종 조건과 금액은 판매처에서 확인해야 합니다.
                    </p>
                </div>

            </div>

            <section className="mb-12 space-y-6 rounded-2xl border p-6 leading-7" aria-labelledby="editorial-policy">
                <h2 id="editorial-policy" className="text-2xl font-bold">할인 정보의 출처·갱신·정정 안내</h2>
                <div><h3 className="font-bold">출처와 확인 범위</h3><p>할인 조건은 판매처의 공식 안내와 제휴 플랫폼 공지를 기준으로 안내합니다. 출처·확인 날짜·결제 테스트 여부는 개별 페이지에 명시된 범위로 읽어주세요. 별도 표시가 없다면 직접 구매하거나 결제 적용을 시험했다는 의미가 아닙니다.</p></div>
                <div><h3 className="font-bold">기간 종료와 조건 변경</h3><p>등록된 사용·예약 마감일이 지나거나 종료 표시가 있는 행사는 이전 기록으로 구분합니다. 예약 마감과 실제 이용 기간은 다를 수 있고, 예산 소진으로 안내된 날짜보다 일찍 끝날 수 있습니다. 종료 기록의 코드는 현재 사용할 수 있는 코드로 안내하지 않습니다.</p></div>
                <div><h3 className="font-bold">수정 요청에 필요한 정보</h3><p>잘못된 조건이나 종료된 혜택을 발견했다면 해당 페이지 주소, 잘못된 내용, 확인 날짜와 공식 공지 주소를 함께 알려주세요. 주문·결제·환불 처리는 구매한 판매처에 문의해야 합니다.</p><Link href="/contact" className="text-blue-700 underline">문의 창구와 수정 요청 안내</Link></div>
                <div><h3 className="font-bold">운영 정보</h3>{operator && <p>운영 주체: {operator}</p>}{email && <p>문의: <a href={`mailto:${email}`} className="text-blue-700 underline">{email}</a></p>}{(!operator || !email) && <p>공개 운영 정보와 문의 창구는 확인 중입니다. 확인되지 않은 이름이나 연락처는 기재하지 않습니다.</p>}</div>
            </section>

            <div className="text-center bg-gray-900 rounded-3xl p-12 text-white">
                <h2 className="text-3xl font-bold mb-4">지금 바로 할인을 경험하세요</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                    알리익스프레스 직구부터 아고다 호텔 예약, 쿠팡 로켓배송까지. 당신이 찾는 모든 할인이 이곳에 있습니다.
                </p>
                <Link href="/" className="btn-primary" style={{ backgroundColor: 'white', color: '#0f172a' }}>
                    할인코드 찾아보기
                </Link>
            </div>

        </div>
    );
}
