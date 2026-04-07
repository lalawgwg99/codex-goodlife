import { useMemo, useState } from "react";

type Flow = {
  name: string;
  repo: string;
  desc: string;
};

type Reading = {
  headline: string;
  score: number;
  vibe: string;
  focus: string;
  path: string;
  highlights: { title: string; body: string }[];
  lucky: { color: string; number: number; mantra: string; day: string };
  roadmap: { now: string; short: string; long: string };
};

const flows: Flow[] = [
  { name: "赛博算命", repo: "https://github.com/jinchenma94/bazi-skill", desc: "八字+流年，科技味的命盤解讀" },
  { name: "月老 · 姻缘测算", repo: "https://github.com/Ming-H/yinyuan-skills", desc: "聚焦情感、關係和匹配度" },
  { name: "奇门遁甲 · 紫微斗数", repo: "https://github.com/FANzR-arch/Numerologist_skills", desc: "更玄妙的局勢推演與時空感" },
  { name: "大师兜底", repo: "https://github.com/xr843/Master-skill", desc: "通用解讀，適合快速兜底" },
  { name: "X 导师", repo: "https://github.com/alchaincyf/x-mentor-skill", desc: "偏實戰導師口吻，語氣犀利" },
  { name: "轻量 waza", repo: "https://github.com/tw93/waza", desc: "輕量插件式拼裝，方便擴展" },
];

const focuses = ["全局運勢", "姻緣感情", "事業跳槽", "財富偏正", "健康節奏", "學習考試"];

const palettes = ["霧霾藍", "琥珀金", "暮色紫", "晨曦粉", "竹葉青", "曜石黑"];

const mantras = [
  "慢下來，讓直覺說話。",
  "向內看三秒，再向外走一步。",
  "保持鬆弛感，機會自然靠近。",
  "敢做第一個開口的人。",
  "先交付 60%，剩下的在迭代裡長出來。",
];

const roadmapLines = {
  now: [
    "今天適合清理代辦，把能量集中到一個最重要的決策。",
    "保持輕量社交，說話留白，讓對方先透露底牌。",
    "調整作息，早睡一小時，換來更清晰的判斷力。",
  ],
  short: [
    "未來 7 天適合啟動新嘗試：小額投資、side project、短途旅行。",
    "這週的合作運不錯，勇於提出你的條件，能談成雙贏。",
    "專注整理作品集或簡歷，會遇到願意傾聽的面試官。",
  ],
  long: [
    "未來 90 天，你的關鍵字是「聚焦」。砍掉 1 個不重要的目標。",
    "下一季適合學一個硬技能，讓自己在團隊中有明確標籤。",
    "注意現金流與健康，慢跑或瑜伽能撐起耐力；財務則要留 3 個月緩衝。",
  ],
};

const highlightPool = [
  { title: "情感脈絡", body: "感情運升溫，主動的關心會被記住；單身者可在朋友介紹中找到火花。" },
  { title: "事業節奏", body: "適合提出新方案或轉崗試水，保持實驗心態，你的邏輯會被看到。" },
  { title: "財務能量", body: "守比攻更重要，避開大額衝動消費；小規模定投能帶來安全感。" },
  { title: "健康提醒", body: "留意肩頸與睡眠，放下手機 30 分鐘做伸展，換來整天的清醒。" },
  { title: "學習突破", body: "設定可交付的學習成果：一頁筆記、一段 demo，讓進度可見。" },
];

const vibePool = [
  "你身上帶著『復盤 + 再出發』的氣場，適合重啟或重構。",
  "你的節奏正在從分散轉向聚焦，把資源投入一個主戰場。",
  "貴人運在線，多聽比多說，會捕捉到關鍵暗號。",
  "情緒感受力提升，創作/內容表達會更打動人。",
  "內心有股穩定的韌性，適合推進長周期項目。",
];

function seededRandom(seed: string) {
  let h = 0;
  for (const c of seed) {
    h = Math.imul(31, h) + c.charCodeAt(0);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

function pick<T>(list: T[], rand: () => number) {
  return list[Math.floor(rand() * list.length)];
}

function buildReading(seed: string, focus: string, path: string): Reading {
  const rand = seededRandom(seed);
  const score = Math.round(68 + rand() * 24);
  const headline = score > 88 ? "好運在敲門，記得開門" : score > 78 ? "能量在升溫，請維持節奏" : "先穩住基本盤，再蓄力";

  const highlights = Array.from({ length: 3 }, () => pick(highlightPool, rand));

  const lucky = {
    color: pick(palettes, rand),
    number: 1 + Math.floor(rand() * 9),
    mantra: pick(mantras, rand),
    day: ["週一", "週二", "週三", "週四", "週五", "週六", "週日"][Math.floor(rand() * 7)],
  };

  const roadmap = {
    now: pick(roadmapLines.now, rand),
    short: pick(roadmapLines.short, rand),
    long: pick(roadmapLines.long, rand),
  };

  return {
    headline,
    score,
    vibe: pick(vibePool, rand),
    focus,
    path,
    highlights,
    lucky,
    roadmap,
  };
}

const defaultBirth = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 26);
  d.setHours(8, 0, 0, 0);
  const iso = d.toISOString();
  return iso.slice(0, 16);
})();

