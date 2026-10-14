// Promotion dates without an offset use Korea time, even on UTC servers.
export function couponExpiryTime(expiry?: string | null): number | null {
    if (!expiry) return null;
    // Booking deadlines end the offer; a later stay date does not extend it.
    const beforeBooking = expiry.split('예약')[0];
    const deadline = /\d{4}[.\-/]/.test(beforeBooking) && expiry.includes('예약') ? beforeBooking : expiry;
    const dates = [...deadline.matchAll(/(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})일?(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?/g)];
    const match = dates.at(-1);
    if (!match) return null;
    const [, year, month, day, hour, minute, second, fraction, zone] = match;
    const iso = year+'-'+month.padStart(2,'0')+'-'+day.padStart(2,'0')+'T'+(hour || '23').padStart(2,'0')+':'+(minute || '59')+':'+(second || (hour ? '00' : '59'))+(fraction || (hour ? '' : '.999'))+(zone || '+09:00');
    const time = Date.parse(iso);
    return Number.isNaN(time) ? null : time;
}
export function isCouponExpired(expiry?: string | null, title?: string, now = Date.now()) {
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
