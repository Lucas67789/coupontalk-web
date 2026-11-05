// Only explicitly dated events may appear as current. Undated legacy entries stay in records.
export function storeEventStatus(date: string, now = new Date()): 'current' | 'upcoming' | 'record' {
    const match = date?.match(/(20\d{2})[.\/-](\d{1,2})[.\/-](\d{1,2})\s*[~～–-]\s*(?:(20\d{2})[.\/-])?(\d{1,2})[.\/-](\d{1,2})/);
    if (!match) return 'record';
    const y = Number(match[1]);
    const endYear = Number(match[4] || (Number(match[5]) < Number(match[2]) ? y + 1 : y));
    const start = Date.UTC(y, Number(match[2]) - 1, Number(match[3])) - 9 * 3600000;
    const end = Date.UTC(endYear, Number(match[5]) - 1, Number(match[6]) + 1) - 9 * 3600000;
    if (now.getTime() >= end) return 'record';
    return now.getTime() < start ? 'upcoming' : 'current';
}
