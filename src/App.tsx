import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

type Flow = {
  name: string;
  repo: string;
  desc: string;
  vibe: string;
};

type Highlight = { title: string; body: string };

type Reading = {
  headline: string;
  score: number;
  vibe: string;
  focus: string;
  path: string;
  highlights: Highlight[];
  lucky: { color: string; number: number; mantra: string; day: string };
  roadmap: { now: string; week: string; month: string; season: string };
  radar: { label: string; value: number }[];
};

type SavedReading = {
  id: string;
  name: string;
  focus: string;
  path: string;
  headline: string;
  score: number;
  vibe: string;
  date: string;
};

const flows: Flow[] = [
  {
    name: "赛博算命",
    repo: "https://github.com/jinchenma94/bazi-skill",
    desc: "八字+流年，科技味的命盤解讀",
    vibe: "邏輯與命理的交錯感",
  },
  {
    name: "月老 · 姻缘测算",
    repo: "https://github.com/Ming-H/yinyuan-skills",
    desc: "聚焦情感、關係和匹配度",
    vibe: "溫柔、重視連結",
  },
  {
    name: "奇门遁甲 · 紫微斗数",
    repo: "https://github.com/FANzR-arch/Numerologist_skills",
    desc: "玄妙的局勢推演與時空感",
    vibe: "強調布局與時機",
  },
  {
    name: "大师兜底",
    repo: "https://github.com/xr843/Master-skill",
    desc: "通用解讀，適合快速兜底",
    vibe: "語氣沉穩、方向感強",
  },
  {
    name: "X 导师",
    repo: "https://github.com/alchaincyf/x-mentor-skill",
    desc: "實戰導師口吻，語氣犀利",
    vibe: "直接、帶點挑戰",
  },
  {
    name: "轻量 waza",
    repo: "https://github.com/tw93/waza",
    desc: "輕量插件式拼裝，方便擴展",
    vibe: "自由、拼裝感",
  },
];

const focuses = [
  "全局運勢",
  "姻緣感情",
  "事業跳槽",
  "財富偏正",
  "健康節奏",
  "學習考試",
];

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
  week: [
    "這週的合作運不錯，勇於提出你的條件，能談成雙贏。",
    "未來 7 天適合啟動新嘗試：小額投資、side project、短途旅行。",
    "適合整理作品集或簡歷，會遇到願意傾聽的面試官。",
  ],
  month: [
    "未來 30 天適合建立新習慣，從早起或運動開始。",
    "留意資源配置，支出做分類會更安心。",
    "把人脈聚焦在 2-3 位最重要的夥伴。",
  ],
  season: [
    "未來 90 天的關鍵字是「聚焦」。砍掉 1 個不重要的目標。",
    "下一季適合學一個硬技能，讓自己在團隊中有明確標籤。",
    "注意現金流與健康，慢跑或瑜伽能撐起耐力。",
  ],
};

const highlightPool: Highlight[] = [
  {
    title: "情感脈絡",
    body: "感情運升溫，主動的關心會被記住；單身者可在朋友介紹中找到火花。",
  },
  {
    title: "事業節奏",
    body: "適合提出新方案或轉崗試水，保持實驗心態，你的邏輯會被看到。",
  },
  {
    title: "財務能量",
    body: "守比攻更重要，避開大額衝動消費；小規模定投能帶來安全感。",
  },
  {
    title: "健康提醒",
    body: "留意肩頸與睡眠，放下手機 30 分鐘做伸展，換來整天的清醒。",
  },
  {
    title: "學習突破",
    body: "設定可交付的學習成果：一頁筆記、一段 demo，讓進度可見。",
  },
];

const vibePool = [
  "你身上帶著『復盤 + 再出發』的氣場，適合重啟或重構。",
  "你的節奏正在從分散轉向聚焦，把資源投入一個主戰場。",
  "貴人運在線，多聽比多說，會捕捉到關鍵暗號。",
  "情緒感受力提升，創作/內容表達會更打動人。",
  "內心有股穩定的韌性，適合推進長周期項目。",
];

const radarLabels = ["事業", "財富", "關係", "健康", "學習", "能量"];

const defaultBirth = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 26);
  d.setHours(8, 0, 0, 0);
  return d.toISOString().slice(0, 16);
})();

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
  const headline =
    score > 88
      ? "好運在敲門，記得開門"
      : score > 78
        ? "能量在升溫，請維持節奏"
        : "先穩住基本盤，再蓄力";

  const highlights = Array.from({ length: 3 }, () => pick(highlightPool, rand));

  const lucky = {
    color: pick(palettes, rand),
    number: 1 + Math.floor(rand() * 9),
    mantra: pick(mantras, rand),
    day: ["週一", "週二", "週三", "週四", "週五", "週六", "週日"][
      Math.floor(rand() * 7)
    ],
  };

  const roadmap = {
    now: pick(roadmapLines.now, rand),
    week: pick(roadmapLines.week, rand),
    month: pick(roadmapLines.month, rand),
    season: pick(roadmapLines.season, rand),
  };

  const radar = radarLabels.map((label) => ({
    label,
    value: Math.round(50 + rand() * 45),
  }));

  return {
    headline,
    score,
    vibe: pick(vibePool, rand),
    focus,
    path,
    highlights,
    lucky,
    roadmap,
    radar,
  };
}

