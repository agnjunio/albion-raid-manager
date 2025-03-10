"use client";

import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { faComputer, faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VariantProps } from "class-variance-authority";
import { useTheme } from "next-themes";
import { useCallback } from "react";
import { Button, buttonVariants } from "./button";

interface Props extends VariantProps<typeof buttonVariants> {
  className?: string;
}

export function ThemeButton({ className, variant = "outline" }: Props) {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = useCallback(() => {
    const themes = ["dark", "light"];
    setTheme(themes[(themes.indexOf(resolvedTheme || themes[0]) + 1) % themes.length]);
  }, [resolvedTheme, setTheme]);

  return (
    <Button
      size="icon"
      variant={variant}
      onClick={toggleTheme}
      className={cn("transition-all ease-in-out duration-300", className)}
    >
      {resolvedTheme === "dark" && <FontAwesomeIcon icon={faMoon} />}
      {resolvedTheme === "light" && <FontAwesomeIcon icon={faSun} />}
      {resolvedTheme === "system" && <FontAwesomeIcon icon={faComputer} />}
    </Button>
  );
}
