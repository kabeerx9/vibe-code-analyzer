import { useCallback, useEffect, useState } from "react";
import { GitBranch, Pencil, Play, RefreshCw, Trash2 } from "lucide-react";

import { Button } from "@codeaudit/ui/components/button";
import { Input } from "@codeaudit/ui/components/input";
import { Label } from "@codeaudit/ui/components/label";
import { cn } from "@codeaudit/ui/lib/utils";
import type { Repository } from "@codeaudit/contracts";

import { StatusPill } from "@/components/family-primitives";
import {
  ApiError,
  createAnalysisRun,
  createRepository,
  deleteRepository,
  listRepositories,
  updateRepository,
} from "@/lib/api";

type FormState = {
  name: string;
  url: string;
  branch: string;
  description: string;
};

const emptyForm: FormState = { name: "", url: "", branch: "", description: "" };

function toFormState(repository: Repository): FormState {
  return {
    name: repository.name,
    url: repository.url ?? "",
    branch: repository.branch ?? "",
    description: repository.description ?? "",
  };
}

function formatAnalysis(repository: Repository): string {
  const run = repository.latestAnalysisRun;
  if (!run) {
    return "No analysis yet";
  }

  return run.score === null ? run.status : `${run.status} · ${run.score}/100`;
}

function formatSeveritySummary(repository: Repository): string {
  const run = repository.latestAnalysisRun;
  if (!run) {
    return "Run analysis to generate findings";
  }

  return [
    `${run.criticalCount} critical`,
    `${run.highCount} high`,
    `${run.mediumCount} medium`,
    `${run.lowCount} low`,
  ].join(" · ");
}

function getAnalysisTone(repository: Repository): "blue" | "green" | "orange" | "red" {
  const run = repository.latestAnalysisRun;
  if (!run) {
    return "blue";
  }

  if (run.criticalCount > 0 || run.highCount > 0) {
    return "red";
  }

  if (run.mediumCount > 0) {
    return "orange";
  }

  return "green";
}

const actionButtonClass =
  "h-10 gap-2 rounded-full px-4 text-sm font-bold";

