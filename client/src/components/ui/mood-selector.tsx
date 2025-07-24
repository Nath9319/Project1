import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Smile, 
  Heart, 
  Zap, 
  CloudRain, 
  Angry, 
  AlertCircle,
  Sun,
  TreePine,
  TrendingUp,
  Coffee
} from "lucide-react";

interface MoodSelectorProps {
  selectedMoods: string[];
  onMoodsChange: (moods: string[]) => void;
  maxSelections?: number;
}

const MOOD_OPTIONS = [
  { id: "grateful", label: "Grateful", icon: Heart, color: "emotion-grateful" },
  { id: "happy", label: "Happy", icon: Smile, color: "emotion-happy" },
  { id: "excited", label: "Excited", icon: Zap, color: "emotion-excited" },
  { id: "peaceful", label: "Peaceful", icon: TreePine, color: "emotion-peaceful" },
  { id: "growth", label: "Growth", icon: TrendingUp, color: "emotion-growth" },
  { id: "overwhelmed", label: "Overwhelmed", icon: AlertCircle, color: "emotion-overwhelmed" },
  { id: "sad", label: "Sad", icon: CloudRain, color: "emotion-sad" },
  { id: "anxious", label: "Anxious", icon: Coffee, color: "emotion-anxious" },
  { id: "frustrated", label: "Frustrated", icon: Angry, color: "emotion-anxious" },
  { id: "content", label: "Content", icon: Sun, color: "emotion-peaceful" },
];

export function MoodSelector({ 
  selectedMoods, 
  onMoodsChange, 
  maxSelections = 5 
}: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleMoodToggle = (moodId: string) => {
    if (selectedMoods.includes(moodId)) {
      // Remove mood
      onMoodsChange(selectedMoods.filter(id => id !== moodId));
    } else {
      // Add mood (respect max selections)
      if (selectedMoods.length < maxSelections) {
        onMoodsChange([...selectedMoods, moodId]);
      }
    }
  };

  const getSelectedMoodLabels = () => {
    return selectedMoods.map(id => {
      const mood = MOOD_OPTIONS.find(m => m.id === id);
      return mood?.label || id;
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-2 text-slate-600 hover:text-primary hover:bg-slate-100"
        >
          <Smile className="w-4 h-4" />
          <span>
            {selectedMoods.length === 0 
              ? "Mood" 
              : selectedMoods.length === 1 
                ? getSelectedMoodLabels()[0]
                : `${selectedMoods.length} moods`
            }
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">How are you feeling?</h4>
            <p className="text-sm text-slate-600">
              Select up to {maxSelections} emotions that describe your current state.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {MOOD_OPTIONS.map((mood) => {
              const isSelected = selectedMoods.includes(mood.id);
              const Icon = mood.icon;
              
              return (
                <Button
                  key={mood.id}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleMoodToggle(mood.id)}
                  disabled={!isSelected && selectedMoods.length >= maxSelections}
                  className={`flex items-center space-x-2 justify-start h-auto py-2 px-3 ${
                    isSelected 
                      ? "bg-primary text-primary-foreground" 
                      : "hover:bg-slate-50"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{mood.label}</span>
                </Button>
              );
            })}
          </div>

          {selectedMoods.length > 0 && (
            <div className="pt-2 border-t border-slate-200">
              <p className="text-xs font-medium text-slate-500 mb-2">SELECTED</p>
              <div className="flex flex-wrap gap-1">
                {selectedMoods.map((moodId) => {
                  const mood = MOOD_OPTIONS.find(m => m.id === moodId);
                  if (!mood) return null;
                  
                  return (
                    <Badge
                      key={moodId}
                      className={`emotion-tag ${mood.color} cursor-pointer`}
                      onClick={() => handleMoodToggle(moodId)}
                    >
                      {mood.label} ×
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-slate-500">
              {selectedMoods.length} of {maxSelections} selected
            </p>
            <Button 
              size="sm" 
              onClick={() => setIsOpen(false)}
              className="bg-primary hover:bg-primary/90"
            >
              Done
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
