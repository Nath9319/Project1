import { useLocation } from "wouter";
import { useMode } from "@/contexts/mode-context";
import { useLanguage } from "@/contexts/language-context";
import { cn } from "@/lib/utils";
import { Book, Users, Heart } from "lucide-react";
import { useEffect, useState } from "react";

interface PrivacyMode {
  id: "personal" | "groups" | "partner";
  label: string;
  icon: React.ReactNode;
  path: string;
}

export function PrivacyModeSelector() {
  const [location, setLocation] = useLocation();
  const { mode, setMode } = useMode();
  const { t } = useLanguage();
  const [activeMode, setActiveMode] = useState<string>("personal");

  const privacyModes: PrivacyMode[] = [
    {
      id: "personal",
      label: t('nav.journal'),
      icon: <Book className="w-4 h-4" />,
      path: "/"
    },
    {
      id: "groups",
      label: t('nav.groups'),
      icon: <Users className="w-4 h-4" />,
      path: "/groups"
    },
    {
      id: "partner",
      label: t('nav.partner'),
      icon: <Heart className="w-4 h-4" />,
      path: "/partner"
    }
  ];

  // Determine active mode based on current path
  useEffect(() => {
    if (location === "/" || location.startsWith("/dashboard")) {
      setActiveMode("personal");
      setMode("personal");
    } else if (location.startsWith("/groups")) {
      setActiveMode("groups");
      setMode("public");
    } else if (location.startsWith("/partner")) {
      setActiveMode("partner");
      setMode("public");
    }
  }, [location, setMode]);

  const handleModeChange = (mode: PrivacyMode) => {
    setActiveMode(mode.id);
    if (mode.id === "personal") {
      setMode("personal");
    } else {
      setMode("public");
    }
    setLocation(mode.path);
  };

  return (
    <div className="relative p-1 rounded-full glass-strong shadow-ios-lg flex items-center bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-xl transform-gpu hover:shadow-ios-lg hover:scale-[1.02] transition-all duration-300">
      {/* Sliding background indicator with 3D effect */}
      <div
        className={cn(
          "absolute top-1 h-[calc(100%-8px)] rounded-full bg-white dark:bg-gray-600 shadow-ios-sm transition-all duration-300 ease-out transform-gpu",
          "shadow-lg",
          activeMode === "personal" && "w-[calc(33.33%-2px)] left-1",
          activeMode === "groups" && "w-[calc(33.33%-2px)] left-[calc(33.33%+2px)]",
          activeMode === "partner" && "w-[calc(33.33%-2px)] left-[calc(66.66%+3px)]"
        )}
      />
      
      {/* Mode buttons */}
      <div className="relative flex items-center">
        {privacyModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handleModeChange(mode)}
            className={cn(
              "relative z-10 flex items-center justify-center gap-1.5 px-3 py-2 rounded-full transition-all duration-300",
              "hover:scale-105 active:scale-95 min-w-[90px]",
              activeMode === mode.id
                ? "text-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground/70"
            )}
          >
            <span className={cn(
              "transition-all duration-300",
              activeMode === mode.id ? "scale-110" : "scale-100"
            )}>
              {mode.icon}
            </span>
            <span className="text-sm font-medium whitespace-nowrap hidden sm:block">
              {mode.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}