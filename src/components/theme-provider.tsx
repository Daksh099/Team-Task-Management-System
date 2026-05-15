"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: Theme): "light" | "dark" {
  if (theme === "system") return getSystemTheme();
  return theme;
}

export function ThemeProvider({
  children,
  defaultTheme = "dark",
  attribute = "class",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
  attribute?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Read persisted theme on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("theme") as Theme | null;
      if (stored && ["light", "dark", "system"].includes(stored)) {
        setThemeState(stored);
      }
    } catch {
      // localStorage unavailable
    }
    setMounted(true);
  }, []);

  const resolved = useMemo(
    () => (mounted ? resolveTheme(theme) : resolveTheme(defaultTheme)),
    [theme, mounted, defaultTheme]
  );

  // Apply theme class to <html>
  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;

    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    } else {
      root.setAttribute(attribute, resolved);
    }
  }, [resolved, mounted, attribute]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const root = document.documentElement;
      const newResolved = getSystemTheme();
      if (attribute === "class") {
        root.classList.remove("light", "dark");
        root.classList.add(newResolved);
      }
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme, attribute]);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem("theme", newTheme);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const value = useMemo(
    () => ({ theme, resolvedTheme: resolved, setTheme }),
    [theme, resolved, setTheme]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return ctx;
}
