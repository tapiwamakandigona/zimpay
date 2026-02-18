# Architecture

## Overview

ZimPay follows a standard React SPA architecture with Supabase as the backend.

## Stack

```
React 18 (UI) -> React Router v6 (routing) -> Supabase (auth + DB + realtime)
```

## Structure

```
src/
├── components/     # Reusable UI components
│   └── SendMoney.tsx    # Transfer form with user search
├── context/
│   ├── AuthContext.tsx   # Auth state, session management
│   └── ThemeContext.tsx  # Dark/light theme toggle
├── pages/
│   ├── Dashboard.tsx    # Main app (balance, history, send)
│   ├── Landing.tsx      # Marketing page
│   ├── Login.tsx        # Email + password auth
│   ├── SignUp.tsx       # Registration with validation
│   └── EmailVerified.tsx
├── lib/
│   └── supabase.ts      # Supabase client singleton
└── main.tsx
```

## Auth Flow

1. User signs up with email/password
2. Supabase sends verification email
3. User verifies -> redirected to dashboard
4. Session persisted in localStorage
5. Auth context provides user state globally

## Database

- **profiles** - User info (name, phone, balance)
- **transactions** - Transfer history (sender, receiver, amount, timestamp)
- Row Level Security (RLS) ensures users only access their own data

## Security

- Supabase RLS policies
- Client-side validation + server-side constraints
- Secure session management
- No sensitive data in client code
