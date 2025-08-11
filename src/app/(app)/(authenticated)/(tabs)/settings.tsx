import { useAuth, useUser } from "@clerk/clerk-expo";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Page() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const passkeys = user?.passkeys ?? [];

  const createClerkPasskey = async () => {
    if (!user) return;

    try {
      await user.createPasskey();
    } catch (error) {
      console.log("Error creating passkey:", error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-dark pt-safe">
      <View className="flex-1 px-6 py-8">
        <View className="items-center mb-8">
          <Text className="mb-2 font-Poppins_600SemiBold text-white text-3xl">
            Security Settings
          </Text>
          <Text className="text-gray-400 text-base text-center">
            Manage your passkeys and account security
          </Text>
        </View>

        <View className="gap-4 mb-8">
          <TouchableOpacity
            onPress={createClerkPasskey}
            className="bg-blue-600 hover:bg-blue-700 shadow-lg px-6 py-4 rounded-xl"
          >
            <Text className="font-semibold text-white text-lg text-center">
              Create New Passkey
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => signOut()}
            className="bg-red-600 hover:bg-red-700 shadow-lg px-6 py-4 rounded-xl"
          >
            <Text className="font-semibold text-white text-lg text-center">
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-gray-800 shadow-xl p-6 rounded-2xl">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="font-Poppins_600SemiBold text-white text-2xl">
              Your Passkeys
            </Text>
            <View className="bg-blue-600 px-3 py-1 rounded-full">
              <Text className="font-medium text-white text-sm">
                {passkeys.length}
              </Text>
            </View>
          </View>

          {passkeys.length === 0 ? (
            <View className="items-center py-12">
              <View className="justify-center items-center bg-gray-700 mb-4 rounded-full w-16 h-16">
                <Text className="text-gray-400 text-2xl">🔐</Text>
              </View>
              <Text className="mb-2 font-medium text-gray-400 text-lg">
                No Passkeys Found
              </Text>
              <Text className="text-gray-500 text-sm text-center">
                Create your first passkey to enhance your account security
              </Text>
            </View>
          ) : (
            <View className="space-y-4">
              {passkeys.map((passkey, index) => (
                <View
                  key={passkey.id}
                  className="bg-gray-700 shadow-md p-5 border border-gray-600 rounded-xl"
                >
                  <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-row items-center">
                      <View className="justify-center items-center bg-green-600 mr-3 rounded-full w-10 h-10">
                        <Text className="font-bold text-white">
                          {index + 1}
                        </Text>
                      </View>
                      <View>
                        <Text className="font-semibold text-white text-lg">
                          {passkey.name || `Passkey ${index + 1}`}
                        </Text>
                        <Text className="text-gray-400 text-sm">
                          ID: {passkey.id.slice(0, 8)}...
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => passkey.delete()}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg"
                    >
                      <Text className="font-medium text-white text-sm">
                        Delete
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View className="space-y-3 pt-4 border-gray-600 border-t">
                    <View className="flex-row justify-between">
                      <Text className="font-medium text-gray-300">
                        Created:
                      </Text>
                      <Text className="text-gray-400">
                        {passkey.createdAt?.toLocaleDateString() || "Unknown"}
                      </Text>
                    </View>
                    <View className="flex-row justify-between">
                      <Text className="font-medium text-gray-300">
                        Last Used:
                      </Text>
                      <Text className="text-gray-400">
                        {passkey.lastUsedAt?.toLocaleDateString() || "Never"}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        <View className="bg-gray-800 mt-8 p-4 rounded-xl">
          <Text className="text-gray-400 text-sm text-center">
            Passkeys provide secure, passwordless authentication using
            biometrics or device security.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
