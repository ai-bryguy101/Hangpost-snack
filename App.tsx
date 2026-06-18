import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

import { StoreProvider, useStore } from "./lib/store";
import { RouterProvider, useRouteStack, type Route } from "./lib/router";
import { DialogProvider } from "./lib/dialog";
import { ToastProvider } from "./lib/toast";
import { colors } from "./theme/colors";
import { TabBar, type TabKey } from "./components/TabBar";

import { WelcomeScreen } from "./screens/WelcomeScreen";
import { PhoneVerifyScreen } from "./screens/PhoneVerifyScreen";
import { OnboardingScreen } from "./screens/OnboardingScreen";
import { FirstPicksScreen } from "./screens/FirstPicksScreen";
import { FeedScreen } from "./screens/FeedScreen";
import { PeopleScreen } from "./screens/PeopleScreen";
import { AlertsScreen } from "./screens/AlertsScreen";
import { ProfileScreen } from "./screens/ProfileScreen";
import { PostDetailScreen } from "./screens/PostDetailScreen";
import { CreatePostScreen } from "./screens/CreatePostScreen";
import { PersonProfileScreen } from "./screens/PersonProfileScreen";
import { MyConnectionsScreen } from "./screens/MyConnectionsScreen";
import { MessagesScreen } from "./screens/MessagesScreen";
import { ChatScreen } from "./screens/ChatScreen";
import { UpcomingScreen } from "./screens/UpcomingScreen";
import { SafetyCenterScreen } from "./screens/SafetyCenterScreen";
import { SearchScreen } from "./screens/SearchScreen";
import { ProfileEditScreen } from "./screens/ProfileEditScreen";
import { SetLocationScreen } from "./screens/SetLocationScreen";
import { CommunityScreen } from "./screens/CommunityScreen";
import { CommunityNewScreen } from "./screens/CommunityNewScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { LegalScreen } from "./screens/LegalScreen";
import { TonightScreen } from "./screens/TonightScreen";

/**
 * Hangpost — the FULL product vision, end to end, on mock data.
 *
 * Entry: Welcome → (Get started: phone verify → 5-step onboarding) → app,
 * or "I have an account" → straight in as the demo persona. Everything is
 * tappable; nothing needs a backend. Iterate here, then port what survives
 * into apps/native.
 */

type Stage = "welcome" | "verify" | "onboarding" | "firstpicks" | "app";

function TabsShell({ onSignOut }: { onSignOut: () => void }) {
  const [tab, setTab] = useState<TabKey>("feed");
  const { unreadNotifs } = useStore();
  return (
    <View style={styles.root}>
      <View style={{ flex: 1 }}>
        {tab === "feed" ? (
          <FeedScreen />
        ) : tab === "people" ? (
          <PeopleScreen />
        ) : tab === "alerts" ? (
          <AlertsScreen />
        ) : (
          <ProfileScreen onSignOut={onSignOut} />
        )}
      </View>
      <TabBar active={tab} onChange={setTab} alertsBadge={unreadNotifs()} />
    </View>
  );
}

function ScreenFor({ route, onSignOut }: { route: Route; onSignOut: () => void }) {
  switch (route.pathname) {
    case "/post/[id]":
      return <PostDetailScreen />;
    case "/person/[id]":
      return <PersonProfileScreen />;
    case "/chat/[id]":
      return <ChatScreen />;
    case "/create":
      return <CreatePostScreen />;
    case "/messages":
      return <MessagesScreen />;
    case "/connections":
      return <MyConnectionsScreen />;
    case "/upcoming":
      return <UpcomingScreen />;
    case "/tonight":
      return <TonightScreen />;
    case "/safety":
      return <SafetyCenterScreen />;
    case "/search":
      return <SearchScreen />;
    case "/profile-edit":
      return <ProfileEditScreen />;
    case "/set-location":
      return <SetLocationScreen />;
    case "/community/[id]":
      return <CommunityScreen />;
    case "/community-new":
      return <CommunityNewScreen />;
    case "/settings":
      return <SettingsScreen onSignOut={onSignOut} />;
    case "/legal":
      return <LegalScreen />;
    default:
      return null;
  }
}

function Navigator({ onSignOut }: { onSignOut: () => void }) {
  const stack = useRouteStack();
  return (
    <View style={styles.root}>
      <TabsShell onSignOut={onSignOut} />
      {stack.slice(1).map((route, i) => (
        <View key={`${route.pathname}-${i}`} style={[StyleSheet.absoluteFill, styles.overlay]}>
          <ScreenFor route={route} onSignOut={onSignOut} />
        </View>
      ))}
    </View>
  );
}

/** First-picks runs before the tab app, but still needs the router so a pick can
 * open that person's profile (and from there, their hangouts/chat). Same overlay
 * pattern as Navigator, with FirstPicks as the base instead of the tabs. */
function FirstPicksStage({ onDone }: { onDone: () => void }) {
  const stack = useRouteStack();
  return (
    <View style={styles.root}>
      <FirstPicksScreen onDone={onDone} />
      {stack.slice(1).map((route, i) => (
        <View key={`${route.pathname}-${i}`} style={[StyleSheet.absoluteFill, styles.overlay]}>
          <ScreenFor route={route} onSignOut={onDone} />
        </View>
      ))}
    </View>
  );
}

function Root() {
  const [stage, setStage] = useState<Stage>("welcome");

  if (stage === "welcome")
    return (
      <WelcomeScreen
        onCreateAccount={() => setStage("verify")}
        onSignIn={() => setStage("app")}
      />
    );
  if (stage === "verify")
    return <PhoneVerifyScreen onVerified={() => setStage("onboarding")} onBack={() => setStage("welcome")} />;
  if (stage === "onboarding")
    return <OnboardingScreen onDone={() => setStage("firstpicks")} onBack={() => setStage("verify")} />;
  if (stage === "firstpicks")
    return (
      <RouterProvider>
        <FirstPicksStage onDone={() => setStage("app")} />
      </RouterProvider>
    );

  return (
    <RouterProvider>
      <Navigator onSignOut={() => setStage("welcome")} />
    </RouterProvider>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <DialogProvider>
          <ToastProvider>
            <StatusBar style="dark" />
            <Root />
          </ToastProvider>
        </DialogProvider>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  overlay: { backgroundColor: colors.background },
});
