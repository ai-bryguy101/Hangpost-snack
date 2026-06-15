import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

import { resetToFreshUser, resetToDemoUser } from "./mockApi";

/** Stand-in for @clerk/clerk-expo (which needs native modules + a key, so it
 * can't run in Snack). Mirrors the slice of `useAuth` the screens use:
 * `isSignedIn`, `getToken`, `signOut`.
 *
 * Two entry paths, mirroring the real app:
 *  - "Sign in"        → an existing demo account (profile + DC home base set)
 *  - "Create account" → a brand-new user (no profile, no home base) so the
 *                       onboarding + empty states render exactly like live.
 */
interface AuthApi {
  isSignedIn: boolean;
  getToken: () => Promise<string | null>;
  signOut: () => Promise<void>;
  /** Snack-only: completes the mock sign-in (any email/password works). */
  completeSignIn: (mode: "existing" | "new") => void;
}

const AuthContext = createContext<AuthApi | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isSignedIn, setSignedIn] = useState(false);

  const api = useMemo<AuthApi>(
    () => ({
      isSignedIn,
      getToken: async () => (isSignedIn ? "snack-demo-token" : null),
      signOut: async () => {
        setSignedIn(false);
        resetToFreshUser();
      },
      completeSignIn: (mode) => {
        if (mode === "existing") resetToDemoUser();
        else resetToFreshUser();
        setSignedIn(true);
      },
    }),
    [isSignedIn],
  );

  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthApi {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
