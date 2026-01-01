# 階段一：編譯前端 React
FROM node:20 AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# 階段二：編譯後端 TypeScript
FROM node:20 AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/ ./
RUN npm run build 
# 註：這會產生 dist 資料夾，內含編譯後的 JS

# 階段三：最終執行環境
FROM node:20-slim
WORKDIR /app
COPY server/package*.json ./
RUN npm install --production
# 複製後端編譯好的檔案
COPY --from=server-builder /app/server/dist ./
# 複製前端編譯好的檔案到後端指定的 public 目錄
COPY --from=client-builder /app/client/dist ./public

ENV NODE_ENV=production
# 這裡不需要 EXPOSE 5100，Cloud Run 會接管
CMD ["node", "index.js"]