import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Bell, Volume2, VolumeX, Video, Mic, Clock } from "lucide-react";
import { format } from "date-fns";

interface ReminderNotificationProps {
  reminder: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReminderNotification({ reminder, open, onOpenChange }: ReminderNotificationProps) {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);

  // Play notification sound when reminder appears
  useEffect(() => {
    if (open && !isMuted) {
      const audio = new Audio('/notification-sound.mp3');
      audio.play().catch(() => {
        // Fallback if audio fails to play
      });
    }
  }, [open, isMuted]);

  const dismissReminderMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/reminders/${reminder.id}`, {
        isActive: false,
        lastTriggered: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to dismiss reminder.",
        variant: "destructive",
      });
    },
  });

  const snoozeReminderMutation = useMutation({
    mutationFn: async (minutes: number) => {
      const newTime = new Date();
      newTime.setMinutes(newTime.getMinutes() + minutes);
      
      await apiRequest("PATCH", `/api/reminders/${reminder.id}`, {
        reminderTime: newTime.toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reminders"] });
      toast({
        title: "Reminder snoozed",
        description: "You'll be reminded again later.",
      });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to snooze reminder.",
        variant: "destructive",
      });
    },
  });

  const playVoiceNote = () => {
    if (reminder.voiceNote?.url) {
      const audio = new Audio(reminder.voiceNote.url);
      audio.play();
      setAudioPlaying(true);
      audio.onended = () => setAudioPlaying(false);
    }
  };

  const formatReminderTime = () => {
    if (reminder.planId && reminder.plan) {
      return format(new Date(reminder.plan.scheduledFor), "PPP 'at' p");
    }
    return format(new Date(reminder.reminderTime), "PPP 'at' p");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell className="h-5 w-5 text-primary animate-pulse" />
              <DialogTitle>Reminder</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMuted(!isMuted)}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </div>
          <DialogDescription>
            {formatReminderTime()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">{reminder.title}</h3>
            {reminder.description && (
              <p className="text-sm text-muted-foreground">{reminder.description}</p>
            )}
          </div>

          {/* Voice Note */}
          {reminder.voiceNote && (
            <div className="flex items-center justify-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={playVoiceNote}
                disabled={audioPlaying}
              >
                <Mic className="mr-2 h-4 w-4" />
                {audioPlaying ? "Playing..." : "Play Voice Note"}
              </Button>
            </div>
          )}

          {/* Video Note */}
          {reminder.videoNote && (
            <div className="space-y-2">
              <div className="flex items-center justify-center">
                <Video className="h-4 w-4 mr-2" />
                <span className="text-sm">Video message attached</span>
              </div>
              <video
                src={reminder.videoNote.url}
                controls
                className="w-full rounded-lg"
                style={{ maxHeight: '200px' }}
              />
            </div>
          )}

          {/* Plan Details */}
          {reminder.plan && (
            <div className="rounded-lg border p-3 space-y-2">
              <h4 className="font-medium">{reminder.plan.title}</h4>
              {reminder.plan.description && (
                <p className="text-sm text-muted-foreground">{reminder.plan.description}</p>
              )}
              {reminder.plan.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {reminder.plan.location.name || reminder.plan.location.address || "Location set"}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex-col space-y-2 sm:flex-col sm:space-x-0">
          <div className="flex space-x-2 w-full">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => snoozeReminderMutation.mutate(5)}
              disabled={snoozeReminderMutation.isPending}
            >
              Snooze 5 min
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => snoozeReminderMutation.mutate(15)}
              disabled={snoozeReminderMutation.isPending}
            >
              Snooze 15 min
            </Button>
          </div>
          <Button
            className="w-full"
            onClick={() => dismissReminderMutation.mutate()}
            disabled={dismissReminderMutation.isPending}
          >
            Dismiss
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Reminder Manager Component to check for active reminders
export function ReminderManager() {
  const { user } = useAuth();
  const [activeReminder, setActiveReminder] = useState<any>(null);
  const [showNotification, setShowNotification] = useState(false);

  // Poll for active reminders every 30 seconds
  const { data: reminders } = useQuery({
    queryKey: ["/api/reminders/active"],
    refetchInterval: 30000, // 30 seconds
    enabled: !!user,
  });

  useEffect(() => {
    if (reminders && reminders.length > 0) {
      const now = new Date();
      const dueReminder = reminders.find((r: any) => {
        const reminderTime = new Date(r.reminderTime);
        return reminderTime <= now && r.isActive;
      });

      if (dueReminder && (!activeReminder || activeReminder.id !== dueReminder.id)) {
        setActiveReminder(dueReminder);
        setShowNotification(true);
      }
    }
  }, [reminders, activeReminder]);

  if (!activeReminder) return null;

  return (
    <ReminderNotification
      reminder={activeReminder}
      open={showNotification}
      onOpenChange={setShowNotification}
    />
  );
}