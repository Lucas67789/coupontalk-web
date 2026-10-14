export function safeAffiliateUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
}

export function hasCouponCode(code?: string | null) {
    return !!code?.trim() && !['NO_CODE_REQUIRED', '없음', '코드 필요없음'].includes(code.trim()) && !/자동\s*적용|코드\s*(불필요|필요\s*없음)|본문\s*참고|금액별\s*상이/.test(code);
}
