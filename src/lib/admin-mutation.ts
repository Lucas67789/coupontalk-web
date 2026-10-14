import { supabase } from './supabase';
import { clearAllCache } from '@/app/actions/cacheActions';

export async function saveAdminChange(operation: PromiseLike<{ data: unknown; error: { message: string } | null }>) {
    try {
        const { data, error } = await operation;
        if (error) throw new Error(error.message);
        if (!Array.isArray(data) || data.length === 0) throw new Error('변경할 항목이 없거나 수정 권한이 없습니다.');
    } catch (error) {
        alert(`저장하지 못했습니다: ${error instanceof Error ? error.message : '연결 상태를 확인해주세요.'}`);
        return false;
    }
    try {
        const { data: { session } } = await supabase.auth.getSession();
        await clearAllCache(session?.access_token);
    } catch {
        alert('데이터는 저장됐지만 공개 페이지 갱신에 실패했습니다. 관리자 화면에서 캐시 초기화를 다시 실행해주세요.');
    }
    return true;
}
