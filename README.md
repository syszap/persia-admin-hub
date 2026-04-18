# 🧾 Persia Admin Hub — Returned Cheques System

A production-grade financial monitoring system for managing **returned cheques (چک برگشتی)** with:

* SQL Server → PostgreSQL data replication
* Background sync (cron-based)
* Authentication (JWT)
* Advanced analytics (risk, alerts, grouping)
* Excel export
* Enterprise-ready architecture

---

# 🚀 Key Features

## 🧾 Core

* مشاهده چک‌های برگشتی
* فیلتر پیشرفته (مشتری، تاریخ، شماره چک)
* pagination سمت سرور
* نمایش وضعیت سررسید

## 📊 Advanced

* داشبورد خلاصه (summary)
* گروه‌بندی بر اساس مشتری
* امتیاز ریسک (Risk Level)
* Alert خودکار
* Export به Excel

## 🔐 Security

* سیستم لاگین (JWT)
* محافظت از تمام API ها
* عدم دسترسی مستقیم frontend به دیتابیس

---

# 🏗️ Architecture

```text
SQL Server (ERP / Source)
        ↓
Sync Service (Node + Cron)
        ↓
PostgreSQL (App Database)
        ↓
Express API (JWT Protected)
        ↓
React Frontend
```

---

# ⚙️ Requirements

* Node.js >= 18
* SQL Server (source)
* PostgreSQL (app database)
* npm

---

# 📦 Installation

## 1️⃣ Clone project

```bash
git clone https://github.com/syszap/persia-admin-hub.git
cd persia-admin-hub
```

---

## 2️⃣ Install dependencies

```bash
npm install
cd server
npm install
```

---

# 🧠 Environment Setup

Create:

```bash
cd server
cp .env.example .env
```

---

## ✏️ Configure `.env`

```env
# SQL Server (Source)
SQL_SERVER_CONN=DRIVER={ODBC Driver 18 for SQL Server};SERVER=YOUR_SERVER;DATABASE=Shima_sg3;UID=USER;PWD=PASSWORD;Encrypt=no;TrustServerCertificate=yes;

# PostgreSQL (App DB)
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=persia_admin
PG_USER=postgres
PG_PASSWORD=your_password

# Auth
JWT_SECRET=your_super_secret_key

# App
PORT=3001
FRONTEND_URL=http://localhost:5173
```

---

# 🚀 Run Project

## Terminal 1 — Backend

```bash
npm run dev:server
```

## Terminal 2 — Frontend

```bash
npm run dev
```

---

# 🌐 Access

* Frontend: http://localhost:5173
* API: http://localhost:3001/api

---

# 🔐 Default Login

After first run:

```text
username: admin
password: admin
```

⚠️ حتماً بعد از ورود تغییر بده

---

# 🔁 Sync System

## ⏱ Schedule

```cron
*/30 9-18 * * *
```

یعنی:

* هر 30 دقیقه
* بین 9 صبح تا 6 عصر

---

## 🔄 Flow

1. Query از SQL Server اجرا می‌شود
2. داده‌ها دریافت می‌شوند
3. در PostgreSQL با UPSERT ذخیره می‌شوند

---

## ⚠️ نکات مهم

* جلوگیری از اجرای همزمان (lock)
* log کامل (start / end / error)
* دیتابیس اصلی تحت فشار قرار نمی‌گیرد

---

# 🧠 Database Design

## PostgreSQL Tables

### returned_cheques

* mirror کامل دیتای SQL Server
* unique key:

```sql
(voucher_ref, followup_number)
```

---

### users

* authentication system
* password به صورت hash ذخیره می‌شود

---

# 🔌 API Endpoints

## 🔐 Auth

```http
POST /api/auth/login
```

---

## 📄 Cheques

```http
GET /api/returned-cheques
```

Params:

* page
* limit
* search
* fromDate
* toDate

---

## 📊 Summary

```http
GET /api/returned-cheques/summary
```

---

## 👥 By Customer

```http
GET /api/returned-cheques/by-customer
```

---

## 📥 Export

```http
GET /api/returned-cheques/export
```

---

# ⚡ Performance

* PostgreSQL برای read (سریع)
* SQL Server فقط برای sync
* cache داخلی (60s)
* pagination در سطح SQL

---

# 🛡️ Security

* JWT برای تمام API ها
* bcrypt برای رمز عبور
* env-based secrets
* عدم expose دیتابیس

---

# ⚠️ Important Notes

## ⏳ Data Delay

داده‌ها real-time نیستند:

👉 تا 30 دقیقه تاخیر ممکن است وجود داشته باشد

---

## 📉 SQL Server Load

* query فقط در sync اجرا می‌شود
* فشار مستقیم از UI حذف شده

---

# 📁 Project Structure

```text
.
├── src/                    # React frontend
├── server/
│   ├── routes/
│   ├── middleware/
│   ├── postgres.ts
│   ├── sync.ts
│   ├── cache.ts
│   └── index.ts
├── vite.config.ts
└── package.json
```

---

# 🧪 Development Tips

* اگر لاگین کار نکرد → JWT_SECRET رو چک کن
* اگر دیتا نیومد → sync لاگ‌ها رو ببین
* اگر کند شد → index در PostgreSQL اضافه کن

---

# 📈 Future Improvements

* Redis cache
* Incremental sync (CDC)
* n8n integration (alerts)
* SMS / WhatsApp notification
* AI risk analysis

---

# 🤝 Contributing

* UI را تغییر ندهید
* commit message واضح باشد
* PR قبل از merge بررسی شود

---

# 📄 License

Private / Internal Use

---

## 👨‍💻 Author

Milad Farahani
https://github.com/syszap
