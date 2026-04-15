"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        // base style
        "w-full h-11 px-4 rounded-lg",
        "bg-white/5 border border-white/10",
        "text-white text-sm",
        "placeholder:text-white/40",
        "outline-none",

        // smooth transitions
        "transition-all duration-300",

        // hover (subtle professional)
        "hover:bg-white/7 hover:border-white/30",
        // focus (minimal, clean SaaS style)
        "focus:bg-white/8",
        "focus:border-purple-500/70",
        "focus:ring-1 focus:ring-purple-500/20",

        // glass feel
        "backdrop-blur-md",

        className,
      )}
      {...props}
    />
  );
}
