
Hệ thống hỗ trợ học tập dựa trên AI, cho phép tạo lộ trình học cá nhân hoá, soạn thảo bài học từ tài liệu khoa học, và chia sẻ khoá học trên marketplace cộng đồng.

---

## 📁 Cấu trúc dự án

```
DATN_DATN/
├── DATN----Backend-main/   # Node.js + Express + MongoDB (API Server)
└── DATN----Fontend/        # React + Vite + TypeScript (Client)
```

---

## ⚙️ Yêu cầu hệ thống

| Công cụ | Phiên bản khuyến nghị |
|---|---|
| Node.js | >= 18.x |
| npm | >= 9.x |
| MongoDB Atlas | Tài khoản cloud (hoặc MongoDB local) |

---

## 🔑 Biến môi trường cần thiết

### Backend — `DATN----Backend-main/.env`

Tạo file `.env` từ file mẫu `.env.example`:

```bash
cp .env.example .env
```

| Biến | Mô tả | Lấy ở đâu |
|---|---|---|
| `PORT` | Cổng chạy server (mặc định: `5000`) | Tự đặt |
| `MONGODB_URI` | URI kết nối MongoDB Atlas | [mongodb.com/atlas](https://www.mongodb.com/cloud/atlas) → tạo Cluster → Connect |
| `ACCESS_TOKEN_SECRET` | Chuỗi bí mật ký JWT access token | Tự tạo chuỗi ngẫu nhiên dài (VD: `openssl rand -hex 64`) |
| `REFRESH_TOKEN_SECRET` | Chuỗi bí mật ký JWT refresh token | Tự tạo chuỗi ngẫu nhiên dài |
| `ACCESS_TOKEN_EXPIRY` | Thời hạn access token (VD: `15m`) | Tự đặt |
| `REFRESH_TOKEN_EXPIRY` | Thời hạn refresh token (VD: `7d`) | Tự đặt |
| `CORS_ORIGIN` | URL frontend được phép truy cập API | `http://localhost:3000` (dev) |
| `GEMINI_API_KEY` | Google Gemini AI API Key | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| `GROQ_API_KEY` | Groq LLM API Key (chính) | [console.groq.com](https://console.groq.com/keys) |
| `GROQ_API_KEY_2` đến `_5` | Groq API Key dự phòng (load balancing) | Tạo thêm key tại Groq Console |
| `HF_TOKEN` | Hugging Face Access Token (embedding) | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) |
| `CLOUDINARY_CLOUD_NAME` | Tên cloud Cloudinary | [cloudinary.com](https://cloudinary.com) → Dashboard |
| `CLOUDINARY_API_KEY` | API Key Cloudinary | Cloudinary → Settings → API Keys |
| `CLOUDINARY_API_SECRET` | API Secret Cloudinary | Cloudinary → Settings → API Keys |
| `EMBEDDING_CONCURRENCY` | Số luồng embedding đồng thời (VD: `2`) | Tự đặt, khuyến nghị `1`–`3` |
| `R2_ACCOUNT_ID` | Cloudflare R2 Account ID *(tuỳ chọn)* | [dash.cloudflare.com](https://dash.cloudflare.com) → R2 |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 Access Key *(tuỳ chọn)* | Cloudflare R2 → Manage API tokens |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 Secret Key *(tuỳ chọn)* | Cloudflare R2 → Manage API tokens |
| `R2_BUCKET_NAME` | Tên bucket Cloudflare R2 *(tuỳ chọn)* | Tự đặt |

> **Lưu ý:** Biến R2 chỉ cần thiết nếu dùng Cloudflare R2 để lưu file. Nếu chỉ dùng Cloudinary thì bỏ qua.

---

### Frontend — `DATN----Fontend/.env`

Tạo file `.env` từ file mẫu `.env.example`:

```bash
cp .env.example .env
```

| Biến | Mô tả | Lấy ở đâu |
|---|---|---|
| `VITE_API_BASE_URL` | URL gốc của Backend API | Mặc định: `http://localhost:5000/api` |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth 2.0 Client ID | [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials |

---

## 🚀 Hướng dẫn cài đặt & chạy

### 1. Clone repository

```bash
git clone <repo-url>
cd DATN_DATN
```

### 2. Cài đặt & chạy Backend

```bash
cd DATN----Backend-main

# Cài dependencies
npm install

# Tạo file .env từ mẫu và điền các giá trị
cp .env.example .env
# (Mở .env và điền đầy đủ thông tin)

# Chạy ở chế độ development
npm run dev
```

> Server sẽ chạy tại: `http://localhost:5000`

### 3. Cài đặt & chạy Frontend

```bash
cd DATN----Fontend

# Cài dependencies
npm install

# Tạo file .env từ mẫu và điền các giá trị
cp .env.example .env
# (Mở .env và điền đầy đủ thông tin)

# Chạy ở chế độ development
npm run dev
```

> Ứng dụng sẽ chạy tại: `http://localhost:3000` (hoặc cổng Vite tự chọn)

---

## 🗄️ Khởi tạo dữ liệu (tuỳ chọn)

Nếu cần seed dữ liệu ban đầu vào MongoDB:

```bash
cd DATN----Backend-main

# Seed embedding cho các bài học
npm run seed:embeddings

# Seed quiz pools
npm run seed:quizpools
```

---

## 🏗️ Tech Stack

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB + Mongoose
- **AI:** Google Gemini API, Groq LLM API
- **Embedding:** Hugging Face Transformers (`@xenova/transformers`)
- **File Storage:** Cloudinary (ảnh/tài liệu), Multer (upload)
- **OCR:** Tesseract.js (đọc PDF/ảnh)
- **Auth:** JWT (jsonwebtoken), bcryptjs

### Frontend
- **Framework:** React 19 + Vite + TypeScript
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Markdown:** react-markdown, EasyMDE
- **Icons:** Lucide React

---

## 🔐 Lưu ý bảo mật

> ⚠️ **KHÔNG** commit file `.env` lên Git. File này đã được thêm vào `.gitignore`.
>
> Chỉ commit file `.env.example` với các giá trị trống làm mẫu.

---

## 📞 Liên hệ

Nếu gặp vấn đề khi cài đặt, vui lòng liên hệ tác giả để được hỗ trợ.