function App() {
  const [form, setForm] = useState({
    name: "旅人",
    birth: defaultBirth,
    focus: focuses[0],
    path: flows[0].name,
    wish: "希望今年能有突破感",
  });

  const reading = useMemo(
    () => buildReading(JSON.stringify(form), form.focus, form.path),
    [form]
  );

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-10 md:py-14">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-1 text-sm font-medium text-amber-600 shadow-sm ring-1 ring-amber-100">
              好運調頻 · Entertainment Only
            </p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight md:text-5xl">
              GoodLife 算命工作室
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-slate-600">
              聚合多種流派的靈感，給你一份輕量、可分享的運勢筆記。輸入生辰、選擇流派，即時生成。
            </p>
          </div>
          <div className="flex items-center gap-3 self-start rounded-2xl bg-white/90 px-4 py-3 shadow-md ring-1 ring-slate-100">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-fuchsia-500"></div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Cloudflare Ready</p>
              <p className="text-xs text-slate-500">靜態產出 · Edge 可快速部署</p>
            </div>
          </div>
        </header>

        <main className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <section className="rounded-3xl bg-white/90 p-6 shadow-lg ring-1 ring-slate-100 backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold">輸入靈感</h2>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                即時生成
              </span>
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">你的稱呼</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={form.name}
                  onChange={(e) => update("name")(e.target.value)}
                  placeholder="例：阿月 / Traveler"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">出生日期與時間</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={form.birth}
                  onChange={(e) => update("birth")(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">想聚焦的主題</label>
                <div className="grid grid-cols-2 gap-2">
                  {focuses.map((f) => (
                    <button
                      key={f}
                      onClick={() => update("focus")(f)}
                      className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                        form.focus === f
                          ? "bg-indigo-600 text-white shadow-md"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">目前的心願/煩惱</label>
                <input
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  value={form.wish}
                  onChange={(e) => update("wish")(e.target.value)}
                  placeholder="例：想換工作但怕不穩 / 想遇到好對象"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold text-slate-600">流派選擇 · 靈感來源</p>
              <div className="grid gap-3 md:grid-cols-2">
                {flows.map((flow) => (
                  <button
                    key={flow.name}
                    onClick={() => update("path")(flow.name)}
                    className={`flex w-full items-start gap-3 rounded-2xl border px-4 py-3 text-left transition ${
                      form.path === flow.name
                        ? "border-indigo-500 bg-indigo-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/80 to-fuchsia-500/80"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{flow.name}</p>
                      <p className="text-xs text-slate-500">{flow.desc}</p>
                      <a
                        href={flow.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex text-xs font-semibold text-indigo-600 hover:underline"
                      >
                        GitHub 倉庫
                      </a>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div className="rounded-3xl bg-slate-900 p-6 text-white shadow-xl ring-1 ring-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                    今日調頻
                  </p>
                  <h3 className="mt-2 text-2xl font-bold">{reading.headline}</h3>
                </div>
                <div className="flex items-center gap-2 rounded-2xl bg-white/10 px-3 py-2">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-400 to-rose-500"></div>
                  <div>
                    <p className="text-xs text-slate-200">GoodLife 指數</p>
                    <p className="text-lg font-semibold">{reading.score} / 100</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-300">主題 · 流派</p>
                  <p className="text-sm font-semibold text-white">
                    {reading.focus} · {reading.path}
                  </p>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-300">氣場</p>
                  <p className="text-sm leading-relaxed text-slate-100">{reading.vibe}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {reading.highlights.map((item, idx) => (
                  <div
                    key={idx}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <p className="text-sm font-semibold text-white">{item.title}</p>
                    <p className="text-sm text-slate-200">{item.body}</p>
                  </div>
                ))}
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-300">幸運信號</p>
                  <p className="text-sm text-slate-100">
                    色彩：{reading.lucky.color} ｜ 數字：{reading.lucky.number}
                  </p>
                  <p className="text-sm text-slate-100">開運日：{reading.lucky.day}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-300">今日咒語</p>
                  <p className="text-sm text-slate-100">{reading.lucky.mantra}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="text-xs text-slate-300">今天</p>
                  {reading.roadmap.now}
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="text-xs text-slate-300">本週</p>
                  {reading.roadmap.short}
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="text-xs text-slate-300">本季</p>
                  {reading.roadmap.long}
                </div>
              </div>
            </div>

            <div className="rounded-3xl bg-white/90 p-5 shadow-lg ring-1 ring-slate-100">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-700">部署提示</p>
                  <p className="text-sm text-slate-600">
                    Vite + React + Tailwind，無後端依賴，Cloudflare Pages 直接構建。
                  </p>
                </div>
                <a
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-slate-800"
                  href="https://developers.cloudflare.com/pages/framework-guides/deploy-a-vite3-project/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Cloudflare 指南
                </a>
              </div>
              <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate-600">
                <li>在 Cloudflare Pages 建站，框架選 Vite。</li>
                <li>Build 指令：<code className="rounded bg-slate-100 px-2 py-1">npm run build</code>；發布目錄：<code className="rounded bg-slate-100 px-2 py-1">dist</code>。</li>
                <li>若要接入真實算命 API，可在 <code className="rounded bg-slate-100 px-2 py-1">src</code> 加一層 Edge/Workers fetch。</li>
              </ol>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
