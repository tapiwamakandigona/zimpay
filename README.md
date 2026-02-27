<div align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=200&section=header&text=ZimPay%20Banking&fontSize=50&animation=fadeIn&fontAlignY=38&desc=Modern%2C%20Real-Time%20Fintech%20App&descAlignY=51&descAlign=62" />
</div>

<h1 align="center">ZimPay - Real-Time Banking Platform</h1>

<div align="center">
  <p><strong>A sleek, modern banking simulation built with React, TypeScript, and Supabase. Features real-time money transfers, row-level security, and a beautiful glassmorphic UI.</strong></p>
  
  <p>
    <a href="https://tapiwamakandigona.github.io/zimpay/"><img src="https://img.shields.io/badge/Live_Demo-0A66C2?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Live Demo" /></a>
    <img src="https://img.shields.io/github/languages/top/tapiwamakandigona/zimpay?style=for-the-badge&color=blue" alt="Top Language" />
    <img src="https://img.shields.io/github/last-commit/tapiwamakandigona/zimpay?style=for-the-badge&color=green" alt="Last Commit" />
  </p>
</div>

---

## ⚡ Architecture Overview

ZimPay demonstrates how to build a highly interactive, secure FinTech application using modern web technologies. It leverages **Supabase** for backend-as-a-service, utilizing PostgreSQL's Row Level Security (RLS) to ensure that users can only ever access their own financial data.

## 💳 Core Features

| Feature | Implementation Details |
|---------|------------------------|
| **Real-Time Transfers** | Supabase real-time subscriptions instantly update balances |
| **Secure Auth** | Integrated email verification and JWT session management |
| **Row Level Security** | Database-enforced privacy (users cannot read others' balances) |
| **Glassmorphism UI** | Premium CSS styling with dynamic dark mode and fluid transitions |
| **Responsive Design** | Mobile-first dashboard layout optimized for all screen sizes |

---

## 🛠️ Technology Stack

```mermaid
graph TD;
    React[React Frontend] --> Supabase[Supabase Backend];
    Supabase --> Auth[GoTrue Auth];
    Supabase --> DB[(PostgreSQL UI)];
    Supabase --> Realtime[WebSocket Stream];
    React --> Vite[Vite Build System];
    Vite --> GhPages[GitHub Pages Deploy];
```

---

## 🚀 Quick Start

```bash
git clone https://github.com/tapiwamakandigona/zimpay.git
cd zimpay
npm install

# Setup your Supabase keys
cp .env.example .env.local

npm run dev
```

---

<div align="center">
  <b>Built by <a href="https://github.com/tapiwamakandigona">Tapiwa Makandigona</a></b>
  <br/>
  <i>⭐ Star this repo if you find the real-time Supabase architecture helpful!</i>
</div>
