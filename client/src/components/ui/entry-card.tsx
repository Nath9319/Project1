import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { getActivityTypeConfig } from "@/lib/activityColors";
import { MediaViewer } from "@/components/ui/media-viewer";
import { LocationDisplay } from "@/components/location-display";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Clock,
  Users,
  Lock,
  Calendar
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { EntryWithAuthorAndGroup } from "@shared/schema";

interface EntryCardProps {
  entry: EntryWithAuthorAndGroup;
  currentUserId: string;
  mode?: "personal" | "public";
}

export function EntryCard({ entry, currentUserId, mode = "public" }: EntryCardProps) {
  const { toast } = useToast();
  const [showReflection, setShowReflection] = useState(false);
  const [reflectionContent, setReflectionContent] = useState("");
  const [isLiked, setIsLiked] = useState(
    entry.interactions?.some(interaction => 
      interaction.userId === currentUserId && interaction.type === "like"
    ) || false
  );

  const likesCount = entry.interactions?.filter(interaction => interaction.type === "like").length || 0;
  const commentsCount = entry.interactions?.filter(interaction => interaction.type === "comment").length || 0;
  const reflections = entry.interactions?.filter(interaction => interaction.type === "comment") || [];

  // Like/unlike mutation
  const toggleLikeMutation = useMutation({
    mutationFn: async () => {
      if (isLiked) {
        await apiRequest("DELETE", `/api/entries/${entry.id}/interactions/like`);
      } else {
        await apiRequest("POST", `/api/entries/${entry.id}/interactions`, {
          type: "like"
        });
      }
    },
    onSuccess: () => {
      setIsLiked(!isLiked);
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
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
        description: "Failed to update interaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Delete entry mutation
  const deleteEntryMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/entries/${entry.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Success",
        description: "Entry deleted successfully.",
      });
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
        description: "Failed to delete entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getEmotionColor = (emotion: string) => {
    const colorMap: Record<string, string> = {
      grateful: "emotion-grateful",
      happy: "emotion-happy",
      excited: "emotion-excited",
      peaceful: "emotion-peaceful",
      growth: "emotion-growth",
      overwhelmed: "emotion-overwhelmed",
      sad: "emotion-sad",
      anxious: "emotion-anxious",
      frustrated: "emotion-anxious",
      angry: "emotion-overwhelmed",
    };
    return colorMap[emotion] || "bg-slate-100 text-slate-700";
  };

  const formatTimeAgo = (date: string | Date) => {
    try {
      const now = new Date();
      const entryDate = new Date(date);
      
      // Check if date is valid
      if (isNaN(entryDate.getTime())) {
        return 'Invalid date';
      }
      
      const diffInMs = now.getTime() - entryDate.getTime();
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      const diffInHours = Math.floor(diffInMinutes / 60);
      const diffInDays = Math.floor(diffInHours / 24);

      if (diffInMinutes < 60) {
        return `${diffInMinutes}m ago`;
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return entryDate.toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric',
          year: entryDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
      }
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Unknown time';
    }
  };

  const getVisibilityIcon = () => {
    if (entry.visibility === "private") {
      return <Lock className="w-3 h-3" />;
    } else if (entry.visibility === "group") {
      return <Users className="w-3 h-3" />;
    }
    return null;
  };

  // Add reflection mutation
  const addReflectionMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/entries/${entry.id}/interactions`, {
        type: "comment",
        content: reflectionContent
      });
    },
    onSuccess: () => {
      setReflectionContent("");
      setShowReflection(false);
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      toast({
        title: "Reflection added",
        description: "Your reflection has been saved.",
      });
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
        description: "Failed to add reflection. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Personal mode - Journal style
  if (mode === "personal") {
    return (
      <Card id={`entry-${entry.id}`} className="glass rounded-2xl shadow-ios bg-orange-50/30 dark:bg-orange-900/10 border-orange-200/20">
        <CardContent className="p-6">
          {/* Journal Entry Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <time className="text-sm font-medium text-orange-700 dark:text-orange-300">
                {new Date(entry.createdAt!).toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            <span className="text-xs text-orange-600/60 dark:text-orange-400/60">
              {formatTimeAgo(entry.createdAt!)}
            </span>
          </div>

          {/* Journal Content */}
          <div className="prose prose-sm max-w-none mb-4">
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {String(entry.content || '')}
            </p>
          </div>

          {/* Media */}
          {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
            <div className="mb-4">
              <MediaViewer attachments={entry.attachments} />
            </div>
          )}

          {/* Location */}
          {entry.location && typeof entry.location === 'object' && 'lat' in entry.location && 'lng' in entry.location && (
            <div className="mb-4">
              <LocationDisplay location={entry.location as any} />
            </div>
          )}

          {/* Emotions and Tags */}
          {((entry.emotions?.length ?? 0) > 0 || (entry.tags?.length ?? 0) > 0) && (
            <div className="flex items-center flex-wrap gap-2 mb-4">
              {entry.emotions?.map((emotion) => (
                <Badge 
                  key={emotion} 
                  className={`${getEmotionColor(emotion)} capitalize`}
                >
                  {emotion}
                </Badge>
              ))}
              {entry.tags?.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="text-xs"
                >
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Reflections Section */}
          {reflections.length > 0 && (
            <div className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-800/50">
              <h4 className="text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                Reflections:
              </h4>
              <div className="space-y-2">
                {reflections.map((reflection, idx) => (
                  <div key={idx} className="text-sm text-muted-foreground bg-orange-100/50 dark:bg-orange-900/20 rounded-lg p-3">
                    <p className="mb-1">{reflection.content}</p>
                    <time className="text-xs text-orange-600/60 dark:text-orange-400/60">
                      {formatTimeAgo(reflection.createdAt!)}
                    </time>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add Reflection Button */}
          <div className="mt-4 pt-4 border-t border-orange-200/50 dark:border-orange-800/50">
            {!showReflection ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReflection(true)}
                className="text-orange-600 hover:text-orange-700 hover:bg-orange-100/50"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Add reflection
              </Button>
            ) : (
              <div className="space-y-2">
                <Textarea
                  placeholder="How do you feel about this now? What has changed?"
                  value={reflectionContent}
                  onChange={(e) => setReflectionContent(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowReflection(false);
                      setReflectionContent("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => addReflectionMutation.mutate()}
                    disabled={!reflectionContent.trim() || addReflectionMutation.isPending}
                  >
                    {addReflectionMutation.isPending ? "Saving..." : "Save reflection"}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Public mode - Social style
  return (
    <Card id={`entry-${entry.id}`} className="glass-card hover-lift border-0 shadow-glow transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img 
              src={entry.author.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
              alt={`${entry.author.firstName || 'User'} ${entry.author.lastName || ''}`}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg ring-2 ring-purple-100"
            />
            {entry.author.id === currentUserId && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-slate-800 tracking-tight">
                  {entry.author.firstName && entry.author.lastName 
                    ? `${entry.author.firstName} ${entry.author.lastName}`
                    : entry.author.email
                  }
                </h3>
                {/* Activity Type Indicator */}
                <div 
                  className="px-3 py-1 rounded-full text-xs font-medium modern-badge backdrop-blur-sm"
                  style={{
                    backgroundColor: getActivityTypeConfig(entry.activityType || 'note').bgColor,
                    color: getActivityTypeConfig(entry.activityType || 'note').textColor,
                    border: `1px solid ${getActivityTypeConfig(entry.activityType || 'note').borderColor}`,
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  {getActivityTypeConfig(entry.activityType || 'note').icon} {getActivityTypeConfig(entry.activityType || 'note').label}
                </div>
                <div className="flex items-center space-x-2 text-sm text-slate-500">
                  <Clock className="w-3 h-3" />
                  <span>{formatTimeAgo(entry.createdAt!)}</span>
                </div>
                {entry.group && (
                  <Badge variant="secondary" className="text-xs">
                    {entry.group.name}
                  </Badge>
                )}
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  {getVisibilityIcon()}
                  <span className="capitalize">{entry.visibility}</span>
                </div>
                
                {entry.authorId === currentUserId && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-destructive"
                        onClick={() => deleteEntryMutation.mutate()}
                        disabled={deleteEntryMutation.isPending}
                      >
                        {deleteEntryMutation.isPending ? "Deleting..." : "Delete"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
            
            {/* Content */}
            <div className="mb-4">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base font-normal">
                {String(entry.content || '')}
              </p>
            </div>

            {/* Media Attachments */}
            {entry.attachments && Array.isArray(entry.attachments) && entry.attachments.length > 0 && (
              <div className="mb-4">
                <MediaViewer attachments={entry.attachments} />
              </div>
            )}

            {/* Location */}
            {entry.location && typeof entry.location === 'object' && 'lat' in entry.location && 'lng' in entry.location && (
              <div className="mb-4">
                <LocationDisplay location={entry.location as any} />
              </div>
            )}

            {/* Tags */}
            {((entry.emotions?.length ?? 0) > 0 || (entry.tags?.length ?? 0) > 0) && (
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {entry.emotions?.map((emotion) => (
                  <Badge 
                    key={emotion} 
                    className={`emotion-tag ${getEmotionColor(emotion)} capitalize modern-badge transition-all duration-200 hover:scale-105`}
                  >
                    {emotion}
                  </Badge>
                ))}
                {entry.tags?.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs modern-badge bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 text-purple-700 hover:scale-105 transition-all duration-200"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100/50">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLikeMutation.mutate()}
                  disabled={toggleLikeMutation.isPending}
                  className={`flex items-center space-x-2 rounded-xl px-3 py-2 transition-all duration-300 ${
                    isLiked 
                      ? "text-rose-600 bg-rose-50/50 hover:bg-rose-100/50" 
                      : "text-gray-600 hover:text-rose-600 hover:bg-rose-50/50"
                  }`}
                >
                  <Heart className={`w-4 h-4 transition-all duration-300 ${
                    isLiked ? "fill-current scale-110" : "group-hover:scale-110"
                  }`} />
                  <span className="font-medium">
                    {likesCount > 0 ? `${likesCount} likes` : "Like"}
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl px-3 py-2 transition-all duration-300 group"
                >
                  <MessageCircle className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
                  <span className="font-medium">
                    {commentsCount > 0 ? `${commentsCount} comments` : "Comment"}
                  </span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50/50 rounded-xl px-3 py-2 transition-all duration-300 group"
                >
                  <Share2 className="w-4 h-4 transition-all duration-300 group-hover:scale-110" />
                  <span className="font-medium">Share</span>
                </Button>
              </div>
              
              <div className="flex items-center space-x-2 text-xs text-gray-400 bg-gray-50/50 px-3 py-1 rounded-full">
                <Calendar className="w-3 h-3" />
                <span>{entry.createdAt ? formatTimeAgo(entry.createdAt) : 'Unknown time'}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
