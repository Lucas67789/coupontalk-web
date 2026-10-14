import { NextRequest } from 'next/server';
import sharp from 'sharp';

// Only our public image bucket is reachable; this is not a general URL proxy.
export async function GET(_request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
    const { path } = await params;
    if (!path.length || path.some(part => !/^[\p{L}\p{N}_ .-]+$/u.test(part) || part === '.' || part === '..') || !/\.(?:jpe?g|png|webp|gif|avif)$/i.test(path.at(-1)!)) {
        return new Response('Not found', { status: 404 });
    }
    const storage = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!storage) return new Response('Unavailable', { status: 503 });
    try {
        const storagePath = path.map(encodeURIComponent).join('/').replace(/\.svg\.png$/, '.svg');
        const upstream = await fetch(`${storage}/storage/v1/object/public/images/${storagePath}`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) });
        if (!upstream.ok) return new Response('Image unavailable', { status: upstream.status === 404 ? 404 : 502 });
        const type = upstream.headers.get('content-type')?.split(';')[0] || '';
        if (storagePath.endsWith('.svg') && type === 'image/svg+xml') {
            const bytes = await upstream.arrayBuffer();
            if (bytes.byteLength > 5 * 1024 * 1024) return new Response('Image too large', { status: 413 });
            const png = await sharp(Buffer.from(bytes), { limitInputPixels: 16000000 }).resize({ width: 1200, withoutEnlargement: true }).png().toBuffer();
            return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600, s-maxage=86400', 'X-Content-Type-Options': 'nosniff' } });
        }
        if (!/^image\/(jpeg|png|webp|gif|avif)$/.test(type)) return new Response('Unsupported image', { status: 415 });
        const headers = { 'Content-Type': type, 'Cache-Control': 'public, max-age=3600, s-maxage=86400', 'X-Content-Type-Options': 'nosniff' };
        return new Response(upstream.body, { headers });
    } catch {
        return new Response('Image unavailable', { status: 502 });
    }
}
