# Plan 001: Add project initialization and diagnostics

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report; do not improvise. When done, update this plan's status row in
> `plans/README.md` unless a reviewer told you they maintain the index.
>
> **Drift check (run first)**:
> `git diff --stat 1f631ca..HEAD -- README.md package.json pnpm-lock.yaml turbo.json apps/native/app.json apps/web/index.html apps/web/src apps/native/app apps/native/components packages scripts`
> If an in-scope file changed, compare the current-state excerpts below against
> live code. A material mismatch is a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `1f631ca`, 2026-06-14
- **Issue**: https://github.com/kabeerx9/fullstack-monorepo-starter/issues/2

## Why this matters

The repository is intended to be reused through GitHub's template mechanism,
but each adopter must manually rename workspace packages, visible branding,
Expo identifiers, and environment files. Those values occur across manifests,
imports, application metadata, and UI copy, so partial renames are easy. A
one-time initializer plus a read-only doctor command turns that checklist into
a repeatable, testable onboarding path while preserving the starter defaults.

## Current state

- `README.md:17-36` tells adopters to clone the template, copy three environment
  files, and replace placeholders manually.
- `README.md:100-105` separately lists package scope, Expo metadata, branding,
  and deployment resources that must be changed before shipping.
- `package.json:2,16-22` hard-codes `fullstack-monorepo-starter` and the
  `@app-starter/*` scope.
- `apps/native/app.json:3-22` hard-codes the display name, slug, URL scheme, and
  iOS/Android identifiers.
- The same visible name appears in web and native screens:

```tsx
// apps/web/src/routes/_auth/dashboard.tsx:31-44
<div className="mx-auto flex max-w-2xl flex-col gap-6 p-6">
  <div className="flex items-center justify-between">
    <h1 className="text-2xl font-semibold">App Starter</h1>
    <UserButton />
  </div>
  ...
  <div className="rounded-lg border p-8 text-center text-muted-foreground">
    Replace this dashboard with your product.
  </div>
</div>
```

```tsx
// apps/native/app/index.tsx:41-52
<View style={styles.container}>
  <Text style={styles.title}>App Starter</Text>
  ...
  <View style={styles.placeholder}>
    <Text style={styles.placeholderText}>Replace this screen with your product.</Text>
  </View>
</View>
```

Repository conventions to preserve:

- TypeScript is ESM (`"type": "module"`).
- Workspace packages use the `@app-starter/*` scope before initialization.
- Configuration is JSON/JSONC where practical; do not rewrite source files with
  broad regular expressions.
- Existing scripts use `pnpm` and Turborepo from the repository root.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Install after manifest edits | `pnpm install` | exit 0 and lockfile updated |
| Unit tests | `pnpm test` | exit 0; initializer and doctor tests pass |
| Typecheck | `pnpm run check-types` | exit 0, no TypeScript errors |
| Build | `pnpm run build` | exit 0 |
| Doctor | `pnpm run doctor` | nonzero on untouched template; reports placeholder fields without printing environment values |

## Scope

**In scope**:

- `scripts/project-config.ts` (create)
- `scripts/init-project.ts` (create)
- `scripts/doctor.ts` (create)
- `scripts/init-project.test.ts` (create)
- `scripts/doctor.test.ts` (create)
- `package.json`
- `pnpm-lock.yaml`
- `turbo.json`
- `README.md`
- `apps/native/app.json`
- Known files containing `App Starter`, `app-starter`,
  `fullstack-monorepo-starter`, or `com.example.appstarter` under `apps/` and
  `packages/`

**Out of scope**:

- Creating Clerk, PostgreSQL, hosting, or app-store projects.
- Reading or printing secret values from any `.env` file.
- Replacing arbitrary user text across the entire repository.
- Running the initializer against the working repository as part of
  development; tests must operate on disposable fixtures.
- Changing authentication, database models, API behavior, or UI layout.

## Git workflow

- Branch: `codex/plan-001-project-initializer`
- The repository has only one commit and no established commit convention. Use
  one imperative commit such as `Add project initializer and doctor`.
- Do not push or open a pull request unless instructed.

## Steps

### Step 1: Define and validate project metadata

Create `scripts/project-config.ts` with:

- A `ProjectConfig` type containing `displayName`, `slug`, `packageScope`,
  `scheme`, and `bundleIdentifier`.
- Pure normalization/validation functions. Accept `packageScope` with or
  without a leading `@`, but store it with `@`.
- Conservative validation:
  - `slug` and `scheme`: lowercase letters, digits, and hyphens; must begin
    with a letter.
  - `packageScope`: npm scope syntax without a slash.
  - `bundleIdentifier`: at least two dot-separated identifier segments.
  - `displayName`: non-empty after trimming.
- A constant describing the starter defaults. This must be the single source
  of truth used by both commands and tests.

Add root `tsx` and Node type support only if they are not already resolvable
from the root. Add a root test script that runs initializer tests and then
aggregates future app/package tests through Turborepo:

```json
"test": "node --import tsx --test scripts/*.test.ts && turbo test"
```

Add a `test` task to `turbo.json` with `dependsOn: ["^test"]`. Create the
validation tests for `project-config.ts` in this step so the script glob always
matches at least one file.

**Verify**: `pnpm install && pnpm test` -> installation exits 0; config tests
pass; Turborepo exits 0 even before other workspaces add test scripts.

### Step 2: Implement a deterministic initializer

Create `scripts/init-project.ts` with a documented CLI:

```text
pnpm run init:project -- \
  --name "Acme Tasks" \
  --slug acme-tasks \
  --scope acme-tasks \
  --scheme acme-tasks \
  --bundle-id com.acme.tasks
```

