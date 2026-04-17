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
import { MapPin } from "lucide-react";
import { containerVariants, itemVariants } from "@/lib/animations";

interface Task {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: string;
  status: string;
  distance?: number;
  owner: {
    _id: string;
    name: string;
  };
}

const categories = [
  { label: "All", value: "all" },
  { label: "Cleaning", value: "cleaning" },
  { label: "Shopping", value: "shopping" },
  { label: "Delivery", value: "delivery" },
  { label: "Moving", value: "moving" },
  { label: "Repair", value: "repair" },
  { label: "Photography", value: "photography" },
  { label: "Tutoring", value: "tutoring" },
  { label: "Other", value: "other" },
];

export default function DashboardPage() {
  const { token } = useAuth();
  const { toast } = useToast();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [nearbyTasks, setNearbyTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [radius, setRadius] = useState(10); // default 10km

  const [locationLoading, setLocationLoading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    () => {
      if (typeof window === "undefined") return null;
      const saved = localStorage.getItem("location");
      return saved ? JSON.parse(saved) : null;
    },
  );

  const [locationEnabled, setLocationEnabled] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("locationEnabled") === "true";
  });

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 📍 LOCATION FETCH
  const handleLocationToggle = () => {
    if (locationEnabled) {
      setLocationEnabled(false);
      setLocation(null);

      // CLEAR STORAGE
      localStorage.removeItem("location");
      localStorage.removeItem("locationEnabled");

      return;
    }

    if (!navigator.geolocation) return;

    setLocationLoading(true); // ✅ START LOADING

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const posLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };

        setLocation(posLocation);
        setLocationEnabled(true);

        // SAVE TO LOCALSTORAGE
        localStorage.setItem("location", JSON.stringify(posLocation));
        localStorage.setItem("locationEnabled", "true");

        setLocationLoading(false);
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

      // ❌ If location OFF → show nothing
      if (!locationEnabled || !location) {
        setTasks([]);
        setNearbyTasks([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        const params = new URLSearchParams();

        params.append("latitude", location.lat.toString());
        params.append("longitude", location.lng.toString());
        params.append("radius", radius.toString());

        if (selectedCategory !== "all") {
          params.append("category", selectedCategory);
        }

        const url = `${API_URL}/api/tasks/nearby?${params.toString()}`;

        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error();

        const data = await res.json();

        let fetchedTasks = data.tasks;

        // search filter
        if (search) {
          fetchedTasks = fetchedTasks.filter(
            (task: Task) =>
              task.title.toLowerCase().includes(search.toLowerCase()) ||
              task.description.toLowerCase().includes(search.toLowerCase()),
          );
        }

        setTasks(fetchedTasks);
        setNearbyTasks(fetchedTasks.slice(0, 6));
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
  }, [
    token,
    search,
    selectedCategory,
    locationEnabled,
    location?.lat,
    location?.lng,
    radius,
  ]);

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
                  variant={locationEnabled && location ? "default" : "outline"}
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

              <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
                {[5, 10, 25, 50, 100].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRadius(r)}
                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                      radius === r
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {r} km
                  </button>
                ))}
              </div>

              {/* 🧩 CATEGORY FILTERS */}
              <div className="flex flex-wrap gap-2 pb-2 mb-8">
                {" "}
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setSelectedCategory(cat.value)}
                    className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border transition ${
                      selectedCategory === cat.value
                        ? "bg-purple-600 border-purple-600 text-white"
                        : "border-white/10 text-white/70 hover:bg-white/10"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

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
              ) : !locationEnabled || !location ? (
                // 📍 LOCATION DISABLED EMPTY STATE
                <motion.div
                  className="col-span-full flex flex-col items-center justify-center py-24 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-4 opacity-60">
                    <MapPin className="w-10 h-10" />
                  </div>

                  <p className="text-lg font-semibold text-white/80 mb-2">
                    Location is disabled
                  </p>

                  <p className="text-sm text-white/50 max-w-md">
                    Enable your location to discover nearby tasks and start
                    earning.
                  </p>
                </motion.div>
              ) : tasks.length === 0 ? (
                // 📦 NO TASKS EMPTY STATE
                <motion.div
                  className="col-span-full flex flex-col items-center justify-center py-24 text-center"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="mb-4 opacity-60">
                    <MapPin className="w-10 h-10" />
                  </div>

                  <p className="text-lg font-semibold text-white/80 mb-2">
                    No tasks found
                  </p>

                  <p className="text-sm text-white/50 max-w-md">
                    Try increasing your radius or changing category.
                  </p>
                </motion.div>
              ) : (
                <motion.div className="relative z-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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

                            {task.distance !== undefined ? (
                              <span>{task.distance.toFixed(1)} km</span>
                            ) : (
                              <span>{task.owner.name}</span>
                            )}
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
