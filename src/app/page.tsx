import { jsonLd as serializeJsonLd } from '@/lib/content-safety';
import Link from 'next/link';
import CouponCard from '@/components/CouponCard';
import { supabase, fetchAllRows } from '@/lib/supabase';
import { isCouponExpired } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export const metadata = { alternates: { canonical: 'https://coupontalk.kr' } };

export default async function Home() {
  // 참고: 검색(SearchAction)은 이 페이지에서 직접 필터링하지 않고,
  // 실제로 검색 로직이 구현되어 있는 /store 페이지(StoreList 컴포넌트)로 위임합니다.
  // (예전에 여기서 searchParams.q를 받아 처리하려 했지만 사용되는 곳이 없어 죽은 코드였음 - 제거)
  const now = new Date().toISOString();

  const categoriesPromise = supabase.from('categories').select('*');
  
  const newCouponsPromise = fetchAllRows(supabase.from('coupons')
    .select('*, stores(name, id)')
    .eq('status', 'published')
    .lte('published_at', now)
    .order('published_at', { ascending: false, nullsFirst: false })
    );

  const popularCouponsPromise = fetchAllRows(supabase.from('coupons')
    .select('*, stores(name, id)')
    .eq('status', 'published')
    .lte('published_at', now)
    .order('click_count', { ascending: false, nullsFirst: false })
    );

  const [
    { data: categories },
    { data: rawNewCoupons },
    { data: rawPopularCoupons }
  ] = await Promise.all([
    categoriesPromise,
    newCouponsPromise,
    popularCouponsPromise
  ]);

  // Filter out expired coupons from homepage lists
  const newCoupons = (rawNewCoupons || []).filter((c) => !isCouponExpired(c.expiry, c.title)).slice(0, 6);
  const popularCoupons = (rawPopularCoupons || []).filter((c) => !isCouponExpired(c.expiry, c.title)).slice(0, 6);

  return (
    <div className="container mx-auto px-4 pb-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd({ '@context': 'https://schema.org', '@type': 'WebSite', name: '쿠폰톡', url: 'https://coupontalk.kr/', potentialAction: { '@type': 'SearchAction', target: 'https://coupontalk.kr/store?q={search_term_string}', 'query-input': 'required name=search_term_string' } }) }} />
      <section className="rounded-3xl border border-blue-100 bg-white px-6 py-8 md:px-10 md:py-12 mb-8">
        <p className="text-sm font-semibold text-blue-700 mb-3">쿠폰톡 · 조건까지 비교하는 할인 정보</p>
        <h1 className="text-3xl md:text-5xl font-extrabold leading-tight tracking-tight">찾는 상품의 할인,<br className="sm:hidden" /> 여기서 확인하세요.</h1>
        <p className="mt-4 text-gray-600">호텔 예약부터 노트북까지. 브랜드·상품명·모델번호로 내게 맞는 혜택을 찾아보세요.</p>
        <form action="/store" role="search" className="mt-6 flex gap-2 max-w-2xl">
          <label htmlFor="coupon-search" className="sr-only">브랜드, 상품명, 모델번호 검색</label>
          <input id="coupon-search" name="q" type="search" placeholder="아고다, 클룩 일본 호텔, 레노버 모델번호" className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-4 py-4 text-base focus:outline-none focus:ring-2 focus:ring-blue-600" />
          <button type="submit" className="rounded-xl bg-blue-600 px-5 py-4 font-bold text-white hover:bg-blue-700 shrink-0">검색</button>
        </form>
        <div className="mt-5 flex flex-wrap gap-2" aria-label="브랜드 바로가기">
          {[["agoda", "아고다"], ["klook", "클룩"], ["lenovo", "레노버"], ["hotelskr", "호텔스닷컴"], ["aliexpress", "알리익스프레스"]].map(([id, name]) => <Link key={id} href={`/store/${id}`} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold hover:border-blue-500 hover:text-blue-700">{name}</Link>)}
          <Link href="/store" className="px-4 py-2 text-sm font-semibold text-blue-700">모든 브랜드 →</Link>
        </div>
      </section>
      <nav aria-label="카테고리" className="flex flex-wrap gap-2 mb-10">
        {categories?.map(cat => <Link key={cat.id} href={`/category/${cat.id}`} className="rounded-lg bg-slate-100 px-4 py-3 text-sm font-semibold hover:bg-blue-50">{cat.name}</Link>)}
      </nav>
      <section className="mb-12" id="new-coupons">
        <div className="flex items-center justify-between mb-5"><h2 className="text-2xl font-bold">새로 등록된 혜택</h2><Link href="/store" className="text-sm text-blue-700">전체 보기 →</Link></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{newCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} storeName={coupon.stores?.name} storeId={coupon.store_id} />)}</div>
      </section>
      <section className="mb-12" id="popular-coupons">
        <h2 className="text-2xl font-bold mb-5">많이 찾는 할인 혜택</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">{popularCoupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} storeName={coupon.stores?.name} storeId={coupon.store_id} />)}</div>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 md:p-8">
        <h2 className="text-xl font-bold mb-3">예약·구매 전, 세 가지만 확인하세요</h2>
        <div className="grid md:grid-cols-3 gap-5 text-sm text-gray-600"><p><strong className="block text-gray-900 mb-1">01 적용 대상</strong>상품·지역·모델과 신규 고객 조건을 확인하세요.</p><p><strong className="block text-gray-900 mb-1">02 할인 한도와 기간</strong>최소 결제금액과 최대 할인액, 사용 마감일을 비교하세요.</p><p><strong className="block text-gray-900 mb-1">03 최종 결제금액</strong>할인 적용 내역과 추가 비용은 판매처 결제 화면에서 확인하세요.</p></div>
      </section>
    </div>
  );
}
