import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { getActivityTypeOptions, type ActivityType } from "@/lib/activityColors";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { ThemeSelector } from "@/components/theme-selector";
import { LanguageSelector } from "@/components/language-selector";
import { useMode } from "@/contexts/mode-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EntryCard } from "@/components/ui/entry-card";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { MoodSelector } from "@/components/ui/mood-selector";
import { MoodSuggestion } from "@/components/mood-suggestion";
import { TagInput } from "@/components/ui/tag-input";
import { MediaUpload } from "@/components/ui/media-upload";
import { LocationSharing } from "@/components/location-sharing";
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
  Moon,
  ChevronLeft,
  ChevronRight,
  FileText
} from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { EntryWithAuthorAndGroup, GroupWithMembers } from "@shared/schema";

interface DayEntry {
  date: string;
  count: number;
}

export default function Dashboard() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { mode, setMode } = useMode();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [entryContent, setEntryContent] = useState("");
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>("personal");
  const [visibility, setVisibility] = useState<"private" | "group">("private");
  const [activityType, setActivityType] = useState<ActivityType>("note");
  const [attachments, setAttachments] = useState<any[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showMoodSuggestion, setShowMoodSuggestion] = useState(true);
  const [sharedLocation, setSharedLocation] = useState<any>(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      toast({
        title: "Unauthorized",
        description: t('auth.loginRequired'),
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

  // Fetch entries count for the current month
  const { data: entryCounts = [], isLoading: loadingCalendar } = useQuery<DayEntry[]>({
    queryKey: ["/api/entries/calendar", format(currentMonth, 'yyyy-MM')],
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
      location?: any;
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
      setShowMoodSuggestion(true);
      setSharedLocation(null);
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
      location: sharedLocation || undefined,
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

  // Calendar functions
  const entryCountMap = entryCounts.reduce((acc, entry) => {
    acc[entry.date] = entry.count;
    return acc;
  }, {} as Record<string, number>);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startPadding = getDay(monthStart);
  const paddingDays = Array(startPadding).fill(null);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const getEntryCountForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entryCountMap[dateStr] || 0;
  };

  const getColorIntensity = (count: number) => {
    if (count === 0) return '';
    if (count === 1) return 'bg-primary/20';
    if (count === 2) return 'bg-primary/40';
    if (count === 3) return 'bg-primary/60';
    return 'bg-primary/80';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Updated to match SharedNavigation style */}
      <nav className="glass-strong sticky top-0 z-40 bg-orange-50/30 dark:bg-orange-900/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <Link href="/">
                <div className="flex items-center space-x-2 cursor-pointer">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <Book className="w-4 h-4 text-primary" />
                  </div>
                  <h1 className="text-lg font-semibold text-foreground">MindSync</h1>
                </div>
              </Link>
              
              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/">
                  <Button variant="secondary" size="sm" className="text-foreground">
                    <Home className="w-4 h-4 mr-2" />
                    {t('nav.journal')}
                  </Button>
                </Link>
                <Link href="/groups">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Users className="w-4 h-4 mr-2" />
                    {t('nav.groups')}
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {t('nav.insights')}
                  </Button>
                </Link>
                <Link href="/partner">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                    <Heart className="w-4 h-4 mr-2" />
                    {t('partner.title')}
                  </Button>
                </Link>
              </div>
            </div>
            
            {/* Right side */}
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <ThemeSelector />
              <ThemeToggle />
              
              {user && (
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
                  
                  <a href="/api/logout">
                    <Button variant="ghost" size="icon" className="glass-subtle">
                      <span className="sr-only">Logout</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                    </Button>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode Indicator Banner with Search */}
        <div className="mb-4 p-3 bg-accent/20 border border-accent/30 rounded-lg glass-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Personal Journal</span>
              <span className="text-xs text-muted-foreground">• Your entries are private and secure</span>
            </div>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 pl-8 h-8 text-sm glass-subtle"
              />
              <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        </div>
        
        {/* Writing Section */}
        <Card className="glass-strong shadow-ios-lg mb-6 border-white/20 dark:border-white/10 bg-gradient-to-br from-orange-50/20 to-orange-100/10 dark:from-orange-900/10 dark:to-orange-800/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2 glass-subtle rounded-full px-3 py-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Your private sanctuary</span>
              </div>
              <span className="text-xs text-muted-foreground glass-subtle rounded-full px-3 py-1.5">
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

            {/* Mood Suggestion */}
            {showMoodSuggestion && entryContent.length > 0 && (
              <MoodSuggestion 
                content={entryContent}
                onClose={() => setShowMoodSuggestion(false)}
              />
            )}

            {/* Media Upload Section */}
            <div className="mt-4 border-t border-border pt-4">
              <MediaUpload
                onAttachmentsChange={setAttachments}
                maxFiles={5}
                maxSizePerFile={25}
              />
            </div>
            
            {/* Location Sharing */}
            <div className="mt-4">
              <LocationSharing
                onLocationSelect={setSharedLocation}
                currentLocation={sharedLocation}
              />
            </div>
            
            {/* Entry Options - More Visible */}
            <div className="mt-4 space-y-4 border-t border-border pt-4">
              {/* Mood and Tags Section */}
              <div className="bg-accent/10 rounded-lg p-4 glass-subtle">
                <h3 className="text-sm font-medium text-foreground mb-3">How are you feeling?</h3>
                <div className="space-y-3">
                  <MoodSelector
                    selectedMoods={selectedMoods}
                    onMoodsChange={setSelectedMoods}
                  />
                  <TagInput
                    tags={selectedTags}
                    onTagsChange={setSelectedTags}
                    placeholder="Add tags to organize your thoughts..."
                  />
                </div>
              </div>
              
              {/* Entry Settings */}
              <div className="bg-accent/10 rounded-lg p-4 glass-subtle">
                <h3 className="text-sm font-medium text-foreground mb-3">Entry Details</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Entry Type</label>
                    <Select value={activityType} onValueChange={(value: ActivityType) => setActivityType(value)}>
                      <SelectTrigger className="w-full h-9">
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
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Save To</label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-full h-9">
                        <SelectValue placeholder="Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="personal">
                          <span className="flex items-center space-x-2">
                            <Lock className="w-3 h-3" />
                            <span>Personal (Private)</span>
                          </span>
                        </SelectItem>
                        {groups.map((group: GroupWithMembers) => (
                          <SelectItem key={group.id} value={group.id.toString()}>
                            <span className="flex items-center space-x-2">
                              <Users className="w-3 h-3" />
                              <span>{group.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <Lock className="w-3 h-3" />
                    <span>Your entry will be saved as {selectedGroup === 'personal' ? 'private' : 'group visible'}</span>
                  </div>
                  
                  <Button 
                    onClick={handleSubmitEntry}
                    disabled={createEntryMutation.isPending || !entryContent.trim()}
                    className="glass-button bg-gradient-to-r from-orange-500/80 to-orange-600/80 hover:from-orange-600/90 hover:to-orange-700/90 text-white shadow-ios-lg hover:shadow-ios-xl transition-all"
                    size="default"
                  >
                    {createEntryMutation.isPending ? (
                      <span className="flex items-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Feather className="w-4 h-4 mr-2" />
                        Save Entry
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entries Section Header */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Your Private Entries
          </h2>
        </div>

        {/* Entries List and Calendar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Timeline Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Timeline</h3>
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

          {/* Calendar Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Calendar View</h3>
            <Card className="glass-strong shadow-ios-lg border-white/20 dark:border-white/10">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {format(currentMonth, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handlePreviousMonth}
                      className="h-7 w-7 glass-button hover:bg-white/20 dark:hover:bg-white/10"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleToday}
                      className="h-7 px-2 text-xs glass-button hover:bg-white/20 dark:hover:bg-white/10"
                    >
                      Today
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleNextMonth}
                      className="h-7 w-7 glass-button hover:bg-white/20 dark:hover:bg-white/10"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-2">
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1">
                  {paddingDays.map((_, index) => (
                    <div key={`padding-${index}`} className="aspect-square" />
                  ))}
                  {monthDays.map((date) => {
                    const count = getEntryCountForDay(date);
                    const isToday = isSameDay(date, new Date());
                    const isSelected = selectedDate && isSameDay(date, selectedDate);

                    return (
                      <Button
                        key={date.toISOString()}
                        variant="ghost"
                        className={`aspect-square p-0 h-auto rounded-xl transition-all ${
                          count > 0 ? 'glass-button' : ''
                        } ${getColorIntensity(count)} ${
                          isToday ? 'ring-2 ring-primary/50 shadow-ios' : ''
                        } ${isSelected ? 'bg-primary/30 text-primary shadow-ios-lg' : ''} 
                        hover:shadow-ios hover:scale-105`}
                        onClick={() => setSelectedDate(date)}
                      >
                        <div className="flex flex-col items-center justify-center">
                          <span className="text-xs font-medium">{format(date, 'd')}</span>
                          {count > 0 && (
                            <div className="flex items-center justify-center mt-0.5">
                              <div className="w-1.5 h-1.5 bg-primary/60 rounded-full shadow-glow" />
                              {count > 1 && <span className="text-[10px] ml-0.5 font-semibold">{count}</span>}
                            </div>
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>

                {/* Selected Date Info */}
                {selectedDate && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </p>
                    <p className="text-sm font-medium mt-1">
                      {getEntryCountForDay(selectedDate)} {getEntryCountForDay(selectedDate) === 1 ? 'entry' : 'entries'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Calendar Stats */}
            <Card className="glass-strong shadow-ios-lg border-white/20 dark:border-white/10">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-4 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  This Month's Activity
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center glass-subtle rounded-lg p-2.5">
                    <span className="text-sm text-muted-foreground">Total entries</span>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-primary/60" />
                      <span className="font-semibold text-foreground">{entryCounts.reduce((sum, day) => sum + day.count, 0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center glass-subtle rounded-lg p-2.5">
                    <span className="text-sm text-muted-foreground">Days written</span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-primary/60" />
                      <span className="font-semibold text-foreground">{entryCounts.filter(day => day.count > 0).length}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center glass-subtle rounded-lg p-2.5">
                    <span className="text-sm text-muted-foreground">Daily average</span>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-3.5 h-3.5 text-primary/60" />
                      <span className="font-semibold text-foreground">
                        {entryCounts.length > 0 
                          ? (entryCounts.reduce((sum, day) => sum + day.count, 0) / monthDays.length).toFixed(1)
                          : '0'}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        
        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-strong shadow-ios-lg border-white/20 dark:border-white/10 hover:shadow-ios-xl transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Personal Entries</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{entries.length}</p>
                </div>
                <div className="glass-button rounded-xl p-2.5">
                  <Book className="w-6 h-6 text-primary/60" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong shadow-ios-lg border-white/20 dark:border-white/10 hover:shadow-ios-xl transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">This Week</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{totalEntries}</p>
                </div>
                <div className="glass-button rounded-xl p-2.5">
                  <Calendar className="w-6 h-6 text-primary/60" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="glass-strong shadow-ios-lg border-white/20 dark:border-white/10 hover:shadow-ios-xl transition-all">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Positive Mood</p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">{positivePercentage}%</p>
                </div>
                <div className="glass-button rounded-xl p-2.5">
                  <Heart className="w-6 h-6 text-primary/60" />
                </div>
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
