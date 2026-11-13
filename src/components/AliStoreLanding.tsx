import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight, CalendarDays, CheckCircle2, ChevronRight, ShieldCheck } from 'lucide-react';
import type { CouponRow, Faq, ProductRow, StoreRow } from '@/lib/models';
import { aliEventLabel, aliOfferInfo, aliOfferRows, aliPaymentContent } from '@/lib/ali-store';
import { safeAffiliateUrl } from '@/lib/affiliate';
import { couponStatus } from '@/lib/utils';
import { contentImages } from '@/lib/content-images';
import AliOfferTable from './AliOfferTable';
import AliCouponHowTo from './AliCouponHowTo';
import { MarkdownRenderer } from './MarkdownRenderer';
import ProductCard from './ProductCard';
import styles from './AliStoreLanding.module.css';

function Banner({ kind, eyebrow, title, description }: { kind: 'campaign' | 'payment' | 'guide'; eyebrow: string; title: string; description: string }) {
  return <div className={`${styles.banner} ${styles[kind]}`}>
    <Image src={`/images/ali-store/${kind}.webp`} alt={kind === 'campaign' ? '선물 상자와 쇼핑 바구니로 표현한 알리 행사 안내' : kind === 'payment' ? '카드와 휴대폰으로 표현한 결제 혜택 안내' : '쿠폰과 휴대폰으로 표현한 코드 사용법 안내'} fill sizes="(max-width: 768px) 100vw, 960px" className={styles.art} />
    <div className={styles.bannerCopy}><p className={styles.eyebrow}>{eyebrow}</p><h3>{title}</h3><p className={styles.bannerDescription}>{description}</p></div>
  </div>;
}

