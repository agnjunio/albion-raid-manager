import * as React from "react";

import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Command as CommandPrimitive } from "cmdk";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

function Command({ className, ...props }: React.ComponentProps<typeof CommandPrimitive>) {
  return (
    <CommandPrimitive
      data-slot="command"
      className={cn(
        "bg-popover text-popover-foreground flex h-full w-full flex-col overflow-visible rounded-md",
        className,
      )}
      onWheel={(e) => {
        // Allow native scroll behavior for mouse wheel
        e.stopPropagation();
      }}
      {...props}
    />
  );
}

function CommandDialog({
  title = "Command Palette",
  description = "Search for a command to run...",
  children,
  ...props
}: React.ComponentProps<typeof Dialog> & {
  title?: string;
  description?: string;
}) {
  return (
    <Dialog {...props}>
      <DialogHeader className="sr-only">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <DialogContent className="overflow-hidden p-0">
        <Command className="[&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  searchIcon = true,
  className,
  value,
  onValueChange,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input> & { searchIcon?: boolean }) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow arrow keys to pass through for Command navigation
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      return; // Let Command component handle arrow key navigation
    }

    // Allow Home and End keys to work normally for text navigation
    if (e.key === "Home" || e.key === "End") {
      e.stopPropagation();
      return;
    }

    // Allow standard text selection shortcuts to work normally
    if (e.shiftKey || e.ctrlKey || e.metaKey) {
      e.stopPropagation();
    }
  };

  return (
    <div data-slot="command-input-wrapper" className={cn("relative flex h-9 items-center gap-4")}>
      <Input
        data-slot="command-input"
        value={value}
        onChange={(e) => onValueChange?.(e.target.value)}
        onKeyDown={handleKeyDown}
        className={cn(
          "h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0",
          { "pl-9": searchIcon },
          className,
        )}
        {...props}
      />
      {searchIcon && <FontAwesomeIcon icon={faSearch} className="absolute left-2 size-4 shrink-0 opacity-50" />}
    </div>
  );
}

function CommandList({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.List>) {
  return (
    <CommandPrimitive.List
      data-slot="command-list"
      className={cn("max-h-[300px] scroll-py-1 overflow-y-auto overflow-x-hidden", className)}
      onWheel={(e) => {
        // Allow native scroll behavior for mouse wheel
        e.stopPropagation();
      }}
      {...props}
    />
  );
}

function CommandEmpty({ ...props }: React.ComponentProps<typeof CommandPrimitive.Empty>) {
  return <CommandPrimitive.Empty data-slot="command-empty" className="py-6 text-center text-sm" {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Group>) {
  return (
    <CommandPrimitive.Group
      data-slot="command-group"
      className={cn(
        "text-foreground [&_[cmdk-group-heading]]:text-muted-foreground overflow-hidden p-1 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium",
        className,
      )}
      {...props}
    />
  );
}

function CommandSeparator({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Separator>) {
  return (
    <CommandPrimitive.Separator
      data-slot="command-separator"
      className={cn("bg-border -mx-1 h-px", className)}
      {...props}
    />
  );
}

function CommandItem({ className, ...props }: React.ComponentProps<typeof CommandPrimitive.Item>) {
  return (
    <CommandPrimitive.Item
      data-slot="command-item"
      className={cn(
        "data-[selected=true]:bg-accent data-[selected=true]:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground outline-hidden relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50 [&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="command-shortcut"
      className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)}
      {...props}
    />
  );
}

function CommandTips({
  className,
  title,
  tips = [],
  show = true,
  ...props
}: React.ComponentProps<"div"> & {
  title?: string;
  tips?: React.ReactNode[];
  show?: boolean;
}) {
  if (!tips || tips.length === 0 || !show) return null;

  return (
    <div data-slot="command-tips" className={cn("bg-muted/30 border-t px-4 py-3", className)} {...props}>
      <div className="text-muted-foreground mb-2 text-xs font-medium uppercase tracking-wide">{title}</div>
      <pre className="space-y-1 text-wrap font-sans">
        {tips.map((tip, index) => (
          <p key={index} className="text-muted-foreground font-mono text-xs">
            {tip}
          </p>
        ))}
      </pre>
    </div>
  );
}

export {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
  CommandTips,
};
