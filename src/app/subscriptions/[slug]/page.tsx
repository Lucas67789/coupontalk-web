import { gamsgoAffiliateLink } from '@/lib/gamsgo-links';
import SubscriptionVisualGuide from '@/components/SubscriptionVisualGuide';
import { subscriptionImagePath, subscriptionImagePaths, subscriptionVisualUpdatedAt } from '@/lib/subscription-image';
import type { Metadata } from 'next';
import GamsgoIntroduction from '@/components/GamsgoIntroduction';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { jsonLd } from '@/lib/content-safety';
import { subscriptionGuides, subscriptionReviewedAt } from '@/lib/subscription-guides';

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
  const hasPlanComparison = slug === 'canva-subscription' || slug === 'suno-plans';
  const comparisonHeading = slug === 'canva-subscription' ? '캔바 구독료 한눈에 비교' : '수노 요금제 한눈에 비교';
  return <article className="mx-auto max-w-6xl px-4">
    <nav aria-label="현재 위치" className="mb-6 text-sm text-gray-500"><Link href="/">홈</Link> / <Link href="/subscriptions">구독 할인</Link> / {guide.service}</nav>
    <header className="flex flex-col items-center justify-between gap-6 rounded-2xl bg-white py-4 sm:flex-row md:py-6">
      <div>
        <p className="mb-2 text-xs font-bold text-blue-700">겜스고 · 영상·AI 구독 할인 플랫폼</p>
        <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl">{guide.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-600">{hasPlanComparison || slug === 'claude-discount' ? guide.intro : <>공식 사이트에서 직접 구독할까, 겜스고 할인 상품을 고를까? <br className="hidden md:block"/>가격부터 계정 방식까지, 차이를 먼저 확인하세요.</>}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a data-gamsgo-primary href={gamsgoAffiliateLink(slug)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="inline-flex min-h-14 items-center justify-center rounded-xl bg-blue-700 px-7 py-4 text-center text-lg font-extrabold text-white shadow-lg hover:bg-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-700">{guide.service} 가격 확인하기 ↗</a>
          <a href="#gamsgo-purchase" className="inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-6 py-3 text-center font-bold text-blue-700 hover:bg-blue-50">쿠폰 사용하러 가기</a>
        </div>
        <p className="mt-3 text-xs leading-5 text-gray-500">겜스고 상품 페이지에서 옵션과 최종 결제 금액을 확인하세요.</p>
      </div>
      <a href={subscriptionImagePath(slug)} target="_blank" rel="noopener noreferrer" aria-label={`${guide.service} 대표 이미지 크게 보기`} className="block w-full max-w-80 shrink-0 sm:w-56 lg:w-72">
        <Image src={subscriptionImagePath(slug)} alt={`${guide.service} 구독 할인 안내`} width={1200} height={1200} sizes="(max-width: 639px) 320px, (max-width: 1023px) 224px, 288px" priority className="h-auto w-full rounded-2xl object-contain" />
      </a>
    </header>
    {slug === 'claude-discount' && <section id="claude-official-plans" className="my-6 rounded-2xl border border-blue-200 bg-blue-50/40 p-5 md:p-7">
      <h2 className="text-2xl font-bold">클로드 Pro 가격: 공식 구독과 공유형 비교</h2>
      <p className="mt-2 text-sm leading-6 text-gray-600">공식 가격 확인: 2026년 11월 3일 · 달러 표시 · 세금 별도</p>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border bg-white p-4"><h3 className="font-bold">무료로 먼저 확인</h3><p className="mt-3 text-2xl font-extrabold">Free $0</p><p className="mt-3 text-sm leading-7">가벼운 글쓰기·요약부터 시험하고, 필요한 작업이 사용 한도에 걸리는지 확인하세요.</p></div>
        <div className="rounded-xl border bg-white p-4"><h3 className="font-bold">Pro 월간 결제</h3><p className="mt-3 text-2xl font-extrabold">월 $20</p><p className="mt-3 text-sm leading-7">짧은 프로젝트나 한 달 이용을 비교할 때의 기준입니다. 공식 Pro에는 Claude Code가 포함되며 사용 한도가 있습니다.</p></div>
        <div className="rounded-xl border bg-white p-4"><h3 className="font-bold">Pro 연간 결제</h3><p className="mt-3 text-2xl font-extrabold">연 $200</p><p className="mt-3 text-sm leading-7">1년 요금을 선결제합니다. 월 $20씩 12개월 결제한 $240와 비교하면 $40 차이지만, 실제 사용할 기간과 환불 조건을 먼저 확인하세요.</p></div>
      </div>
      <p className="mt-4 text-sm leading-7">겜스고 공유형은 공식 개인 구독과 계정 권한이 다른 판매자 상품입니다. 아래 2026년 10월 31일 확인 가격은 과거 참고가이며 현재 판매가·재고는 다시 확인해야 합니다. 이용 기간과 판매자 보증 기간, 대화 접근 권한을 함께 비교하세요.</p>
      <p className="mt-3 text-sm leading-7">Claude Code나 API가 목적이라면 판매 상품의 제공 범위를 따로 확인하세요. 공식 플랜의 기능을 공유형 상품에도 동일하게 사용할 수 있다고 가정하지 마세요. 겜스고 코드는 공식 Claude 결제용 할인코드가 아닙니다.</p>
      <a href="https://claude.com/pricing" target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex min-h-11 items-center font-bold text-blue-800 underline">공식 플랜·현재 가격 확인 ↗</a>
    </section>}
    <GamsgoIntroduction service={guide.service} slug={slug} />
    <nav aria-label="페이지 목차" className="mt-6 flex flex-wrap gap-3 text-sm"><a href="#price-comparison" className="rounded-lg bg-gray-100 px-4 py-2">가격 비교</a><a href="#gamsgo-purchase" className="rounded-lg bg-gray-100 px-4 py-2">할인코드·구매</a><a href="#visual-guide" className="rounded-lg bg-gray-100 px-4 py-2">이미지 안내</a><a href="#faq" className="rounded-lg bg-gray-100 px-4 py-2">자주 묻는 질문</a></nav>
    {!hasPlanComparison && <p className="my-5 leading-8 text-gray-600">{guide.intro}</p>}<p className="my-5 rounded-xl bg-blue-50 p-5 font-medium leading-7 text-blue-950">{guide.takeaway}</p>
    {hasPlanComparison && <section id="price-comparison" className="my-8 scroll-mt-28">
      <h2 className="mb-4 text-2xl font-bold">{comparisonHeading}</h2>
      <div className="overflow-x-auto rounded-2xl border"><table className="w-full min-w-[560px] text-left text-sm leading-7">
        <caption className="p-4 text-left text-gray-600">2026년 10월 31일 공식 연간 요금표 기준 · 월간 결제액과 구분해 보세요.</caption>
        <thead className="bg-gray-50"><tr>{guide.columns.map(column => <th key={column} scope="col" className="px-4 py-3">{column}</th>)}</tr></thead>
        <tbody>{guide.rows.map(([name, ...cells]) => <tr key={name} className="border-t"><th scope="row" className="px-4 py-3 font-semibold">{name}</th>{cells.map(cell => <td key={cell} className="px-4 py-3">{cell}</td>)}</tr>)}</tbody>
      </table></div>
      <p className="mt-3 text-sm leading-6 text-gray-600">공식 기준: <a href={guide.sources[0].url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{guide.sources[0].label}</a>. 가격·제공량은 변경될 수 있으므로 결제 직전 확인하세요.</p>
    </section>}
    <SubscriptionVisualGuide slug={slug} />
    <section className="my-10"><h2 className="mb-4 text-xl font-bold">{guide.service} 구독 전 더 알아보기</h2><div className="divide-y rounded-2xl border bg-white px-5">{guide.sections.map(section => hasPlanComparison || slug === 'claude-discount' ? <section key={section.heading} className="py-5"><h3 className="font-semibold leading-7">{section.heading}</h3><p className="mt-3 leading-8 text-gray-600">{section.text}</p></section> : <details key={section.heading} className="py-5"><summary className="cursor-pointer font-semibold leading-7">{section.heading}</summary><p className="mt-3 leading-8 text-gray-600">{section.text}</p></details>)}</div></section>
    <section id="faq" className="my-10 scroll-mt-28"><h2 className="mb-5 text-2xl font-bold">자주 묻는 질문</h2><div className="divide-y rounded-2xl border bg-white px-6">{guide.questions.map(([q, a]) => <details key={q} className="py-5"><summary className="cursor-pointer font-semibold">{q}</summary><p className="mt-3 leading-7 text-gray-600">{a}</p></details>)}</div></section>
    <section className="mb-10 text-sm"><h2 className="mb-3 font-bold">확인한 자료</h2><ul className="space-y-3">{guide.sources.map(s => <li key={s.url}><a href={s.url} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline">{s.label} ↗</a></li>)}<li><a href={gamsgoAffiliateLink(slug)} target="_blank" rel="sponsored nofollow noopener noreferrer" className="text-blue-700 underline">겜스고 {guide.service} 상품 가격 확인 ↗</a></li></ul></section>
    <aside className="rounded-2xl border p-6"><h2 className="mb-4 text-lg font-bold">다른 구독료도 비교해보세요</h2><div className="flex flex-wrap gap-3">{subscriptionGuides.filter(g => g.slug !== slug).map(g => <Link key={g.slug} href={`/subscriptions/${g.slug}`} className="rounded-full bg-gray-100 px-4 py-3 text-sm font-semibold">{g.title} →</Link>)}</div></aside>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd({ '@context': 'https://schema.org', '@graph': [
      { '@type': 'Article', headline: guide.title, description: guide.description, mainEntityOfPage: url, datePublished: subscriptionReviewedAt, dateModified: slug === 'claude-discount' ? '2026-11-03T00:00:00+09:00' : subscriptionVisualUpdatedAt, image: subscriptionImagePaths(slug).map(path => `https://coupontalk.kr${path}`), author: { '@type': 'Organization', name: '쿠폰톡', url: 'https://coupontalk.kr/about' } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: '홈', item: 'https://coupontalk.kr' }, { '@type': 'ListItem', position: 2, name: '구독 할인', item: 'https://coupontalk.kr/subscriptions' }, { '@type': 'ListItem', position: 3, name: guide.title, item: url }] },
    ] }) }} />
  </article>;
}
