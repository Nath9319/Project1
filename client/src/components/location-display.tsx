import { MapPin, Navigation } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface LocationDisplayProps {
  location: {
    lat: number;
    lng: number;
    name?: string;
    address?: string;
    timestamp: string;
    type: 'live' | 'checkin';
  };
  className?: string;
}

export function LocationDisplay({ location, className = "" }: LocationDisplayProps) {
  const timeAgo = formatDistanceToNow(new Date(location.timestamp), { addSuffix: true });
  
  if (location.type === 'checkin' && location.name) {
    return (
      <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
        <MapPin className="h-3.5 w-3.5" />
        <span className="font-medium">{location.name}</span>
        {location.address && (
          <span className="text-xs">• {location.address}</span>
        )}
        <span className="text-xs">• {timeAgo}</span>
      </div>
    );
  }
  
  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground ${className}`}>
      <Navigation className="h-3.5 w-3.5 animate-pulse" />
      <span>Live location shared</span>
      {location.address && (
        <span className="text-xs">• {location.address.split(',')[0]}</span>
      )}
      <span className="text-xs">• {timeAgo}</span>
    </div>
  );
}