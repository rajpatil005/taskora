"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

// Root
export function Select({ children, ...props }: any) {
  return <SelectPrimitive.Root {...props}>{children}</SelectPrimitive.Root>;
}

// Trigger
export const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      `group flex h-11 w-full items-center justify-between rounded-lg
      border border-white/10
      bg-white/5 backdrop-blur-md
      px-4 text-sm text-white

      transition-all duration-200 ease-out

      hover:bg-white/[0.08]
      hover:border-white/20
      hover:shadow-[0_0_12px_rgba(139,92,246,0.15)]

      focus:outline-none
      focus:ring-2 focus:ring-purple-500/30

      active:scale-[0.98]
      `,
      className,
    )}
    {...props}
  >
    {children}
    <ChevronDown className="h-4 w-4 opacity-70 transition-transform duration-200 group-data-[state=open]:rotate-180" />
  </SelectPrimitive.Trigger>
));
SelectTrigger.displayName = "SelectTrigger";

// Content (Dropdown)
export const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        `z-50 min-w-[10rem] rounded-xl
        border border-white/10
        bg-black/80 backdrop-blur-xl
        text-white shadow-xl

        animate-in fade-in zoom-in-95
        duration-200
        `,
        className,
      )}
      {...props}
    >
      <SelectPrimitive.Viewport className="p-2">
        {children}
      </SelectPrimitive.Viewport>
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
));
SelectContent.displayName = "SelectContent";

// Item
export const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      `flex items-center justify-between px-3 py-2 text-sm rounded-md
      cursor-pointer transition-all duration-150

      hover:bg-white/[0.08]
      hover:shadow-[0_0_10px_rgba(139,92,246,0.15)]

      focus:bg-white/[0.1]
      data-[state=checked]:bg-purple-500/20
      data-[state=checked]:text-white
      `,
      className,
    )}
    {...props}
  >
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    <SelectPrimitive.ItemIndicator>
      <Check className="h-4 w-4" />
    </SelectPrimitive.ItemIndicator>
  </SelectPrimitive.Item>
));
SelectItem.displayName = "SelectItem";

// Value
export const SelectValue = SelectPrimitive.Value;
