import Link from 'next/link';
import type { CouponRow } from '@/lib/models';
import { couponStatus } from '@/lib/utils';

export const travelGuideUpdatedAt = '2026-11-03T00:00:00+09:00';
export const travelStoreIntros: Record<string, string> = {
    usimsa: '유심사 할인쿠폰은 여행 국가·사용일수·데이터 용량을 고른 뒤 적용하세요. eSIM 지원 기기, 개통 시작 기준과 구매 후 유효기간을 함께 확인하세요.',
    klook: '렌터카·일본 호텔·투어와 입장권은 적용되는 쿠폰이 다릅니다. 예약할 상품을 먼저 고른 뒤 최소 결제금액, 할인 한도와 이용일을 확인하세요.',
    hotelskr: '호텔스닷컴 할인코드를 복사하고 대상 숙소의 결제 화면에서 적용하세요. 코드별 할인율·한도와 기획전 요금을 비교하고, 예약 마감일·투숙 가능일·취소 조건을 함께 확인하세요.',
};

export default function TravelOfferGuide({ storeId, offers }: { storeId: string; offers: CouponRow[] }) {
    if (!travelStoreIntros[storeId]) return null;
    const groups = storeId === 'klook'
        ? [
            { title: '렌터카 할인', match: /렌터카/, tip: '최소 주문 금액·최대 할인액과 함께 보험, 보증금, 인수·반납 조건을 확인하세요.' },
            { title: '일본 호텔·숙소 할인', match: /호텔|숙소/, tip: '일본 호텔 전용 여부와 예약일·체크인 조건을 확인하세요. 렌터카 코드를 호텔에 사용할 수는 없습니다.' },
            { title: '투어·입장권 및 일반 쿠폰', match: /^(?!.*(?:렌터카|호텔|숙소)).*$/, tip: '앱 전용·최소 결제금액·제외 상품을 확인하세요. 테마파크 입장권은 상품별 적용 여부가 다를 수 있습니다.' },
        ]
        : storeId === 'usimsa' ? [
            { title: '유심사 eSIM 할인쿠폰', match: /./, tip: '일본·베트남 등 목적지와 경유 국가가 상품의 지원 지역에 포함되는지 확인하세요. 여러 나라를 여행한다면 국가별 상품과 다국가 상품의 총액을 비교하세요.' },
        ] : [
            { title: '호텔 할인코드 비교', match: /^(?!.*(?:메가|기획전)).*$/, tip: '할인율뿐 아니라 대상 숙소·최대 할인액·결제 통화를 비교하세요. 모든 호텔과 요금에 적용되는 것은 아닙니다.' },
            { title: '호텔 기획전·메가 특가', match: /메가|기획전/, tip: '국내·일본 등 원하는 지역의 객실과 숙박일을 선택해 행사 요금을 확인하세요. 코드 할인과 중복된다고 가정하지 마세요.' },
        ];
    return <section id="offer-picker" className="border-b border-blue-100 bg-blue-50/40 p-5 md:p-6 scroll-mt-24">
        <h2 className="text-xl font-bold text-slate-900">{storeId === 'usimsa' ? '유심사 쿠폰과 여행용 eSIM 선택하기' : storeId === 'klook' ? '예약할 상품별로 클룩 쿠폰 고르기' : '호텔스닷컴 코드 할인과 기획전 비교'}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-600">등록된 기간 기준 안내입니다. 선착순 종료와 실제 할인 적용 여부는 판매처 결제 화면에서 확인하세요.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
            {groups.map(group => {
                const matching = offers.filter(offer => group.match.test(offer.title));
                return <article key={group.title} className="rounded-xl border border-blue-100 bg-white p-4">
                    <h3 className="font-bold text-blue-900">{group.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{group.tip}</p>
                    {!matching.length && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm">현재 등록된 기간 내 전용 혜택이 없습니다. 이전 코드를 현재 예약에 사용하지 마세요.</p>}
                    <ul className="mt-3 space-y-4">
                        {matching.map(offer => {
                            let condition = offer.condition;
                            try { if (condition?.startsWith('{')) condition = JSON.parse(condition).text || ''; } catch { condition = '상세 페이지에서 확인하세요.'; }
                            return <li key={offer.id} className="border-t border-slate-100 pt-3">
                                <p className="text-xs font-semibold text-slate-500">{couponStatus(offer) === 'upcoming' ? '시작 예정' : '진행 기간 내'}</p>
                                <Link className="mt-1 block font-semibold leading-6 text-blue-800 underline underline-offset-4" href={`/store/${storeId}/coupon/${encodeURIComponent(offer.id)}`}>{offer.title}</Link>
                                <p className="mt-2 text-sm leading-6 text-slate-700">{condition}</p>
                                <p className="mt-2 text-xs leading-5 text-slate-500">사용·예약 기한: {offer.expiry || '상세 안내 확인'}</p>
                                {offer.id === 'coupon-1772096403651-2bwfv' && <p className="mt-2 text-sm text-amber-800">기존 안내의 할인율 표기가 서로 달라 확인이 필요합니다. 5%·10% 할인을 확정 혜택으로 보지 말고 결제 화면에서 확인하세요.</p>}
                                <Link href={`/store/${storeId}/coupon/${encodeURIComponent(offer.id)}`} className="mt-3 inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white">코드·상세 조건 확인 →</Link>
                            </li>;
                        })}
                    </ul>
                </article>;
            })}
        </div>
        {storeId === 'usimsa' && <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {[
                ['데이터 용량·속도', '하루 제공량인지 전체 기간 총량인지, 소진 후 속도와 핫스팟 지원 여부를 확인하세요. 무제한 표기도 고속 데이터 한도는 별도로 확인해야 합니다.'],
                ['사용일수·개통 시점', '설치 시점과 현지 통신망 접속 시점 중 언제부터 사용일수가 계산되는지 상품 안내를 확인하세요. 구매 후 유효기간 180일은 데이터를 180일 동안 쓸 수 있다는 뜻이 아닙니다.'],
                ['휴대폰 호환·설치', '정확한 기기 모델의 eSIM 지원 여부를 확인하고 출국 전 설치 안내를 읽어두세요. QR 재발급·삭제 후 재설치 가능 여부는 상품별로 확인하세요.'],
                ['통화·환불 조건', '데이터 전용인지 전화번호·통화·문자가 포함되는지 확인하세요. 구매·설치·개통 이후 환불 조건이 달라질 수 있습니다.'],
            ].map(([title, text]) => <article key={title} className="rounded-xl border bg-white p-4"><h3 className="font-bold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}
        </div>}
        <p className="mt-4 text-sm leading-6 text-slate-600">{storeId === 'usimsa' ? '쿠폰 결제 기한과 eSIM 설치·개통 기한은 다릅니다. 동일한 국가·사용일수·고속 데이터 제공량을 기준으로 쿠폰 적용 후 최종 금액을 비교하세요.' : '예약 기간이 끝난 혜택은 투숙·이용 가능일이 남아 있어도 새 예약에 사용할 수 없습니다. 같은 날짜·인원·취소 조건으로 세금과 수수료를 포함한 최종 금액을 비교하세요.'}</p>
    </section>;
}
