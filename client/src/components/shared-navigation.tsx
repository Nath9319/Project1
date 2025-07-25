import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useMode } from "@/contexts/mode-context";
import { useLanguage } from "@/contexts/language-context";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LanguageSelector } from "@/components/language-selector";
import { ThemeSelector } from "@/components/theme-selector";
import { MoodSelector } from "@/components/mood-selector";
import { PrivacyModeSelector } from "@/components/privacy-mode-selector";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Book, 
  Users, 
  BarChart3, 
  Search,
  Home,
  Heart,
  Menu,
  X,
  Calendar,
  CalendarPlus,
  Bell
} from "lucide-react";

export function SharedNavigation() {
  const { user } = useAuth();
  const { mode, setMode } = useMode();
  const { t } = useLanguage();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <div className="flex justify-between items-center h-16 overflow-hidden">
          {/* Mobile Menu Button and Logo */}
          <div className="flex items-center space-x-4">
            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden"
                  aria-label="Open menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-96 overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left text-lg font-semibold">Menu</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-1">
                  {/* Privacy Mode Selector for Mobile */}
                  <div className="px-2 pb-4">
                    <p className="text-sm text-muted-foreground mb-3 font-medium">Privacy Mode</p>
                    <PrivacyModeSelector />
                  </div>
                  
                  {/* Insights Link for Mobile */}
                  <div className="pt-2 pb-4 border-t border-border">
                    <Link href="/insights">
                      <Button 
                        variant={location === "/insights" ? "secondary" : "ghost"} 
                        className="w-full justify-start h-12 text-base font-medium"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <BarChart3 className="w-5 h-5 mr-4" />
                        {t('nav.insights')}
                      </Button>
                    </Link>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 mt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-3 px-2 font-medium">Quick Actions</p>
                    <div className="space-y-1">
                      <Link href="/partner">
                        <Button 
                          variant="ghost"
                          className="w-full justify-start h-11 text-sm"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <Heart className="w-4 h-4 mr-3" />
                          Partner Space
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost"
                        className="w-full justify-start h-11 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Calendar className="w-4 h-4 mr-3" />
                        Calendar View
                      </Button>
                      <Button 
                        variant="ghost"
                        className="w-full justify-start h-11 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <CalendarPlus className="w-4 h-4 mr-3" />
                        Create Plan
                      </Button>
                      <Button 
                        variant="ghost"
                        className="w-full justify-start h-11 text-sm"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Bell className="w-4 h-4 mr-3" />
                        Reminders
                      </Button>
                    </div>
                  </div>
                  
                  {/* Mobile Settings Section */}
                  <div className="pt-6 mt-6 border-t border-border space-y-4">
                    <p className="text-sm text-muted-foreground mb-4 px-2 font-medium">Preferences</p>
                    <div className="space-y-3">
                      <div className="px-2">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium">Mode</span>
                          <ModeToggle mode={mode} onModeChange={setMode} />
                        </div>
                      </div>
                      <div className="px-2">
                        <div className="mb-2">
                          <span className="text-sm font-medium">Theme</span>
                        </div>
                        <ThemeSelector />
                      </div>
                      <div className="px-2">
                        <div className="mb-2">
                          <span className="text-sm font-medium">Language</span>
                        </div>
                        <LanguageSelector />
                      </div>
                      <div className="px-2">
                        <div className="flex items-center justify-between py-2">
                          <span className="text-sm font-medium">Dark Mode</span>
                          <ThemeToggle />
                        </div>
                      </div>
                    </div>
                    
                    {/* User Info & Logout */}
                    <div className="pt-4 mt-4 border-t border-border px-2">
                      {user && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-semibold">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {user.firstName && user.lastName 
                                  ? `${user.firstName} ${user.lastName}` 
                                  : user.email
                                }
                              </p>
                              <p className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </p>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            className="w-full h-11"
                            onClick={() => {
                              window.location.href = '/api/logout';
                            }}
                          >
                            Sign Out
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center cursor-pointer group">
                <div className={`w-8 h-8 ${mode === 'personal' ? 'bg-orange-500/20' : 'bg-blue-500/20'} rounded-xl glass-button flex items-center justify-center transition-all group-hover:scale-110`}>
                  {mode === 'personal' ? (
                    <Book className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Privacy Mode Selector and Insights */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-4 flex-1 justify-center">
            <PrivacyModeSelector />
            <Link href="/insights">
              <Button 
                variant={location === "/insights" ? "secondary" : "ghost"} 
                size="icon"
                className="h-10 w-10 rounded-full"
                title={t('nav.insights')}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="sr-only">{t('nav.insights')}</span>
              </Button>
            </Link>
          </div>
          
          {/* Right side - Desktop only */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
            <MoodSelector />
            <LanguageSelector />
            <ThemeSelector />
            <ThemeToggle />
            
            {user && (
              <div className="flex items-center space-x-2 pl-2 lg:pl-3 border-l border-white/20 dark:border-white/10">
                <div className="glass-button rounded-full p-0.5 flex-shrink-0">
                  {user.profileImageUrl ? (
                    <img 
                      src={user.profileImageUrl} 
                      alt="Profile"
                      className="w-8 h-8 lg:w-9 lg:h-9 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                      <span className="text-sm font-bold text-primary">
                        {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                <div className="hidden xl:block max-w-[100px]">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {user.firstName || user.email?.split('@')[0]}
                  </p>
                </div>
              </div>
            )}
          </div>
          
          {/* Right side - Mobile */}
          <div className="flex md:hidden items-center space-x-2">
            <ThemeToggle />
            {user && (
              <div className="glass-button rounded-full p-0.5">
                {user.profileImageUrl ? (
                  <img 
                    src={user.profileImageUrl} 
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center">
                    <span className="text-xs font-bold text-primary">
                      {(user.firstName?.[0] || user.email?.[0] || 'U').toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
    </>
  );
}