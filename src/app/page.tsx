import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import StoreCard from '@/components/StoreCard';
import { supabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const { data: categories } = await supabase.from('categories').select('*');
  const { data: stores } = await supabase.from('stores')
    .select('*, coupons(*)')
    .order('rating', { ascending: false })
    .limit(3);

  return (
    <div className="container mx-auto">

      {/* Hero Section */}
      <section className="mb-16 mt-8 animate-fade-in flex flex-col md:flex-row gap-8 items-center glass rounded-3xl p-8 md:p-12 overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 transform -translate-x-1/2 translate-y-1/2"></div>

        <div className="flex-1 relative z-10">
          <span className="inline-block py-1 px-3 rounded-full bg-blue-100 text-blue-700 text-sm font-bold tracking-wider mb-4">
            매일 오전 9시 업데이트
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-tight">
            가장 확실한<br />
            <span style={{ color: 'var(--brand-primary)' }}>할인코드만</span> 모았습니다
          </h1>
          <p className="text-lg text-gray-600 mb-8 max-w-lg">
            직접 테스트한 100% 검증된 할인코드. 쿠팡, 알리익스프레스, 아고다 등 원하는 쇼핑몰의 할인을 지금 바로 적용하세요.
          </p>
          <div className="flex gap-4">
            <Link href="#popular-stores" className="btn-primary">
              인기 쇼핑몰 할인 보기
            </Link>
            <Link href="#categories" className="px-6 py-3 rounded-full font-medium text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm">
              카테고리 둘러보기
            </Link>
          </div>
        </div>

        <div className="flex-1 hidden md:flex justify-center relative z-10 w-full">
          {/* Abstract Graphic representation instead of image since we don't have images */}
          <div className="relative w-full max-w-sm aspect-square bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 flex flex-col gap-4 transform rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="h-8 bg-gray-100 rounded-lg w-1/3 mb-4"></div>
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 items-center">
              <div className="w-12 h-12 rounded-full bg-blue-200 flex-shrink-0 animate-pulse"></div>
              <div className="flex-1 gap-2 flex flex-col">
                <div className="h-4 bg-blue-300 rounded w-full"></div>
                <div className="h-4 bg-blue-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex gap-4 items-center opacity-70">
              <div className="w-12 h-12 rounded-full bg-green-200 flex-shrink-0"></div>
              <div className="flex-1 gap-2 flex flex-col">
                <div className="h-4 bg-green-300 rounded w-full"></div>
                <div className="h-4 bg-green-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="mt-auto pt-4 border-t flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-blue-600 rounded-lg w-1/3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <span>카테고리별 할인</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories?.map((cat, i) => {
            // Dynamically render lucide icon
            const IconComponent = (LucideIcons as any)[cat.icon];
            return (
              <Link
                href={`/category/${cat.id}`}
                key={cat.id}
                className="card p-6 flex flex-col items-center justify-center text-center hover:bg-blue-50 group"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="w-14 h-14 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {IconComponent && <IconComponent size={28} strokeWidth={1.5} />}
                </div>
                <h3 className="font-semibold text-gray-900">{cat.name}</h3>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Popular Stores Section */}
      <section id="popular-stores" className="mb-16 scroll-mt-24">
        <div className="flex justify-between items-end mb-6">
          <h2 className="text-2xl font-bold">할인율 TOP & 최저가 쿠폰 및 제품 리스트 🔥</h2>
          <Link href="/store" className="text-sm font-semibold text-blue-600 hover:underline">
            전체 보기
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stores?.map((store: any) => (
            <StoreCard key={store.id} store={store} />
          ))}
        </div>
      </section>

      {/* Stats/Trust Section */}
      <section className="bg-blue-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-xl">
        <h2 className="text-3xl font-bold mb-8">왜 쿠폰톡을 선택할까요?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="text-4xl font-extrabold mb-2 text-blue-200">5년+</div>
            <p className="font-medium text-lg">노하우 축적</p>
            <p className="text-blue-100 text-sm mt-2">직접 테스트하고 검증한 코드만 제공합니다.</p>
          </div>
          <div>
            <div className="text-4xl font-extrabold mb-2 text-blue-200">매일</div>
            <p className="font-medium text-lg">실시간 업데이트</p>
            <p className="text-blue-100 text-sm mt-2">만료된 코드 걱정 없이 바로 사용하세요.</p>
          </div>
          <div>
            <div className="text-4xl font-extrabold mb-2 text-blue-200">100%</div>
            <p className="font-medium text-lg">무료 이용</p>
            <p className="text-blue-100 text-sm mt-2">모든 쿠폰 코드를 회원가입 없이 제공합니다.</p>
          </div>
        </div>
      </section>

    </div>
  );
}
