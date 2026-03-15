"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "../NavigationMenu";

export function Navbar() {
  const { user } = useAuth();

  const userId = user?._id || user?.id;

  return (
    <header className="bg-background border-b border-border/40 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="cursor-pointer">
          <h1 className="text-2xl font-bold text-foreground">Taskora</h1>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <NavigationMenu>
            <NavigationMenuList className="flex gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink
                  href="/"
                  className="px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition"
                >
                  Home
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>

          {/* Profile Link */}
          {user && userId && (
            <Link
              href={`/profile/settings`}
              className="px-3 py-2 rounded hover:bg-accent hover:text-accent-foreground transition font-medium"
            >
              {user.name}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
