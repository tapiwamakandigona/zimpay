# 💳 ZimPay - Modern Banking App

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
| **React 18** | UI Components & State |
| **TypeScript** | Type-safe development |
| **Supabase** | Backend (Auth, Database, Realtime) |
| **React Router v6** | Client-side routing |
| **Vite** | Build tool & dev server |
| **CSS3** | Styling with CSS Variables |

---

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/tapiwamakandigona/zimpay.git
cd zimpay

# Install dependencies
npm install

# Set up Supabase
# 1. Create a project at supabase.com
# 2. Update src/lib/supabase.ts with your credentials

# Start development server
npm run dev

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

---

## 📁 Project Structure

```
src/
├── components/        # Reusable UI components
│   └── SendMoney.tsx  # Money transfer flow
├── context/           # React Context providers
│   ├── AuthContext    # Authentication state
│   └── ThemeContext   # Theme management
├── lib/               # Utilities & config
│   └── supabase.ts    # Supabase client
├── pages/             # Page components
│   ├── Landing.tsx    # Welcome page
│   ├── Login.tsx      # Authentication
│   ├── SignUp.tsx     # Registration
│   └── Dashboard.tsx  # Main app interface
├── App.tsx            # Root component
└── main.tsx           # Entry point
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
