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
- `description`
- `createdAt`
- `updatedAt`

## AnalysisRun

An analysis run belongs to a repository. The first implementation records a
completed stub result so the product can exercise the database, API contract,
web UI, and native UI before scanner/provider integration.

Fields:

- `id`
- `repositoryId`
- `status`
- `summary`
- `score`
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

Replace the stub in `apps/server/src/services/repositories.ts` with a scanner
adapter. Keep the route contract stable: enqueue or execute the scan behind
`createAnalysisRunByClerkId`, then return an `AnalysisRun`.
