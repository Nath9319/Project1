import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { getActivityTypeConfig } from "@/lib/activityColors";
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
}

export function EntryCard({ entry, currentUserId }: EntryCardProps) {
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(
    entry.interactions?.some(interaction => 
      interaction.userId === currentUserId && interaction.type === "like"
    ) || false
  );

  const likesCount = entry.interactions?.filter(interaction => interaction.type === "like").length || 0;
  const commentsCount = entry.interactions?.filter(interaction => interaction.type === "comment").length || 0;

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

  return (
    <Card className="glass-card hover-lift border-0">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="relative">
            <img 
              src={entry.author.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
              alt={`${entry.author.firstName || 'User'} ${entry.author.lastName || ''}`}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
            />
            {entry.author.id === currentUserId && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full border-2 border-white"></div>
            )}
          </div>
          
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <h3 className="font-semibold text-slate-800">
                  {entry.author.firstName && entry.author.lastName 
                    ? `${entry.author.firstName} ${entry.author.lastName}`
                    : entry.author.email
                  }
                </h3>
                {/* Activity Type Indicator */}
                <div 
                  className="px-2 py-1 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: getActivityTypeConfig(entry.activityType || 'note').bgColor,
                    color: getActivityTypeConfig(entry.activityType || 'note').textColor,
                    border: `1px solid ${getActivityTypeConfig(entry.activityType || 'note').borderColor}`
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
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                {entry.content}
              </p>
            </div>

            {/* Tags */}
            {((entry.emotions?.length ?? 0) > 0 || (entry.tags?.length ?? 0) > 0) && (
              <div className="flex items-center flex-wrap gap-2 mb-4">
                {entry.emotions?.map((emotion) => (
                  <Badge 
                    key={emotion} 
                    className={`emotion-tag ${getEmotionColor(emotion)} capitalize`}
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
