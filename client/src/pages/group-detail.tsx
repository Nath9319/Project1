import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMode } from "@/contexts/mode-context";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { SharedNavigation } from "@/components/shared-navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EntryCard } from "@/components/ui/entry-card";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft,
  Users, 
  Settings,
  MessageSquare,
  Heart,
  UserPlus,
  Crown
} from "lucide-react";
import type { EntryWithAuthorAndGroup, GroupWithMembers } from "@shared/schema";

export default function GroupDetail() {
  const { id } = useParams();
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { mode } = useMode();
  const [entryContent, setEntryContent] = useState("");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
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
  }, [user, isLoading, toast]);

  // Fetch group details
  const { data: group, isLoading: groupLoading } = useQuery<GroupWithMembers>({
    queryKey: ["/api/groups", id],
    enabled: !!user && !!id,
  });

  // Fetch group entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery<EntryWithAuthorAndGroup[]>({
    queryKey: ["/api/groups", id, "entries"],
    enabled: !!user && !!id,
  });

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: {
      content: string;
      groupId: number;
      visibility: string;
      activityType: string;
    }) => {
      await apiRequest("POST", "/api/entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups", id, "entries"] });
      setEntryContent("");
      toast({
        title: "Success",
        description: "Entry shared with group!",
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
        description: "Failed to create entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmitEntry = () => {
    if (!entryContent.trim()) {
      toast({
        title: "Error",
        description: "Please enter some content for your entry.",
        variant: "destructive",
      });
      return;
    }

    if (!id) return;

    createEntryMutation.mutate({
      content: entryContent,
      groupId: parseInt(id),
      visibility: "group",
      activityType: "note",
    });
  };

  if (isLoading || groupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading group...</p>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Group not found</h2>
          <p className="text-muted-foreground mb-4">This group doesn't exist or you don't have access to it.</p>
          <Link href="/groups">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = group.members.some(member => 
    member.userId === user?.id && (member.role === 'admin' || member.role === 'creator')
  );

  return (
    <div className="min-h-screen bg-background">
      <SharedNavigation />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button and Group Header */}
        <div className="mb-8">
          <Link href="/groups">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </Link>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{group.name}</h1>
              {group.description && (
                <p className="text-muted-foreground">{group.description}</p>
              )}
            </div>
            {isAdmin && (
              <Button variant="outline" size="sm">
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Members
              </Button>
            )}
          </div>
        </div>

        {/* Group Info */}
        <Card className={`mb-8 ${mode === 'personal' ? 'bg-card/50' : ''}`}>
          <CardContent className="p-6">
            
            {/* Members */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-3">Members</h3>
              <div className="flex flex-wrap gap-3">
                {group.members.map((member) => (
                  <div key={member.userId} className="flex items-center space-x-2 bg-muted rounded-xl px-3 py-2">
                    {member.user.profileImageUrl ? (
                      <img
                        src={member.user.profileImageUrl}
                        alt={`${member.user.firstName || 'User'} ${member.user.lastName || ''}`}
                        className="w-8 h-8 rounded-full object-cover border-2 border-background"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-xs font-semibold text-primary">
                          {(member.user.firstName?.[0] || member.user.email?.[0] || 'U').toUpperCase()}
                        </span>
                      </div>
                    )}
                    <span className="text-sm font-medium text-foreground">
                      {member.user.firstName && member.user.lastName 
                        ? `${member.user.firstName} ${member.user.lastName}`
                        : member.user.email
                      }
                    </span>
                    {member.role === 'creator' && (
                      <Crown className="w-4 h-4 text-yellow-500" />
                    )}
                    {member.role === 'admin' && member.role !== 'creator' && (
                      <Badge variant="secondary" className="text-xs">Admin</Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Entry */}
        <Card className={`mb-8 ${mode === 'personal' ? 'bg-card/50' : ''}`}>
          <CardContent className="p-6">
            <div className="flex items-start space-x-4">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl} 
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-background shadow-md"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary">
                    {(user?.firstName?.[0] || user?.email?.[0] || 'U').toUpperCase()}
                  </span>
                </div>
              )}
              <div className="flex-1">
                <Textarea
                  placeholder="Share something with your group..."
                  value={entryContent}
                  onChange={(e) => setEntryContent(e.target.value)}
                  rows={3}
                  className="resize-none mb-4"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitEntry}
                    disabled={createEntryMutation.isPending || !entryContent.trim()}
                  >
                    {createEntryMutation.isPending ? (
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sharing...
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Share with Group
                      </div>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Group Entries */}
        <div>
          <h3 className="text-xl font-semibold text-foreground mb-6">Group Entries</h3>
          <div className="space-y-6">
            {entriesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <Card className={`p-8 text-center ${mode === 'personal' ? 'bg-card/50' : ''}`}>
                <CardContent className="p-0">
                  <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No group entries yet</h3>
                  <p className="text-muted-foreground">Be the first to share something with your group!</p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry: EntryWithAuthorAndGroup) => (
                <EntryCard key={entry.id} entry={entry} currentUserId={user?.id || ""} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}