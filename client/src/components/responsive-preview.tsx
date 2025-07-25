import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Tablet, Monitor, Smartphone, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResponsivePreviewProps {
  className?: string;
}

type ViewMode = "auto" | "mobile" | "tablet" | "desktop";

export function ResponsivePreview({ className }: ResponsivePreviewProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("auto");
  const [actualWidth, setActualWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => {
      setActualWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Define breakpoints
  const breakpoints = {
    mobile: 640,
    tablet: 1024,
    desktop: 1280
  };

  // Get current viewport info
  const getViewportInfo = () => {
    if (actualWidth < breakpoints.mobile) return { type: "mobile", icon: Smartphone };
    if (actualWidth < breakpoints.tablet) return { type: "tablet", icon: Tablet };
    return { type: "desktop", icon: Monitor };
  };

  const viewportInfo = getViewportInfo();

  // Force viewport width for preview modes
  useEffect(() => {
    const root = document.documentElement;
    
    if (viewMode === "auto") {
      root.style.removeProperty("max-width");
      root.style.removeProperty("margin");
    } else {
      const widths = {
        mobile: "375px",
        tablet: "768px",
        desktop: "1440px"
      };
      
      root.style.maxWidth = widths[viewMode];
      root.style.margin = "0 auto";
    }

    return () => {
      root.style.removeProperty("max-width");
      root.style.removeProperty("margin");
    };
  }, [viewMode]);

  return (
    <div className={cn("fixed bottom-4 left-4 z-40 glass-strong rounded-lg shadow-lg p-2", className)}>
      <div className="flex items-center space-x-1">
        {/* Auto mode */}
        <Button
          variant={viewMode === "auto" ? "default" : "ghost"}
          size="sm"
          onClick={() => setViewMode("auto")}
          className="h-8 px-3"
        >
          <Check className="h-3 w-3 mr-1" />
          Auto
        </Button>

        {/* Mobile */}
        <Button
          variant={viewMode === "mobile" ? "default" : "ghost"}
          size="icon"
          onClick={() => setViewMode("mobile")}
          className="h-8 w-8"
          title="Mobile View (375px)"
        >
          <Smartphone className="h-4 w-4" />
        </Button>

        {/* Tablet */}
        <Button
          variant={viewMode === "tablet" ? "default" : "ghost"}
          size="icon"
          onClick={() => setViewMode("tablet")}
          className="h-8 w-8"
          title="Tablet View (768px)"
        >
          <Tablet className="h-4 w-4" />
        </Button>

        {/* Desktop */}
        <Button
          variant={viewMode === "desktop" ? "default" : "ghost"}
          size="icon"
          onClick={() => setViewMode("desktop")}
          className="h-8 w-8"
          title="Desktop View (1440px)"
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>

      {/* Current viewport info */}
      <div className="mt-2 px-2 text-xs text-muted-foreground text-center">
        {viewMode === "auto" ? (
          <>
            <viewportInfo.icon className="h-3 w-3 inline mr-1" />
            {actualWidth}px
          </>
        ) : (
          <span className="font-medium">
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} Preview
          </span>
        )}
      </div>
    </div>
  );
}

// Add CSS for smooth transitions
const style = document.createElement('style');
style.textContent = `
  html {
    transition: max-width 0.3s ease-in-out;
  }
  
  @media (min-width: 768px) {
    .responsive-preview-active body {
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 10px,
        rgba(0, 0, 0, 0.03) 10px,
        rgba(0, 0, 0, 0.03) 20px
      );
    }
  }
`;
document.head.appendChild(style);