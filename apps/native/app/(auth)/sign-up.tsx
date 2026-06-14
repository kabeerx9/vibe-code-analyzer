import { useAuth, useSignUp } from "@clerk/expo";
import { type Href, Link, useRouter } from "expo-router";
import React from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { colors } from "@codeaudit/ui/theme/tokens";
import { sharedStyles } from "@/lib/theme";

function pushDecoratedUrl(
  router: ReturnType<typeof useRouter>,
  decorateUrl: (url: string) => string,
  href: string,
) {
  const url = decorateUrl(href);
  const nextHref = url.startsWith("http") ? new URL(url).pathname : url;
  router.push(nextHref as Href);
}

export default function Page() {
  const { signUp, errors, fetchStatus } = useSignUp();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const handleSubmit = async () => {
    setStatusMessage(null);

    const { error } = await signUp.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setStatusMessage(error.longMessage ?? "Unable to sign up. Please try again.");
      return;
    }

    await signUp.verifications.sendEmailCode();
    setStatusMessage(`We sent a verification code to ${emailAddress}.`);
  };

  const handleVerify = async () => {
    setStatusMessage(null);

    await signUp.verifications.verifyEmailCode({
      code,
    });

    if (signUp.status === "complete") {
      await signUp.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          pushDecoratedUrl(router, decorateUrl, "/");
        },
      });
    } else {
      console.error("Sign-up attempt not complete:", signUp);
      setStatusMessage("That code did not complete sign-up. Please try again.");
    }
  };

  if (signUp.status === "complete" || isSignedIn) {
    return null;
  }

  if (
    signUp.status === "missing_requirements" &&
    signUp.unverifiedFields.includes("email_address") &&
    signUp.missingFields.length === 0
  ) {
    return (
      <ScrollView style={sharedStyles.screenPadded}>
        <Text style={sharedStyles.headingSm}>Verify your account</Text>
        {statusMessage && <Text style={sharedStyles.muted}>{statusMessage}</Text>}
        <TextInput
          style={sharedStyles.input}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor={colors.stone}
          onChangeText={(value) => setCode(value)}
          keyboardType="numeric"
        />
        {errors.fields.code && <Text style={sharedStyles.errorText}>{errors.fields.code.message}</Text>}
        <Pressable
          style={({ pressed }) => [
            sharedStyles.buttonPrimary,
            fetchStatus === "fetching" && sharedStyles.buttonDisabled,
            pressed && sharedStyles.buttonPressed,
          ]}
          onPress={handleVerify}
          disabled={fetchStatus === "fetching"}
        >
          <Text style={sharedStyles.buttonPrimaryText}>Verify</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [pressed && sharedStyles.buttonPressed]}
          onPress={() => signUp.verifications.sendEmailCode()}
        >
          <Text style={[sharedStyles.muted, { fontWeight: "600" }]}>I need a new code</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={sharedStyles.screenPadded} contentContainerStyle={{ gap: 12 }}>
      <View style={{ gap: 8, marginBottom: 8 }}>
        <Text style={sharedStyles.headingLg}>Create your account</Text>
        <Text style={sharedStyles.subtitle}>Start analyzing code with confidence.</Text>
      </View>
      {statusMessage && <Text style={sharedStyles.muted}>{statusMessage}</Text>}
      <GoogleSignInButton />
      <Text style={[sharedStyles.muted, { textAlign: "center" }]}>or</Text>
      <Text style={sharedStyles.label}>Email address</Text>
      <TextInput
        style={sharedStyles.input}
        autoCapitalize="none"
        value={emailAddress}
        placeholder="Enter email"
        placeholderTextColor={colors.stone}
        onChangeText={(value) => setEmailAddress(value)}
        keyboardType="email-address"
      />
      {errors.fields.emailAddress && (
        <Text style={sharedStyles.errorText}>{errors.fields.emailAddress.message}</Text>
      )}
      <Text style={sharedStyles.label}>Password</Text>
      <TextInput
        style={sharedStyles.input}
        value={password}
        placeholder="Enter password"
        placeholderTextColor={colors.stone}
        secureTextEntry={true}
        onChangeText={(value) => setPassword(value)}
      />
      {errors.fields.password && (
        <Text style={sharedStyles.errorText}>{errors.fields.password.message}</Text>
      )}
      <Pressable
        style={({ pressed }) => [
          sharedStyles.buttonPrimary,
          (!emailAddress || !password || fetchStatus === "fetching") && sharedStyles.buttonDisabled,
          pressed && sharedStyles.buttonPressed,
        ]}
        onPress={handleSubmit}
        disabled={!emailAddress || !password || fetchStatus === "fetching"}
      >
        <Text style={sharedStyles.buttonPrimaryText}>Sign up</Text>
      </Pressable>
      <View style={sharedStyles.row}>
        <Text style={sharedStyles.muted}>Already have an account? </Text>
        <Link href="/sign-in">
          <Text style={[sharedStyles.label, { color: colors.ink }]}>Sign in</Text>
        </Link>
      </View>
      <View nativeID="clerk-captcha" />
    </ScrollView>
  );
}
