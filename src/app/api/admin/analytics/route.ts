import { NextResponse } from "next/server";
import { analyticsDb, isAnalyticsAdmin } from "@/lib/analytics-server";
import {
  dateRange,
  groupEvents,
  koreaDay,
  metrics,
  type AnalyticsEvent,
} from "@/lib/analytics";
import { analyticsLabels } from "@/lib/analytics-labels";
import { subscriptionGuides } from "@/lib/subscription-guides";
import { gamsgoPromoCode } from "@/lib/gamsgo-promotion";
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
    const db = analyticsDb(request),
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
        (e) => !e.is_test && Date.parse(e.created_at) < range.previousTo,
      );
    const [stores, coupons, oldViews, oldClicks, first, products] =
      await Promise.all([
        db.from("stores").select("id,name"),
        db.from("coupons").select("id,title,store_id,code").limit(10000),
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
        db.from("products").select("id,title,store_id"),
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
    const labels = analyticsLabels(
      stores.data || [],
      coupons.data || [],
      products.data || [],
      subscriptionGuides,
      gamsgoPromoCode,
    );
    const pageRows = (rows: ReturnType<typeof groupEvents>) =>
      rows.map((r) => ({ ...r, label: labels.page(r.name) }));
    const groups = {
      products: groupEvents(current, (e) => e.product_id || "").map((r) => ({
        ...r,
        label: labels.product(r.name),
      })),
      sources: groupEvents(current, (e) => e.source),
      landings: pageRows(groupEvents(current, (e) => e.landing_path)),
      pages: pageRows(groupEvents(current, (e) => e.path)),
      stores: groupEvents(current, (e) => e.store_id || "").map((r) => ({
        ...r,
        label: labels.store(r.name),
      })),
      coupons: groupEvents(current, (e) => e.coupon_id || "").map((r) => ({
        ...r,
        label: labels.coupon(r.name),
      })),
      subscriptions: groupEvents(current, (e) => e.subscription_slug || "").map(
        (r) => ({ ...r, label: labels.subscription(r.name) }),
      ),
      targets: groupEvents(
        current.filter((e) => e.event_name !== "page_view"),
        (e) => labels.target(e),
      ),
      buttons: groupEvents(
        current.filter((e) => e.event_name !== "page_view"),
        (e) => [e.path, e.button_label || "이름 없는 버튼"].join(" → "),
      ).map((r) => {
        const [path, button] = r.name.split(" → ");
        return { ...r, label: labels.page(path) + " · " + button };
      }),
      keywords: groupEvents(current, (e) => e.keyword || ""),
      devices: groupEvents(current, (e) => e.device || "미확인"),
      journeys: groupEvents(
        current,
        (e) => e.source + " → " + labels.page(e.landing_path),
      ),
      tests: pageRows(
        groupEvents(
          all.filter((e) => e.is_test),
          (e) => e.path,
        ),
      ),
    };
    const snapshot = new Date(range.to).toISOString();
    const [totalViews, totalClicks] = await Promise.all([
      db
        .from("page_views")
        .select("id", { head: true, count: "exact" })
        .lt("created_at", snapshot),
      db
        .from("click_events")
        .select("id", { head: true, count: "exact" })
        .lt("created_at", snapshot),
    ]);
    if (totalViews.error) throw totalViews.error;
    if (totalClicks.error) throw totalClicks.error;
    const legacyPages = new Map<string, number>(),
      legacyCoupons = new Map<string, number>();
    for (const table of ["page_views", "click_events"] as const) {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await db
          .from(table)
          .select(
            table === "page_views"
              ? "id,path,created_at"
              : "id,coupon_id,created_at",
          )
          .gte("created_at", new Date(range.from).toISOString())
          .lt("created_at", snapshot)
          .order("created_at")
          .order("id")
          .range(offset, offset + 999);
        if (error) throw error;
        for (const row of data) {
          const value = row as unknown as { path?: string; coupon_id?: string };
          const key =
            table === "page_views"
              ? value.path || "경로 미기록"
              : value.coupon_id || "쿠폰 미연결";
          const map = table === "page_views" ? legacyPages : legacyCoupons;
          map.set(key, (map.get(key) || 0) + 1);
        }
        if (data.length < 1000) break;
        if (offset >= 199000) throw Error("기간을 줄여주세요.");
      }
    }
    const legacy = {
      totalViews: totalViews.count || 0,
      totalClicks: totalClicks.count || 0,
      pages: [...legacyPages]
        .map(([name, count]) => ({ name, label: labels.page(name), count }))
        .sort((a, b) => b.count - a.count),
      coupons: [...legacyCoupons]
        .map(([name, count]) => ({ name, label: labels.coupon(name), count }))
        .sort((a, b) => b.count - a.count),
    };
    return NextResponse.json(
      {
        legacy,
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
          pages: pageRows(
            groupEvents(
              current.filter((e) => e.store_id === s.name),
              (e) => e.path,
            ),
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
