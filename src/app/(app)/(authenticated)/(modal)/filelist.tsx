import { formatDuration } from "@/utils/formatDuration";
import { useMutation } from "convex/react";
import * as MediaLibrary from "expo-media-library";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { api } from "~/convex/_generated/api";

export default function Page() {
  const router = useRouter();
  const [videos, setVideos] = useState<MediaLibrary.Asset[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const generateUploadUrl = useMutation(api.projects.generateUploadUrl);
  const createProject = useMutation(api.projects.createProject);

  useEffect(() => {
    (async () => {
      try {
        const permissions = await MediaLibrary.requestPermissionsAsync();

        if (!permissions.granted) return;

        const media = await MediaLibrary.getAssetsAsync({
          mediaType: "video",
          sortBy: ["creationTime"],
        });

        setVideos(media.assets);
      } catch (error) {
        console.log("Error during file list loading:", error);
      }
    })();
  }, []);

  const onSelectVideo = async (video: MediaLibrary.Asset) => {
    console.log("Selected video:", video);
    try {
      setIsUploading(true);

      const uploadUrl = await generateUploadUrl();
      const fileInfo = await MediaLibrary.getAssetInfoAsync(video.id);

      const videoUri = fileInfo.localUri || fileInfo.uri;
      if (!videoUri) {
        throw new Error("Video URI is not available");
      }

      const videoResponse = await fetch(videoUri);
      const blob = await videoResponse.blob();

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": blob.type,
        },
        body: blob,
      });

      if (!response.ok) {
        throw new Error("Failed to upload video");
      }

      const { storageId } = await response.json();
      if (!storageId) {
        throw new Error("Storage ID not returned from upload");
      }

      const projectId = await createProject({
        name: video.filename || "untitled",
        videoSize: blob.size,
        videoFileId: storageId,
      });

      router.push(`/project/${projectId}`);
    } catch (error) {
      console.log("Error selecting video:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View className="flex-1 bg-[#1c1c1e]">
      <ScrollView className="flex-1">
        <View className="flex-row flex-wrap p-1">
          {videos.map((video) => (
            <Pressable
              key={video.id}
              onPress={() => onSelectVideo(video)}
              className="relative p-0.5 w-1/3 aspect-square"
            >
              <Image
                source={{
                  uri: video.uri,
                }}
                className="flex-1 rounded-lg"
                resizeMode="cover"
              />
              <View className="right-2 bottom-2 absolute bg-black/60 p-1 rounded-md">
                <Text className="text-white text-xs">
                  {formatDuration(video.duration)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      {isUploading && (
        <View className="absolute inset-0 flex justify-center items-center bg-black/50">
          <ActivityIndicator size={"large"} color={"#fff"} />
          <Text className="mt-3 text-white text-base">Uploading....</Text>
        </View>
      )}
    </View>
  );
}
