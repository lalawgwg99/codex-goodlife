import { useEffect, useMemo, useRef, useState } from "react";
import { toPng } from "html-to-image";

type Lang = "zh-TW" | "zh-CN";

type Flow = {
  id: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
};

type Focus = {
  id: string;
  label: Record<Lang, string>;
};

type AIResult = {
  headline: string;
  summary: string;
  highlights: string[];
  lucky: { color: string; number: number; day: string; mantra: string };
  roadmap: { today: string; week: string; month: string; season: string };
  raw?: string;
};

type SavedReading = {
  id: string;
  name: string;
  focus: string;
  path: string;
  headline: string;
  date: string;
};

const i18n = {
  "zh-TW": {
    title: "GoodLife 命理工作室",
    subtitle: "簡單大方的命盤輸入與 AI 解讀，一鍵生成可分享的運勢筆記。",
    ritual: "今天的儀式",
    input: "命盤輸入",
    name: "你的稱呼",
    birth: "出生日期與時間",
    wish: "目前的心願 / 煩惱",
    focus: "想聚焦的主題",
    flow: "流派選擇",
    generate: "生成 AI 解讀",
    generating: "生成中...",
    share: "生成分享卡",
    saving: "已保存",
    save: "保存本次運勢",
    result: "AI 解讀",
    summary: "摘要",
    highlights: "重點",
    lucky: "幸運信號",
    roadmap: "行動路徑",
    today: "今天",
    week: "本週",
    month: "本月",
    season: "本季",
    saved: "保存紀錄",
    emptySaved: "尚未保存任何紀錄。",
    disclaimer: "本站內容僅供娛樂用途，不構成專業建議。",
    langLabel: "語言",
    compareTitle: "流派對比",
    compareDesc: "同一主題，不同流派語氣差異。",
  },
  "zh-CN": {
    title: "GoodLife 命理工作室",
    subtitle: "简洁清爽的命盘输入与 AI 解读，一键生成可分享的运势笔记。",
    ritual: "今天的仪式",
    input: "命盘输入",
    name: "你的称呼",
    birth: "出生日期与时间",
    wish: "目前的心愿 / 烦恼",
    focus: "想聚焦的主题",
    flow: "流派选择",
    generate: "生成 AI 解读",
    generating: "生成中...",
    share: "生成分享卡",
    saving: "已保存",
    save: "保存本次运势",
    result: "AI 解读",
    summary: "摘要",
    highlights: "重点",
    lucky: "幸运信号",
    roadmap: "行动路径",
    today: "今天",
    week: "本周",
    month: "本月",
    season: "本季",
    saved: "保存记录",
    emptySaved: "尚未保存任何记录。",
    disclaimer: "本站内容仅供娱乐用途，不构成专业建议。",
    langLabel: "语言",
    compareTitle: "流派对比",
    compareDesc: "同一主题，不同流派语气差异。",
  },
} as const;

const flows: Flow[] = [
  {
    id: "cyber",
    name: { "zh-TW": "賽博算命", "zh-CN": "赛博算命" },
    desc: {
      "zh-TW": "八字 + 流年，偏理性解讀",
      "zh-CN": "八字 + 流年，偏理性解读",
    },
  },
  {
    id: "love",
    name: { "zh-TW": "月老 · 姻緣", "zh-CN": "月老 · 姻缘" },
    desc: {
      "zh-TW": "聚焦關係與情感節奏",
      "zh-CN": "聚焦关系与情感节奏",
    },
  },
  {
    id: "qimen",
    name: { "zh-TW": "奇門 · 紫微", "zh-CN": "奇门 · 紫微" },
    desc: {
      "zh-TW": "偏局勢與時機判斷",
      "zh-CN": "偏局势与时机判断",
    },
  },
  {
    id: "master",
    name: { "zh-TW": "大師兜底", "zh-CN": "大师兜底" },
    desc: {
      "zh-TW": "通用解讀，語氣穩定",
      "zh-CN": "通用解读，语气稳定",
    },
  },
  {
    id: "mentor",
    name: { "zh-TW": "X 導師", "zh-CN": "X 导师" },
    desc: {
      "zh-TW": "實戰導師口吻",
      "zh-CN": "实战导师口吻",
    },
  },
  {
    id: "waza",
    name: { "zh-TW": "輕量 waza", "zh-CN": "轻量 waza" },
    desc: {
      "zh-TW": "可拼裝擴展",
      "zh-CN": "可拼装扩展",
    },
  },
];

const focuses: Focus[] = [
  { id: "overall", label: { "zh-TW": "全局運勢", "zh-CN": "全局运势" } },
  { id: "love", label: { "zh-TW": "姻緣感情", "zh-CN": "姻缘感情" } },
  { id: "career", label: { "zh-TW": "事業跳槽", "zh-CN": "事业跳槽" } },
  { id: "wealth", label: { "zh-TW": "財富偏正", "zh-CN": "财富偏正" } },
  { id: "health", label: { "zh-TW": "健康節奏", "zh-CN": "健康节奏" } },
  { id: "study", label: { "zh-TW": "學習考試", "zh-CN": "学习考试" } },
];

