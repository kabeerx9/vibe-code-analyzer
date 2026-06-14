import { useAuth, useUser } from "@clerk/expo";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";

import { SignOutButton } from "@/components/sign-out-button";
import { ExampleProjectsPanel } from "@/components/example-projects";
import { ApiError, getMe, type MeResponse } from "@/lib/api";
import { colors } from "@codeaudit/ui/theme/tokens";
import { sharedStyles } from "@/lib/theme";

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
      <View style={sharedStyles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/sign-in" />;
  }

  const name = user?.fullName || user?.firstName || "there";

  return (
    <ScrollView style={sharedStyles.screen} contentContainerStyle={{ padding: 24, gap: 24 }}>
      <View style={{ gap: 8 }}>
        <Text style={sharedStyles.headingLg}>Welcome back, {name}</Text>
        <Text style={sharedStyles.subtitle}>Your AI-powered code analysis workspace.</Text>
      </View>

      <View style={{ gap: 12 }}>
        <View style={sharedStyles.productCardCoral}>
          <Text style={sharedStyles.productCardText}>Analyze</Text>
          <Text style={sharedStyles.productCardSubtext}>Deep code intelligence</Text>
        </View>
        <View style={sharedStyles.productCardMagenta}>
          <Text style={sharedStyles.productCardText}>Review</Text>
          <Text style={sharedStyles.productCardSubtext}>Automated PR insights</Text>
        </View>
        <View style={sharedStyles.productCardBlue}>
          <Text style={sharedStyles.productCardText}>Secure</Text>
          <Text style={sharedStyles.productCardSubtext}>Security vulnerability scan</Text>
        </View>
        <View style={sharedStyles.productCardPurple}>
          <Text style={sharedStyles.productCardText}>Ship</Text>
          <Text style={sharedStyles.productCardSubtext}>Quality gates & metrics</Text>
        </View>
      </View>

      <View style={sharedStyles.cardSurface}>
        <Text style={sharedStyles.muted}>Signed-in account</Text>
        <Text style={sharedStyles.cardTitle}>{me?.email ?? "Loading..."}</Text>
        {error ? <Text style={sharedStyles.errorText}>{error}</Text> : null}
      </View>

      <ExampleProjectsPanel />
      <SignOutButton />
    </ScrollView>
  );
}
