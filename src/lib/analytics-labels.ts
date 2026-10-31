type Store = { id: string; name: string };
type Coupon = {
  id: string;
  title: string;
  store_id?: string | null;
  code?: string | null;
};
type Product = { id: string; title: string; store_id?: string | null };
type EventTarget = {
  path: string;
  coupon_id?: string | null;
  product_id?: string | null;
  store_id?: string | null;
  subscription_slug?: string | null;
};
export function analyticsLabels(
  stores: Store[],
  coupons: Coupon[],
  products: Product[],
  subscriptions: { slug: string; service: string }[],
  promo: string,
) {
  const sm = new Map(stores.map((s) => [s.id, s.name])),
    cm = new Map(coupons.map((c) => [c.id, c])),
    pm = new Map(products.map((p) => [p.id, p])),
    gm = new Map(subscriptions.map((g) => [g.slug, g.service]));
  const store = (id: string) => sm.get(id) || "스토어 정보 미연결";
  const coupon = (id: string) => {
    const c = cm.get(id);
    if (!c) return "쿠폰 정보 미연결";
    const code = c.code?.trim();
    const hasCode =
      code &&
      !["NO_CODE_REQUIRED", "없음", "코드 필요없음"].includes(code) &&
      !/자동\s*적용|코드\s*(불필요|필요\s*없음)|본문\s*참고|금액별\s*상이/.test(
        code,
      );
    return `${store(c.store_id || "")} · ${c.title} · ${hasCode ? "안내 코드: " + code : "코드 입력 불필요 또는 상세 조건 확인"}`;
  };
  const product = (id: string) => {
    const p = pm.get(id);
    return p ? `${store(p.store_id || "")} · ${p.title}` : "상품 정보 미연결";
  };
  const subscription = (slug: string) =>
    gm.has(slug)
      ? `겜스고 · ${gm.get(slug)} · 안내 코드: ${promo}`
      : "구독 할인 목록";
  const page = (path: string) => {
    let p;
    try {
      p = decodeURIComponent(path.split("?")[0]).split("/").filter(Boolean);
    } catch {
      return "페이지 정보 미연결";
    }
    if (!p.length) return "쿠폰톡 홈";
    if (p[0] === "store") {
      if (!p[1]) return "전체 스토어 목록";
      if (p[2] === "coupon" && p[3]) return coupon(p[3]);
      return store(p[1]) + " · 할인정보 모음";
    }
    if (p[0] === "subscriptions")
      return p[1] ? subscription(p[1]) : "구독 할인 목록";
    if (p[0] === "category")
      return (
        ({
          travel: "여행",
          fashion: "패션",
          electronics: "전자제품",
          health: "건강식품",
        }[p[1]] || "카테고리") + " 할인 목록"
      );
    return (
      (
        {
          about: "쿠폰톡 소개",
          contact: "제휴·문의",
          faq: "자주 묻는 질문",
          privacy: "개인정보 처리 안내",
          terms: "이용약관",
          __analytics_verification: "통계 검증 전용 페이지",
        } as Record<string, string>
      )[p[0]] || "기타 페이지 (정보 미연결)"
    );
  };
  const target = (e: EventTarget) =>
    e.coupon_id
      ? coupon(e.coupon_id)
      : e.product_id
        ? product(e.product_id)
        : e.subscription_slug
          ? subscription(e.subscription_slug)
          : e.store_id
            ? store(e.store_id) + " · 스토어 바로가기"
            : page(e.path);
  return { store, coupon, product, subscription, page, target };
}
