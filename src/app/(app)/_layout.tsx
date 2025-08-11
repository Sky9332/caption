import { useAuth } from "@clerk/clerk-expo";
import { Redirect, Slot, useSegments } from "expo-router";

export default function Layout() {
  const segments = useSegments();
  const isAuthGroup = segments[1] === "(authenticated)";
  const { isSignedIn } = useAuth();

  if (!isSignedIn && isAuthGroup) {
    return <Redirect href={"/login"} />;
  }

  if (isSignedIn && !isAuthGroup) {
    return <Redirect href={"/projects"} />;
  }

  return <Slot />;
}
