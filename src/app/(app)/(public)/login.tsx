import { emailAtom } from "@/store/login";
import { twFullConfig } from "@/utils/twconfig";
import {
  isClerkAPIResponseError,
  useSignIn,
  useSignUp,
  useSSO,
} from "@clerk/clerk-expo";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Checkbox } from "expo-checkbox";
import { Link, useRouter } from "expo-router";
import { useSetAtom } from "jotai";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Page() {
  const [loading, setLoading] = useState<"google" | "apple" | "email" | false>(
    false
  );
  const [isTermsChecked, setIsTermsChecked] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("singhalutkarsh26@gmail.com");

  const setEmailAtom = useSetAtom(emailAtom);

  const { startSSOFlow } = useSSO();
  const { signUp } = useSignUp();
  const { signIn, setActive } = useSignIn();

  const router = useRouter();

  const handleSignInWithSSO = async (
    strategy: "oauth_google" | "oauth_apple"
  ) => {
    if (strategy === "oauth_google" || strategy === "oauth_apple") {
      setLoading(strategy.replace("oauth_", "") as "google" | "apple");
    } else {
      setLoading(false);
    }

    try {
      const { createdSessionId, setActive } = await startSSOFlow({
        strategy,
      });

      if (createdSessionId) {
        setActive!({ session: createdSessionId });
      }
    } catch (error) {
      console.log("Error during SSO sign-in:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailOTP = async () => {
    try {
      setLoading("email");
      setEmailAtom(email);
      await signUp?.create({
        emailAddress: email,
      });
      await signUp?.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      router.push("/verify");
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        if (error.status === 422) {
          signInWithEmail();
        } else {
          Alert.alert(
            "Error",
            error.errors[0].longMessage || "An error occurred"
          );
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async () => {
    try {
      setLoading("email");
      await signIn?.create({
        strategy: "email_code",
        identifier: email,
      });

      router.push("/verify?isLogin=true");
    } catch (error) {
      console.error("Error signing in with email:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPress = () => {
    Linking.openURL("https://utkarsh-singhal.is-a.dev/");
  };

  const signInWithPasskey = async () => {
    try {
      const signInAttempt = await signIn?.authenticateWithPasskey({
        flow: "discoverable",
      });

      if (signInAttempt?.status === "complete") {
        await setActive!({ session: signInAttempt.createdSessionId });
      } else {
        console.log("Sign-in attempt not complete:", signInAttempt);
      }
    } catch (error) {
      console.log("Error signing in with passkey:", error);
    }
  };

  return (
    <View className="flex-1 bg-black pt-safe">
      <View className="flex-1 p-6">
        <View className="flex-row justify-end">
          <Link href={"/faq"} asChild>
            <TouchableOpacity className="bg-gray-700 p-2 rounded-xl">
              <Feather name={"help-circle"} size={28} color={"white"} />
            </TouchableOpacity>
          </Link>
        </View>

        <View className="items-center py-8">
          <Image
            source={require("@/assets/images/convex.png")}
            className="w-40 h-40"
          />
        </View>

        <Text className="font-Poppins_400Regular text-gray-400 text-md text-center">
          AI - Powered Captions Editor
        </Text>

        <TextInput
          className="bg-gray-700 my-8 p-4 rounded-xl text-gray-300"
          placeholder="Email"
          placeholderTextColor={"gray"}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="flex-row items-center">
          <Checkbox
            className="mr-4"
            value={isTermsChecked}
            onValueChange={setIsTermsChecked}
            color={
              isTermsChecked
                ? (twFullConfig.theme.colors as any).primary
                : undefined
            }
          />
          <Text className="flex-wrap flex-1 font-Poppins_500Medium text-gray-400 text-md">
            I agree to the{" "}
            <Text className="text-white underline" onPress={handleLinkPress}>
              Terms of Service
            </Text>{" "}
            and acknowledge Captions{" "}
            <Text className="text-white underline" onPress={handleLinkPress}>
              Privacy Policy
            </Text>
          </Text>
        </View>

        <TouchableOpacity
          onPress={handleEmailOTP}
          disabled={!email || !isTermsChecked || loading === "email"}
          className={`w-full py-4 rounded-lg mt-8 mb-14 transition-colors duration-300 ${
            !email || !isTermsChecked || loading === "email"
              ? "bg-gray-800"
              : "bg-primary"
          }`}
        >
          {loading === "email" ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <Text className="font-Poppins_500Medium text-white text-lg text-center">
              Continue
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSignInWithSSO("oauth_apple")}
          disabled={!!loading}
          className="flex-row justify-center items-center bg-gray-800 py-4 rounded-lg w-full"
        >
          {loading === "apple" ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <>
              <Ionicons name={"logo-apple"} size={24} color={"white"} />
              <Text className="ml-3 font-Poppins_600SemiBold text-white text-base text-center">
                Continue with Apple
              </Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => handleSignInWithSSO("oauth_google")}
          disabled={!!loading}
          className="flex-row justify-center items-center bg-gray-800 mt-4 py-4 rounded-lg w-full"
        >
          {loading === "google" ? (
            <ActivityIndicator color={"white"} />
          ) : (
            <>
              <Image
                source={require("@/assets/images/google.webp")}
                className="w-6 h-6"
              />
              <Text className="ml-3 font-Poppins_600SemiBold text-white text-base text-center">
                Continue with Google
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View className="items-center pt-6">
          <TouchableOpacity onPress={signInWithPasskey}>
            <Text className="font-Poppins_600SemiBold text-gray-400 text-base text-center">
              Continue with Passkey
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
