import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { toPng } from "html-to-image";

import type { AIResult, FormState, Lang, SavedReading } from "./types";
import {
  certainties,
  copy,
  fallbackHighlights,
  fallbackLucky,
  fallbackRoadmap,
  fallbackSections,
  fallbackSummary,
  flows,
  focuses,
  genders,
  langKey,
  sampleFormByLang,
  statuses,
  storageKey,
} from "./data";
import {
  buildRadarPoints,
  calcCompletion,
  defaultBirth,
  formatDate,
  isLang,
  isSavedReadingArray,
  scoreFromText,
} from "./utils";

type SectionCardProps = { title: string; children: ReactNode };

type CollapsibleCardProps = {
  title: string;
  hint: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

const buildDefaultForm = (lang: Lang): FormState => ({
  name: sampleFormByLang[lang].name,
  birth: defaultBirth,
  birthPlace: sampleFormByLang[lang].birthPlace,
  gender: genders[0].id,
  status: statuses[2].id,
  certainty: certainties[0].id,
  focus: focuses[0].id,
  path: flows[0].id,
  wish: sampleFormByLang[lang].wish,
});

function SectionCard({ title, children }: SectionCardProps) {
  return (
    <section className="panel-card rounded-[28px] p-5 md:p-6">
      <p className="panel-label">{title}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function CollapsibleCard({ title, hint, defaultOpen, children }: CollapsibleCardProps) {
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
  const [form, setForm] = useState<FormState>(() => buildDefaultForm("zh-TW"));
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
        setForm(buildDefaultForm(storedLang));
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
  const completion = calcCompletion(form);
  const isReady = Boolean(form.name.trim()) && Boolean(form.wish.trim());

  const update = (key: keyof FormState) => (value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const onGenerate = async () => {
    if (!isReady) return;
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
    if (!aiResult) return;
    setSaving(true);
    setSaved((prev) => [
      {
        id: `${Date.now()}`,
        name: form.name,
        focus: focus.label[lang],
        path: flow.name[lang],
        headline: report.headline,
        date: new Date().toISOString(),
        payload: form,
        result: aiResult,
      },
      ...prev,
    ].slice(0, 8));
    setTimeout(() => setSaving(false), 650);
  };

  const onLoadSaved = (item: SavedReading) => {
    setForm(item.payload);
    setAiResult(item.result);
    setAiError(null);
  };

  const fillSample = () => {
    setForm((prev) => ({
      ...prev,
      name: sampleFormByLang[lang].name,
      birthPlace: sampleFormByLang[lang].birthPlace,
      wish: sampleFormByLang[lang].wish,
    }));
  };

  const resetForm = () => {
    setForm(buildDefaultForm(lang));
    setAiResult(null);
    setAiError(null);
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
                    <div key={item} className="rounded-2xl bg-stone-100 px-4 py-3 text-sm text-stone-700">
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
              <div className="mt-5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500">
                  <span>{t.completion}</span>
                  <span>{completion}%</span>
                </div>
                <div className="mt-2 h-2 rounded-full bg-stone-200">
                  <div className="completion-bar" style={{ width: `${completion}%` }} />
                </div>
                <p className="mt-3 text-xs text-stone-500">{t.completionHint}</p>
              </div>
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-400">{t.quickActions}</p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button onClick={fillSample} className="action-ghost">
                    {t.fillSample}
                  </button>
                  <button onClick={resetForm} className="action-ghost">
                    {t.resetForm}
                  </button>
                </div>
              </div>
            </SectionCard>

            <CollapsibleCard title={t.identityTitle} hint={t.toggleHint} defaultOpen>
              <div className="grid gap-4">
                <label className="field-block">
                  <span className="field-label">{t.name}</span>
                  <input className="field-input" value={form.name} onChange={(e) => update("name")(e.target.value)} />
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
                        className={`choice-card ${form.focus === item.id ? "choice-card-active" : ""}`}
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
              {!isReady ? <p className="mt-3 text-xs text-rose-500">{t.incompleteHint}</p> : null}
              <div className="mt-4 grid gap-3 md:grid-cols-3 xl:grid-cols-1">
                <button
                  onClick={onGenerate}
                  disabled={loadingAI || !isReady}
                  className="action-primary"
                >
                  {loadingAI ? t.generating : t.generate}
                </button>
                <button onClick={onShare} disabled={sharing} className="action-secondary">
                  {sharing ? t.sharing : t.share}
                </button>
                <button onClick={onSave} disabled={!aiResult} className="action-secondary">
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
                    <p className="text-[11px] uppercase tracking-[0.32em] text-[#8e7b62]">{t.posterMark}</p>
                    <h2 className="mt-3 text-3xl font-semibold leading-tight text-[#241d14] md:text-5xl">
                      {report.headline}
                    </h2>
                    <p className="mt-4 text-sm leading-7 text-[#6b5c4b] md:text-base">{t.reportLead}</p>
                  </div>
                  <div className="rounded-[28px] bg-[#14281d] px-5 py-4 text-white shadow-[0_16px_40px_rgba(20,40,29,0.25)]">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-white/55">{t.signalTitle}</p>
                    <p className="mt-2 text-3xl font-semibold">{scorecards[0].value}</p>
                    <p className="mt-1 text-xs text-white/65">{focus.label[lang]}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#9b8d79]">{t.identityTitle}</p>
                    <p className="mt-2 text-sm text-[#42372c]">{form.name} · {gender.label[lang]}</p>
                    <p className="mt-1 text-sm text-[#6f6252]">{formatDate(form.birth)}</p>
                  </div>
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#9b8d79]">{t.contextTitle}</p>
                    <p className="mt-2 text-sm text-[#42372c]">{form.birthPlace}</p>
                    <p className="mt-1 text-sm text-[#6f6252]">
                      {status.label[lang]} · {certainty.label[lang]}
                    </p>
                  </div>
                  <div className="rounded-[24px] bg-white/72 px-4 py-4 backdrop-blur">
                    <p className="text-[11px] uppercase tracking-[0.24em] text-[#9b8d79]">{t.flow}</p>
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
                              <div className="h-2 rounded-full bg-[#14281d]" style={{ width: `${item.value}%` }} />
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
                        <button onClick={() => onLoadSaved(item)} className="load-saved">
                          {t.loadSaved}
                        </button>
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