const formatDate = (value: string) => {
  const d = new Date(value);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const storageKey = "goodlife-saved";

function App() {
  const [form, setForm] = useState({
    name: "旅人",
    birth: defaultBirth,
    focus: focuses[0],
    path: flows[0].name,
    wish: "希望今年能有突破感",
  });
  const [saved, setSaved] = useState<SavedReading[]>([]);
  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setSaved(JSON.parse(stored));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(saved.slice(0, 8)));
  }, [saved]);

  const reading = useMemo(
    () => buildReading(JSON.stringify(form), form.focus, form.path),
    [form]
  );

  const compareReadings = useMemo(() => {
    return flows.map((flow) => ({
      flow,
      reading: buildReading(`${form.name}-${flow.name}-${form.birth}`, form.focus, flow.name),
    }));
  }, [form]);

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = () => {
    setSaving(true);
    const item: SavedReading = {
      id: `${Date.now()}`,
      name: form.name,
      focus: form.focus,
      path: form.path,
      headline: reading.headline,
      score: reading.score,
      vibe: reading.vibe,
      date: new Date().toISOString(),
    };
    setSaved((prev) => [item, ...prev].slice(0, 8));
    setTimeout(() => setSaving(false), 700);
  };

  const onShare = async () => {
    if (!shareRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(shareRef.current, { pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `goodlife-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-12 md:pt-16">
        <header className="relative overflow-hidden rounded-[32px] bg-white/80 p-8 shadow-xl ring-1 ring-slate-200 backdrop-blur">
          <div className="absolute inset-0 bg-orbit opacity-70" />
          <div className="relative z-10 grid gap-6 md:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-amber-100/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
                GoodLife Ritual Lab
              </p>
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                GoodLife 算命工作室
              </h1>
              <p className="mt-4 max-w-2xl text-lg text-slate-600">
                這是一份靈感驅動的運勢工作台。輸入你的生辰、心願與當下課題，選擇流派，即刻生成
                可分享的「命盤筆記」。
              </p>
              <div className="mt-6 flex flex-wrap gap-3 text-sm">
                <span className="rounded-full bg-slate-900 px-3 py-1 text-white">即時生成</span>
                <span className="rounded-full bg-white px-3 py-1 text-slate-700 ring-1 ring-slate-200">
                  靜態部署
                </span>
                <span className="rounded-full bg-white px-3 py-1 text-slate-700 ring-1 ring-slate-200">
                  可分享圖卡
                </span>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-lg">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Cloudflare Ready</p>
                <p className="mt-2 text-lg font-semibold">Vite + React + Tailwind</p>
                <p className="mt-3 text-sm text-slate-300">
                  直接部署到 Pages，或加上 Workers 接 API。
                </p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-700">今日儀式</p>
                <ol className="mt-2 list-decimal space-y-1 pl-4 text-sm text-slate-600">
                  <li>選一個主題，鎖定能量焦點。</li>
                  <li>閱讀本季指引，挑 1 件事去做。</li>
                  <li>生成分享卡，送給未來的自己。</li>
                </ol>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_1fr]">
          <section className="rounded-[32px] bg-white/90 p-6 shadow-xl ring-1 ring-slate-200 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">命盤輸入</h2>
              <div className="flex gap-2 text-xs text-slate-500">
                <span className="rounded-full bg-slate-100 px-3 py-1">自動保存</span>
                <span className="rounded-full bg-slate-100 px-3 py-1">一鍵分享</span>
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">你的稱呼</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={form.name}
                  onChange={(e) => update("name")(e.target.value)}
                  placeholder="例：阿月 / Traveler"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-600">出生日期與時間</label>
                <input
                  type="datetime-local"
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={form.birth}
                  onChange={(e) => update("birth")(e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-600">目前的心願 / 煩惱</label>
                <input
                  className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200"
                  value={form.wish}
                  onChange={(e) => update("wish")(e.target.value)}
                  placeholder="例：想換工作但怕不穩 / 想遇到好對象"
                />
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold text-slate-600">想聚焦的主題</p>
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
                {focuses.map((f) => (
                  <button
                    key={f}
                    onClick={() => update("focus")(f)}
                    className={`rounded-2xl px-3 py-2 text-sm font-semibold transition ${
                      form.focus === f
                        ? "bg-slate-900 text-white shadow-md"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <p className="text-sm font-semibold text-slate-600">流派選擇 · 靈感來源</p>
              <div className="grid gap-3 md:grid-cols-2">
                {flows.map((flow) => (
                  <button
                    key={flow.name}
                    onClick={() => update("path")(flow.name)}
                    className={`flex w-full items-start gap-3 rounded-3xl border px-4 py-3 text-left transition ${
                      form.path === flow.name
                        ? "border-amber-400 bg-amber-50/80 shadow-sm"
                        : "border-slate-200 bg-white hover:border-amber-200"
                    }`}
                  >
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-amber-400 to-rose-400"></div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">{flow.name}</p>
                      <p className="text-xs text-slate-500">{flow.desc}</p>
                      <p className="mt-1 text-xs text-slate-400">{flow.vibe}</p>
                      <span className="mt-1 inline-flex text-xs font-semibold text-amber-700">
                        GitHub 倉庫
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="flex flex-col gap-4">
            <div ref={shareRef} className="rounded-[32px] bg-slate-900 p-6 text-white shadow-2xl ring-1 ring-slate-800">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-300">今日調頻</p>
                  <h3 className="mt-2 text-2xl font-black">{reading.headline}</h3>
                  <p className="mt-2 text-sm text-slate-300">
                    {form.name} · {formatDate(form.birth)}
                  </p>
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
                  <p className="text-xs text-slate-300">氣場描述</p>
                  <p className="text-sm leading-relaxed text-slate-100">{reading.vibe}</p>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3">
                  <p className="text-xs text-slate-300">今日心願</p>
                  <p className="text-sm text-slate-100">{form.wish}</p>
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

              <div className="mt-4 grid gap-3 md:grid-cols-4">
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="text-xs text-slate-300">今天</p>
                  {reading.roadmap.now}
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="text-xs text-slate-300">本週</p>
                  {reading.roadmap.week}
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="text-xs text-slate-300">本月</p>
                  {reading.roadmap.month}
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-100">
                  <p className="text-xs text-slate-300">本季</p>
                  {reading.roadmap.season}
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={onShare}
                className="rounded-2xl bg-amber-500 px-4 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-amber-400"
              >
                {sharing ? "生成中..." : "生成分享卡"}
              </button>
              <button
                onClick={onSave}
                className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                {saving ? "已保存" : "保存本次運勢"}
              </button>
            </div>

            <div className="rounded-[32px] bg-white/90 p-5 shadow-xl ring-1 ring-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-700">命盤雷達</h3>
                <span className="text-xs text-slate-500">0 - 100</span>
              </div>
              <div className="mt-3 space-y-2">
                {reading.radar.map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <span className="w-14 text-xs text-slate-500">{item.label}</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-amber-400 to-rose-400"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="w-8 text-xs text-slate-500">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[32px] bg-white/90 p-5 shadow-xl ring-1 ring-slate-200">
              <h3 className="text-sm font-semibold text-slate-700">保存紀錄</h3>
              <div className="mt-3 space-y-3">
                {saved.length === 0 && (
                  <p className="text-sm text-slate-500">尚未保存任何紀錄。</p>
                )}
                {saved.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white px-3 py-2"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">
                        {item.name} · {item.focus}
                      </p>
                      <span className="text-xs text-slate-400">
                        {new Date(item.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.path} · {item.headline}</p>
                    <p className="text-xs text-slate-400">指數 {item.score} · {item.vibe}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <section className="mt-10 rounded-[32px] bg-white/90 p-6 shadow-xl ring-1 ring-slate-200">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-semibold">流派對比視圖</h2>
              <p className="text-sm text-slate-500">同一主題，不同流派的氣質差異。</p>
            </div>
            <p className="text-xs text-slate-400">自動生成比較結果</p>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {compareReadings.map(({ flow, reading }) => (
              <div key={flow.name} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-800">{flow.name}</p>
                <p className="text-xs text-slate-500">{flow.vibe}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-xs text-slate-400">GoodLife 指數</span>
                  <span className="text-sm font-semibold text-slate-700">{reading.score}</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">{reading.vibe}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-[32px] bg-white/90 p-6 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">體驗升級清單</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>儀式感輸入 + 即時結果卡 + 分享圖卡</li>
              <li>保存紀錄，形成個人運勢時間線</li>
              <li>流派對比視圖，觀察多元解讀</li>
              <li>命盤雷達與行動路徑，適合做成週報</li>
            </ul>
          </div>
          <div className="rounded-[32px] bg-white/90 p-6 shadow-xl ring-1 ring-slate-200">
            <h3 className="text-sm font-semibold text-slate-700">免責聲明</h3>
            <p className="mt-3 text-sm text-slate-600">
              本站內容為靈感與娛樂用途，不構成投資、醫療、法律或其他專業建議。請以自我判斷為準。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
