import { useState } from "react";
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

export function ColorPicker({ value = "blue", onChange, className }: ColorPickerProps) {
  const [selected, setSelected] = useState(value);

  const handleColorSelect = (color: string) => {
    setSelected(color);
    onChange(color);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">Choose a color for your entry</label>
      <div className="grid grid-cols-6 gap-2">
        {colors.map((color) => (
          <button
            key={color.name}
            type="button"
            onClick={() => handleColorSelect(color.name)}
            className={cn(
              "relative w-10 h-10 rounded-lg transition-all duration-200",
              color.class,
              color.hover,
              "shadow-md hover:shadow-lg hover:scale-110",
              selected === color.name && "ring-2 ring-offset-2 ring-offset-background ring-gray-800 dark:ring-gray-200"
            )}
            aria-label={`Select ${color.name} color`}
          >
            {selected === color.name && (
              <Check className="absolute inset-0 m-auto w-5 h-5 text-white drop-shadow-lg" />
            )}
          </button>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        This color will be displayed in your calendar view
      </p>
    </div>
  );
}