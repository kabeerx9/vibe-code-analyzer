import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  createRepositoryInputSchema,
  repositoryListSchema,
  repositorySchema,
  updateRepositoryInputSchema,
} from "./repositories.ts";

const validRun = {
  id: "run_123",
  repositoryId: "repo_123",
  status: "COMPLETED",
  summary: "No critical issues found.",
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
      severity: "MEDIUM",
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

describe("repositorySchema", () => {
  const validRepository = {
    id: "repo_123",
    name: "vibe-code-analyzer",
    url: "https://github.com/example/vibe-code-analyzer",
    branch: "main",
    description: "Product repository",
    latestAnalysisRun: validRun,
    createdAt: "2026-06-14T12:00:00.000Z",
    updatedAt: "2026-06-14T12:30:00.000Z",
  };

  it("accepts a valid response without ownerId", () => {
    assert.deepEqual(repositorySchema.parse(validRepository), validRepository);
  });

  it("rejects payloads that expose ownerId", () => {
    assert.throws(() =>
      repositorySchema.parse({
        ...validRepository,
        ownerId: "user_123",
      }),
    );
  });

  it("accepts nullable repository metadata and missing analysis", () => {
    const payload = {
      ...validRepository,
      url: null,
      branch: null,
      description: null,
      latestAnalysisRun: null,
    };
    assert.deepEqual(repositorySchema.parse(payload), payload);
  });
});

describe("repositoryListSchema", () => {
  it("accepts an array of repositories", () => {
    const items = [
      {
        id: "repo_1",
        name: "One",
        url: null,
        branch: null,
        description: null,
        latestAnalysisRun: null,
        createdAt: "2026-06-14T12:00:00.000Z",
        updatedAt: "2026-06-14T12:00:00.000Z",
      },
    ];

    assert.deepEqual(repositoryListSchema.parse(items), items);
  });
});

describe("createRepositoryInputSchema", () => {
  it("accepts a valid name and trims whitespace", () => {
    assert.deepEqual(createRepositoryInputSchema.parse({ name: "  Alpha  " }), {
      name: "Alpha",
    });
  });

  it("accepts optional metadata", () => {
    assert.deepEqual(
      createRepositoryInputSchema.parse({
        name: "Alpha",
        url: "  https://github.com/example/alpha  ",
        branch: "  main  ",
        description: "  Notes  ",
      }),
      {
        name: "Alpha",
        url: "https://github.com/example/alpha",
        branch: "main",
        description: "Notes",
      },
    );
  });

  it("normalizes empty optional fields to null", () => {
    assert.deepEqual(
      createRepositoryInputSchema.parse({
        name: "Alpha",
        url: " ",
        branch: " ",
        description: "   ",
      }),
      {
        name: "Alpha",
        url: null,
        branch: null,
        description: null,
      },
    );
  });

  it("rejects empty names after trimming", () => {
    assert.throws(() => createRepositoryInputSchema.parse({ name: "   " }));
  });

  it("rejects invalid URLs", () => {
    assert.throws(() =>
      createRepositoryInputSchema.parse({
        name: "Alpha",
        url: "not-a-url",
      }),
    );
  });
});

describe("updateRepositoryInputSchema", () => {
  it("accepts a partial update with one field", () => {
    assert.deepEqual(updateRepositoryInputSchema.parse({ name: "Beta" }), {
      name: "Beta",
    });
  });

  it("rejects empty updates", () => {
    assert.throws(() => updateRepositoryInputSchema.parse({}));
  });

  it("normalizes empty optional values to null", () => {
    assert.deepEqual(updateRepositoryInputSchema.parse({ branch: "  ", description: "  " }), {
      branch: null,
      description: null,
    });
  });
});
