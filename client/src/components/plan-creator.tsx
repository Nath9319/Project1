import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LocationSharing } from "./location-sharing";
import { MediaUpload } from "./ui/media-upload";
import { CalendarIcon, Clock, Bell, Mic, Video, MapPin } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PlanCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId?: number;
  partnerSpaceId?: number;
}

export function PlanCreator({ open, onOpenChange, groupId, partnerSpaceId }: PlanCreatorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledDate, setScheduledDate] = useState<Date>();
  const [scheduledTime, setScheduledTime] = useState("12:00");
  const [location, setLocation] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderMinutes, setReminderMinutes] = useState("30");
  const [voiceNote, setVoiceNote] = useState<any>(null);
  const [videoNote, setVideoNote] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const createPlanMutation = useMutation({
    mutationFn: async (planData: any) => {
      return await apiRequest("POST", "/api/plans", planData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/plans"] });
      toast({
        title: "Success",
        description: "Plan created successfully.",
      });
      resetForm();
      onOpenChange(false);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setScheduledDate(undefined);
    setScheduledTime("12:00");
    setLocation(null);
    setAttachments([]);
    setReminderEnabled(true);
    setReminderMinutes("30");
    setVoiceNote(null);
    setVideoNote(null);
  };

  const handleSubmit = () => {
    if (!title || !scheduledDate) {
      toast({
        title: "Missing fields",
        description: "Please fill in the title and scheduled date.",
        variant: "destructive",
      });
      return;
    }

    const [hours, minutes] = scheduledTime.split(":");
    const scheduledFor = new Date(scheduledDate);
    scheduledFor.setHours(parseInt(hours), parseInt(minutes));

    const planData = {
      title,
      description,
      createdBy: user?.id,
      groupId,
      partnerSpaceId,
      visibility: groupId ? "group" : partnerSpaceId ? "partner" : "private",
      scheduledFor: scheduledFor.toISOString(),
      location,
      attachments: [...attachments, voiceNote, videoNote].filter(Boolean),
      reminderSettings: reminderEnabled ? {
        enabled: true,
        minutesBefore: parseInt(reminderMinutes),
        soundEnabled: true,
      } : null,
    };

    createPlanMutation.mutate(planData);
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: type === 'video',
      });

      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: type === 'audio' ? 'audio/webm' : 'video/webm' });
        const url = URL.createObjectURL(blob);
        
        if (type === 'audio') {
          setVoiceNote({ url, duration: 0, mimeType: 'audio/webm' });
        } else {
          setVideoNote({ url, duration: 0, mimeType: 'video/webm' });
        }
        
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Permission denied",
        description: `Please allow ${type} access to record.`,
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      setMediaRecorder(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Plan</DialogTitle>
          <DialogDescription>
            Schedule a future event or reminder with optional voice/video notes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter plan title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={scheduledDate}
                    onSelect={setScheduledDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Time</Label>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Location</Label>
            <LocationSharing
              onLocationSelect={setLocation}
              currentLocation={location}
            />
          </div>

          <div className="space-y-2">
            <Label>Attachments</Label>
            <MediaUpload
              onAttachmentsChange={setAttachments}
              maxFiles={3}
              maxSizePerFile={25}
            />
          </div>

          <div className="space-y-2">
            <Label>Voice/Video Note</Label>
            <div className="flex items-center space-x-2">
              {!voiceNote && !isRecording && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => startRecording('audio')}
                >
                  <Mic className="mr-2 h-4 w-4" />
                  Record Voice
                </Button>
              )}
              
              {!videoNote && !isRecording && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => startRecording('video')}
                >
                  <Video className="mr-2 h-4 w-4" />
                  Record Video
                </Button>
              )}

              {isRecording && (
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={stopRecording}
                >
                  Stop Recording
                </Button>
              )}

              {voiceNote && (
                <div className="flex items-center space-x-2">
                  <audio src={voiceNote.url} controls className="h-8" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setVoiceNote(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}

              {videoNote && (
                <div className="flex items-center space-x-2">
                  <video src={videoNote.url} controls className="h-20" />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setVideoNote(null)}
                  >
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Enable Reminder</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before the scheduled time
                </p>
              </div>
              <Switch
                checked={reminderEnabled}
                onCheckedChange={setReminderEnabled}
              />
            </div>

            {reminderEnabled && (
              <div className="space-y-2">
                <Label>Remind me</Label>
                <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes before</SelectItem>
                    <SelectItem value="15">15 minutes before</SelectItem>
                    <SelectItem value="30">30 minutes before</SelectItem>
                    <SelectItem value="60">1 hour before</SelectItem>
                    <SelectItem value="120">2 hours before</SelectItem>
                    <SelectItem value="1440">1 day before</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createPlanMutation.isPending}
          >
            {createPlanMutation.isPending ? "Creating..." : "Create Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}