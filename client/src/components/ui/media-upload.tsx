import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Upload, 
  Image as ImageIcon, 
  Mic, 
  Video, 
  FileText, 
  X, 
  Play, 
  Pause, 
  Square,
  Camera
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  file: File;
  url: string;
  name: string;
  size: number;
  duration?: number; // for audio/video
}

interface MediaUploadProps {
  onAttachmentsChange: (attachments: MediaAttachment[]) => void;
  maxFiles?: number;
  maxSizePerFile?: number; // in MB
}

export function MediaUpload({ 
  onAttachmentsChange, 
  maxFiles = 10, 
  maxSizePerFile = 50 
}: MediaUploadProps) {
  const { toast } = useToast();
  const [attachments, setAttachments] = useState<MediaAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingType, setRecordingType] = useState<'audio' | 'video' | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const getFileType = (file: File): MediaAttachment['type'] => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('audio/')) return 'audio';
    if (file.type.startsWith('video/')) return 'video';
    return 'document';
  };

  const validateFile = (file: File): boolean => {
    if (file.size > maxSizePerFile * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `File size must be less than ${maxSizePerFile}MB`,
        variant: "destructive",
      });
      return false;
    }

    if (attachments.length >= maxFiles) {
      toast({
        title: "Too many files",
        description: `Maximum ${maxFiles} files allowed`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files) return;

    const validFiles: File[] = [];
    
    Array.from(files).forEach(file => {
      if (validateFile(file)) {
        validFiles.push(file);
      }
    });

    if (validFiles.length === 0) return;

    try {
      // Create FormData for file upload
      const formData = new FormData();
      validFiles.forEach(file => {
        formData.append('files', file);
      });

      // Upload files to server
      const response = await apiRequest('POST', '/api/upload', formData, {
        'Content-Type': 'multipart/form-data'
      });

      if (response.attachments) {
        const newAttachments: MediaAttachment[] = response.attachments.map((att: any) => ({
          id: generateId(),
          type: att.type,
          file: validFiles.find(f => f.name === att.name) || validFiles[0],
          url: att.url,
          name: att.name,
          size: att.size,
        }));

        const updated = [...attachments, ...newAttachments];
        setAttachments(updated);
        onAttachmentsChange(updated);

        toast({
          title: "Success",
          description: `${validFiles.length} file(s) uploaded successfully`,
        });
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Failed to upload files. Please try again.",
        variant: "destructive",
      });
    }
  }, [attachments, maxFiles, maxSizePerFile, onAttachmentsChange, toast]);

  const removeAttachment = (id: string) => {
    const updated = attachments.filter(att => att.id !== id);
    setAttachments(updated);
    onAttachmentsChange(updated);
    
    // Revoke object URL to free memory
    const attachment = attachments.find(att => att.id === id);
    if (attachment) {
      URL.revokeObjectURL(attachment.url);
    }
  };

  const startRecording = async (type: 'audio' | 'video') => {
    try {
      const constraints = type === 'audio' 
        ? { audio: true } 
        : { audio: true, video: true };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { 
          type: type === 'audio' ? 'audio/webm' : 'video/webm' 
        });
        const file = new File([blob], `recording-${Date.now()}.webm`, {
          type: blob.type
        });

        if (validateFile(file)) {
          const attachment: MediaAttachment = {
            id: generateId(),
            type,
            file,
            url: URL.createObjectURL(file),
            name: file.name,
            size: file.size,
            duration: recordingTime,
          };

          const updated = [...attachments, attachment];
          setAttachments(updated);
          onAttachmentsChange(updated);
        }

        // Cleanup
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingType(type);
      setRecordingTime(0);

      // Start timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording failed",
        description: "Could not access microphone/camera",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setRecordingType(null);
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4 w-full">
      {/* Upload Controls - Compact Icon Buttons */}
      <div className="flex flex-wrap gap-2 items-center justify-start">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,audio/*,video/*,.pdf,.doc,.docx,.txt"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        
        <Button
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          className="h-10 w-10 rounded-full glass shadow-ios hover:shadow-ios-xl transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))' }}
          title="Upload Files"
        >
          <Upload className="w-5 h-5" />
          <span className="sr-only">Upload Files</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            fileInputRef.current!.accept = "image/*";
            fileInputRef.current?.click();
          }}
          className="h-10 w-10 rounded-full glass shadow-ios hover:shadow-ios-xl transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1), rgba(6, 182, 212, 0.1))' }}
          title="Add Photos"
        >
          <Camera className="w-5 h-5" />
          <span className="sr-only">Add Photos</span>
        </Button>

        {!isRecording ? (
          <>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => startRecording('audio')}
              className="h-10 w-10 rounded-full glass shadow-ios hover:shadow-ios-xl transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(16, 185, 129, 0.1))' }}
              title="Record Voice Note"
            >
              <Mic className="w-5 h-5" />
              <span className="sr-only">Record Voice Note</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => startRecording('video')}
              className="h-10 w-10 rounded-full glass shadow-ios hover:shadow-ios-xl transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(99, 102, 241, 0.1))' }}
              title="Record Video Note"
            >
              <Video className="w-5 h-5" />
              <span className="sr-only">Record Video Note</span>
            </Button>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={stopRecording}
              className="h-10 w-10 rounded-full glass shadow-ios hover:shadow-ios-xl transition-all"
              style={{ background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(244, 63, 94, 0.1))' }}
              title="Stop Recording"
            >
              <Square className="w-5 h-5 text-red-600" />
              <span className="sr-only">Stop Recording</span>
            </Button>
            <Badge variant="secondary" className="animate-pulse glass shadow-ios px-3 py-1.5 text-sm">
              {recordingType === 'audio' ? '🎙️' : '📹'} {formatTime(recordingTime)}
            </Badge>
          </div>
        )}
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {attachments.map((attachment) => (
            <Card key={attachment.id} className="relative">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {attachment.type.toUpperCase()}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(attachment.id)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>

                {/* Preview based on type */}
                {attachment.type === 'image' && (
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-full h-24 object-cover rounded-md mb-2"
                  />
                )}

                {attachment.type === 'audio' && (
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-full h-24 bg-gradient-to-r from-purple-100 to-pink-100 rounded-md flex items-center justify-center">
                      <Mic className="w-8 h-8 text-purple-600" />
                    </div>
                  </div>
                )}

                {attachment.type === 'video' && (
                  <div className="relative w-full h-24 bg-black rounded-md mb-2 flex items-center justify-center">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                )}

                {attachment.type === 'document' && (
                  <div className="w-full h-24 bg-gray-100 rounded-md flex items-center justify-center mb-2">
                    <FileText className="w-8 h-8 text-gray-600" />
                  </div>
                )}

                <div className="text-xs text-gray-600">
                  <p className="truncate font-medium">{attachment.name}</p>
                  <p className="text-gray-500">
                    {formatFileSize(attachment.size)}
                    {attachment.duration && ` • ${formatTime(attachment.duration)}`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}