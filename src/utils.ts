import type { FormState, Lang, SavedReading } from "./types";

export const isLang = (value: string): value is Lang => value === "zh-TW" || value === "zh-CN";

export const isSavedReadingArray = (value: unknown): value is SavedReading[] =>
  Array.isArray(value) &&
  value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const record = item as SavedReading;
    return (
      typeof record.id === "string" &&
      typeof record.name === "string" &&
      typeof record.focus === "string" &&
      typeof record.path === "string" &&
      typeof record.headline === "string" &&
      typeof record.date === "string" &&
      typeof record.payload === "object" &&
      typeof record.result === "object"
    );
  });

export const defaultBirth = (() => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 26);
  date.setHours(8, 0, 0, 0);
  return date.toISOString().slice(0, 16);
})();

export const formatDate = (value: string) => {
  const date = new Date(value);
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${String(
    date.getHours()
  ).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

export const scoreFromText = (text: string, offset: number) => 58 + ((text.length * 9 + offset * 17) % 34);

export const buildRadarPoints = (values: number[]) => {
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

export const calcCompletion = (form: FormState) => {
  const fields: Array<[keyof FormState, number]> = [
    ["name", 12],
    ["birth", 12],
    ["birthPlace", 10],
    ["gender", 8],
    ["status", 8],
    ["certainty", 8],
    ["focus", 8],
    ["path", 8],
    ["wish", 26],
  ];
  const total = fields.reduce((sum, [, weight]) => sum + weight, 0);
  const score = fields.reduce((sum, [key, weight]) => {
    const value = form[key];
    if (!value) return sum;
    const lengthBonus = typeof value === "string" ? Math.min(1, value.trim().length / 8) : 1;
    return sum + weight * lengthBonus;
  }, 0);
  return Math.round((score / total) * 100);
};
