"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/lib/animations";

interface Task {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: string;
  status: string;
  owner: {
    _id: string;
    name: string;
  };
}

const categories = [
  "All",
  "Cleaning",
  "Shopping",
  "Delivery",
  "Repair",
  "Other",
];

export default function DashboardPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [locationEnabled, setLocationEnabled] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 📍 LOCATION FETCH
  const handleLocationToggle = () => {
    if (locationEnabled) {
      setLocationEnabled(false);
      setLocation(null);
      return;
    }

    if (!navigator.geolocation) return;

    setLocationLoading(true); // ✅ START LOADING

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        setLocationEnabled(true);
        setLocationLoading(false); // ✅ STOP LOADING
      },
      () => {
        toast({
          title: "Error",
          description: "Unable to fetch location",
          variant: "destructive",
        });
        setLocationLoading(false); // ✅ STOP LOADING
      },
    );
  };

  // 📦 FETCH TASKS
  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;

      setLoading(true);

      try {
        let url = `${API_URL}/api/tasks/user/list`;

        // ✅ If filters applied → use nearby API
        if (search || selectedCategory !== "All" || locationEnabled) {
          const params = new URLSearchParams();

          if (locationEnabled && location) {
            params.append("latitude", location.lat.toString()); // ✅ FIX
            params.append("longitude", location.lng.toString()); // ✅ FIX
          } else {
            // fallback location (important)
            params.append("latitude", "0");
            params.append("longitude", "0");
          }

          if (selectedCategory !== "All") {
            params.append("category", selectedCategory.toLowerCase()); // ✅ FIX
          }

          url = `${API_URL}/api/tasks/nearby?${params.toString()}`;
        }

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        let fetchedTasks = data.tasks;

        // ✅ CLIENT SIDE SEARCH FILTER (since backend doesn't support search)
        if (search) {
          fetchedTasks = fetchedTasks.filter(
            (task: Task) =>
              task.title.toLowerCase().includes(search.toLowerCase()) ||
              task.description.toLowerCase().includes(search.toLowerCase()),
          );
        }

        setTasks(fetchedTasks);
      } catch {
        toast({
          title: "Error",
          description: "Failed to load tasks",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, search, selectedCategory, locationEnabled, location]);

  // 📍 FETCH NEARBY (SEPARATE)
  useEffect(() => {
    const fetchNearbyTasks = async () => {
      if (!token || !locationEnabled || !location) return;

      try {
        const res = await fetch(
          `${API_URL}/api/tasks/nearby?lat=${location.lat}&lng=${location.lng}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) return;

        const data = await res.json();
        setNearbyTasks(data.tasks);
      } catch {}
    };

    fetchNearbyTasks();
  }, [locationEnabled, location, token]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === "completed").length;
  const pendingTasks = tasks.filter((t) => t.status !== "completed").length;

  return (
    <ProtectedRoute>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <main className="min-h-screen text-white relative z-10">
          {" "}
          <div className="px-4 sm:px-6 lg:px-10 py-10">
            <div className="max-w-[1400px] mx-auto">
              {/* HEADER */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
                <div>
                  <h1 className="text-3xl font-bold">Dashboard</h1>
                  <p className="text-white/60 text-sm mt-1">
                    Manage and track your tasks
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href="/wallet">
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        className="px-4 hover:bg-white/10"
                      >
                        💰 Wallet
                      </Button>
                    </motion.div>
                  </Link>

                  {/* Divider */}
                  <div className="w-px h-5 bg-white/30" />

                  <Link href="/my-tasks">
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        className="px-4 hover:bg-white/10"
                      >
                        My Tasks
                      </Button>
                    </motion.div>
                  </Link>

                  {/* Divider */}
                  <div className="w-px h-5 bg-white/30" />

                  <Link href="/post-task">
                    <motion.div whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        className="px-4 hover:bg-white/10"
                      >
                        Post Task
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </div>

              {/* 🔍 SEARCH + LOCATION */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <Input
                  type="text"
                  placeholder="Search tasks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <Button
                  onClick={handleLocationToggle}
                  variant={locationEnabled ? "default" : "outline"}
                  className="h-11 px-5 flex items-center justify-center gap-2"
                  disabled={locationLoading}
                >
                  {locationLoading ? (
                    <>
                      <Spinner className="h-4 w-4" />
                      Fetching...
                    </>
                  ) : locationEnabled ? (
                    "📍 Location Enabled"
                  ) : (
                    "📍 Use Location"
                  )}
                </Button>
              </div>

              {/* 🧩 CATEGORY FILTERS */}
              <div className="flex gap-2 overflow-x-auto pb-2 mb-8">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                      selectedCategory === cat
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* 📍 NEARBY */}
              {nearbyTasks.length > 0 && (
                <div className="mb-10">
                  <h2 className="text-lg font-semibold mb-4">Nearby Tasks</h2>

                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {nearbyTasks.map((task) => (
                      <Card className="p-4 bg-white/5 border border-white/10 backdrop-blur-xl">
                        {" "}
                        <h3 className="text-sm font-medium">{task.title}</h3>
                        <p className="text-xs text-gray-400 mt-2 line-clamp-2">
                          {task.description}
                        </p>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 📊 SUMMARY */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mb-10">
                <Card className="p-4">
                  <p className="text-xs text-white/50">Total</p>
                  <p className="text-xl font-semibold">{totalTasks}</p>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-white/50">Completed</p>
                  <p className="text-xl font-semibold">{completedTasks}</p>
                </Card>

                <Card className="p-4">
                  <p className="text-xs text-white/50">Pending</p>
                  <p className="text-xl font-semibold">{pendingTasks}</p>
                </Card>
              </div>

              {/* 📦 TASKS */}
              <p className="text-sm text-white/50 mb-4">
                Showing {tasks.length} tasks
              </p>
              {loading ? (
                <div className="flex justify-center py-20">
                  <Spinner />
                </div>
              ) : (
                <motion.div className="relative z-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {" "}
                  {tasks.map((task) => (
                    <motion.div
                      key={task._id}
                      variants={itemVariants}
                      className="rounded-2xl overflow-hidden"
                      whileHover={{
                        scale: 1.04,
                        y: -5,
                        boxShadow: "0 20px 40px rgba(139,92,246,0.25)",
                      }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-xl transition">
                        <div>
                          <div className="flex items-start justify-between">
                            <h3 className="text-lg font-semibold text-white">
                              {task.title}
                            </h3>

                            <div className="text-lg font-bold text-white">
                              ₹{task.rewardAmount}
                            </div>
                          </div>

                          {/* Minimal Info */}
                          <div className="flex items-center justify-between mt-3 text-xs text-white/50">
                            <span>{task.category}</span>
                            <span>{task.owner.name}</span>
                          </div>
                        </div>

                        {/* CTA */}
                        <Link href={`/tasks/${task._id}`}>
                          <Button variant="outline" className="w-full mt-4">
                            View Task
                          </Button>
                        </Link>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </main>
      </motion.div>
    </ProtectedRoute>
  );
}
