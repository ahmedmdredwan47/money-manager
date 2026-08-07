# 💸 Money Manager

A modern, full-stack personal finance and wealth management application built with **Next.js 15 (App Router)**, **React 19**, **TypeScript**, **Tailwind CSS**, and **Supabase**.

Designed with sleek dark/light mode UI, real-time balance calculations, category budgeting, interactive financial analytics, and robust row-level security (RLS).

---

## ✨ Features

- 📊 **Interactive Dashboard**: Real-time financial summary metrics, recent transactions, spending breakdowns, and dynamic analytics charts.
- 💳 **Accounts Management**: Track bank accounts, credit cards, cash reserves, and net worth with multi-account support.
- 💸 **Income & Expense Tracking**: Categorized income and expense logging with search, date filtering, and quick actions.
- 🎯 **Budgets & Spending Limits**: Set monthly category budgets, track progress bars, and receive over-budget warnings.
- 📈 **Financial Reports & Analytics**: Interactive charts powered by Recharts (spending trends, category distribution, income vs. expense balance).
- 🏆 **Savings Goals**: Create, monitor, and achieve custom savings targets with visual milestone indicators.
- 🔒 **Secure Authentication**: Full Supabase SSR Auth supporting Email/Password sign-up, sign-in, session persistence, and password resets.
- 🌗 **Dark / Light Theme**: Built-in dynamic theme toggling using `next-themes`.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Components & Actions)
- **UI & Components**: [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Lucide Icons](https://lucide.dev/)
- **Data State & Fetching**: [TanStack Query v5](https://tanstack.com/query), [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Backend & Database**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, SSR client)
- **Deployment & Hosting**: [Vercel](https://vercel.com/)

---

## 📁 Project Structure

```text
money-manager/
├── src/
│   ├── app/                # Next.js App Router pages and API routes
│   │   ├── (auth)/         # Authentication route group (login, signup, etc.)
│   │   ├── accounts/       # Bank accounts page
│   │   ├── budget/         # Budgeting page
│   │   ├── dashboard/      # Financial dashboard
│   │   ├── expenses/       # Expense tracking page
│   │   ├── income/         # Income tracking page
│   │   ├── reports/        # Analytics & reports page
│   │   ├── savings-goals/  # Savings goals page
│   │   └── transactions/   # Transactions page
│   ├── components/         # Shared UI components (buttons, modals, cards, avatar)
│   ├── config/             # Navigation and app config
│   ├── features/           # Modular feature components, hooks, and views
│   ├── lib/                # Supabase client setup, utilities, and helper functions
│   ├── providers/          # React Query, Theme, and Auth context providers
│   └── types/              # TypeScript database schemas and application types
├── supabase/
│   └── migrations/         # PostgreSQL schema & RLS policies
├── next.config.mjs         # Production Next.js build optimizations
├── vercel.json             # Vercel deployment & security header configs
└── package.json            # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.17` or higher (Node.js 20+ recommended)
- **npm** or **pnpm** / **yarn**
- **Supabase Account**: A free Supabase project instance

### 1. Clone the Repository & Install Dependencies

```bash
git clone https://github.com/your-username/money-manager.git
cd money-manager
npm install
```

### 2. Environment Variables Setup

Copy `.env.example` to create your local environment file `.env.local`:

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Database Schema Setup

Apply the SQL migration file to your Supabase project via the Supabase Dashboard SQL Editor or Supabase CLI:

1. Open your **Supabase Dashboard** -> **SQL Editor**.
2. Run the contents of `supabase/migrations/20260806000000_initial_schema.sql`.
3. This creates the necessary tables (`accounts`, `categories`, `transactions`, `budgets`, `savings_goals`, `profiles`) with Row-Level Security (RLS) policies.

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Available Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Starts the Next.js development server with Turbopack |
| `npm run build` | Compiles an optimized production build |
| `npm run start` | Runs the compiled production build locally |
| `npm run lint` | Runs ESLint type and code quality verification |
| `npx tsc --noEmit` | Performs TypeScript type checking without emitting files |
| `npm run format` | Formats all code files using Prettier |

---

## 🌐 Deploying to Vercel

### Option 1: Deploying via Vercel Dashboard (GitHub Integration)

1. **Push your code** to GitHub, GitLab, or Bitbucket.
2. Log in to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your `money-manager` repository.
4. Set the **Environment Variables** in the Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase Public Anon Key
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL (e.g. `https://money-manager.vercel.app`)
5. Click **Deploy**. Vercel will automatically build and publish your application.

### Option 2: Deploying via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Authenticate and link the project:
   ```bash
   vercel login
   vercel link
   ```
3. Add environment variables to Vercel:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add NEXT_PUBLIC_APP_URL
   ```
4. Deploy to production:
   ```bash
   vercel --prod
   ```

### 🔑 Post-Deployment Setup (Supabase Auth Configuration)

After deploying to Vercel, update your Supabase Authentication settings:

1. Go to **Supabase Dashboard** -> **Authentication** -> **URL Configuration**.
2. Set **Site URL** to your production Vercel URL (e.g., `https://your-app.vercel.app`).
3. Add `https://your-app.vercel.app/auth/callback` to **Redirect URLs**.

---

## ⚡ Production Optimizations Included

- **Build Console Stripping**: `next.config.mjs` automatically strips `console.log` statements in production while preserving `console.error` and `console.warn`.
- **Security Headers**: `vercel.json` includes strict security headers (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`).
- **Modern Image Formats**: Configured for AVIF and WebP image generation.
- **Zero Lint & Type Warnings**: Standardized under strict ESLint 9 and TypeScript 5 checks.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
