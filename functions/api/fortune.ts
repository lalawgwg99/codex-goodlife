import OpenAI from "openai";

type Payload = {
  name: string;
  birth: string;
  focus: string;
  path: string;
  wish: string;
  lang: "zh-TW" | "zh-CN";
};

type Env = {
  OPENROUTER_API_KEY: string;
  OPENROUTER_BASE_URL?: string;
  OPENROUTER_MODEL?: string;
  OPENROUTER_REFERER?: string;
  OPENROUTER_TITLE?: string;
};

const buildPrompt = (payload: Payload) => {
  const language = payload.lang === "zh-CN" ? "简体中文" : "繁體中文";
  return `請以${language}輸出，風格簡潔、溫和、專業，不要長篇大道理。\n\n使用者資訊：\n- 稱呼：${payload.name}\n- 出生時間：${payload.birth}\n- 主題：${payload.focus}\n- 流派：${payload.path}\n- 心願：${payload.wish}\n\n請輸出 JSON，格式如下：\n{\n  "headline": "短句標題",\n  "summary": "3-4 句摘要",\n  "highlights": ["重點1", "重點2", "重點3"],\n  "lucky": {"color":"色彩","number":1,"day":"週X","mantra":"短句"},\n  "roadmap": {"today":"...","week":"...","month":"...","season":"..."}\n}\n只輸出 JSON，不要加任何多餘文字。`;
};

export const onRequest: PagesFunction<Env> = async (context) => {
  if (context.request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = context.env;
  if (!env.OPENROUTER_API_KEY) {
    return new Response(JSON.stringify({ ok: false, error: "Missing OPENROUTER_API_KEY" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let payload: Payload | null = null;
  try {
    payload = await context.request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const client = new OpenAI({
    apiKey: env.OPENROUTER_API_KEY,
    baseURL: env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1",
    defaultHeaders: {
      ...(env.OPENROUTER_REFERER ? { "HTTP-Referer": env.OPENROUTER_REFERER } : {}),
      ...(env.OPENROUTER_TITLE ? { "X-Title": env.OPENROUTER_TITLE } : {}),
    },
  });

  try {
    const apiResponse = await client.chat.completions.create({
      model: env.OPENROUTER_MODEL ?? "qwen/qwen3.6-plus:free",
      messages: [
        { role: "system", content: "你是專業命理顧問，但內容僅供娛樂用途。" },
        { role: "user", content: buildPrompt(payload) },
      ],
      temperature: 0.8,
    });

    const content = apiResponse.choices[0]?.message?.content ?? "";
    const jsonStart = content.indexOf("{");
    const jsonEnd = content.lastIndexOf("}");
    const jsonText = jsonStart >= 0 && jsonEnd > jsonStart ? content.slice(jsonStart, jsonEnd + 1) : "";

    if (!jsonText) {
      return new Response(JSON.stringify({ ok: true, data: { raw: content } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(jsonText);
    return new Response(JSON.stringify({ ok: true, data: parsed }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
