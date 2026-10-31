"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { supabase } from "@/lib/supabase";
import { koreaDay } from "@/lib/analytics";
import {
  ArrowUpRight,
  Download,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  MousePointer2,
  Eye,
} from "lucide-react";
type Row = {
  name: string;
  label?: string;
  sessions: number;
  views: number;
  clicks: number;
  copies: number;
  rate: number;
};
type Report = {
  legacy: {
    totalViews: number;
    totalClicks: number;
    pages: { name: string; label?: string; count: number }[];
    coupons: { name: string; label?: string; count: number }[];
  };
  updatedAt: string;
  range: { from: number; to: number; previousFrom: number; previousTo: number };
  summary: Row;
  previous: Row;
  daily: Row[];
  groups: Record<string, Row[]>;
  quality: {
    testEvents: number;
    missingKeywordSessions: number;
    legacyViews: number;
    legacyClicks: number;
    firstEvent: string | null;
  };
  storeDetails: { id: string; pages: Row[] }[];
};
const tabs = ["요약", "유입 분석", "스토어·쿠폰", "구독 서비스", "데이터 품질"];
const fmt = (n: number) => n.toLocaleString("ko-KR");
function change(n: number, p: number) {
  return p
    ? `${n >= p ? "+" : ""}${(((n - p) / p) * 100).toFixed(1)}%`
    : "이전 기간 기준 없음";
}
function stamp(s: string | number) {
  return new Date(s).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
}
function Table({
  title,
  rows,
  onRow,
}: {
  title: string;
  rows: Row[];
  onRow?: (r: Row) => void;
}) {
  const [query, setQuery] = useState(""),
    [sort, setSort] = useState("sessions");
  const visible = rows
    .filter((r) =>
      (r.label || r.name).toLowerCase().includes(query.toLowerCase()),
    )
    .sort(
      (a, b) => Number(b[sort as keyof Row]) - Number(a[sort as keyof Row]),
    );
  function csv() {
    const values = [
      [
        "항목",
        "방문 세션",
        "조회",
        "제휴 클릭",
        "코드 복사",
        "클릭 세션 비율(%)",
      ],
      ...visible.map((r) => [
        r.label || r.name,
        r.sessions,
        r.views,
        r.clicks,
        r.copies,
        r.rate.toFixed(1),
      ]),
    ];
    const str =
      "\ufeff" +
      values
        .map((row) =>
          row
            .map(
              (v) =>
                '"' +
                String(v)
                  .replace(/^[=+@-]/, "'$&")
                  .replaceAll('"', '""') +
                '"',
            )
            .join(","),
        )
        .join("\r\n");
    const url = URL.createObjectURL(
        new Blob([str], { type: "text/csv;charset=utf-8" }),
      ),
      a = document.createElement("a");
    a.href = url;
    a.download = title + ".csv";
    a.click();
    URL.revokeObjectURL(url);
  }
  return (
    <section className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="p-5 flex flex-wrap gap-3 justify-between items-center">
        <div>
          <h2 className="font-bold text-lg">{title}</h2>
          <p className="text-xs text-slate-500 mt-1">
            {fmt(visible.length)}개 항목 · 열 제목으로 정렬
          </p>
        </div>
        <div className="flex gap-2 items-center">
          <label className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <Search size={16} />
            <input
              aria-label={title + " 검색"}
              placeholder="항목 검색"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-28 sm:w-40 outline-none text-sm"
            />
          </label>
          <button
            onClick={csv}
            aria-label={title + " CSV 다운로드"}
            className="p-2.5 rounded-lg border hover:bg-slate-50"
          >
            <Download size={18} />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="p-4 text-left min-w-64">항목</th>
              {[
                ["sessions", "방문 세션"],
                ["views", "조회"],
                ["clicks", "제휴 클릭"],
                ["copies", "코드 복사"],
                ["rate", "클릭 세션 비율"],
              ].map(([k, label]) => (
                <th key={k} className="px-4 py-3 whitespace-nowrap text-right">
                  <button onClick={() => setSort(k)}>
                    {label}
                    {sort === k ? " ↓" : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.slice(0, 100).map((r) => (
              <tr key={r.name} className="border-t hover:bg-blue-50/40">
                <td className="p-4 max-w-lg break-words">
                  {onRow ? (
                    <button
                      className="text-blue-700 text-left font-medium"
                      onClick={() => onRow(r)}
                    >
                      {r.label || r.name} ↗
                    </button>
                  ) : (
                    r.label || r.name
                  )}
                </td>
                {[r.sessions, r.views, r.clicks, r.copies].map((v, i) => (
                  <td key={i} className="p-4 text-right tabular-nums">
                    {fmt(v)}
                  </td>
                ))}
                <td className="p-4 text-right tabular-nums">
                  {r.rate.toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!visible.length && (
          <p className="p-10 text-center text-slate-500">
            이 기간에 수집된 항목이 없습니다.
          </p>
        )}
        {visible.length > 100 && (
          <p className="p-4 text-sm">
            화면에는 상위 100개를 표시합니다. CSV에는 검색 결과 전체가
            포함됩니다.
          </p>
        )}
      </div>
    </section>
  );
}
function LegacyOverview({
  report: r,
  start,
  end,
}: {
  report: Report;
  start: string;
  end: string;
}) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-7">
        <strong>기존 기록은 삭제되지 않았습니다.</strong> 이전 방식으로 수집한
        기록입니다. 관리자·봇 방문과 코드 복사·링크 클릭이 섞일 수 있어 새
        통계와 합산하거나 증감률을 비교하지 않습니다.
      </div>
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold text-lg">기존 누적 기록</h2>
        <p className="text-xs text-slate-500 mt-1">
          최초 기록부터 선택 종료일({end})까지 · 시작일 필터와 무관
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            ["누적 페이지 조회", r.legacy.totalViews],
            ["누적 클릭 기록", r.legacy.totalClicks],
          ].map(([label, value]) => (
            <div key={label} className="rounded-xl bg-slate-50 p-5">
              <p className="text-sm text-slate-500">{label}</p>
              <p className="mt-2 text-3xl font-bold">
                {fmt(Number(value))}
                <span className="text-sm font-normal ml-2">건</span>
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border bg-white p-5">
        <h2 className="font-bold text-lg">선택 기간의 기존 기록</h2>
        <p className="text-sm text-slate-500 mt-1">
          {start} ~ {end} · 한국 시간
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          {[
            ["페이지 조회", r.quality.legacyViews],
            ["클릭 기록", r.quality.legacyClicks],
          ].map(([label, value]) => (
            <div key={label} className="p-4 rounded-xl bg-blue-50">
              <p className="text-sm">{label}</p>
              <p className="text-2xl font-bold mt-2">{fmt(Number(value))}건</p>
            </div>
          ))}
        </div>
      </section>
      {[
        ["페이지별 기존 조회", r.legacy.pages],
        ["쿠폰별 기존 클릭 기록", r.legacy.coupons],
      ].map(([title, rows]) => (
        <LegacyList
          key={String(title)}
          title={String(title)}
          rows={rows as { name: string; label?: string; count: number }[]}
        />
      ))}
      <p className="text-xs text-slate-500">
        갱신 {stamp(r.updatedAt)} · 새 방문 분석은 상단 ‘개편 이후 통계’에서
        확인하세요.
      </p>
    </div>
  );
}
function LegacyList({
  title,
  rows,
}: {
  title: string;
  rows: { name: string; label?: string; count: number }[];
}) {
  const [search, setSearch] = useState("");
  const filtered = rows.filter((r) =>
    (r.label || r.name).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <section className="bg-white border rounded-2xl p-5">
      <div className="flex flex-wrap justify-between gap-3 mb-4">
        <h2 className="font-bold">{title}</h2>
        <input
          aria-label={title + " 검색"}
          placeholder="항목 검색"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm"
        />
      </div>
      <p className="text-xs text-slate-500 mb-3">
        {filtered.length}개 항목 · 건수 내림차순 · 상위 100개 표시
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-500">
              <th className="text-left p-3">항목</th>
              <th className="text-right p-3 whitespace-nowrap">기록 건수</th>
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 100).map((row) => (
              <tr className="border-t" key={row.name}>
                <td className="p-3 break-all">{row.label || row.name}</td>
                <td className="text-right p-3 tabular-nums">
                  {fmt(row.count)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <p className="p-5 text-slate-500">
            선택 기간에 해당 기록이 없습니다.
          </p>
        )}
      </div>
    </section>
  );
}
export default function AdminDashboard() {
  const router = useRouter(),
    [start, setStart] = useState(() => koreaDay(Date.now() - 6 * 86400000)),
    [end, setEnd] = useState(() => koreaDay()),
    [tab, setTab] = useState(0),
    [mode, setMode] = useState<"legacy" | "new">("legacy"),
    [report, setReport] = useState<Report | null>(null),
    [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [detail, setDetail] = useState<string | null>(null),
    [test, setTest] = useState(false);
  const requestNumber = useRef(0);
  const load = useCallback(async () => {
    const requestId = ++requestNumber.current;
    setBusy(true);
    setError("");
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.replace("/admin/login");
        return;
      }
      const response = await fetch(
        `/api/admin/analytics?start=${start}&end=${end}`,
        {
          headers: { Authorization: "Bearer " + data.session.access_token },
          cache: "no-store",
        },
      );
      const result = await response.json();
      if (!response.ok) throw Error(result.error);
      if (requestId === requestNumber.current) setReport(result);
    } catch (e) {
      if (requestId !== requestNumber.current) return;
      setReport(null);
      setError((e as Error).message);
    } finally {
      if (requestId === requestNumber.current) setBusy(false);
    }
  }, [start, end, router]);
  useEffect(() => {
    // Fetch on date-filter changes; loading state is part of the request lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);
  useEffect(() => {
    // Hydrate a browser-only preference after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTest(localStorage.getItem("ct_analytics_test") === "1");
  }, []);
  function preset(days: number, yesterday = false) {
    const last = Date.now() - (yesterday ? 86400000 : 0);
    setStart(koreaDay(last - (days - 1) * 86400000));
    setEnd(koreaDay(last));
  }
  const r = report,
    groups = r?.groups;
  return (
    <div className="min-h-screen bg-[#f5f7fb] flex flex-col md:flex-row text-slate-900">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-4 md:p-8 xl:p-10">
        <div className="max-w-[1440px] mx-auto space-y-6">
          <header className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-widest text-blue-700 mb-2">
                COUPONTALK ANALYTICS
              </p>
              <h1 className="text-3xl font-bold tracking-tight">
                방문을 성과로 연결하기
              </h1>
              <p className="text-sm text-slate-500 mt-2">
                유입부터 제휴 클릭까지, 실제로 기록된 행동을 살펴보세요.
              </p>
            </div>
            <button
              onClick={load}
              disabled={busy}
              className="flex items-center gap-2 bg-white border rounded-xl px-4 py-2.5 text-sm disabled:opacity-50"
            >
              <RefreshCw size={16} className={busy ? "animate-spin" : ""} />
              새로고침
            </button>
          </header>
          <section className="bg-white border rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                ["오늘", 1],
                ["최근 7일", 7],
                ["최근 30일", 30],
              ].map(([label, n]) => (
                <button
                  key={label}
                  onClick={() => preset(Number(n))}
                  className="rounded-lg bg-slate-100 hover:bg-blue-100 px-3 py-2 text-sm"
                >
                  {label}
                </button>
              ))}
              <button
                onClick={() => preset(1, true)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm"
              >
                어제
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <input
                aria-label="시작일"
                type="date"
                value={start}
                max={end}
                onChange={(e) => setStart(e.target.value)}
                className="border p-2 rounded-lg min-w-0"
              />
              <span>~</span>
              <input
                aria-label="종료일"
                type="date"
                value={end}
                min={start}
                max={koreaDay()}
                onChange={(e) => setEnd(e.target.value)}
                className="border p-2 rounded-lg min-w-0"
              />
              <span className="text-xs text-slate-500">
                한국 시간 · 최대 90일
              </span>
            </div>
          </section>
          <div
            className="grid sm:grid-cols-2 gap-3"
            aria-label="통계 집계 방식"
          >
            {(
              [
                ["legacy", "기존 기록", "누적 기록과 선택 기간의 조회·클릭"],
                [
                  "new",
                  "개편 이후 통계",
                  "관리자·테스트를 제외한 새 세션 분석",
                ],
              ] as const
            ).map(([value, title, description]) => (
              <button
                key={value}
                aria-pressed={mode === value}
                onClick={() => setMode(value)}
                className={`text-left rounded-xl border-2 p-4 ${mode === value ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white"}`}
              >
                <strong>{title}</strong>
                <span className="block mt-1 text-sm text-slate-500">
                  {description}
                </span>
              </button>
            ))}
          </div>
          {mode === "new" && (
            <nav
              aria-label="통계 분류"
              className="flex overflow-x-auto border-b gap-6"
            >
              {tabs.map((name, i) => (
                <button
                  key={name}
                  onClick={() => {
                    setTab(i);
                    setDetail(null);
                  }}
                  className={`whitespace-nowrap pb-3 text-sm font-semibold border-b-2 ${tab === i ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500"}`}
                >
                  {name}
                </button>
              ))}
            </nav>
          )}
          {error && (
            <div role="alert" className="p-5 rounded-xl bg-red-50 text-red-700">
              {error}
            </div>
          )}
          {busy && (
            <p role="status" className="text-sm text-blue-700">
              통계를 조회하고 있습니다…
            </p>
          )}
          {r && mode === "legacy" && (
            <LegacyOverview report={r} start={start} end={end} />
          )}
          {r && groups && mode === "new" && (
            <>
              <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                <p>관리자·테스트 이벤트 제외 · 갱신 {stamp(r.updatedAt)}</p>
                <p>
                  비교 기간 {stamp(r.range.previousFrom)} ~{" "}
                  {stamp(r.range.previousTo)} (끝 시각 제외)
                </p>
              </div>
              {(!r.quality.firstEvent ||
                r.range.from < Date.parse(r.quality.firstEvent)) && (
                <div className="rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-blue-900">
                  새 방식의 측정{" "}
                  {r.quality.firstEvent
                    ? stamp(r.quality.firstEvent) + " 시작"
                    : "시작 대기"}
                  . 이전 날짜는 미수집 기간이며, 전후 증감은 수집 범위가 다를 수
                  있습니다. 과거 기록은 상단 ‘기존 기록’에서 별도로 확인하세요.
                </div>
              )}
              {tab === 0 && (
                <>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {[
                      {
                        key: "sessions",
                        label: "방문 세션",
                        icon: Users,
                        hint: "30분 동안 활동이 없으면 새 세션",
                      },
                      {
                        key: "views",
                        label: "페이지 조회",
                        icon: Eye,
                        hint: "페이지가 보인 횟수",
                      },
                      {
                        key: "clicks",
                        label: "제휴 링크 클릭",
                        icon: MousePointer2,
                        hint: "외부 할인·상품 링크를 누른 횟수",
                      },
                      {
                        key: "rate",
                        label: "클릭 세션 비율",
                        icon: TrendingUp,
                        hint: "제휴 클릭 세션 ÷ 전체 세션",
                      },
                    ].map((c) => (
                      <article
                        key={c.key}
                        className="bg-white border rounded-2xl p-5"
                      >
                        <div className="flex justify-between text-slate-500 text-sm">
                          <span>{c.label}</span>
                          <c.icon size={18} />
                        </div>
                        <p className="text-3xl font-bold my-4 tabular-nums">
                          {c.key === "rate"
                            ? r.summary.rate.toFixed(1) + "%"
                            : fmt(Number(r.summary[c.key as keyof Row]))}
                        </p>
                        <p className="text-xs text-blue-700">
                          {change(
                            Number(r.summary[c.key as keyof Row]),
                            Number(r.previous[c.key as keyof Row]),
                          )}{" "}
                          <span className="text-slate-400">
                            · 직전 동일 길이 기간 대비
                          </span>
                        </p>
                        <p className="text-xs text-slate-500 mt-3">{c.hint}</p>
                      </article>
                    ))}
                  </div>
                  <section className="bg-white border rounded-2xl p-5">
                    <h2 className="font-bold text-lg">일별 방문과 제휴 클릭</h2>
                    <p className="text-xs text-slate-500 mt-1">
                      파랑: 방문 세션 · 초록: 제휴 클릭 · 날짜에 마우스를 올리면
                      수치 표시
                    </p>
                    <div className="flex h-48 gap-2 items-end mt-6 overflow-x-auto pb-6">
                      {r.daily.map((d) => (
                        <div
                          key={d.name}
                          title={`${d.name}: ${d.sessions}세션 / ${d.clicks}클릭`}
                          className="flex-1 min-w-8 h-full flex flex-col justify-end relative"
                        >
                          <div className="flex gap-1 h-full items-end">
                            <div
                              className="bg-blue-500 rounded-t w-1/2"
                              style={{
                                height:
                                  Math.max(
                                    2,
                                    (100 * d.sessions) /
                                      Math.max(
                                        1,
                                        ...r.daily.map((x) =>
                                          Math.max(x.sessions, x.clicks),
                                        ),
                                      ),
                                  ) + "%",
                              }}
                            />
                            <div
                              className="bg-emerald-400 rounded-t w-1/2"
                              style={{
                                height:
                                  Math.max(
                                    2,
                                    (100 * d.clicks) /
                                      Math.max(
                                        1,
                                        ...r.daily.map((x) =>
                                          Math.max(x.sessions, x.clicks),
                                        ),
                                      ),
                                  ) + "%",
                              }}
                            />
                          </div>
                          <span className="absolute -bottom-5 text-[10px] text-slate-500">
                            {d.name.slice(5)}
                          </span>
                        </div>
                      ))}
                      {!r.daily.length && (
                        <p className="m-auto text-sm text-slate-500">
                          아직 수집된 방문이 없습니다.
                        </p>
                      )}
                    </div>
                  </section>
                  <Table title="선택한 할인·쿠폰" rows={groups.targets} />
                  <p className="text-sm text-slate-500">
                    안내 코드는 현재 등록 정보입니다. 코드 복사는 실제 복사 성공
                    건수이며, 외부 결제에서의 코드 사용·구매 완료를 뜻하지
                    않습니다.
                  </p>
                  <Table title="페이지별 방문·클릭 성과" rows={groups.pages} />
                  <p className="text-sm text-slate-500">
                    제휴 클릭은 구매가 아닙니다. 구매·수익은 제휴 플랫폼
                    리포트와 대조해야 합니다.
                  </p>
                </>
              )}
              {tab === 1 && (
                <>
                  <Table title="유입 채널" rows={groups.sources} />
                  <Table
                    title="유입 채널 → 첫 방문 페이지"
                    rows={groups.journeys}
                  />
                  <Table title="첫 방문 페이지 성과" rows={groups.landings} />
                  <div className="rounded-xl p-4 bg-amber-50 text-amber-900 text-sm">
                    검색어는 검색엔진이 전달한 경우에만 표시합니다. 검색 유입 중
                    검색어 미제공 세션: {fmt(r.quality.missingKeywordSessions)}.
                    방문 페이지로 검색어를 추정하지 않습니다. 네이버 노출·검색
                    결과 클릭은 서치어드바이저에서 별도로 확인해야 합니다.
                  </div>
                  <Table title="전달받은 검색어" rows={groups.keywords} />
                  <Table title="접속 기기" rows={groups.devices} />
                </>
              )}
              {tab === 2 && (
                <>
                  <Table
                    title="스토어별 성과 · 이름을 눌러 상세 보기"
                    rows={groups.stores}
                    onRow={(x) => setDetail(x.name)}
                  />
                  {detail && (
                    <div className="border-l-4 border-blue-500 pl-3">
                      <button
                        onClick={() => setDetail(null)}
                        className="text-sm text-blue-700 mb-2"
                      >
                        상세 닫기
                      </button>
                      <Table
                        title={
                          (groups.stores.find((x) => x.name === detail)
                            ?.label || detail) + " 페이지별 성과"
                        }
                        rows={
                          r.storeDetails.find((x) => x.id === detail)?.pages ||
                          []
                        }
                      />
                    </div>
                  )}
                  <Table title="쿠폰별 행동" rows={groups.coupons} />
                  <p className="text-sm text-slate-500">
                    쿠폰 표의 세션은 해당 쿠폰에 행동한 세션입니다. 쿠폰 노출
                    횟수를 수집하지 않으므로 노출 대비 클릭률을 의미하지
                    않습니다.
                  </p>
                  <Table title="상품별 제휴 클릭" rows={groups.products} />
                  <Table title="버튼별 행동" rows={groups.buttons} />
                </>
              )}
              {tab === 3 && (
                <>
                  <Table
                    title="구독 서비스별 성과"
                    rows={groups.subscriptions}
                  />
                  <Table
                    title="구독 페이지의 버튼별 행동"
                    rows={groups.buttons.filter((x) =>
                      x.name.startsWith("/subscriptions"),
                    )}
                  />
                  <p className="text-sm text-slate-500">
                    서비스 페이지 조회, 제휴 이동, 성공한 코드 복사를
                    구분합니다. 실제 결제는 겜스고 리포트에서 확인하세요.
                  </p>
                </>
              )}
              {tab === 4 && (
                <>
                  <section className="bg-white border rounded-2xl p-6 space-y-4">
                    <h2 className="font-bold text-lg">측정 상태와 제외 기준</h2>
                    <div className="grid sm:grid-cols-3 gap-4">
                      {[
                        [
                          "제외된 관리자·테스트 이벤트",
                          fmt(r.quality.testEvents),
                        ],
                        ["과거 방식의 페이지 조회", fmt(r.quality.legacyViews)],
                        ["과거 방식의 클릭 기록", fmt(r.quality.legacyClicks)],
                      ].map(([label, v]) => (
                        <div key={label} className="bg-slate-50 rounded-xl p-4">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="text-2xl font-bold mt-2">{v}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm leading-7 text-slate-600">
                      기존 기록은 보존하지만 새 세션 통계와 합산하지 않습니다.
                      과거 클릭에는 코드 복사와 제휴 이동의 혼합 및 구독 서비스
                      누락이 있어 같은 기준으로 비교할 수 없습니다. 알려진 봇은
                      저장 전 제외합니다. 모든 봇과 광고 차단을 완벽하게 구분할
                      수는 없습니다.
                    </p>
                    <button
                      onClick={() => {
                        const next = !test;
                        localStorage.setItem(
                          "ct_analytics_test",
                          next ? "1" : "0",
                        );
                        setTest(next);
                      }}
                      className="px-4 py-3 rounded-xl border text-sm font-semibold"
                    >
                      이 브라우저 테스트 모드: {test ? "켜짐" : "꺼짐"} · 전환
                    </button>
                    <p className="text-xs text-slate-500">
                      관리자로 로그인한 브라우저의 방문은 테스트 모드와 관계없이
                      자동 제외됩니다. 비로그인 기기에서 테스트할 때는 해당
                      기기에서 테스트 모드를 켜세요.
                    </p>
                  </section>
                  <Table
                    title="제외된 테스트 페이지 기록"
                    rows={groups.tests}
                  />
                  <section className="bg-white border rounded-2xl p-6">
                    <h2 className="font-bold mb-3">수치 읽는 법</h2>
                    <ul className="list-disc pl-5 text-sm leading-8 text-slate-600">
                      <li>
                        세션은 사람 수가 아닙니다. 기기 변경·저장 데이터 삭제 시
                        중복될 수 있습니다.
                      </li>
                      <li>
                        동일 이벤트 재전송은 한 번만 저장합니다. 새로고침은 새
                        조회입니다.
                      </li>
                      <li>
                        코드 복사는 클립보드 쓰기가 성공한 경우만 기록합니다.
                      </li>
                      <li>
                        채널·첫 방문 페이지는 세션 시작 기준입니다. 행별 세션
                        합은 전체와 다를 수 있습니다.
                      </li>
                      <li>
                        0은 수집된 이벤트가 없다는 의미입니다. 측정 시작 전
                        기간은 미수집이며 조회 실패는 오류로 표시합니다.
                      </li>
                      <li>
                        제휴사 클릭 통계는 중복 제거·봇 처리·집계 시차가 달라
                        일치하지 않을 수 있습니다.
                      </li>
                    </ul>
                  </section>
                </>
              )}
            </>
          )}
          <a
            href="/"
            target="_blank"
            className="inline-flex text-sm text-slate-500 gap-1 items-center"
          >
            실제 사이트 보기
            <ArrowUpRight size={14} />
          </a>
        </div>
      </main>
    </div>
  );
}