const palette = ["霧霾藍", "琥珀金", "暮色紫", "晨曦粉", "竹葉青", "曜石黑"];

const fallbackSummary = {
  "zh-TW": "目前能量偏穩，適合先整頓節奏再推進。先做一件可交付的事，會帶來信心回流。",
  "zh-CN": "目前能量偏稳，适合先整顿节奏再推进。先做一件可交付的事，会带来信心回流。",
};

const fallbackHighlights: Record<Lang, string[]> = {
  "zh-TW": [
    "聚焦一件可交付的小事，信心會回流。",
    "把精力集中在 1-2 個真正重要的人。",
    "本週適合整理節奏，不宜衝動擴張。",
  ],
  "zh-CN": [
    "聚焦一件可交付的小事，信心会回流。",
    "把精力集中在 1-2 个真正重要的人。",
    "本周适合整理节奏，不宜冲动扩张。",
  ],
};

const fallbackLucky = {
  "zh-TW": { day: "週四", mantra: "慢一點，換來更清楚的判斷。" },
  "zh-CN": { day: "周四", mantra: "慢一点，换来更清楚的判断。" },
};

const fallbackRoadmap = {
  "zh-TW": {
    today: "先處理一個最重要的待辦。",
    week: "這週適合對外溝通。",
    month: "建立一個長期習慣。",
    season: "收斂目標，穩住節奏。",
  },
  "zh-CN": {
    today: "先处理一个最重要的待办。",
    week: "这周适合对外沟通。",
    month: "建立一个长期习惯。",
    season: "收敛目标，稳住节奏。",
  },
};

const storageKey = "goodlife-saved-v2";
const langKey = "goodlife-lang";

const defaultBirth = (() => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 26);
  d.setHours(8, 0, 0, 0);
  return d.toISOString().slice(0, 16);
})();

