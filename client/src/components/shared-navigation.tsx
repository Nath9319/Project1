import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/contexts/mode-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Book, 
  Users, 
  BarChart3, 
  Search,
  Home
} from "lucide-react";

export function SharedNavigation() {
  const { user } = useAuth();
  const { mode, setMode } = useMode();
  const [location] = useLocation();

  return (
    <>
      {/* Persistent Mode Indicator */}
      <div className="fixed left-4 top-20 z-50 hidden lg:block">
        <div className={`px-3 py-2 rounded-2xl glass shadow-ios transition-all ${
          mode === 'personal' 
            ? 'bg-orange-100/50 dark:bg-orange-900/20' 
            : 'bg-blue-100/50 dark:bg-blue-900/20'
        }`}>
          <div className="flex items-center space-x-2">
            {mode === 'personal' ? (
              <Book className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            ) : (
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className={`text-sm font-medium ${
              mode === 'personal' 
                ? 'text-orange-700 dark:text-orange-300' 
                : 'text-blue-700 dark:text-blue-300'
            }`}>
              {mode === 'personal' ? 'Personal Mode' : 'Public Mode'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile Mode Indicator - Shows at top on mobile */}
      <div className={`lg:hidden sticky top-0 z-50 glass-strong ${
        mode === 'personal' 
          ? 'bg-orange-100/50 dark:bg-orange-900/20' 
          : 'bg-blue-100/50 dark:bg-blue-900/20'
      }`}>
        <div className="px-4 py-2">
          <div className="flex items-center justify-center space-x-2">
            {mode === 'personal' ? (
              <Book className="w-4 h-4 text-orange-600 dark:text-orange-400" />
            ) : (
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            )}
            <span className={`text-sm font-medium ${
              mode === 'personal' 
                ? 'text-orange-700 dark:text-orange-300' 
                : 'text-blue-700 dark:text-blue-300'
            }`}>
              {mode === 'personal' ? 'Personal Mode' : 'Public Mode'}
            </span>
          </div>
        </div>
      </div>

      <nav className={`glass-strong sticky top-10 lg:top-0 z-40 ${mode === 'personal' ? 'bg-orange-50/30 dark:bg-orange-900/10' : ''}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 cursor-pointer">
                <div className={`w-8 h-8 ${mode === 'personal' ? 'bg-primary/10' : 'bg-primary/20'} rounded flex items-center justify-center`}>
                  {mode === 'personal' ? (
                    <Book className="w-4 h-4 text-primary" />
                  ) : (
                    <Users className="w-4 h-4 text-primary" />
                  )}
                </div>
                <h1 className="text-lg font-semibold text-foreground">MindSync</h1>
              </div>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <Link href="/">
                <Button 
                  variant={location === "/" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Home className="w-4 h-4 mr-2" />
                  Journal
                </Button>
              </Link>
              <Link href="/groups">
                <Button 
                  variant={location === "/groups" || location.startsWith("/groups/") ? "secondary" : "ghost"} 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Groups
                </Button>
              </Link>
              <Link href="/insights">
                <Button 
                  variant={location === "/insights" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Insights
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-3">
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}