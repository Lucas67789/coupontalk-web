export const isCouponExpired = (expiry: string, title?: string) => {
    if (!expiry && !title) return false;
    
    const now = new Date().getTime();
    
    // 1. YYYY.MM.DD or YYYY-MM-DD or YYYY/MM/DD
    let match = (expiry || '').match(/(\d{4})[. -/]+(\d{1,2})[. -/]+(\d{1,2})/);
    if (match) {
        return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), 23, 59, 59).getTime() < now;
    }

    // 2. YYYY년 MM월 DD일
    match = (expiry || '').match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
    if (match) {
        return new Date(parseInt(match[1], 10), parseInt(match[2], 10) - 1, parseInt(match[3], 10), 23, 59, 59).getTime() < now;
    }

    // 3. MM월 DD일 (Assume current year)
    match = (expiry || '').match(/(\d{1,2})월\s*(\d{1,2})일/);
    if (match) {
        return new Date(new Date().getFullYear(), parseInt(match[1], 10) - 1, parseInt(match[2], 10), 23, 59, 59).getTime() < now;
    }

    // 4. Fallback for title/expiry mentioning a past month (e.g. "4월 할인코드")
    const textToSearch = (title || '') + ' ' + (expiry || '');
    const monthMatch = textToSearch.match(/(\d{1,2})월/);
    if (monthMatch) {
        const m = parseInt(monthMatch[1], 10);
        const currentMonth = new Date().getMonth() + 1;
        if (m < currentMonth && currentMonth - m < 6) {
            return true;
        }
    }
    
    return false;
};
