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
import { PlanCreator } from "@/components/plan-creator";
import { ColorPicker } from "@/components/color-picker";
import { 
  Heart, 
  Users, 
  BarChart3, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  CalendarPlus,
  Bell,
  Home,
  Settings,
  Book,
  Feather,
  Lock,
  Moon,
  ChevronLeft,
  ChevronRight,
  FileText,
  Upload,
  Menu
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
  colors?: string[];
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
  const [showPlanCreator, setShowPlanCreator] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("blue");
  const [showCalendar, setShowCalendar] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      color?: string;
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
      setSelectedColor("blue");
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
      color: selectedColor,
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
  
  const entryColorsMap = entryCounts.reduce((acc, entry) => {
    acc[entry.date] = entry.colors || ['blue'];
    return acc;
  }, {} as Record<string, string[]>);

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
  
  const getColorsForDay = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return entryColorsMap[dateStr] || [];
  };
  
  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      blue: 'bg-blue-500',
      red: 'bg-red-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      pink: 'bg-pink-500',
      orange: 'bg-orange-500',
      indigo: 'bg-indigo-500',
      teal: 'bg-teal-500',
      cyan: 'bg-cyan-500',
      rose: 'bg-rose-500',
      emerald: 'bg-emerald-500',
    };
    return colorMap[color] || 'bg-blue-500';
  };
  
  const getGradientClass = (colors: string[]) => {
    const gradientMap: Record<string, string> = {
      'blue-red': 'from-blue-500 to-red-500',
      'blue-green': 'from-blue-500 to-green-500',
      'blue-yellow': 'from-blue-500 to-yellow-500',
      'blue-purple': 'from-blue-500 to-purple-500',
      'red-green': 'from-red-500 to-green-500',
      'red-yellow': 'from-red-500 to-yellow-500',
      'green-yellow': 'from-green-500 to-yellow-500',
      'purple-pink': 'from-purple-500 to-pink-500',
      'orange-yellow': 'from-orange-500 to-yellow-500',
      'indigo-purple': 'from-indigo-500 to-purple-500',
      'teal-cyan': 'from-teal-500 to-cyan-500',
      'rose-pink': 'from-rose-500 to-pink-500',
    };
    
    if (colors.length === 2) {
      const key = `${colors[0]}-${colors[1]}`;
      return gradientMap[key] || 'from-blue-500 to-purple-500';
    }
    
    return 'from-blue-500 via-purple-500 to-pink-500';
  };

  const getColorIntensity = (count: number) => {
    if (count === 0) return '';
    if (count === 1) return 'bg-gradient-to-br from-blue-400/30 to-cyan-400/30 hover:from-blue-400/40 hover:to-cyan-400/40';
    if (count === 2) return 'bg-gradient-to-br from-green-400/40 to-emerald-400/40 hover:from-green-400/50 hover:to-emerald-400/50';
    if (count === 3) return 'bg-gradient-to-br from-yellow-400/40 to-orange-400/40 hover:from-yellow-400/50 hover:to-orange-400/50';
    if (count === 4) return 'bg-gradient-to-br from-pink-400/40 to-rose-400/40 hover:from-pink-400/50 hover:to-rose-400/50';
    return 'bg-gradient-to-br from-purple-400/50 to-indigo-400/50 hover:from-purple-400/60 hover:to-indigo-400/60';
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
              {/* Mobile Menu Button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden glass-subtle"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
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
        
        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-2">
              <Link href="/">
                <Button 
                  variant="secondary" 
                  className="w-full justify-start h-12 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Home className="w-5 h-5 mr-4" />
                  {t('nav.journal')}
                </Button>
              </Link>
              <Link href="/groups">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-5 h-5 mr-4" />
                  {t('nav.groups')}
                </Button>
              </Link>
              <Link href="/partner">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Heart className="w-5 h-5 mr-4" />
                  {t('nav.partner')}
                </Button>
              </Link>
              <Link href="/insights">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start h-12 text-base font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <BarChart3 className="w-5 h-5 mr-4" />
                  {t('nav.insights')}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Mode Indicator Banner with Search */}
        <div className="mb-4 p-3 bg-accent/20 border border-accent/30 rounded-lg glass-card">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-xs sm:text-sm font-medium text-foreground">Personal Journal</span>
              <span className="hidden sm:inline text-xs text-muted-foreground">• Your entries are private and secure</span>
            </div>
            {/* Mobile Layout - Stack buttons and search */}
            <div className="flex flex-col sm:hidden gap-3">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowCalendar(!showCalendar)}
                  variant="outline"
                  size="sm"
                  className={`glass-button text-xs btn-mobile-enhanced min-h-10 ${showCalendar ? 'bg-primary/10 text-primary' : ''}`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Calendar</span>
                </Button>
                <Button
                  onClick={() => setShowPlanCreator(true)}
                  variant="outline"
                  size="sm"
                  className="glass-button text-xs btn-mobile-enhanced min-h-10"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  <span>Plan</span>
                </Button>
              </div>
              <div className="relative mobile-input-friendly">
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 min-h-12 text-base glass-subtle mobile-spacing"
                  style={{ fontSize: '16px' }}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            {/* Desktop Layout - Keep original */}
            <div className="hidden sm:flex items-center gap-2">
              <Button
                onClick={() => setShowCalendar(!showCalendar)}
                variant="outline"
                size="sm"
                className={`glass-button text-xs sm:text-sm ${showCalendar ? 'bg-primary/10 text-primary' : ''}`}
              >
                <Calendar className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Calendar View</span>
                <span className="sm:hidden">Calendar</span>
              </Button>
              <Button
                onClick={() => setShowPlanCreator(true)}
                variant="outline"
                size="sm"
                className="glass-button text-xs sm:text-sm"
              >
                <CalendarPlus className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Plan</span>
                <span className="sm:hidden">Plan</span>
              </Button>
              <div className="relative">
                <Input
                  type="search"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 pl-8 h-8 text-sm glass-subtle"
                />
                <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Writing Section */}
        <Card className="glass-strong shadow-ios-lg mb-6 border-white/20 dark:border-white/10 bg-gradient-to-br from-orange-50/20 to-orange-100/10 dark:from-orange-900/10 dark:to-orange-800/5">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
              <div className="flex items-center space-x-2 glass-subtle rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
                <Lock className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-orange-600 dark:text-orange-400" />
                <span className="text-xs sm:text-sm font-medium text-orange-700 dark:text-orange-300">Your private sanctuary</span>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground glass-subtle rounded-full px-2 sm:px-3 py-1 sm:py-1.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <Textarea
              placeholder="What's on your mind?"
              value={entryContent}
              onChange={(e) => setEntryContent(e.target.value)}
              rows={8}
              className="w-full resize-none border-0 bg-transparent px-3 sm:px-4 py-4 sm:py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-0 text-base sm:text-sm leading-relaxed"
              style={{ 
                fontSize: window.innerWidth < 640 ? '16px' : '14px', 
                lineHeight: window.innerWidth < 640 ? '1.8' : '1.7',
                minHeight: window.innerWidth < 640 ? '200px' : '150px'
              }}
            />

            {/* Mood Suggestion */}
            {showMoodSuggestion && entryContent.length > 0 && (
              <MoodSuggestion 
                content={entryContent}
                onClose={() => setShowMoodSuggestion(false)}
              />
            )}

            {/* Media Upload Section - Enhanced Visibility */}
            <div className="mt-4 border-t border-border pt-4">
              <div className="bg-gradient-to-br from-slate-50/50 to-gray-50/50 dark:from-slate-900/30 dark:to-gray-900/30 rounded-xl p-3 sm:p-4 border border-slate-200/50 dark:border-slate-800/50 shadow-sm" style={{ minHeight: '120px' }}>
                <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                  Add Media & Files
                </h4>
                <div className="w-full" style={{ display: 'block', minHeight: '60px' }}>
                  <MediaUpload
                    onAttachmentsChange={setAttachments}
                    maxFiles={5}
                    maxSizePerFile={25}
                  />
                </div>
              </div>
            </div>
            
            {/* Location Sharing */}
            <div className="mt-4">
              <LocationSharing
                onLocationSelect={setSharedLocation}
                currentLocation={sharedLocation}
              />
            </div>
            
            {/* Entry Options - More Visible */}
            <div className="mt-4 space-y-3 sm:space-y-4 border-t border-border pt-4">
              {/* Mood and Tags Section */}
              <div className="bg-gradient-to-br from-purple-100/50 to-pink-100/50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-3 sm:p-5 border border-purple-200/50 dark:border-purple-800/50 shadow-md">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <Heart className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-purple-600 dark:text-purple-400" />
                  How are you feeling?
                </h3>
                <div className="space-y-4 sm:space-y-5">
                  <div className="mobile-touch-friendly">
                    <MoodSelector
                      selectedMoods={selectedMoods}
                      onMoodsChange={setSelectedMoods}
                    />
                  </div>
                  <div className="mobile-input-friendly">
                    <TagInput
                      tags={selectedTags}
                      onTagsChange={setSelectedTags}
                      placeholder="Add tags to organize your thoughts..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Color Selection */}
              <div className="bg-gradient-to-br from-blue-100/50 to-green-100/50 dark:from-blue-900/30 dark:to-green-900/30 rounded-xl p-3 sm:p-5 border border-blue-200/50 dark:border-blue-800/50 shadow-md">
                <ColorPicker
                  value={selectedColor}
                  onChange={setSelectedColor}
                />
              </div>
              
              {/* Entry Settings */}
              <div className="bg-gradient-to-br from-orange-100/50 to-yellow-100/50 dark:from-orange-900/30 dark:to-yellow-900/30 rounded-xl p-3 sm:p-5 border border-orange-200/50 dark:border-orange-800/50 shadow-md">
                <h3 className="text-sm sm:text-base font-semibold text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                  <Settings className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-orange-600 dark:text-orange-400" />
                  Entry Details
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mobile-input-friendly">
                  <div>
                    <label className="text-sm sm:text-xs font-medium text-muted-foreground mb-3 sm:mb-2 block">Entry Type</label>
                    <Select value={activityType} onValueChange={(value: ActivityType) => setActivityType(value)}>
                      <SelectTrigger className="w-full min-h-12 sm:h-9 text-base sm:text-sm glass-subtle btn-mobile-enhanced">
                        <SelectValue placeholder="Entry type" />
                      </SelectTrigger>
                      <SelectContent className="mobile-touch-friendly">
                        {getActivityTypeOptions().map(option => (
                          <SelectItem key={option.value} value={option.value} className="min-h-12 sm:min-h-8 text-base sm:text-sm">
                            <span className="flex items-center space-x-3 sm:space-x-2">
                              <span className="text-lg sm:text-base">{option.icon}</span>
                              <span>{option.label}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm sm:text-xs font-medium text-muted-foreground mb-3 sm:mb-2 block">Save To</label>
                    <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                      <SelectTrigger className="w-full min-h-12 sm:h-9 text-base sm:text-sm glass-subtle btn-mobile-enhanced">
                        <SelectValue placeholder="Group" />
                      </SelectTrigger>
                      <SelectContent className="mobile-touch-friendly">
                        <SelectItem value="personal" className="min-h-12 sm:min-h-8 text-base sm:text-sm">
                          <span className="flex items-center space-x-3 sm:space-x-2">
                            <Lock className="w-4 sm:w-3 h-4 sm:h-3" />
                            <span>Personal (Private)</span>
                          </span>
                        </SelectItem>
                        {groups.map((group: GroupWithMembers) => (
                          <SelectItem key={group.id} value={group.id.toString()} className="min-h-12 sm:min-h-8 text-base sm:text-sm">
                            <span className="flex items-center space-x-3 sm:space-x-2">
                              <Users className="w-4 sm:w-3 h-4 sm:h-3" />
                              <span>{group.name}</span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="mt-5 sm:mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-3">
                  <div className="flex items-center space-x-3 sm:space-x-2 text-sm sm:text-xs text-muted-foreground mobile-text-optimized">
                    <Lock className="w-4 sm:w-3 h-4 sm:h-3" />
                    <span>Your entry will be saved as {selectedGroup === 'personal' ? 'private' : 'group visible'}</span>
                  </div>
                  
                  <Button 
                    onClick={handleSubmitEntry}
                    disabled={createEntryMutation.isPending || !entryContent.trim()}
                    className="glass-button bg-gradient-to-r from-orange-500/80 to-orange-600/80 hover:from-orange-600/90 hover:to-orange-700/90 text-white shadow-ios-lg hover:shadow-ios-xl transition-all w-full sm:w-auto btn-mobile-enhanced min-h-12 sm:min-h-10"
                    size="lg"
                  >
                    {createEntryMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 sm:h-4 w-4 sm:w-4 border-b-2 border-white mr-3 sm:mr-2"></div>
                        <span className="text-base sm:text-sm font-semibold">Saving</span>
                      </span>
                    ) : (
                      <span className="flex items-center justify-center">
                        <Feather className="w-4 sm:w-4 h-4 sm:h-4 mr-3 sm:mr-2" />
                        <span className="text-base sm:text-sm font-semibold">Save Entry</span>
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Entries Section Header */}
        <div className="mt-6 mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Your Private Entries
          </h2>
        </div>

        {/* Entries List and Calendar */}
        <div className={showCalendar ? "grid grid-cols-1 lg:grid-cols-2 gap-6" : ""}>
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
          {showCalendar && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-foreground mb-3">Calendar View</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                  {format(currentMonth, 'MMMM yyyy')}
                </h3>
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
                {/* Days of week header */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
                    <div key={day} className={`text-center text-xs font-bold py-1.5 rounded-lg ${
                      index === 0 ? 'text-red-500 bg-red-50/50 dark:bg-red-950/20' :
                      index === 6 ? 'text-blue-500 bg-blue-50/50 dark:bg-blue-950/20' :
                      'text-purple-600 dark:text-purple-400 bg-purple-50/30 dark:bg-purple-950/10'
                    }`}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar Grid - Modern Tile Design */}
                <div className="grid grid-cols-7 gap-2">
                  {paddingDays.map((_, index) => (
                    <div key={`padding-${index}`} className="aspect-square" />
                  ))}
                  {monthDays.map((date) => {
                    const count = getEntryCountForDay(date);
                    const colors = getColorsForDay(date);
                    const isToday = isSameDay(date, new Date());
                    const isSelected = selectedDate && isSameDay(date, selectedDate);
                    const dayEntries = entries.filter(entry => 
                      isSameDay(new Date(entry.createdAt), date)
                    );

                    return (
                      <div
                        key={date.toISOString()}
                        className={`aspect-square relative group cursor-pointer rounded-2xl transition-all duration-300 transform
                          ${count > 0 ? 
                            'bg-gradient-to-br from-white/90 to-white/70 dark:from-gray-800/90 dark:to-gray-800/70 shadow-lg hover:shadow-2xl hover:-translate-y-1' : 
                            'bg-white/50 dark:bg-gray-800/50 hover:bg-white/70 dark:hover:bg-gray-800/70 hover:shadow-md'
                          }
                          ${isToday ? 'ring-2 ring-purple-500 shadow-purple-200 dark:shadow-purple-900/50' : ''}
                          ${isSelected ? 'ring-2 ring-pink-500 shadow-pink-200 dark:shadow-pink-900/50 scale-105' : ''}
                          backdrop-blur-sm border border-white/20 dark:border-gray-700/30`}
                        onClick={() => {
                          setSelectedDate(date);
                          if (count > 0) {
                            // Scroll to first entry of this date
                            const firstEntry = dayEntries[0];
                            if (firstEntry) {
                              const element = document.getElementById(`entry-${firstEntry.id}`);
                              element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            }
                          }
                        }}
                      >
                        {/* Gradient overlay for entries */}
                        {count > 0 && colors.length > 0 && (
                          <div className="absolute inset-0 rounded-2xl overflow-hidden">
                            {colors.length === 1 ? (
                              <div className={`w-full h-full ${getColorClass(colors[0])} opacity-20`} />
                            ) : (
                              <div className={`w-full h-full bg-gradient-to-br ${getGradientClass(colors)} opacity-25`} />
                            )}
                          </div>
                        )}
                        
                        {/* Date number */}
                        <div className="absolute top-2 left-2">
                          <span className={`text-sm font-bold ${
                            count > 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'
                          } ${isToday ? 'text-purple-700 dark:text-purple-300' : ''}`}>
                            {format(date, 'd')}
                          </span>
                        </div>
                        
                        {/* Entry count badge */}
                        {count > 0 && (
                          <div className="absolute bottom-2 right-2">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md">
                              <span className="text-xs font-bold">{count}</span>
                            </div>
                          </div>
                        )}
                        
                        {/* Color dots for multiple entries */}
                        {count > 1 && colors.length > 0 && (
                          <div className="absolute bottom-2 left-2 flex gap-1">
                            {colors.slice(0, 3).map((color, idx) => (
                              <div
                                key={idx}
                                className={`w-2 h-2 rounded-full ${getColorClass(color)} shadow-sm ring-1 ring-white/50`}
                              />
                            ))}
                            {colors.length > 3 && (
                              <div className="w-2 h-2 rounded-full bg-gray-400 shadow-sm ring-1 ring-white/50 flex items-center justify-center">
                                <span className="text-[6px] text-white font-bold">+</span>
                              </div>
                            )}
                          </div>
                        )}
                        
                        {/* Hover preview */}
                        {count > 0 && (
                          <div className="absolute inset-x-0 -bottom-20 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-3 mx-2 border border-gray-200 dark:border-gray-700">
                              <p className="text-xs font-medium text-gray-900 dark:text-white mb-1">
                                {count} {count === 1 ? 'entry' : 'entries'}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Click to view
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Color Legend */}
                <div className="mt-4 pt-3 border-t border-border">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">Activity Levels</p>
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"></div>
                      <span className="text-[10px] text-muted-foreground">0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-400/30 to-cyan-400/30"></div>
                      <span className="text-[10px] text-muted-foreground">1</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-green-400/40 to-emerald-400/40"></div>
                      <span className="text-[10px] text-muted-foreground">2</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-yellow-400/40 to-orange-400/40"></div>
                      <span className="text-[10px] text-muted-foreground">3</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-pink-400/40 to-rose-400/40"></div>
                      <span className="text-[10px] text-muted-foreground">4</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-4 h-4 rounded bg-gradient-to-br from-purple-400/50 to-indigo-400/50"></div>
                      <span className="text-[10px] text-muted-foreground">5+</span>
                    </div>
                  </div>
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
              </div>
              
              {/* Calendar Stats */}
              <Card className="glass-strong shadow-ios-lg border-white/20 dark:border-white/10 bg-gradient-to-br from-indigo-50/50 via-purple-50/30 to-pink-50/50 dark:from-indigo-950/20 dark:via-purple-950/10 dark:to-pink-950/20">
              <CardContent className="p-4">
                <h4 className="text-sm font-semibold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                  This Month's Activity
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-gradient-to-r from-blue-100/50 to-cyan-100/50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg p-2.5 border border-blue-200/30 dark:border-blue-800/30">
                    <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Total entries</span>
                    <div className="flex items-center space-x-2">
                      <FileText className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="font-bold text-blue-800 dark:text-blue-200">{entryCounts.reduce((sum, day) => sum + day.count, 0)}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-gradient-to-r from-green-100/50 to-emerald-100/50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg p-2.5 border border-green-200/30 dark:border-green-800/30">
                    <span className="text-sm font-medium text-green-700 dark:text-green-300">Days written</span>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                      <span className="font-bold text-green-800 dark:text-green-200">{entryCounts.filter(day => day.count > 0).length}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-gradient-to-r from-purple-100/50 to-pink-100/50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-2.5 border border-purple-200/30 dark:border-purple-800/30">
                    <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Daily average</span>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                      <span className="font-bold text-purple-800 dark:text-purple-200">
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
          )}
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
        
        <PlanCreator
          open={showPlanCreator}
          onOpenChange={setShowPlanCreator}
        />
      </div>
    </div>
  );
}
