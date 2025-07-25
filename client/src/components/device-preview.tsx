import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Monitor, Tablet, Smartphone, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type DeviceType = "mobile" | "tablet" | "desktop";

interface DeviceConfig {
  name: string;
  width: number;
  height: number;
  scale: number;
}

const devices: Record<DeviceType, DeviceConfig> = {
  mobile: {
    name: "iPhone 14 Pro",
    width: 393,
    height: 852,
    scale: 0.9
  },
  tablet: {
    name: "iPad Air",
    width: 820,
    height: 1180,
    scale: 0.7
  },
  desktop: {
    name: "MacBook Pro",
    width: 1440,
    height: 900,
    scale: 0.6
  }
};

export function DevicePreview() {
  const [showPreview, setShowPreview] = useState(false);
  const [activeDevice, setActiveDevice] = useState<DeviceType>("tablet");

  const currentDevice = devices[activeDevice];

  return (
    <>
      {/* Preview Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowPreview(true)}
        className="fixed bottom-20 right-4 z-40 h-12 w-12 rounded-full shadow-lg glass-button hover:shadow-xl transition-all duration-300 hover:scale-110"
        title="Device Preview"
      >
        <Maximize2 className="h-5 w-5" />
      </Button>

      {/* Device Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b glass-subtle">
            <DialogTitle className="flex items-center justify-between">
              <span className="text-lg font-semibold">Device Preview</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowPreview(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>

          {/* Device Selector */}
          <Tabs value={activeDevice} onValueChange={(v) => setActiveDevice(v as DeviceType)} className="h-full">
            <div className="border-b glass-subtle">
              <TabsList className="w-full justify-start p-2 h-auto bg-transparent">
                <TabsTrigger 
                  value="mobile" 
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile
                </TabsTrigger>
                <TabsTrigger 
                  value="tablet"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
                >
                  <Tablet className="h-4 w-4 mr-2" />
                  Tablet
                </TabsTrigger>
                <TabsTrigger 
                  value="desktop"
                  className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:shadow-sm"
                >
                  <Monitor className="h-4 w-4 mr-2" />
                  Desktop
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Device Preview Content */}
            <TabsContent value={activeDevice} className="mt-0 h-[calc(100%-8rem)]">
              <div className="p-8 bg-gray-100 dark:bg-gray-900 h-full flex items-center justify-center">
                {/* Device Frame */}
                <div 
                  className={cn(
                    "relative transition-all duration-500",
                    activeDevice === "mobile" && "bg-black rounded-[3rem] p-2 shadow-2xl",
                    activeDevice === "tablet" && "bg-gray-800 rounded-[2rem] p-3 shadow-2xl",
                    activeDevice === "desktop" && "bg-gray-700 rounded-t-xl shadow-2xl"
                  )}
                  style={{
                    width: `${currentDevice.width * currentDevice.scale}px`,
                    height: activeDevice === "desktop" 
                      ? `${currentDevice.height * currentDevice.scale + 20}px`
                      : `${currentDevice.height * currentDevice.scale}px`
                  }}
                >
                  {/* Device Details */}
                  {activeDevice === "mobile" && (
                    <>
                      {/* Notch */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10"></div>
                      {/* Side buttons */}
                      <div className="absolute top-24 -left-1 w-1 h-8 bg-gray-700 rounded-r-full"></div>
                      <div className="absolute top-36 -left-1 w-1 h-12 bg-gray-700 rounded-r-full"></div>
                      <div className="absolute top-32 -right-1 w-1 h-16 bg-gray-700 rounded-l-full"></div>
                    </>
                  )}

                  {activeDevice === "tablet" && (
                    <>
                      {/* Home button */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gray-600 rounded-full"></div>
                      {/* Camera */}
                      <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-600 rounded-full"></div>
                    </>
                  )}

                  {activeDevice === "desktop" && (
                    <>
                      {/* MacBook bottom */}
                      <div className="absolute -bottom-5 left-0 right-0 h-5 bg-gray-600 rounded-b-xl"></div>
                      {/* MacBook notch */}
                      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-500 rounded-t-lg"></div>
                    </>
                  )}

                  {/* Screen */}
                  <div 
                    className={cn(
                      "relative w-full h-full bg-white dark:bg-gray-950 overflow-hidden",
                      activeDevice === "mobile" && "rounded-[2.5rem]",
                      activeDevice === "tablet" && "rounded-xl",
                      activeDevice === "desktop" && "rounded-t-lg"
                    )}
                  >
                    <iframe
                      src={window.location.href}
                      className="w-full h-full border-0"
                      style={{
                        transform: `scale(${1 / currentDevice.scale})`,
                        transformOrigin: "top left",
                        width: `${100 * currentDevice.scale}%`,
                        height: `${100 * currentDevice.scale}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Device Info Footer */}
          <div className="p-4 border-t glass-subtle">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-medium">{currentDevice.name}</span>
              <span>{currentDevice.width} × {currentDevice.height}px</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}