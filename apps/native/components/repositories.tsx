import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { Repository } from "@codeaudit/contracts";

import {
  ApiError,
  createAnalysisRun,
  createRepository,
  deleteRepository,
  listRepositories,
  updateRepository,
} from "@/lib/api";
import { colors } from "@codeaudit/ui/theme/tokens";
import { sharedStyles } from "@/lib/theme";

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

  async function handleCreate() {
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

  async function handleUpdate() {
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

  function confirmDelete(repository: Repository) {
    Alert.alert(
      "Delete repository",
      `Delete "${repository.name}"? This also removes its analysis history.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void handleDelete(repository);
          },
        },
      ],
    );
  }

  async function handleDelete(repository: Repository) {
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
    <View style={{ gap: 12 }}>
      <Text style={sharedStyles.headingSm}>Repositories</Text>
      <Text style={sharedStyles.muted}>
        Track codebases and run the first CodeAudit analysis workflow.
      </Text>

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.cardTitle}>Add repository</Text>
        <Text style={sharedStyles.label}>Name</Text>
        <TextInput
          style={sharedStyles.input}
          value={createForm.name}
          onChangeText={(name) => setCreateForm((current) => ({ ...current, name }))}
          editable={!mutating}
          placeholderTextColor={colors.stone}
          accessibilityLabel="Repository name"
        />
        <Text style={sharedStyles.label}>Repository URL</Text>
        <TextInput
          style={sharedStyles.input}
          value={createForm.url}
          onChangeText={(url) => setCreateForm((current) => ({ ...current, url }))}
          editable={!mutating}
          placeholderTextColor={colors.stone}
          accessibilityLabel="Repository URL"
          autoCapitalize="none"
          keyboardType="url"
        />
        <Text style={sharedStyles.label}>Default branch</Text>
        <TextInput
          style={sharedStyles.input}
          value={createForm.branch}
          onChangeText={(branch) => setCreateForm((current) => ({ ...current, branch }))}
          editable={!mutating}
          placeholderTextColor={colors.stone}
          accessibilityLabel="Default branch"
          autoCapitalize="none"
        />
        <Text style={sharedStyles.label}>Notes</Text>
        <TextInput
          style={sharedStyles.input}
          value={createForm.description}
          onChangeText={(description) => setCreateForm((current) => ({ ...current, description }))}
          editable={!mutating}
          placeholderTextColor={colors.stone}
          accessibilityLabel="Repository notes"
        />
        <Pressable
          style={[sharedStyles.buttonPrimary, mutating && sharedStyles.buttonDisabled]}
          disabled={mutating}
          onPress={() => void handleCreate()}
        >
          <Text style={sharedStyles.buttonPrimaryText}>
            {mutating ? "Saving..." : "Add repository"}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={sharedStyles.row}>
          <ActivityIndicator color={colors.primary} />
          <Text style={sharedStyles.muted}>Loading repositories...</Text>
        </View>
      ) : error ? (
        <View style={[sharedStyles.card, { borderColor: colors.error }]}>
          <Text style={sharedStyles.errorText}>{error}</Text>
          <Pressable style={sharedStyles.buttonOutline} onPress={() => void loadRepositories()}>
            <Text style={sharedStyles.buttonOutlineText}>Retry</Text>
          </Pressable>
        </View>
      ) : repositories.length === 0 ? (
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.muted}>
            No repositories yet. Add one above to run your first analysis.
          </Text>
        </View>
      ) : (
        repositories.map((repository) => (
          <View key={repository.id} style={sharedStyles.card}>
            {editingId === repository.id ? (
              <>
                <Text style={sharedStyles.cardTitle}>Edit repository</Text>
                <Text style={sharedStyles.label}>Name</Text>
                <TextInput
                  style={sharedStyles.input}
                  value={editForm.name}
                  onChangeText={(name) => setEditForm((current) => ({ ...current, name }))}
                  editable={!mutating}
                  placeholderTextColor={colors.stone}
                  accessibilityLabel="Edit repository name"
                />
                <Text style={sharedStyles.label}>Repository URL</Text>
                <TextInput
                  style={sharedStyles.input}
                  value={editForm.url}
                  onChangeText={(url) => setEditForm((current) => ({ ...current, url }))}
                  editable={!mutating}
                  placeholderTextColor={colors.stone}
                  accessibilityLabel="Edit repository URL"
                  autoCapitalize="none"
                  keyboardType="url"
                />
                <Text style={sharedStyles.label}>Default branch</Text>
                <TextInput
                  style={sharedStyles.input}
                  value={editForm.branch}
                  onChangeText={(branch) => setEditForm((current) => ({ ...current, branch }))}
                  editable={!mutating}
                  placeholderTextColor={colors.stone}
                  accessibilityLabel="Edit default branch"
                  autoCapitalize="none"
                />
                <Text style={sharedStyles.label}>Notes</Text>
                <TextInput
                  style={sharedStyles.input}
                  value={editForm.description}
                  onChangeText={(description) =>
                    setEditForm((current) => ({ ...current, description }))
                  }
                  editable={!mutating}
                  placeholderTextColor={colors.stone}
                  accessibilityLabel="Edit repository notes"
                />
                <View style={sharedStyles.row}>
                  <Pressable
                    style={[sharedStyles.buttonPrimary, mutating && sharedStyles.buttonDisabled]}
                    disabled={mutating}
                    onPress={() => void handleUpdate()}
                  >
                    <Text style={sharedStyles.buttonPrimaryText}>
                      {mutating ? "Saving..." : "Save changes"}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[sharedStyles.buttonOutline, mutating && sharedStyles.buttonDisabled]}
                    disabled={mutating}
                    onPress={cancelEdit}
                  >
                    <Text style={sharedStyles.buttonOutlineText}>Cancel</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={sharedStyles.cardTitle}>{repository.name}</Text>
                <Text style={sharedStyles.muted}>
                  {repository.url ?? repository.description ?? "Repository metadata pending"}
                </Text>
                <Text style={sharedStyles.label}>Latest analysis</Text>
                <Text style={sharedStyles.cardTitle}>{formatAnalysis(repository)}</Text>
                {repository.latestAnalysisRun?.summary ? (
                  <Text style={sharedStyles.muted}>{repository.latestAnalysisRun.summary}</Text>
                ) : null}
                <Text style={sharedStyles.label}>Findings</Text>
                <Text style={sharedStyles.muted}>{formatSeveritySummary(repository)}</Text>
                {repository.latestAnalysisRun?.findings.length ? (
                  repository.latestAnalysisRun.findings.slice(0, 3).map((finding) => (
                    <View key={`${finding.severity}-${finding.title}`} style={sharedStyles.cardSurface}>
                      <Text style={sharedStyles.cardTitle}>
                        {finding.severity}: {finding.title}
                      </Text>
                      <Text style={sharedStyles.muted}>{finding.recommendation}</Text>
                    </View>
                  ))
                ) : null}
                {repository.providerOwner && repository.providerName ? (
                  <Text style={sharedStyles.muted}>
                    GitHub: {repository.providerOwner}/{repository.providerName}
                  </Text>
                ) : null}
                {repository.latestAnalysisRun?.branch ?? repository.branch ? (
                  <Text style={sharedStyles.muted}>
                    Branch: {repository.latestAnalysisRun?.branch ?? repository.defaultBranch ?? repository.branch}
                  </Text>
                ) : null}
                {repository.latestAnalysisRun?.commitSha ?? repository.latestCommitSha ? (
                  <Text style={sharedStyles.muted}>
                    Commit: {(repository.latestAnalysisRun?.commitSha ?? repository.latestCommitSha)?.slice(0, 7)}
                  </Text>
                ) : null}
                {repository.latestAnalysisRun?.durationMs !== null && repository.latestAnalysisRun?.durationMs !== undefined ? (
                  <Text style={sharedStyles.muted}>
                    Duration: {repository.latestAnalysisRun.durationMs}ms
                  </Text>
                ) : null}
                <View style={sharedStyles.row}>
                  <Pressable
                    style={[sharedStyles.buttonPrimary, analyzingId === repository.id && sharedStyles.buttonDisabled]}
                    disabled={analyzingId === repository.id}
                    onPress={() => void handleAnalyze(repository)}
                  >
                    <Text style={sharedStyles.buttonPrimaryText}>
                      {analyzingId === repository.id ? "Analyzing..." : "Run analysis"}
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[sharedStyles.buttonOutline, mutating && sharedStyles.buttonDisabled]}
                    disabled={mutating}
                    onPress={() => startEdit(repository)}
                  >
                    <Text style={sharedStyles.buttonOutlineText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[
                      sharedStyles.buttonPrimary,
                      { backgroundColor: colors.error },
                      mutating && sharedStyles.buttonDisabled,
                    ]}
                    disabled={mutating}
                    onPress={() => confirmDelete(repository)}
                  >
                    <Text style={sharedStyles.buttonPrimaryText}>Delete</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ))
      )}

      {actionError ? <Text style={sharedStyles.errorText}>{actionError}</Text> : null}
    </View>
  );
}
