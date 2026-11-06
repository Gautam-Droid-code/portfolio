"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

const MIN_DISPLAY_MS = 600;
const MAX_WAIT_MS = 6000;

export type LoadingContextValue = {
  /** True once the minimum display time has passed and the site is ready. */
  ready: boolean;
  /** Signals that the site can be revealed. Called on window load for now. */
  setReady: () => void;
};

export const LoadingContext = createContext<LoadingContextValue | null>(null);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [signalled, setSignalled] = useState(false);
  const [minElapsed, setMinElapsed] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const ready = timedOut || (signalled && minElapsed);

  const setReady = useCallback(() => {
    setSignalled(true);
  }, []);

  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS);
    const maxTimer = window.setTimeout(() => setTimedOut(true), MAX_WAIT_MS);

    const handleLoad = () => setSignalled(true);

    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad, { once: true });
    }

    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
      window.removeEventListener("load", handleLoad);
    };
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("is-loading", !ready);

    return () => {
      root.classList.remove("is-loading");
    };
  }, [ready]);

  return (
    <LoadingContext.Provider value={{ ready, setReady }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading(): LoadingContextValue {
  const context = useContext(LoadingContext);

  if (!context) {
    throw new Error("useLoading must be used inside a LoadingProvider");
  }

  return context;
}
