import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { localRepositoryAnalyzer } from "./analyzer";

describe("localRepositoryAnalyzer", () => {
  it("reports metadata and provider findings for incomplete repositories", async () => {
    const result = await localRepositoryAnalyzer.analyze({
      id: "repo_123",
      name: "CodeAudit",
      url: null,
      branch: null,
      description: null,
    });

    assert.equal(result.score, 86);
    assert.equal(result.branch, null);
    assert.equal(result.commitSha, null);
    assert.equal(result.findings.length, 2);
    assert.deepEqual(
      result.findings.map((finding) => finding.severity),
      ["LOW", "MEDIUM"],
    );
  });

  it("keeps the contract stable for repositories with metadata", async () => {
    const result = await localRepositoryAnalyzer.analyze({
      id: "repo_123",
      name: "CodeAudit",
      url: "https://github.com/example/codeaudit",
      branch: "main",
      description: "Analyze code quality.",
    });

    assert.equal(result.score, 92);
    assert.equal(result.branch, "main");
    assert.equal(result.findings.length, 2);
    assert.match(result.summary, /CodeAudit/);
  });
});
