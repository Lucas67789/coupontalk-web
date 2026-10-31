import { NextResponse } from "next/server";
import { analyticsDb, isAnalyticsAdmin } from "@/lib/analytics-server";
import {
  dateRange,
  groupEvents,
  koreaDay,
  metrics,
  type AnalyticsEvent,
} from "@/lib/analytics";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  if (!(await isAnalyticsAdmin(request)))
    return NextResponse.json(
      { error: "관리자 로그인이 필요합니다." },
      { status: 403 },
    );
  try {
    const u = new URL(request.url);
    let range;
    try {
      range = dateRange(
        u.searchParams.get("start") || koreaDay(),
        u.searchParams.get("end") || koreaDay(),
      );
    } catch (e) {
      return NextResponse.json(
        { error: (e as Error).message },
        { status: 400 },
      );
    }
    const db = analyticsDb(),
      events: AnalyticsEvent[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await db
        .from("analytics_events")
        .select("*")
        .gte("created_at", new Date(range.previousFrom).toISOString())
        .lt("created_at", new Date(range.to).toISOString())
        .order("created_at")
        .order("id")
        .range(offset, offset + 999);
      if (error) throw error;
      events.push(...data);
      if (data.length < 1000) break;
      if (offset >= 199000)
        throw Error("조회량이 많습니다. 기간을 줄여주세요.");
    }
    const all = events.filter((e) => Date.parse(e.created_at) >= range.from),
      current = all.filter((e) => !e.is_test),
      previous = events.filter(
        (e) => !e.is_test && Date.parse(e.created_at) < range.from,
      );
    const [stores, coupons, oldViews, oldClicks, first, products] =
      await Promise.all([
        db.from("stores").select("id,name"),
        db.from("coupons").select("id,title").limit(10000),
        db
          .from("page_views")
          .select("id", { head: true, count: "exact" })
          .gte("created_at", new Date(range.from).toISOString())
          .lt("created_at", new Date(range.to).toISOString()),
        db
          .from("click_events")
          .select("id", { head: true, count: "exact" })
          .gte("created_at", new Date(range.from).toISOString())
          .lt("created_at", new Date(range.to).toISOString()),
        db
          .from("analytics_events")
          .select("created_at")
          .order("created_at")
          .limit(1),
        db.from("products").select("id,title"),
      ]);
    for (const result of [
      stores,
      coupons,
      oldViews,
      oldClicks,
      first,
      products,
    ])
      if (result.error) throw result.error;
    const names = new Map(stores.data?.map((s) => [s.id, s.name])),
      titles = new Map(coupons.data?.map((c) => [c.id, c.title]));
    const productTitles = new Map(products.data?.map((p) => [p.id, p.title]));
    const groups = {
      products: groupEvents(current, (e) => e.product_id || "").map((r) => ({
        ...r,
        label: productTitles.get(r.name) || r.name,
      })),
      sources: groupEvents(current, (e) => e.source),
      landings: groupEvents(current, (e) => e.landing_path),
      pages: groupEvents(current, (e) => e.path),
      stores: groupEvents(current, (e) => e.store_id || "").map((r) => ({
        ...r,
        label: names.get(r.name) || r.name,
      })),
      coupons: groupEvents(current, (e) => e.coupon_id || "").map((r) => ({
        ...r,
        label: titles.get(r.name) || r.name,
      })),
      subscriptions: groupEvents(current, (e) => e.subscription_slug || ""),
      buttons: groupEvents(
        current.filter((e) => e.event_name !== "page_view"),
        (e) => [e.path, e.button_label || "이름 없는 버튼"].join(" → "),
      ),
      keywords: groupEvents(current, (e) => e.keyword || ""),
      devices: groupEvents(current, (e) => e.device || "미확인"),
      journeys: groupEvents(current, (e) => e.source + " → " + e.landing_path),
      tests: groupEvents(
        all.filter((e) => e.is_test),
        (e) => e.path,
      ),
    };
    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        range,
        summary: metrics(current),
        previous: metrics(previous),
        daily: groupEvents(current, (e) =>
          koreaDay(Date.parse(e.created_at)),
        ).sort((a, b) => a.name.localeCompare(b.name)),
        groups,
        quality: {
          testEvents: all.length - current.length,
          missingKeywordSessions: metrics(
            current.filter(
              (e) => ["네이버", "구글", "빙"].includes(e.source) && !e.keyword,
            ),
          ).sessions,
          legacyViews: oldViews.count,
          legacyClicks: oldClicks.count,
          firstEvent: first.data?.[0]?.created_at || null,
        },
        storeDetails: groups.stores.map((s) => ({
          id: s.name,
          pages: groupEvents(
            current.filter((e) => e.store_id === s.name),
            (e) => e.path,
          ),
        })),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    console.error(
      "Analytics report failed",
      e instanceof Error ? e.message : "database error",
    );
    return NextResponse.json(
      {
        error:
          "통계 조회에 실패했습니다. 기간을 줄이거나 다시 시도해주세요. 누락된 결과를 표시하지 않습니다.",
      },
      { status: 500 },
    );
  }
}
