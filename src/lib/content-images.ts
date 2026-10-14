// Extract actual content images, never tracking links or inline executable URLs.
export function contentImages(content?: string | null): string[] {
    const images: string[] = [];
    const pattern = /!\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)|<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;
    for (const match of (content || '').matchAll(pattern)) {
        try {
            const raw = (match[1] || match[2]).replace(/&amp;/g, '&');
            const url = new URL(raw.startsWith('/') && !raw.startsWith('//') ? `https://coupontalk.kr${raw}` : raw);
            if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) continue;
            // Storage sends X-Robots-Tag: none. Serve owned images via our public route.
            const storagePrefix = '/storage/v1/object/public/images/';
            const imageUrl = url.origin === process.env.NEXT_PUBLIC_SUPABASE_URL && url.pathname.startsWith(storagePrefix)
                ? `https://coupontalk.kr/coupon-images/${url.pathname.slice(storagePrefix.length)}${url.pathname.endsWith('.svg') ? '.png' : ''}`
                : url.href;
            if (!images.includes(imageUrl)) images.push(imageUrl);
        } catch { /* Invalid or relative image URLs are not SEO candidates. */ }
    }
    return images;
}

export function couponImages(content?: string | null): string[] {
    const images = contentImages(content);
    return images.length ? images : ['https://coupontalk.kr/og-image.png'];
}

export function publicContentImages(content: string): string {
    const prefix = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/images/`;
    return content.split(prefix).join('https://coupontalk.kr/coupon-images/').replace(/(https:\/\/coupontalk\.kr\/coupon-images\/[^\s"'<>)]*\.svg)(?=[\s"'<>)]|$)/g, '$1.png');
}
