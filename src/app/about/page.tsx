import { Info, ShieldCheck, Zap, HeartHandshake } from 'lucide-react';

export default function AboutPage() {
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
                    쿠폰톡은 국내외 유명 온라인 쇼핑몰, 호텔 예약 사이트, 패션 플랫폼 등 다양한 제휴사의 <strong className="text-blue-700">검증된 할인 쿠폰과 프로모션 코드</strong>를 한 곳에 모아 제공하는 플랫폼입니다.
                </p>
                <p className="text-gray-700 leading-relaxed text-lg">
                    숨겨져 있는 시크릿 할인코드나 선착순 쿠폰 등 놓치기 쉬운 혜택을 매일 업데이트하여, 누구나 회원가입 없이 쉽게 이용할 수 있도록 돕습니다.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-8 text-center">우리의 핵심 가치</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">

                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">100% 검증</h3>
                    <p className="text-gray-600">
                        5년 이상의 노하우로 모든 코드는 운영진이 직접 테스트한 뒤에만 업로드됩니다. 작동하지 않는 코드는 즉각 삭제합니다.
                    </p>
                </div>

                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Zap size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">빠른 업데이트</h3>
                    <p className="text-gray-600">
                        인기 스토어의 프로모션이 시작되는 즉시 가장 빠르게 할인 정보를 캐치하여 전달합니다. 매일 오전 새롭게 갱신됩니다.
                    </p>
                </div>

                <div className="card p-8 text-center">
                    <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <HeartHandshake size={32} />
                    </div>
                    <h3 className="text-xl font-bold mb-3">광고 없는 투명함</h3>
                    <p className="text-gray-600">
                        불필요한 과장 광고나 거짓 정보를 배제합니다. 사용자가 안전하게 쇼핑 혜택만 누릴 수 있도록 투명하게 운영합니다.
                    </p>
                </div>

            </div>

            <div className="text-center bg-gray-900 rounded-3xl p-12 text-white">
                <h2 className="text-3xl font-bold mb-4">지금 바로 할인을 경험하세요</h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                    알리익스프레스 직구부터 아고다 호텔 예약, 쿠팡 로켓배송까지. 당신이 찾는 모든 할인이 이곳에 있습니다.
                </p>
                <a href="/" className="btn-primary" style={{ backgroundColor: 'white', color: '#0f172a' }}>
                    할인코드 찾아보기
                </a>
            </div>

        </div>
    );
}
