import prisma from "@codeaudit/db";
import type { AnalysisRun as DbAnalysisRun, Repository as DbRepository } from "@codeaudit/db/types";
import type {
  AnalysisRun,
  CreateRepositoryInput,
  Repository,
  UpdateRepositoryInput,
} from "@codeaudit/contracts/repositories";
import { analysisRunSchema, repositorySchema } from "@codeaudit/contracts/repositories";

import {
  localRepositoryAnalyzer,
  type RepositoryAnalyzer,
} from "@/services/analyzer";
import { importGitHubRepositoryMetadata } from "@/services/github";
import {
  getOrCreateUserByClerkId,
  type UserProfileInput,
} from "@/services/user";

type RepositoryWithLatestRun = DbRepository & {
  analysisRuns: DbAnalysisRun[];
};

export type RepositoriesService = {
  listByClerkId: (clerkId: string) => Promise<Repository[]>;
  createByClerkId: (
    clerkId: string,
    input: CreateRepositoryInput,
    syncFromClerk: () => Promise<UserProfileInput>,
  ) => Promise<Repository>;
  updateByClerkId: (
    clerkId: string,
    id: string,
    input: UpdateRepositoryInput,
  ) => Promise<Repository | null>;
  deleteByClerkId: (clerkId: string, id: string) => Promise<boolean>;
  createAnalysisRunByClerkId: (clerkId: string, repositoryId: string) => Promise<AnalysisRun | null>;
};

type RepositoryMetadataInput = {
  url?: string | null;
  branch?: string | null;
};

async function enrichRepositoryMetadata(input: RepositoryMetadataInput) {
  const metadata = await importGitHubRepositoryMetadata(input.url);
  if (!metadata) {
    return {
      url: input.url ?? null,
      branch: input.branch ?? null,
      provider: null,
      providerRepoId: null,
      providerOwner: null,
      providerName: null,
      defaultBranch: null,
      latestCommitSha: null,
    };
  }

  return {
    url: metadata.url,
    branch: input.branch ?? metadata.defaultBranch,
    provider: "GITHUB" as const,
    providerRepoId: metadata.repoId,
    providerOwner: metadata.owner,
    providerName: metadata.name,
    defaultBranch: metadata.defaultBranch,
    latestCommitSha: metadata.latestCommitSha,
  };
}

function parseFindings(value: unknown): AnalysisRun["findings"] {
  const parsed = analysisRunSchema.shape.findings.safeParse(value);
  return parsed.success ? parsed.data : [];
}

function serializeAnalysisRun(run: DbAnalysisRun): AnalysisRun {
  return analysisRunSchema.parse({
    id: run.id,
    repositoryId: run.repositoryId,
    status: run.status,
    summary: run.summary,
    score: run.score,
    commitSha: run.commitSha,
    branch: run.branch,
    durationMs: run.durationMs,
    criticalCount: run.criticalCount,
    highCount: run.highCount,
    mediumCount: run.mediumCount,
    lowCount: run.lowCount,
    findings: parseFindings(run.findings),
    failureReason: run.failureReason,
    completedAt: run.completedAt?.toISOString() ?? null,
    createdAt: run.createdAt.toISOString(),
    updatedAt: run.updatedAt.toISOString(),
  });
}

function serializeRepository(repository: RepositoryWithLatestRun): Repository {
  return repositorySchema.parse({
    id: repository.id,
    name: repository.name,
    url: repository.url,
    branch: repository.branch,
    provider: repository.provider,
    providerRepoId: repository.providerRepoId,
    providerOwner: repository.providerOwner,
    providerName: repository.providerName,
    defaultBranch: repository.defaultBranch,
    latestCommitSha: repository.latestCommitSha,
    description: repository.description,
    latestAnalysisRun: repository.analysisRuns[0]
      ? serializeAnalysisRun(repository.analysisRuns[0])
      : null,
    createdAt: repository.createdAt.toISOString(),
    updatedAt: repository.updatedAt.toISOString(),
  });
}

const latestRunInclude = {
  analysisRuns: {
    orderBy: { createdAt: "desc" as const },
    take: 1,
  },
};

export async function listRepositoriesByClerkId(clerkId: string): Promise<Repository[]> {
  const repositories = await prisma.repository.findMany({
    where: { owner: { clerkId } },
    orderBy: { updatedAt: "desc" },
    include: latestRunInclude,
  });

  return repositories.map(serializeRepository);
}

export async function createRepositoryByClerkId(
  clerkId: string,
  input: CreateRepositoryInput,
  syncFromClerk: () => Promise<UserProfileInput>,
): Promise<Repository> {
  const owner = await getOrCreateUserByClerkId(clerkId, syncFromClerk);
  const metadata = await enrichRepositoryMetadata(input);

  const repository = await prisma.repository.create({
    data: {
      name: input.name,
      ...metadata,
      description: input.description ?? null,
      ownerId: owner.id,
    },
    include: latestRunInclude,
  });

  return serializeRepository(repository);
}

export async function updateRepositoryByClerkId(
  clerkId: string,
  id: string,
  input: UpdateRepositoryInput,
): Promise<Repository | null> {
  const existing = await prisma.repository.findFirst({
    where: { id, owner: { clerkId } },
  });

  if (!existing) {
    return null;
  }

  const metadata =
    input.url !== undefined || input.branch !== undefined
      ? await enrichRepositoryMetadata({
          url: input.url !== undefined ? input.url : existing.url,
          branch: input.branch !== undefined ? input.branch : existing.branch,
        })
      : null;

  const repository = await prisma.repository.update({
    where: { id: existing.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(metadata ? metadata : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
    },
    include: latestRunInclude,
  });

  return serializeRepository(repository);
}

export async function deleteRepositoryByClerkId(
  clerkId: string,
  id: string,
): Promise<boolean> {
  const result = await prisma.repository.deleteMany({
    where: { id, owner: { clerkId } },
  });

  return result.count > 0;
}

export async function createAnalysisRunByClerkId(
  clerkId: string,
  repositoryId: string,
  analyzer: RepositoryAnalyzer = localRepositoryAnalyzer,
): Promise<AnalysisRun | null> {
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, owner: { clerkId } },
    include: latestRunInclude,
  });

  if (!repository) {
    return null;
  }

  const analysis = await analyzer.analyze(serializeRepository(repository));

  const run = await prisma.analysisRun.create({
    data: {
      repositoryId: repository.id,
      status: "COMPLETED",
      score: analysis.score,
      summary: analysis.summary,
      commitSha: analysis.commitSha,
      branch: analysis.branch,
      durationMs: analysis.durationMs,
      criticalCount: analysis.findings.filter((finding) => finding.severity === "CRITICAL").length,
      highCount: analysis.findings.filter((finding) => finding.severity === "HIGH").length,
      mediumCount: analysis.findings.filter((finding) => finding.severity === "MEDIUM").length,
      lowCount: analysis.findings.filter((finding) => finding.severity === "LOW").length,
      findings: analysis.findings,
      completedAt: new Date(),
    },
  });

  return serializeAnalysisRun(run);
}

export const defaultRepositoriesService: RepositoriesService = {
  listByClerkId: listRepositoriesByClerkId,
  createByClerkId: createRepositoryByClerkId,
  updateByClerkId: updateRepositoryByClerkId,
  deleteByClerkId: deleteRepositoryByClerkId,
  createAnalysisRunByClerkId,
};
