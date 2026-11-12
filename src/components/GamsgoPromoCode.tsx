'use client';

import { copyGamsgoAndOpen } from '@/lib/gamsgo-action';
import { useState } from 'react';
import { gamsgoPromoCode } from '@/lib/gamsgo-promotion';

export default function GamsgoPromoCode({ slug }: { slug?: string }) {
  const [message, setMessage] = useState('');

  async function copyCode() {
    setMessage(await copyGamsgoAndOpen(slug));
  }

  return <div className="my-5 rounded-xl border border-blue-200 bg-blue-50 p-5 text-slate-900">
    <p className="text-sm font-semibold">겜스고 프로모션 코드</p>
    <div className="mt-3 flex flex-wrap items-center gap-4">
      <code className="select-all text-2xl font-bold tracking-wider">{gamsgoPromoCode}</code>
      <button type="button" onClick={copyCode} className="rounded-lg bg-blue-700 px-4 py-3 text-sm font-bold text-white hover:bg-blue-800">코드 복사하고 할인받기 ↗</button>
    </div>
    <p className="mt-3 text-sm leading-6">겜스고 결제 화면에 입력한 뒤 할인 적용 여부와 최종 금액을 확인하세요. 할인율·대상 상품·유효기간은 결제 화면의 조건을 따릅니다.</p>
    <p role="status" aria-live="polite" className="mt-2 text-sm">{message}</p>
  </div>;
}
