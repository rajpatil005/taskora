"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function Textarea({ className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        // base style (same as Input)
        "w-full min-h-[110px] px-4 py-3 rounded-lg",
        "bg-white/5 border border-white/10",
        "text-white text-sm",
        "placeholder:text-white/40",
        "outline-none",

        // smooth transitions
        "transition-all duration-300",

        // hover (subtle professional - SAME AS INPUT)
        "hover:bg-white/7 hover:border-white/30",

        // focus (minimal SaaS style - SAME AS INPUT)
        "focus:bg-white/8",
        "focus:border-purple-500/70",
        "focus:ring-1 focus:ring-purple-500/20",

        // glass feel
        "backdrop-blur-md",

        // prevent ugly resize
        "resize-none",

        className,
      )}
      {...props}
    />
  );
}
