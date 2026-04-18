# 🧾 Persia Admin Hub — Returned Cheques Module

A production-ready financial monitoring module for managing **returned cheques (چک برگشتی)** with:

* Real-time SQL Server integration
* Advanced filtering & analytics
* Risk scoring & alerts
* Excel export
* Enterprise dashboard

---

# 🚀 Features

## ✅ Core

* مشاهده لیست چک‌های برگشتی
* فیلتر بر اساس مشتری، تاریخ، شماره چک
* pagination سمت سرور (performance بالا)
* نمایش وضعیت سررسید (overdue)

## 📊 Advanced (Enterprise)

* داشبورد خلاصه (مبلغ کل، overdue و ...)
* گروه‌بندی بر اساس مشتری
* سیستم امتیاز ریسک (Risk Level)
* Alert هوشمند
* Export به Excel

---

# 🏗️ Architecture

```
Frontend (React + Vite)
        ↓
API Layer (Express - BFF)
        ↓
SQL Server
```

* Frontend هیچ دسترسی مستقیم به دیتابیس ندارد
* Backend نقش واسط امن (BFF) را دارد

---

# ⚙️ Requirements

* Node.js >= 18
* SQL Server
* npm یا yarn

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
```

---

## 3️⃣ Setup Backend (IMPORTANT)

```bash
cd server
cp .env.example .env
```

### ✏️ Edit `.env`

```env
SQL_SERVER_CONN=DRIVER={ODBC Driver 18 for SQL Server};SERVER=172.16.10.9,1433;DATABASE=Shima_sg3;UID=YOUR_USER;PWD=YOUR_PASSWORD;Encrypt=no;TrustServerCertificate=yes;
FRONTEND_URL=http://localhost:5173
PORT=3001
```

---

## 4️⃣ Run project

### Terminal 1 — Backend

```bash
npm run dev:server
```

### Terminal 2 — Frontend

```bash
npm run dev
```

---

## 🌐 Access

```
Frontend: http://localhost:5173
Backend API: http://localhost:3001/api
```

---

# 🔌 API Endpoints

## 📄 Get Cheques

```
GET /api/returned-cheques
```

### Query Params:

| Param    | Description           |
| -------- | --------------------- |
| page     | شماره صفحه            |
| limit    | تعداد رکورد           |
| search   | نام مشتری یا شماره چک |
| fromDate | تاریخ شروع            |
| toDate   | تاریخ پایان           |

---

## 📊 Summary

```
GET /api/returned-cheques/summary
```

---

## 👥 Group by Customer

```
GET /api/returned-cheques/by-customer
```

---

## 📥 Export Excel

```
GET /api/returned-cheques/export
```

* محدود به 5000 رکورد
* خروجی `.xlsx`

---

# ⚡ Performance Notes

* Pagination در SQL انجام می‌شود (NOT in-memory)
* Cache داخلی (TTL = 60s)
* Connection Pool برای SQL Server
* Query بهینه‌شده برای دیتای حجیم

---

# 🛡️ Security

* اطلاعات دیتابیس فقط در backend
* استفاده از `.env` (never commit)
* validate ورودی‌ها در API
* محدودیت export

---

# 🧠 Risk System

| Level     | Condition                                |
| --------- | ---------------------------------------- |
| 🔴 High   | overdueAmount > 500M OR overdueCount > 5 |
| 🟡 Medium | overdueAmount > 50M OR overdueCount > 2  |
| 🟢 Low    | سایر موارد                               |

---

# ⚠️ Alerts

سیستم به صورت خودکار alert تولید می‌کند اگر:

* overdueAmount > 2B
* overdueCount > 20

---

# 📁 Project Structure

```
.
├── src/                  # Frontend (React)
├── server/               # Backend (Express)
│   ├── routes/
│   ├── db.ts
│   ├── cache.ts
│   └── index.ts
├── vite.config.ts
└── package.json
```

---

# 🧪 Development Tips

* اگر API کار نکرد → اول backend رو چک کن
* اگر CORS خطا داد → FRONTEND_URL رو بررسی کن
* اگر query کند شد → index در SQL اضافه کن

---

# 📈 Future Improvements

* Redis caching
* Notification (SMS / WhatsApp)
* n8n automation integration
* AI risk analysis

---

# 🤝 Contributing

PR ها خوش‌آمدند 🚀
قبل از ارسال:

* کد تست شده باشد
* UI تغییر داده نشود (مهم)
* commit message واضح باشد

---

# 📄 License

Private / Internal Use

---

## 👨‍💻 Author

Milad Farahani
GitHub: https://github.com/syszap
