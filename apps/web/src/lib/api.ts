import {
  ApiError,
  createApiClient,
  createRepositoryInputSchema,
  deleteAccountInputSchema,
  analysisRunSchema,
  meResponseSchema,
  repositoryListSchema,
  repositorySchema,
  updateAccountInputSchema,
  updateRepositoryInputSchema,
  type AnalysisRun,
  type CreateRepositoryInput,
  type DeleteAccountInput,
  type MeResponse,
  type Repository,
  type UpdateAccountInput,
  type UpdateRepositoryInput,
} from "@codeaudit/contracts";
import { env } from "@codeaudit/env/web";

import { getClerkAuthToken } from "@/utils/clerk-auth";

export type {
  AnalysisRun,
  CreateRepositoryInput,
  DeleteAccountInput,
  MeResponse,
  Repository,
  UpdateAccountInput,
  UpdateRepositoryInput,
};
export { ApiError };

const api = createApiClient({
  baseUrl: env.VITE_SERVER_URL,
  getToken: getClerkAuthToken,
  credentials: "include",
});

export function getMe() {
  return api.requestJson("/api/me", meResponseSchema);
}

export function updateAccount(input: UpdateAccountInput) {
  const body = updateAccountInputSchema.parse(input);
  return api.requestJson("/api/account", meResponseSchema, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAccount(input: DeleteAccountInput) {
  const body = deleteAccountInputSchema.parse(input);
  return api.requestVoid("/api/account", {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}

export function listRepositories() {
  return api.requestJson("/api/repositories", repositoryListSchema);
}

export function createRepository(input: CreateRepositoryInput) {
  const body = createRepositoryInputSchema.parse(input);
  return api.requestJson("/api/repositories", repositorySchema, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateRepository(id: string, input: UpdateRepositoryInput) {
  const body = updateRepositoryInputSchema.parse(input);
  return api.requestJson(`/api/repositories/${id}`, repositorySchema, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteRepository(id: string) {
  return api.requestVoid(`/api/repositories/${id}`, {
    method: "DELETE",
  });
}

export function createAnalysisRun(repositoryId: string) {
  return api.requestJson(`/api/repositories/${repositoryId}/analysis-runs`, analysisRunSchema, {
    method: "POST",
  });
}
