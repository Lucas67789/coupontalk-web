import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { jsonLd } from '@/lib/content-safety';
import { subscriptionGuides, subscriptionAffiliateUrl, subscriptionReviewedAt } from '@/lib/subscription-guides';

export const dynamicParams = false;
export function generateStaticParams() { return subscriptionGuides.map(({ slug }) => ({ slug })); }
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = subscriptionGuides.find(g => g.slug === slug);
  if (!guide) return {};
  const url = `https://coupontalk.kr/subscriptions/${slug}`;
  const image = { url: `https://coupontalk.kr/subscription-images/${slug}.png`, width: 1200, height: 1200, alt: guide.title };
  return { robots: { index: true, follow: true, 'max-image-preview': 'large' }, title: { absolute: guide.title }, description: guide.description, alternates: { canonical: url },
    openGraph: { title: guide.title, description: guide.description, url, type: 'article', locale: 'ko_KR', images: [image] },
    twitter: { card: 'summary_large_image', title: guide.title, description: guide.description, images: [image.url] } };
}

export default async function SubscriptionGuide({ params }: Props) {
  const { slug } = await params;
  const guide = subscriptionGuides.find(g => g.slug === slug);
  if (!guide) notFound();
  const url = `https://coupontalk.kr/subscriptions/${slug}`;
  return <article className="mx-auto max-w-6xl px-4">
    <nav aria-label="현재 위치" className="mb-6 text-sm text-gray-500"><Link href="/">홈</Link> / <Link href="/subscriptions">구독 할인</Link> / {guide.service}</nav>
    <header className="grid gap-8 rounded-3xl border border-gray-200 bg-white p-6 md:grid-cols-[1fr_240px] md:p-10">
      <div>
        <p className="mb-3 text-sm font-semibold" style={{ color: guide.color }}>구독료 비교 가이드</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{guide.title}</h1>
        <p className="mt-5 max-w-2xl leading-8 text-gray-600">{guide.intro}</p>
        <p className="mt-4 text-xs text-gray-500">자료 확인: <time dateTime={subscriptionReviewedAt}>2026년 10월 30일</time> · 작성: 쿠폰톡</p>
        <div className="mt-6 flex flex-wrap gap-3"><a href="#compare" className="rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white">가격·조건 비교하기</a><a href="#gamsgo" className="rounded-xl border border-gray-300 px-5 py-3 font-semibold">겜스고 이용 조건 보기</a></div>
      </div>
      <Image src={`/subscription-images/${slug}.png`} alt={`${guide.service} 구독료와 이용 조건 비교`} width={1200} height={1200} priority className="mx-auto w-48 rounded-2xl object-contain md:w-60" />
    </header>
    <nav aria-label="페이지 목차" className="mt-6 flex flex-wrap gap-3 text-sm"><a href="#compare" className="rounded-lg bg-gray-100 px-4 py-2">가격 비교</a><a href="#gamsgo" className="rounded-lg bg-gray-100 px-4 py-2">제휴 상품 조건</a><a href="#faq" className="rounded-lg bg-gray-100 px-4 py-2">자주 묻는 질문</a></nav>
    <p className="my-5 rounded-xl bg-blue-50 p-5 font-medium leading-7 text-blue-950">{guide.takeaway}</p>
    <p className="mb-8 text-sm leading-6 text-gray-500">제휴 안내: 겜스고 링크를 통해 구매하면 쿠폰톡이 수수료를 받을 수 있습니다. 쿠폰톡은 각 구독 서비스의 공식 판매처가 아니며, 구매·환불은 해당 판매처에서 진행됩니다.</p>
    <section id="compare" className="scroll-mt-28">
      <h2 className="mb-4 text-2xl font-bold">{guide.service} 가격과 이용 조건 비교</h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white"><table className="w-full min-w-[560px] text-left text-sm"><caption className="sr-only">{guide.service} 구독 방법별 비교</caption><thead className="bg-gray-50"><tr>{guide.columns.map(c => <th key={c} scope="col" className="p-4">{c}</th>)}</tr></thead><tbody>{guide.rows.map(row => <tr key={row[0]} className="border-t border-gray-100"><th scope="row" className="p-4 font-semibold">{row[0]}</th><td className="p-4">{row[1]}</td><td className="p-4 leading-6 text-gray-600">{row[2]}</td></tr>)}</tbody></table></div>
      <p className="mt-3 text-xs leading-6 text-gray-500">공식 자료와 판매 안내를 검토한 날짜 기준입니다. 고정 가격이 없는 항목은 현재 선택 화면에서 확인해야 합니다. 가격·제공 기능·가입 자격은 바뀔 수 있으며, 최종 조건은 결제 화면을 확인하세요.</p>
    </section>
    <div className="my-10 grid gap-6 md:grid-cols-2">{guide.sections.map((section, i) => <section key={section.heading} className="rounded-2xl border border-gray-200 bg-white p-6"><p className="mb-3 text-sm font-bold" style={{ color: guide.color }}>0{i + 1}</p><h2 className="mb-3 text-xl font-bold leading-8">{section.heading}</h2><p className="leading-8 text-gray-600">{section.text}</p></section>)}</div>
    <section id="gamsgo" className="scroll-mt-28 rounded-3xl bg-slate-900 p-6 text-white md:p-9">
      <p className="text-sm text-slate-300">별도 판매 플랫폼 · 제휴 링크</p><h2 className="mt-2 text-2xl font-bold">겜스고에서 {guide.service} 조건 확인하기</h2>
      <p className="mt-4 max-w-3xl leading-7 text-slate-200">겜스고 첫 화면으로 이동한 뒤 ‘{guide.service}’ 상품을 선택하세요. 구독 기간·계정 제공 방식·보장 옵션에 따른 최종 결제액을 확인할 수 있습니다. 별도로 확인된 쿠폰톡 입력 할인코드는 없으며, 링크 방문만으로 추가 할인을 보장하지 않습니다.</p>
      <a href={subscriptionAffiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-6 inline-flex rounded-xl bg-white px-6 py-4 font-bold text-slate-900">겜스고 상품·가격 확인 ↗</a>
      <p className="mt-4 text-sm leading-6 text-slate-300">장기 선결제, 계정 공유·충전 상품은 공식 직접 구독과 조건이 다를 수 있습니다. 서비스 약관과 중단 시 처리·환불 범위를 확인하세요.</p>
    </section>
    <section id="faq" className="my-10 scroll-mt-28"><h2 className="mb-5 text-2xl font-bold">자주 묻는 질문</h2><div className="divide-y rounded-2xl border bg-white px-6">{guide.questions.map(([q, a]) => <details key={q} className="py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 leading-7 text-gray-600">{a}</p></details>)}</div></section>
    <section className="mb-10 text-sm"><h2 className="mb-3 font-bold">확인한 자료</h2><ul className="space-y-3">{guide.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{s.label} ↗</a></li>)}<li><a href={subscriptionAffiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-blue-700 underline">겜스고 {guide.service} 상품 확인(제휴) ↗</a></li></ul></section>
    <aside className="rounded-2xl border p-6"><h2 className="mb-4 text-lg font-bold">다른 구독료도 비교해보세요</h2><div className="flex flex-wrap gap-3">{subscriptionGuides.filter(g => g.slug !== slug).map(g => <Link key={g.slug} href={`/subscriptions/${g.slug}`} className="rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold">{g.title} →</Link>)}</div></aside>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', headline: guide.title, description: guide.description, mainEntityOfPage: url, datePublished: subscriptionReviewedAt, dateModified: subscriptionReviewedAt, image: `https://coupontalk.kr/subscription-images/${slug}.png`, author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr/about' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '홈', item: 'https://coupontalk.kr' }, { '@type': 'ListItem', position: 2, name: '구독 할인', item: 'https://coupontalk.kr/subscriptions' }, { '@type': 'ListItem', position: 3, name: guide.title, item: url }] },
    ] }) }} />
  </article>;
}
