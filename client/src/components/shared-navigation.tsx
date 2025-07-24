import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/contexts/mode-context";
import { useLanguage } from "@/contexts/language-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeSelector } from "@/components/theme-selector";
import { MoodSelector } from "@/components/mood-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Book, 
  Users, 
  BarChart3, 
  Search,
  Home,
  Heart
} from "lucide-react";

export function SharedNavigation() {
  const { user } = useAuth();
  const { mode, setMode } = useMode();
  const { t } = useLanguage();
  const [location] = useLocation();

  return (
    <>
      {/* Persistent Mode Indicator */}
      <div className="fixed left-4 top-20 z-50 hidden lg:block">
        <div className={`px-4 py-3 rounded-2xl glass-strong shadow-ios-lg transition-all ${
          mode === 'personal' 
            ? 'bg-orange-100/60 dark:bg-orange-900/30' 
            : 'bg-blue-100/60 dark:bg-blue-900/30'
        }`}>
          <div className="flex items-center space-x-2">
            {mode === 'personal' ? (
              <Book className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            ) : (
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            )}
            <span className={`text-sm font-semibold ${
              mode === 'personal' 
                ? 'text-orange-700 dark:text-orange-300' 
                : 'text-blue-700 dark:text-blue-300'
            }`}>
              {t(mode === 'personal' ? 'mode.personal' : 'mode.public')}
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
              {t(mode === 'personal' ? 'mode.personal' : 'mode.public')}
            </span>
          </div>
        </div>
      </div>

      <nav className={`glass-strong sticky top-10 lg:top-0 z-40 transition-all ${mode === 'personal' ? 'bg-orange-50/40 dark:bg-orange-900/20' : 'bg-blue-50/40 dark:bg-blue-900/20'}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-3 cursor-pointer group">
                <div className={`w-10 h-10 ${mode === 'personal' ? 'bg-orange-500/20' : 'bg-blue-500/20'} rounded-xl glass-button flex items-center justify-center transition-all group-hover:scale-110`}>
                  {mode === 'personal' ? (
                    <Book className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <h1 className="text-xl font-bold text-foreground">MindSync</h1>
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
                  {t('nav.journal')}
                </Button>
              </Link>
              <Link href="/groups">
                <Button 
                  variant={location === "/groups" || location.startsWith("/groups/") ? "secondary" : "ghost"} 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {t('nav.groups')}
                </Button>
              </Link>
              <Link href="/insights">
                <Button 
                  variant={location === "/insights" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {t('nav.insights')}
                </Button>
              </Link>
              <Link href="/partner">
                <Button 
                  variant={location === "/partner" ? "secondary" : "ghost"} 
                  size="sm" 
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {t('partner.title')}
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Right side */}
          <div className="flex items-center space-x-3">
            <MoodSelector />
            <LanguageSelector />
            <ThemeSelector />
            <ThemeToggle />
            
            {user && (
              <div className="flex items-center space-x-3 pl-3 border-l border-white/20 dark:border-white/10">
                <div className="glass-button rounded-full p-0.5">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile"
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-semibold text-foreground">
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