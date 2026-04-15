"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { containerVariants, itemVariants } from "@/lib/animations";

import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  ArrowLeft,
} from "lucide-react";

interface Task {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: string;
  status: "open" | "accepted" | "completed" | "cancelled";
  owner: {
    _id: string;
    name: string;
  };
  acceptedBy?: {
    _id: string;
    name: string;
  };
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

export default function MyTasksPage() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [postedTasks, setPostedTasks] = useState<Task[]>([]);
  const [acceptedTasks, setAcceptedTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posted" | "accepted">("posted");

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;

      setLoading(true);
      try {
        const [postedRes, acceptedRes] = await Promise.all([
          fetch(`${API_URL}/api/tasks/user/list?role=owner`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_URL}/api/tasks/user/list?role=worker`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (postedRes.ok) {
          const postedData = await postedRes.json();
          setPostedTasks(postedData.tasks);
        }

        if (acceptedRes.ok) {
          const acceptedData = await acceptedRes.json();
          setAcceptedTasks(acceptedData.tasks);
        }
      } catch (error) {
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
  }, [token, API_URL, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      case "accepted":
        return <Clock className="w-4 h-4 text-blue-400" />;
      case "cancelled":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "confirmed":
        return <CheckCircle2 className="w-4 h-4 text-teal-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const TaskList = ({
    tasks,
    role,
  }: {
    tasks: Task[];
    role: "posted" | "accepted";
  }) => (
    <motion.div
      className="relative z-10 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {" "}
      {!loading && tasks.length === 0 ? (
        <motion.div
          className="col-span-full flex flex-col items-center justify-center py-24 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-4 opacity-60">
            <Clock className="w-10 h-10" />
          </div>

          <p className="text-lg font-semibold text-white/80 mb-2">
            {role === "posted" ? "No tasks posted yet" : "No accepted tasks"}
          </p>

          <p className="text-sm text-white/50 max-w-md">
            {role === "accepted"
              ? "Browse tasks from the dashboard and start earning by completing them."
              : "Start by posting your first task and get things done quickly."}
          </p>
        </motion.div>
      ) : (
        tasks.map((task) => (
          <motion.div
            key={task._id}
            variants={itemVariants}
            className="rounded-2xl overflow-hidden"
            style={{ transformStyle: "preserve-3d" }}
            whileHover={{
              scale: 1.04,
              y: -5,
              boxShadow: "0 20px 40px rgba(139,92,246,0.25)",
            }}
          >
            <Card
              key={task._id}
              className="relative z-[9999] p-6 bg-white/5 border border-white/10 backdrop-blur-xl transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <Link href={`/tasks/${task._id}`}>
                    <h3 className="text-lg font-semibold text-white hover:text-primary transition cursor-pointer truncate">
                      {" "}
                      {task.title}
                    </h3>
                  </Link>
                  <p className="text-sm text-white/60 mt-1 line-clamp-2">
                    {" "}
                    {task.description}
                  </p>
                </div>

                <div className="text-right ml-4">
                  <div className="text-2xl font-bold text-white text-primary">
                    ₹{task.rewardAmount}
                  </div>
                  <div className="text-xs text-white/50 mt-1 capitalize">
                    {task.status}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-b border-white/10">
                {getStatusIcon(task.status)}
                <span className="text-white/60">{task.category}</span>

                {role === "posted" &&
                  task.acceptedBy &&
                  task.status === "accepted" && (
                    <span className="text-white/60">
                      Accepted by{" "}
                      <span className="text-white font-medium">
                        {task.acceptedBy.name}
                      </span>
                    </span>
                  )}

                {role === "posted" &&
                  task.acceptedBy &&
                  task.status === "completed" && (
                    <span className="text-white/60">
                      Completed by{" "}
                      <span className="text-white font-medium">
                        {task.acceptedBy.name}
                      </span>
                    </span>
                  )}

                {role === "accepted" && (
                  <span className="text-white/60">
                    Posted by{" "}
                    <span className="text-white font-medium">
                      {task.owner.name}
                    </span>
                  </span>
                )}
              </div>

              <Link href={`/tasks/${task._id}`}>
                <Button variant="outline" className="w-full">
                  {" "}
                  View Details
                </Button>
              </Link>
            </Card>
          </motion.div>
        ))
      )}
    </motion.div>
  );

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-transparent text-white relative z-10">
        {" "}
        <header className="border-b border-white/10 bg-transparent/90 backdrop-blur-xl sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6 flex items-center gap-20">
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>

            <h1 className="text-3xl font-bold text-white">My Tasks</h1>
          </div>
        </header>
        <motion.div
          className="max-w-[1400px] mx-auto px-4 py-8 relative z-10"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {" "}
          {/* Tabs + Button Row */}
          <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
            {/* LEFT SIDE TABS */}
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab("posted")}
                className={`tab-btn ${activeTab === "posted" ? "tab-active" : ""}`}
              >
                Tasks I Posted ({postedTasks.length})
              </button>

              <button
                onClick={() => setActiveTab("accepted")}
                className={`tab-btn ${activeTab === "accepted" ? "tab-active" : ""}`}
              >
                Tasks I Accepted ({acceptedTasks.length})
              </button>
            </div>

            {/* RIGHT SIDE BUTTON */}
            {activeTab === "posted" && (
              <Link href="/post-task">
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button variant="primary" className="gap-2 btn-glow">
                    {" "}
                    <Plus className="w-4 h-4" />
                    Post a Task
                  </Button>
                </motion.div>
              </Link>
            )}
          </div>
          {/* CONTENT */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {" "}
              {activeTab === "posted" && (
                <TaskList tasks={postedTasks} role="posted" />
              )}
              {activeTab === "accepted" && (
                <TaskList tasks={acceptedTasks} role="accepted" />
              )}
            </motion.div>
          )}
        </motion.div>
      </main>
    </ProtectedRoute>
  );
}
