import { subscriptionImagePath } from '@/lib/subscription-image';
import type { Metadata } from 'next';
import GamsgoIntroduction from '@/components/GamsgoIntroduction';
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
  const image = { url: `https://coupontalk.kr${subscriptionImagePath(slug)}`, width: 1200, height: 1200, alt: guide.title };
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
    <header className="flex items-center justify-between gap-4 rounded-2xl bg-white py-4 md:py-6">
      <div>
        <p className="mb-2 text-xs font-bold text-blue-700">겜스고 · 영상·AI 구독 할인 플랫폼</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{guide.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">공식 사이트에서 직접 구독할까, 겜스고 할인 상품을 고를까? <br className="hidden md:block"/>가격부터 계정 방식까지, 차이를 먼저 확인하세요.</p>
      </div>
      <Image src={subscriptionImagePath(slug)} alt={`${guide.service} 구독 할인 안내`} width={1200} height={1200} priority className="w-20 shrink-0 rounded-xl object-contain md:w-32" />
    </header>
    <GamsgoIntroduction service={guide.service} slug={slug} />
    <nav aria-label="페이지 목차" className="mt-6 flex flex-wrap gap-3 text-sm"><a href="#price-comparison" className="rounded-lg bg-gray-100 px-4 py-2">가격 비교</a><a href="#gamsgo-purchase" className="rounded-lg bg-gray-100 px-4 py-2">할인코드·구매</a><a href="#faq" className="rounded-lg bg-gray-100 px-4 py-2">자주 묻는 질문</a></nav>
    <p className="my-5 leading-8 text-gray-600">{guide.intro}</p><p className="my-5 rounded-xl bg-blue-50 p-5 font-medium leading-7 text-blue-950">{guide.takeaway}</p>
    <section id="compare" className="scroll-mt-28">
      <h2 className="mb-4 text-2xl font-bold">{guide.service} 가격과 이용 조건 비교</h2>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white"><table className="w-full min-w-[560px] text-left text-sm"><caption className="sr-only">{guide.service} 구독 방법별 비교</caption><thead className="bg-gray-50"><tr>{guide.columns.map(c => <th key={c} scope="col" className="p-4">{c}</th>)}</tr></thead><tbody>{guide.rows.map(row => <tr key={row[0]} className="border-t border-gray-100"><th scope="row" className="p-4 font-semibold">{row[0]}</th><td className="p-4">{row[1]}</td><td className="p-4 leading-6 text-gray-600">{row[2]}</td></tr>)}</tbody></table></div>
      <p className="mt-3 text-xs leading-6 text-gray-500">공식 자료와 판매 안내를 검토한 날짜 기준입니다. 고정 가격이 없는 항목은 현재 선택 화면에서 확인해야 합니다. 가격·제공 기능·가입 자격은 바뀔 수 있으며, 최종 조건은 결제 화면을 확인하세요.</p>
    </section>
    <section className="my-10"><h2 className="mb-4 text-xl font-bold">{guide.service} 구독 전 더 알아보기</h2><div className="divide-y rounded-2xl border bg-white px-5">{guide.sections.map(section => <details key={section.heading} className="py-5"><summary className="cursor-pointer font-semibold leading-7">{section.heading}</summary><p className="mt-3 leading-8 text-gray-600">{section.text}</p></details>)}</div></section>
    <section id="faq" className="my-10 scroll-mt-28"><h2 className="mb-5 text-2xl font-bold">자주 묻는 질문</h2><div className="divide-y rounded-2xl border bg-white px-6">{guide.questions.map(([q, a]) => <details key={q} className="py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 leading-7 text-gray-600">{a}</p></details>)}</div></section>
    <section className="mb-10 text-sm"><h2 className="mb-3 font-bold">확인한 자료</h2><ul className="space-y-3">{guide.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{s.label} ↗</a></li>)}<li><a href={subscriptionAffiliateUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-blue-700 underline">겜스고 {guide.service} 상품 확인(제휴) ↗</a></li></ul></section>
    <aside className="rounded-2xl border p-6"><h2 className="mb-4 text-lg font-bold">다른 구독료도 비교해보세요</h2><div className="flex flex-wrap gap-3">{subscriptionGuides.filter(g => g.slug !== slug).map(g => <Link key={g.slug} href={`/subscriptions/${g.slug}`} className="rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold">{g.title} →</Link>)}</div></aside>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', headline: guide.title, description: guide.description, mainEntityOfPage: url, datePublished: subscriptionReviewedAt, dateModified: subscriptionReviewedAt, image: `https://coupontalk.kr${subscriptionImagePath(slug)}`, author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr/about' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '홈', item: 'https://coupontalk.kr' }, { '@type': 'ListItem', position: 2, name: '구독 할인', item: 'https://coupontalk.kr/subscriptions' }, { '@type': 'ListItem', position: 3, name: guide.title, item: url }] },
    ] }) }} />
  </article>;
}
