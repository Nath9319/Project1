import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  Users, 
  BarChart3, 
  Home,
  TrendingUp,
  Calendar,
  Smile,
  Target
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Insights() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState("7");

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

  // Fetch mood analytics
  const { data: moodStats = [], isLoading: moodLoading } = useQuery<{ emotion: string; count: number }[]>({
    queryKey: ["/api/analytics/mood", { days: parseInt(selectedPeriod) }],
    enabled: !!user,
  });

  // Fetch entry analytics
  const { data: entryStats = [], isLoading: entryLoading } = useQuery<{ date: string; count: number }[]>({
    queryKey: ["/api/analytics/entries", { days: parseInt(selectedPeriod) }],
    enabled: !!user,
  });

  // Fetch groups for context
  const { data: groups = [] } = useQuery<GroupWithMembers[]>({
    queryKey: ["/api/groups"],
    enabled: !!user,
  });

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

  // Calculate insights
  const totalMoodEntries = moodStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
  const positiveEmotions = ["grateful", "happy", "excited", "peaceful", "growth"];
  const negativeEmotions = ["overwhelmed", "sad", "anxious", "frustrated", "angry"];
  
  const positiveCount = moodStats
    .filter((stat: any) => positiveEmotions.includes(stat.emotion))
    .reduce((sum: number, stat: any) => sum + stat.count, 0);
  
  const negativeCount = moodStats
    .filter((stat: any) => negativeEmotions.includes(stat.emotion))
    .reduce((sum: number, stat: any) => sum + stat.count, 0);

  const positivePercentage = totalMoodEntries > 0 ? Math.round((positiveCount / totalMoodEntries) * 100) : 0;
  const totalEntries = entryStats.reduce((sum: number, stat: any) => sum + stat.count, 0);
  const averageEntriesPerDay = totalEntries > 0 ? (totalEntries / parseInt(selectedPeriod)).toFixed(1) : "0";

  const topEmotions = moodStats
    .sort((a: any, b: any) => b.count - a.count)
    .slice(0, 5);

  const getEmotionColor = (emotion: string) => {
    const colorMap: Record<string, string> = {
      grateful: "bg-green-100 text-green-700",
      happy: "bg-blue-100 text-blue-700",
      excited: "bg-purple-100 text-purple-700",
      peaceful: "bg-teal-100 text-teal-700",
      growth: "bg-yellow-100 text-yellow-700",
      overwhelmed: "bg-red-100 text-red-700",
      sad: "bg-gray-100 text-gray-700",
      anxious: "bg-orange-100 text-orange-700",
      frustrated: "bg-pink-100 text-pink-700",
      angry: "bg-red-200 text-red-800",
    };
    return colorMap[emotion] || "bg-slate-100 text-slate-700";
  };

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
                  <Button variant="ghost" size="sm" className="text-slate-600 hover:text-primary">
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
                <Button variant="ghost" size="sm" className="text-primary bg-primary/10">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Insights
                </Button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
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
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Insights & Analytics</h1>
            <p className="text-slate-600 mt-2">Track your emotional patterns and journaling habits</p>
          </div>
          
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 2 weeks</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Entries</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                {averageEntriesPerDay} per day average
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Positive Sentiment</CardTitle>
              <Smile className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{positivePercentage}%</div>
              <p className="text-xs text-muted-foreground">
                {positiveCount} of {totalMoodEntries} emotional entries
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{groups.length}</div>
              <p className="text-xs text-muted-foreground">
                Collaborative journaling groups
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Common Emotion</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">
                {topEmotions[0]?.emotion || "None"}
              </div>
              <p className="text-xs text-muted-foreground">
                {topEmotions[0]?.count || 0} occurrences
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Emotional Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-5 h-5 mr-2 text-primary" />
                Emotional Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              {moodLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading mood data...</p>
                </div>
              ) : topEmotions.length === 0 ? (
                <div className="text-center py-8">
                  <Smile className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No emotional data for this period</p>
                  <p className="text-sm text-slate-500 mt-2">Start adding emotions to your entries!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topEmotions.map((emotion: any, index: number) => (
                    <div key={emotion.emotion} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        <Badge className={`capitalize ${getEmotionColor(emotion.emotion)}`}>
                          {emotion.emotion}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${totalMoodEntries > 0 ? (emotion.count / totalMoodEntries) * 100 : 0}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-800 w-8 text-right">
                          {emotion.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Daily Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-secondary" />
                Daily Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entryLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-slate-600">Loading activity data...</p>
                </div>
              ) : entryStats.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600">No entries for this period</p>
                  <p className="text-sm text-slate-500 mt-2">Start journaling to see your activity!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entryStats.slice(0, 7).map((stat: any) => (
                    <div key={stat.date} className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">
                        {new Date(stat.date).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      <div className="flex items-center space-x-3">
                        <div className="w-24 bg-slate-200 rounded-full h-2">
                          <div 
                            className="bg-secondary h-2 rounded-full transition-all" 
                            style={{ 
                              width: `${Math.min((stat.count / Math.max(...entryStats.map((s: any) => s.count))) * 100, 100)}%` 
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-slate-800 w-6 text-right">
                          {stat.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Recommendations */}
        <Card className="mt-8 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Insights & Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Emotional Wellbeing</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  {positivePercentage >= 70 ? (
                    <li>✅ Great job maintaining positive emotions!</li>
                  ) : positivePercentage >= 50 ? (
                    <li>💡 Try focusing on gratitude exercises to boost positivity</li>
                  ) : (
                    <li>🤗 Consider reaching out to your support groups for encouragement</li>
                  )}
                  
                  {totalEntries >= parseInt(selectedPeriod) ? (
                    <li>✅ Excellent consistency with daily journaling!</li>
                  ) : (
                    <li>📝 Try setting daily reminders to maintain journaling habits</li>
                  )}
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Social Connection</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  {groups.length >= 2 ? (
                    <li>✅ Great social support network!</li>
                  ) : groups.length === 1 ? (
                    <li>💡 Consider joining another group for diverse perspectives</li>
                  ) : (
                    <li>🤝 Try creating or joining a group to share your journey</li>
                  )}
                  
                  <li>💬 Regular group interactions can improve emotional clarity</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
