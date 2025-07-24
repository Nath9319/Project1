import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MapPin, Navigation, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Location {
  lat: number;
  lng: number;
  name?: string;
  address?: string;
  timestamp: string;
  type: 'live' | 'checkin';
}

interface LocationSharingProps {
  onLocationSelect: (location: Location | null) => void;
  currentLocation?: Location | null;
}

export function LocationSharing({ onLocationSelect, currentLocation }: LocationSharingProps) {
  const [isSharing, setIsSharing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showCheckInDialog, setShowCheckInDialog] = useState(false);
  const [checkInName, setCheckInName] = useState("");
  const [checkInAddress, setCheckInAddress] = useState("");
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (currentLocation) {
      setIsSharing(true);
    }
  }, [currentLocation]);
  
  const getCurrentLocation = () => {
    return new Promise<GeolocationPosition>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by your browser"));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          switch(error.code) {
            case error.PERMISSION_DENIED:
              reject(new Error("Location permission denied. Please enable location access in your browser settings."));
              break;
            case error.POSITION_UNAVAILABLE:
              reject(new Error("Location information is unavailable."));
              break;
            case error.TIMEOUT:
              reject(new Error("Location request timed out."));
              break;
            default:
              reject(new Error("An unknown error occurred."));
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  };
  
  const handleShareLiveLocation = async () => {
    setIsLoading(true);
    try {
      const position = await getCurrentLocation();
      setPosition(position);
      
      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        timestamp: new Date().toISOString(),
        type: 'live'
      };
      
      // Try to get address using reverse geocoding (simplified version)
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${location.lat}&lon=${location.lng}&format=json`
        );
        if (response.ok) {
          const data = await response.json();
          location.address = data.display_name;
        }
      } catch (error) {
        console.error("Failed to get address:", error);
      }
      
      setIsSharing(true);
      onLocationSelect(location);
      
      toast({
        title: "Location shared",
        description: "Your live location is now being shared",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get location",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCheckIn = async () => {
    if (!checkInName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a location name",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const position = await getCurrentLocation();
      
      const location: Location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        name: checkInName,
        address: checkInAddress || undefined,
        timestamp: new Date().toISOString(),
        type: 'checkin'
      };
      
      setIsSharing(true);
      onLocationSelect(location);
      setShowCheckInDialog(false);
      setCheckInName("");
      setCheckInAddress("");
      
      toast({
        title: "Checked in!",
        description: `You checked in at ${checkInName}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to check in",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleStopSharing = () => {
    setIsSharing(false);
    onLocationSelect(null);
    toast({
      title: "Location removed",
      description: "Your location is no longer being shared",
    });
  };
  
  return (
    <>
      <div className="flex items-center gap-2">
        {!isSharing ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={handleShareLiveLocation}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4 mr-2" />
              )}
              Share Live Location
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCheckInDialog(true)}
              disabled={isLoading}
            >
              <MapPin className="h-4 w-4 mr-2" />
              Check In
            </Button>
          </>
        ) : (
          <Card className="p-3 flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              {currentLocation?.type === 'live' ? (
                <>
                  <Navigation className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm">
                    Sharing live location
                    {currentLocation.address && (
                      <span className="text-muted-foreground ml-1">
                        • {currentLocation.address.split(',')[0]}
                      </span>
                    )}
                  </span>
                </>
              ) : (
                <>
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="text-sm">
                    {currentLocation?.name}
                    {currentLocation?.address && (
                      <span className="text-muted-foreground ml-1">
                        • {currentLocation.address}
                      </span>
                    )}
                  </span>
                </>
              )}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={handleStopSharing}
            >
              <X className="h-4 w-4" />
            </Button>
          </Card>
        )}
      </div>
      
      <Dialog open={showCheckInDialog} onOpenChange={setShowCheckInDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check In to Location</DialogTitle>
            <DialogDescription>
              Share your current location with a custom name
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <label htmlFor="location-name" className="text-sm font-medium">
                Location Name *
              </label>
              <Input
                id="location-name"
                placeholder="e.g., Central Park, Home, Office"
                value={checkInName}
                onChange={(e) => setCheckInName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <label htmlFor="location-address" className="text-sm font-medium">
                Address (optional)
              </label>
              <Input
                id="location-address"
                placeholder="e.g., 123 Main St, New York"
                value={checkInAddress}
                onChange={(e) => setCheckInAddress(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCheckInDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCheckIn}
                disabled={isLoading || !checkInName.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Getting location...
                  </>
                ) : (
                  <>
                    <MapPin className="h-4 w-4 mr-2" />
                    Check In
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}