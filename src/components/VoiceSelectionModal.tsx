import { api } from "@/convex/_generated/api";
import { Ionicons } from "@expo/vector-icons";
import { useAction } from "convex/react";
import { useAudioPlayer } from "expo-audio";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Voice {
  id: string;
  name: string;
  previewUrl: string;
  description: string;
  category: string;
}

interface VoiceSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectVoice: (voiceId: string) => void;
}

const useVoiceAudioPlayer = () => {
  const [currentVoiceId, setCurrentVoiceId] = useState<string | null>(null);
  const player = useAudioPlayer();

  const playAudio = (voice: Voice) => {
    if (player && currentVoiceId === voice.id && player.playing) {
      player.pause();
      setCurrentVoiceId(null);
      return;
    }

    if (player && player.playing) {
      player.pause();
    }
    player?.replace(voice.previewUrl);
    setCurrentVoiceId(voice.id);
    player?.play();
  };

  return {
    playAudio,
    isPlaying: currentVoiceId,
  };
};

export default function VoiceSelectionModal({
  visible,
  onClose,
  onSelectVoice,
}: VoiceSelectionModalProps) {
  const [voices, setVoices] = useState<Voice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { playAudio, isPlaying } = useVoiceAudioPlayer();

  const getVoices = useAction(api.elevenlabs.getVoices);

  useEffect(() => {
    if (visible) {
      loadVoices();
    }
  }, [visible]);

  const loadVoices = async () => {
    try {
      const voiceList = await getVoices();

      const validVoices = voiceList.filter(
        (voice): voice is Voice =>
          typeof voice.id === "string" &&
          typeof voice.name === "string" &&
          typeof voice.previewUrl === "string" &&
          typeof voice.description === "string"
      );
      setVoices(validVoices);
    } catch (error) {
      console.error("Failed to load voices:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="absolute inset-0 bg-black/50">
        <View className="flex-1 justify-end">
          <View className="bg-[#1A1A1A] p-6 rounded-t-3xl h-3/4">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="font-Poppins_600SemiBold text-white text-xl">
                Select Voice
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>

            {isLoading ? (
              <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#fff" />
              </View>
            ) : (
              <ScrollView className="flex-1">
                {voices.length === 0 ? (
                  <View className="flex-1 justify-center items-center p-4">
                    <Text className="text-white text-center">
                      No voices available. Please try again later.
                    </Text>
                  </View>
                ) : (
                  voices.map((voice) => (
                    <TouchableOpacity
                      key={voice.id}
                      onPress={() => onSelectVoice(voice.id)}
                      className="bg-[#2A2A2A] mb-3 p-4 rounded-xl"
                    >
                      <View className="flex-row justify-between items-center">
                        <View className="flex-1">
                          <Text className="font-Poppins_600SemiBold text-white text-lg">
                            {voice.name}
                          </Text>
                          <Text className="mt-1 text-gray-400 text-sm">
                            {voice.description}
                          </Text>
                          <Text className="mt-1 text-primary text-sm">
                            {voice.category}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => playAudio(voice)}
                          className="bg-[#3A3A3A] p-3 rounded-full"
                        >
                          <Ionicons
                            name={isPlaying === voice.id ? "pause" : "play"}
                            size={20}
                            color="white"
                          />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}
