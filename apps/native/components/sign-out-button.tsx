import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { Pressable, Text } from "react-native";

import { sharedStyles } from "@/lib/theme";

export const SignOutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/sign-in");
    } catch (err) {
      console.error(JSON.stringify(err, null, 2));
    }
  };

  return (
    <Pressable
      style={({ pressed }) => [sharedStyles.buttonOutline, pressed && sharedStyles.buttonPressed]}
      onPress={handleSignOut}
    >
      <Text style={sharedStyles.buttonOutlineText}>Sign out</Text>
    </Pressable>
  );
};
