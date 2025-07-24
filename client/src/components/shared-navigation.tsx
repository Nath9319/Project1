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
  X
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
        <div className="flex justify-between items-center h-16">
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
              <SheetContent side="left" className="w-80 sm:w-96">
                <SheetHeader>
                  <SheetTitle className="text-left">Navigation</SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  <Link href="/">
                    <Button 
                      variant={location === "/" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="w-4 h-4 mr-3" />
                      {t('nav.journal')}
                    </Button>
                  </Link>
                  <Link href="/groups">
                    <Button 
                      variant={location === "/groups" || location.startsWith("/groups/") ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Users className="w-4 h-4 mr-3" />
                      {t('nav.groups')}
                    </Button>
                  </Link>
                  <Link href="/partner">
                    <Button 
                      variant={location === "/partner" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4 mr-3" />
                      {t('nav.partner')}
                    </Button>
                  </Link>
                  <Link href="/insights">
                    <Button 
                      variant={location === "/insights" ? "secondary" : "ghost"} 
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      {t('nav.insights')}
                    </Button>
                  </Link>
                  
                  {/* Mobile Settings Section */}
                  <div className="pt-6 mt-6 border-t border-border space-y-4">
                    <div className="px-3">
                      <p className="text-sm text-muted-foreground mb-3">Settings</p>
                    </div>
                    <div className="px-3">
                      <ModeToggle />
                    </div>
                    <div className="px-3">
                      <ThemeSelector />
                    </div>
                    <div className="px-3">
                      <LanguageSelector />
                    </div>
                    <div className="px-3 flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Dark Mode</span>
                      <ThemeToggle />
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link href="/">
              <div className="flex items-center space-x-2 sm:space-x-3 cursor-pointer group">
                <div className={`w-8 sm:w-10 h-8 sm:h-10 ${mode === 'personal' ? 'bg-orange-500/20' : 'bg-blue-500/20'} rounded-xl glass-button flex items-center justify-center transition-all group-hover:scale-110`}>
                  {mode === 'personal' ? (
                    <Book className="w-4 sm:w-5 h-4 sm:h-5 text-orange-600 dark:text-orange-400" />
                  ) : (
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <h1 className="text-lg sm:text-xl font-bold text-foreground hidden sm:block">MindSync</h1>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {/* Navigation Links */}
            <div className="flex items-center space-x-2">
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
          
          {/* Right side - Desktop only */}
          <div className="hidden md:flex items-center space-x-3">
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
                <div className="hidden lg:block">
                  <p className="text-sm font-semibold text-foreground">
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