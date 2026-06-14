import { useSSO } from "@clerk/expo";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

import { sharedStyles } from "@/lib/theme";

export function GoogleSignInButton() {
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const onPress = async () => {
    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy: "oauth_google",
        redirectUrl: AuthSession.makeRedirectUri({ path: "sso-callback" }),
      });

      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.replace("/");
      }
    } catch (err) {
      console.error("Google sign-in failed:", err);
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [
        sharedStyles.buttonOutline,
        pressed && sharedStyles.buttonPressed,
      ]}
      onPress={onPress}
    >
      <Text style={sharedStyles.buttonOutlineText}>Continue with Google</Text>
    </Pressable>
  );
}
