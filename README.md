# SustainChain MVP｜供應鏈永續管理平台

這是一個 React + Vite + Tailwind CSS 的前端靜態網站專案。資料會存在使用者瀏覽器的 LocalStorage，不需要後端或資料庫。

## 本機預覽

```bash
npm install
npm run dev
```

打開終端機顯示的網址，例如：

```text
http://localhost:5173
```

## 建置

```bash
npm run build
```

建置完成後會產生 `dist` 資料夾。

## Cloudflare Pages 部署設定

1. 將整個專案上傳到 GitHub。
2. 到 Cloudflare Dashboard → Workers & Pages → Create application → Pages → Connect to Git。
3. 選擇這個 GitHub repository。
4. Build settings 請填：
   - Framework preset：Vite
   - Build command：`npm run build`
   - Build output directory：`dist`
5. 按 Deploy。
6. 部署完成後，Cloudflare 會給一個 `https://xxxx.pages.dev` 連結，分享該連結即可。

## Vercel 部署設定

1. 將整個專案上傳到 GitHub。
2. 到 Vercel → Add New Project → Import Git Repository。
3. Framework 選 Vite。
4. Build command：`npm run build`
5. Output directory：`dist`
6. Deploy 後即可取得分享連結。
