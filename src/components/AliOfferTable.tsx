'use client';

import { useState } from 'react';
import { ArrowUpRight, Check, Copy } from 'lucide-react';
import type { CouponRow } from '@/lib/models';
import { aliOfferInfo, aliOfferRows } from '@/lib/ali-store';
import { couponStatus } from '@/lib/utils';
import { openCouponLink } from '@/lib/coupon-action';
import { useToast } from './ToastProvider';

export default function AliOfferTable({ coupons, now, summary = false }: { coupons: CouponRow[]; now: string; summary?: boolean }) {
  const { showToast } = useToast();
  const [copied, setCopied] = useState('');
  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">알리익스프레스 구매금액별 할인코드와 적용 조건</caption>
        <thead className="bg-slate-50 text-xs text-slate-500"><tr>
          <th scope="col" className="px-3 py-3 sm:px-5">구매 조건 / 할인</th>
          <th scope="col" className="px-2 py-3">할인코드</th>
          <th scope="col" className="px-3 py-3 text-right sm:px-5">사용하기</th>
        </tr></thead>
        <tbody className="divide-y divide-slate-100">
          {coupons.flatMap(coupon => aliOfferRows(coupon).map((row, index) => {
            const info = aliOfferInfo(coupon);
            const status = couponStatus(coupon, Date.parse(now));
            const key = `${coupon.id}-${index}`;
            return <tr key={key} className="hover:bg-orange-50/40">
              <td className="px-3 py-3 sm:px-5">
                <p className="text-xs leading-5 text-slate-500">{row.minimum}</p>
                <p className="mt-0.5 text-base font-extrabold text-red-600 sm:text-lg">{row.discount}</p>
                {summary && <a href={`#ali-event-${coupon.id}`} className="mt-1 block text-[11px] text-slate-500 underline underline-offset-2">{coupon.title.replace(/^알리익스프레스\s*/, '')}</a>}
              </td>
              <td className="px-2 py-3"><code className="break-all text-xs font-bold text-slate-800 sm:text-sm">{row.code || '코드 없이 적용'}</code></td>
              <td className="px-3 py-3 text-right sm:px-5">
                <button disabled={status !== 'active' || !info.url} aria-label={row.code ? `${row.code} 복사하고 알리 행사장 열기` : `${coupon.title} 행사장 열기`}
                  onClick={async () => {
                    // Recheck at click time: a tab may remain open beyond the deadline.
                    if (!info.url) return;
                    if (couponStatus(coupon) !== 'active') { showToast('행사 기간이 변경되었습니다. 페이지를 새로고침해 주세요.'); return; }
                    const message = await openCouponLink({ id: coupon.id, code: row.code }, info.url, '알리익스프레스', !!row.code, summary ? '알리 대표 요약표' : '알리 대표 행사표');
                    if (message.includes('복사 완료')) setCopied(key);
                    showToast(message);
                  }} className="inline-flex min-h-11 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl bg-red-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-500 sm:px-4">
                  {copied === key ? <Check size={14} /> : row.code ? <Copy size={14} /> : <ArrowUpRight size={14} />}
                  {status === 'upcoming' ? '시작 예정' : status === 'expired' ? '기간 종료' : !info.url ? '링크 확인 중' : copied === key ? '복사 완료' : row.code ? '복사 · 이동' : '행사장'}
                </button>
              </td>
            </tr>;
          }))}
        </tbody>
      </table>
    </div>
    <p className="border-t border-slate-100 px-4 py-3 text-[11px] leading-5 text-slate-500" role="status">{copied ? '코드가 복사되었습니다. 알리 결제 화면에 붙여넣고 할인 적용을 확인하세요.' : '복사 · 이동 버튼을 누르면 코드가 복사되고 알리가 새 창으로 열립니다. 선착순 소진·제외 상품 여부는 결제 시 확인하세요.'}</p>
  </div>;
}
