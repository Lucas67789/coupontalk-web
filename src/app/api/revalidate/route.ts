import { revalidatePath } from 'next/cache';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path');
    const secret = searchParams.get('secret');

    // Security check: Only allow revalidation if the secret token matches
    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (path) {
        revalidatePath(path, 'page');
        return NextResponse.json({ revalidated: true, now: Date.now(), path });
    }

    return NextResponse.json({
        revalidated: false,
        now: Date.now(),
        message: 'Missing path to revalidate',
    });
}
