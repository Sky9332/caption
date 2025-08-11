import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function CreateButton() {
  const router = useRouter();

  const handleCreate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(app)/(authenticated)/(modal)/create");
  };

  return (
    <TouchableOpacity
      className="flex-1 justify-center items-center rounded-xl"
      onPress={handleCreate}
    >
      <Text className="p-2 font-Poppins_600SemiBold text-white text-lg">
        Create
      </Text>
    </TouchableOpacity>
  );
}
