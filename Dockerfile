# === 階段一：編譯前端 React ===
FROM node:20-slim AS client-builder
WORKDIR /app/client
# 先複製 package.json 以利用 Docker 快取
COPY client/package*.json ./
RUN npm install
# 複製原始碼並編譯
COPY client/ ./
RUN npm run build

# === 階段二：編譯後端 TypeScript ===
FROM node:20-slim AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
# 執行 tsc 編譯，假設輸出目錄為 dist
RUN npm run build

# === 階段三：最終執行環境 (生產環境) ===
FROM node:20-slim
WORKDIR /app

# 只安裝後端生產環境需要的套件 (排除 devDependencies)
COPY server/package*.json ./
RUN npm install --production

# 從前兩個階段複製編譯好的結果
# 1. 複製後端編譯後的 JS 檔案 (從 server-builder 的 dist 到目前的根目錄)
COPY --from=server-builder /app/server/dist ./dist
# 2. 複製前端編譯後的靜態檔 (到後端指定的靜態資料夾，例如 public)
COPY --from=client-builder /app/client/dist ./public

# 設定環境變數
ENV NODE_ENV=production
# Cloud Run 必備：監聽 8080 埠
ENV PORT=8080
EXPOSE 8080

# 驗證檔案是否正確複製 (可選)
RUN ls -R /app/dist 

# 啟動命令 (路徑需對應您的進入點，例如 dist/index.js)
CMD ["node", "dist/index.js"]