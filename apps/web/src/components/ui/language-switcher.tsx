import { faCheck, faGlobe } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VariantProps } from "class-variance-authority";
import { useTranslation } from "react-i18next";

import { Button, buttonVariants } from "./button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu";

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "pt-BR", name: "Português (Brasil)", flag: "🇧🇷" },
] as const;

interface LanguageSwitcherProps extends VariantProps<typeof buttonVariants> {
  className?: string;
}

export function LanguageSwitcher({ variant = "ghost", size = "md", className }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <FontAwesomeIcon icon={faGlobe} className="mr-2 h-4 w-4" />
          <span className="hidden sm:inline">{currentLanguage.flag}</span>
          <span className="ml-2 hidden md:inline">{currentLanguage.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`cursor-pointer ${i18n.language === language.code ? "bg-accent text-accent-foreground" : ""}`}
          >
            <div className="flex w-full items-baseline gap-2 pb-1">
              <span className="text-sm leading-none">{language.flag}</span>
              <span className="flex-1 grow leading-none">{language.name}</span>
              {i18n.language === language.code && (
                <FontAwesomeIcon icon={faCheck} className="text-muted-foreground text-xs leading-none" />
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
