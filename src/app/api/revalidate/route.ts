import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { path, secret } = await request.json();

    // 시크릿 키 검증
    // 주의: REVALIDATE_SECRET 환경변수가 비어있으면(undefined) secret도 안 보낸 요청이
    // undefined === undefined 로 통과해버리는 구멍이 있었음 (.env.local에 값이 없었음).
    // 그래서 환경변수 자체가 없으면 무조건 막도록 fail-closed로 수정.
    if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }

    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, path, now: Date.now() });
    }
    
    // 기본적으로 전체 사이트 갱신
    revalidatePath('/', 'layout');
    return NextResponse.json({ revalidated: true, path: '/', now: Date.now() });
  } catch (err) {
    return NextResponse.json({ revalidated: false, message: 'Error revalidating' }, { status: 500 });
  }
}
