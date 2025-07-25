import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/language-context";
import { isUnauthorizedError } from "@/lib/authUtils";
import { SharedNavigation } from "@/components/shared-navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";

interface DayEntry {
  date: string;
  count: number;
}

export default function CalendarView() {
  const { user, isLoading } = useAuth();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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
  }, [user, isLoading, toast, t]);

  // Fetch entries count for the current month
  const { data: entryCounts = [], isLoading: loadingEntries } = useQuery<DayEntry[]>({
    queryKey: ["/api/entries/calendar", format(currentMonth, 'yyyy-MM')],
    enabled: !!user,
  });

  // Convert array to map for easy lookup
  const entryCountMap = entryCounts.reduce((acc, entry) => {
    acc[entry.date] = entry.count;
    return acc;
  }, {} as Record<string, number>);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Calculate padding days for the start of the month
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

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SharedNavigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center">
            <Calendar className="w-8 h-8 mr-2" />
            Calendar View
          </h1>
          <p className="text-muted-foreground">
            Visualize your journaling journey over time
          </p>
        </div>

        {/* Calendar Card */}
        <Card className="glass mb-6 shadow-ios">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                {format(currentMonth, 'MMMM yyyy')}
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousMonth}
                  className="glass-subtle"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                  className="glass-subtle"
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextMonth}
                  className="glass-subtle"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Padding days */}
              {paddingDays.map((_, index) => (
                <div key={`padding-${index}`} className="aspect-square" />
              ))}
              
              {/* Month days */}
              {monthDays.map(day => {
                const entryCount = getEntryCountForDay(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      aspect-square p-2 rounded-lg border transition-all
                      ${isToday ? 'border-primary ring-2 ring-primary/20' : 'border-border'}
                      ${isSelected ? 'bg-accent' : ''}
                      ${entryCount > 0 ? 'hover:scale-105' : ''}
                      hover:bg-accent/50
                    `}
                  >
                    <div className="h-full flex flex-col items-center justify-center relative">
                      <span className={`text-sm ${isToday ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </span>
                      {entryCount > 0 && (
                        <div className="mt-1 flex items-center space-x-0.5">
                          <div className={`w-1.5 h-1.5 rounded-full ${getColorIntensity(entryCount)}`} />
                          {entryCount > 1 && (
                            <span className="text-xs text-muted-foreground">{entryCount}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary/20" />
                <span>1 entry</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary/40" />
                <span>2 entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary/60" />
                <span>3 entries</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-primary/80" />
                <span>4+ entries</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Date Details */}
        {selectedDate && (
          <Card className="glass-card shadow-ios">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {getEntryCountForDay(selectedDate) > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    You wrote {getEntryCountForDay(selectedDate)} {getEntryCountForDay(selectedDate) === 1 ? 'entry' : 'entries'} on this day.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // Navigate to dashboard with date filter
                      window.location.href = `/?date=${format(selectedDate, 'yyyy-MM-dd')}`;
                    }}
                  >
                    View Entries
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No entries on this day. Start journaling to build your streak!
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Monthly Summary */}
        <Card className="glass-card mt-6 shadow-ios">
          <CardHeader>
            <CardTitle className="text-lg">Monthly Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {entryCounts.reduce((sum, entry) => sum + entry.count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {entryCounts.length}
                </p>
                <p className="text-sm text-muted-foreground">Days Written</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {entryCounts.length > 0 
                    ? Math.round((entryCounts.length / monthDays.length) * 100)
                    : 0}%
                </p>
                <p className="text-sm text-muted-foreground">Consistency</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {entryCounts.length > 0
                    ? Math.max(...entryCounts.map(e => e.count))
                    : 0}
                </p>
                <p className="text-sm text-muted-foreground">Best Day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}