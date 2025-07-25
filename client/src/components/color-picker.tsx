import React, { useCallback, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
  className?: string;
}

const colors = [
  { name: "blue", class: "bg-blue-500", hover: "hover:bg-blue-600" },
  { name: "red", class: "bg-red-500", hover: "hover:bg-red-600" },
  { name: "green", class: "bg-green-500", hover: "hover:bg-green-600" },
  { name: "yellow", class: "bg-yellow-500", hover: "hover:bg-yellow-600" },
  { name: "purple", class: "bg-purple-500", hover: "hover:bg-purple-600" },
  { name: "pink", class: "bg-pink-500", hover: "hover:bg-pink-600" },
  { name: "orange", class: "bg-orange-500", hover: "hover:bg-orange-600" },
  { name: "indigo", class: "bg-indigo-500", hover: "hover:bg-indigo-600" },
  { name: "teal", class: "bg-teal-500", hover: "hover:bg-teal-600" },
  { name: "cyan", class: "bg-cyan-500", hover: "hover:bg-cyan-600" },
  { name: "rose", class: "bg-rose-500", hover: "hover:bg-rose-600" },
  { name: "emerald", class: "bg-emerald-500", hover: "hover:bg-emerald-600" },
];

function ColorPickerComponent({ value = "blue", onChange, className }: ColorPickerProps) {
  const [selected, setSelected] = useState(value);

  // Sync with external value changes
  useEffect(() => {
    if (value !== selected) {
      setSelected(value);
    }
  }, [value]);

  const handleColorSelect = useCallback((color: string) => {
    try {
      if (color !== selected) {
        setSelected(color);
        // Use setTimeout to prevent blocking the UI
        setTimeout(() => {
          onChange(color);
        }, 0);
      }
    } catch (error) {
      console.error("Error selecting color:", error);
    }
  }, [selected, onChange]);

  return (
    <div className={cn("space-y-3", className)}>
      <label className="text-sm font-medium text-foreground">Choose a color for your entry</label>
      <div className="color-grid">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => handleColorSelect(color.name)}
            className={cn(
              "color-button",
              color.class,
              color.hover,
              "shadow-sm hover:shadow-md",
              // Stable ring positioning
              selected === color.name && "ring-2 ring-offset-1 ring-offset-background ring-primary"
            )}
            aria-label={`Select ${color.name} color`}
          >
            {selected === color.name && (
              <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow-md pointer-events-none" />
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        This color will be displayed in your calendar view
      </p>
    </div>
  );
}

export const ColorPicker = React.memo(ColorPickerComponent);