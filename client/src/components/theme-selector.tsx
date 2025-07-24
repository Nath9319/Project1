import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Palette, 
  Heart,
  Leaf,
  Waves,
  Sun,
  Moon,
  Sparkles
} from "lucide-react";
import { RainbowIcon } from "@/components/ui/rainbow-icon";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface ColorTheme {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    foreground: string;
    card: string;
    muted: string;
  };
  cssVars: {
    [key: string]: string;
  };
}

const colorThemes: ColorTheme[] = [
  {
    id: "serene-blue",
    name: "Serene Blue",
    description: "Calming blues that reduce stress and promote tranquility",
    icon: <Waves className="w-5 h-5" />,
    colors: {
      primary: "#5B9BD5",
      secondary: "#A7CAE3",
      accent: "#D4EDF6",
      background: "#F5F9FC",
      foreground: "#1A3A52",
      card: "#FFFFFF",
      muted: "#E8F2F9"
    },
    cssVars: {
      "--primary": "207 62% 59%",
      "--secondary": "207 52% 77%",
      "--accent": "199 65% 89%",
      "--background": "210 40% 98%",
      "--foreground": "210 51% 21%",
      "--card": "0 0% 100%",
      "--muted": "207 56% 93%"
    }
  },
  {
    id: "healing-green",
    name: "Healing Green",
    description: "Nature-inspired greens for balance and renewal",
    icon: <Leaf className="w-5 h-5" />,
    colors: {
      primary: "#4CAF50",
      secondary: "#81C784",
      accent: "#C4F0ED",
      background: "#F1F8E9",
      foreground: "#1B5E20",
      card: "#FFFFFF",
      muted: "#E8F5E9"
    },
    cssVars: {
      "--primary": "122 39% 49%",
      "--secondary": "122 39% 65%",
      "--accent": "175 61% 87%",
      "--background": "88 52% 94%",
      "--foreground": "122 60% 24%",
      "--card": "0 0% 100%",
      "--muted": "122 52% 92%"
    }
  },
  {
    id: "soft-pastel",
    name: "Soft Pastels",
    description: "Gentle pastels that lower stress and create calm",
    icon: <Sun className="w-5 h-5" />,
    colors: {
      primary: "#F8BBD0",
      secondary: "#E1BEE7",
      accent: "#C5CAE9",
      background: "#FFF3E0",
      foreground: "#4A148C",
      card: "#FFFFFF",
      muted: "#F3E5F5"
    },
    cssVars: {
      "--primary": "340 82% 85%",
      "--secondary": "291 40% 85%",
      "--accent": "231 48% 84%",
      "--background": "34 100% 94%",
      "--foreground": "270 75% 31%",
      "--card": "0 0% 100%",
      "--muted": "291 52% 94%"
    }
  },
  {
    id: "teal-harmony",
    name: "Teal Harmony",
    description: "Balanced teal and purple for clarity and insight",
    icon: <Sparkles className="w-5 h-5" />,
    colors: {
      primary: "#20C1BF",
      secondary: "#057672",
      accent: "#A7CAE3",
      background: "#ECE9D9",
      foreground: "#2E3E61",
      card: "#FFFFFF",
      muted: "#6A8189"
    },
    cssVars: {
      "--primary": "179 72% 44%",
      "--secondary": "178 88% 24%",
      "--accent": "207 52% 77%",
      "--background": "45 29% 88%",
      "--foreground": "223 36% 28%",
      "--card": "0 0% 100%",
      "--muted": "195 11% 48%"
    }
  },
  {
    id: "moonlight",
    name: "Moonlight Calm",
    description: "Soothing night theme for reduced eye strain",
    icon: <Moon className="w-5 h-5" />,
    colors: {
      primary: "#9C88FF",
      secondary: "#5F27CD",
      accent: "#48DBFB",
      background: "#1E1E2E",
      foreground: "#F8F8F2",
      card: "#2A2A3E",
      muted: "#44475A"
    },
    cssVars: {
      "--primary": "250 100% 77%",
      "--secondary": "259 73% 48%",
      "--accent": "193 92% 64%",
      "--background": "240 21% 15%",
      "--foreground": "60 30% 96%",
      "--card": "240 21% 20%",
      "--muted": "232 14% 31%"
    }
  },
  {
    id: "pride-rainbow",
    name: "Pride Rainbow",
    description: "Celebrating diversity with vibrant LGBTQ+ colors",
    icon: <RainbowIcon className="w-5 h-5" />,
    colors: {
      primary: "#E40303",
      secondary: "#FF8C00",
      accent: "#008026",
      background: "#F8F8FF",
      foreground: "#24408E",
      card: "#FFFFFF",
      muted: "#FFB6C1"
    },
    cssVars: {
      "--primary": "0 96% 45%",
      "--secondary": "33 100% 50%",
      "--accent": "142 100% 25%",
      "--background": "240 100% 99%",
      "--foreground": "222 68% 34%",
      "--card": "0 0% 100%",
      "--muted": "351 100% 86%"
    }
  },
  {
    id: "trans-pride",
    name: "Trans Pride",
    description: "Soft trans flag colors for inclusivity",
    icon: <Heart className="w-5 h-5" />,
    colors: {
      primary: "#5BCEFA",
      secondary: "#F5A9B8",
      accent: "#FFFFFF",
      background: "#F0F8FF",
      foreground: "#2C2C2C",
      card: "#FFFFFF",
      muted: "#E6F3FF"
    },
    cssVars: {
      "--primary": "195 93% 66%",
      "--secondary": "349 78% 82%",
      "--accent": "0 0% 100%",
      "--background": "210 100% 97%",
      "--foreground": "0 0% 17%",
      "--card": "0 0% 100%",
      "--muted": "210 100% 95%"
    }
  },
  {
    id: "bi-pride",
    name: "Bi Pride",
    description: "Bisexual pride colors in calming tones",
    icon: <Heart className="w-5 h-5" />,
    colors: {
      primary: "#D60270",
      secondary: "#9B4F96",
      accent: "#0038A8",
      background: "#FAF0F6",
      foreground: "#2A0845",
      card: "#FFFFFF",
      muted: "#E8D5E8"
    },
    cssVars: {
      "--primary": "329 98% 42%",
      "--secondary": "303 32% 46%",
      "--accent": "219 100% 33%",
      "--background": "320 60% 97%",
      "--foreground": "270 81% 15%",
      "--card": "0 0% 100%",
      "--muted": "300 31% 88%"
    }
  },
  {
    id: "nonbinary-pride",
    name: "Non-Binary Pride",
    description: "Non-binary flag colors for all identities",
    icon: <Heart className="w-5 h-5" />,
    colors: {
      primary: "#FCF434",
      secondary: "#9C59D1",
      accent: "#2C2C2C",
      background: "#FAF8F0",
      foreground: "#2C2C2C",
      card: "#FFFFFF",
      muted: "#E8E8E8"
    },
    cssVars: {
      "--primary": "58 95% 59%",
      "--secondary": "271 52% 58%",
      "--accent": "0 0% 17%",
      "--background": "50 60% 97%",
      "--foreground": "0 0% 17%",
      "--card": "0 0% 100%",
      "--muted": "0 0% 91%"
    }
  },
  {
    id: "ace-pride",
    name: "Ace Pride",
    description: "Asexual pride colors in soothing shades",
    icon: <Heart className="w-5 h-5" />,
    colors: {
      primary: "#A3A3A3",
      secondary: "#810081",
      accent: "#FFFFFF",
      background: "#F5F5F5",
      foreground: "#000000",
      card: "#FFFFFF",
      muted: "#D3D3D3"
    },
    cssVars: {
      "--primary": "0 0% 64%",
      "--secondary": "300 100% 25%",
      "--accent": "0 0% 100%",
      "--background": "0 0% 96%",
      "--foreground": "0 0% 0%",
      "--card": "0 0% 100%",
      "--muted": "0 0% 83%"
    }
  },
  {
    id: "lesbian-pride",
    name: "Lesbian Pride",
    description: "Lesbian pride colors with warm sunset tones",
    icon: <Heart className="w-5 h-5" />,
    colors: {
      primary: "#D62900",
      secondary: "#FF9B56",
      accent: "#D462A6",
      background: "#FFF5F5",
      foreground: "#4A0E0E",
      card: "#FFFFFF",
      muted: "#FFE5E5"
    },
    cssVars: {
      "--primary": "13 100% 42%",
      "--secondary": "26 100% 67%",
      "--accent": "328 60% 60%",
      "--background": "0 100% 98%",
      "--foreground": "0 72% 18%",
      "--card": "0 0% 100%",
      "--muted": "0 100% 95%"
    }
  },
  {
    id: "pan-pride",
    name: "Pan Pride",
    description: "Pansexual pride colors for all-inclusive love",
    icon: <Heart className="w-5 h-5" />,
    colors: {
      primary: "#FF1B8D",
      secondary: "#FFD800",
      accent: "#1BB3FF",
      background: "#FFF8F8",
      foreground: "#2A0A0A",
      card: "#FFFFFF",
      muted: "#FFE8F1"
    },
    cssVars: {
      "--primary": "333 100% 55%",
      "--secondary": "50 100% 50%",
      "--accent": "200 100% 55%",
      "--background": "0 100% 99%",
      "--foreground": "0 63% 10%",
      "--card": "0 0% 100%",
      "--muted": "337 100% 95%"
    }
  }
];

