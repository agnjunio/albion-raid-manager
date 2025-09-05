import type { SizeProp } from "@fortawesome/fontawesome-svg-core";

import { useMemo, type PropsWithChildren } from "react";

import { cn } from "@albion-raid-manager/core/helpers";
import { faArrowLeft, faTriangleExclamation, type IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Button } from "./button";
import Loading from "./loading";

export function Page({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("flex w-full grow flex-col gap-4 p-4", className)}>{children}</div>;
}

export function PageBackButton() {
  return (
    <Button variant="ghost" size="icon" className="rounded-full" onClick={() => window.history.back()}>
      <FontAwesomeIcon icon={faArrowLeft} />
    </Button>
  );
}

export function PageTitle({ children, className }: { className?: string } & PropsWithChildren) {
  return <h2 className={cn("font-title text-center text-2xl font-normal", className)}>{children}</h2>;
}

interface PageErrorProps {
  error: string;
  variant?: "error" | "warning";
  icon?: IconDefinition;
  className?: string;
  iconSize?: SizeProp;
}

export function PageError({ error, variant = "warning", iconSize = "2xl", className }: PageErrorProps) {
  const icon = useMemo(() => {
    if (variant === "error") return faTriangleExclamation;
    if (variant === "warning") return faTriangleExclamation;
    return faTriangleExclamation;
  }, [variant]);

  return (
    <div className={cn("flex h-full grow items-center justify-center")}>
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-2 rounded-lg p-4",
          {
            error: "text-destructive-foreground bg-destructive/10",
            warning: "text-muted-foreground bg-muted/10",
          }[variant],
          className,
        )}
      >
        <FontAwesomeIcon icon={icon} size={iconSize} />
        <p className={cn("text-center")}>{error}</p>
      </div>
    </div>
  );
}

export function PageLoading({ label }: { label?: string }) {
  return (
    <Page>
      <Loading label={label} className="absolute inset-0" />
    </Page>
  );
}
