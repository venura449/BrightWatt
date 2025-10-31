import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="register" options={{ headerShown: false }} />
      <Stack.Screen name="profile" options={{ headerShown: false }} />
      <Stack.Screen name="dashboard" options={{ headerShown: false }} />
      <Stack.Screen name="achievements" options={{ headerShown: true, title: "Achievements" }} />
      <Stack.Screen name="quiz" options={{ headerShown: true, title: "Solar Energy Quiz" }} />
      <Stack.Screen name="CommunityChat" options={{ headerShown: true, title: "Community Chat" }} />
      <Stack.Screen name="DiscoverCommunities" options={{ headerShown: true, title: "Discover Communities" }} />
      <Stack.Screen name="Auth/Signin" options={{ headerShown: true, title: "Sign In" }} />
      <Stack.Screen name="Auth/Signup" options={{ headerShown: true, title: "Sign Up" }} />
      <Stack.Screen name="Auth/Forgotpass" options={{ headerShown: true, title: "Forgot Password" }} />
    </Stack>
  );
}
