import { useCallback, useEffect, useState } from "react";

import { Button } from "@codeaudit/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@codeaudit/ui/components/card";
import { Input } from "@codeaudit/ui/components/input";
import { Label } from "@codeaudit/ui/components/label";
import type { Repository } from "@codeaudit/contracts";

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
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-heading-sm text-foreground">Repositories</h2>
        <p className="text-sm text-steel">
          Track codebases and run the first CodeAudit analysis workflow.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add repository</CardTitle>
          <CardDescription>Register a codebase to analyze.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreate}>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-name">Name</Label>
              <Input
                id="create-name"
                value={createForm.name}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, name: event.target.value }))
                }
                required
                disabled={mutating}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-url">Repository URL</Label>
              <Input
                id="create-url"
                type="url"
                value={createForm.url}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, url: event.target.value }))
                }
                disabled={mutating}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-branch">Default branch</Label>
              <Input
                id="create-branch"
                value={createForm.branch}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, branch: event.target.value }))
                }
                disabled={mutating}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="create-description">Notes</Label>
              <Input
                id="create-description"
                value={createForm.description}
                onChange={(event) =>
                  setCreateForm((current) => ({ ...current, description: event.target.value }))
                }
                disabled={mutating}
              />
            </div>
            <div className="md:col-span-2">
              <Button type="submit" disabled={mutating}>
                {mutating ? "Saving..." : "Add repository"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading repositories...</p>
      ) : error ? (
        <div className="rounded-lg border border-destructive/30 p-4">
          <p className="text-sm text-destructive">{error}</p>
          <Button className="mt-3" variant="outline" onClick={() => void loadRepositories()}>
            Retry
          </Button>
        </div>
      ) : repositories.length === 0 ? (
        <div className="rounded-lg border p-6 text-center text-sm text-muted-foreground">
          No repositories yet. Add one above to run your first analysis.
        </div>
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {repositories.map((repository) => (
            <li key={repository.id}>
              <Card>
                {editingId === repository.id ? (
                  <>
                    <CardHeader>
                      <CardTitle>Edit repository</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`edit-name-${repository.id}`}>Name</Label>
                          <Input
                            id={`edit-name-${repository.id}`}
                            value={editForm.name}
                            onChange={(event) =>
                              setEditForm((current) => ({ ...current, name: event.target.value }))
                            }
                            required
                            disabled={mutating}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`edit-url-${repository.id}`}>Repository URL</Label>
                          <Input
                            id={`edit-url-${repository.id}`}
                            type="url"
                            value={editForm.url}
                            onChange={(event) =>
                              setEditForm((current) => ({ ...current, url: event.target.value }))
                            }
                            disabled={mutating}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`edit-branch-${repository.id}`}>Default branch</Label>
                          <Input
                            id={`edit-branch-${repository.id}`}
                            value={editForm.branch}
                            onChange={(event) =>
                              setEditForm((current) => ({ ...current, branch: event.target.value }))
                            }
                            disabled={mutating}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`edit-description-${repository.id}`}>Notes</Label>
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
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" disabled={mutating}>
                            {mutating ? "Saving..." : "Save changes"}
                          </Button>
                          <Button type="button" variant="outline" disabled={mutating} onClick={cancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </CardContent>
                  </>
                ) : (
                  <>
                    <CardHeader>
                      <CardTitle>{repository.name}</CardTitle>
                      <CardDescription>
                        {repository.url ?? repository.description ?? "Repository metadata pending"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-3 text-sm">
                      <div className="flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-3">
                        <span className="text-muted-foreground">Latest analysis</span>
                        <span className="font-medium text-foreground">{formatAnalysis(repository)}</span>
                      </div>
                      {repository.latestAnalysisRun?.summary ? (
                        <p className="text-muted-foreground">{repository.latestAnalysisRun.summary}</p>
                      ) : null}
                      <div className="rounded-lg border border-border p-3">
                        <p className="text-xs font-medium uppercase text-muted-foreground">
                          Findings
                        </p>
                        <p className="mt-1 text-foreground">{formatSeveritySummary(repository)}</p>
                      </div>
                      {repository.latestAnalysisRun?.findings.length ? (
                        <ul className="flex flex-col gap-2">
                          {repository.latestAnalysisRun.findings.slice(0, 3).map((finding) => (
                            <li key={`${finding.severity}-${finding.title}`} className="rounded-lg border border-border p-3">
                              <p className="font-medium text-foreground">
                                {finding.severity}: {finding.title}
                              </p>
                              <p className="mt-1 text-muted-foreground">{finding.recommendation}</p>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-muted-foreground">
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
                    </CardContent>
                    <CardFooter className="gap-2">
                      <Button
                        type="button"
                        disabled={analyzingId === repository.id}
                        onClick={() => void handleAnalyze(repository)}
                      >
                        {analyzingId === repository.id ? "Analyzing..." : "Run analysis"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={mutating}
                        onClick={() => startEdit(repository)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="destructive"
                        disabled={mutating}
                        onClick={() => void handleDelete(repository)}
                      >
                        Delete
                      </Button>
                    </CardFooter>
                  </>
                )}
              </Card>
            </li>
          ))}
        </ul>
      )}

      {actionError ? <p className="text-sm text-destructive">{actionError}</p> : null}
    </section>
  );
}
