"use client";

import { Home, List, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const router = useRouter();
  const path = usePathname();

  const items = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Tasks", icon: List, path: "/tasks" },
    { name: "Chat", icon: MessageSquare, path: "/chat" },
  ];

  return (
    <div className="w-64 bg-sidebar/70 backdrop-blur-xl border-r border-sidebar-border p-5 flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">Taskora</h1>

      <nav className="flex flex-col gap-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          const active = path === item.path;

          return (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              onClick={() => router.push(item.path)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition
                ${active ? "bg-primary text-primary-foreground" : "hover:bg-sidebar-accent"}
              `}
            >
              <Icon size={18} />
              {item.name}
            </motion.div>
          );
        })}
      </nav>
    </div>
  );
}
