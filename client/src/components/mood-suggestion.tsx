import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { X, Sparkles } from "lucide-react";
import { analyzeMoodFromText, hasEmotionalContent } from "@/lib/moodAnalyzer";
import { type Mood } from "@shared/moods";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { cn } from "@/lib/utils";

interface MoodSuggestionProps {
  content: string;
  onClose: () => void;
}

export function MoodSuggestion({ content, onClose }: MoodSuggestionProps) {
  const [suggestedMoods, setSuggestedMoods] = useState<Mood[]>([]);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const queryClient = useQueryClient();
  
  const updateMoodMutation = useMutation({
    mutationFn: (moodId: string) => apiRequest("/api/mood", "POST", { moodId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mood"] });
      onClose();
    },
  });
  
  useEffect(() => {
    if (hasEmotionalContent(content)) {
      const moods = analyzeMoodFromText(content);
      setSuggestedMoods(moods);
    } else {
      setSuggestedMoods([]);
    }
  }, [content]);
  
  const handleSelectMood = (mood: Mood) => {
    setSelectedMood(mood);
    updateMoodMutation.mutate(mood.id);
  };
  
  if (suggestedMoods.length === 0) {
    return null;
  }
  
  return (
    <Card className="glass-card p-4 mb-4 relative">
      <button
        onClick={onClose}
        className="absolute top-2 right-2 p-1 rounded-lg hover:bg-secondary/80 transition-colors"
        aria-label="Close mood suggestions"
      >
        <X className="h-4 w-4 text-muted-foreground" />
      </button>
      
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="h-4 w-4 text-primary" />
        <p className="text-sm font-medium">Based on your entry, are you feeling...</p>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {suggestedMoods.map((mood) => (
          <Button
            key={mood.id}
            variant="outline"
            size="sm"
            onClick={() => handleSelectMood(mood)}
            disabled={updateMoodMutation.isPending}
            className={cn(
              "flex items-center gap-2",
              selectedMood?.id === mood.id && "ring-2 ring-primary"
            )}
          >
            <span className="text-lg">{mood.emoji}</span>
            <span>{mood.label}</span>
          </Button>
        ))}
      </div>
      
      {updateMoodMutation.isPending && (
        <p className="text-xs text-muted-foreground mt-2">Updating your mood...</p>
      )}
    </Card>
  );
}