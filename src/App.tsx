import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toPng } from "html-to-image";

type Lang = "zh-TW" | "zh-CN";

type Flow = {
  id: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
  tag: Record<Lang, string>;
};

type Focus = {
  id: string;
  label: Record<Lang, string>;
};

type Choice = {
  id: string;
  label: Record<Lang, string>;
};

type Section = {
  title: string;
  body: string;
};

type AIResult = {
  headline: string;
  summary: string;
  highlights: string[];
  sections?: Section[];
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

const copy = {
  "zh-TW": {
    eyebrow: "Oracle Atelier",
    heroTitle: "不是算命頁，\n是你的命理編輯室。",
    heroTitleShort: "命理編輯室",
    heroBody:
      "把輸入、判讀、圖像和分享重新做成完整體驗。資料輸入像建檔，結果輸出像一本只屬於你的小型命理刊物。",
    heroBodyShort:
      "輸入像建檔、結果像刊物。這不是工具頁，是一份可讀、可收藏的命理報告。",
    heroNote: "Cloudflare Pages + OpenRouter",
    heroTagA: "雙語切換",
    heroTagB: "AI 報告",
    heroTagC: "分享海報",
    lang: "語言",
    panelTitle: "建檔區",
    panelBody: "填得越像真實人生，結果越像一份有判斷力的解讀。",
    identityTitle: "身份輪廓",
    contextTitle: "情境設定",
    questionTitle: "提問核心",
    toggleHint: "點擊展開",
    name: "稱呼",
    birth: "出生日期與時間",
    birthPlace: "出生地",
    gender: "性別",
    status: "目前狀態",
    certainty: "時辰可信度",
    focus: "主題焦點",
    flow: "解讀流派",
    wish: "目前最想問的事",
    signalTitle: "命理信號板",
    signalBody: "把抽象占測結果轉成一眼能看懂的節奏與張力。",
    reportTitle: "本次命理報告",
    reportLead: "以 AI 整理成可讀、可截圖、可回看的私人解讀。",
    generate: "生成 AI 命盤",
    generating: "命盤整理中...",
    share: "下載分享海報",
    sharing: "海報輸出中...",
    save: "保存本次結果",
    saved: "已保存",
    summary: "總覽判讀",
    highlights: "三個關鍵提醒",
    sectionsTitle: "重點分區",
    lucky: "開運提示",
    roadmap: "時間節奏",
    radarTitle: "能量星圖",
    radarBody: "不是傳統硬命盤，而是為一般人設計的可理解圖表。",
    archiveTitle: "最近保存",
    archiveEmpty: "還沒有保存紀錄，先做出第一份報告。",
    compareTitle: "不同流派怎麼看你",
    compareBody: "不是誰更準，而是每一派關注的重點不同。",
    footerTitle: "使用提醒",
    footerBody: "娛樂用途，不構成投資、醫療、法律等專業建議。",
    aiError: "AI 目前沒有成功回傳結果，先檢查 Cloudflare 環境變數或稍後重試。",
    today: "今天",
    week: "本週",
    month: "本月",
    season: "本季",
    scoreA: "行動感",
    scoreB: "穩定度",
    scoreC: "機會窗",
    scoreD: "情緒面",
    scoreE: "關係流",
    scoreF: "財務感",
    summaryHintA: "資料完整度",
    summaryHintB: "流派傾向",
    summaryHintC: "主題濃度",
    posterMark: "PRIVATE DOSSIER",
  },
  "zh-CN": {
    eyebrow: "Oracle Atelier",
    heroTitle: "不是算命页，\n是你的命理编辑室。",
    heroTitleShort: "命理编辑室",
    heroBody:
      "把输入、判读、图像和分享重新做成完整体验。资料输入像建档，结果输出像一本只属于你的小型命理刊物。",
    heroBodyShort:
      "输入像建档、结果像刊物。这不是工具页，是一份可读、可收藏的命理报告。",
    heroNote: "Cloudflare Pages + OpenRouter",
    heroTagA: "双语切换",
    heroTagB: "AI 报告",
    heroTagC: "分享海报",
    lang: "语言",
    panelTitle: "建档区",
    panelBody: "填得越像真实人生，结果越像一份有判断力的解读。",
    identityTitle: "身份轮廓",
    contextTitle: "情境设定",
    questionTitle: "提问核心",
    toggleHint: "点击展开",
    name: "称呼",
    birth: "出生日期与时间",
    birthPlace: "出生地",
    gender: "性别",
    status: "目前状态",
    certainty: "时辰可信度",
    focus: "主题焦点",
    flow: "解读流派",
    wish: "目前最想问的事",
    signalTitle: "命理信号板",
    signalBody: "把抽象占测结果转成一眼能看懂的节奏与张力。",
    reportTitle: "本次命理报告",
    reportLead: "以 AI 整理成可读、可截图、可回看的私人解读。",
    generate: "生成 AI 命盘",
    generating: "命盘整理中...",
    share: "下载分享海报",
    sharing: "海报导出中...",
    save: "保存本次结果",
    saved: "已保存",
    summary: "总览判读",
    highlights: "三个关键提醒",
    sectionsTitle: "重点分区",
    lucky: "开运提示",
    roadmap: "时间节奏",
    radarTitle: "能量星图",
    radarBody: "不是传统硬命盘，而是为一般人设计的可理解图表。",
    archiveTitle: "最近保存",
    archiveEmpty: "还没有保存记录，先做出第一份报告。",
    compareTitle: "不同流派怎么看你",
    compareBody: "不是谁更准，而是每一派关注的重点不同。",
    footerTitle: "使用提醒",
    footerBody: "娱乐用途，不构成投资、医疗、法律等专业建议。",
    aiError: "AI 目前没有成功返回结果，请检查 Cloudflare 环境变量或稍后重试。",
    today: "今天",
    week: "本周",
    month: "本月",
    season: "本季",
    scoreA: "行动感",
    scoreB: "稳定度",
    scoreC: "机会窗",
    scoreD: "情绪面",
    scoreE: "关系流",
    scoreF: "财务感",
    summaryHintA: "资料完整度",
    summaryHintB: "流派倾向",
    summaryHintC: "主题浓度",
    posterMark: "PRIVATE DOSSIER",
  },
} as const;

const flows: Flow[] = [
  {
    id: "cyber",
    name: { "zh-TW": "賽博算命", "zh-CN": "赛博算命" },
    desc: {
      "zh-TW": "像產品策略師在幫你看命盤",
      "zh-CN": "像产品策略师在帮你看命盘",
    },
    tag: { "zh-TW": "結構派", "zh-CN": "结构派" },
  },
  {
    id: "love",
    name: { "zh-TW": "月老姻緣", "zh-CN": "月老姻缘" },
    desc: {
      "zh-TW": "更重視情感流向與關係對話",
      "zh-CN": "更重视情感流向与关系对话",
    },
    tag: { "zh-TW": "情感派", "zh-CN": "情感派" },
  },
  {
    id: "qimen",
    name: { "zh-TW": "奇門紫微", "zh-CN": "奇门紫微" },
    desc: {
      "zh-TW": "看時機、看局勢、看關鍵轉折",
      "zh-CN": "看时机、看局势、看关键转折",
    },
    tag: { "zh-TW": "佈局派", "zh-CN": "布局派" },
  },
  {
    id: "master",
    name: { "zh-TW": "大師兜底", "zh-CN": "大师兜底" },
    desc: {
      "zh-TW": "穩健通用，適合第一次占測",
      "zh-CN": "稳健通用，适合第一次占测",
    },
    tag: { "zh-TW": "穩健派", "zh-CN": "稳健派" },
  },
  {
    id: "mentor",
    name: { "zh-TW": "X 導師", "zh-CN": "X 导师" },
    desc: {
      "zh-TW": "口吻更直接，偏行動與推進",
      "zh-CN": "口吻更直接，偏行动与推进",
    },
    tag: { "zh-TW": "推進派", "zh-CN": "推进派" },
  },
  {
    id: "waza",
    name: { "zh-TW": "輕量 waza", "zh-CN": "轻量 waza" },
    desc: {
      "zh-TW": "自由、輕巧、帶一點靈感實驗",
      "zh-CN": "自由、轻巧、带一点灵感实验",
    },
    tag: { "zh-TW": "自由派", "zh-CN": "自由派" },
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

const genders: Choice[] = [
  { id: "female", label: { "zh-TW": "女", "zh-CN": "女" } },
  { id: "male", label: { "zh-TW": "男", "zh-CN": "男" } },
  { id: "other", label: { "zh-TW": "其他", "zh-CN": "其他" } },
];

const statuses: Choice[] = [
  { id: "single", label: { "zh-TW": "單身", "zh-CN": "单身" } },
  { id: "dating", label: { "zh-TW": "曖昧/交往中", "zh-CN": "暧昧/交往中" } },
  { id: "working", label: { "zh-TW": "在職", "zh-CN": "在职" } },
  { id: "transition", label: { "zh-TW": "轉換期", "zh-CN": "转换期" } },
];

const certainties: Choice[] = [
  { id: "exact", label: { "zh-TW": "精確", "zh-CN": "精确" } },
  { id: "rough", label: { "zh-TW": "大概知道", "zh-CN": "大概知道" } },
  { id: "unknown", label: { "zh-TW": "不確定", "zh-CN": "不确定" } },
];

const storageKey = "goodlife-saved-v6";
const langKey = "goodlife-lang";

const isLang = (value: string): value is Lang => value === "zh-TW" || value === "zh-CN";

const isSavedReadingArray = (value: unknown): value is SavedReading[] =>
  Array.isArray(value) &&
  value.every(
    (item) =>
      item &&
      typeof item === "object" &&
      typeof item.id === "string" &&
      typeof item.name === "string" &&
      typeof item.focus === "string" &&
      typeof item.path === "string" &&
      typeof item.headline === "string" &&
      typeof item.date === "string"
  );

const fallbackSummary = {
  "zh-TW":
    "現在的關鍵不是你有沒有機會，而是你能不能把分散的注意力收回來。當主題清楚、節奏變穩，你的運勢會比想像中更容易轉向。",
  "zh-CN":
    "现在的关键不是你有没有机会，而是你能不能把分散的注意力收回来。当主题清楚、节奏变稳，你的运势会比想象中更容易转向。",
};

const fallbackHighlights = {
  "zh-TW": [
    "先把一件最卡的事情處理掉，整體能量會重新流動。",
    "本週適合主動溝通，不適合過度猜測。",
    "你的好運不是突然降臨，而是從排序清楚開始。",
  ],
  "zh-CN": [
    "先把一件最卡的事情处理掉，整体能量会重新流动。",
    "本周适合主动沟通，不适合过度猜测。",
    "你的好运不是突然降临，而是从排序清楚开始。",
  ],
};

const fallbackSections = {
  "zh-TW": [
    {
      title: "感情",
      body: "關係裡最重要的不是氣氛，而是你有沒有把需求說清楚。現在更適合真誠表態，而不是維持模糊。",
    },
    {
      title: "事業",
      body: "工作面有機會出現新的推進口，但前提是先把核心任務做得穩。穩定交付比到處開新局更有用。",
    },
    {
      title: "財運",
      body: "財務上偏向整理期，適合盤點現金流和支出結構。把錢留給真正重要的方向，運勢才會更順。",
    },
  ],
  "zh-CN": [
    {
      title: "感情",
      body: "关系里最重要的不是气氛，而是你有没有把需求说清楚。现在更适合真诚表态，而不是维持模糊。",
    },
    {
      title: "事业",
      body: "工作面有机会出现新的推进口，但前提是先把核心任务做稳。稳定交付比到处开新局更有用。",
    },
    {
      title: "财运",
      body: "财务上偏向整理期，适合盘点现金流和支出结构。把钱留给真正重要的方向，运势才会更顺。",
    },
  ],
};

const fallbackLucky = {
  "zh-TW": { color: "松煙綠", number: 6, day: "週四", mantra: "先穩住，再放大。" },
  "zh-CN": { color: "松烟绿", number: 6, day: "周四", mantra: "先稳住，再放大。" },
};

const fallbackRoadmap = {
  "zh-TW": {
    today: "今天優先處理最卡的那一件事，讓整體節奏重新通順。",
    week: "本週適合調整互動方式，少猜測，多確認。",
    month: "本月重點在建立更穩的工作與生活結構。",
    season: "未來一季的核心是收斂資源，讓行動更集中。",
  },
  "zh-CN": {
    today: "今天优先处理最卡的那一件事，让整体节奏重新通顺。",
    week: "本周适合调整互动方式，少猜测，多确认。",
    month: "本月重点在建立更稳的工作与生活结构。",
    season: "未来一季的核心是收敛资源，让行动更集中。",
  },
};

const defaultBirth = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 26);
  date.setHours(8, 0, 0, 0);
  return date.toISOString().slice(0, 16);
})();

