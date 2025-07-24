import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getActivityTypeOptions, type ActivityType } from "@/lib/activityColors";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { useMode } from "@/contexts/mode-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EntryCard } from "@/components/ui/entry-card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MoodSelector } from "@/components/ui/mood-selector";
import { TagInput } from "@/components/ui/tag-input";
import { MediaUpload } from "@/components/ui/media-upload";
import { 
  Heart, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Bell,
  Home,
  Settings,
  Book,
  Feather,
  Lock,
  Moon
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EntryWithAuthorAndGroup, GroupWithMembers } from "@shared/schema";

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { mode, setMode } = useMode();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("personal");
  const [visibility, setVisibility] = useState<"private" | "group">("private");
  const [activityType, setActivityType] = useState<ActivityType>("note");
  const [viewMode, setViewMode] = useState<"timeline" | "calendar">("timeline");
  const [attachments, setAttachments] = useState<any[]>([]);

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

  // Fetch entries
  const { data: entries = [], isLoading: entriesLoading } = useQuery<EntryWithAuthorAndGroup[]>({
    queryKey: ["/api/entries"],
    enabled: !!user,
  });

  // Fetch groups
  const { data: groups = [], isLoading: groupsLoading } = useQuery<GroupWithMembers[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
  });

  // Fetch mood analytics
  const { data: moodStats = [] } = useQuery<{ emotion: string; count: number }[]>({
    queryKey: ["/api/analytics/mood", { days: 7 }],
    enabled: !!user,
  });

  // Force personal mode for dashboard
  useEffect(() => {
    if (mode !== 'personal') {
      setMode('personal');
    }
  }, [mode, setMode]);

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: {
      content: string;
      emotions: string[];
      tags: string[];
      groupId?: number;
      visibility: string;
      activityType: string;
      attachments?: any[];
    }) => {
      await apiRequest("POST", "/api/entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      setEntryContent("");
      setSelectedMoods([]);
      setSelectedTags([]);
      setSelectedGroup("personal");
      setVisibility("private");
      setActivityType("note");
      setAttachments([]);
      toast({
        title: "Success",
        description: "Entry created successfully!",
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

    createEntryMutation.mutate({
      content: entryContent,
      emotions: selectedMoods,
      tags: selectedTags,
      attachments: attachments.map(att => ({
        type: att.type,
        name: att.name,
        url: att.url,
        size: att.size,
        duration: att.duration,
      })),
      groupId: selectedGroup && selectedGroup !== "personal" ? parseInt(selectedGroup) : undefined,
      visibility,
      activityType,
    });
  };

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  const positiveEntries = moodStats.filter(stat => 
    ["grateful", "happy", "excited", "peaceful", "growth"].includes(stat.emotion)
  ).reduce((sum, stat) => sum + stat.count, 0);
  
  const totalEntries = moodStats.reduce((sum, stat) => sum + stat.count, 0);
  const positivePercentage = totalEntries > 0 ? Math.round((positiveEntries / totalEntries) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                  <Book className="w-4 h-4 text-primary" />
                </div>
                <h1 className="text-lg font-semibold text-foreground">MindSync</h1>
              </div>
              
              {/* Navigation */}
              <div className="hidden md:flex items-center space-x-1">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-primary">
                    <Feather className="w-4 h-4 mr-2" />
                    Journal
                  </Button>
                </Link>
                <Link href="/groups">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    Groups
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Insights
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-3">
              <div className="relative hidden md:block">
                <Input
                  type="search"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-8 h-8 text-sm"
                />
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              </div>
              
              <ThemeToggle />
              
              <div className="flex items-center space-x-2 pl-3 border-l border-border">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-primary">
                      {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-foreground">
                    {user.firstName || user.email?.split('@')[0]}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode Indicator Banner */}
        <div className="mb-4 p-3 bg-accent/20 border border-accent/30 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Personal Journal</span>
              <span className="text-xs text-muted-foreground">• Your entries are private and secure</span>
            </div>
          </div>
        </div>
        
        {/* Writing Section */}
        <Card className="journal-card mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Lock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Your private sanctuary</span>
              </div>
              <span className="text-xs text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            
            <Textarea
              placeholder="Write whatever is on your mind... This is your safe space to express anything - your deepest thoughts, secrets, or feelings. No one will judge you here."
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              rows={6}
              className="w-full resize-none border-0 bg-transparent px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0"
              style={{ fontSize: '16px', lineHeight: '1.7' }}
            />

            {/* Media Upload Section */}
            <div className="mt-4 border-t border-border pt-4">
              <MediaUpload
                onAttachmentsChange={setAttachments}
                maxFiles={5}
                maxSizePerFile={25}
              />
            </div>
            
            {/* Entry Options */}
            <div className="mt-4 space-y-3 border-t border-border pt-4">
              <div className="flex flex-wrap gap-2">
                <MoodSelector
                  selectedMoods={selectedMoods}
                  onMoodsChange={setSelectedMoods}
                />
                <TagInput
                  tags={selectedTags}
                  onTagsChange={setSelectedTags}
                  placeholder="Add tags..."
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Select value={activityType} onValueChange={(value: ActivityType) => setActivityType(value)}>
                    <SelectTrigger className="w-36 h-8 text-sm">
                      <SelectValue placeholder="Entry type" />
                    </SelectTrigger>
                    <SelectContent>
                      {getActivityTypeOptions().map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <span className="flex items-center space-x-2">
                            <span>{option.icon}</span>
                            <span>{option.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                    <SelectTrigger className="w-32 h-8 text-sm">
                      <SelectValue placeholder="Group" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal">Personal</SelectItem>
                      {groups.map((group: GroupWithMembers) => (
                        <SelectItem key={group.id} value={group.id.toString()}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Private Entry</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleSubmitEntry}
                  disabled={createEntryMutation.isPending || !entryContent.trim()}
                  className="journal-button"
                  size="sm"
                >
                  {createEntryMutation.isPending ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary-foreground mr-2"></div>
                      Saving...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      <Feather className="w-3 h-3 mr-2" />
                      Save Entry
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entries Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Your Private Entries
          </h2>
          <div className="flex items-center space-x-1">
            <Button 
              variant={viewMode === "timeline" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("timeline")}
              className="h-7 text-xs"
            >
              Timeline
            </Button>
            <Button 
              variant={viewMode === "calendar" ? "secondary" : "ghost"} 
              size="sm" 
              onClick={() => setViewMode("calendar")}
              className="h-7 text-xs"
            >
              <Calendar className="w-3 h-3 mr-1" />
              Calendar
            </Button>
          </div>
        </div>

        {/* Entries List */}
        {viewMode === "timeline" ? (
          <div className="space-y-4">
            {entriesLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Loading your entries...</p>
              </div>
            ) : entries.length === 0 ? (
              <Card className="journal-card">
                <CardContent className="p-8 text-center">
                  <Book className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="text-base font-medium text-foreground mb-1">
                    Your journal is empty
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Start writing your first entry above to begin your journey.
                  </p>
                </CardContent>
              </Card>
            ) : (
              entries.map((entry: EntryWithAuthorAndGroup) => (
                <EntryCard key={entry.id} entry={entry} currentUserId={user.id} mode="personal" />
              ))
            )}
          </div>
        ) : (
          <div className="calendar-view">
            <p className="text-center text-muted-foreground text-sm py-8">Calendar view coming soon...</p>
          </div>
        )}

        
        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="journal-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Personal Entries</p>
                  <p className="text-2xl font-semibold text-foreground">{entries.length}</p>
                </div>
                <Book className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="journal-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">This Week</p>
                  <p className="text-2xl font-semibold text-foreground">{totalEntries}</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="journal-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Positive Mood</p>
                  <p className="text-2xl font-semibold text-foreground">{positivePercentage}%</p>
                </div>
                <Heart className="w-8 h-8 text-muted-foreground/30" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Log Out */}
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => window.location.href = "/api/logout"}
            className="text-muted-foreground hover:text-foreground"
          >
            Log Out
          </Button>
        </div>
      </div>
    </div>
  );
}
