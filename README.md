# ⚡ ProDash — Productivity Dashboard

A production-ready, full-stack productivity dashboard built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Appwrite.

![ProDash](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=nextdotjs) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript) ![Tailwind](https://img.shields.io/badge/Tailwind_CSS-3-38bdf8?style=flat-square&logo=tailwindcss) ![Appwrite](https://img.shields.io/badge/Appwrite-1.5-f02e65?style=flat-square&logo=appwrite)

## 🚀 Features

| Feature | Description |
|---------|-------------|
| **🔐 Auth** | Email/password signup & login via Appwrite, role-based access (user/admin) |
| **📊 Dashboard** | Overview with stats cards, progress bars, recent activity |
| **✅ Tasks** | CRUD with priority, status, due dates, filters & sorting |
| **💼 Jobs** | Kanban board (Applied → Interview → Offer → Rejected) |
| **📁 Projects** | Grid view with progress tracking, status management |
| **🎯 Habits** | Atomic Habits inspired: streak counter, 21-day dot grid, daily toggle |
| **💰 Budget** | Income/expense tracking, pie charts, monthly summary |
| **🤖 AI Chat** | OpenAI-powered productivity assistant with chat history |
| **👑 Admin** | User management panel for admin roles |

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Backend** | Appwrite (Auth, Database, Storage) |
| **AI** | OpenAI GPT-3.5 Turbo (with mock fallback) |
| **Charts** | Recharts |
| **Validation** | Zod + React Hook Form |
| **Deployment** | Vercel |

## 📁 Project Structure

```
├── app/
│   ├── (auth)/           # Login & Register pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/      # Protected dashboard pages
│   │   ├── page.tsx      # Overview
│   │   ├── tasks/
│   │   ├── jobs/
│   │   ├── projects/
│   │   ├── habits/
│   │   ├── budget/
│   │   └── chat/
│   ├── admin/            # Admin panel
│   ├── api/              # API routes
│   │   ├── chat/
│   │   └── admin/
│   └── layout.tsx
├── components/
│   ├── layout/           # Sidebar, Header
│   └── ui/               # shadcn components
├── hooks/                # Custom React hooks
│   ├── useAuth.tsx
│   ├── useTasks.tsx
│   ├── useJobs.tsx
│   ├── useHabits.tsx
│   └── useBudget.tsx
├── lib/                  # Appwrite client, utils
├── services/             # Data access layer
├── types/                # TypeScript types
└── middleware.ts          # Auth protection
```

## 🏗 Setup

### Prerequisites
- Node.js 18+
- Appwrite Cloud account (free at [cloud.appwrite.io](https://cloud.appwrite.io))
- Optional: OpenAI API key

### 1. Clone & Install

```bash
git clone https://github.com/cybereager/productivity-dashboard.git
cd productivity-dashboard
npm install
```

### 2. Appwrite Setup

1. Create a project at [cloud.appwrite.io](https://cloud.appwrite.io)
2. Create a **Database** with the following collections:

#### Collections Schema

| Collection | Fields |
|-----------|--------|
| **tasks** | `userId` (string), `title` (string), `description` (string), `priority` (string: low/medium/high), `status` (string: todo/in-progress/done), `dueDate` (string), `projectId` (string) |
| **jobs** | `userId` (string), `company` (string), `role` (string), `status` (string: applied/interview/rejected/offer), `notes` (string), `dateApplied` (string) |
| **projects** | `userId` (string), `name` (string), `description` (string), `status` (string: planning/active/on-hold/completed), `progress` (integer) |
| **habits** | `userId` (string), `name` (string), `description` (string), `completedDates` (string[]), `streak` (integer) |
| **budget** | `userId` (string), `amount` (float), `category` (string), `type` (string: income/expense), `date` (string), `description` (string) |
| **chat** | `userId` (string), `role` (string: user/assistant), `content` (string) |

3. Set **permissions** on each collection: `Users` role with CRUD access
4. Enable **Email/Password** auth in Authentication settings

### 3. Environment Variables

```bash
cp .env.local.example .env.local
# Edit with your Appwrite project details
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

Or use CLI:

```bash
npm i -g vercel
vercel deploy --prod
```

### Environment Variables for Vercel

Add all variables from `.env.local.example` in Vercel → Settings → Environment Variables.

## 📝 Notes

- **Chat AI**: Works with mock responses when `OPENAI_API_KEY` is not set. Add the key for real AI responses.
- **Admin Panel**: Requires `admin` label on user in Appwrite. Set via Appwrite Console → Auth → Users → Labels.
- **Currency**: Default is GBP (£). Change in budget components.

## 📄 License

MIT

---

Built with ⚡ by [Rajdeep Chaudhari](https://github.com/cybereager)