export function RepositoriesPanel() {
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [mutating, setMutating] = useState(false);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await listRepositories();
      setRepositories(items);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to load repositories");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRepositories();
  }, [loadRepositories]);

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMutating(true);
    setActionError(null);

    try {
      const created = await createRepository({
        name: createForm.name,
        url: createForm.url || undefined,
        branch: createForm.branch || undefined,
        description: createForm.description || undefined,
      });
      setRepositories((current) => [created, ...current]);
      setCreateForm(emptyForm);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : "Failed to create repository");
    } finally {
      setMutating(false);
    }
  }

  function startEdit(repository: Repository) {
    setEditingId(repository.id);
    setEditForm(toFormState(repository));
    setActionError(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm(emptyForm);
  }

  async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editingId) {
      return;
    }

    setMutating(true);
    setActionError(null);

    try {
      const updated = await updateRepository(editingId, {
        name: editForm.name,
        url: editForm.url,
        branch: editForm.branch,
        description: editForm.description,
      });
      setRepositories((current) =>
        current.map((repository) => (repository.id === updated.id ? updated : repository)),
      );
      cancelEdit();
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update repository");
    } finally {
      setMutating(false);
    }
  }

  async function handleDelete(repository: Repository) {
    if (!window.confirm(`Delete "${repository.name}"? This also removes its analysis history.`)) {
      return;
    }

    setMutating(true);
    setActionError(null);

    try {
      await deleteRepository(repository.id);
      setRepositories((current) => current.filter((item) => item.id !== repository.id));
      if (editingId === repository.id) {
        cancelEdit();
      }
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : "Failed to delete repository");
    } finally {
      setMutating(false);
    }
  }

  async function handleAnalyze(repository: Repository) {
    setAnalyzingId(repository.id);
    setActionError(null);

    try {
      const run = await createAnalysisRun(repository.id);
      setRepositories((current) =>
        current.map((item) =>
          item.id === repository.id ? { ...item, latestAnalysisRun: run } : item,
        ),
      );
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : "Failed to start analysis");
    } finally {
      setAnalyzingId(null);
    }
  }

  return (
    <section className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-blue-deep)]">
            Repositories
          </p>
          <h2 className="mt-1 text-[32px] font-bold leading-[1.08]">Tracked codebases</h2>
          <p className="mt-3 max-w-2xl text-[15px] font-medium leading-[1.7] text-[var(--family-muted)]">
            Register repositories, run analysis, and keep the latest finding summary close to the release flow.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className={cn(actionButtonClass, "border-[var(--family-line)] bg-white")}
          onClick={() => void loadRepositories()}
        >
          <RefreshCw className="size-4" />
          Refresh
        </Button>
      </div>

      <article className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-green)]">
              Add repository
            </p>
            <h3 className="mt-1 text-[20px] font-bold leading-[1.2]">Start a new analysis surface.</h3>
            <p className="mt-3 text-sm font-medium leading-6 text-[var(--family-muted)]">
              Name is required. URL and branch improve metadata and future analysis context.
            </p>
          </div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-name" className="text-sm font-bold">Name</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                disabled={mutating}
                className="border-[var(--family-line)] bg-[var(--family-canvas)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-url" className="text-sm font-bold">Repository URL</Label>
              <Input
                id="create-url"
                type="url"
                value={createForm.url}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, url: event.target.value }))
                }
                disabled={mutating}
                className="border-[var(--family-line)] bg-[var(--family-canvas)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-branch" className="text-sm font-bold">Default branch</Label>
              <Input
                id="create-branch"
                value={createForm.branch}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, branch: event.target.value }))
                }
                disabled={mutating}
                className="border-[var(--family-line)] bg-[var(--family-canvas)]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-description" className="text-sm font-bold">Notes</Label>
              <Input
                id="create-description"
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, description: event.target.value }))
                }
                disabled={mutating}
                className="border-[var(--family-line)] bg-[var(--family-canvas)]"
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={mutating} className={actionButtonClass}>
                {mutating ? "Saving..." : "Add repository"}
              </Button>
            </div>
          </form>
        </div>
      </article>

      {loading ? (
        <div className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
          <p className="text-sm font-bold text-[var(--family-muted)]">Loading repositories...</p>
        </div>
      ) : error ? (
        <div className="rounded-[8px] border border-[var(--family-red)]/25 bg-[var(--family-red)]/10 p-5">
          <p className="text-sm font-bold text-[var(--family-red)]">{error}</p>
          <Button
            className={cn(actionButtonClass, "mt-4 bg-white text-[var(--family-ink)] hover:bg-[var(--family-soft)]")}
            variant="outline"
            onClick={() => void loadRepositories()}
          >
            Retry
          </Button>
        </div>
      ) : repositories.length === 0 ? (
        <div className="rounded-[8px] border border-dashed border-[var(--family-line)] bg-white p-8 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-[var(--family-blue)]/12 text-[var(--family-blue-deep)]">
            <GitBranch className="size-5" />
          </span>
          <p className="mt-4 text-sm font-bold">No repositories tracked yet</p>
          <p className="mt-2 text-sm font-medium text-[var(--family-muted)]">
            Add one above to run the first CodeAudit analysis.
          </p>
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {repositories.map((repository) => (
            <li key={repository.id} className="rounded-[8px] border border-[var(--family-line)] bg-white p-5">
              {editingId === repository.id ? (
                <form className="grid gap-4" onSubmit={handleUpdate}>
                  <div>
                    <p className="text-[12px] font-bold uppercase leading-[1.5] text-[var(--family-orange)]">
                      Edit repository
                    </p>
                    <h3 className="mt-1 text-[20px] font-bold leading-[1.2]">{repository.name}</h3>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`edit-name-${repository.id}`} className="text-sm font-bold">Name</Label>
                      <Input
                        id={`edit-name-${repository.id}`}
                        value={editForm.name}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, name: event.target.value }))
                        }
                        required
                        disabled={mutating}
                        className="border-[var(--family-line)] bg-[var(--family-canvas)]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`edit-url-${repository.id}`} className="text-sm font-bold">Repository URL</Label>
                      <Input
                        id={`edit-url-${repository.id}`}
                        type="url"
                        value={editForm.url}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, url: event.target.value }))
                        }
                        disabled={mutating}
                        className="border-[var(--family-line)] bg-[var(--family-canvas)]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`edit-branch-${repository.id}`} className="text-sm font-bold">Default branch</Label>
                      <Input
                        id={`edit-branch-${repository.id}`}
                        value={editForm.branch}
                        onChange={(event) =>
                          setEditForm((current) => ({ ...current, branch: event.target.value }))
                        }
                        disabled={mutating}
                        className="border-[var(--family-line)] bg-[var(--family-canvas)]"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label htmlFor={`edit-description-${repository.id}`} className="text-sm font-bold">Notes</Label>
                      <Input
                        id={`edit-description-${repository.id}`}
                        value={editForm.description}
                        onChange={(event) =>
                          setEditForm((current) => ({
                            ...current,
                            description: event.target.value,
                          }))
                        }
                        disabled={mutating}
                        className="border-[var(--family-line)] bg-[var(--family-canvas)]"
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button type="submit" disabled={mutating} className={actionButtonClass}>
                      {mutating ? "Saving..." : "Save changes"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={mutating}
                      onClick={cancelEdit}
                      className={cn(actionButtonClass, "border-[var(--family-line)] bg-white")}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-[20px] font-bold leading-[1.2]">{repository.name}</h3>
                      <p className="mt-2 text-sm font-medium leading-6 text-[var(--family-muted)]">
                        {repository.url ?? repository.description ?? "Repository metadata pending"}
                      </p>
                    </div>
                    <StatusPill tone={getAnalysisTone(repository)}>{formatAnalysis(repository)}</StatusPill>
                  </div>

                  <div className="rounded-[8px] bg-[var(--family-canvas)] p-4">
                    <p className="text-xs font-bold uppercase text-[var(--family-muted)]">Findings</p>
                    <p className="mt-2 text-sm font-bold">{formatSeveritySummary(repository)}</p>
                    {repository.latestAnalysisRun?.summary ? (
                      <p className="mt-3 text-sm font-medium leading-6 text-[var(--family-muted)]">
                        {repository.latestAnalysisRun.summary}
                      </p>
                    ) : null}
                  </div>

                  {repository.latestAnalysisRun?.findings.length ? (
                    <ul className="grid gap-2">
                      {repository.latestAnalysisRun.findings.slice(0, 3).map((finding) => (
                        <li
                          key={`${finding.severity}-${finding.title}`}
                          className="rounded-[8px] border border-[var(--family-line)] p-3"
                        >
                          <p className="text-sm font-bold">
                            {finding.severity}: {finding.title}
                          </p>
                          <p className="mt-1 text-sm font-medium leading-6 text-[var(--family-muted)]">
                            {finding.recommendation}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-bold text-[var(--family-muted)]">
                    {repository.providerOwner && repository.providerName ? (
                      <span>GitHub: {repository.providerOwner}/{repository.providerName}</span>
                    ) : null}
                    {repository.latestAnalysisRun?.branch ?? repository.branch ? (
                      <span>
                        Branch: {repository.latestAnalysisRun?.branch ?? repository.defaultBranch ?? repository.branch}
                      </span>
                    ) : null}
                    {repository.latestAnalysisRun?.commitSha ?? repository.latestCommitSha ? (
                      <span>
                        Commit: {(repository.latestAnalysisRun?.commitSha ?? repository.latestCommitSha)?.slice(0, 7)}
                      </span>
                    ) : null}
                    {repository.latestAnalysisRun?.durationMs !== null && repository.latestAnalysisRun?.durationMs !== undefined ? (
                      <span>Duration: {repository.latestAnalysisRun.durationMs}ms</span>
                    ) : null}
                  </div>

                  <div className="flex flex-wrap gap-2 border-t border-[var(--family-line)] pt-4">
                    <Button
                      type="button"
                      disabled={analyzingId === repository.id}
                      onClick={() => void handleAnalyze(repository)}
                      className={actionButtonClass}
                    >
                      <Play className="size-4" />
                      {analyzingId === repository.id ? "Analyzing..." : "Run analysis"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={mutating}
                      onClick={() => startEdit(repository)}
                      className={cn(actionButtonClass, "border-[var(--family-line)] bg-white")}
                    >
                      <Pencil className="size-4" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      disabled={mutating}
                      onClick={() => void handleDelete(repository)}
                      className={actionButtonClass}
                    >
                      <Trash2 className="size-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {actionError ? (
        <div className="rounded-[8px] border border-[var(--family-red)]/25 bg-[var(--family-red)]/10 p-4">
          <p className="text-sm font-bold text-[var(--family-red)]">{actionError}</p>
        </div>
      ) : null}
    </section>
  );
}
