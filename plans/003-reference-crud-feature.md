# Plan 003: Add a removable reference CRUD feature

> **Executor instructions**: Follow this plan exactly and run each verification
> gate. This is a reference feature, not a new product commitment. Preserve its
> explicit isolation and removability. Stop rather than broadening the domain.
> Update `plans/README.md` when complete unless a reviewer owns the index.
>
> **Drift check (run first)**:
> `git diff --stat 1f631ca..HEAD -- packages/db packages/contracts apps/server/src apps/web/src apps/native/app apps/native/lib README.md docs`
> Plans 001 and 002 are expected changes. STOP if another product entity or
> ownership model has been introduced, because the reference domain must then
> be reconsidered.

## Status

- **Priority**: P2
- **Effort**: L
- **Risk**: MED
- **Depends on**: `plans/002-shared-api-contracts.md`
- **Category**: direction
- **Planned at**: commit `1f631ca`, 2026-06-14
- **Issue**: https://github.com/kabeerx9/fullstack-monorepo-starter/issues/4

## Why this matters

The starter proves authentication and user synchronization but stops before a
real authenticated data workflow. Adopters still have to decide how schemas,
ownership checks, validation, Fastify routes, typed clients, and loading/error
states fit together. A deliberately named and documented `ExampleProject`
feature should demonstrate the complete pattern on web and native while being
easy to delete when a real product domain replaces it.

## Current state

The database only contains users:

```prisma
// packages/db/prisma/schema/schema.prisma:12-21
model User {
  id       String  @id @default(cuid())
  clerkId  String  @unique
  email    String? @unique
  name     String?
  imageUrl String?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

The authenticated web and native screens both end in placeholder panels:

```tsx
// apps/web/src/routes/_auth/dashboard.tsx:42-44
<div className="rounded-lg border p-8 text-center text-muted-foreground">
  Replace this dashboard with your product.
</div>
```

```tsx
// apps/native/app/index.tsx:50-52
<View style={styles.placeholder}>
  <Text style={styles.placeholderText}>Replace this screen with your product.</Text>
