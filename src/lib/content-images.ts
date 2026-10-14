// Extract actual content images, never tracking links or inline executable URLs.
export function contentImages(content?: string | null): string[] {
    const images: string[] = [];
    const pattern = /!\[[^\]]*\]\(<?([^\s)>]+)>?(?:\s+"[^"]*")?\)|<img\b[^>]*\bsrc\s*=\s*["']([^"']+)["']/gi;
    for (const match of (content || '').matchAll(pattern)) {
        try {
            const url = new URL((match[1] || match[2]).replace(/&amp;/g, '&'));
            if (['https:', 'http:'].includes(url.protocol) && !url.username && !url.password && !images.includes(url.href)) images.push(url.href);
        } catch { /* Invalid or relative image URLs are not SEO candidates. */ }
    }
    return images;
}
