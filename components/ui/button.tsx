"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  `
  inline-flex items-center justify-center gap-2
  whitespace-nowrap rounded-md
  text-sm font-medium

  transition-all duration-200 ease-out

  disabled:pointer-events-none disabled:opacity-50

  [&_svg]:pointer-events-none
  [&_svg:not([class*='size-'])]:size-4
  shrink-0 [&_svg]:shrink-0

  outline-none
  focus-visible:ring-2 focus-visible:ring-offset-2

  active:translate-y-[1px]
  `,
  {
    variants: {
      variant: {
        // 🔹 DEFAULT
        default: `
          bg-primary text-primary-foreground
          hover:bg-primary/85
          active:bg-primary/75
          focus-visible:ring-primary/30
        `,

        // 🔴 DESTRUCTIVE
        destructive: `
          bg-red-600/20
          border border-red-600/50
          text-white
          hover:bg-red-600/70
          active:bg-red-700
          focus-visible:ring-red-500/30
        `,

        // ✨ PRIMARY (clean + subtle glow)
        primary: `
          bg-gradient-to-r from-purple-600 to-blue-600
          text-white

          transition-all duration-300 ease-out

          hover:brightness-105
          hover:scale-105
          hover:shadow-[0_0_25px_rgba(139,92,246,0.35)]

          active:brightness-95
          active:scale-[0.97]

          focus-visible:ring-purple-500/30
        `,

        // 🧊 OUTLINE (professional glass)
        outline: `
          border border-white/10
          bg-white/5 backdrop-blur-md
          text-white/80

          hover:bg-white/[0.06]
          hover:border-white/20
          hover:text-white
          hover:shadow-[0_0_10px_rgba(255,255,255,0.08)]

          active:bg-white/[0.1]

          focus-visible:ring-white/20
        `,

        // ⚪ SECONDARY
        secondary: `
          bg-secondary text-secondary-foreground
          hover:bg-secondary/80
          active:bg-secondary/70
          focus-visible:ring-secondary/30
        `,

        // 👻 GHOST
        ghost: `
          text-white/70
          hover:bg-white/[0.04]
          hover:text-white
          active:bg-white/[0.08]
          focus-visible:ring-white/20
        `,

        // 🔗 LINK
        link: `
          text-blue-400 underline-offset-4
          hover:underline hover:text-blue-300
          active:text-blue-500
        `,
      },

      size: {
        default: "h-10 px-5 text-base",
        sm: "h-9 px-4 text-sm",
        lg: "h-12 px-8 text-lg",
        icon: "size-9",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },

    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
