import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { path, store_id, coupon_id, referrer } = body;

        let sessionId = request.headers.get('x-session-id');
        if (!sessionId) {
            sessionId = uuidv4();
        }

        const userAgent = request.headers.get('user-agent') || '';

        const { error } = await supabase.from('page_views').insert({
            path,
            store_id: store_id || null,
            coupon_id: coupon_id || null,
            session_id: sessionId,
            referrer: referrer || null,
            user_agent: userAgent
        });

        if (error) {
            console.error('Error tracking page view:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        const response = NextResponse.json({ success: true });
        
        // Return session ID to client to store in cookie/localStorage
        response.headers.set('x-session-id', sessionId);
        return response;
    } catch (error) {
        console.error('Failed to track page view:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
