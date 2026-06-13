# 💳 ZimPay - Modern Banking App

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](https://tapiwamakandigona.github.io/zimpay/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)


A sleek, modern banking simulation app built with React, TypeScript & Supabase. Experience real-time money transfers, beautiful UI themes, and secure authentication.

[![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-Try_It_Now-brightgreen?style=for-the-badge)](https://tapiwamakandigona.github.io/zimpay/)
[![GitHub](https://img.shields.io/badge/GitHub-Source_Code-black?style=for-the-badge&logo=github)](https://github.com/tapiwamakandigona/zimpay)

![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)

---

## ✨ Features

### 💸 Banking Features
- **Real-time Transactions** - Send money to other users instantly
- **Balance Management** - Track your account balance in real-time
- **Transaction History** - View all sent and received transactions
- **User Search** - Find recipients by username or phone number

### 🔐 Security & Authentication
- **Email Verification** - Secure account creation with email confirmation
- **Password Reset** - Forgot password? Reset via email link
- **Secure Sessions** - "Keep me signed in" option for convenience
- **Row Level Security** - Database-level protection for all data

### 🎨 Design & UX
- **Glassmorphism UI** - Modern, premium design aesthetic
- **Dark/Light Themes** - Beautiful color schemes for any preference
- **Mobile Responsive** - Seamless experience on all devices
- **Smooth Animations** - Delightful micro-interactions throughout

### 👤 Profile Management
- **Edit Profile** - Update your name and phone number
- **View Balance** - Always know your current balance
- **Account Info** - See all your account details at a glance

---

## 🚀 Live Demo

**[Try ZimPay Now →](https://tapiwamakandigona.github.io/zimpay/)**

Create an account and explore all the features! Test sending money between accounts.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Components & State |
| **TypeScript 5** | Type-safe development |
| **Supabase** | Backend (Auth, Database, Realtime) |
| **React Router v7** | Client-side routing |
| **Vite 7** | Build tool & dev server |
| **CSS3** | Styling with CSS Variables |

---

## 📦 Installation

### Prerequisites
- Node.js 20+ and npm (see `.nvmrc`)
- A Supabase account ([supabase.com](https://supabase.com))

### Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/tapiwamakandigona/zimpay.git
cd zimpay

# 2. Install dependencies
npm install

# 3. Set up environment variables
# Copy the example environment file
cp .env.example .env.local

# 4. Configure Supabase
# Option A: Use the demo credentials (already in .env.example)
# Option B: Create your own Supabase project:
#   - Go to supabase.com and create a new project
#   - Copy your project URL and anon key
#   - Update .env.local with your credentials

# 5. Start development server
npm run dev

# 6. Build for production
npm run build

# 7. Deploy to GitHub Pages
npm run deploy
```

### 🔐 Security Requirements

> **IMPORTANT**: This project uses environment variables for sensitive credentials.

- **Never commit `.env.local`** to version control (already in `.gitignore`)
- **Database access requires authentication** - Row Level Security (RLS) is enabled
- **Users can only access their own data** - profiles and transactions
- See [`SECURITY_HOTFIX_INSTRUCTIONS.md`](SECURITY_HOTFIX_INSTRUCTIONS.md) for RLS policy details

### Environment Variables

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Note**: The `VITE_` prefix is required for Vite to expose these variables to your app.

---

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   └── SendMoney.tsx     # Money transfer flow with user search
├── context/              # React Context providers
│   ├── AuthContext.tsx   # Authentication state & session management
│   └── ThemeContext.tsx  # Dark/light theme toggle
├── lib/                  # Utilities & config
│   ├── supabase.ts       # Supabase client singleton & DB types
│   ├── phoneUtils.ts     # Phone number parsing & normalization
│   ├── countries.ts      # Country codes & flag helpers
│   └── utils.ts          # Shared hooks (useDebounce) & formatters
├── pages/                # Page components
│   ├── Landing.tsx       # Marketing / welcome page
│   ├── Login.tsx         # Email + password authentication
│   ├── SignUp.tsx        # Registration with real-time validation
│   ├── SignUpSuccess.tsx # Post-signup email verification prompt
│   ├── EmailVerified.tsx # Email confirmed success page
│   ├── UpdatePassword.tsx# Password reset form
│   └── Dashboard.tsx     # Main app (balance, history, profile, send)
├── App.tsx               # Root component with routing & auth callback
└── main.tsx              # Entry point
```

---

## 🔐 Database Schema

### Profiles Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | User ID (from auth) |
| email | text | User's email |
| full_name | text | Display name |
| username | text | Unique username |
| phone_number | text | Phone number |
| balance | numeric | Account balance |

### Transactions Table
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Transaction ID |
| sender_id | uuid | Sender's user ID |
| receiver_id | uuid | Recipient's user ID |
| amount | numeric | Transfer amount |
| description | text | Transaction note |
| created_at | timestamp | When it occurred |

---

## 👨‍💻 Author

**Tapiwa Makandigona**

- 🌐 Portfolio: [tapiwamakandigona.github.io/portfolio](https://tapiwamakandigona.github.io/portfolio)
- 💻 GitHub: [@tapiwamakandigona](https://github.com/tapiwamakandigona)
- 📧 Email: silentics.org@gmail.com

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">

**[🚀 Try Demo](https://tapiwamakandigona.github.io/zimpay/) • [⭐ Star on GitHub](https://github.com/tapiwamakandigona/zimpay)**

*Designed & Built with ❤️ by Tapiwa Makandigona*

</div>
