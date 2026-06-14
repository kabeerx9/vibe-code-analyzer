# Plan 004: Complete cross-platform account lifecycle

> **Executor instructions**: Follow this plan step by step. Account deletion is
> destructive and identity-provider behavior is security-sensitive. Use the
> exact server-authoritative flow below and stop if Clerk APIs differ from the
> installed version. Update `plans/README.md` when complete unless a reviewer
> owns the index.
>
> **Drift check (run first)**:
> `git diff --stat 1f631ca..HEAD -- packages/contracts packages/db apps/server/src apps/web/src apps/native`
> Plans 001 and 002 are expected changes; plan 003 may also have added a
> cascading owned model. STOP if user deletion semantics or auth providers have
> changed.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/002-shared-api-contracts.md`
- **Category**: direction
- **Planned at**: commit `1f631ca`, 2026-06-14
- **Issue**: https://github.com/kabeerx9/fullstack-monorepo-starter/issues/5

## Why this matters

Web currently exposes Clerk's `UserButton`, while native only exposes sign-out.
There is no consistent product-owned surface for editing profile data or
deleting an account, and deletion relies solely on an eventual webhook. Adding
server-authoritative profile update and account deletion endpoints gives both
clients the same behavior and makes local cleanup semantics explicit while
retaining the Clerk webhook as an idempotent fallback.

## Current state

Web delegates account controls:

```tsx
// apps/web/src/routes/_auth/dashboard.tsx:31-40
<div className="flex items-center justify-between">
  <h1 className="text-2xl font-semibold">App Starter</h1>
  <UserButton />
</div>
...
<p className="mt-1 font-medium">{me?.email ?? "Loading..."}</p>
```

Native only signs out:

```tsx
// apps/native/components/sign-out-button.tsx:9-15
const handleSignOut = async () => {
  try {
    await signOut();
    router.replace("/sign-in");
  } catch (err) {
    console.error(JSON.stringify(err, null, 2));
  }
};
```

The server already maintains an idempotent local delete helper and webhook:

```ts
// apps/server/src/services/user.ts:78-80
export async function deleteUserByClerkId(clerkId: string): Promise<void> {
  await prisma.user.deleteMany({ where: { clerkId } });
}
```

```ts
// apps/server/src/routes/webhooks/clerk.ts:28-33
case "user.deleted": {
  const clerkId = (event.data as { id?: string }).id;
  if (clerkId) {
    await deleteUserByClerkId(clerkId);
  }
  break;
}
```

Constraints:

- Clerk remains the identity source of truth.
- The local `User` row is a synchronized projection.
- If plan 003 landed, owned `ExampleProject` rows must cascade when the local
  user is deleted.
- Email, password, MFA, and OAuth connection management require provider
  verification flows and are not part of this plan.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Contracts tests | `pnpm --filter @<scope>/contracts test` | exit 0 |
| Server tests | `pnpm --filter server test` | exit 0 |
| All tests | `pnpm test` | exit 0 |
| Typecheck | `pnpm run check-types` | exit 0 |
| Build | `pnpm run build` | exit 0 |

## Scope

**In scope**:

- `packages/contracts/src/account.ts` (create)
- `packages/contracts/src/account.test.ts` (create)
- `packages/contracts/src/index.ts`
- `apps/server/src/routes/account.ts` (create)
- `apps/server/src/routes/account.test.ts` (create)
- `apps/server/src/services/user.ts`
- `apps/server/src/index.ts`
- `apps/web/src/lib/api.ts`
- `apps/web/src/routes/_auth/account.tsx` (create)
- `apps/web/src/components/header.tsx`
- `apps/web/src/routes/_auth/dashboard.tsx` only for navigation cleanup if needed
- `apps/native/lib/api.ts`
- `apps/native/app/account.tsx` (create)
- `apps/native/app/_layout.tsx`
- `apps/native/app/index.tsx`
- `apps/native/components/sign-out-button.tsx` only if navigation is shared
- Package manifests and `pnpm-lock.yaml` only if required for tests

**Out of scope**:

- Email-address changes, password reset, MFA enrollment, connected accounts,
  sessions/device management, avatar upload, organizations, or admin deletion.
- Replacing Clerk or wrapping all Clerk APIs in a generic identity interface.
- Soft deletion or retention policy design.
- Deleting the local user before Clerk confirms identity deletion.
- Returning provider error details or stack traces to clients.

## Git workflow

- Branch: `codex/plan-004-account-lifecycle`
- Use an imperative commit such as `Add account lifecycle flows`.
- Do not push or open a pull request unless instructed.

## Steps

### Step 1: Define shared account contracts

Create `packages/contracts/src/account.ts` with:

- `updateAccountInputSchema` containing optional `firstName` and `lastName`.
- Trim strings, cap each at 100 characters, convert empty strings to `null`,
  and require at least one field.
- `deleteAccountInputSchema` requiring the exact confirmation string `DELETE`.
- Reuse `meResponseSchema` as the update response.

Do not include email, password, or image fields.

Add boundary tests for trimming, empty update rejection, length limits, nullable
names, and exact delete confirmation.

**Verify**: `pnpm --filter @<scope>/contracts test` -> all account contract
tests pass.

### Step 2: Add server-authoritative profile update

Add a user service function that:

1. Calls the installed Clerk server SDK's user-update API for the authenticated
   Clerk ID.
2. Maps the returned Clerk user with the existing `mapClerkApiUser`.
3. Calls `upsertUserFromClerk` synchronously.
4. Returns the serialized, schema-validated `MeResponse`.

Expose it through `PATCH /api/account`. Authenticate with `getAuth`, validate
the body with `updateAccountInputSchema`, and return stable 401/400 errors.
Unexpected provider errors must be logged server-side and returned as a generic
502 or 500 error, following Fastify conventions.

Use dependency injection in route registration for tests.

**Verify**: `pnpm --filter server check-types` -> exit 0.

### Step 3: Add explicit account deletion semantics

Expose `DELETE /api/account` with the confirmation body.

Required ordering and behavior:

1. Authenticate and validate confirmation.
2. Ask Clerk to delete the authenticated identity first.
3. After Clerk confirms deletion, call `deleteUserByClerkId`.
4. If local deletion succeeds, return 204.
5. If local deletion fails after Clerk succeeded, log the cleanup failure and
   still return 204 because the verified `user.deleted` webhook is the
   idempotent cleanup fallback. Never recreate the identity or expose database
   details.
6. If Clerk deletion fails, do not delete local data; return a generic error.

The existing webhook remains unchanged and safe because it uses `deleteMany`.
If plan 003 added owned rows, confirm the Prisma relation uses
`onDelete: Cascade`.

**Verify**: focused route/service tests pass for ordering, failure behavior, and
idempotent webhook cleanup.

### Step 4: Test account routes without live services

Use Fastify `inject` with injected auth and service functions. Cover:

- Unauthenticated PATCH and DELETE -> 401.
- Invalid profile payload -> 400.
- Valid profile update -> 200 and shared response shape.
- Invalid delete confirmation -> 400.
- Clerk deletion failure -> local deletion not called; generic error.
- Clerk deletion success -> local deletion called afterward; 204.
- Local cleanup failure after Clerk success -> 204 and error logger called.

Do not mock by mutating global Clerk modules.

**Verify**: `pnpm --filter server test` -> all tests pass without Clerk keys or
PostgreSQL.

### Step 5: Add thin typed client methods

Add to both platform API adapters:

- `updateAccount(input)` using `updateAccountInputSchema` and
  `meResponseSchema`.
- `deleteAccount(input)` using `deleteAccountInputSchema` and `requestVoid`.

Do not duplicate account input or response types.

**Verify**:
`rg -n "type UpdateAccount|interface UpdateAccount|DELETE.*confirmation" apps`
-> no app-local contract definitions.

### Step 6: Add the web account screen

Create the authenticated TanStack Router route `/account`.

Requirements:

- Initialize first/last name from Clerk's loaded user.
- Submit through the server endpoint, then call the installed Clerk client
  reload method if available so provider UI and local state agree.
- Show loading, success, and error states.
- Include a separate danger section requiring the user to type `DELETE`.
- Disable deletion until confirmation matches exactly.
- After successful deletion, sign out/clear the Clerk session and navigate to
  `/` without assuming the deleted session remains usable.
- Add an Account link to the authenticated header.
- Reuse shared `Button`, `Input`, `Label`, and `Card` components.

Keep `UserButton` unless it creates duplicate account navigation that materially
confuses the page; if changed, limit the edit to navigation presentation.

**Verify**: `pnpm --filter web check-types` -> exit 0.

### Step 7: Add the native account screen

Create `apps/native/app/account.tsx`, register it in the root stack, and add a
navigation entry from authenticated home.

Match web behavior:

- Edit first/last name through the server.
- Show explicit request state and errors.
- Require exact `DELETE` confirmation.
- Show a final native `Alert.alert` destructive confirmation.
- On successful deletion, clear/sign out the Clerk session and replace
  navigation with `/sign-in`.

Use React Native primitives and the existing color/theme conventions. Do not
add a native UI library.

**Verify**: `pnpm --filter native check-types` -> exit 0. If no native
`check-types` script exists after prior plans, add `"check-types": "tsc
--noEmit"` before running it.

