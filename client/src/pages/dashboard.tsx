import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getActivityTypeOptions, type ActivityType } from "@/lib/activityColors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EntryCard } from "@/components/ui/entry-card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MoodSelector } from "@/components/ui/mood-selector";
import { TagInput } from "@/components/ui/tag-input";
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
  Settings
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
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [visibility, setVisibility] = useState<"private" | "group">("private");
  const [activityType, setActivityType] = useState<ActivityType>("note");

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

  // Create entry mutation
  const createEntryMutation = useMutation({
    mutationFn: async (entryData: {
      content: string;
      emotions: string[];
      tags: string[];
      groupId?: number;
      visibility: string;
      activityType: string;
    }) => {
      await apiRequest("POST", "/api/entries", entryData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/entries"] });
      setEntryContent("");
      setSelectedMoods([]);
      setSelectedTags([]);
      setSelectedGroup("");
      setVisibility("private");
      setActivityType("note");
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
      groupId: selectedGroup ? parseInt(selectedGroup) : undefined,
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
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold text-slate-800">MindSync</h1>
              </div>
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-primary bg-primary/10">
                    <Home className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/groups">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
                    <Users className="w-4 h-4 mr-2" />
                    Groups
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Insights
                  </Button>
                </Link>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative hidden md:block">
                <Input
                  type="search"
                  placeholder="Search entries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full border-2 border-white"></span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <img 
                  src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                  alt={`${user.firstName || 'User'} ${user.lastName || ''}`}
                  className="w-8 h-8 rounded-full object-cover border-2 border-slate-200"
                />
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-slate-800">
                    {user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.email}
                  </p>
                  <p className="text-xs text-slate-500">Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content */}
          <div className="lg:col-span-8">
            {/* Quick Entry Card */}
            <Card className="p-6 mb-6">
              <div className="flex items-start space-x-4">
                <img 
                  src={user.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150"} 
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <Textarea
                    placeholder="How are you feeling today? Share your thoughts..."
                    value={entryContent}
                    onChange={(e) => setEntryContent(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                  
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4 flex-wrap gap-2">
                      <Select value={activityType} onValueChange={(value: ActivityType) => setActivityType(value)}>
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Activity type" />
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
                      <MoodSelector
                        selectedMoods={selectedMoods}
                        onMoodsChange={setSelectedMoods}
                      />
                      <TagInput
                        tags={selectedTags}
                        onTagsChange={setSelectedTags}
                        placeholder="Add tags..."
                      />
                      <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="Select group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Personal</SelectItem>
                          {groups.map((group: GroupWithMembers) => (
                            <SelectItem key={group.id} value={group.id.toString()}>
                              {group.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={visibility} onValueChange={(value: "private" | "group") => setVisibility(value)}>
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="group">Group</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button 
                      onClick={handleSubmitEntry}
                      disabled={createEntryMutation.isPending || !entryContent.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {createEntryMutation.isPending ? "Sharing..." : "Share Entry"}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Timeline Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800">Recent Entries</h2>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-primary bg-primary/10">
                  Timeline
                </Button>
                <Button variant="ghost" size="sm" className="text-slate-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar
                </Button>
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Entries List */}
            <div className="space-y-6">
              {entriesLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading entries...</p>
                </div>
              ) : entries.length === 0 ? (
                <Card className="p-8 text-center">
                  <CardContent className="p-0">
                    <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">No entries yet</h3>
                    <p className="text-slate-600">Start your journey by creating your first entry above.</p>
                  </CardContent>
                </Card>
              ) : (
                entries.map((entry: EntryWithAuthorAndGroup) => (
                  <EntryCard key={entry.id} entry={entry} currentUserId={user.id} />
                ))
              )}
            </div>

            {entries.length > 0 && (
              <div className="text-center mt-8">
                <Button variant="outline">Load More Entries</Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-4">
            {/* Quick Actions */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button variant="ghost" className="w-full justify-start" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mr-3">
                    <Plus className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium">Create New Entry</p>
                    <p className="text-sm text-slate-500">Start journaling</p>
                  </div>
                </Button>
                <Link href="/groups">
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mr-3">
                      <Users className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">Create Group</p>
                      <p className="text-sm text-slate-500">Start collaborating</p>
                    </div>
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="ghost" className="w-full justify-start">
                    <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mr-3">
                      <BarChart3 className="w-5 h-5 text-accent" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">View Insights</p>
                      <p className="text-sm text-slate-500">Track patterns</p>
                    </div>
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Active Groups */}
            <Card className="p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">My Groups</h3>
                <Link href="/groups">
                  <Button variant="ghost" size="sm">
                    <Plus className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              
              {groupsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto"></div>
                </div>
              ) : groups.length === 0 ? (
                <p className="text-slate-500 text-sm">No groups yet. Create your first group!</p>
              ) : (
                <div className="space-y-3">
                  {groups.slice(0, 4).map((group: GroupWithMembers) => (
                    <Link key={group.id} href={`/groups/${group.id}`}>
                      <div className="flex items-center space-x-3 p-3 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                        <div className="relative">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          {group._count && group._count.entries > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{group.name}</p>
                          <p className="text-sm text-slate-500">
                            {group._count?.members || 0} members
                            {group._count && group._count.entries > 0 && ` • ${group._count.entries} entries`}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Mood Insights */}
            <Card className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">This Week's Insights</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Heart className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-slate-600">Positive entries</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{positivePercentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all" 
                    style={{ width: `${positivePercentage}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-slate-600">Group interactions</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{groups.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <span className="text-sm text-slate-600">Total entries</span>
                  </div>
                  <span className="text-sm font-medium text-slate-800">{entries.length}</span>
                </div>
              </div>

              <Link href="/insights">
                <Button variant="outline" className="w-full mt-4">
                  View Detailed Insights
                </Button>
              </Link>
            </Card>

            {/* Daily Reminder */}
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10 p-6">
              <div className="flex items-center space-x-2 mb-3">
                <Bell className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-semibold text-slate-800">Daily Check-in</h3>
              </div>
              <p className="text-sm text-slate-600 mb-4">
                How are you feeling right now? Take a moment to reflect on your current emotional state.
              </p>
              <Button 
                className="w-full bg-primary hover:bg-primary/90"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              >
                Quick Check-in
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button (Mobile) */}
      <Button 
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg hover:bg-primary/90 hover:shadow-xl transition-all duration-200 lg:hidden"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
}
