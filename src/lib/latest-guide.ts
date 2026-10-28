
export const latestGuideUpdatedAt = '2026-10-28T17:36:10+09:00';

export function latestGuideTitle(storeName: string, title: string) {
    const subject = title.replace(/\[종료\]|\[[^\]]*할인[^\]]*\]/g, '').split(/\d+(?:\.\d+)?\s*%|할인코드|할인쿠폰|할인|프로모션|특가|혜택/)[0]
        .replace(/\([^)]*\)/g, '').replace(/(?:20\d{2}년\s*)?\d{1,2}월|전용|특별/g, '').replace(/[—–|!]+/g, '').trim();
    return `${subject && subject.length > 2 ? (subject.includes(storeName) ? subject : storeName + ' ' + subject) : storeName} 최신 할인 안내`;
}

// Conservative matching: every explicit subject must appear in the candidate title.
// This only groups relevant notices; it never verifies eligibility at checkout.
export function guideTopics(title: string): string[] {
    const patterns = [/오픈닷\s*원|opendot\s*one/gi, /오픈런\s*(?:프로\s*)?(?:에어\s*)?2/gi, /오픈핏\s*(?:에어\s*)?2/gi,
        /카카오페이|네이버페이|토스페이|삼성카드|신한카드|국민카드/gi,
        /일본|국내|해외|유럽|태국|베트남|싱가포르|오사카|도쿄|제주/gi,
        /렌터카|항공권?|호텔|숙소|투어|입장권|이심|eSIM/gi,
        /아디다스|푸마|크록스|오클리|미즈노|라코스테|폴로랄프로렌/gi,
        /(?:thinkpad|ideapad|legion|yoga)\s*[a-z0-9-]*/gi, /\b(?:21|82|83)[a-z0-9]{6,}\b/gi];
    return [...new Set(patterns.flatMap(p => title.match(p) || []).map(t => t.toLowerCase().replace(/\s/g, '').replace('opendotone', '오픈닷원').replace(/^항공권$/, '항공')))];
}
export function matchesGuideTopic(source: string, target: string): boolean {
    const topics = guideTopics(source), candidate = guideTopics(target);
    return topics.length > 0 && topics.every(t => candidate.includes(t));
}

type GuideRecord = { id: string; title: string; code?: string; expiry?: string };
export function uniqueGuideTitle(storeName: string, coupon: GuideRecord, siblings: GuideRecord[]) {
    const base = latestGuideTitle(storeName, coupon.title);
    const same = siblings.filter(c => latestGuideTitle(storeName, c.title) === base);
    if (!same.some(c => c.id !== coupon.id)) return base;
    const period = coupon.expiry?.match(/20\d{2}[.\-/년]\s*\d{1,2}[.\-/월]\s*\d{1,2}/)?.[0];
    const code = coupon.code && !/NO_CODE|불필요|자동|없음|링크|상이/.test(coupon.code) ? coupon.code : '';
    const detail = [period, code].filter(Boolean).join(' · ') || coupon.title.replace(/\[종료\]/g, '').trim();
    return `${base} | 이전 ${detail} 행사`;
}
