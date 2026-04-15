"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ChatWindow from "@/components/ChatWindow";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/lib/animations";
import { ArrowLeft, Search } from "lucide-react";
import { getAvatarUrl } from "@/lib/avatar";

interface Conversation {
  _id: string;
  text: string;
  createdAt: string;
  task: {
    _id: string;
    title: string;
  };
  sender: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  receiver: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
}

export default function MessagesPage() {
  const { token, user } = useAuth();
  const { toast } = useToast();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchConversations = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      setConversations(data.conversations ?? []);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token || !user) return;
    fetchConversations();
  }, [token, user]);

  const getOtherUser = (conv: Conversation) => {
    if (conv.sender._id === user?._id) return conv.receiver;
    return conv.sender;
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filtered = conversations.filter((c) => {
    if (!user) return false;
    const other = c.sender._id === user?._id ? c.receiver : c.sender;
    const query = search.toLowerCase();

    return (
      c.task.title?.toLowerCase().includes(query) ||
      c.text?.toLowerCase().includes(query) ||
      other.name?.toLowerCase().includes(query)
    );
  });

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-transparent text-white">
        {/* HEADER */}
        <header className="border-b border-white/10 bg-transparent/90 backdrop-blur-xl sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6 flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>

            <h1 className="text-3xl font-bold">Messages</h1>
          </div>
        </header>

        {/* ✅ FLEX LAYOUT */}
        <div className="flex h-[calc(100vh-100px)]">
          {/* LEFT SIDE (Messages) */}
          <div className="w-full md:w-[30%] border-r border-white/10 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10">
            {" "}
            {/* SEARCH */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 w-4 h-4" />
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 focus:border-purple-400 focus:ring-1 focus:ring-purple-400"
              />
            </div>
            {/* LIST */}
            {loading ? (
              <p className="text-center text-white/60">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="text-center text-white/60">
                No conversations yet. Start chatting from a task!{" "}
              </p>
            ) : (
              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
                className="space-y-4"
              >
                {" "}
                {filtered.map((conv) => {
                  const other = getOtherUser(conv);

                  return (
                    <Link
                      key={conv._id}
                      href={`/chat/${conv.task._id}`}
                      className="block"
                      onClick={(e) => {
                        if (window.innerWidth >= 768) {
                          e.preventDefault(); // desktop: no navigation
                          setSelectedTaskId(conv.task._id);
                        }
                      }}
                    >
                      <motion.div
                        variants={{
                          hidden: { opacity: 0, y: 10 },
                          show: { opacity: 1, y: 0 },
                        }}
                      >
                        <Card
                          className={`p-4 cursor-pointer border-white/10 transition-all
    ${
      selectedTaskId === conv.task._id
        ? "bg-white/10 border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.3)]"
        : "hover:bg-white/5"
    }`}
                        >
                          {" "}
                          <div className="flex items-center gap-4">
                            <img
                              src={getAvatarUrl(other)}
                              className="w-12 h-12 rounded-full object-cover border border-white/10"
                            />

                            <div className="flex-1">
                              <div className="flex justify-between">
                                <h3 className="font-semibold">{other.name}</h3>
                                <span className="text-xs text-white/50">
                                  {formatTime(conv.createdAt)}
                                </span>
                              </div>

                              <p className="text-sm text-white/70 line-clamp-1">
                                {" "}
                                {conv.text}
                              </p>

                              <p className="text-xs text-purple-400 mt-1">
                                {conv.task.title}
                              </p>
                            </div>
                          </div>
                        </Card>{" "}
                      </motion.div>
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </div>

          {/* RIGHT SIDE (Chat - Desktop only) */}
          <div className="hidden md:block w-[70%] h-full">
            {" "}
            {selectedTaskId ? (
              <motion.div
                key={selectedTaskId}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="h-full"
              >
                <ChatWindow taskId={selectedTaskId} />
              </motion.div>
            ) : (
              <div className="h-full flex items-center justify-center text-white/50">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
