import { FontAwesome, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

interface VideoControlsProps {
  isGenerating: boolean;
  projectStatus: string;
  onGenerateCaptions: () => void;
  onShowCaptionControl: () => void;
  onShowScriptModal: () => void;
}

export default function VideoControls({
  isGenerating,
  projectStatus,
  onGenerateCaptions,
  onShowCaptionControl,
  onShowScriptModal,
}: VideoControlsProps) {
  return (
    <View className="right-0 bottom-0 left-0 absolute bg-[#1a1a1a] p-6 pb-safe">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
        contentContainerClassName="px-4 gap-8"
      >
        <TouchableOpacity
          onPress={onGenerateCaptions}
          disabled={isGenerating || projectStatus === "processing"}
          className="items-center"
        >
          <MaterialIcons
            name={"auto-awesome"}
            size={28}
            color={
              isGenerating || projectStatus === "processing"
                ? "#9ca1af"
                : "#fff"
            }
          />
          <Text
            className={`mt-1 font-Poppins_400Regular text-white text-sm ${isGenerating || projectStatus === "processing" ? "text-[#9ca3af]" : "text-white"}`}
          >
            Generate
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onShowCaptionControl}
          disabled={isGenerating || projectStatus === "processing"}
          className="items-center"
        >
          <MaterialIcons
            name={"closed-caption"}
            size={28}
            color={
              isGenerating || projectStatus === "processing"
                ? "#9ca1af"
                : "#fff"
            }
          />
          <Text
            className={`mt-1 font-Poppins_400Regular text-white text-sm ${isGenerating || projectStatus === "processing" ? "text-[#9ca3af]" : "text-white"}`}
          >
            Captions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onShowScriptModal} className="items-center">
          <MaterialIcons name={"description"} size={28} color={"#fff"} />
          <Text className="mt-1 text-white text-sm">Script</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <MaterialIcons name={"style"} size={28} color={"#fff"} />
          <Text className="mt-1 text-white text-sm">Style</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <MaterialIcons name={"aspect-ratio"} size={28} color={"#fff"} />
          <Text className="mt-1 text-white text-sm">Scale</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <MaterialIcons name={"zoom-in"} size={28} color={"#fff"} />
          <Text className="mt-1 text-white text-sm">Zoom</Text>
        </TouchableOpacity>

        <TouchableOpacity className="items-center">
          <FontAwesome name={"microphone"} size={28} color={"#fff"} />
          <Text className="mt-1 text-white text-sm">AI Dub</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}
