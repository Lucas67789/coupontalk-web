export function safeAffiliateUrl(value: unknown): string | null {
    if (typeof value !== 'string') return null;
    try {
        const url = new URL(value);
        return ['https:', 'http:'].includes(url.protocol) && !url.username && !url.password ? url.href : null;
    } catch { return null; }
}

export function hasCouponCode(code?: string | null) {
    return !!code?.trim() && !['NO_CODE_REQUIRED', '없음', '코드 필요없음', '전용링크 자동적용', '자동적용'].includes(code.trim());
}
