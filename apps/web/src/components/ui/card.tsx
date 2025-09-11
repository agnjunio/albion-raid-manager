import * as React from "react";

import { cn } from "@/lib/utils";

interface CardProps extends React.ComponentProps<"div"> {
  variant?: "default" | "outline";
}
const Card = React.forwardRef<HTMLDivElement, CardProps>(({ variant = "default", className, ...props }, ref) => {
  const variantClass = {
    default: "bg-card text-card-foreground border-[var(--card-border)] shadow-[var(--card-shadow)]",
    outline: "bg-card border-[var(--card-border)] text-card-foreground",
  }[variant];

  return (
    <div
      ref={ref}
      data-slot="card"
      className={cn("bg-card text-card-foreground flex flex-col gap-6 rounded-xl border py-6", variantClass, className)}
      {...props}
    />
  );
});
Card.displayName = "Card";

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-header" className={cn("flex flex-col gap-1.5 px-6", className)} {...props} />;
}

interface CardTitleProps extends React.ComponentProps<"div"> {
  size?: "default" | "small" | "large";
}

function CardTitle({ size = "default", className, ...props }: CardTitleProps) {
  const sizeClass = {
    large: "text-3xl font-bold",
    default: "text-2xl font-semibold leading-none",
    small: "text-xl font-semibold leading-tight",
  }[size];

  return <div data-slot="card-title" className={cn("font-title", sizeClass, className)} {...props} />;
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-muted-foreground font-caption text-sm", className)}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content font-sans" className={cn("px-6", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={cn("flex items-center px-6", className)} {...props} />;
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
