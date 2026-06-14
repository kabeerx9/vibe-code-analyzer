import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ExampleProject } from "@app-starter/contracts";

import {
  ApiError,
  createExampleProject,
  deleteExampleProject,
  listExampleProjects,
  updateExampleProject,
} from "@/lib/api";

type FormState = {
  name: string;
  description: string;
};

const emptyForm: FormState = { name: "", description: "" };

export function ExampleProjectsPanel() {
  const [projects, setProjects] = useState<ExampleProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createForm, setCreateForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormState>(emptyForm);
  const [mutating, setMutating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const items = await listExampleProjects();
      setProjects(items);
    } catch (err: unknown) {
      setError(err instanceof ApiError ? err.message : "Failed to load example projects");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  async function handleCreate() {
    setMutating(true);
    setActionError(null);

    try {
      const created = await createExampleProject({
        name: createForm.name,
        description: createForm.description || undefined,
      });
      setProjects((current) => [created, ...current]);
      setCreateForm(emptyForm);
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : "Failed to create project");
    } finally {
      setMutating(false);
    }
  }

  function startEdit(project: ExampleProject) {
    setEditingId(project.id);
    setEditForm({
      name: project.name,
      description: project.description ?? "",
    });
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
      const updated = await updateExampleProject(editingId, {
        name: editForm.name,
        description: editForm.description,
      });
      setProjects((current) =>
        current.map((project) => (project.id === updated.id ? updated : project)),
      );
      cancelEdit();
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : "Failed to update project");
    } finally {
      setMutating(false);
    }
  }

  function confirmDelete(project: ExampleProject) {
    Alert.alert(
      "Delete project",
      `Delete "${project.name}"? This cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void handleDelete(project);
          },
        },
      ],
    );
  }

  async function handleDelete(project: ExampleProject) {
    setMutating(true);
    setActionError(null);

    try {
      await deleteExampleProject(project.id);
      setProjects((current) => current.filter((item) => item.id !== project.id));
      if (editingId === project.id) {
        cancelEdit();
      }
    } catch (err: unknown) {
      setActionError(err instanceof ApiError ? err.message : "Failed to delete project");
    } finally {
      setMutating(false);
    }
  }

  return (
    <View style={styles.section}>
      <Text style={styles.heading}>Example projects</Text>
      <Text style={styles.subheading}>
        Reference CRUD flow. Remove this panel when you add your product domain.
      </Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Create project</Text>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={createForm.name}
          onChangeText={(name) => setCreateForm((current) => ({ ...current, name }))}
          editable={!mutating}
          accessibilityLabel="Project name"
        />
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={createForm.description}
          onChangeText={(description) => setCreateForm((current) => ({ ...current, description }))}
          editable={!mutating}
          accessibilityLabel="Project description"
        />
        <Pressable
          style={[styles.button, mutating && styles.buttonDisabled]}
          disabled={mutating}
          onPress={() => void handleCreate()}
        >
          <Text style={styles.buttonText}>{mutating ? "Saving..." : "Create project"}</Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={styles.centeredRow}>
          <ActivityIndicator />
          <Text style={styles.mutedText}>Loading projects...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable style={styles.secondaryButton} onPress={() => void loadProjects()}>
            <Text style={styles.secondaryButtonText}>Retry</Text>
          </Pressable>
        </View>
      ) : projects.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.mutedText}>
            No example projects yet. Create one above to try the authenticated CRUD flow.
          </Text>
        </View>
      ) : (
        projects.map((project) => (
          <View key={project.id} style={styles.card}>
            {editingId === project.id ? (
              <>
                <Text style={styles.cardTitle}>Edit project</Text>
                <Text style={styles.label}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(name) => setEditForm((current) => ({ ...current, name }))}
                  editable={!mutating}
                  accessibilityLabel="Edit project name"
                />
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.description}
                  onChangeText={(description) =>
                    setEditForm((current) => ({ ...current, description }))
                  }
                  editable={!mutating}
                  accessibilityLabel="Edit project description"
                />
                <View style={styles.row}>
                  <Pressable
                    style={[styles.button, mutating && styles.buttonDisabled]}
                    disabled={mutating}
                    onPress={() => void handleUpdate()}
                  >
                    <Text style={styles.buttonText}>{mutating ? "Saving..." : "Save changes"}</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.secondaryButton, mutating && styles.buttonDisabled]}
                    disabled={mutating}
                    onPress={cancelEdit}
                  >
                    <Text style={styles.secondaryButtonText}>Cancel</Text>
                  </Pressable>
                </View>
              </>
            ) : (
              <>
                <Text style={styles.cardTitle}>{project.name}</Text>
                <Text style={styles.mutedText}>{project.description ?? "No description"}</Text>
                <View style={styles.row}>
                  <Pressable
                    style={[styles.secondaryButton, mutating && styles.buttonDisabled]}
                    disabled={mutating}
                    onPress={() => startEdit(project)}
                  >
                    <Text style={styles.secondaryButtonText}>Edit</Text>
                  </Pressable>
                  <Pressable
                    style={[styles.destructiveButton, mutating && styles.buttonDisabled]}
                    disabled={mutating}
                    onPress={() => confirmDelete(project)}
                  >
                    <Text style={styles.destructiveButtonText}>Delete</Text>
                  </Pressable>
                </View>
              </>
            )}
          </View>
        ))
      )}

      {actionError ? <Text style={styles.errorText}>{actionError}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "700",
  },
  subheading: {
    fontSize: 14,
    opacity: 0.7,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontWeight: "600",
  },
  destructiveButton: {
    backgroundColor: "#fee2e2",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: "center",
  },
  destructiveButtonText: {
    color: "#b91c1c",
    fontWeight: "600",
  },
  row: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  centeredRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  mutedText: {
    fontSize: 14,
    opacity: 0.7,
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
});
