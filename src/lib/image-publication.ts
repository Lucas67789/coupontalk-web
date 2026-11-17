import { displayImages } from './content-images.ts';

export async function assertPublicationImages(
    coupon: { status?: string | null; content_body?: string | null },
    inspect: (url: string) => Promise<{ width: number; height: number }>,
) {
    if (coupon.status !== 'published') return;
    const images = displayImages(coupon.content_body);
    if (!images.length) throw new Error('게시 차단: 본문에 실제 썸네일 이미지를 넣어 주세요.');
    if (/fit=(?:square-v1)/i.test(coupon.content_body || ''))
        throw new Error('게시 차단: 여백이 추가된 검색용 이미지 대신 원본 이미지를 넣어 주세요.');
    for (const url of images) {
        let size;
        try { size = await inspect(url); }
        catch { throw new Error(`게시 차단: 이미지를 불러올 수 없습니다. ${url}`); }
        if (size.width < 240 || size.height < 120 || size.width / size.height > 8 || size.height / size.width > 8)
            throw new Error(`게시 차단: 이미지가 너무 작거나 지나치게 긴 비율입니다. ${url}`);
    }
}

export function inspectBrowserImage(url: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
        const image = new Image();
        const timer = setTimeout(() => { image.onload = null; image.onerror = null; reject(new Error('timeout')); }, 10000);
        image.onload = () => { clearTimeout(timer); resolve({ width: image.naturalWidth, height: image.naturalHeight }); };
        image.onerror = () => { clearTimeout(timer); reject(new Error('load')); };
        image.src = url;
    });
}
