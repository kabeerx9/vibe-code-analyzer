import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import type { ExampleProject } from "@codeaudit/contracts";

import {
  ApiError,
  createExampleProject,
  deleteExampleProject,
  listExampleProjects,
  updateExampleProject,
} from "@/lib/api";
import { colors } from "@codeaudit/ui/theme/tokens";
import { sharedStyles } from "@/lib/theme";

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
    <View style={{ gap: 12 }}>
      <Text style={sharedStyles.headingSm}>Example projects</Text>
      <Text style={sharedStyles.muted}>
        Reference CRUD flow. Remove this panel when you add your product domain.
      </Text>

      <View style={sharedStyles.card}>
        <Text style={sharedStyles.cardTitle}>Create project</Text>
        <Text style={sharedStyles.label}>Name</Text>
        <TextInput
          style={sharedStyles.input}
          value={createForm.name}
          onChangeText={(name) => setCreateForm((current) => ({ ...current, name }))}
          editable={!mutating}
          placeholderTextColor={colors.stone}
          accessibilityLabel="Project name"
        />
        <Text style={sharedStyles.label}>Description</Text>
        <TextInput
          style={sharedStyles.input}
          value={createForm.description}
          onChangeText={(description) => setCreateForm((current) => ({ ...current, description }))}
          editable={!mutating}
          placeholderTextColor={colors.stone}
          accessibilityLabel="Project description"
        />
        <Pressable
          style={[sharedStyles.buttonPrimary, mutating && sharedStyles.buttonDisabled]}
          disabled={mutating}
          onPress={() => void handleCreate()}
        >
          <Text style={sharedStyles.buttonPrimaryText}>
            {mutating ? "Saving..." : "Create project"}
          </Text>
        </Pressable>
      </View>

      {loading ? (
        <View style={sharedStyles.row}>
          <ActivityIndicator color={colors.primary} />
          <Text style={sharedStyles.muted}>Loading projects...</Text>
        </View>
      ) : error ? (
        <View style={[sharedStyles.card, { borderColor: colors.error }]}>
          <Text style={sharedStyles.errorText}>{error}</Text>
          <Pressable style={sharedStyles.buttonOutline} onPress={() => void loadProjects()}>
            <Text style={sharedStyles.buttonOutlineText}>Retry</Text>
          </Pressable>
        </View>
      ) : projects.length === 0 ? (
        <View style={sharedStyles.card}>
          <Text style={sharedStyles.muted}>
            No example projects yet. Create one above to try the authenticated CRUD flow.
          </Text>
        </View>
      ) : (
        projects.map((project) => (
          <View key={project.id} style={sharedStyles.card}>
            {editingId === project.id ? (
              <>
                <Text style={sharedStyles.cardTitle}>Edit project</Text>
                <Text style={sharedStyles.label}>Name</Text>
                <TextInput
                  style={sharedStyles.input}
                  value={editForm.name}
                  onChangeText={(name) => setEditForm((current) => ({ ...current, name }))}
                  editable={!mutating}
                  placeholderTextColor={colors.stone}
                  accessibilityLabel="Edit project name"
                />
                <Text style={sharedStyles.label}>Description</Text>
                <TextInput
                  style={sharedStyles.input}
                  value={editForm.description}
                  onChangeText={(description) =>
                    setEditForm((current) => ({ ...current, description }))
                  }
                  editable={!mutating}
                  placeholderTextColor={colors.stone}
                  accessibilityLabel="Edit project description"
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
                <Text style={sharedStyles.cardTitle}>{project.name}</Text>
                <Text style={sharedStyles.muted}>{project.description ?? "No description"}</Text>
                <View style={sharedStyles.row}>
                  <Pressable
                    style={[sharedStyles.buttonOutline, mutating && sharedStyles.buttonDisabled]}
                    disabled={mutating}
                    onPress={() => startEdit(project)}
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
                    onPress={() => confirmDelete(project)}
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
