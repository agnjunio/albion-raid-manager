import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "./button";

interface BackButtonProps {
  onClick?: () => void;
  label?: string;
  variant?: "default" | "subtle" | "minimal";
  className?: string;
}

export function BackButton({
  onClick = () => window.history.back(),
  label = "Back",
  variant = "default",
  className,
}: BackButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case "minimal":
        return "text-muted-foreground hover:text-foreground p-1 h-auto";
      case "subtle":
        return "text-muted-foreground hover:text-foreground hover:bg-muted/50";
      default:
        return "text-muted-foreground hover:text-foreground hover:bg-muted/50";
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`group flex items-center gap-2 transition-colors ${getVariantStyles()} ${className}`}
    >
      <FontAwesomeIcon
        icon={faArrowLeft}
        className={`h-4 w-4 transition-transform ${variant === "minimal" ? "" : "group-hover:-translate-x-0.5"}`}
      />
      {variant !== "minimal" && <span className="text-sm font-medium">{label}</span>}
    </Button>
  );
}
