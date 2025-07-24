import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { AVAILABLE_MOODS, type Mood } from "@shared/moods";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface MoodData {
  currentMood: string | null;
  moodEmoji: string | null;
  moodUpdatedAt: string | null;
  needsUpdate?: boolean;
  message?: string;
}

export function MoodSelector() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  
  const { data: moodData } = useQuery<MoodData>({
    queryKey: ["/api/mood"],
  });
  
  const updateMoodMutation = useMutation({
    mutationFn: (moodId: string) => apiRequest("/api/mood", "POST", { moodId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      setOpen(false);
    },
  });
  
  const clearMoodMutation = useMutation({
    mutationFn: () => apiRequest("/api/mood", "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
    },
  });
  
  const currentMood = AVAILABLE_MOODS.find(m => m.id === moodData?.currentMood);
  
  const moodsByCategory = {
    positive: AVAILABLE_MOODS.filter(m => m.category === "positive"),
    energetic: AVAILABLE_MOODS.filter(m => m.category === "energetic"),
    calm: AVAILABLE_MOODS.filter(m => m.category === "calm"),
    neutral: AVAILABLE_MOODS.filter(m => m.category === "neutral"),
    negative: AVAILABLE_MOODS.filter(m => m.category === "negative"),
  };
  
  const categoryLabels = {
    positive: "Feeling Good",
    energetic: "Full of Energy",
    calm: "Peaceful & Calm",
    neutral: "Neutral",
    negative: "Feeling Down",
  };
  
  const handleMoodSelect = (mood: Mood) => {
    updateMoodMutation.mutate(mood.id);
  };
  
  return (
    <div className="flex items-center gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal",
              !currentMood && "text-muted-foreground"
            )}
          >
            {currentMood ? (
              <span className="flex items-center gap-2">
                <span className="text-lg">{currentMood.emoji}</span>
                <span>{currentMood.label}</span>
              </span>
            ) : (
              <span>How are you feeling?</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4">
            <h4 className="font-medium mb-4">Select your mood</h4>
            {moodData?.needsUpdate && (
              <p className="text-sm text-muted-foreground mb-4">
                {moodData.message || "Your mood was reset. How are you feeling now?"}
              </p>
            )}
            <div className="space-y-4">
              {Object.entries(moodsByCategory).map(([category, moods]) => (
                <div key={category}>
                  <h5 className="text-sm font-medium text-muted-foreground mb-2">
                    {categoryLabels[category as keyof typeof categoryLabels]}
                  </h5>
                  <div className="grid grid-cols-4 gap-2">
                    {moods.map((mood) => (
                      <button
                        key={mood.id}
                        onClick={() => handleMoodSelect(mood)}
                        className={cn(
                          "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                          "hover:bg-accent hover:text-accent-foreground",
                          currentMood?.id === mood.id && "bg-accent"
                        )}
                        disabled={updateMoodMutation.isPending}
                      >
                        <span className="text-2xl">{mood.emoji}</span>
                        <span className="text-xs">{mood.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {currentMood && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => clearMoodMutation.mutate()}
          disabled={clearMoodMutation.isPending}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear mood</span>
        </Button>
      )}
    </div>
  );
}