
export const latestGuideUpdatedAt = '2026-10-28T12:00:00+09:00';

export function latestGuideTitle(storeName: string, title: string) {
    const subject = title.replace(/\[종료\]|\[[^\]]*할인[^\]]*\]/g, '').split(/\d+(?:\.\d+)?\s*%|할인코드|할인쿠폰|할인|프로모션|특가|혜택/)[0]
        .replace(/\([^)]*\)/g, '').replace(/(?:20\d{2}년\s*)?\d{1,2}월|전용|특별/g, '').replace(/[—–|!]+/g, '').trim();
    return `${subject && subject.length > 2 ? (subject.includes(storeName) ? subject : storeName + ' ' + subject) : storeName} 최신 할인 안내`;
}

// Only explicitly labelled, full-date promotion/booking ranges identify a future start.
export function promotionStartsAt(content: string): number | null {
    const text = content.replace(/<[^>]+>/g, '\n').replace(/\*\*/g, '');
    for (const line of text.split('\n')) {
        if (!/(?:행사|예약|프로모션|사용|이벤트)\s*기간/.test(line)) continue;
        const match = line.match(/(20\d{2})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})일?\s*[~～–—]/);
        if (match) return Date.parse(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}T00:00:00+09:00`);
    }
    return null;
}
