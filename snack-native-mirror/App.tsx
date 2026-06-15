import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query";

import { AuthProvider, useAuth } from "./lib/auth";
import { DialogProvider } from "./lib/dialog";
import { RouterProvider, useRouteStack, type Route } from "./lib/router";
import { getUnreadCount } from "./lib/mockApi";
import { colors } from "./theme/colors";
import { TabBar, type TabKey } from "./components/TabBar";

import { FeedScreen } from "./screens/FeedScreen";
import { ConnectionsScreen } from "./screens/ConnectionsScreen";
import { AlertsScreen } from "./screens/AlertsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { SignInScreen } from "./screens/SignInScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { FirstPicksScreen } from "./screens/FirstPicksScreen";
import { CreatePostScreen } from "./screens/CreatePostScreen";
import { ProfileEditScreen } from "./screens/ProfileEditScreen";
import { SetLocationScreen } from "./screens/SetLocationScreen";
import { MessagesScreen } from "./screens/MessagesScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { ConnectionsListScreen } from "./screens/ConnectionsListScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import { CommunityNewScreen } from "./screens/CommunityNewScreen";

/**
 * Hangpost — Snack mirror of apps/native (what Expo Go shows TODAY).
 *
 * Same screens, same flows, same copy as the real native app; Clerk, the
 * live API, and expo-router are replaced by Snack-safe stand-ins (lib/auth,
 * lib/mockApi, lib/router) so the whole thing runs at snack.expo.dev.
 * See README.md in this folder for what's mocked and why.
 */

/** The (tabs) group: the four tab screens + the bar with the unread badge —
 * mirrors apps/native/app/(tabs)/_layout.tsx. */
function TabsShell() {
  const [tab, setTab] = useState<TabKey>("feed");
  const { getToken, isSignedIn } = useAuth();

  const { data: unread } = useQuery({
    queryKey: ["notifications", "unread-count"],
    enabled: !!isSignedIn,
    refetchInterval: 30_000,
    queryFn: async () => {
      const token = await getToken();
      if (!token) return 0;
      return getUnreadCount(token);
    },
  });

  return (
    <View style={styles.root}>
      <View style={{ flex: 1 }}>
        {tab === "feed" ? (
          <FeedScreen />
        ) : tab === "connections" ? (
          <ConnectionsScreen />
        ) : tab === "alerts" ? (
          <AlertsScreen />
        ) : (
          <ProfileScreen />
        )}
      </View>
      <TabBar active={tab} onChange={setTab} alertsBadge={unread} />
    </View>
  );
}

/** Maps a pushed route to its screen — the Stack from apps/native/app/_layout.tsx. */
function ScreenFor({ route }: { route: Route }) {
  switch (route.pathname) {
    case "/sign-in":
      return <SignInScreen />;
    case "/onboarding":
      return <OnboardingScreen />;
    case "/first-picks":
      return <FirstPicksScreen />;
    case "/create":
      return <CreatePostScreen />;
    case "/profile-edit":
      return <ProfileEditScreen />;
    case "/set-location":
      return <SetLocationScreen />;
    case "/messages":
      return <MessagesScreen />;
    case "/connections-list":
      return <ConnectionsListScreen />;
    case "/chat/[threadId]":
      return <ChatScreen />;
    case "/community/[communityId]":
      return <CommunityScreen />;
    case "/community-new":
      return <CommunityNewScreen />;
    default:
      return null;
  }
}

function Navigator() {
  const stack = useRouteStack();
  return (
    <View style={styles.root}>
      {/* The tab group stays mounted underneath, like expo-router's Stack. */}
      <TabsShell />
      {stack.slice(1).map((route, i) => (
        <View key={`${route.pathname}-${i}`} style={[StyleSheet.absoluteFill, styles.overlay]}>
          <ScreenFor route={route} />
        </View>
      ))}
    </View>
  );
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1 },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <DialogProvider>
            <RouterProvider>
              <StatusBar style="dark" />
              <Navigator />
            </RouterProvider>
          </DialogProvider>
        </QueryClientProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  overlay: { backgroundColor: colors.background },
});
