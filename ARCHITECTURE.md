# Architecture

## Overview

ZimPay follows a standard React SPA architecture with Supabase as the backend. It uses a `HashRouter` for compatibility with static hosting (GitHub Pages).

## Stack

```
React 19 (UI) → React Router v7 (hash routing) → Supabase (auth + DB + realtime)
TypeScript 5 • Vite 7 (build) • CSS Variables (theming)
```

## Structure

```
src/
├── components/           # Reusable UI components
│   └── SendMoney.tsx     # Transfer modal with debounced user search
├── context/
│   ├── AuthContext.tsx   # Auth state, session, profile CRUD, retry logic
│   └── ThemeContext.tsx  # Dark/light theme persisted to localStorage
├── pages/
│   ├── Dashboard.tsx     # Main app (balance card, history, profile edit)
│   ├── Landing.tsx       # Marketing / hero page
│   ├── Login.tsx         # Email + password auth with forgot-password
│   ├── SignUp.tsx        # Registration with live field validation
│   ├── SignUpSuccess.tsx # Post-signup verification prompt
│   ├── EmailVerified.tsx # Confirmation landing page
│   └── UpdatePassword.tsx# Password reset form
├── lib/
│   ├── supabase.ts       # Supabase client singleton & DB types
│   ├── phoneUtils.ts     # Phone normalisation (libphonenumber-js, ZW focus)
│   ├── countries.ts      # Country dial codes & flag URLs
│   └── utils.ts          # Shared hooks (useDebounce) & formatters
├── App.tsx               # Root: auth callback handler, routing, lazy loading
└── main.tsx              # Entry point
```

## Auth Flow

1. User signs up with email/password via Supabase Auth
2. Supabase sends a verification email (redirect URL includes hash path)
3. `useAuthCallback()` in App.tsx intercepts the token in the URL hash
4. Session is set and user is redirected to `/email-verified` or `/dashboard`
5. Session persisted in `localStorage` under key `zimpay-auth`
6. `AuthContext` provides user/profile state globally with retry logic

## Database

- **profiles** — User info (name, phone, balance). Created on first login via upsert in `AuthContext`.
- **transactions** — Transfer history (sender, receiver, amount, description, status, timestamp).
- **zimbet_accounts / zimbet_matches** — Cross-app integration with ZimBet.
- Row Level Security (RLS) ensures users only access their own data (see `supabase/migrations/`).

## Key Patterns

- **Lazy loading**: All page components are `React.lazy()` loaded with a shared `Suspense` fallback.
- **Debounced search**: Recipient lookup in `SendMoney` uses a `useDebounce` hook (400 ms).
- **Retry with backoff**: Profile fetch retries up to 3× with exponential delay for mobile networks.
- **Skeleton UI**: Dashboard shows skeleton cards during initial data load.

## Security

- Supabase RLS policies (see `supabase/migrations/001_fix_rls_policies.sql`)
- Client-side validation + server-side RPC for transfers (`transfer_money`)
- Credentials stored in `.env.local` (gitignored), never in source
- PKCE auth flow for enhanced token security