const formatDate = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const scoreFromText = (text: string, offset: number) =>
  58 + ((text.length * 9 + offset * 17) % 34);

const buildRadarPoints = (values: number[]) => {
  const center = 120;
  const radius = 84;
  return values
    .map((value, index) => {
      const angle = (Math.PI * 2 * index) / values.length - Math.PI / 2;
      const pointRadius = (radius * value) / 100;
      const x = center + Math.cos(angle) * pointRadius;
      const y = center + Math.sin(angle) * pointRadius;
      return `${x},${y}`;
    })
    .join(" ");
};

function SectionCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="panel-card rounded-[28px] p-5 md:p-6">
      <p className="panel-label">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CollapsibleCard({
  title,
  hint,
  defaultOpen,
  children,
}: {
  title: string;
  hint: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  return (
    <details className="panel-card panel-collapsible rounded-[28px] p-5 md:p-6" open={defaultOpen}>
      <summary className="panel-summary">
        <span className="panel-label">{title}</span>
        <span className="panel-summary-hint">{hint}</span>
      </summary>
      <div className="panel-content">{children}</div>
    </details>
  );
}

function App() {
  const [lang, setLang] = useState<Lang>("zh-TW");
  const t = copy[lang];
  const [form, setForm] = useState({
    name: "旅人",
    birth: defaultBirth,
    birthPlace: "台北",
    gender: genders[0].id,
    status: statuses[2].id,
    certainty: certainties[0].id,
    focus: focuses[0].id,
    path: flows[0].id,
    wish: lang === "zh-CN" ? "希望今年能出现明确突破" : "希望今年能出現明確突破",
  });
  const [loadingAI, setLoadingAI] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [saved, setSaved] = useState<SavedReading[]>([]);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedSaved = localStorage.getItem(storageKey);
      if (storedSaved) {
        const parsed = JSON.parse(storedSaved);
        if (isSavedReadingArray(parsed)) {
          setSaved(parsed);
        } else {
          localStorage.removeItem(storageKey);
        }
      }
    } catch {
      localStorage.removeItem(storageKey);
    }

    try {
      const storedLang = localStorage.getItem(langKey);
      if (storedLang && isLang(storedLang)) {
        setLang(storedLang);
      } else if (storedLang) {
        localStorage.removeItem(langKey);
      }
    } catch {
      localStorage.removeItem(langKey);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(saved.slice(0, 8)));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(langKey, lang);
  }, [lang]);

  const flow = useMemo(() => flows.find((item) => item.id === form.path) ?? flows[0], [form.path]);
  const focus = useMemo(() => focuses.find((item) => item.id === form.focus) ?? focuses[0], [form.focus]);
  const gender = useMemo(
    () => genders.find((item) => item.id === form.gender) ?? genders[0],
    [form.gender]
  );
  const status = useMemo(
    () => statuses.find((item) => item.id === form.status) ?? statuses[0],
    [form.status]
  );
  const certainty = useMemo(
    () => certainties.find((item) => item.id === form.certainty) ?? certainties[0],
    [form.certainty]
  );

  const report = {
    headline: aiResult?.headline ?? t.reportTitle,
    summary: aiResult?.summary ?? fallbackSummary[lang],
    highlights:
      aiResult?.highlights && aiResult.highlights.length > 0
        ? aiResult.highlights
        : fallbackHighlights[lang],
    sections:
      aiResult?.sections && aiResult.sections.length > 0
        ? aiResult.sections
        : fallbackSections[lang],
    lucky: aiResult?.lucky ?? fallbackLucky[lang],
    roadmap: aiResult?.roadmap ?? fallbackRoadmap[lang],
  };

  const scorecards = [
    { label: t.scoreA, value: scoreFromText(form.wish, 1) },
    { label: t.scoreB, value: scoreFromText(form.status, 2) },
    { label: t.scoreC, value: scoreFromText(form.focus, 3) },
    { label: t.scoreD, value: scoreFromText(form.name, 4) },
    { label: t.scoreE, value: scoreFromText(form.gender, 5) },
    { label: t.scoreF, value: scoreFromText(form.birthPlace, 6) },
  ];

  const signalBadges = [
    `${t.summaryHintA} ${Math.min(99, 70 + form.birthPlace.length)}`,
    `${t.summaryHintB} ${flow.tag[lang]}`,
    `${t.summaryHintC} ${focus.label[lang]}`,
  ];

  const radarPoints = buildRadarPoints(scorecards.map((item) => item.value));

  const update = (key: keyof typeof form) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onGenerate = async () => {
    setLoadingAI(true);
    setAiError(null);
    try {
      const response = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          birth: form.birth,
          birthPlace: form.birthPlace,
          gender: gender.label[lang],
          status: status.label[lang],
          timeCertainty: certainty.label[lang],
          focus: focus.label[lang],
          path: flow.name[lang],
          wish: form.wish,
          lang,
        }),
      });
      const json = await response.json();
      if (!json.ok) {
        setAiError(json.error ?? t.aiError);
        setAiResult(null);
        return;
      }
      setAiResult(json.data as AIResult);
    } catch (error) {
      setAiError(error instanceof Error ? error.message : t.aiError);
      setAiResult(null);
    } finally {
      setLoadingAI(false);
    }
  };

  const onShare = async () => {
    if (!shareRef.current) return;
    setSharing(true);
    try {
      const dataUrl = await toPng(shareRef.current, {
        pixelRatio: 2,
        backgroundColor: "#f3ecdf",
      });
      const link = document.createElement("a");
      link.download = `goodlife-poster-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } finally {
      setSharing(false);
    }
  };

  const onSave = () => {
    setSaving(true);
    setSaved((prev) => [
      {
        id: `${Date.now()}`,
        name: form.name,
        focus: focus.label[lang],
        path: flow.name[lang],
        headline: report.headline,
        date: new Date().toISOString(),
      },
      ...prev,
    ].slice(0, 8));
    setTimeout(() => setSaving(false), 650);
  };

  return (
    <div className="min-h-screen bg-stage text-slate-900">
      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="mx-auto max-w-[1500px] px-4 pb-16 pt-5 md:px-8">
        <header className="hero-shell rounded-[38px] px-5 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <span className="pill-light">{t.eyebrow}</span>
                <span className="pill-dark">{t.heroNote}</span>
              </div>
              <div className="space-y-4">
                <h1 className="hero-title whitespace-pre-line">
                  <span className="hidden md:block">{t.heroTitle}</span>
                  <span className="block md:hidden">{t.heroTitleShort}</span>
                </h1>
                <p className="max-w-3xl text-base leading-8 text-stone-600 md:text-lg">
                  <span className="hidden md:block">{t.heroBody}</span>
                  <span className="block md:hidden">{t.heroBodyShort}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="hero-chip">{t.heroTagA}</span>
                <span className="hero-chip">{t.heroTagB}</span>
                <span className="hero-chip">{t.heroTagC}</span>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[30px] bg-[#14281d] p-5 text-white shadow-[0_20px_50px_rgba(20,40,29,0.28)]">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">{t.lang}</p>
                  <div className="flex rounded-full bg-white/10 p-1 text-xs">
                    <button
                      onClick={() => setLang("zh-TW")}
                      className={`rounded-full px-3 py-1 ${
                        lang === "zh-TW" ? "bg-white text-[#14281d]" : "text-white/70"
                      }`}
                    >
                      繁體
                    </button>
                    <button
                      onClick={() => setLang("zh-CN")}
                      className={`rounded-full px-3 py-1 ${
                        lang === "zh-CN" ? "bg-white text-[#14281d]" : "text-white/70"
                      }`}
                    >
                      简体
                    </button>
                  </div>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3">
                  {scorecards.slice(0, 3).map((item) => (
                    <div key={item.label} className="rounded-2xl bg-white/10 px-3 py-4">
                      <p className="text-[11px] uppercase tracking-[0.2em] text-white/55">
                        {item.label}
                      </p>
                      <p className="mt-2 text-2xl font-semibold">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[30px] bg-white/85 p-5 shadow-[0_14px_40px_rgba(58,45,25,0.08)] ring-1 ring-stone-200">
                <p className="text-[11px] uppercase tracking-[0.28em] text-stone-400">
                  {t.signalTitle}
                </p>
                <p className="mt-3 text-sm leading-7 text-stone-600">{t.signalBody}</p>
                <div className="mt-5 space-y-2">
                  {signalBadges.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-700"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="mt-8 grid gap-8 xl:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="order-2 space-y-5 xl:order-1 xl:sticky xl:top-6 xl:self-start">
            <SectionCard title={t.panelTitle}>
              <p className="text-sm leading-7 text-stone-600">{t.panelBody}</p>
            </SectionCard>

            <CollapsibleCard title={t.identityTitle} hint={t.toggleHint} defaultOpen>
              <div className="grid gap-4">
                <label className="field-block">
                  <span className="field-label">{t.name}</span>
                  <input
                    className="field-input"
                    value={form.name}
                    onChange={(e) => update("name")(e.target.value)}
                  />
                </label>
                <label className="field-block">
                  <span className="field-label">{t.birth}</span>
                  <input
                    type="datetime-local"
                    className="field-input"
                    value={form.birth}
                    onChange={(e) => update("birth")(e.target.value)}
                  />
                </label>
                <label className="field-block">
                  <span className="field-label">{t.birthPlace}</span>
                  <input
                    className="field-input"
                    value={form.birthPlace}
                    onChange={(e) => update("birthPlace")(e.target.value)}
                  />
                </label>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
                  <label className="field-block">
                    <span className="field-label">{t.gender}</span>
                    <select
                      className="field-input"
                      value={form.gender}
                      onChange={(e) => update("gender")(e.target.value)}
                    >
                      {genders.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label[lang]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field-block">
                    <span className="field-label">{t.certainty}</span>
                    <select
                      className="field-input"
                      value={form.certainty}
                      onChange={(e) => update("certainty")(e.target.value)}
                    >
                      {certainties.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.label[lang]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title={t.contextTitle} hint={t.toggleHint}>
              <div className="grid gap-4">
                <label className="field-block">
                  <span className="field-label">{t.status}</span>
                  <select
                    className="field-input"
                    value={form.status}
                    onChange={(e) => update("status")(e.target.value)}
                  >
                    {statuses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label[lang]}
                      </option>
                    ))}
                  </select>
                </label>

                <div>
                  <span className="field-label">{t.focus}</span>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    {focuses.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => update("focus")(item.id)}
                        className={`choice-card ${
                          form.focus === item.id ? "choice-card-active" : ""
                        }`}
                      >
                        {item.label[lang]}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="field-label">{t.flow}</span>
                  <div className="mt-3 grid gap-3">
                    {flows.map((item) => (
                      <button
                        key={item.id}
                        onClick={() => update("path")(item.id)}
                        className={`flow-card ${form.path === item.id ? "flow-card-active" : ""}`}
                      >
                        <div>
                          <p className="text-sm font-semibold">{item.name[lang]}</p>
                          <p className="mt-1 text-xs opacity-75">{item.desc[lang]}</p>
                        </div>
                        <span className="flow-tag">{item.tag[lang]}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleCard>

            <CollapsibleCard title={t.questionTitle} hint={t.toggleHint} defaultOpen>
              <label className="field-block">
                <span className="field-label">{t.wish}</span>
                <textarea
                  className="field-input min-h-32 resize-none"
                  value={form.wish}
                  onChange={(e) => update("wish")(e.target.value)}
                />
              </label>
              <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                <button
                  onClick={onGenerate}
                  disabled={loadingAI}
                  className="action-primary"
                >
                  {loadingAI ? t.generating : t.generate}
                </button>
                <button onClick={onShare} disabled={sharing} className="action-secondary">
                  {sharing ? t.sharing : t.share}
                </button>
                <button onClick={onSave} className="action-secondary">
                  {saving ? t.saved : t.save}
                </button>
              </div>
            </CollapsibleCard>
          </aside>

          <section className="order-1 space-y-6 xl:order-2">
            <div
              ref={shareRef}
              className="report-shell overflow-hidden rounded-[40px] border border-[#ddd2c0] bg-[#f3ecdf]"
            >
              <div className="report-top px-6 py-6 md:px-8 md:py-8">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="max-w-3xl">
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[#8e7b62]">
                      {t.posterMark}
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#241d14] md:text-5xl">
                      {report.headline}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[#6b5c4b] md:text-base">
                      {t.reportLead}
                    </p>
                  </div>
                  <div className="rounded-[28px] bg-[#14281d] px-5 py-4 text-white shadow-[0_16px_40px_rgba(20,40,29,0.25)]">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">
                      {t.signalTitle}
                    </p>
                    <p className="mt-2 text-3xl font-semibold">{scorecards[0].value}</p>
                    <p className="mt-1 text-xs text-white/65">{focus.label[lang]}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#9b8d79]">
                      {t.identityTitle}
                    </p>
                    <p className="mt-2 text-sm text-[#42372c]">
                      {form.name} · {gender.label[lang]}
                    </p>
                    <p className="mt-1 text-sm text-[#6f6252]">{formatDate(form.birth)}</p>
                  </div>
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#9b8d79]">
                      {t.contextTitle}
                    </p>
                    <p className="mt-2 text-sm text-[#42372c]">{form.birthPlace}</p>
                    <p className="mt-1 text-sm text-[#6f6252]">
                      {status.label[lang]} · {certainty.label[lang]}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#9b8d79]">
                      {t.flow}
                    </p>
                    <p className="mt-2 text-sm text-[#42372c]">{flow.name[lang]}</p>
                    <p className="mt-1 text-sm text-[#6f6252]">{flow.desc[lang]}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-6 px-6 pb-6 md:px-8 md:pb-8 xl:grid-cols-[1.08fr_0.92fr]">
                <div className="space-y-6">
                  {aiError ? (
                    <div className="rounded-[28px] border border-[#e2beb4] bg-[#fff3ef] px-5 py-4 text-sm text-[#9f4f41]">
                      {aiError || t.aiError}
                    </div>
                  ) : null}

                  <div className="report-card">
                    <p className="report-label">{t.summary}</p>
                    <p className="mt-4 text-[15px] leading-8 text-[#45382b]">{report.summary}</p>
                  </div>

                  <div className="report-card">
                    <p className="report-label">{t.highlights}</p>
                    <div className="mt-4 grid gap-3">
                      {report.highlights.map((item, index) => (
                        <div key={`${item}-${index}`} className="highlight-card">
                          <span className="highlight-index">0{index + 1}</span>
                          <p className="mt-2 text-sm leading-7 text-[#45382b]">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="report-card">
                    <p className="report-label">{t.sectionsTitle}</p>
                    <div className="mt-4 grid gap-4 md:grid-cols-3">
                      {report.sections.map((section, index) => (
                        <article key={`${section.title}-${index}`} className="section-card">
                          <p className="section-title">{section.title}</p>
                          <p className="mt-3 text-sm leading-7 text-[#4d4033]">{section.body}</p>
                        </article>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="report-card h-full">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="report-label">{t.radarTitle}</p>
                        <p className="mt-2 text-sm leading-7 text-[#6d5e4d]">{t.radarBody}</p>
                      </div>
                    </div>
                    <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr] xl:grid-cols-1">
                      <div className="mx-auto">
                        <svg viewBox="0 0 240 240" className="h-[240px] w-[240px]">
                          <circle cx="120" cy="120" r="90" fill="none" stroke="#ddd3c4" />
                          <circle cx="120" cy="120" r="66" fill="none" stroke="#e8dfd2" />
                          <circle cx="120" cy="120" r="42" fill="none" stroke="#f0e8dc" />
                          <polygon
                            points={radarPoints}
                            fill="rgba(20,40,29,0.16)"
                            stroke="#14281d"
                            strokeWidth="2"
                          />
                          {scorecards.map((item, index) => {
                            const angle = (Math.PI * 2 * index) / scorecards.length - Math.PI / 2;
                            const x = 120 + Math.cos(angle) * 108;
                            const y = 120 + Math.sin(angle) * 108;
                            return (
                              <text
                                key={item.label}
                                x={x}
                                y={y}
                                textAnchor="middle"
                                dominantBaseline="middle"
                                fill="#74624f"
                                fontSize="10"
                              >
                                {item.label}
                              </text>
                            );
                          })}
                        </svg>
                      </div>
                      <div className="grid gap-3">
                        {scorecards.map((item) => (
                          <div key={item.label} className="score-row">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-sm font-medium text-[#4a3f34]">{item.label}</span>
                              <span className="text-sm font-semibold text-[#14281d]">{item.value}</span>
                            </div>
                            <div className="mt-2 h-2 rounded-full bg-[#ece2d4]">
                              <div
                                className="h-2 rounded-full bg-[#14281d]"
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-1">
                    <div className="report-card report-card-dark">
                      <p className="report-label report-label-dark">{t.lucky}</p>
                      <p className="mt-4 text-2xl font-semibold text-white">
                        {report.lucky.color} · {report.lucky.number}
                      </p>
                      <p className="mt-2 text-sm text-white/70">{report.lucky.day}</p>
                      <p className="mt-4 text-sm leading-7 text-white/82">{report.lucky.mantra}</p>
                    </div>

                    <div className="report-card">
                      <p className="report-label">{t.roadmap}</p>
                      <div className="mt-4 grid gap-3">
                        {[
                          [t.today, report.roadmap.today],
                          [t.week, report.roadmap.week],
                          [t.month, report.roadmap.month],
                          [t.season, report.roadmap.season],
                        ].map(([label, value]) => (
                          <div key={label} className="timeline-card">
                            <p className="text-[11px] uppercase tracking-[0.22em] text-[#8e7d69]">
                              {label}
                            </p>
                            <p className="mt-2 text-sm leading-7 text-[#45382b]">{value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
              <div className="panel-card rounded-[32px] p-6">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <p className="panel-label">{t.compareTitle}</p>
                    <p className="mt-2 text-sm leading-7 text-stone-600">{t.compareBody}</p>
                  </div>
                  <span className="rounded-full bg-stone-100 px-4 py-2 text-xs uppercase tracking-[0.2em] text-stone-500">
                    {focus.label[lang]}
                  </span>
                </div>
                <div className="mt-5 grid gap-3 md:grid-cols-3">
                  {flows.map((item) => (
                    <article key={item.id} className="rounded-[24px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
                      <p className="text-sm font-semibold text-stone-800">{item.name[lang]}</p>
                      <p className="mt-2 text-sm leading-6 text-stone-500">{item.desc[lang]}</p>
                      <span className="mt-4 inline-flex rounded-full bg-white px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-stone-500">
                        {item.tag[lang]}
                      </span>
                    </article>
                  ))}
                </div>
              </div>

              <div className="panel-card rounded-[32px] p-6">
                <div className="flex items-center justify-between">
                  <p className="panel-label">{t.archiveTitle}</p>
                  <span className="text-sm text-stone-400">{saved.length}/8</span>
                </div>
                <div className="mt-4 space-y-3">
                  {saved.length === 0 ? (
                    <p className="text-sm leading-7 text-stone-500">{t.archiveEmpty}</p>
                  ) : (
                    saved.map((item) => (
                      <div key={item.id} className="rounded-[22px] bg-stone-50 px-4 py-4 ring-1 ring-stone-200">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm font-semibold text-stone-800">
                              {item.name} · {item.focus}
                            </p>
                            <p className="mt-1 text-sm text-stone-500">{item.headline}</p>
                            <p className="mt-2 text-[11px] uppercase tracking-[0.22em] text-stone-400">
                              {item.path}
                            </p>
                          </div>
                          <span className="text-xs text-stone-400">
                            {new Date(item.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-8 rounded-[32px] bg-[#14281d] px-6 py-6 text-white shadow-[0_18px_45px_rgba(20,40,29,0.24)]">
          <p className="text-[11px] uppercase tracking-[0.28em] text-white/55">{t.footerTitle}</p>
          <p className="mt-3 text-base leading-8 text-white/80">{t.footerBody}</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
