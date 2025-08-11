import { emailAtom } from "@/store/login";
import {
  isClerkAPIResponseError,
  useSignIn,
  useSignUp,
} from "@clerk/clerk-expo";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAtomValue } from "jotai";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function Page() {
  const { isLogin } = useLocalSearchParams<{ isLogin?: string }>();
  const router = useRouter();

  const inputRefs = useRef<(TextInput | null)[]>([
    null,
    null,
    null,
    null,
    null,
    null,
  ]);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [countdown, setCountdown] = useState(60);
  const isCodeComplete = code.every((code) => code !== "");

  const email = useAtomValue(emailAtom);
  const { signUp, setActive: setActiveSignUp } = useSignUp();
  const { signIn, setActive: setActiveSignIn } = useSignIn();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (isCodeComplete) {
      Keyboard.dismiss();
    }
  }, [isCodeComplete]);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;

    if (isTimerRunning && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setIsTimerRunning(false);
    }

    return () => clearTimeout(timer);
  }, [countdown, isTimerRunning]);

  const handleCodeChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < code.length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setCountdown(60);
    setIsTimerRunning(true);

    try {
      await signUp?.prepareVerification({
        strategy: "email_code",
      });
    } catch (error) {
      console.log("Error resending code:", error);
    }
  };

  const handleCreateAccount = async () => {
    try {
      const result = await signUp!.attemptEmailAddressVerification({
        code: code.join(""),
      });
      await setActiveSignUp!({ session: result.createdSessionId });
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        Alert.alert(
          "Error",
          error.errors[0]?.longMessage || "An error occurred. Please try again."
        );
      }
    }
  };

  const handleSignIn = async () => {
    try {
      const result = await signIn!.attemptFirstFactor({
        strategy: "email_code",
        code: code.join(""),
      });
      await setActiveSignIn!({ session: result.createdSessionId });
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        Alert.alert(
          "Error",
          error.errors[0]?.longMessage || "An error occurred. Please try again."
        );
      }
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <View className="flex-1 bg-black px-6 pt-safe">
        <TouchableOpacity
          onPress={router.back}
          className="justify-center bg-gray-800 rounded-xl w-10 h-10"
        >
          <MaterialCommunityIcons
            name={"chevron-left"}
            size={32}
            color={"white"}
          />
        </TouchableOpacity>

        <Text className="mt-20 font-Poppins_600SemiBold text-white text-xl">
          Enter code
        </Text>
        <Text className="mt-2 font-Poppins_400Regular text-gray-400">
          Check your email and enter the code sent to{" "}
          <Text className="text-white">{email}</Text>
        </Text>

        <View className="flex-row justify-between mt-8">
          {Array.from({ length: 6 }).map((_, index) => (
            <TextInput
              key={index}
              ref={(ref) => {
                inputRefs.current[index] = ref;
              }}
              className={`bg-gray-800 rounded-lg w-[52px] h-[52px] text-white text-xl text-center ${!code[index] && index === code.findIndex((c) => !c) ? "border-2 border-primary" : ""}`}
              maxLength={1}
              keyboardType="number-pad"
              value={code[index]}
              caretHidden={true}
              onChangeText={(text) => handleCodeChange(text, index)}
              onKeyPress={({ nativeEvent }) => {
                if (nativeEvent.key === "Backspace") {
                  const newCode = [...code];
                  newCode[index] = "";
                  setCode(newCode);
                  if (index > 0) {
                    inputRefs.current[index - 1]?.focus();
                  }
                }
              }}
            />
          ))}
        </View>

        <TouchableOpacity onPress={handleResendCode} className="mt-8">
          <Text
            className={`font-Poppins_500Medium ${countdown > 0 ? "text-gray-400" : "text-primary"}`}
          >
            Resend code {countdown > 0 && `(${countdown}s)`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          disabled={!isCodeComplete}
          onPress={isLogin ? handleSignIn : handleCreateAccount}
          className={`mt-auto mb-8 py-4 transition-colors duration-300 rounded-lg ${isCodeComplete ? "bg-primary" : "bg-gray-900"}`}
        >
          <Text
            className={`text-center text-lg font-Poppins_600SemiBold transition-colors duration-300 ${isCodeComplete ? "text-white" : "text-gray-400"}`}
          >
            {isLogin ? "Login" : "Create Account"}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
