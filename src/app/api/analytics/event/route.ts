import { NextResponse } from "next/server";
import { analyticsDb, isAnalyticsAdmin } from "@/lib/analytics-server";
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (!origin || origin !== new URL(request.url).origin)
      return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
    if (
      /bot|crawler|spider|headless|playwright/i.test(
        request.headers.get("user-agent") || "",
      )
    )
      return new Response(null, { status: 204 });
    const raw = await request.text();
    if (raw.length > 5000) return new Response(null, { status: 413 });
    let b;
    try {
      b = JSON.parse(raw);
    } catch {
      return new Response(null, { status: 400 });
    }
    if (
      !["page_view", "affiliate_click", "code_copy"].includes(b.event_name) ||
      ![b.id, b.session_id, b.visitor_id].every(
        (v) => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(v),
      )
    )
      return new Response(null, { status: 400 });
    if (
      typeof b.path !== "string" ||
      !b.path.startsWith("/") ||
      b.path.startsWith("//") ||
      b.path.includes("?") ||
      b.path.length > 600 ||
      b.path.startsWith("/admin")
    )
      return new Response(null, { status: 400 });
    const text = (v: unknown, n = 150) =>
      typeof v === "string" ? v.slice(0, n) : null;
    const parts = b.path.split("/");
    let host = null;
    if (b.target_url) {
      try {
        const u = new URL(b.target_url);
        if (
          !["http:", "https:"].includes(u.protocol) ||
          u.username ||
          u.password
        )
          throw Error();
        host = u.hostname;
      } catch {
        return new Response(null, { status: 400 });
      }
    }
    const db = analyticsDb();
    const { count, error: ce } = await db
      .from("analytics_events")
      .select("id", { count: "exact", head: true })
      .eq("session_id", b.session_id)
      .gte("created_at", new Date(Date.now() - 300000).toISOString());
    if (ce) throw ce;
    if ((count || 0) > 300) return new Response(null, { status: 429 });
    let store = text(b.store_id);
    const coupon =
        text(b.coupon_id) ||
        (parts[1] === "store" && parts[3] === "coupon" ? text(parts[4]) : null),
      product = text(b.product_id);
    if (coupon || product) {
      const { data, error } = await db
        .from(coupon ? "coupons" : "products")
        .select("store_id")
        .eq("id", coupon || product)
        .maybeSingle();
      if (error) throw error;
      store = data?.store_id || store;
    }
    if (!store && parts[1] === "store")
      store = decodeURIComponent(parts[2] || "");
    const record = {
      id: b.id,
      event_name: b.event_name,
      session_id: b.session_id,
      visitor_id: b.visitor_id,
      path: b.path,
      landing_path:
        typeof b.landing_path === "string" && b.landing_path.startsWith("/")
          ? b.landing_path.split("?")[0].slice(0, 600)
          : b.path,
      source: text(b.source) || "직접/출처 불명",
      keyword: text(b.keyword),
      store_id: store,
      coupon_id: coupon,
      product_id: product,
      subscription_slug:
        parts[1] === "subscriptions" ? parts[2] || "목록" : null,
      target_host: host,
      button_label: text(b.button_label, 100),
      device: b.device === "mobile" ? "mobile" : "desktop",
      is_test:
        b.is_test === true ||
        (await isAnalyticsAdmin(request)) ||
        !["coupontalk.kr", "www.coupontalk.kr"].includes(
          new URL(request.url).hostname,
        ),
    };
    const { error } = await db
      .from("analytics_events")
      .upsert(record, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Event not saved" }, { status: 500 });
  }
}
