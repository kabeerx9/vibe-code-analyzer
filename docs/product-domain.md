# Product Domain

CodeAudit starts with two product entities: `Repository` and `AnalysisRun`.

## Repository

A repository is owned by a synced Clerk user through the local `User` record.
Server reads and writes always filter by the authenticated Clerk user. Non-owned
and nonexistent repository IDs both return `404 Not found`.

Fields:

- `id`
- `ownerId`
- `name`
- `url`
- `branch`
- `provider`
- `providerRepoId`
- `providerOwner`
- `providerName`
- `defaultBranch`
- `latestCommitSha`
- `description`
- `createdAt`
- `updatedAt`

## AnalysisRun

An analysis run belongs to a repository. The first implementation records a
completed local analyzer result so the product can exercise the database, API
contract, web UI, and native UI before scanner/provider integration.

Fields:

- `id`
- `repositoryId`
- `status`
- `summary`
- `score`
- `commitSha`
- `branch`
- `durationMs`
- `criticalCount`
- `highCount`
- `mediumCount`
- `lowCount`
- `findings`
- `failureReason`
- `completedAt`
- `createdAt`
- `updatedAt`

## API Surface

- `GET /api/repositories`
- `POST /api/repositories`
- `PATCH /api/repositories/:id`
- `DELETE /api/repositories/:id`
- `POST /api/repositories/:id/analysis-runs`

## Next Integration Step

GitHub URLs are parsed and imported through
`apps/server/src/services/github.ts`. The repository service stores imported
default branch and latest commit metadata when GitHub lookup succeeds.

Replace or extend the local adapter in `apps/server/src/services/analyzer.ts`.
Keep the route contract stable: use the stored provider metadata to fetch source
files, enqueue or execute the scan behind `createAnalysisRunByClerkId`, persist
the structured result, then return an `AnalysisRun`.
