import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function Page() {
  const router = useRouter();

  const onImportVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/(app)/(authenticated)/(modal)/filelist");
  };

  const onRecordVideo = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log("Record video");
  };

  return (
    <View className="flex-1 bg-dark px-4 pt-4">
      <View className="flex-row gap-3 mb-3">
        <TopCreateOption
          icon={<Ionicons name={"download-outline"} size={24} color={"#fff"} />}
          title={"Caption Video"}
          subtitle={"Import footage"}
          onPress={onImportVideo}
        />
        <TopCreateOption
          icon={<Ionicons name={"videocam-outline"} size={24} color={"#fff"} />}
          title={"Record Video"}
          subtitle={"Use your camera"}
          onPress={onRecordVideo}
        />
      </View>

      <TouchableOpacity
        onPress={router.back}
        className="bg-zinc-800 mb-8 py-4 rounded-2xl w-full"
      >
        <Text className="font-Poppins_600SemiBold text-gray-400 text-lg text-center">
          Cancel
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function TopCreateOption({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-1 items-center bg-neutral-800 p-4 rounded-2xl"
      onPress={onPress}
    >
      <View className="mb-3">{icon}</View>
      <Text className="font-Poppins_600SemiBold text-white text-lg">
        {title}
      </Text>
      <Text className="font-Poppins_400Regular text-gray-400 text-sm">
        {subtitle}
      </Text>
    </TouchableOpacity>
  );
}
