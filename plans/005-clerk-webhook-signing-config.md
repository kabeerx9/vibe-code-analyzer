# Plan 005: Fail fast on missing Clerk webhook signing configuration

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report; do not improvise. When done, update the status row for this plan in
> `plans/README.md` unless a reviewer dispatched you and told you they maintain
> the index.
>
> **Drift check (run first)**:
> `git diff --stat 8404b13..HEAD -- packages/env/src/server.ts apps/server/src/index.ts apps/server/src/routes/webhooks/clerk.ts README.md apps/server/.env.example`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding. A material
> mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: security
- **Planned at**: commit `8404b13`, 2026-06-14
- **Issue**: https://github.com/kabeerx9/fullstack-monorepo-starter/issues/1

## Why this matters

The server always registers the Clerk webhook endpoint, and the README tells
operators to configure the signing secret, but the runtime environment schema
currently marks that secret optional. That lets a deployment boot with a
webhook endpoint that cannot verify real Clerk events. User-created and
user-updated events then fail instead of synchronizing local users, and
user-deleted events leave local records behind until another cleanup path is
added.

The fix should make the configuration contract match the behavior: the app must
fail early when webhook signing is required but unavailable, and local
development behavior must be explicit rather than accidental.

## Current state

- `packages/env/src/server.ts` owns required server environment validation.
  It currently makes `CLERK_WEBHOOK_SIGNING_SECRET` optional:

```ts
// packages/env/src/server.ts:5-13
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1),
    DIRECT_URL: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    CLERK_PUBLISHABLE_KEY: z.string().min(1),
    CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
    CORS_ORIGIN: z.url(),
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  },
```

- `apps/server/src/index.ts` always registers the webhook route:

```ts
// apps/server/src/index.ts:31-32
fastify.register(registerMeRoutes);
fastify.register(registerClerkWebhookRoutes);
```

- `apps/server/src/routes/webhooks/clerk.ts` verifies each request and returns
  `400` on verification failure:

```ts
// apps/server/src/routes/webhooks/clerk.ts:15-20
try {
  event = await verifyWebhook(request);
} catch (error) {
  request.log.error({ err: error }, "Clerk webhook verification failed");
  return reply.code(400).send({ error: "Invalid webhook signature" });
}
```

- `README.md` says the signing secret must be configured:

```md
// README.md:63-65
The server exposes `POST /webhooks/clerk`. In Clerk, add that endpoint and
subscribe to `user.created`, `user.updated`, and `user.deleted`. Put its signing
secret in `CLERK_WEBHOOK_SIGNING_SECRET`.
```

Repository conventions to preserve:

- TypeScript is ESM and strict.
- Server routes are registered from `apps/server/src/index.ts`.
- Environment validation lives in `packages/env/src/server.ts`.
- Do not print secret values in logs, error messages, tests, or docs.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0 and create the local dependency install |
| Typecheck | `pnpm run check-types` | exit 0 with no TypeScript errors |
| Build | `pnpm run build` | exit 0 and produce configured build outputs |
| Dependency audit | `pnpm audit --audit-level high` | exit 0; high and critical advisories absent |

Note: during planning, `pnpm audit --audit-level high` succeeded with only
moderate advisories. The local working tree had no `node_modules`, so
`pnpm install` is required before typecheck/build verification.

## Scope

**In scope**:

- `packages/env/src/server.ts`
- `apps/server/src/index.ts`
- `apps/server/src/routes/webhooks/clerk.ts`
- `README.md`
- `apps/server/.env.example`
- Focused tests only if a test baseline already exists when this plan is
  executed

**Out of scope**:

- Replacing Clerk auth or changing Clerk webhook event types.
- Adding account deletion or broader lifecycle endpoints; that belongs to
  `plans/004-account-lifecycle.md`.
- Adding a full repository test framework; that belongs to
  `plans/001-project-initializer-and-doctor.md`.
- Logging or documenting actual secret values.

## Git workflow

