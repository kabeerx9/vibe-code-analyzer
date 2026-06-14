# Plan 002: Establish shared typed API contracts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving on. Stop
> on any condition listed below; do not invent a different API architecture.
> Update this plan's status in `plans/README.md` when complete unless a reviewer
> owns the index.
>
> **Drift check (run first)**:
> `git diff --stat 1f631ca..HEAD -- package.json pnpm-lock.yaml packages apps/web/src/lib/api.ts apps/native/lib/api.ts apps/server/src/routes/me.ts apps/server/src/services/user.ts`
> Plan 001 is expected to change package scope strings. Adapt names to the
> initialized scope, but STOP if the API behavior or `/api/me` response shape
> changed.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: `plans/001-project-initializer-and-doctor.md`
- **Category**: direction
- **Planned at**: commit `1f631ca`, 2026-06-14
- **Issue**: https://github.com/kabeerx9/fullstack-monorepo-starter/issues/3

## Why this matters

Web and native currently maintain separate copies of the same response type,
HTTP error class, token injection, and JSON handling. The server has no runtime
schema tying its serializer to those client assumptions. Every new endpoint
would therefore require three manually synchronized implementations. A
transport-neutral contracts package should own runtime schemas, inferred
types, and a small injectable HTTP client while each app retains its
environment and Clerk integration.

## Current state

`apps/web/src/lib/api.ts:5-13` and `apps/native/lib/api.ts:5-13` contain
identical `MeResponse` declarations:

```ts
export type MeResponse = {
  id: string;
  clerkId: string;
  email: string | null;
  name: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
```

Both files also duplicate `ApiError` and `apiFetch`. The only intended transport
difference is the base URL and web's `credentials: "include"`.

The server returns an unvalidated plain object:

```ts
// apps/server/src/services/user.ts:82-91
export function serializeUser(user: User) {
  return {
    id: user.id,
    clerkId: user.clerkId,
    email: user.email,
    name: user.name,
    imageUrl: user.imageUrl,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  };
}
```

Relevant conventions:

- Zod 4 already exists in the workspace catalog.
- Packages export TypeScript source directly, as shown by
  `packages/env/package.json` and `packages/ui/package.json`.
- Environment packages are platform-specific. Shared contracts must not import
  `@app-starter/env`.
- Auth token getters remain platform-specific and live in each app.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install | `pnpm install` | exit 0; workspace package linked |
| Contracts tests | `pnpm --filter @<scope>/contracts test` | exit 0 |
| All tests | `pnpm test` | exit 0 |
| Typecheck | `pnpm run check-types` | exit 0 |
| Build | `pnpm run build` | exit 0 |

Replace `@<scope>` with the package scope produced by plan 001. On an
uninitialized template it is `@app-starter`.

## Scope

**In scope**:

- `packages/contracts/package.json` (create)
- `packages/contracts/tsconfig.json` (create)
- `packages/contracts/src/index.ts` (create)
- `packages/contracts/src/http.ts` (create)
- `packages/contracts/src/me.ts` (create)
- `packages/contracts/src/*.test.ts` (create)
- `apps/web/package.json`
- `apps/native/package.json`
- `apps/server/package.json`
- `apps/web/src/lib/api.ts`
- `apps/native/lib/api.ts`
- `apps/server/src/routes/me.ts`
- `apps/server/src/services/user.ts`
- `package.json` only if needed to include package tests in the root test command
- `pnpm-lock.yaml`

**Out of scope**:

- OpenAPI generation, Swagger UI, tRPC, GraphQL, or a new server framework.
- Changing endpoint paths or the serialized `/api/me` shape.
- Moving environment variables or Clerk token acquisition into the shared
  package.
- Introducing React hooks or TanStack Query wrappers.
- Adding new product endpoints.

## Git workflow

- Branch: `codex/plan-002-shared-api-contracts`
- Use one imperative commit such as `Add shared API contracts`.
- Do not push or open a pull request unless instructed.

## Steps

### Step 1: Create the contracts workspace package

Create a private ESM package named `@<scope>/contracts`. Match the direct-source
export style used by `packages/env`:

- Export `./http`, `./me`, and `.` entry points.
- Depend on catalog Zod.
- Add `check-types` and `test` scripts.
- Extend the shared TypeScript base config.
- Include the DOM library in this package's TypeScript config only if required
  for standard Fetch API types; do not change the repository-wide base config.

The package must be usable by browser, React Native, and Node. Do not import
Node-only modules in runtime source.

**Verify**: `pnpm install && pnpm --filter @<scope>/contracts check-types` ->
both exit 0.

### Step 2: Define the `/api/me` runtime contract

In `packages/contracts/src/me.ts`, define and export:

- `meResponseSchema` with the exact current fields and nullable semantics.
- `MeResponse` inferred from that schema.
- `apiErrorResponseSchema` for `{ error: string }`.

