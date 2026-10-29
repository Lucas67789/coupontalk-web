import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
    const square = new URL(request.url).searchParams.get('fit') === 'square-v1';
    return new ImageResponse(
        <div style={{ background: '#eff6ff', color: '#1d4ed8', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: 80 }}>
            <div style={{ fontSize: 110, fontWeight: 700 }}>CouponTalk</div>
            <div style={{ fontSize: 36, color: '#334155', marginTop: 32 }}>Coupons, deals &amp; shopping benefits</div>
            <div style={{ fontSize: 28, marginTop: 70 }}>coupontalk.kr</div>
        </div>,
        { width: 1200, height: square ? 1200 : 630 },
    );
}
