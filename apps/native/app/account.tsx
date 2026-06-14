import { useClerk, useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ApiError, deleteAccount, updateAccount } from "@/lib/api";

export default function AccountScreen() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
  }, [user]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateAccount({ firstName, lastName });
      await user?.reload();
      setSaveSuccess(true);
    } catch (err: unknown) {
      setSaveError(err instanceof ApiError ? err.message : "Failed to update account");
    } finally {
      setSaving(false);
    }
  }

  async function performDelete() {
    setDeleting(true);
    setDeleteError(null);

    try {
      await deleteAccount({ confirmation: "DELETE" });
      await signOut();
      router.replace("/sign-in");
    } catch (err: unknown) {
      setDeleteError(err instanceof ApiError ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
    }
  }

  function handleDeletePress() {
    Alert.alert(
      "Delete account",
      "This permanently deletes your Clerk identity and local account data.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => void performDelete(),
        },
      ],
    );
  }

  const canDelete = deleteConfirmation === "DELETE";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Account</Text>
      <Text style={styles.subtitle}>Update your profile or delete your account.</Text>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Profile</Text>
        <Text style={styles.sectionDescription}>
          Changes are saved through the server and synced to Clerk.
        </Text>
        <Text style={styles.label}>First name</Text>
        <TextInput
          style={styles.input}
          value={firstName}
          onChangeText={setFirstName}
          autoCapitalize="words"
        />
        <Text style={styles.label}>Last name</Text>
        <TextInput
          style={styles.input}
          value={lastName}
          onChangeText={setLastName}
          autoCapitalize="words"
        />
        {saveError ? <Text style={styles.errorText}>{saveError}</Text> : null}
        {saveSuccess ? <Text style={styles.successText}>Profile updated.</Text> : null}
        <Pressable
          style={[styles.button, saving && styles.buttonDisabled]}
          disabled={saving}
          onPress={() => void handleSave()}
        >
          <Text style={styles.buttonText}>{saving ? "Saving..." : "Save changes"}</Text>
        </Pressable>
      </View>

      <View style={[styles.card, styles.dangerCard]}>
        <Text style={styles.dangerTitle}>Delete account</Text>
        <Text style={styles.sectionDescription}>
          This permanently deletes your Clerk identity and local account data.
        </Text>
        <Text style={styles.label}>Type DELETE to confirm</Text>
        <TextInput
          style={styles.input}
          value={deleteConfirmation}
          onChangeText={setDeleteConfirmation}
          placeholder="DELETE"
          autoCapitalize="characters"
        />
        {deleteError ? <Text style={styles.errorText}>{deleteError}</Text> : null}
        <Pressable
          style={[styles.dangerButton, (!canDelete || deleting) && styles.buttonDisabled]}
          disabled={!canDelete || deleting}
          onPress={handleDeletePress}
        >
          <Text style={styles.dangerButtonText}>
            {deleting ? "Deleting..." : "Delete account"}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  card: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    gap: 8,
  },
  dangerCard: {
    borderColor: "#dc2626",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  sectionDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
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
    marginTop: 8,
    backgroundColor: "#111827",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  dangerButton: {
    marginTop: 8,
    backgroundColor: "#dc2626",
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
  dangerButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
  },
  successText: {
    color: "#16a34a",
    fontSize: 14,
  },
});