Dates remain ISO strings at the transport boundary. Do not coerce them to
`Date`, because both clients currently consume JSON.

Add schema tests for:

- A complete valid response.
- Nullable profile fields.
- Rejection of missing IDs and invalid date strings.
- Rejection of an error payload without a string message.

**Verify**: `pnpm --filter @<scope>/contracts test` -> all schema tests pass.

### Step 3: Add an injectable transport-neutral JSON client

In `packages/contracts/src/http.ts`, implement:

- `ApiError` retaining HTTP `status` and a safe message.
- `createApiClient(options)` accepting:
  - `baseUrl`
  - async `getToken`
  - optional `credentials`
  - optional `fetchImpl` for tests
- A `requestJson` method that accepts path, `RequestInit`, and a Zod output
  schema. It must:
  - add `Authorization` only when a token exists;
  - add JSON content type only when a body exists and no content type was set;
  - preserve caller headers;
  - parse non-2xx errors defensively;
  - parse successful JSON through the supplied schema;
  - distinguish malformed success payloads from HTTP failures.
- A `requestVoid` method for future 204 endpoints. It must not call
  `response.json()` for 204 or empty responses.

Test token/no-token behavior, header preservation, web credentials, structured
and non-JSON errors, invalid success payloads, and 204 handling using an
in-memory fake `fetchImpl`.

**Verify**: `pnpm --filter @<scope>/contracts test` -> all HTTP tests pass
without network access.

### Step 4: Replace client duplication with thin platform adapters

Update each app package to depend on `@<scope>/contracts`.

Refactor `apps/web/src/lib/api.ts` to:

- Construct one client with `env.VITE_SERVER_URL`,
  `getClerkAuthToken`, and `credentials: "include"`.
- Export `getMe()` using `meResponseSchema`.
- Re-export `ApiError` and `MeResponse` if existing callers still import them
  from this file.

Refactor `apps/native/lib/api.ts` identically except for
`env.EXPO_PUBLIC_SERVER_URL` and no credentials option.

Do not change the dashboard/home callers beyond import adjustments required by
TypeScript.

**Verify**:

```text
rg -n "class ApiError|export type MeResponse|async function apiFetch" \
  apps/web apps/native
```

-> no duplicated declarations remain in the app directories.

### Step 5: Enforce the same schema on the server

Type `serializeUser` as returning `MeResponse`. In `registerMeRoutes`, validate
the serialized value with `meResponseSchema.parse` immediately before sending
it. This creates a runtime assertion at the API boundary without coupling the
contracts package to Prisma.

Do not expose Zod errors directly to clients. Unexpected schema failures should
flow through Fastify's normal 500 handling and server logging.

Add a focused serializer test using a plain object matching the Prisma `User`
shape; no database connection is allowed.

**Verify**:

- `pnpm --filter server check-types` -> exit 0.
- The serializer test passes through the root or server test command.

### Step 6: Run full verification

**Verify**:

- `pnpm test` -> exit 0.
- `pnpm run check-types` -> exit 0.
- `pnpm run build` -> exit 0.
- `git diff --check` -> no whitespace errors.

## Test plan

- Use Node's built-in test runner established by plan 001.
- Test schemas and HTTP behavior without live network calls.
- Test the server serializer without Prisma or Clerk.
- There is no existing API test pattern; keep tests adjacent to source and use
  dependency injection rather than module-level monkey patching.

## Done criteria

- [ ] One shared package owns `MeResponse`, its runtime schema, and `ApiError`.
- [ ] Web and native API files contain only platform configuration and endpoint
      wrappers.
- [ ] Server output is checked against `meResponseSchema`.
- [ ] `requestVoid` handles 204 without JSON parsing.
- [ ] No shared runtime file imports environment, React, React Native, Clerk, or
      Node-only modules.
- [ ] `pnpm test`, `pnpm run check-types`, and `pnpm run build` pass.
- [ ] Only in-scope files are modified.
- [ ] `plans/README.md` is updated to DONE.

## STOP conditions

Stop and report if:

- Plan 001 changed package naming in a way that does not yield one canonical
  workspace scope.
- `/api/me` has changed shape or path since this plan was written.
- React Native cannot resolve the source-export package without a Metro change;
  report the exact resolution error before modifying Metro configuration.
- A proposed shared client needs access to platform globals other than the
  standard Fetch API types.
- Verification fails twice after a reasonable correction.

## Maintenance notes

- Every future endpoint should add its Zod input/output schema here first, then
  use it from server and clients.
- Keep the package transport- and framework-neutral.
- Reviewers should reject app-local copies of contract types once this lands.
- OpenAPI can be reconsidered later if external consumers appear; it is not
  justified for the current internal API.
