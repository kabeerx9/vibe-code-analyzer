import assert from "node:assert/strict";
import { describe, it } from "node:test";

import Fastify from "fastify";

import { registerRepositoriesRoutes, type RepositoriesRouteDeps } from "./repositories";

const sampleRun = {
  id: "run_123",
  repositoryId: "repo_123",
  status: "COMPLETED" as const,
  summary: "Initial analysis completed.",
  score: 82,
  commitSha: null,
  branch: "main",
  durationMs: 12,
  criticalCount: 0,
  highCount: 0,
  mediumCount: 1,
  lowCount: 1,
  findings: [
    {
      severity: "MEDIUM" as const,
      title: "Repository metadata is incomplete",
      description: "Default branch is missing.",
      path: null,
      recommendation: "Set a default branch.",
    },
  ],
  failureReason: null,
  completedAt: "2026-06-14T12:30:00.000Z",
  createdAt: "2026-06-14T12:00:00.000Z",
  updatedAt: "2026-06-14T12:30:00.000Z",
};

const sampleRepository = {
  id: "repo_123",
  name: "vibe-code-analyzer",
  url: "https://github.com/example/vibe-code-analyzer",
  branch: "main",
  description: "Product repository",
  latestAnalysisRun: sampleRun,
  createdAt: "2026-06-14T12:00:00.000Z",
  updatedAt: "2026-06-14T12:30:00.000Z",
};

const baseService: RepositoriesRouteDeps["service"] = {
  listByClerkId: async () => [],
  createByClerkId: async () => sampleRepository,
  updateByClerkId: async () => sampleRepository,
  deleteByClerkId: async () => true,
  createAnalysisRunByClerkId: async () => sampleRun,
};

function createTestApp(deps: Partial<RepositoriesRouteDeps>) {
  const fastify = Fastify();
  fastify.register(registerRepositoriesRoutes, deps);
  return fastify;
}

describe("repositories routes", () => {
  it("rejects unauthenticated requests", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: null }),
      service: baseService,
    });

    const response = await app.inject({ method: "GET", url: "/api/repositories" });
    assert.equal(response.statusCode, 401);
    assert.deepEqual(response.json(), { error: "Unauthorized" });
  });

  it("creates a repository", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      syncFromClerk: async () => ({
        clerkId: "clerk_123",
        email: "user@example.com",
        name: "Ada",
        imageUrl: null,
      }),
      service: {
        ...baseService,
        createByClerkId: async (_clerkId, input) => ({
          ...sampleRepository,
          name: input.name,
          url: input.url ?? null,
          branch: input.branch ?? null,
          description: input.description ?? null,
        }),
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/repositories",
      payload: {
        name: "New repository",
        url: "https://github.com/example/new",
        branch: "main",
        description: "Notes",
      },
    });

    assert.equal(response.statusCode, 201);
    assert.equal(response.json().name, "New repository");
  });

  it("rejects invalid create input", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: baseService,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/repositories",
      payload: { name: "Repo", url: "not-a-url" },
    });

    assert.equal(response.statusCode, 400);
    assert.equal(typeof response.json().error, "string");
  });

  it("lists owned repositories", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: {
        ...baseService,
        listByClerkId: async () => [sampleRepository],
      },
    });

    const response = await app.inject({ method: "GET", url: "/api/repositories" });
    assert.equal(response.statusCode, 200);
    assert.deepEqual(response.json(), [sampleRepository]);
  });

  it("updates an owned repository", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: {
        ...baseService,
        updateByClerkId: async (_clerkId, _id, input) => ({
          ...sampleRepository,
          name: input.name ?? sampleRepository.name,
        }),
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: "/api/repositories/repo_123",
      payload: { name: "Renamed" },
    });

    assert.equal(response.statusCode, 200);
    assert.equal(response.json().name, "Renamed");
  });

  it("returns 404 when updating a non-owned repository", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: {
        ...baseService,
        updateByClerkId: async () => null,
      },
    });

    const response = await app.inject({
      method: "PATCH",
      url: "/api/repositories/other_users_repository",
      payload: { name: "Renamed" },
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), { error: "Not found" });
  });

  it("creates an analysis run for an owned repository", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: baseService,
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/repositories/repo_123/analysis-runs",
    });

    assert.equal(response.statusCode, 201);
    assert.deepEqual(response.json(), sampleRun);
  });

  it("returns 404 when analyzing a non-owned repository", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: {
        ...baseService,
        createAnalysisRunByClerkId: async () => null,
      },
    });

    const response = await app.inject({
      method: "POST",
      url: "/api/repositories/other_users_repository/analysis-runs",
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), { error: "Not found" });
  });

  it("deletes an owned repository with 204", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: baseService,
    });

    const response = await app.inject({
      method: "DELETE",
      url: "/api/repositories/repo_123",
    });

    assert.equal(response.statusCode, 204);
    assert.equal(response.body, "");
  });

  it("returns 404 when deleting a non-owned repository", async () => {
    const app = createTestApp({
      getAuth: () => ({ userId: "clerk_123" }),
      service: {
        ...baseService,
        deleteByClerkId: async () => false,
      },
    });

    const response = await app.inject({
      method: "DELETE",
      url: "/api/repositories/other_users_repository",
    });

    assert.equal(response.statusCode, 404);
    assert.deepEqual(response.json(), { error: "Not found" });
  });
});
