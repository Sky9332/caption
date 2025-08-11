import CaptionControls from "@/components/CaptionControls";
import CaptionsOverlay, {
  CaptionSettings,
  DEFAULT_CAPTION_SETTINGS,
} from "@/components/CaptionsOverlay";
import VideoControls from "@/components/VideoControls";
import VoiceSelectionModal from "@/components/VoiceSelectionModal";
import { formatTime } from "@/utils/formatDuration";
import { Ionicons } from "@expo/vector-icons";
import { useAction, useMutation, useQuery } from "convex/react";
import { useEvent } from "expo";
import { useAudioPlayer } from "expo-audio";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Stack, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { TextInput } from "react-native-gesture-handler";
import { api } from "~/convex/_generated/api";
import { Id } from "~/convex/_generated/dataModel";

export default function Page() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const [showCaptionControls, setShowCaptionControls] =
    useState<boolean>(false);
  const [isUpdatingSettings, setIsUpdatingSettings] = useState<boolean>(false);
  const [captionSettings, setCaptionSettings] = useState<CaptionSettings>(
    DEFAULT_CAPTION_SETTINGS
  );

  const [showScriptModal, setShowScriptModal] = useState<boolean>(false);
  const [showVoiceModal, setShowVoiceModal] = useState<boolean>(false);
  const [script, setScript] = useState<string>("");
  const [isSavingScript, setIsSavingScript] = useState<boolean>(false);

  const [isGeneratingAudio, setIsGeneratingAudio] = useState<boolean>(false);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>("");

  const project = useQuery(api.projects.get, {
    projectId: id as Id<"projects">,
  });
  const updateProject = useMutation(api.projects.update);
  const processVideo = useAction(api.elevenlabs.processVideo);
  const updateCaptionSettings = useMutation(api.projects.updateCaptionSettings);
  const updateProjectScript = useMutation(api.projects.updateScript);
  const generateSpeech = useAction(api.elevenlabs.generateSpeech);
  const exportVideo = useAction(api.exportvideo.generateCaptionedVideo);

  const fileUrl = useQuery(
    api.projects.getFileUrl,
    project?.videoFileId
      ? {
          id: project.videoFileId,
        }
      : "skip"
  );

  const player = useVideoPlayer(fileUrl || null, (player) => {
    player.loop = true;
    player.timeUpdateEventInterval = 1;
  });

  const audioFileUrl = useQuery(
    api.projects.getFileUrl,
    project?.audioFileId
      ? {
          id: project.audioFileId,
        }
      : "skip"
  );

  const audioPlayer = useAudioPlayer(audioFileUrl || null);

  const { isPlaying } = useEvent(player, "playingChange", {
    isPlaying: player.playing,
  });

  const [currentTime, setCurrentTime] = useState<number>(0);

  useEffect(() => {
    if (player) {
      const interval = setInterval(() => {
        setCurrentTime(player.currentTime);
      }, 10);
      return () => clearInterval(interval);
    }
  }, [player]);

  useEffect(() => {
    if (project?.captionSettings) {
      setCaptionSettings(project.captionSettings);
    }
  }, [project?.captionSettings]);

  useEffect(() => {
    if (audioPlayer && player) {
      if (isPlaying) {
        player.muted = true;
        audioPlayer.play();
        player.currentTime = audioPlayer.currentTime;
      } else {
        audioPlayer.pause();
      }
    }
  }, [audioPlayer, isPlaying, player]);

  const handleGenerateCaptions = async () => {
    if (!project) return;
    setIsGenerating(true);

    try {
      await updateProject({
        id: project._id,
        status: "processing",
      });

      const videoId = await project.videoFileId;
      const result = await processVideo({ videoId });

      await updateProject({
        id: project._id,
        captions: result.words,
        language: result.language_code,
        status: "ready",
      });
    } catch (error) {
      console.log("Error generating captions:", error);
      await updateProject({
        id: project._id,
        status: "failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCaptionSettingsChange = async (newSettings: CaptionSettings) => {
    if (!project) return;
    if (isUpdatingSettings) return;

    setIsUpdatingSettings(true);
    try {
      await updateCaptionSettings({
        id: project._id,
        settings: newSettings,
      });
      setCaptionSettings(newSettings);
    } catch (error) {
      console.error("Error updating caption settings:", error);
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  useEffect(() => {
    if (project?.script) {
      setScript(project.script);
    }
  }, [project?.script]);

  const onGenerateSpeech = async (voiceId?: string) => {
    if (!project) return;

    try {
      setIsGeneratingAudio(true);

      const audioUrl = await generateSpeech({
        projectId: project._id,
        voiceId: voiceId || selectedVoiceId,
      });
      if (audioUrl) {
        if (player) {
          player.currentTime = 0;
          player.play();
        }
      }
    } catch (error) {
      console.error("Failed to generate speech:", error);
      Alert.alert("Error", "Failed to generate speech. Please try again.");
    } finally {
      setIsGeneratingAudio(false);
      setShowScriptModal(false);
    }
  };

  if (!project) {
    return (
      <View className="flex-1 justify-center items-center bg-dark">
        <Text className="font-Poppins_500Medium text-white text-lg">
          Loading project....
        </Text>
      </View>
    );
  }

  const onExportVideo = async () => {
    if (!project) return;

    try {
      setIsExporting(true);

      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== "granted") {
        throw new Error("Media Library permission not granted");
      }

      const result = await exportVideo({
        id: project._id,
      });

      if (result) {
        const fileUri =
          FileSystem.documentDirectory +
          `exported_video_${new Date().getTime()}.mp4`;
        const downloadResult = await FileSystem.downloadAsync(result, fileUri);

        if (downloadResult.status === 200) {
          const asset = await MediaLibrary.createAssetAsync(downloadResult.uri);
          await FileSystem.deleteAsync(fileUri);

          Alert.alert(
            "Video Exported Successfully",
            "Would you like to view it?.",
            [
              {
                text: "View in Library",
                onPress: async () => {
                  const album =
                    await MediaLibrary.getAlbumAsync("Caption Editor");
                  if (!album) {
                    await MediaLibrary.createAlbumAsync(
                      "Caption Editor",
                      asset,
                      false
                    );
                  } else {
                    await MediaLibrary.addAssetsToAlbumAsync(
                      asset,
                      album,
                      false
                    );
                  }

                  await Linking.openURL("photos-redirect://");
                },
              },
            ]
          );
        }
      }
    } catch (error) {
      console.log("Error exporting video:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <View className="flex-1 bg-dark">
      <Stack.Screen
        options={{
          title: project.name,
          headerRight: () => (
            <TouchableOpacity
              disabled={isExporting}
              onPress={onExportVideo}
              className={`bg-primary p-2 px-4 rounded-xl ${isExporting ? "opacity-50" : ""}`}
            >
              <Text className="font-Poppins_600SemiBold text-white text-lg">
                Export
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <View className="items-center mt-10">
        <VideoView
          player={player}
          style={{
            width: "80%",
            height: "80%",
            borderRadius: 10,
          }}
          // nativeControls={false}
        />

        {project.captions && (
          <CaptionsOverlay
            captions={project.captions}
            currentTime={currentTime || 0}
            fontSize={captionSettings.fontSize}
            position={captionSettings.position}
            color={captionSettings.color}
          />
        )}

        <View className="flex-row justify-between items-center bg-[#1a1a1a] mt-4 p-3 rounded-full w-3/4">
          <TouchableOpacity
            className="justify-center items-center w-10 h-10"
            onPress={() => {
              if (isPlaying) {
                player.pause();
              } else {
                player.play();
              }
            }}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={24}
              color={"#fff"}
            />
          </TouchableOpacity>
          <Text className="font-Poppins_500Medium text-white">
            {formatTime(currentTime || 0)} / {formatTime(player.duration)}
          </Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      <VideoControls
        isGenerating={isGenerating}
        projectStatus={project.status}
        onGenerateCaptions={handleGenerateCaptions}
        onShowCaptionControl={() =>
          setShowCaptionControls(!showCaptionControls)
        }
        onShowScriptModal={() => setShowScriptModal(!showScriptModal)}
      />

      {showCaptionControls && (
        <CaptionControls
          captionSettings={captionSettings}
          isUpdatingSettings={isUpdatingSettings}
          onCaptionSettingsChange={handleCaptionSettingsChange}
        />
      )}

      <Modal
        animationType="slide"
        transparent={true}
        visible={showScriptModal}
        onRequestClose={() => setShowScriptModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
        >
          <View className="flex-1 justify-end">
            <View className="bg-[#1a1a1a] p-6 rounded-t-xl h-1/2">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="font-Poppins_600SemiBold text-white text-xl">
                  Add Script
                </Text>
                <TouchableOpacity onPress={() => setShowScriptModal(false)}>
                  <Ionicons name={"close"} size={24} color={"#fff"} />
                </TouchableOpacity>
              </View>

              <TextInput
                placeholder="Enter your script"
                placeholderTextColor="#666"
                multiline={true}
                textAlignVertical="top"
                value={script}
                onChangeText={setScript}
                className="bg-[#2a2a2a] mb-8 p-4 rounded-xl h-[60%] font-Poppins_500Medium text-white text-lg"
              />

              <View className="flex-row gap-2">
                <TouchableOpacity
                  className="flex-1 bg-primary p-4 rounded-xl"
                  onPress={async () => {
                    try {
                      setIsSavingScript(true);
                      await updateProjectScript({
                        id: project._id,
                        script,
                      });
                    } catch (error) {
                      console.log("Error saving script:", error);
                      Alert.alert("Error", "Failed to save script.");
                    } finally {
                      setIsSavingScript(false);
                    }
                  }}
                >
                  <Text className="font-Poppins_600SemiBold text-white text-center">
                    {isSavingScript ? "Saving..." : "Save"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setShowScriptModal(false);
                    setTimeout(() => {
                      setShowVoiceModal(true);
                    }, 100);
                  }}
                  disabled={isGeneratingAudio || !script}
                  className={`flex-1 bg-[#2a2a2a] p-4 rounded-xl ${isGeneratingAudio || !script ? "opacity-50" : ""}`}
                >
                  <Text className="font-Poppins_600SemiBold text-white text-center">
                    {isGeneratingAudio ? "Generating..." : "Select Voice"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {isExporting && (
        <View className="absolute inset-0 justify-center items-center bg-dark/50">
          <ActivityIndicator size={"large"} color={"#fff"} />
          <Text className="font-Poppins_500Medium text-white text-lg">
            Exporting video...
          </Text>
        </View>
      )}

      {isGenerating && (
        <View className="absolute inset-0 justify-center items-center bg-dark/50">
          <ActivityIndicator size={"large"} color={"#fff"} />
          <Text className="font-Poppins_500Medium text-white text-lg">
            Generating captions...
          </Text>
        </View>
      )}

      {isGeneratingAudio && (
        <View className="z-50 absolute inset-0 justify-center items-center bg-black/50">
          <ActivityIndicator size="large" color="#fff" />
          <Text className="mt-4 font-Poppins_600SemiBold text-white">
            Generating audio...
          </Text>
        </View>
      )}

      {showVoiceModal && (
        <View className="z-[100] absolute inset-0">
          <VoiceSelectionModal
            visible={showVoiceModal}
            onClose={() => setShowVoiceModal(false)}
            onSelectVoice={(voiceId) => {
              setSelectedVoiceId(voiceId);
              setShowVoiceModal(false);
              onGenerateSpeech(voiceId);
            }}
          />
        </View>
      )}
    </View>
  );
}
