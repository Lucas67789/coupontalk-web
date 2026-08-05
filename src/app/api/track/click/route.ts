import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { type, store_id, coupon_id, product_id, target_url, session_id } = body;

        let sessionId = session_id || request.headers.get('x-session-id');
        if (!sessionId) {
            sessionId = uuidv4();
        }

        const { error } = await supabase.from('click_events').insert({
            type,
            store_id: store_id || null,
            coupon_id: coupon_id || null,
            product_id: product_id || null,
            session_id: sessionId,
            target_url: target_url || null
        });

        if (error) {
            console.error('Error tracking click event:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Failed to track click event:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