Required behavior:

1. Parse arguments without adding a heavy CLI framework.
2. Support `--dry-run` and `--yes`. Without `--yes`, print the planned changes
   and require interactive confirmation. In non-interactive mode, fail with a
   clear message unless `--yes` or `--dry-run` is present.
3. Refuse to run if tracked source files already contain a mixture of starter
   and non-starter package scopes; this indicates a partial previous rename.
4. Update structured JSON through `JSON.parse`/`JSON.stringify`, preserving a
   trailing newline:
   - root and workspace `package.json` names/dependency keys
   - `apps/native/app.json` metadata
5. Update a fixed allowlist of text/source files for import specifiers and
   visible starter branding. Do not scan-and-replace unknown file types.
6. Create missing `.env` files by copying `.env.example`; never overwrite an
   existing `.env`.
7. Print that `pnpm install` is required after a package-scope rename. Do not
   spawn package installation from the script.
8. Write no persistent initializer state file. A second invocation with the
   same values should report no changes and exit 0.

Add `"init:project": "tsx scripts/init-project.ts"` to root scripts.

**Verify**:
`pnpm run init:project -- --name "Acme Tasks" --slug acme-tasks --scope acme-tasks --scheme acme-tasks --bundle-id com.acme.tasks --dry-run`
-> exits 0, lists changes, and leaves `git status --short` unchanged except for
the implementation files already being edited.

### Step 3: Implement a read-only doctor command

Create `scripts/doctor.ts`. It must check and report:

- Required runtime availability: supported Node version and `pnpm`.
- Presence of the three `.env` files and all required key names from their
  examples. Check key presence only; never print values.
- Remaining starter identifiers and placeholder product copy.
- Native display name, slug, scheme, bundle identifier, and Android package
  consistency.
- Workspace dependency integrity: every `workspace:*` dependency resolves to a
  local package name.
- Generated Prisma client presence as informational, with the exact remediation
  command `pnpm run db:generate`.

Use stable result codes: exit 0 when all required checks pass, exit 1 when a
required check fails. Clearly separate warnings from failures.

Add `"doctor": "tsx scripts/doctor.ts"` to root scripts.

**Verify**: `pnpm run doctor` -> on the untouched template, exits 1 and names
the remaining placeholder categories; output contains no environment values.

### Step 4: Test against disposable repository fixtures

Tests must create a temporary directory using Node APIs, copy only the minimal
fixture files required by each case, run the pure command entry functions
against that directory, and clean up afterward.

Cover at least:

- Valid config normalization and each invalid field.
- Dry-run performs zero writes.
- Initialization updates package names, workspace dependency keys, imports,
  visible branding, and Expo identifiers.
- Existing `.env` files are not overwritten.
- Re-running with the same config is a no-op.
- Mixed package scopes are rejected.
- Doctor reports missing env files and unresolved workspace dependencies.
- Doctor never includes fixture secret values in captured output.
- Doctor passes on a fully initialized fixture.

Design the command modules so tests import functions directly; do not rely on
spawning shell commands for every assertion.

**Verify**: `pnpm test` -> all tests pass with no writes outside temporary
directories.

### Step 5: Replace the manual-only onboarding documentation

Update `README.md` to:

- Present `pnpm run init:project -- ...` as the primary path after cloning.
- Document every argument and the dry-run behavior.
- Keep a concise manual checklist as a fallback.
- Add `pnpm run doctor` before database generation and before shipping.
- State explicitly that commands never provision external services and never
  overwrite `.env` files.

Do not initialize the template itself; the checked-in defaults must remain
generic so GitHub template users can choose their own metadata.

**Verify**:
`rg -n "init:project|doctor|dry-run|bundle-id" README.md package.json`
-> finds documentation and scripts for all four terms.

### Step 6: Run repository verification

Run the complete non-secret verification suite.

**Verify**:

- `pnpm test` -> exit 0.
- `pnpm run check-types` -> exit 0.
- `pnpm run build` -> exit 0.
- `git diff --check` -> no whitespace errors.

## Test plan

- Use Node's built-in `node:test` and `node:assert/strict`.
- Keep filesystem mutation confined to `fs.mkdtemp` directories.
- Include captured stdout/stderr assertions so secret-value leakage and
  confusing diagnostics regressions are caught.
- Do not require Clerk, PostgreSQL, Expo, or network access.

## Done criteria

- [ ] `pnpm run init:project -- --help` exits 0 and documents every option.
- [ ] Dry-run changes no files.
- [ ] Re-running initialization with identical values is a no-op.
- [ ] Existing `.env` files are never overwritten.
- [ ] `pnpm run doctor` reports placeholders and configuration gaps without
      printing values.
- [ ] `pnpm test`, `pnpm run check-types`, and `pnpm run build` exit 0.
- [ ] `git diff --check` returns no errors.
- [ ] Only in-scope files are modified.
- [ ] `plans/README.md` is updated to DONE.

## STOP conditions

Stop and report if:

- The repository has already been partially renamed and the intended canonical
  scope or product identifiers cannot be inferred unambiguously.
- A safe implementation would require parsing or rewriting arbitrary
  TypeScript syntax rather than a fixed set of known import strings.
- Tests cannot isolate initializer writes to temporary directories.
- A requested check would require reading or emitting secret values.
- Verification fails twice after a reasonable correction.

## Maintenance notes

- Whenever a new workspace package or visible starter identifier is added,
  update the initializer's explicit target inventory and its fixture tests.
- Reviewers should scrutinize path handling, no-overwrite behavior, idempotency,
  and output redaction.
- External service provisioning and deployment remain intentionally separate.
