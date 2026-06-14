import { useSignIn } from "@clerk/expo";
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
  const { signIn, errors, fetchStatus } = useSignIn();
  const router = useRouter();
  const [emailAddress, setEmailAddress] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [code, setCode] = React.useState("");
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);

  const emailCodeFactor = signIn.supportedSecondFactors.find(
    (factor) => factor.strategy === "email_code",
  );
  const requiresEmailCode =
    signIn.status === "needs_client_trust" ||
    (signIn.status === "needs_second_factor" && !!emailCodeFactor);

  const handleSubmit = async () => {
    setStatusMessage(null);

    const { error } = await signIn.password({
      emailAddress,
      password,
    });

    if (error) {
      console.error(JSON.stringify(error, null, 2));
      setStatusMessage(error.longMessage ?? "Unable to sign in. Please try again.");
      return;
    }

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          pushDecoratedUrl(router, decorateUrl, "/");
        },
      });
    } else if (signIn.status === "needs_second_factor" || signIn.status === "needs_client_trust") {
      if (emailCodeFactor) {
        await signIn.mfa.sendEmailCode();
        setStatusMessage(`We sent a verification code to ${emailCodeFactor.safeIdentifier}.`);
      } else {
        console.error("Second factor is required, but email_code is not available:", signIn);
        setStatusMessage(
          "A second factor is required, but this screen only supports email codes right now.",
        );
      }
    } else {
      console.error("Sign-in attempt not complete:", signIn);
      setStatusMessage("Sign-in could not be completed. Check the logs for more details.");
    }
  };

  const handleVerify = async () => {
    setStatusMessage(null);

    await signIn.mfa.verifyEmailCode({ code });

    if (signIn.status === "complete") {
      await signIn.finalize({
        navigate: ({ session, decorateUrl }) => {
          if (session?.currentTask) {
            console.log(session.currentTask);
            return;
          }

          pushDecoratedUrl(router, decorateUrl, "/");
        },
      });
    } else {
      console.error("Sign-in attempt not complete:", signIn);
      setStatusMessage("That code did not complete sign-in. Please try again.");
    }
  };

  if (requiresEmailCode) {
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
          onPress={() => signIn.mfa.sendEmailCode()}
        >
          <Text style={[sharedStyles.muted, { fontWeight: "600" }]}>I need a new code</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={sharedStyles.screenPadded} contentContainerStyle={{ gap: 12 }}>
      <View style={{ gap: 8, marginBottom: 8 }}>
        <Text style={sharedStyles.heroTitle}>CodeAudit</Text>
        <Text style={sharedStyles.subtitle}>Intelligence for every codebase.</Text>
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
      {errors.fields.identifier && (
        <Text style={sharedStyles.errorText}>{errors.fields.identifier.message}</Text>
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
        <Text style={sharedStyles.buttonPrimaryText}>Sign in</Text>
      </Pressable>
      <View style={sharedStyles.row}>
        <Text style={sharedStyles.muted}>Don&apos;t have an account? </Text>
        <Link href="/sign-up">
          <Text style={[sharedStyles.label, { color: colors.ink }]}>Sign up</Text>
        </Link>
      </View>
    </ScrollView>
  );
}
