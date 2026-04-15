// components/ui/card.tsx
"use client";
import React from "react";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-sm transition-all duration-200 hover:border-white/20",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