</View>
```

The ownership convention available today is Clerk user ID -> local `User`
record through `getOrCreateUserByClerkId` in
`apps/server/src/services/user.ts:66-75`.

UI conventions:

- Web reuses components from `@<scope>/ui`, including `Button`, `Input`,
  `Label`, and `Card`.
- Native currently uses local `StyleSheet` objects and standard React Native
  controls.
- Do not introduce a cross-platform component abstraction in this plan.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Generate Prisma client | `pnpm run db:generate` | exit 0 |
| Contracts tests | `pnpm --filter @<scope>/contracts test` | exit 0 |
| Server tests | `pnpm --filter server test` | exit 0 |
| All tests | `pnpm test` | exit 0 |
| Typecheck | `pnpm run check-types` | exit 0 |
| Build | `pnpm run build` | exit 0 |

This plan must not run `db:push` or `db:migrate` against an unknown developer
database. Schema application is an operator action after review.

## Scope

**In scope**:

- `packages/db/prisma/schema/schema.prisma`
- Generated Prisma client files only if this repository tracks them at
  execution time
- `packages/contracts/src/example-projects.ts` (create)
- `packages/contracts/src/example-projects.test.ts` (create)
- `packages/contracts/src/index.ts`
- `apps/server/src/services/example-projects.ts` (create)
- `apps/server/src/routes/example-projects.ts` (create)
- `apps/server/src/routes/example-projects.test.ts` (create)
- `apps/server/src/index.ts`
- `apps/server/package.json` if a test script is needed
- `apps/web/src/lib/api.ts`
- `apps/web/src/routes/_auth/dashboard.tsx`
- `apps/web/src/components/example-projects.tsx` (create)
- `apps/native/lib/api.ts`
- `apps/native/app/index.tsx`
- `apps/native/components/example-projects.tsx` (create)
- `docs/reference-feature.md` (create)
- `README.md`
- `pnpm-lock.yaml` only if dependencies or generated metadata require it

**Out of scope**:

- Organizations, teams, sharing, roles, invitations, billing, files, comments,
  search, pagination, offline sync, and optimistic updates.
- A generic repository framework or CRUD code generator.
- A new client state-management library. Match the existing local React state
  approach.
- Applying schema changes to a live database.
- Renaming `ExampleProject` to a product-specific noun.

## Git workflow

- Branch: `codex/plan-003-reference-crud`
- Use one or two imperative commits, for example `Add example project API` and
  `Add example project clients`.
- Do not push or open a pull request unless instructed.

## Steps

### Step 1: Define the isolated example model

Add `ExampleProject` with:

- `id String @id @default(cuid())`
- `ownerId String`
- `name String`
- `description String?`
- `createdAt DateTime @default(now())`
- `updatedAt DateTime @updatedAt`
- Relation to `User` with `onDelete: Cascade`
- An index on `[ownerId, updatedAt]`

Add `exampleProjects ExampleProject[]` to `User`.

The `Example` prefix is required. It makes removal inventory searchable and
prevents adopters from mistaking this domain for a prescribed architecture.

**Verify**: `pnpm run db:generate` -> exits 0 and Prisma reports successful
client generation.

### Step 2: Add shared schemas and endpoint types

Create Zod contracts for:

- `exampleProjectSchema`
- `exampleProjectListSchema`
- `createExampleProjectInputSchema`
- `updateExampleProjectInputSchema`
- route parameter schema containing `id`

Rules:

- Name: trimmed, 1-100 characters.
- Description: trimmed, maximum 1000 characters; empty string normalizes to
  `null`.
- Update input must contain at least one editable field.
- Responses expose ISO date strings and never expose `ownerId`.

Export inferred types. Add tests for valid inputs, boundaries, trimming, empty
updates, and response privacy.

**Verify**: `pnpm --filter @<scope>/contracts test` -> all contract tests pass.

### Step 3: Implement owner-scoped service operations

Create service functions for list, create, update, and delete. Every operation
must resolve ownership using the authenticated Clerk ID:

- List through `where: { owner: { clerkId } }`.
- Create by connecting to the local user record associated with `clerkId`.
  Reuse the existing JIT user synchronization path rather than creating a
  second user-provisioning implementation.
- Update with an ownership-constrained lookup or transaction. Never fetch by ID
  and then update without including owner identity in the decision.
- Delete with an ownership-constrained operation. Return a typed not-found
  result when no owned row was affected.

Serialize through the shared response schema.

**Verify**: `pnpm --filter server check-types` -> exit 0.

### Step 4: Add authenticated Fastify routes with injectable dependencies

Register:

- `GET /api/example-projects`
- `POST /api/example-projects`
- `PATCH /api/example-projects/:id`
- `DELETE /api/example-projects/:id`

Use `getAuth(request)` for identity. Parse params and bodies with shared Zod
schemas. Return:

- 401 for missing identity.
- 400 for invalid input with a stable `{ error: string }` body.
- 404 when an ID does not belong to the authenticated user. Do not reveal
  whether another user's row exists.
- 201 for create, 200 for list/update, and 204 for delete.

Structure route registration with injectable service/auth dependencies so
Fastify `inject` tests require neither Clerk nor PostgreSQL. Register the route
from `apps/server/src/index.ts`.

Tests must cover auth rejection, validation, status codes, ownership-neutral
404 behavior, and 204 deletion.

**Verify**: `pnpm --filter server test` -> all route tests pass without
credentials or a database.

### Step 5: Add typed client wrappers

Extend the thin web and native API adapters with:

- `listExampleProjects`
- `createExampleProject`
- `updateExampleProject`
- `deleteExampleProject`

Use shared input/output schemas and `requestVoid` for deletion. Do not copy
types into either app.

**Verify**:
`rg -n "type ExampleProject|interface ExampleProject" apps/web apps/native`
-> no app-local contract declarations.

### Step 6: Replace web placeholder with the reference feature

Create `apps/web/src/components/example-projects.tsx` and render it from the
dashboard. It must support:

- Initial list loading, empty state, and retryable error.
- Create with name and optional description.
- Inline or modal edit.
- Delete confirmation.
- Disabled submit state while a mutation is running.
- Accessible labels and visible error messages.

Reuse existing shared UI components. Keep account display and `UserButton`.
Do not add a state library.

**Verify**: `pnpm --filter web check-types` -> exit 0.

### Step 7: Replace native placeholder with equivalent behavior

Create `apps/native/components/example-projects.tsx` and render it from the
authenticated home screen. Support the same list/create/edit/delete outcomes
using React Native primitives and existing `StyleSheet` conventions.

Use `Alert.alert` for delete confirmation. Ensure controls are disabled during
requests and errors are visible. Do not attempt offline persistence.

**Verify**: run an explicit native typecheck command. If plan 001 did not add a
native `check-types` script, add `"check-types": "tsc --noEmit"` to
`apps/native/package.json`, then run `pnpm --filter native check-types` -> exit
0.

### Step 8: Document removal and verification

Create `docs/reference-feature.md` describing:

- What the example demonstrates.
- Every file and schema field to remove when replacing it.
- The required Prisma migration/application step for real projects.
- The authorization invariant: all object access is owner-scoped on the server.

Link it from `README.md`.

**Verify**:
`rg -n "ExampleProject|example-projects" packages apps docs/reference-feature.md`
-> every hit is accounted for by the removal inventory.

### Step 9: Run the full suite

**Verify**:

- `pnpm test` -> exit 0.
- `pnpm run check-types` -> exit 0.
- `pnpm run build` -> exit 0.
- `git diff --check` -> no whitespace errors.

## Test plan

- Contract tests cover all validation boundaries.
- Fastify route tests use `fastify.inject` and injected fake services.
- Required route cases: unauthenticated, create success, invalid create,
  list success, update success, update non-owned ID, delete success, delete
  non-owned ID.
- Do not add browser E2E infrastructure solely for this reference feature.
  Client behavior remains covered by typechecking plus small pure state/helper
  tests if logic is extracted.

## Done criteria

- [ ] An authenticated user can list, create, edit, and delete only their own
      example projects on both clients.
- [ ] No response exposes `ownerId`.
- [ ] Non-owned and nonexistent IDs produce the same 404 response.
- [ ] All inputs and outputs pass through shared Zod schemas.
- [ ] The original placeholder panels are removed.
- [ ] Removal documentation accounts for every example feature file.
- [ ] `pnpm test`, `pnpm run check-types`, and `pnpm run build` pass.
- [ ] No database mutation command was run.
- [ ] `plans/README.md` is updated to DONE.

## STOP conditions

Stop and report if:

- The schema has gained organizations, teams, or another ownership concept.
- Plan 002 did not produce a transport-neutral contracts package with
  `requestVoid`.
- Prisma cannot express the required owner relation and cascade without
  altering unrelated models.
- Route testing requires live Clerk or PostgreSQL after dependency injection
  has been attempted.
- Implementing native parity would require a new navigation architecture.
- Verification fails twice after a reasonable correction.

## Maintenance notes

- The feature is intentionally small and removable. Resist adding generalized
  repositories, pagination, or collaboration semantics.
- Review ownership filters in every query, not only route guards.
- If the example becomes real product code, rename it in a dedicated migration
  and replace the removal document with domain documentation.