export function ThemeSelector() {
  const [selectedTheme, setSelectedTheme] = useState("serene-blue");
  const [isOpen, setIsOpen] = useState(false);

  const applyTheme = (themeId: string) => {
    const theme = colorThemes.find(t => t.id === themeId);
    if (!theme) return;

    // Apply CSS variables to root
    const root = document.documentElement;
    Object.entries(theme.cssVars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Save theme preference
    localStorage.setItem("mindsync-color-theme", themeId);
    setSelectedTheme(themeId);
    setIsOpen(false);
  };

  // Load saved theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("mindsync-color-theme");
    if (savedTheme) {
      applyTheme(savedTheme);
    }
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="glass-subtle">
          <Palette className="h-5 w-5" />
          <span className="sr-only">Change color theme</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose Your Color Theme</DialogTitle>
          <DialogDescription>
            Select a color scheme that feels right for you. We offer calming themes backed by color psychology 
            and inclusive LGBTQ+ pride themes to celebrate your identity.
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-6">
          <RadioGroup value={selectedTheme} onValueChange={setSelectedTheme}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {colorThemes.map((theme) => (
                <Card 
                  key={theme.id}
                  className={`glass-card cursor-pointer transition-all ${
                    selectedTheme === theme.id ? 'ring-2 ring-primary shadow-ios-lg' : ''
                  }`}
                  onClick={() => setSelectedTheme(theme.id)}
                >
                  <div className="p-4">
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value={theme.id} id={theme.id} className="mt-1" />
                      <Label htmlFor={theme.id} className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className="p-2 rounded-lg glass-subtle" style={{
                            backgroundColor: theme.colors.primary + '20'
                          }}>
                            {theme.icon}
                          </div>
                          <span className="font-semibold">{theme.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {theme.description}
                        </p>
                        <div className="flex space-x-2">
                          {Object.values(theme.colors).slice(0, 5).map((color, idx) => (
                            <div
                              key={idx}
                              className="w-8 h-8 rounded-full shadow-sm"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </Label>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </RadioGroup>
          
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => applyTheme(selectedTheme)}>
              Apply Theme
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}