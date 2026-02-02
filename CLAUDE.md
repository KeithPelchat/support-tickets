# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run lint         # Run ESLint
npx prisma generate  # Regenerate Prisma client after schema changes
npx prisma db push   # Push schema changes to database
npx prisma db seed   # Seed database with client tokens
```

## Architecture

This is a Next.js 14 support ticket system with two interfaces:

### Authentication Model
- **Client Portal** (`/support`): Token-based auth via URL query param (`?token=xxx`). Tokens are stored in `client_tokens` table and validated by `lib/auth.ts:validateToken()`.
- **Admin Dashboard** (`/support/admin`): Password auth stored in localStorage, validated against `ADMIN_PASSWORD` env var by `lib/auth.ts:validateAdminPassword()`.

### Data Flow
- Clients submit requests via POST `/api/support/submit` → creates `SupportRequest` with status "new" → triggers SES email notification
- Clients view their requests via GET `/api/support/requests?token=xxx` (filtered by clientId)
- Admins view all requests via GET `/api/support/requests?adminPassword=xxx` (includes counts and client list)
- Admins update status/notes via PATCH `/api/support/requests/[id]`

### Key Patterns
- All pages under `/support` use `"use client"` directive for client-side interactivity
- `useSearchParams()` must be wrapped in Suspense boundary (see `/support/page.tsx`)
- Prisma client singleton in `lib/db.ts` prevents connection exhaustion in dev
- Internal notes (`internalNotes` field) are excluded from client API responses

### Database Models
- `SupportRequest`: id, clientId, requestType, description, status, internalNotes, timestamps
- `ClientToken`: token (PK), clientId, clientName, createdAt

### Request Statuses
`new` → `in_progress` → `resolved` → `closed`

## Environment Variables

Quote values containing `#` in `.env` files (parsed as comments otherwise).
