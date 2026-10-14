// Extract actual content images, never tracking links or inline executable URLs.
export function contentImages(content?: string | null): string[] {
    const images: string[] = [];
    const pattern = /!\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)|<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;
    for (const match of (content || '').matchAll(pattern)) {
        try {
            const url = new URL((match[1] || match[2]).replace(/&amp;/g, '&'));
            if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue;
            // Storage sends X-Robots-Tag: none. Serve owned images via our public route.
            const storagePrefix = '/storage/v1/object/public/images/';
            const imageUrl = url.origin === process.env.NEXT_PUBLIC_SUPABASE_URL && url.pathname.startsWith(storagePrefix)
                ? `https://coupontalk.kr/coupon-images/${url.pathname.slice(storagePrefix.length)}`
                : url.href;
            if (!images.includes(imageUrl)) images.push(imageUrl);
        } catch { /* Invalid or relative image URLs are not SEO candidates. */ }
    }
    return images;
}
