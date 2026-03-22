# 🚀 Synchro
**Zero-Hallucination Fullstack Stack · 零幻覺全端架構**
這是一個極致追求型別安全 (Type Safety) 的 Web 架構，專為 Cursor / Claude / Copilot 等 AI 工具設計。透過單一真相來源 (Single Source of Truth)，確保 AI 在生成前端代碼時，絕對無法脫離後端定義的規範，從根本杜絕 AI 代碼幻覺與前後端不一致。

### 核心哲學 Core Principles
- **Single Source of Truth**：Schema 與 API 型別全域共享，無同步成本
- **100% Type Safety**：API 路徑、請求參數、返回結構全程型別約束
- **AI-First by Design**：架構本身強制 AI 遵守規範，杜絕幻覺與隨機生成
- **Zero Boilerplate**：Hono RPC + TanStack Query 一氣呵成，少寫 50% 膠水碼

## 🛠 Tech Stack
* **Runtime:** Bun (極速、內建套件管理)
* **Frontend:** React Router v7 (Remix 模式) + TanStack Query
* **Backend:** Hono (輕量、支援 RPC 模式)
* **Database:** PostgreSQL + Prisma ORM
* **Validation:** Zod (共享驗證邏輯)
* **Infrastructure:** Docker (Single Container Monolith)

## 📂 Project Structure
```text
.
├── docker/
│   ├── docker-compose.yml  # 包含 Postgres
│   ├── Dockerfile          # 單一 Container 部署 Bun 應用
|   ├── .env.uat
|   └── .env.prod
├── apps/
│   ├── frontend/           # React Router v7 (SPA/SSR)
│   └── backend/            # Hono API Server (導出 AppType)
├── packages/
│   └── shared/             # 存放 Zod Schemas (唯一真相來源)
└── README.md
```

## 🤖 Why this is AI-Friendly?
* **Hono RPC:**

  後端路由直接導出 AppType。AI 在前端使用 hc<AppType> 時，會獲得 100% 的代碼補全，路徑、Method、Payload 欄位只要寫錯，編譯直接報錯。

* **Shared Zod Schemas:**

  AI 修改 packages/shared 中的 Schema 後，前後端驗證會同步更新。AI 寫前端 Form 時必須符合後端資料結構。
  
* **Single Language:**

  全環境 TypeScript，AI 不需要切換 Java/PHP/JS 邏輯，減少上下文斷層。

## 🚀 Getting Started
1. 安裝與啟動 (Development)
   ```bash
   # 安裝所有依賴
   bun install

   # 啟動資料庫
   docker-compose up -d

   # 執行資料庫遷移
   bun run db:generate
   bun run db:push

   # 同時啟動前後端 (使用 Bun 併行執行)
   bun run dev
   ```

2. 生產環境部署 (Docker)
   ```bash
   # 構建單一映像檔
   docker build -t my-app .

   # 執行
   docker run -p 3000:3000 my-app
   ```

## 🛠 AI Prompt Tips (給 Cursor 的指令)
當你需要新增功能時，請告訴 AI：
```
「請先在 packages/shared 定義資料 Schema，然後在 backend 建立 Hono 路由並匯出型別，最後在 frontend 使用 hc 客戶端配合 useQuery 呼叫該介面。」
```
