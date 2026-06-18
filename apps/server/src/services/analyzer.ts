import type {
  AnalysisFinding,
  AnalysisSeverity,
  Repository,
} from "@codeaudit/contracts/repositories";

export type AnalyzerRepositoryInput = Pick<
  Repository,
  | "id"
  | "name"
  | "url"
  | "branch"
  | "description"
  | "provider"
  | "defaultBranch"
  | "latestCommitSha"
>;

export type AnalyzerResult = {
  summary: string;
  score: number;
  commitSha: string | null;
  branch: string | null;
  durationMs: number;
  findings: AnalysisFinding[];
};

export type RepositoryAnalyzer = {
  analyze: (repository: AnalyzerRepositoryInput) => Promise<AnalyzerResult>;
};

type FindingTemplate = {
  severity: AnalysisSeverity;
  title: string;
  description: string;
  path: string | null;
  recommendation: string;
};

const metadataFinding: FindingTemplate = {
  severity: "MEDIUM",
  title: "Repository metadata is incomplete",
  description: "CodeAudit can produce better context when a repository URL and default branch are available.",
  path: null,
  recommendation: "Add the repository URL and default branch before connecting provider-based scanning.",
};

const providerFinding: FindingTemplate = {
  severity: "LOW",
  title: "Source scanner is not connected",
  description: "GitHub metadata was imported, but this run did not inspect repository source files yet.",
  path: null,
  recommendation: "Use the imported GitHub branch and commit to fetch source files in the next analyzer adapter.",
};

const unsupportedProviderFinding: FindingTemplate = {
  severity: "MEDIUM",
  title: "Repository provider was not imported",
  description: "This repository was analyzed from manually-entered metadata only.",
  path: null,
  recommendation: "Use a GitHub repository URL so CodeAudit can import branch and commit metadata automatically.",
};

const documentationFinding: FindingTemplate = {
  severity: "LOW",
  title: "Review product notes before deeper analysis",
  description: "Repository notes are available and should be incorporated into future rule selection.",
  path: null,
  recommendation: "Use repository descriptions to tune analysis scope and reporting priorities.",
};

function countBySeverity(findings: AnalysisFinding[], severity: AnalysisSeverity): number {
  return findings.filter((finding) => finding.severity === severity).length;
}

function calculateScore(findings: AnalysisFinding[]): number {
  const penalty =
    countBySeverity(findings, "CRITICAL") * 30 +
    countBySeverity(findings, "HIGH") * 20 +
    countBySeverity(findings, "MEDIUM") * 10 +
    countBySeverity(findings, "LOW") * 4;

  return Math.max(0, 100 - penalty);
}

export const localRepositoryAnalyzer: RepositoryAnalyzer = {
  async analyze(repository) {
    const startedAt = Date.now();
    const findings: AnalysisFinding[] = [];

    if (repository.provider === "GITHUB") {
      findings.push(providerFinding);
    } else {
      findings.push(unsupportedProviderFinding);
    }

    const branch = repository.defaultBranch ?? repository.branch;

    if (!repository.url || !branch) {
      findings.push(metadataFinding);
    }

    if (repository.description) {
      findings.push(documentationFinding);
    }

    const score = calculateScore(findings);
    const summary =
      findings.length === 1
        ? `${repository.name} is ready for provider-backed source scanning.`
        : `${repository.name} has ${findings.length} setup findings before provider-backed scanning.`;

    return {
      summary,
      score,
      commitSha: repository.latestCommitSha,
      branch,
      durationMs: Math.max(1, Date.now() - startedAt),
      findings,
    };
  },
};
