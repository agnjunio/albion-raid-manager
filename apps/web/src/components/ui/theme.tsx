"use client";

import { cn } from "@albion-raid-manager/common/helpers/classNames";
import { faMoon, faSun } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { Button } from "./button";

interface Props {
  className?: string;
}

export function ThemeButton({ className }: Props) {
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
      variant="secondary"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className={cn(className)}
    >
      {theme === "dark" ? <FontAwesomeIcon icon={faMoon} /> : <FontAwesomeIcon icon={faSun} />}
    </Button>
  );
}
