import type { AIResult, Choice, Flow, Focus, Lang } from "./types";

export const copy = {
  "zh-TW": {
    eyebrow: "Oracle Atelier",
    heroTitle: "不是算命頁，
是你的命理編輯室。",
    heroTitleShort: "命理編輯室",
    heroBody:
      "把輸入、判讀、圖像和分享重新做成完整體驗。資料輸入像建檔，結果輸出像一本只屬於你的小型命理刊物。",
    heroBodyShort: "輸入像建檔、結果像刊物。這不是工具頁，是一份可讀、可收藏的命理報告。",
    heroNote: "Cloudflare Pages + OpenRouter",
    heroTagA: "雙語切換",
    heroTagB: "AI 報告",
    heroTagC: "分享海報",
    lang: "語言",
    completion: "建檔完整度",
    completionHint: "資料越完整，判讀越有張力",
    quickActions: "快速操作",
    fillSample: "填入範例",
    resetForm: "重置表單",
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
    incompleteHint: "請先補齊稱呼與問題內容，再開始生成。",
    loadSaved: "讀取保存",
  },
  "zh-CN": {
    eyebrow: "Oracle Atelier",
    heroTitle: "不是算命页，
是你的命理编辑室。",
    heroTitleShort: "命理编辑室",
    heroBody:
      "把输入、判读、图像和分享重新做成完整体验。资料输入像建档，结果输出像一本只属于你的小型命理刊物。",
    heroBodyShort: "输入像建档、结果像刊物。这不是工具页，是一份可读、可收藏的命理报告。",
    heroNote: "Cloudflare Pages + OpenRouter",
    heroTagA: "双语切换",
    heroTagB: "AI 报告",
    heroTagC: "分享海报",
    lang: "语言",
    completion: "建档完整度",
    completionHint: "资料越完整，判读越有张力",
    quickActions: "快速操作",
    fillSample: "填入范例",
    resetForm: "重置表单",
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
    incompleteHint: "请先补齐称呼与问题内容，再开始生成。",
    loadSaved: "读取保存",
  },
} as const;

export const flows: Flow[] = [
  {
    id: "cyber",
    name: { "zh-TW": "賽博算命", "zh-CN": "赛博算命" },
    desc: { "zh-TW": "像產品策略師在幫你看命盤", "zh-CN": "像产品策略师在帮你看命盘" },
    tag: { "zh-TW": "結構派", "zh-CN": "结构派" },
  },
  {
    id: "love",
    name: { "zh-TW": "月老姻緣", "zh-CN": "月老姻缘" },
    desc: { "zh-TW": "更重視情感流向與關係對話", "zh-CN": "更重视情感流向与关系对话" },
    tag: { "zh-TW": "情感派", "zh-CN": "情感派" },
  },
  {
    id: "qimen",
    name: { "zh-TW": "奇門紫微", "zh-CN": "奇门紫微" },
    desc: { "zh-TW": "看時機、看局勢、看關鍵轉折", "zh-CN": "看时机、看局势、看关键转折" },
    tag: { "zh-TW": "佈局派", "zh-CN": "布局派" },
  },
  {
    id: "master",
    name: { "zh-TW": "大師兜底", "zh-CN": "大师兜底" },
    desc: { "zh-TW": "穩健通用，適合第一次占測", "zh-CN": "稳健通用，适合第一次占测" },
    tag: { "zh-TW": "穩健派", "zh-CN": "稳健派" },
  },
  {
    id: "mentor",
    name: { "zh-TW": "X 導師", "zh-CN": "X 导师" },
    desc: { "zh-TW": "口吻更直接，偏行動與推進", "zh-CN": "口吻更直接，偏行动与推进" },
    tag: { "zh-TW": "推進派", "zh-CN": "推进派" },
  },
  {
    id: "waza",
    name: { "zh-TW": "輕量 waza", "zh-CN": "轻量 waza" },
    desc: { "zh-TW": "自由、輕巧、帶一點靈感實驗", "zh-CN": "自由、轻巧、带一点灵感实验" },
    tag: { "zh-TW": "自由派", "zh-CN": "自由派" },
  },
];

export const focuses: Focus[] = [
  { id: "overall", label: { "zh-TW": "全局運勢", "zh-CN": "全局运势" } },
  { id: "love", label: { "zh-TW": "姻緣感情", "zh-CN": "姻缘感情" } },
  { id: "career", label: { "zh-TW": "事業跳槽", "zh-CN": "事业跳槽" } },
  { id: "wealth", label: { "zh-TW": "財富偏正", "zh-CN": "财富偏正" } },
  { id: "health", label: { "zh-TW": "健康節奏", "zh-CN": "健康节奏" } },
  { id: "study", label: { "zh-TW": "學習考試", "zh-CN": "学习考试" } },
];

export const genders: Choice[] = [
  { id: "female", label: { "zh-TW": "女", "zh-CN": "女" } },
  { id: "male", label: { "zh-TW": "男", "zh-CN": "男" } },
  { id: "other", label: { "zh-TW": "其他", "zh-CN": "其他" } },
];

export const statuses: Choice[] = [
  { id: "single", label: { "zh-TW": "單身", "zh-CN": "单身" } },
  { id: "dating", label: { "zh-TW": "曖昧/交往中", "zh-CN": "暧昧/交往中" } },
  { id: "working", label: { "zh-TW": "在職", "zh-CN": "在职" } },
  { id: "transition", label: { "zh-TW": "轉換期", "zh-CN": "转换期" } },
];

export const certainties: Choice[] = [
  { id: "exact", label: { "zh-TW": "精確", "zh-CN": "精确" } },
  { id: "rough", label: { "zh-TW": "大概知道", "zh-CN": "大概知道" } },
  { id: "unknown", label: { "zh-TW": "不確定", "zh-CN": "不确定" } },
];

export const storageKey = "goodlife-saved-v7";
export const langKey = "goodlife-lang";

export const fallbackSummary: Record<Lang, string> = {
  "zh-TW":
    "現在的關鍵不是你有沒有機會，而是你能不能把分散的注意力收回來。當主題清楚、節奏變穩，你的運勢會比想像中更容易轉向。",
  "zh-CN":
    "现在的关键不是你有没有机会，而是你能不能把分散的注意力收回来。当主题清楚、节奏变稳，你的运势会比想象中更容易转向。",
};

export const fallbackHighlights: Record<Lang, string[]> = {
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

export const fallbackSections: Record<Lang, { title: string; body: string }[]> = {
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

export const fallbackLucky: Record<Lang, AIResult["lucky"]> = {
  "zh-TW": { color: "松煙綠", number: 6, day: "週四", mantra: "先穩住，再放大。" },
  "zh-CN": { color: "松烟绿", number: 6, day: "周四", mantra: "先稳住，再放大。" },
};

export const fallbackRoadmap: Record<Lang, AIResult["roadmap"]> = {
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

export const sampleFormByLang: Record<Lang, { name: string; birthPlace: string; wish: string }> = {
  "zh-TW": {
    name: "旅人",
    birthPlace: "台北",
    wish: "希望今年能出現明確突破",
  },
  "zh-CN": {
    name: "旅人",
    birthPlace: "台北",
    wish: "希望今年能出现明确突破",
  },
};
