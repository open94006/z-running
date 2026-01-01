import express from 'express';
import cors from 'cors';
import path from 'path'; // 1. 引入 path
import productRoute from './routes/product.route';

const app = express();

// 2. 重要：優先讀取環境變數 PORT，Cloud Run 預設會給 8080
const PORT = process.env.PORT || 8080;

const allowedOrigins = new Set(['http://localhost:5173', 'http://z-running.com', 'https://z-running.com', process.env.CORS_ORIGIN].filter(Boolean));

const corsOptions: cors.CorsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.has(origin)) return callback(null, true);
        // 注意：部署後前後端同網域，origin 會是 undefined 或同網域，通常不會被 CORS 擋掉
        return callback(null, true);
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// --- API 路由 ---
app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express + TS backend!' });
});
app.use('/api/product', productRoute);

// --- 3. 整合前端靜態檔案 (部署環境專用) ---
// 假設您在 Dockerfile 中把 React 編譯後的檔案放在 'public' 資料夾
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// 處理 React Router SPA 問題：所有非 API 請求都導向 index.html
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// 4. 監聽時建議綁定 0.0.0.0
app.listen(PORT, () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
});
