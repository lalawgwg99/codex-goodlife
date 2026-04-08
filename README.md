# codex-goodlife · GoodLife 命理工作室

這是一個部署到 Cloudflare Pages 的 AI 命理網站。

它支援：
- 繁體 / 簡體切換
- 使用者輸入更完整的命理資料
- 前端呼叫 `/api/fortune`
- Cloudflare Pages Functions 代理 OpenRouter
- 分享卡下載與本地保存紀錄

## 本地開發

```bash
npm install
npm run dev
```

本地開發網址通常是：

```bash
http://localhost:5173
```

注意：
- 本地 `vite dev` 只會跑前端
- `/api/fortune` 是 Cloudflare Pages Functions
- 如果你要在本地連同 Functions 一起測，建議之後用 `wrangler pages dev`

## Cloudflare 部署教學

下面這份是可以直接照做的版本。

### 1. 把程式碼推到 GitHub

確認你的專案已經在 GitHub 上，像目前這個 repo：

```bash
lalawgwg99/codex-goodlife
```

### 2. 到 Cloudflare Pages 建立專案

在 Cloudflare Dashboard：

1. 進入 `Workers & Pages`
2. 點 `Create application`
3. 選 `Pages`
4. 選 `Connect to Git`
5. 授權 GitHub
6. 選你的 repo：`codex-goodlife`

### 3. Build 設定怎麼填

如果 Cloudflare 要你填建置資訊，請填：

- Framework preset: `Vite`
- Build command: `npm run build`
- Build output directory: `dist`
- Root directory: 留空

如果它自動帶入 Vite 設定，確認跟上面一致即可。

### 4. 環境變數怎麼設

在 Pages 專案裡：

1. 打開你的 Pages 專案
2. 進入 `Settings`
3. 點 `Environment variables`
4. 新增以下變數

必填：

- `OPENROUTER_API_KEY`

可選：

- `OPENROUTER_MODEL`
- `OPENROUTER_BASE_URL`
- `OPENROUTER_REFERER`
- `OPENROUTER_TITLE`

推薦值：

```bash
OPENROUTER_MODEL=qwen/qwen3.6-plus:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

如果你沒有特別需求：
- `OPENROUTER_REFERER` 可以先不填
- `OPENROUTER_TITLE` 可以填 `GoodLife`

### 5. 為什麼 API Key 不能放前端

這個專案不是在前端直接打 OpenRouter。

流程是：

1. 前端送資料到 `/api/fortune`
2. Cloudflare Pages Functions 收到請求
3. Functions 用環境變數裡的 `OPENROUTER_API_KEY` 呼叫 OpenRouter
4. 再把 JSON 結果回傳給前端

所以：
- 金鑰不會出現在瀏覽器原始碼裡
- 也不會直接暴露在前端請求中

### 6. 第一次部署後怎麼驗證

部署完成後請這樣測：

1. 打開網站首頁
2. 輸入稱呼、出生時間、出生地、性別、目前狀態
3. 選主題與流派
4. 點 `生成 AI 命盤`

正常情況下你會看到：
- 標題
- 總覽判讀
- 三個關鍵提醒
- 感情 / 事業 / 財運分區
- 開運提示
- 時間節奏

### 7. 如果按了沒反應，要檢查什麼

先檢查這幾項：

1. Cloudflare Pages 的環境變數有沒有真的存好
2. `OPENROUTER_API_KEY` 有沒有填錯
3. `OPENROUTER_MODEL` 是否存在
4. 有沒有重新部署

很重要：
- 改完環境變數後，通常要重新部署一次

### 8. 如果頁面正常，但 AI 報錯

先看網站上的錯誤訊息。

常見原因：
- API key 無效
- 模型名稱錯誤
- OpenRouter 額度或限制問題
- OpenRouter 需要 referer，但你沒填

如果遇到這種情況，優先測：

```bash
OPENROUTER_MODEL=qwen/qwen3.6-plus:free
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

### 9. 這個專案目前的 API 位置

前端呼叫：

```bash
POST /api/fortune
```

Cloudflare Pages Functions 檔案在：

- [fortune.ts](/Users/jazzxx/Desktop/命理測算/codex-goodlife/functions/api/fortune.ts)

前端主畫面在：

- [App.tsx](/Users/jazzxx/Desktop/命理測算/codex-goodlife/src/App.tsx)

樣式在：

- [index.css](/Users/jazzxx/Desktop/命理測算/codex-goodlife/src/index.css)

## 目前 AI 會吃哪些資料

前端會送這些欄位給 AI：

- 稱呼
- 出生日期與時間
- 出生地
- 性別
- 目前狀態
- 時辰可信度
- 主題焦點
- 流派
- 目前最想問的事
- 語言

## 下一步建議

如果你要再往上做，我最推薦這三個方向：

1. 加入 `wrangler.toml`，把本地聯調也補齊
2. 讓分享卡有專門版型，不只是截圖
3. 把 AI 結果擴成更完整的「感情 / 事業 / 財運 / 健康」四區報告
