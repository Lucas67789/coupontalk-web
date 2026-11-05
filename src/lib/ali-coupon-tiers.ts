export function aliCouponTiers(coupon: { id: string; content_body?: string | null }) {
  if (coupon.id !== 'coupon-aliexpress-nov2026-1111') return [];
  return [...(coupon.content_body || '').matchAll(/^\|\s*(LTIK\d+)\s*\|\s*US\$(\d+) 이상\s*\|\s*US\$(\d+)\s*\|/gm)]
    .map(m => ({ code: m[1], minimum: Number(m[2]), discount: Number(m[3]) }));
}

export function aliCouponDetails(content: string) {
  const start = content.indexOf('### 알리 광군제 할인코드 입력 방법');
  if (start < 0) return content;
  return content.slice(start)
    .replace('위 제휴 링크를 통해 광군제 기획전에 접속합니다. 공지에서는 모바일 접속을 권장합니다.', '상단에서 구매 금액에 맞는 쿠폰의 ‘코드 복사하고 알리 가기’를 누릅니다. 코드가 복사되고 알리 행사 페이지가 새 창으로 열립니다.')
    .replace('대상 상품을 고른 뒤 쿠폰 적용 대상 금액에 맞는 구간을 위 표에서 선택합니다.', '대상 상품을 고르고 선택한 쿠폰의 최소 구매 금액을 충족하는지 확인합니다.');
}
