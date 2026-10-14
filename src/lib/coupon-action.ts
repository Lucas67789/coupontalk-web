import { safeAffiliateUrl, hasCouponCode } from './affiliate';
import { supabase } from './supabase';

export async function openCouponLink(coupon: { id: string; code?: string }, url: string, storeName: string) {
    const target = safeAffiliateUrl(url);
    if (!target) return '할인 링크가 준비되지 않았습니다.';
    // Open during the user gesture. Analytics must never delay navigation or copying.
    const copying = hasCouponCode(coupon.code) ? navigator.clipboard?.writeText(coupon.code!) : undefined;
    window.open(target, '_blank', 'noopener,noreferrer');
    try {
        const session = localStorage.getItem('ct_session_id');
        void fetch('/api/track/click', {
            method: 'POST', keepalive: true,
            headers: { 'Content-Type': 'application/json', ...(session ? { 'x-session-id': session } : {}) },
            body: JSON.stringify({ type: hasCouponCode(coupon.code) ? 'code_copy' : 'affiliate_click', coupon_id: coupon.id, target_url: target }),
        }).catch(() => {});
        void Promise.resolve(supabase.rpc('increment_coupon_click', { coupon_id: coupon.id })).catch(() => {});
    } catch { /* Storage restrictions do not block the affiliate link. */ }
    if (!hasCouponCode(coupon.code)) return `${storeName} 할인 페이지를 열었습니다.`;
    try {
        if (!copying) throw new Error('Clipboard unavailable');
        await copying;
        return `'${coupon.code}' 복사 완료! 결제창에서 입력하세요.`;
    } catch { return '코드를 자동 복사하지 못했습니다. 화면의 코드를 직접 복사해주세요.'; }
}
