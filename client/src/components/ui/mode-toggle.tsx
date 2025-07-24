import { Button } from "@/components/ui/button";
import { Lock, Users } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeToggleProps {
  mode: "personal" | "public";
  onModeChange: (mode: "personal" | "public") => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex items-center bg-muted rounded-lg p-1">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange("personal")}
        className={cn(
          "relative rounded-md px-3 py-1.5 text-sm font-medium transition-all",
          mode === "personal"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Lock className="w-3 h-3 mr-1.5" />
        Personal
        {mode === "personal" && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full" />
        )}
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onModeChange("public")}
        className={cn(
          "relative rounded-md px-3 py-1.5 text-sm font-medium transition-all",
          mode === "public"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Users className="w-3 h-3 mr-1.5" />
        Groups
        {mode === "public" && (
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </Button>
    </div>
  );
}