"use client";

import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { VariantProps } from "class-variance-authority";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "./button";

interface Props extends VariantProps<typeof buttonVariants> {
  className?: string;
}

export function ThemeButton({ className, variant = "secondary" }: Props) {
  const [theme, setTheme] = useState(() =>
    typeof window !== "undefined" ? (localStorage.getItem("theme") ?? "dark") : "dark",
  );

  useEffect(() => {
    if (theme === "dark") {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [theme]);

  return (
    <Button
      size="icon"
      variant={variant}
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(className)}
    >
      {theme === "dark" ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
    </Button>
  );
}
