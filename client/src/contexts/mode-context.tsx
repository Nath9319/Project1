import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Mode = "personal" | "public";

interface ModeContextType {
  mode: Mode;
  setMode: (mode: Mode) => void;
}

const ModeContext = createContext<ModeContextType | undefined>(undefined);

export function ModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => {
    const saved = localStorage.getItem("journal-mode");
    return (saved as Mode) || "personal";
  });

  useEffect(() => {
    localStorage.setItem("journal-mode", mode);
    
    // Update document classes for mode-specific styling
    const root = document.documentElement;
    if (mode === "personal") {
      root.classList.add("personal-mode");
      root.classList.remove("public-mode");
    } else {
      root.classList.add("public-mode");
      root.classList.remove("personal-mode");
    }
  }, [mode]);

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  const context = useContext(ModeContext);
  if (context === undefined) {
    throw new Error("useMode must be used within a ModeProvider");
  }
  return context;
}