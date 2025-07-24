import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Palette, 
  Sun, 
  Moon, 
  Leaf, 
  Briefcase, 
  Sparkles,
  Mountain,
  Coffee,
  Heart
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
  };
  preview: string;
}

const templates: Template[] = [
  {
    id: "minimal",
    name: "Minimal Clean",
    description: "Clean, simple design focusing on content",
    icon: <Sun className="w-6 h-6" />,
    colors: {
      primary: "from-slate-600 to-slate-800",
      secondary: "from-gray-100 to-gray-200", 
      accent: "from-blue-500 to-blue-600",
      background: "bg-white"
    },
    preview: "Crisp white backgrounds with subtle shadows and minimal color accents"
  },
  {
    id: "dark-modern",
    name: "Dark Modern",
    description: "Sleek dark theme with vibrant accents",
    icon: <Moon className="w-6 h-6" />,
    colors: {
      primary: "from-purple-500 to-pink-500",
      secondary: "from-gray-800 to-gray-900",
      accent: "from-cyan-400 to-blue-500", 
      background: "bg-gray-900"
    },
    preview: "Dark backgrounds with neon-like accents and modern glass effects"
  },
  {
    id: "nature-zen",
    name: "Nature Zen",
    description: "Calming earth tones inspired by nature",
    icon: <Leaf className="w-6 h-6" />,
    colors: {
      primary: "from-green-600 to-emerald-700",
      secondary: "from-amber-50 to-green-50",
      accent: "from-orange-400 to-amber-500",
      background: "bg-gradient-to-br from-green-50 to-blue-50"
    },
    preview: "Warm earth tones with natural textures and organic shapes"
  },
  {
    id: "professional",
    name: "Professional",
    description: "Clean business-focused design",
    icon: <Briefcase className="w-6 h-6" />,
    colors: {
      primary: "from-blue-600 to-indigo-700",
      secondary: "from-slate-50 to-blue-50",
      accent: "from-teal-500 to-cyan-600",
      background: "bg-slate-50"
    },
    preview: "Corporate-friendly with structured layouts and professional colors"
  },
  {
    id: "creative-colorful",
    name: "Creative Burst",
    description: "Vibrant, energetic design with bold colors",
    icon: <Sparkles className="w-6 h-6" />,
    colors: {
      primary: "from-pink-500 to-rose-500",
      secondary: "from-purple-100 to-pink-100",
      accent: "from-yellow-400 to-orange-500",
      background: "bg-gradient-to-br from-pink-50 via-purple-50 to-yellow-50"
    },
    preview: "Bold gradients with playful elements and creative layouts"
  },
  {
    id: "mountain-serenity",
    name: "Mountain Serenity", 
    description: "Inspired by mountain landscapes",
    icon: <Mountain className="w-6 h-6" />,
    colors: {
      primary: "from-slate-700 to-blue-800",
      secondary: "from-blue-50 to-slate-50",
      accent: "from-indigo-500 to-purple-600",
      background: "bg-gradient-to-b from-blue-50 to-slate-100"
    },
    preview: "Cool mountain-inspired colors with elevated, clean layouts"
  },
  {
    id: "warm-coffee",
    name: "Warm Coffee",
    description: "Cozy, warm tones like a coffee shop",
    icon: <Coffee className="w-6 h-6" />,
    colors: {
      primary: "from-amber-600 to-orange-700",
      secondary: "from-orange-50 to-amber-50", 
      accent: "from-red-500 to-pink-500",
      background: "bg-gradient-to-br from-amber-50 to-orange-100"
    },
    preview: "Warm, inviting colors creating a cozy, comfortable feeling"
  },
  {
    id: "romantic-soft",
    name: "Romantic Soft",
    description: "Gentle pastels with romantic touches",
    icon: <Heart className="w-6 h-6" />,
    colors: {
      primary: "from-rose-400 to-pink-500",
      secondary: "from-pink-50 to-rose-50",
      accent: "from-purple-400 to-pink-400", 
      background: "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50"
    },
    preview: "Soft pastels with romantic elements, perfect for personal journaling"
  }
];

export default function TemplateSelector() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>("minimal");

  const applyTemplate = (templateId: string) => {
    // This would apply the template to the application
    console.log("Applying template:", templateId);
    // Implementation would update CSS variables or theme context
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <Palette className="w-8 h-8 text-purple-600" />
            <h1 className="text-4xl font-bold text-gray-800">Choose Your Template</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a design template that matches your style and creates the perfect atmosphere for your collaborative journaling experience.
          </p>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {templates.map((template) => (
            <Card 
              key={template.id} 
              className={`glass-card cursor-pointer transition-all duration-300 hover:shadow-ios-lg hover:scale-105 ${
                selectedTemplate === template.id 
                  ? 'ring-2 ring-purple-500 shadow-ios-lg' 
                  : ''
              }`}
              onClick={() => setSelectedTemplate(template.id)}
            >
              <CardContent className="p-6">
                {/* Template Preview */}
                <div className={`w-full h-32 rounded-lg mb-4 flex items-center justify-center ${template.colors.background}`}>
                  <div className={`w-16 h-16 bg-gradient-to-br ${template.colors.primary} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                    {template.icon}
                  </div>
                </div>

                {/* Template Info */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{template.name}</h3>
                    {selectedTemplate === template.id && (
                      <Badge className="bg-purple-100 text-purple-700">Selected</Badge>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600">{template.description}</p>
                  
                  <p className="text-xs text-gray-500">{template.preview}</p>

                  {/* Color Palette */}
                  <div className="flex space-x-2">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${template.colors.primary}`}></div>
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${template.colors.secondary}`}></div>
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${template.colors.accent}`}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <Button 
            size="lg" 
            onClick={() => applyTemplate(selectedTemplate)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3"
          >
            Apply Template
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => window.history.back()}
            className="px-8 py-3"
          >
            Keep Current Design
          </Button>
        </div>

        {/* Preview Section */}
        {selectedTemplate && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Template Preview</h2>
            <Card className="glass-card max-w-4xl mx-auto shadow-ios">
              <CardContent className="p-8">
                <div className={`rounded-lg p-6 ${templates.find(t => t.id === selectedTemplate)?.colors.background}`}>
                  <div className="space-y-4">
                    <div className={`h-12 bg-gradient-to-r ${templates.find(t => t.id === selectedTemplate)?.colors.primary} rounded-lg flex items-center px-4`}>
                      <div className="w-8 h-8 bg-white/20 rounded-lg mr-3"></div>
                      <div className="text-white font-semibold">MindSync Dashboard</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className={`h-24 bg-gradient-to-br ${templates.find(t => t.id === selectedTemplate)?.colors.secondary} rounded-lg flex items-center justify-center`}>
                        <div className="text-gray-600 text-sm">Quick Actions</div>
                      </div>
                      <div className={`h-24 bg-gradient-to-br ${templates.find(t => t.id === selectedTemplate)?.colors.accent} rounded-lg flex items-center justify-center`}>
                        <div className="text-white text-sm">Recent Entries</div>
                      </div>
                      <div className={`h-24 bg-gradient-to-br ${templates.find(t => t.id === selectedTemplate)?.colors.secondary} rounded-lg flex items-center justify-center`}>
                        <div className="text-gray-600 text-sm">Groups</div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}