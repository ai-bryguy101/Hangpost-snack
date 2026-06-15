import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

/** Minimal expo-router stand-in (Snack can't run the real file-based router).
 * Exposes the same `useRouter()` / `useLocalSearchParams()` call shapes the
 * apps/native screens use, so ported screen code stays near-verbatim. */

export type Params = Record<string, string | undefined>;

export interface Route {
  pathname: string;
  params: Params;
}

type To = string | { pathname: string; params?: Params };

interface RouterApi {
  push: (to: To) => void;
  replace: (to: To) => void;
  back: () => void;
}

interface RouterState {
  stack: Route[];
  router: RouterApi;
}

const RouterContext = createContext<RouterState | null>(null);

function normalize(to: To): Route {
  if (typeof to === "string") return { pathname: to, params: {} };
  return { pathname: to.pathname, params: to.params ?? {} };
}

const ROOT: Route = { pathname: "/(tabs)", params: {} };

export function RouterProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<Route[]>([ROOT]);

  const router = useMemo<RouterApi>(
    () => ({
      push: (to) => setStack((s) => [...s, normalize(to)]),
      replace: (to) => {
        const route = normalize(to);
        // replace("/") resets to the tab root, like expo-router's index route.
        if (route.pathname === "/") {
          setStack([ROOT]);
          return;
        }
        setStack((s) => [...s.slice(0, -1), route]);
      },
      back: () => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)),
    }),
    [],
  );

  const value = useMemo(() => ({ stack, router }), [stack, router]);
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useRouter(): RouterApi {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used inside RouterProvider");
  return ctx.router;
}

export function useRouteStack(): Route[] {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouteStack must be used inside RouterProvider");
  return ctx.stack;
}

/** Params of the top route — the screens only ever read the current ones. */
export function useLocalSearchParams<T extends Params = Params>(): T {
  const stack = useRouteStack();
  return stack[stack.length - 1].params as T;
}
