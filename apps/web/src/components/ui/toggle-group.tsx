import { createContext, useContext } from "react";

import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { type VariantProps } from "class-variance-authority";

import { toggleVariants } from "@/components/ui/toggle";
import { cn } from "@/lib/utils";

const ToggleGroupContext = createContext<VariantProps<typeof toggleVariants>>({
  size: "default",
  variant: "default",
});

function ToggleGroup({
  className,
  variant,
  size,
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> & VariantProps<typeof toggleVariants>) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      className={cn(
        "group/toggle-group data-[variant=outline]:shadow-xs flex w-fit items-center rounded-md transition-all duration-200 ease-in-out",
        className,
      )}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size }}>{children}</ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  );
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> & VariantProps<typeof toggleVariants>) {
  const context = useContext(ToggleGroupContext);

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "min-w-0 flex-1 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l",
        // Enhanced animations
        "relative overflow-hidden transition-all duration-200 ease-in-out",
        // Hover animations
        "hover:scale-[1.02] hover:shadow-sm",
        // Active state animations
        "data-[state=on]:scale-[1.02] data-[state=on]:shadow-sm",
        // Focus animations
        "focus-visible:scale-[1.02] focus-visible:shadow-md",
        // Smooth background and text color transitions
        "transition-[background-color,color,box-shadow,transform]",
        // Ripple effect preparation
        "before:rounded-inherit before:absolute before:inset-0 before:opacity-0 before:transition-opacity before:duration-300 before:ease-out",
        "before:from-primary/10 before:to-primary/5 before:bg-gradient-to-r",
        "hover:before:opacity-100",
        className,
      )}
      {...props}
    >
      {children}
    </ToggleGroupPrimitive.Item>
  );
}

export { ToggleGroup, ToggleGroupItem };