const formatDate = (value: string) => {
  const d = new Date(value);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()} ${String(
    d.getHours()
  ).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

function App() {
  const [lang, setLang] = useState<Lang>("zh-TW");
  const t = i18n[lang];

  const [form, setForm] = useState({
    name: "旅人",
    birth: defaultBirth,
    focus: focuses[0].id,
    path: flows[0].id,
    wish: "希望今年能有突破感",
  });

  const [saving, setSaving] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedReading[]>([]);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      setSaved(JSON.parse(stored));
    }
    const storedLang = localStorage.getItem(langKey) as Lang | null;
    if (storedLang) {
      setLang(storedLang);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(saved.slice(0, 8)));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(langKey, lang);
  }, [lang]);

  const flow = useMemo(() => flows.find((f) => f.id === form.path) ?? flows[0], [form.path]);
  const focus = useMemo(
    () => focuses.find((f) => f.id === form.focus) ?? focuses[0],
    [form.focus]
  );

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onSave = () => {
    setSaving(true);
    const item: SavedReading = {
      id: `${Date.now()}`,
      name: form.name,
      focus: focus.label[lang],
      path: flow.name[lang],
      headline: aiResult?.headline ?? t.result,
      date: new Date().toISOString(),
    };
    setSaved((prev) => [item, ...prev].slice(0, 8));
    setTimeout(() => setSaving(false), 600);
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

  const onGenerate = async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      const res = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birth: form.birth,
          focus: focus.label[lang],
          path: flow.name[lang],
          wish: form.wish,
          lang,
        }),
      });
      const json = await res.json();
      if (!json.ok) {
        setAiError(json.error ?? "API error");
        setAiResult(null);
        return;
      }
      const data = json.data as AIResult;
      setAiResult(data);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : "Unknown error");
      setAiResult(null);
    } finally {
      setLoadingAI(false);
    }
  };

  return (
    <div className="min-h-screen bg-sand text-slate-900">
      <div className="mx-auto max-w-6xl px-6 pb-16 pt-12">
        <header className="flex flex-col gap-6 border-b border-slate-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">GoodLife Studio</p>
            <h1 className="mt-3 text-4xl font-semibold md:text-5xl">{t.title}</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">{t.subtitle}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">{t.langLabel}</span>
            <div className="flex rounded-full border border-slate-200 bg-white p-1 text-xs">
              <button
                onClick={() => setLang("zh-TW")}
                className={`rounded-full px-3 py-1 ${lang === "zh-TW" ? "bg-slate-900 text-white" : "text-slate-500"}`}
              >
                繁體
              </button>
              <button
                onClick={() => setLang("zh-CN")}
                className={`rounded-full px-3 py-1 ${lang === "zh-CN" ? "bg-slate-900 text-white" : "text-slate-500"}`}
              >
                简体
              </button>
            </div>
          </div>
        </header>

        <main className="mt-10 grid gap-8 lg:grid-cols-[1.1fr_1fr]">
          <section className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{t.input}</h2>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">{t.ritual}</span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">{t.name}</label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
                    value={form.name}
                    onChange={(e) => update("name")(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-600">{t.birth}</label>
                  <input
                    type="datetime-local"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
                    value={form.birth}
                    onChange={(e) => update("birth")(e.target.value)}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-slate-600">{t.wish}</label>
                  <input
                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-slate-800 focus:border-slate-400 focus:outline-none"
                    value={form.wish}
                    onChange={(e) => update("wish")(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-600">{t.focus}</h3>
              <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
                {focuses.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update("focus")(item.id)}
                    className={`rounded-full px-3 py-2 text-sm transition ${
                      form.focus === item.id
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {item.label[lang]}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-600">{t.flow}</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {flows.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => update("path")(item.id)}
                    className={`rounded-3xl border px-4 py-3 text-left transition ${
                      form.path === item.id
                        ? "border-slate-900 bg-slate-50"
                        : "border-slate-200 bg-white hover:border-slate-400"
                    }`}
                  >
                    <p className="text-sm font-semibold text-slate-800">{item.name[lang]}</p>
                    <p className="text-xs text-slate-500">{item.desc[lang]}</p>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div ref={shareRef} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{t.result}</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">
                    {aiResult?.headline ?? t.result}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {form.name} · {formatDate(form.birth)} · {focus.label[lang]}
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-900 px-3 py-2 text-xs text-white">
                  {flow.name[lang]}
                </div>
              </div>

              {aiError && (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  {aiError}
                </div>
              )}

              <div className="mt-4 space-y-4 text-sm text-slate-700">
                <div>
                  <p className="text-xs font-semibold text-slate-400">{t.summary}</p>
                  <p className="mt-2">{aiResult?.summary ?? fallbackSummary[lang]}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400">{t.highlights}</p>
                  <ul className="mt-2 space-y-1">
                    {(aiResult?.highlights ?? []).length > 0
                      ? aiResult?.highlights.map((item, idx) => (
                          <li key={idx} className="rounded-xl bg-slate-50 px-3 py-2">
                            {item}
                          </li>
                        ))
                      : fallbackHighlights[lang].map((item, idx) => (
                          <li key={idx} className="rounded-xl bg-slate-50 px-3 py-2">
                            {item}
                          </li>
                        ))}
                  </ul>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold text-slate-400">{t.lucky}</p>
                    <p className="mt-2 text-sm">
                      {aiResult?.lucky?.color ?? palette[0]} · {aiResult?.lucky?.number ?? 6}
                    </p>
                    <p className="text-xs text-slate-500">{aiResult?.lucky?.day ?? fallbackLucky[lang].day}</p>
                    <p className="mt-2 text-xs text-slate-500">{aiResult?.lucky?.mantra ?? fallbackLucky[lang].mantra}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2">
                    <p className="text-xs font-semibold text-slate-400">{t.roadmap}</p>
                    <div className="mt-2 space-y-2 text-xs text-slate-600">
                      <p>{t.today}：{aiResult?.roadmap?.today ?? fallbackRoadmap[lang].today}</p>
                      <p>{t.week}：{aiResult?.roadmap?.week ?? fallbackRoadmap[lang].week}</p>
                      <p>{t.month}：{aiResult?.roadmap?.month ?? fallbackRoadmap[lang].month}</p>
                      <p>{t.season}：{aiResult?.roadmap?.season ?? fallbackRoadmap[lang].season}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <button
                onClick={onGenerate}
                className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
                disabled={loadingAI}
              >
                {loadingAI ? t.generating : t.generate}
              </button>
              <button
                onClick={onShare}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400"
              >
                {sharing ? t.generating : t.share}
              </button>
              <button
                onClick={onSave}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-slate-400 md:col-span-2"
              >
                {saving ? t.saving : t.save}
              </button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-600">{t.saved}</h3>
                <span className="text-xs text-slate-400">{saved.length}/8</span>
              </div>
              <div className="mt-3 space-y-3">
                {saved.length === 0 && <p className="text-sm text-slate-500">{t.emptySaved}</p>}
                {saved.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-700">{item.name} · {item.focus}</p>
                      <span className="text-xs text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                    </div>
                    <p className="text-xs text-slate-500">{item.path} · {item.headline}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-end justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-700">{t.compareTitle}</h3>
                <p className="text-xs text-slate-500">{t.compareDesc}</p>
              </div>
              <span className="text-xs text-slate-400">{focus.label[lang]}</span>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {flows.map((item) => (
                <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-700">{item.name[lang]}</p>
                  <p className="text-xs text-slate-500">{item.desc[lang]}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">{t.disclaimer}</h3>
            <p className="mt-3 text-sm text-slate-500">
              {lang === "zh-CN"
                ? "本服务不提供投资/医疗/法律建议，请以自我判断为准。"
                : "本服務不提供投資/醫療/法律建議，請以自我判斷為準。"}
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
