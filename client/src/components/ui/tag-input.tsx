import { useState, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tag, X, Hash } from "lucide-react";

interface TagInputProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder?: string;
  maxTags?: number;
  suggestions?: string[];
}

const DEFAULT_SUGGESTIONS = [
  "family", "work", "relationship", "health", "personal", "goals", 
  "gratitude", "reflection", "memories", "challenges", "growth", 
  "friendship", "travel", "creativity", "mindfulness", "therapy"
];

export function TagInput({ 
  tags, 
  onTagsChange, 
  placeholder = "Add tags...",
  maxTags = 10,
  suggestions = DEFAULT_SUGGESTIONS
}: TagInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleAddTag = (tagText: string) => {
    const trimmedTag = tagText.trim().toLowerCase();
    
    if (trimmedTag && !tags.includes(trimmedTag) && tags.length < maxTags) {
      onTagsChange([...tags, trimmedTag]);
    }
    
    setInputValue("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      // Remove last tag if backspace is pressed with empty input
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      !tags.includes(suggestion) && 
      suggestion.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, 8);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center space-x-2 text-slate-600 hover:text-primary hover:bg-slate-100"
        >
          <Tag className="w-4 h-4" />
          <span>
            {tags.length === 0 
              ? "Tags" 
              : tags.length === 1 
                ? `#${tags[0]}`
                : `${tags.length} tags`
            }
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium text-slate-900 mb-2">Add Tags</h4>
            <p className="text-sm text-slate-600">
              Add up to {maxTags} tags to categorize your entry.
            </p>
          </div>

          {/* Input */}
          <div className="relative">
            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={tags.length >= maxTags}
              className="pl-10"
            />
          </div>

          {/* Current Tags */}
          {tags.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">CURRENT TAGS</p>
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-slate-200 flex items-center space-x-1"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    <span>#{tag}</span>
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          {(inputValue || tags.length === 0) && filteredSuggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-slate-500 mb-2">
                {inputValue ? "MATCHING SUGGESTIONS" : "POPULAR TAGS"}
              </p>
              <div className="grid grid-cols-2 gap-1">
                {filteredSuggestions.map((suggestion) => (
                  <Button
                    key={suggestion}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddTag(suggestion)}
                    disabled={tags.length >= maxTags}
                    className="justify-start text-xs h-8"
                  >
                    #{suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <p className="text-xs text-slate-500">
              {tags.length} of {maxTags} tags
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
