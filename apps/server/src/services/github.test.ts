import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  fetchGitHubRepositoryMetadata,
  importGitHubRepositoryMetadata,
  parseGitHubRepositoryUrl,
} from "./github";

describe("parseGitHubRepositoryUrl", () => {
  it("parses GitHub repository URLs", () => {
    assert.deepEqual(parseGitHubRepositoryUrl("https://github.com/kabeerx9/vibe-code-analyzer"), {
      owner: "kabeerx9",
      name: "vibe-code-analyzer",
    });
  });

  it("strips git suffixes", () => {
    assert.deepEqual(parseGitHubRepositoryUrl("https://github.com/kabeerx9/vibe-code-analyzer.git"), {
      owner: "kabeerx9",
      name: "vibe-code-analyzer",
    });
  });

  it("ignores non-GitHub URLs", () => {
    assert.equal(parseGitHubRepositoryUrl("https://gitlab.com/example/repo"), null);
  });
});

describe("fetchGitHubRepositoryMetadata", () => {
  it("fetches repository metadata and latest default-branch commit", async () => {
    const requests: string[] = [];
    const fetchFn = async (input: string) => {
      requests.push(input);
      if (input.endsWith("/commits/main")) {
        return Response.json({ sha: "abc123" });
      }

      return Response.json({
        id: 42,
        html_url: "https://github.com/example/repo",
        default_branch: "main",
      });
    };

    const metadata = await fetchGitHubRepositoryMetadata(
      { owner: "example", name: "repo" },
      fetchFn,
    );

    assert.deepEqual(metadata, {
      owner: "example",
      name: "repo",
      repoId: "42",
      url: "https://github.com/example/repo",
      defaultBranch: "main",
      latestCommitSha: "abc123",
    });
    assert.deepEqual(requests, [
      "https://api.github.com/repos/example/repo",
      "https://api.github.com/repos/example/repo/commits/main",
    ]);
  });

  it("returns null when the repository lookup fails", async () => {
    const metadata = await importGitHubRepositoryMetadata(
      "https://github.com/example/missing",
      async () => new Response(null, { status: 404 }),
    );

    assert.equal(metadata, null);
  });
});
