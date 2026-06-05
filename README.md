# WB Manager (Wildberries) — Monorepo

Full-stack Wildberries store manager (backend + frontend). This repository contains a backend API (Node.js + TypeScript + Express + Prisma) and a frontend SPA (React + Vite + TypeScript).

## Quick Start (Development)

1. **Clone & Install**
   ```bash
   npm install
   ```

2. **Setup Environment**
   - Copy `backend/.env.example` to `backend/.env`
   - Update database and service credentials

3. **Database Migration**
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. **Run Services**
   - Both concurrently: `npm run dev`
   - Backend only: `npm run dev:backend`
   - Frontend only: `npm run dev:frontend`

## Project Structure

```
wb-manager/
├── backend/
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── middleware/   # Auth, error handling
│   │   ├── schemas/      # Zod validation
│   │   ├── utils/        # Helpers, encryption
│   │   └── server.ts     # Express entry
│   ├── prisma/
│   │   └── schema.prisma # Database schema
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── api/          # Axios client
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Key Features

- ✅ Multi-account management (multiple WB stores)
- ✅ Dashboard with analytics & KPIs
- ✅ Product management (list, search, edit)
- ✅ Order & review tracking
- ✅ Token encryption for security
- ✅ Full TypeScript support
- ✅ Dark theme UI (shadcn/ui + TailwindCSS)

## Stack

**Backend:** Node.js, Express, TypeScript, Prisma, PostgreSQL, Redis, JWT, Zod

**Frontend:** React 18, Vite, TypeScript, TailwindCSS, TanStack Query, React Hook Form, Zustand

## License

MIT