- Branch: `codex/005-clerk-webhook-signing-config`
- Commit message style: short imperative sentence, matching the existing
  history such as `Plans` and `Initialize fullstack monorepo starter`.
- Do not push or open a PR unless the operator explicitly asks.

## Steps

### Step 1: Make the runtime contract explicit

Choose one of these two approaches and keep it small:

- Preferred: make `CLERK_WEBHOOK_SIGNING_SECRET` required in
  `packages/env/src/server.ts` by removing `.optional()`. This is the simplest
  match for the current README and the always-registered webhook route.
- Acceptable if local development must run without Clerk webhooks: keep the env
  field optional, but in `apps/server/src/index.ts` register
  `registerClerkWebhookRoutes` only when the value is present. If
  `env.NODE_ENV === "production"` and the value is absent, throw a startup
  error before `fastify.listen`.

Do not silently leave the route registered when the signing secret is absent.
Do not include the secret value in the thrown error or logs.

**Verify**: `pnpm run check-types` -> exits 0 after dependencies are installed.

### Step 2: Keep docs and examples consistent

Update `README.md` so the Clerk setup section says exactly what the selected
runtime behavior is:

- If the env var is required unconditionally, state that the server will not
  start without `CLERK_WEBHOOK_SIGNING_SECRET`.
- If development can skip webhook registration, state that only production
  fails fast and that local webhook delivery requires setting the secret.

Keep `apps/server/.env.example` as a placeholder-only example. Do not add real
credentials.

**Verify**:
`rg -n "CLERK_WEBHOOK_SIGNING_SECRET|webhooks/clerk|webhook" README.md apps/server/.env.example packages/env/src/server.ts apps/server/src/index.ts`
-> output reflects the selected behavior and does not print any real secret.

### Step 3: Add focused regression coverage if the repo has tests

If `plans/001-project-initializer-and-doctor.md` has already landed or another
test baseline exists, add the smallest focused tests for the selected behavior:

- Required-env approach: a server env test that fails validation when
  `CLERK_WEBHOOK_SIGNING_SECRET` is missing.
- Conditional-registration approach: a server registration test that confirms
  development skips the webhook route without a secret and production fails
  fast.

If no test baseline exists yet, do not create a separate framework in this
plan. Record in the final executor report that this plan relies on typecheck
and build verification until plan 001 lands.

**Verify**:
If tests exist, run the relevant test command and confirm the new regression
case fails before the fix and passes after it. If tests do not exist, run
`pnpm run check-types` and `pnpm run build`.

## Test plan

- Preferred once plan 001 lands: one focused environment/config regression test
  for missing webhook signing configuration.
- Until then, verification is `pnpm run check-types`, `pnpm run build`, and the
  `rg` documentation/source consistency check from Step 2.

## Done criteria

- [ ] The server no longer exposes a webhook route in a configuration where
      request signatures cannot be verified, or it refuses to start in that
      configuration.
- [ ] `README.md` matches the implemented runtime behavior.
- [ ] No secret values are logged, documented, or committed.
- [ ] `pnpm run check-types` exits 0 after dependencies are installed.
- [ ] `pnpm run build` exits 0 after dependencies are installed.
- [ ] If a test baseline exists, a focused regression test covers the missing
      signing-secret case.
- [ ] `plans/README.md` status row updated.

## STOP conditions

Stop and report back if:

- The installed `@clerk/fastify` webhook API requires a different configuration
  mechanism than `CLERK_WEBHOOK_SIGNING_SECRET`.
- The code at the current-state excerpts has changed materially.
- Making the env var required breaks documented local setup in a way the
  conditional-registration approach cannot resolve.
- Verification requires adding a full test framework before plan 001 lands.

## Maintenance notes

Reviewers should scrutinize the local-development behavior: it should either be
strict and documented, or explicitly skip webhooks while warning without leaking
secrets. When account lifecycle work in plan 004 lands, keep webhook deletion
as an idempotent fallback and retain this startup/configuration guard.
