import { Globe } from "lucide-react";
import { useLanguage } from "@/contexts/language-context";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LanguageSelectorProps {
  variant?: 'dropdown' | 'select';
  className?: string;
}

export function LanguageSelector({ variant = 'dropdown', className }: LanguageSelectorProps) {
  const { language, setLanguage, availableLanguages } = useLanguage();
  
  if (variant === 'select') {
    return (
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className={className}>
          <Globe className="w-4 h-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {availableLanguages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              <div className="flex items-center justify-between w-full">
                <span>{lang.nativeName}</span>
                {lang.code !== language && (
                  <span className="text-muted-foreground text-sm ml-2">
                    {lang.name}
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  const currentLang = availableLanguages.find(l => l.code === language);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className={className}>
          <Globe className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">{currentLang?.nativeName}</span>
          <span className="sm:hidden">{currentLang?.code.toUpperCase()}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {availableLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => setLanguage(lang.code)}
            className={language === lang.code ? 'bg-accent' : ''}
          >
            <div className="flex items-center justify-between w-full">
              <span className="font-medium">{lang.nativeName}</span>
              {lang.code !== language && (
                <span className="text-muted-foreground text-sm">
                  {lang.name}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}