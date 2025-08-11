import { Text, View } from "react-native";

export type CaptionPosition = "top" | "middle" | "bottom";

export type CaptionSettings = {
  fontSize: number;
  position: CaptionPosition;
  color: string;
};

export const DEFAULT_CAPTION_SETTINGS: CaptionSettings = {
  fontSize: 24,
  position: "bottom",
  color: "#FFFFFF",
};

type CaptionsOverlayProps = {
  captions: any[];
  currentTime: number;
  fontSize: number;
  position: CaptionPosition;
  color: string;
};

export default function CaptionsOverlay({
  captions,
  currentTime,
  fontSize,
  position,
  color,
}: CaptionsOverlayProps) {
  const currentCaption = captions.find(
    (caption) => caption.start <= currentTime && caption.end >= currentTime
  );

  if (!currentCaption) return null;

  const positionClasses = {
    top: "top-[50px]",
    middle: "top-[250px] -translate-y-1/2",
    bottom: "bottom-[200px]",
  };

  return (
    <View
      className={`w-3/4 absolute items-center justify-center px-2.5 ${positionClasses[position]}`}
    >
      <Text
        className="bg-black/50 p-2 rounded-lg text-center"
        style={{
          fontSize,
          color,
        }}
      >
        {currentCaption?.text}
      </Text>
    </View>
  );
}
