export type Lang = "zh-TW" | "zh-CN";

export type Flow = {
  id: string;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
  tag: Record<Lang, string>;
};

export type Focus = {
  id: string;
  label: Record<Lang, string>;
};

export type Choice = {
  id: string;
  label: Record<Lang, string>;
};

export type Section = {
  title: string;
  body: string;
};

export type AIResult = {
  headline: string;
  summary: string;
  highlights: string[];
  sections?: Section[];
  lucky: { color: string; number: number; day: string; mantra: string };
  roadmap: { today: string; week: string; month: string; season: string };
  raw?: string;
};

export type FormState = {
  name: string;
  birth: string;
  birthPlace: string;
  gender: string;
  status: string;
  certainty: string;
  focus: string;
  path: string;
  wish: string;
};

export type SavedReading = {
  id: string;
  name: string;
  focus: string;
  path: string;
  headline: string;
  date: string;
  payload: FormState;
  result: AIResult;
};
