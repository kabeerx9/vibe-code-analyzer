import { clerkClient, getAuth } from "@clerk/fastify";
import {
  analysisRunSchema,
  createRepositoryInputSchema,
  repositoryIdParamsSchema,
  repositoryListSchema,
  repositorySchema,
  updateRepositoryInputSchema,
} from "@codeaudit/contracts/repositories";
import type { FastifyInstance, FastifyRequest } from "fastify";

import {
  defaultRepositoriesService,
  type RepositoriesService,
} from "@/services/repositories";
import { mapClerkApiUser } from "@/services/user";

export type RepositoriesRouteDeps = {
  getAuth: (request: FastifyRequest) => { userId: string | null | undefined };
  service: RepositoriesService;
  syncFromClerk: (userId: string) => Promise<ReturnType<typeof mapClerkApiUser>>;
};

const defaultDeps: RepositoriesRouteDeps = {
  getAuth,
  service: defaultRepositoriesService,
  syncFromClerk: async (userId) => {
    const clerkUser = await clerkClient.users.getUser(userId);
    return mapClerkApiUser(clerkUser);
  },
};

function invalidInputMessage(error: { issues: Array<{ message: string }> }): string {
  return error.issues[0]?.message ?? "Invalid input";
}

export async function registerRepositoriesRoutes(
  fastify: FastifyInstance,
  deps: Partial<RepositoriesRouteDeps> = {},
) {
  const { getAuth: getAuthFn, service, syncFromClerk } = { ...defaultDeps, ...deps };

  fastify.get("/api/repositories", async (request, reply) => {
    const { userId } = getAuthFn(request);

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const items = await service.listByClerkId(userId);
    return repositoryListSchema.parse(items);
  });

  fastify.post("/api/repositories", async (request, reply) => {
    const { userId } = getAuthFn(request);

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const parsed = createRepositoryInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: invalidInputMessage(parsed.error) });
    }

    const repository = await service.createByClerkId(userId, parsed.data, () =>
      syncFromClerk(userId),
    );

    return reply.code(201).send(repositorySchema.parse(repository));
  });

  fastify.patch("/api/repositories/:id", async (request, reply) => {
    const { userId } = getAuthFn(request);

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const params = repositoryIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ error: invalidInputMessage(params.error) });
    }

    const parsed = updateRepositoryInputSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: invalidInputMessage(parsed.error) });
    }

    const repository = await service.updateByClerkId(userId, params.data.id, parsed.data);
    if (!repository) {
      return reply.code(404).send({ error: "Not found" });
    }

    return repositorySchema.parse(repository);
  });

  fastify.delete("/api/repositories/:id", async (request, reply) => {
    const { userId } = getAuthFn(request);

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const params = repositoryIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ error: invalidInputMessage(params.error) });
    }

    const deleted = await service.deleteByClerkId(userId, params.data.id);
    if (!deleted) {
      return reply.code(404).send({ error: "Not found" });
    }

    return reply.code(204).send();
  });

  fastify.post("/api/repositories/:id/analysis-runs", async (request, reply) => {
    const { userId } = getAuthFn(request);

    if (!userId) {
      return reply.code(401).send({ error: "Unauthorized" });
    }

    const params = repositoryIdParamsSchema.safeParse(request.params);
    if (!params.success) {
      return reply.code(400).send({ error: invalidInputMessage(params.error) });
    }

    const run = await service.createAnalysisRunByClerkId(userId, params.data.id);
    if (!run) {
      return reply.code(404).send({ error: "Not found" });
    }

    return reply.code(201).send(analysisRunSchema.parse(run));
  });
}
