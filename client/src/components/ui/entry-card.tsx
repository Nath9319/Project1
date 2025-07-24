import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Clock,
  Users,
  Lock
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
    entry.interactions.some(interaction => 
      interaction.userId === currentUserId && interaction.type === "like"
    )
  );

  const likesCount = entry.interactions.filter(interaction => interaction.type === "like").length;
  const commentsCount = entry.interactions.filter(interaction => interaction.type === "comment").length;

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
    const now = new Date();
    const entryDate = new Date(date);
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
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <img 
            src={entry.author.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
            alt={`${entry.author.firstName || 'User'} ${entry.author.lastName || ''}`}
            className="w-10 h-10 rounded-full object-cover"
          />
          
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
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>
            </div>

            {/* Tags */}
            {(entry.emotions?.length > 0 || entry.tags?.length > 0) && (
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
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleLikeMutation.mutate()}
                  disabled={toggleLikeMutation.isPending}
                  className={`flex items-center space-x-2 ${
                    isLiked ? "text-red-600 hover:text-red-700" : "text-slate-600 hover:text-primary"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
                  <span>{likesCount > 0 ? `${likesCount} likes` : "Like"}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-slate-600 hover:text-primary"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{commentsCount > 0 ? `${commentsCount} comments` : "Comment"}</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-2 text-slate-600 hover:text-primary"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
