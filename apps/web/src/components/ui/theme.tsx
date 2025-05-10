import { Theme, useTheme } from "@/lib/theme";
import { cn } from "@albion-raid-manager/core/helpers";
import { faComputer, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { VariantProps } from "class-variance-authority";
import { useCallback } from "react";
import { Button, buttonVariants } from "./button";

interface Props extends VariantProps<typeof buttonVariants> {
  className?: string;
}

export function ThemeButton({ className, variant = "outline" }: Props) {
  const { theme, themes, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    setTheme(themes[(themes.indexOf(theme) + 1) % themes.length]);
  }, [theme, themes, setTheme]);

  return (
    <Button
      size="icon"
      variant={variant}
      onClick={toggleTheme}
      className={cn("transition-all duration-300 ease-in-out", className)}
    >
      {theme === Theme.DARK && <FontAwesomeIcon icon={faMoon} />}
      {theme === Theme.LIGHT && <FontAwesomeIcon icon={faSun} />}
      {theme === Theme.SYSTEM && <FontAwesomeIcon icon={faComputer} />}
    </Button>
  );
}
