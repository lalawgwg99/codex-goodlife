# codex-goodlife · GoodLife 算命工作室

輕量級算命體驗站：輸入稱呼、生辰、心願，選擇靈感流派，即刻生成可分享的運勢卡片。純前端、零後端依賴，直接部署 Cloudflare Pages/Workers。

## 特色
- 多流派靈感：內建賽博八字、月老姻緣、奇門紫微、大師兜底、X 導師、輕量 waza 等選項。
- 即時生成：前端純函式生成指數、運勢摘要、幸運信號、雷達與行動路徑。
- 分享與保存：一鍵生成圖卡、保存運勢紀錄（localStorage）。
- Cloudflare Ready：Vite + React + Tailwind；預設 build 指令 `npm run build`，發布目錄 `dist`。
 - AI 解讀：透過 Cloudflare Pages Functions 呼叫 OpenRouter（OpenAI SDK）。

## 快速開始
```bash
npm install
npm run dev   # http://localhost:5173
```

## 建置
```bash
npm run build
# 輸出在 dist/
```

## 部署到 Cloudflare Pages
1) 新建站點，選擇「框架預設：Vite」。  
2) Build command：`npm run build`  
3) Build output directory：`dist`  
4) 保存並部署；本專案已內建 Pages Functions。  

### OpenRouter 環境變數
在 Cloudflare Pages 的環境變數設定：
- `OPENROUTER_API_KEY`（必填）
- `OPENROUTER_MODEL`（可選，預設 `qwen/qwen3.6-plus:free`）
- `OPENROUTER_BASE_URL`（可選，預設 `https://openrouter.ai/api/v1`）
- `OPENROUTER_REFERER`（可選，若 OpenRouter 需要）
- `OPENROUTER_TITLE`（可選，若 OpenRouter 需要）

前端會呼叫 `POST /api/fortune` 取得 AI 解讀內容。

## 自訂
- 調整流派來源：修改 `src/App.tsx` 的 `flows` 陣列。
- 文案/配色：`src/App.tsx` + `src/index.css`。
- 若接入真實算命 API：在 `src` 增加 API 模組，於 Cloudflare Pages Functions/Workers 以 Edge fetch 代理。
