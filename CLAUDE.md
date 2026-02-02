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

# Production deployment
pm2 stop support-tickets && npm run build && pm2 start ecosystem.config.js --update-env
```

## Architecture

This is a Next.js 14 support ticket system with two interfaces:

### Authentication Model
- **Client Portal** (`/support`): Token-based auth via URL query param (`?token=xxx`). Tokens are stored in `client_tokens` table and validated by `lib/auth.ts:validateToken()`.
- **Admin Dashboard** (`/support/admin`): Password auth stored in localStorage, validated against `ADMIN_PASSWORD` env var by `lib/auth.ts:validateAdminPassword()`.

### Data Flow
- Clients submit requests via POST `/api/support/submit` (multipart/form-data) → creates `SupportRequest` with status "new" → uploads images to S3/local → triggers SES email notification to admin
- Clients view their requests via GET `/api/support/requests?token=xxx` (filtered by clientId, includes images and messages)
- Clients send replies via POST `/api/support/messages` → creates `Message` with senderType="client" → triggers SES email notification to admin
- Admins view all requests via GET `/api/support/requests?adminPassword=xxx` (includes counts, client list, images, and messages)
- Admins update status/notes via PATCH `/api/support/requests/[id]` → creates `Message` with senderType="admin" → triggers SES email notification to client (if email configured)
- Admins manage tokens via `/api/support/tokens` (GET, POST, PATCH, DELETE)

### Image Upload
- Files uploaded via `lib/s3.ts` - uses S3 if configured, falls back to local `public/uploads/` directory
- Validation: PNG/JPEG/GIF/WebP only, max 5MB per file, max 5 files per request
- Client form supports: file picker, drag-and-drop, clipboard paste (Ctrl+V screenshots)
- Images stored in `support_request_images` table with relation to parent request

### Email Notifications (SES)
- **New request** → Admin receives notification (`NOTIFICATION_EMAIL`)
- **Admin reply** → Client receives email with note content (requires `clientEmail` on token)
- **Status change** → Client receives email notification (only if no note sent, requires `clientEmail`)
- **Client reply** → Admin receives notification (`NOTIFICATION_EMAIL`)
- Email sending via `lib/ses.ts`, requires AWS credentials in env

### Key Patterns
- All pages under `/support` use `"use client"` directive for client-side interactivity
- `useSearchParams()` must be wrapped in Suspense boundary (see `/support/page.tsx`)
- Prisma client singleton in `lib/db.ts` prevents connection exhaustion in dev
- Messages visible to both admin and client; replaced old `internalNotes` field for conversation threads
- Auto-status change: Adding notes to "new" request automatically sets status to "in_progress"

### Database Models
- `SupportRequest`: id, clientId, requestType, description, status, internalNotes (legacy), timestamps, images[], messages[]
- `SupportRequestImage`: id, requestId (FK), imageUrl, filename, size, uploadedAt
- `ClientToken`: token (PK), clientId, clientName, clientEmail (optional, for notifications), createdAt
- `Message`: id, requestId (FK), content, senderType ("admin" or "client"), createdAt

### Request Statuses
`new` → `in_progress` → `resolved` → `closed`

- Clients can only reply to requests that are not "closed"
- Adding admin notes to "new" request auto-transitions to "in_progress"

### UI Components
- **Sidebar Navigation**: Both portals have left sidebar with menu items and counts
- **AdminDocs** (`components/AdminDocs.tsx`): In-app documentation for admins covering request management, client communication, token management, email notifications, and best practices
- **ClientDocs** (`components/ClientDocs.tsx`): In-app help for clients covering request submission, screenshot uploads (with Ctrl+V paste), status tracking, and communication with support
- **AdminTable**: Expandable request cards with conversation threads, reply form, status dropdown
- **RequestList**: Client view of requests with message threads and reply capability
- **TokenManager**: CRUD interface for client tokens with email management and portal URL copying
- **ImageLightbox**: Full-screen image viewer with navigation, zoom, and download

## Environment Variables

Required in `.env`:
```
DATABASE_URL=postgresql://...
ADMIN_PASSWORD=your_admin_password
NOTIFICATION_EMAIL=admin@example.com
BASE_URL=https://yourdomain.com

# AWS SES (optional, logs to console if not configured)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1

# S3 (optional, falls back to local storage)
S3_BUCKET=
S3_REGION=
```

Quote values containing `#` in `.env` files (parsed as comments otherwise).

## PM2 Configuration

The `ecosystem.config.js` parses `.env` and passes variables to PM2. After changing `.env`, restart with `--update-env` flag.
