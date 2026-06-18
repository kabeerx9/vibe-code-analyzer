import { z } from "zod";

const trimmedNameSchema = z.string().trim().min(1, "Name is required").max(100, "Name is too long");

const optionalUrlSchema = z
  .string()
  .trim()
  .max(500, "Repository URL is too long")
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional()
  .refine((value) => value === undefined || value === null || z.url().safeParse(value).success, {
    message: "Repository URL must be valid",
  });

const optionalBranchSchema = z
  .string()
  .trim()
  .max(100, "Branch is too long")
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

const optionalDescriptionSchema = z
  .string()
  .trim()
  .max(1000, "Description is too long")
  .transform((value) => (value === "" ? null : value))
  .nullable()
  .optional();

export const analysisStatusSchema = z.enum(["PENDING", "RUNNING", "COMPLETED", "FAILED"]);
export const repositoryProviderSchema = z.enum(["GITHUB"]);

export const analysisSeveritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

export const analysisFindingSchema = z
  .object({
    severity: analysisSeveritySchema,
    title: z.string(),
    description: z.string(),
    path: z.string().nullable(),
    recommendation: z.string(),
  })
  .strict();

export const analysisRunSchema = z
  .object({
    id: z.string(),
    repositoryId: z.string(),
    status: analysisStatusSchema,
    summary: z.string().nullable(),
    score: z.number().int().min(0).max(100).nullable(),
    commitSha: z.string().nullable(),
    branch: z.string().nullable(),
    durationMs: z.number().int().nonnegative().nullable(),
    criticalCount: z.number().int().nonnegative(),
    highCount: z.number().int().nonnegative(),
    mediumCount: z.number().int().nonnegative(),
    lowCount: z.number().int().nonnegative(),
    findings: z.array(analysisFindingSchema),
    failureReason: z.string().nullable(),
    completedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const repositorySchema = z
  .object({
    id: z.string(),
    name: z.string(),
    url: z.string().nullable(),
    branch: z.string().nullable(),
    provider: repositoryProviderSchema.nullable(),
    providerRepoId: z.string().nullable(),
    providerOwner: z.string().nullable(),
    providerName: z.string().nullable(),
    defaultBranch: z.string().nullable(),
    latestCommitSha: z.string().nullable(),
    description: z.string().nullable(),
    latestAnalysisRun: analysisRunSchema.nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
  })
  .strict();

export const repositoryListSchema = z.array(repositorySchema);

export const createRepositoryInputSchema = z.object({
  name: trimmedNameSchema,
  url: optionalUrlSchema,
  branch: optionalBranchSchema,
  description: optionalDescriptionSchema,
});

export const updateRepositoryInputSchema = z
  .object({
    name: trimmedNameSchema.optional(),
    url: optionalUrlSchema,
    branch: optionalBranchSchema,
    description: optionalDescriptionSchema,
  })
  .refine(
    (data) =>
      data.name !== undefined ||
      data.url !== undefined ||
      data.branch !== undefined ||
      data.description !== undefined,
    {
      message: "At least one field must be provided",
    },
  );

export const repositoryIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type AnalysisStatus = z.infer<typeof analysisStatusSchema>;
export type RepositoryProvider = z.infer<typeof repositoryProviderSchema>;
export type AnalysisSeverity = z.infer<typeof analysisSeveritySchema>;
export type AnalysisFinding = z.infer<typeof analysisFindingSchema>;
export type AnalysisRun = z.infer<typeof analysisRunSchema>;
export type Repository = z.infer<typeof repositorySchema>;
export type RepositoryList = z.infer<typeof repositoryListSchema>;
export type CreateRepositoryInput = z.infer<typeof createRepositoryInputSchema>;
export type UpdateRepositoryInput = z.infer<typeof updateRepositoryInputSchema>;
export type RepositoryIdParams = z.infer<typeof repositoryIdParamsSchema>;
