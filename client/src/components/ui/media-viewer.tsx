import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Pause, 
  Volume2, 
  Download, 
  Maximize2,
  FileText,
  Image as ImageIcon,
  Mic,
  Video as VideoIcon
} from "lucide-react";

interface MediaAttachment {
  id: string;
  type: 'image' | 'audio' | 'video' | 'document';
  url: string;
  name: string;
  size: number;
  duration?: number;
}

interface MediaViewerProps {
  attachments: MediaAttachment[];
  className?: string;
}

export function MediaViewer({ attachments, className }: MediaViewerProps) {
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleAudio = (id: string, url: string) => {
    const audio = audioRefs.current[id];
    
    if (playingAudio === id) {
      audio?.pause();
      setPlayingAudio(null);
    } else {
      // Stop any currently playing audio
      if (playingAudio) {
        audioRefs.current[playingAudio]?.pause();
      }
      
      if (!audio) {
        const newAudio = new Audio(url);
        audioRefs.current[id] = newAudio;
        newAudio.onended = () => setPlayingAudio(null);
      }
      
      audioRefs.current[id]?.play();
      setPlayingAudio(id);
    }
  };

  const toggleVideo = (id: string) => {
    const video = videoRefs.current[id];
    
    if (playingVideo === id) {
      video?.pause();
      setPlayingVideo(null);
    } else {
      // Stop any currently playing video
      if (playingVideo) {
        videoRefs.current[playingVideo]?.pause();
      }
      
      video?.play();
      setPlayingVideo(id);
    }
  };

  const downloadFile = (url: string, name: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!attachments || attachments.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {attachments.map((attachment) => (
        <Card key={attachment.id} className="overflow-hidden">
          <CardContent className="p-3">
            {/* Image */}
            {attachment.type === 'image' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ImageIcon className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium truncate">{attachment.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(attachment.size)}
                  </Badge>
                </div>
                <img
                  src={attachment.url}
                  alt={attachment.name}
                  className="w-full max-h-64 object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => window.open(attachment.url, '_blank')}
                />
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(attachment.url, attachment.name)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {/* Audio */}
            {attachment.type === 'audio' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mic className="w-4 h-4 text-purple-600" />
                    <span className="text-sm font-medium truncate">{attachment.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {attachment.duration ? formatTime(attachment.duration) : formatFileSize(attachment.size)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 bg-gradient-to-r from-purple-50 to-pink-50 p-3 rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleAudio(attachment.id, attachment.url)}
                    className="flex items-center space-x-2"
                  >
                    {playingAudio === attachment.id ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <div className="flex-1 flex items-center space-x-2">
                    <Volume2 className="w-4 h-4 text-gray-500" />
                    <div className="text-sm text-gray-600">Voice Note</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(attachment.url, attachment.name)}
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}

            {/* Video */}
            {attachment.type === 'video' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <VideoIcon className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-medium truncate">{attachment.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {attachment.duration ? formatTime(attachment.duration) : formatFileSize(attachment.size)}
                  </Badge>
                </div>
                <div className="relative">
                  <video
                    ref={(el) => {
                      if (el) videoRefs.current[attachment.id] = el;
                    }}
                    src={attachment.url}
                    className="w-full max-h-64 rounded-md"
                    controls
                    onPlay={() => setPlayingVideo(attachment.id)}
                    onPause={() => setPlayingVideo(null)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => downloadFile(attachment.url, attachment.name)}
                    className="text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            )}

            {/* Document */}
            {attachment.type === 'document' && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium truncate">{attachment.name}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {formatFileSize(attachment.size)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{attachment.name}</p>
                    <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(attachment.url, '_blank')}
                    >
                      <Maximize2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadFile(attachment.url, attachment.name)}
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}