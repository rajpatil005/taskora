"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { itemVariants } from "@/lib/animations";
import { ArrowLeft } from "lucide-react";
import { getSocket } from "@/lib/socket";
import { useRouter } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";

interface Notification {
  _id: string;
  message: string;
  type: "task" | "system" | "alert" | "rating";
  isRead: boolean;
  createdAt: string;

  // NEW (important for Instagram-style UI)
  actor?: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
}

export default function NotificationsPage() {
  const { token, user, setUnreadNotifications } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const typeStyles = {
    task: "border-green-500/30",
    message: "border-blue-500/30",
    system: "border-purple-500/30",
    alert: "border-red-500/30",
    rating: "border-yellow-500/30",
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleNotificationClick = async (n: Notification) => {
    if (!n.isRead) {
      await markAsRead(n._id);
    }

    // Example routing logic
    if (n.type === "task") {
      router.push("/dashboard");
    }
  };

  useEffect(() => {
    if (!token || !user) return;

    const socket = getSocket(token);
    if (!socket) return;

    const handleNotification = (data: Notification) => {
      if (data.type === "message") return; // ❌ ignore messages

      setNotifications((prev) => [data, ...prev]);

      toast({
        title: "New Notification",
        description: data.message,
      });
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [token, user]);

  // 📦 FETCH NOTIFICATIONS
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!token) return;

      setLoading(true);

      try {
        const res = await fetch(`${API_URL}/api/notifications`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();
        setNotifications(data);

        // GLOBAL COUNT
        setUnreadNotifications(
          data.filter((n: Notification) => !n.isRead).length,
        );
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [token]);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.isRead).length;
    setUnreadNotifications(unread);
  }, [notifications, setUnreadNotifications]);

  // ✅ MARK AS READ
  const markAsRead = async (id: string) => {
    try {
      await fetch(`${API_URL}/api/notifications/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setNotifications((prev) => {
        const updated = prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n,
        );

        return updated;
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive",
      });
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <main className="min-h-screen text-white relative z-10">
      {/* HEADER */}
      <header className="border-b border-white/10 bg-transparent/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>

            <h1 className="text-3xl font-bold">Notifications</h1>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await Promise.all(
                notifications.map((n) =>
                  !n.isRead ? markAsRead(n._id) : null,
                ),
              );

              setUnreadNotifications(0);
            }}
          >
            Mark all
          </Button>
        </div>
      </header>
      <div className="px-4 sm:px-6 lg:px-10 ">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* CONTENT */}
          {loading ? (
            <div className="flex justify-center py-20">
              <Spinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center text-white/50 py-20">
              No notifications found
            </div>
          ) : (
            <motion.div className="flex flex-col gap-3 max-w-2xl mx-auto py-5">
              {" "}
              {notifications.map((n) => (
                <motion.div
                  key={n._id}
                  variants={itemVariants}
                  whileHover={{
                    scale: 1.01,
                    y: -2,
                  }}
                  className="rounded-2xl overflow-hidden"
                >
                  <Card
                    onClick={() => handleNotificationClick(n)}
                    className={`p-4 border-b border-white/10 hover:bg-white/5 transition ${
                      typeStyles[n.type as keyof typeof typeStyles] ||
                      "border-white/10"
                    } ${!n.isRead ? "bg-white/10" : ""}`}
                  >
                    <div className="flex gap-3 items-start">
                      {/* PROFILE PHOTO ONLY */}
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/profile/${n.actor?._id}`);
                        }}
                        className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex items-center justify-center"
                      >
                        <img
                          src={getAvatarUrl(n.actor)}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1">
                        {/* NAME */}
                        <div className="flex justify-between">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-semibold">
                                {n.actor?.name ?? "Someone"}
                              </p>

                              <p className="text-sm text-white/80 mt-1">
                                {n.message}
                              </p>
                            </div>
                          </div>

                          <span className="text-xs text-white/40">
                            {new Date(n.createdAt).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* UNREAD DOT */}
                      {!n.isRead && (
                        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                      )}
                    </div>
                  </Card>{" "}
                  <p className="text-sm text-white/90 mt-2 leading-snug"></p>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>
    </main>
  );
}
