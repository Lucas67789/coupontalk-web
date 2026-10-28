// Promotion dates without an offset use Korea time, even on UTC servers.
export function couponExpiryTime(expiry?: string | null): number | null {
    if (!expiry) return null;
    // Booking deadlines end the offer; a later stay date does not extend it.
    const bookingSection = expiry.split(/\s+\/\s*|\/\s+|[|,，]|\/?(?:숙박|투숙|체크인)/)[0];
    const beforeBooking = bookingSection.split('예약')[0];
    const deadline = expiry.includes('예약')
        ? (/\d{4}[.\-/년]/.test(beforeBooking) ? beforeBooking : bookingSection)
        : expiry;
    const dates = [...deadline.matchAll(/(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})일?(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?/g)];
    const match = dates.at(-1);
    if (!match) {
        // Legacy entries sometimes give only a booking month, followed by a stay date.
        const monthOnly = deadline.match(/(\d{4})년\s*(\d{1,2})월/);
        if (!monthOnly) return null;
        const year = Number(monthOnly[1]);
        const month = Number(monthOnly[2]);
        if (month < 1 || month > 12) return null;
        return Date.UTC(year, month, 1) - 9 * 60 * 60 * 1000 - 1;
    }
    const [, year, month, day, hour, minute, second, fraction, zone] = match;
    const iso = year+'-'+month.padStart(2,'0')+'-'+day.padStart(2,'0')+'T'+(hour || '23').padStart(2,'0')+':'+(minute || '59')+':'+(second || (hour ? '00' : '59'))+(fraction || (hour ? '' : '.999'))+(zone || '+09:00');
    const time = Date.parse(iso);
    return Number.isNaN(time) ? null : time;
}
export function isCouponExpired(expiry?: string | null, title?: string, now = Date.now()) {
    // Explicit early termination wins over a future or missing deadline.
    if (/^\s*\[종료\]/.test(title || "")) return true;
    const end = couponExpiryTime(expiry);
    if (end !== null) return end < now;
    if (/상시|무기한|소진/.test(expiry || '')) return false;
    const local = new Date(now + 9 * 60 * 60 * 1000);
    const year = local.getUTCFullYear();
    const date = expiry?.match(/(\d{1,2})월\s*(\d{1,2})일/);
    if (date) return (couponExpiryTime(year+'-'+date[1]+'-'+date[2]) ?? Infinity) < now;
    const month = ((expiry || '') + ' ' + (title || '')).match(/(?:(\d{4})년\s*)?(\d{1,2})월/);
    if (!month) return false;
    const targetYear = month[1] ? Number(month[1]) : year;
    const targetMonth = Number(month[2]);
    return targetYear < year || (targetYear === year && targetMonth < local.getUTCMonth() + 1);
}

// Only explicit full-date booking periods are compared; ambiguous prose is left for review.
export function bookingDeadlineFromContent(content: string): string | null {
    const text = content.replace(/<\/(?:p|li|tr)>/gi, '\n').replace(/<[^>]+>/g, ' ').replace(/\*\*/g, '');
    for (const line of text.split('\n')) {
        if (!/예약\s*(?:가능\s*)?기간/.test(line)) continue;
        const section = line.slice(line.search(/예약\s*(?:가능\s*)?기간/)).split(/숙박|투숙|기획전|출발/)[0];
        const dates = [...section.matchAll(/\d{4}[.\-/년]\s*\d{1,2}[.\-/월]\s*\d{1,2}/g)];
        if (dates.length) return dates.at(-1)![0];
    }
    return null;
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


export function couponStatus(coupon: { expiry?: string | null; title?: string; content_body?: string | null }, now = Date.now()): 'expired' | 'upcoming' | 'active' {
    if (isCouponExpired(coupon.expiry, coupon.title, now)) return 'expired';
    const start = promotionStartsAt(coupon.content_body || '');
    return start !== null && start > now ? 'upcoming' : 'active';
}
