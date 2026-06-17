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

function serializeAnalysisRun(run: DbAnalysisRun): AnalysisRun {
  return analysisRunSchema.parse({
    id: run.id,
    repositoryId: run.repositoryId,
    status: run.status,
    summary: run.summary,
    score: run.score,
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

  const repository = await prisma.repository.create({
    data: {
      name: input.name,
      url: input.url ?? null,
      branch: input.branch ?? null,
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

  const repository = await prisma.repository.update({
    where: { id: existing.id },
    data: {
      ...(input.name !== undefined ? { name: input.name } : {}),
      ...(input.url !== undefined ? { url: input.url } : {}),
      ...(input.branch !== undefined ? { branch: input.branch } : {}),
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
): Promise<AnalysisRun | null> {
  const repository = await prisma.repository.findFirst({
    where: { id: repositoryId, owner: { clerkId } },
  });

  if (!repository) {
    return null;
  }

  const run = await prisma.analysisRun.create({
    data: {
      repositoryId: repository.id,
      status: "COMPLETED",
      score: 82,
      summary: `Initial analysis completed for ${repository.name}. Connect a scanner provider to replace this stub result.`,
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
