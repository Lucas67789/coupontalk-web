import GamsgoPromoCode from '@/components/GamsgoPromoCode';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { subscriptionGuides } from '@/lib/subscription-guides';
export const metadata: Metadata = { title: { absolute: '구독 할인 비교' }, description: '유튜브 프리미엄·넷플릭스·티빙과 챗지피티·클로드·제미나이 등 15개 서비스의 구독료, 할인 방법, 계정 이용 조건을 비교하세요.', alternates: { canonical: 'https://coupontalk.kr/subscriptions' } };
export default function Subscriptions() {
  return <div className="mx-auto max-w-6xl px-4"><p className="mb-3 text-sm font-semibold text-blue-700">쿠폰톡 구독 가이드</p><h1 className="text-4xl font-extrabold">구독 할인 비교</h1><p className="mb-8 mt-4 leading-7 text-gray-600">보고 싶은 서비스부터 선택하세요. 가격과 이용 방식, 결제 기간을 함께 비교합니다.</p><GamsgoPromoCode /><div className="grid gap-6 md:grid-cols-3">{subscriptionGuides.map(g => <Link href={`/subscriptions/${g.slug}`} key={g.slug} className="overflow-hidden rounded-3xl border bg-white transition hover:shadow-lg"><Image src={`/subscription-images/${g.slug}.png`} alt={g.title} width={1200} height={1200} className="aspect-square w-full object-contain"/><div className="p-6"><h2 className="text-xl font-bold">{g.title}</h2><p className="mt-3 text-sm leading-7 text-gray-600">{g.intro}</p><p className="mt-5 font-semibold text-blue-700">비교 가이드 보기 →</p></div></Link>)}</div></div>;
}
