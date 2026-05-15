"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "react-hot-toast";
import { TooltipProvider } from "@/components/ui/tooltip";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark">
      <TooltipProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "var(--card)",
              color: "var(--card-foreground)",
              border: "1px solid var(--border)",
            },
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  );
}
