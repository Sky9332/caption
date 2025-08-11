import { Ionicons } from "@expo/vector-icons";
import { useQuery } from "convex/react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "expo-router";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { api } from "~/convex/_generated/api";

export default function Page() {
  const projects = useQuery(api.projects.list);

  if (projects === undefined) {
    return (
      <View className="flex-1 justify-center items-center bg-dark">
        <Text className="font-Poppins_500Medium text-white text-lg">
          Loading projects....
        </Text>
      </View>
    );
  }

  if (!projects.length) {
    return (
      <View className="flex-1 justify-center items-center bg-dark p-4">
        <View className="items-center">
          <Ionicons name={"film-outline"} size={48} color={"#6c6c6c"} />
          <Text className="mt-4 font-Poppins_600SemiBold text-white text-xl text-center">
            No projects yet
          </Text>
          <Text className="mt-2 font-Poppins_400Regular text-gray-400 text-base text-center">
            Hit the button below to add your first project and see more magic
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-dark pt-4">
      <FlatList
        data={projects}
        className="px-4"
        contentContainerClassName="gap-2"
        renderItem={({ item: project }) => (
          <Link key={project._id} href={`/project/${project._id}`} asChild>
            <TouchableOpacity className="flex-row items-center bg-[#1c1c1e] p-4 rounded-2xl">
              <View className="flex-1">
                <Text className="font-Poppins_600SemiBold text-white text-lg">
                  {project.name}
                </Text>
                <Text className="font-Poppins_400Regular text-gray-400 text-sm">
                  Last update {formatDistanceToNow(project.lastUpdate)} ago •{" "}
                  {(project.videoSize / 1024 / 1024).toFixed(1)} MB
                </Text>
              </View>
              <View className="justify-center items-center bg-[#2c2c2e] rounded-xl w-10 h-10">
                <Ionicons name={"chevron-forward"} size={24} color={"#fff"} />
              </View>
            </TouchableOpacity>
          </Link>
        )}
      />
    </View>
  );
}