export default function AliStoreLanding({ store, coupons, expiredCoupons, products, faqs, dateModified, now }: {
  store: StoreRow; coupons: CouponRow[]; expiredCoupons: CouponRow[]; products: ProductRow[]; faqs: Faq[]; dateModified?: string; now: string;
}) {
  const ongoing = coupons.filter(c => couponStatus(c, Date.parse(now)) === 'active');
  const upcoming = coupons.filter(c => couponStatus(c, Date.parse(now)) === 'upcoming');
  const ordered = [...ongoing, ...upcoming];
  const count = ongoing.reduce((n, c) => n + aliOfferRows(c).filter(r => r.code).length, 0);
  const storeUrl = safeAffiliateUrl(store.website_url) || (ongoing[0] ? aliOfferInfo(ongoing[0]).url : null);
  const paymentOffers = ongoing.map(c => ({ coupon: c, content: aliPaymentContent(c.content_body || '') })).filter(c => c.content);
  const month = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', timeZone: 'Asia/Seoul' }).format(new Date(now));
  const updated = dateModified ? new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(new Date(dateModified)) : null;
  const nav = [['#coupons', '할인코드'], ['#ali-events', '행사별 혜택'], ['#ali-payment', '결제 할인'], ['#quick-how-to', '사용 방법'], ['#faq', '자주 묻는 질문']];

  return <div className={styles.page}>
    <header className={styles.header}>
      <div className="flex items-center justify-between gap-3"><Link href="/store" className="text-xs text-slate-500 hover:text-red-600">스토어 <ChevronRight className="inline" size={12} /> 알리익스프레스</Link><span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-red-700">{month}</span></div>
      <div className="mt-6 flex items-center gap-4"><div className={styles.brand} aria-hidden="true">Ali<span>Express</span></div><div><p className="mb-1 text-xs font-bold tracking-widest text-red-600">COUPONTALK SHOPPING GUIDE</p><h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">알리익스프레스 할인코드</h1></div></div>
      <p className="mt-4 text-sm leading-6 text-slate-600">지금 등록된 프로모션부터 결제 혜택까지.<br className="sm:hidden" /> 내 구매 금액에 맞는 할인을 한곳에서 확인하세요.</p>
      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500"><span><span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />진행 기간 내 행사 {ongoing.length}개 · 코드 {count}종</span>{upcoming.length > 0 && <span>시작 예정 {upcoming.length}개</span>}{updated && <span>내용 수정 {updated}</span>}</div>
      <p className="mt-3 text-[11px] text-slate-400">제휴 링크를 통한 구매 시 쿠폰톡이 수수료를 받을 수 있습니다. 실제 적용은 판매처 결제 화면을 확인하세요.</p>
    </header>

    <nav aria-label="알리 할인 정보 바로가기" className={styles.nav}>{nav.map(([href, label], i) => <a key={href} href={href} className={i === 0 ? styles.selected : ''}>{label}</a>)}</nav>

    <section id="coupons" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>01 / PROMOTION CODES</p><h2>현재 할인코드 한눈에 보기</h2></div><span className={styles.pill}>{count}종</span></div>
      <p className={styles.intro}>코드별 구매 조건을 비교하고 선택하세요. 같은 주문에 여러 코드를 더해 쓰는 혜택은 아닙니다.</p>
      {ongoing.length ? <AliOfferTable coupons={ongoing} now={now} summary /> : <div className={styles.empty}>현재 등록된 진행 기간 내 할인코드가 없습니다. 예정 행사는 아래에서 확인하세요.</div>}
      <a href="#ali-events" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-slate-500">행사 기간과 상세 조건 보기 <ArrowDown size={14} /></a>
    </section>

    <section id="ali-events" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>02 / EVENT COLLECTION</p><h2>행사별로 더 자세히</h2></div></div>
      <p className={styles.intro}>기간·적용 대상·구매 조건을 확인하고, 원하는 행사로 이동하세요.</p>
      <div className="space-y-8">{ordered.map(coupon => {
        const info = aliOfferInfo(coupon);
        const isUpcoming = couponStatus(coupon, Date.parse(now)) === 'upcoming';
        const isFlagship = coupon.id === 'coupon-aliexpress-nov2026-1111';
        const thumbnail = contentImages(coupon.content_body)[0];
        return <article key={coupon.id} id={`ali-event-${coupon.id}`} className="scroll-mt-36 overflow-hidden rounded-2xl border border-slate-200 bg-white">
          {isFlagship || !thumbnail ? <Banner kind="campaign" eyebrow={isUpcoming ? 'COMING SOON' : 'ALIEXPRESS SPECIAL'} title={aliEventLabel(coupon.title)} description={coupon.discount || '행사별 할인 혜택을 확인하세요'} /> : <div className="relative aspect-[3/1] bg-orange-50"><Image src={thumbnail} alt={coupon.title} fill sizes="(max-width: 768px) 100vw, 960px" className="object-contain" /></div>}
          <div className="p-4 sm:p-6"><div className="mb-4 flex flex-wrap items-center gap-2"><span className={`rounded-full px-2.5 py-1 text-xs font-bold ${isUpcoming ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-700'}`}>{isUpcoming ? '시작 예정' : '진행 기간 내'}</span><span className="inline-flex items-center gap-1 text-xs text-slate-500"><CalendarDays size={13} />종료일 {coupon.expiry || '판매처에서 확인'} · 한국시간</span></div>
            <h3 className="text-lg font-bold text-slate-900">{coupon.title}</h3><p className="mb-5 mt-2 whitespace-pre-line text-sm leading-7 text-slate-600">{info.condition}</p>
            <AliOfferTable coupons={[coupon]} now={now} />
            {info.url && !isUpcoming && <a data-store-affiliate="aliexpress" href={info.url} target="_blank" rel="sponsored nofollow noopener noreferrer" className="mt-4 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:bg-slate-700">{aliEventLabel(coupon.title)} 대상 상품 보기 <ArrowUpRight size={16} /></a>}
            <details className="mt-5 border-t border-slate-100 pt-4"><summary className="cursor-pointer text-sm font-semibold text-slate-600">행사 전체 안내 · 세부 조건 펼치기</summary><div className="mt-5"><MarkdownRenderer content={coupon.content_body || info.condition} storeName={store.name} /></div></details>
            <Link href={`/store/aliexpress/coupon/${encodeURIComponent(coupon.id)}`} className="mt-4 inline-block text-xs text-slate-400 underline underline-offset-4">이 행사 개별 페이지</Link>
          </div>
        </article>;
      })}{!ordered.length && <div className={styles.empty}>새 행사가 등록되면 이곳에서 안내합니다.</div>}</div>
    </section>

    <section id="ali-payment" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>03 / PAYMENT BENEFITS</p><h2>결제수단까지 비교하세요</h2></div></div>
      <div className="mt-5"><Banner kind="payment" eyebrow="CHECK BEFORE CHECKOUT" title="카드 · 간편결제 혜택" description="코드 적용 후, 결제 할인도 한 번 더 확인" /></div>
      <p className={styles.intro}>카드 발급사와 VISA·Mastercard 등 국제 브랜드, 해외직구·한국발송 상품 조건을 구분하세요. 중복 할인은 결제 화면에 실제 반영되는 경우에만 적용됩니다.</p>
      {paymentOffers.length ? paymentOffers.map(({ coupon, content }) => <div key={coupon.id} className="mt-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6"><p className="mb-4 text-xs font-semibold text-slate-500">{aliEventLabel(coupon.title)} · {coupon.expiry}까지 · 등록된 행사 안내 기준</p><MarkdownRenderer content={content} storeName={store.name} /><a href={`#ali-event-${coupon.id}`} className="mt-5 inline-flex text-sm font-bold text-red-600">해당 행사와 적용 조건 확인 ↑</a></div>) : <div className={styles.empty}>현재 등록된 결제수단별 할인 안내가 없습니다. 확인되지 않은 할인액은 표시하지 않습니다.</div>}
    </section>

    <section id="quick-how-to" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>04 / HOW TO USE</p><h2>복사부터 할인 확인까지</h2></div></div>
      <div className="mt-5"><Banner kind="guide" eyebrow="A LITTLE GUIDE, A BETTER DEAL" title="할인코드, 이렇게 쓰세요" description="복사 → 결제창 입력 → 할인 금액 확인" /></div>
      <AliCouponHowTo code={ongoing.flatMap(aliOfferRows).find(r => r.code)?.code || '할인코드 입력'} />
      <div className="mt-5 flex items-start gap-3 rounded-xl bg-orange-50 p-4 text-sm leading-6 text-orange-900"><ShieldCheck size={20} className="mt-0.5 shrink-0" /><p>할인코드를 복사해도 자동으로 적용되지는 않아요. 주문 전에 상품 금액·배송비·할인액을 함께 확인하세요.</p></div>
    </section>

    <section id="faq" className={styles.section}>
      <div className={styles.sectionHeading}><div><p className={styles.kicker}>05 / HELP DESK</p><h2>할인이 안 될 때, 먼저 확인</h2></div></div>
      <div className="mt-5 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5">{faqs.map((faq, index) => <details key={index} className="py-5" open={index === 0}><summary className="cursor-pointer text-sm font-bold leading-6 text-slate-800">{faq.question}</summary><p className="mt-3 text-sm leading-7 text-slate-600">{faq.answer}</p></details>)}</div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">{['최소 구매 금액 충족', '대상 상품과 결제 통화', '행사 기간과 선착순 소진'].map(text => <p key={text} className="flex items-center gap-2 rounded-xl bg-slate-100 p-4 text-xs font-semibold text-slate-600"><CheckCircle2 size={16} className="text-emerald-600" />{text}</p>)}</div>
    </section>

    {!!products.length && <section className={styles.section}><div className={styles.sectionHeading}><h2>함께 확인할 상품</h2></div><div className="mt-5 space-y-4">{products.map(p => <ProductCard key={p.id} product={p} storeName={store.name} />)}</div></section>}
    {!!expiredCoupons.length && <details className="mx-4 mb-8 rounded-xl border border-slate-200 p-5 text-sm sm:mx-8"><summary className="cursor-pointer font-semibold text-slate-500">종료된 행사 기록 {expiredCoupons.length}개</summary><p className="mt-3 text-xs text-slate-400">현재 사용할 수 없는 지난 혜택입니다.</p><ul className="mt-3 divide-y divide-slate-100">{expiredCoupons.map(c => <li key={c.id} className="py-3"><Link href={`/store/aliexpress/coupon/${encodeURIComponent(c.id)}`} className="text-slate-500 hover:underline">{c.title}</Link><span className="mt-1 block text-xs text-slate-400">{c.expiry}</span></li>)}</ul></details>}
    <div className={styles.sticky}><div><a href="#coupons" className={styles.codeButton}>할인코드 {count ? `${count}종` : ''} 보기</a>{storeUrl && <a data-store-affiliate="aliexpress" href={storeUrl} target="_blank" rel="sponsored nofollow noopener noreferrer" className={styles.storeButton}>알리 상품 보기 <ArrowUpRight size={16} /></a>}</div></div>
  </div>;
}
