import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

import { Button } from "./button";

interface BackButtonProps extends React.ComponentProps<typeof Link> {
  onClick?: () => void;
  label?: string;
  variant?: "default" | "subtle" | "minimal";
  className?: string;
}

export function BackButton({ onClick, to, label = "Back", variant = "default", replace, className }: BackButtonProps) {
  const handleBackClick = () => {
    if (onClick) {
      onClick();
    } else if (!to) {
      window.history.back();
    }
  };

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

  const button = (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleBackClick}
      className={`group flex items-center gap-2 transition-colors ${getVariantStyles()} ${className}`}
    >
      <FontAwesomeIcon
        icon={faArrowLeft}
        className={`h-4 w-4 transition-transform ${variant === "minimal" ? "" : "group-hover:-translate-x-0.5"}`}
      />
      {variant !== "minimal" && <span className="text-sm font-medium">{label}</span>}
    </Button>
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`group flex items-center gap-2 transition-colors ${getVariantStyles()} ${className}`}
        tabIndex={-1}
        replace={replace}
      >
        {button}
      </Link>
    );
  }

  return button;
}
