import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";
import { CaptionSettings } from "./CaptionsOverlay";

type CaptionControlsProps = {
  captionSettings: CaptionSettings;
  isUpdatingSettings: boolean;
  onCaptionSettingsChange: (settings: CaptionSettings) => void;
};

export default function CaptionControls({
  captionSettings,
  isUpdatingSettings,
  onCaptionSettingsChange,
}: CaptionControlsProps) {
  return (
    <View className="right-0 bottom-28 left-0 absolute gap-4 bg-[#2a2a2a] mx-2 p-4 rounded-t-xl">
      <View className="flex-row justify-between items-center">
        <Text className="font-Poppins_500Medium text-white">Size</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            disabled={isUpdatingSettings}
            onPress={() =>
              onCaptionSettingsChange({
                ...captionSettings,
                fontSize: Math.max(16, captionSettings.fontSize - 2),
              })
            }
            className={`bg-white/10 p-2 rounded-full ${isUpdatingSettings ? "opacity-50" : ""}`}
          >
            <Ionicons name={"remove"} size={24} color="#fff" />
          </TouchableOpacity>
          <Text className="pt-1.5 font-Poppins_500Medium text-white">
            {captionSettings.fontSize}
          </Text>
          <TouchableOpacity
            disabled={isUpdatingSettings}
            onPress={() =>
              onCaptionSettingsChange({
                ...captionSettings,
                fontSize: Math.max(48, captionSettings.fontSize + 2),
              })
            }
            className={`bg-white/10 p-2 rounded-full ${isUpdatingSettings ? "opacity-50" : ""}`}
          >
            <Ionicons name={"add"} size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="font-Poppins_500Medium text-white">Position</Text>
        <View className="flex-row">
          {(["top", "middle", "bottom"] as const).map((position) => (
            <TouchableOpacity
              key={position}
              onPress={() =>
                onCaptionSettingsChange({
                  ...captionSettings,
                  position,
                })
              }
              disabled={isUpdatingSettings}
              className={`mx-1 p-2 rounded-full ${captionSettings.position === position ? "bg-primary" : "bg-[#3a3a3a]"} ${isUpdatingSettings ? "opacity-50" : ""}`}
            >
              <Ionicons
                name={
                  position === "top"
                    ? "arrow-up"
                    : position === "middle"
                      ? "remove"
                      : "arrow-down"
                }
                size={16}
                color="#fff"
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="flex-row justify-between items-center">
        <Text className="font-Poppins_500Medium text-white">Color</Text>
        <View className="flex-row">
          {["#ffffff", "#ff0000", "#00ff00", "#0000ff"].map((color) => (
            <TouchableOpacity
              key={color}
              onPress={() =>
                onCaptionSettingsChange({
                  ...captionSettings,
                  color,
                })
              }
              disabled={isUpdatingSettings}
              className={`w-8 h-8 rounded-full mx-1 ${captionSettings.color === color ? "border-2 border-white" : ""} ${isUpdatingSettings ? "opacity-50" : ""}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </View>
      </View>
    </View>
  );
}
