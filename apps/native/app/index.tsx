import { useAuth, useUser } from "@clerk/expo";
import { Link, Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

import { SignOutButton } from "@/components/sign-out-button";
import { ExampleProjectsPanel } from "@/components/example-projects";
import { ApiError, getMe, type MeResponse } from "@/lib/api";

export default function Home() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [me, setMe] = useState<MeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSignedIn) {
      return;
    }

    getMe()
      .then(setMe)
      .catch((err: unknown) => {
        setError(err instanceof ApiError ? err.message : "Failed to load account");
      });
  }, [isSignedIn]);

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const name = user?.fullName || user?.firstName || "there";

  return (
    <View style={styles.container}>
      <Text style={styles.title}>App Starter</Text>
      <Text style={styles.subtitle}>Welcome, {name}</Text>
      <View style={styles.accountCard}>
        <Text style={styles.accountLabel}>Signed-in account</Text>
        <Text style={styles.accountValue}>{me?.email ?? "Loading..."}</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
      </View>
      <ExampleProjectsPanel />
      <Link href="/account" style={styles.accountLink}>
        <Text style={styles.accountLinkText}>Account</Text>
      </Link>
      <SignOutButton />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
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
  accountCard: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 12,
    padding: 16,
    gap: 4,
  },
  accountLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  accountValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  errorText: {
    marginTop: 8,
    color: "#dc2626",
    fontSize: 14,
  },
  accountLink: {
    alignSelf: "flex-start",
  },
  accountLinkText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2563eb",
  },
});
