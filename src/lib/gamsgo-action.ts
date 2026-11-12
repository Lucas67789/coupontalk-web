import { trackEvent } from './analytics-client';
import { gamsgoAffiliateLink } from './gamsgo-links';
import { gamsgoPromoCode } from './gamsgo-promotion';

export async function copyGamsgoAndOpen(slug?: string) {
  // Start both actions during the click; clipboard/analytics must not delay the popup.
  let copying: Promise<void> | undefined;
  try { copying = navigator.clipboard?.writeText(gamsgoPromoCode); } catch {}
  const target = gamsgoAffiliateLink(slug);
  window.open(target, '_blank', 'noopener,noreferrer');
  const details = { subscription_slug: slug, button_label: '코드 복사하고 할인받기' };
  void trackEvent('affiliate_click', { ...details, target_url: target });
  try {
    if (!copying) throw new Error('Clipboard unavailable');
    await copying;
    void trackEvent('code_copy', details);
    return '코드를 복사했습니다. 열린 상품 페이지의 결제 화면에 붙여넣으세요.';
  } catch {
    return `자동 복사가 되지 않았습니다. 상품 결제 화면에 ${gamsgoPromoCode}를 직접 입력하세요.`;
  }
}
