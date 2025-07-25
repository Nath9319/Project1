import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tablet, X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TabletPreviewProps {
  children: React.ReactNode;
}

export function TabletPreview({ children }: TabletPreviewProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait");

  const dimensions = {
    portrait: { width: 768, height: 1024 },
    landscape: { width: 1024, height: 768 }
  };

  return (
    <>
      {/* Tablet Preview Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowPreview(true)}
        className="fixed bottom-4 right-4 z-50 h-12 w-12 rounded-full shadow-lg glass-button hover:shadow-xl transition-all duration-300 md:hidden lg:flex"
        title="Preview on Tablet"
      >
        <Tablet className="h-5 w-5" />
      </Button>

      {/* Tablet Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b">
            <DialogTitle className="flex items-center justify-between">
              <span>Tablet Preview - {orientation === "portrait" ? "Portrait" : "Landscape"}</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}
                  title="Rotate"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPreview(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogTitle>
          </DialogHeader>

          {/* Tablet Frame */}
          <div className="p-8 bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
            <div 
              className={cn(
                "relative bg-black rounded-[2rem] p-4 shadow-2xl transition-all duration-500",
                orientation === "landscape" ? "transform rotate-0" : ""
              )}
              style={{
                width: `${dimensions[orientation].width * 0.8}px`,
                height: `${dimensions[orientation].height * 0.8}px`,
                maxWidth: "100%",
                maxHeight: "70vh"
              }}
            >
              {/* Tablet Bezel */}
              <div className="absolute top-1/2 left-2 transform -translate-y-1/2 w-1 h-12 bg-gray-800 rounded-full"></div>
              <div className="absolute top-1/2 right-2 transform -translate-y-1/2 w-1 h-12 bg-gray-800 rounded-full"></div>
              
              {/* Home Button */}
              <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-12 bg-gray-800 rounded-full"></div>

              {/* Screen */}
              <div className="relative w-full h-full bg-white dark:bg-gray-950 rounded-2xl overflow-hidden">
                <iframe
                  src={window.location.href}
                  className="w-full h-full border-0"
                  style={{
                    transform: `scale(${orientation === "portrait" ? 0.8 : 0.7})`,
                    transformOrigin: "top left",
                    width: `${100 / (orientation === "portrait" ? 0.8 : 0.7)}%`,
                    height: `${100 / (orientation === "portrait" ? 0.8 : 0.7)}%`
                  }}
                />
              </div>
            </div>
          </div>

          {/* Device Info */}
          <div className="p-4 border-t bg-gray-50 dark:bg-gray-900">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>iPad (9th generation)</span>
              <span>{dimensions[orientation].width} × {dimensions[orientation].height}px</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}