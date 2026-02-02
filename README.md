# Support Ticket System

A Next.js 14 support ticket system with client portal and admin dashboard.

## Features

- **Client Portal** (`/support`): Token-based authentication, submit support requests, view request history
- **Admin Dashboard** (`/support/admin`): Password-protected, manage all requests, update status, add internal notes
- **Email Notifications**: Amazon SES integration for new request notifications
- **Iframe Compatible**: Configured headers allow embedding in iframes

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in the values:

```bash
cp .env.example .env
```

Required environment variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `AWS_SES_ACCESS_KEY_ID` | AWS access key for SES (optional) |
| `AWS_SES_SECRET_ACCESS_KEY` | AWS secret key for SES (optional) |
| `AWS_SES_REGION` | AWS region for SES (default: us-east-1) |
| `ADMIN_PASSWORD` | Password for admin dashboard access |
| `NOTIFICATION_EMAIL` | Email address for new request notifications |

### 3. Database Setup

Generate the Prisma client:

```bash
npx prisma generate
```

Push the schema to your database:

```bash
npx prisma db push
```

Seed the database with client tokens:

```bash
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

## Usage

### Client Portal

Access the client portal with a valid token:

```
http://localhost:3000/support?token=pad_a8f7b9c2d4e1f6
```

Default seeded tokens:
- `pad_a8f7b9c2d4e1f6` - Pad
- `acme_x7y8z9a1b2c3d4` - Acme Corporation
- `techstart_m3n4o5p6q7r8` - TechStart Inc

### Admin Dashboard

Access the admin dashboard:

```
http://localhost:3000/support/admin
```

Enter the admin password configured in your environment.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/support/submit` | Submit a new support request |
| GET | `/api/support/requests` | Get requests (token for client, adminPassword for admin) |
| PATCH | `/api/support/requests/[id]` | Update request status/notes (admin only) |

## Project Structure

```
support-tickets/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── seed.ts                # Seed client tokens
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Tailwind styles
│   │   ├── support/
│   │   │   ├── page.tsx       # Client portal
│   │   │   └── admin/
│   │   │       └── page.tsx   # Admin dashboard
│   │   └── api/
│   │       └── support/
│   │           ├── submit/route.ts
│   │           ├── requests/route.ts
│   │           └── requests/[id]/route.ts
│   ├── lib/
│   │   ├── db.ts              # Prisma client singleton
│   │   ├── ses.ts             # Amazon SES email helper
│   │   └── auth.ts            # Token/password validation
│   └── components/
│       ├── StatusBadge.tsx
│       ├── RequestForm.tsx
│       ├── RequestList.tsx
│       ├── AdminTable.tsx
│       └── AdminFilters.tsx
├── next.config.mjs
├── tailwind.config.ts
└── package.json
```

## Request Statuses

- `new` - Newly submitted request
- `in_progress` - Being worked on
- `resolved` - Issue resolved
- `closed` - Request closed

## Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment. For AWS SES, the sender email must be verified in SES.
