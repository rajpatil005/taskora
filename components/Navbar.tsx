"use client";

import Link from "next/link";
import { useAuth } from "@/lib/authContext";
import { usePathname } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
} from "@/components/NavigationMenu";
import {
  Bell,
  MessageCircle,
  LayoutDashboard,
  ClipboardList,
  Plus,
  ListChecks,
} from "lucide-react";

export function Navbar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const profileActive = pathname.startsWith("/profile");

  const isNotifications = pathname === "/notifications";
  const isMessages = pathname === "/messages";
  const isDashboard = pathname === "/dashboard";
  const isTasks = pathname === "/tasks";
  const isActivity = pathname.startsWith("/my-tasks");

  const navLinkClass = (path: string) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 relative ${
      pathname === path
        ? "nav-active"
        : "text-gray-300 hover:text-white hover:bg-white/10"
    }`;

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-black border-b border-white/10 shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
        {/* ================= MOBILE TOP BAR ================= */}
        <div className="flex md:hidden items-center justify-between px-7 py-3">
          {/* Logo */}
          <Link
            href="/"
            className="group flex items-center nav-logo text-xl font-semibold"
          >
            {/* T LETTER */}
            <span
              className={`flex items-center justify-center rounded-md font-bold text-md transition-all duration-300

    ${
      pathname === "/"
        ? "w-7 h-7 bg-gradient-to-br from-purple-600 to-blue-600 text-black shadow-[0_0_20px_rgba(139,92,246,0.5)]"
        : "w-9 h-9 bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
    }`}
            >
              T
            </span>

            {/* TEXT */}
            <span
              className={`text-white tracking-wide transition-all duration-300
    ${pathname === "/" ? "ml-3" : "ml-0"}
  `}
            >
              askora
            </span>
          </Link>

          {/* Right actions */}
          <div className="flex items-center gap-5">
            <Link
              href="/notifications"
              className={`nav-icon relative ${
                isNotifications ? "nav-icon-active" : ""
              }`}
            >
              <Bell size={25} />
              <span className="absolute top-[6px] right-[6px] w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />{" "}
            </Link>

            <Link
              href="/messages"
              className={`nav-icon ${isMessages ? "nav-icon-active" : ""}`}
            >
              <MessageCircle size={25} />
            </Link>
          </div>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden md:flex relative container mx-auto px-3 py-4 items-center justify-between">
          {" "}
          {/* LOGO */}
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent tracking-wide"
          >
            Taskora
          </Link>
          {/* CENTER NAV */}
          <div className="absolute left-1/2 transform -translate-x-1/2">
            <NavigationMenu>
              <NavigationMenuList className="flex gap-2 items-center">
                {user && (
                  <>
                    <NavigationMenuItem>
                      <Link href="/dashboard">
                        <span className={navLinkClass("/dashboard")}>
                          Dashboard
                        </span>
                      </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Link href="/tasks">
                        <span className={navLinkClass("/tasks")}>Tasks</span>
                      </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                      <Link href="/messages">
                        <span className={navLinkClass("/messages")}>
                          Messages
                        </span>
                      </Link>
                    </NavigationMenuItem>
                  </>
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-5">
            {user && (
              <>
                {/* Notifications */}
                <Link href="/notifications">
                  <div className="relative px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition">
                    <Bell size={20} />
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-black" />{" "}
                  </div>
                </Link>

                {/* Post Task CTA */}
                <Link href="/create-task">
                  <button className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium shadow-lg hover:scale-105 transition">
                    + Post Task
                  </button>
                </Link>
              </>
            )}

            {/* PROFILE */}
            {user && (
              <Link href={`/profile/${user._id}`}>
                <div
                  className={`p-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl 
                  shadow-[0_0_25px_rgba(139,92,246,0.15)]
                  hover:scale-105 transition
                  ${profileActive ? "profile-active-card" : ""}`}
                >
                  <img
                    src={getAvatarUrl(user)}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                </div>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAV ================= */}
      {user && (
        <div className="md:hidden fixed bottom-0 left-0 w-full bg-black border-t border-white/10 flex justify-around py-3 z-50">
          <Link
            href="/dashboard"
            className={`nav-icon ${isDashboard ? "nav-icon-active" : ""}`}
          >
            <LayoutDashboard size={30} />
          </Link>

          <Link
            href="/tasks"
            className={`nav-icon ${isTasks ? "nav-icon-active" : ""}`}
          >
            <ClipboardList size={30} />
          </Link>

          {/* POST TASK */}
          <Link href="/post-task" className="group">
            <div
              className="
      bg-gradient-to-r from-purple-600 to-blue-600 
      p-3 rounded-full shadow-lg -mt-6

      transition-all duration-200 ease-out

      hover:scale-110 hover:shadow-[0_0_25px_rgba(139,92,246,0.6)]
      active:scale-95
    "
            >
              <Plus
                size={25}
                className="
        text-white
        transition-all duration-200
        group-hover:rotate-90
      "
              />
            </div>
          </Link>

          <Link
            href="/my-tasks"
            className={`nav-icon ${isActivity ? "nav-icon-active" : ""}`}
          >
            <ListChecks size={30} />
          </Link>

          {user && (
            <Link
              href={`/profile/${user._id}`}
              className={`nav-icon ${profileActive ? "nav-icon-active" : ""}`}
            >
              <img
                src={getAvatarUrl(user)}
                className="w-7 h-7 rounded-full object-cover"
              />
            </Link>
          )}
        </div>
      )}
    </>
  );
}
