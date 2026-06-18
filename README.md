# CodeAudit

An AI-powered code analysis workspace built as a TypeScript monorepo.

## Included

- React 19 and TanStack Router web app
- Expo and React Native app
- Fastify API
- Clerk authentication on web, native, and server
- Clerk webhook user synchronization with JIT fallback
- Repository tracking with GitHub metadata import and analysis runs on web and native
- Prisma 7 and PostgreSQL
- Shared shadcn/ui package
- Shared, validated environment configuration
- Turborepo and pnpm workspaces

## Setup

Install dependencies:

```bash
pnpm install
```

Create local environment files:

```bash
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env
cp apps/native/.env.example apps/native/.env
```

Create a PostgreSQL database and Clerk application. Replace the placeholder
values in the three environment files.

Run the doctor before database generation and before shipping:

```bash
pnpm run doctor
```

Doctor checks runtime availability, required environment keys, native metadata
consistency, and workspace dependency integrity. It reports missing keys only
and never prints environment values.

Generate the Prisma client and apply the schema:

```bash
pnpm run db:generate
pnpm run db:push
```

Start all applications:

```bash
pnpm run dev
```

- Web: `http://localhost:3001`
- API: `http://localhost:3000`
- Native: Expo development server

## Clerk Setup

Configure these values:

- Server: `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `CLERK_WEBHOOK_SIGNING_SECRET`
- Web: `VITE_CLERK_PUBLISHABLE_KEY`
- Native: `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY`

The server will not start without `CLERK_WEBHOOK_SIGNING_SECRET`. It exposes
`POST /webhooks/clerk`. In Clerk, add that endpoint and subscribe to
`user.created`, `user.updated`, and `user.deleted`. Put its signing secret in
`CLERK_WEBHOOK_SIGNING_SECRET`.

For web Google OAuth, allow:

```text
http://localhost:3001/sso-callback
```

## Structure

```text
apps/
  web/       React and TanStack Router
  native/    Expo and React Native
  server/    Fastify API
packages/
  contracts/ Shared Zod request and response contracts
  config/    Shared TypeScript configuration
  db/        Prisma schema and client
  env/       Validated environment variables
  ui/        Shared UI components and styles
```

## Scripts

- `pnpm run dev`
- `pnpm run build`
- `pnpm run check-types`
- `pnpm test`
- `pnpm run doctor`
- `pnpm run dev:web`
- `pnpm run dev:server`
- `pnpm run dev:native`
- `pnpm run db:generate`
- `pnpm run db:push`
- `pnpm run db:migrate`
- `pnpm run db:studio`

## Product Domain

CodeAudit tracks authenticated user-owned repositories. GitHub repository URLs
are imported for provider owner/name, default branch, and latest commit metadata
when available. Each repository can create analysis runs through
`POST /api/repositories/:id/analysis-runs`. The current analysis implementation
is deterministic and local so the API, database, and UI workflow are stable
before source-file scanning or AI-provider integration.

See [docs/product-domain.md](./docs/product-domain.md).