### Step 8: Run full verification

**Verify**:

- `pnpm test` -> exit 0.
- `pnpm run check-types` -> exit 0.
- `pnpm run build` -> exit 0.
- `git diff --check` -> no whitespace errors.

## Test plan

- Contract tests validate all account input boundaries.
- Server tests assert destructive-operation ordering, not only response codes.
- Route tests use injected dependencies and captured logging.
- Do not require live Clerk, a database, browser automation, or native
  simulators for the automated suite.
- Manually review client code paths for session cleanup after deletion because
  the repository does not yet have E2E infrastructure.

## Done criteria

- [ ] Web and native users can edit first and last name through the same server
      contract.
- [ ] Web and native users can deliberately delete their account.
- [ ] Local data is never deleted when Clerk identity deletion fails.
- [ ] Local cleanup failure after identity deletion is logged and delegated to
      the idempotent webhook fallback.
- [ ] Delete confirmation requires exact `DELETE` plus a final client
      confirmation.
- [ ] Email/password/MFA management remains unchanged.
- [ ] `pnpm test`, `pnpm run check-types`, and `pnpm run build` pass.
- [ ] Only in-scope files are modified.
- [ ] `plans/README.md` is updated to DONE.

## STOP conditions

Stop and report if:

- The installed Clerk SDK does not expose documented server methods for user
  update or deletion with the authenticated user ID.
- Clerk deletion does not provide a clear success/failure boundary before local
  cleanup.
- Another auth provider has been introduced.
- User-owned rows exist without a reviewed cascade or retention policy.
- Client session cleanup after deletion cannot be performed with installed
  Clerk APIs.
- Verification fails twice after a reasonable correction.

## Maintenance notes

- Keep Clerk as identity source of truth and local user data as a synchronized
  projection.
- Reviewers should focus on destructive-operation ordering, generic error
  responses, session cleanup, and cascade behavior.
- Email, MFA, password, and avatar flows are deliberately deferred because they
  require additional verification and upload semantics.
