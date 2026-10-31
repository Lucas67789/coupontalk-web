// Manually observed KRW quotes, not a live price feed. Evidence: 2026-10-31 browser quotes.
export type SubscriptionQuote = {
  service: string; total: number; months: number; plan: string; conditions: string;
  source: string; official?: { total: number; label: string; source: string };
  difference: string; soldOut?: boolean; listing?: boolean;
};
const details = (product: string) => `https://www.gamsgo.com/ko/details/${product}`;
const coupon = '기본 5% 쿠폰 · GamsCare+ 미적용';
export const subscriptionPriceCheckedAt = '2026-10-31';
export const subscriptionPrices: Record<string, SubscriptionQuote> = {
  'chatgpt-discount': { service: '챗GPT', total: 6613, months: 1, plan: 'Plus 공유형', conditions: 'UXA7C 적용 · 자동 갱신 ON · GamsCare+ 미적용', source: details('chatgpt'), official: { total: 29000, label: 'Plus 개인 구독 · 월 29,000원', source: 'https://chatgpt.com/ko-KR/pricing/' }, difference: '공식은 개인 계정, 비교 상품은 공유형입니다. 계정 관리·대화 기록·사용 한도가 같지 않습니다.' },
  'netflix-discount': { service: '넷플릭스', total: 4657, months: 1, plan: 'Premium 4K · 개인 프로필 1개', conditions: 'Ott Shop 판매 목록가 · 30일 보증 표시 · 코드 할인 미반영', source: 'https://www.gamsgo.com/ko/accounts/netflix', listing: true, official: { total: 17000, label: '프리미엄 · 월 17,000원', source: 'https://help.netflix.com/ko/node/24926' }, difference: '공식 프리미엄 전체 구독과 판매자 제공 프로필 1개의 비용 비교입니다. 가구·기기·계정 권한이 다릅니다.' },
  'tving-discount': { service: '티빙', total: 22161, months: 3, plan: '프리미엄 · 공유 프로필 1개', conditions: `${coupon} · 자동 갱신 ON`, source: details('tving'), official: { total: 51000, label: '프리미엄 월 17,000원 × 3개월', source: 'https://www.tving.com/bill/subscription/plan' }, difference: '공식 프리미엄 전체 구독과 4인 공유 중 프로필 1개의 비용 비교입니다. 연간·결합 할인은 계산에서 제외했습니다.' },
  'disney-plus-discount': { service: '디즈니플러스', total: 18227, months: 3, plan: '4K · 공유 프로필 1개', conditions: `${coupon} · 자동 갱신 ON`, source: details('disneyplus'), official: { total: 41700, label: '프리미엄 월 13,900원 × 3개월', source: 'https://www.disneyplus.com/ko-kr' }, difference: '공식 프리미엄 전체 구독과 공유 프로필 1개의 비용 비교입니다. 공식 연간 요금은 139,000원이며, 여기서는 3개월 월간 결제를 비교합니다.' },
  'youtube-premium-cheap': { service: '유튜브 프리미엄', total: 63324, months: 12, plan: '내 계정 충전', conditions: `${coupon} · 자동 갱신 ON`, source: details('youtube'), official: { total: 178800, label: '웹·Android 월 14,900원 × 12개월', source: 'https://blog.youtube/intl/ko-kr/news-and-events/yt-premium-lite-kr/' }, difference: '공식 월간 결제 12회와 겜스고 12개월 선결제의 비용 비교입니다. 계정 적용 가능 여부·처리 시간·갱신 조건이 다릅니다. Lite 요금제와는 다른 비교입니다.' },
  'spotify-discount': { service: '스포티파이', total: 48123, months: 12, plan: '단독 계정 · 팟캐스트 포함', conditions: `${coupon} · 자동 갱신 ON`, source: details('spotify'), official: { total: 143880, label: 'Individual 월 11,990원 × 12개월', source: 'https://www.spotify.com/kr-ko/premium/' }, difference: '공식 개인 월간 결제 12회와 판매 상품의 비용 비교입니다. 신규 무료 체험은 제외했으며, 계정 제공·지역·지원 조건이 다릅니다.' },
  'gemini-discount': { service: '제미나이', total: 31655, months: 12, plan: '새 계정 제공 · 1인 전용', conditions: `${coupon} · 자동 갱신 OFF`, source: details('gemini'), difference: '공식 Google AI 요금제와 포함 기능이 같다고 확인되지 않아 할인율은 계산하지 않았습니다.' },
  'claude-discount': { service: '클로드', total: 9328, months: 1, plan: 'Pro 공유형 · MR Aymen Boujra', conditions: '판매 목록가 · 1개월 상품 / 보증 10일 · 코드 할인 미반영', source: 'https://www.gamsgo.com/ko/accounts/claude', listing: true, difference: '공유 계정 상품입니다. 공식 달러 가격을 임의 환율로 바꾼 할인율은 표시하지 않습니다. 이용 기간과 판매자 보증 기간은 다릅니다.' },
  'suno-plans': { service: '수노', total: 6320, months: 1, plan: '공유형 1자리', conditions: `${coupon} · 자동 갱신 ON`, source: details('suno'), difference: '개인별 크레딧·상업 이용 조건을 확인해야 하는 공유형입니다. 공식 개인 플랜과 같은 상품으로 계산하지 않았습니다.' },
  'midjourney-pricing': { service: '미드저니', total: 31655, months: 1, plan: '개인형 · Standard', conditions: '기본 5% 쿠폰 · 확인 시 품절', source: details('midjourney_official'), soldOut: true, difference: '품절 상품의 참고 가격입니다. 현재 구매 가능한 가격으로 안내하지 않습니다.' },
  'genspark-pricing': { service: '젠스파크', total: 61323, months: 1, plan: '개인형 · 21,000 크레딧', conditions: 'GamsCare+ 미적용 · 확인 시 품절', source: details('genspark'), soldOut: true, difference: '품절 상품의 참고 가격입니다. 마켓플레이스의 다른 크레딧 상품과는 별개입니다.' },
  'adobe-discount': { service: '어도비', total: 62817, months: 3, plan: 'Enterprise · 개인 계정형', conditions: `${coupon} · 자동 갱신 ON`, source: details('adobe1'), difference: 'Enterprise 제공 상품은 공식 개인 Creative Cloud 요금제와 라이선스·관리 권한이 달라 할인율을 계산하지 않았습니다.' },
  'capcut-pricing': { service: '캡컷', total: 9493, months: 1, plan: 'Pro · 나만 쓰는 계정', conditions: `${coupon} · 자동 갱신 ON`, source: details('capcut'), difference: '공식 한국 결제 화면의 동일 기간·동일 플랜 가격을 확인하지 못해 절약률은 표시하지 않았습니다.' },
  'canva-subscription': { service: '캔바', total: 45589, months: 12, plan: '교육용 공유형 · Pro 아님', conditions: `${coupon} · 자동 갱신 OFF`, source: details('cannva'), difference: '교육용 공유 상품으로, Canva Pro 개인 구독과 다른 상품입니다. 교육용 이용 자격·관리 권한을 확인해야 하며 Pro 할인율로 계산하지 않습니다.' },
  'duolingo-discount-code': { service: '듀오링고', total: 25321, months: 12, plan: '가족 그룹 1자리 · 공유형', conditions: `${coupon} · 자동 갱신 ON`, source: details('duolingo'), difference: '가족 요금제 전체가 아닌 1자리 상품입니다. 공식 개인·가족 플랜과 같은 권한으로 계산하지 않았습니다.' },
};

export function priceDifference(officialTotal: number, total: number) {
  return { amount: officialTotal - total, percent: Math.round((officialTotal - total) / officialTotal * 1000) / 10 };
}
export const won = (value: number) => `${Math.round(value).toLocaleString('ko-KR')}원`;
