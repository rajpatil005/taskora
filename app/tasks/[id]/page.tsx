"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import ChatWindow from "@/components/ChatWindow";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { MapPin, Clock, Star, ArrowLeft, MessageSquare } from "lucide-react";

interface TaskDetail {
  _id: string;
  title: string;
  description: string;
  itemName: string;
  category: string;
  estimatedPrice: number;
  rewardAmount: number;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  status: "open" | "accepted" | "completed" | "confirmed" | "cancelled";
  owner: {
    _id: string;
    name: string;
    email: string;
    rating: number;
    completedTasks: number;
    profilePhoto?: string;
  };
  acceptedBy?: {
    _id: string;
    name: string;
    rating: number;
  };
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
  referencePhoto?: string;
  completionPhoto?: string;
  isReviewedByOwner?: boolean;
  isReviewedByWorker?: boolean;
}

/** Tweens only (no layout springs) — cheaper than springs on large scrollable panels */
const EASE_PANEL = [0.22, 1, 0.36, 1] as const;

const PANEL_TWEEN = {
  type: "tween" as const,
  duration: 0.28,
  ease: EASE_PANEL,
};

/** Single layout tween: avoids spring physics cost during flex reflow */
const TASK_COLUMN_TRANSITION = {
  layout: PANEL_TWEEN,
  opacity: PANEL_TWEEN,
  y: PANEL_TWEEN,
};

/** Chat slide: transform + opacity only (no scale — large blur layers are costly to scale) */
const chatPanelVariants = {
  hidden: { opacity: 0, x: "100%" },
  visible: { opacity: 1, x: 0 },
};

export default function TaskDetailPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const _id = params.id;
  const router = useRouter();

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  // Edit state
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editItemName, setEditItemName] = useState("");

  // delete state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleAcceptTask = async () => {
    if (!token || !_id) return;

    try {
      setActionLoading(true);

      const res = await fetch(`${API_URL}/api/tasks/${_id}/accept`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to accept task");

      toast({
        title: "Success",
        description: "Task accepted successfully",
        duration: 2000,
      });

      // refresh task
      const refresh = await fetch(`${API_URL}/api/tasks/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const refreshed = await refresh.json();
      setTask(refreshed.task);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Accept failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    const fetchTask = async () => {
      if (!token || !_id) return;

      try {
        const response = await fetch(`${API_URL}/api/tasks/${_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) throw new Error("Task not found");

        const data = await response.json();
        setTask(data.task);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load task details",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [_id, token, API_URL, toast]);

  const handleEditTask = () => {
    if (!task) return;

    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditItemName(task.itemName);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!task || !token) return;

    try {
      setActionLoading(true);

      const res = await fetch(`${API_URL}/api/tasks/${task._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: editTitle,
          description: editDescription,
          itemName: editItemName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update task");

      toast({
        title: "Success",
        description: "Task updated successfully",
        duration: 2000,
      });

      setTask(data.task);
      setEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Update failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to delete task");

      toast({
        title: "Success",
        description: "Task deleted successfully",
        duration: 2000,
      });

      router.push("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Delete failed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkCompleted = async () => {
    if (!token || !_id) return;

    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks/${_id}/complete`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to mark task completed");

      toast({
        title: "Success",
        description:
          "Task marked as completed. Waiting for owner confirmation.",
        duration: 2000,
      });

      const res = await fetch(`${API_URL}/api/tasks/${_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      setTask(data.task);
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to mark completed",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmCompletion = async () => {
    if (!token || !_id) return;

    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks/${_id}/confirm`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to confirm completion");

      toast({
        title: "Success",
        description: "Task confirmed successfully",
        duration: 2000,
      });

      // redirect to My Tasks page so list refreshes
      router.push("/my-tasks");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to confirm completion",
        variant: "destructive",
      });
    } finally {
      setActionLoading(false);
    }
  };
  const handleSubmitReview = async () => {
    if (!token || !task) return;

    try {
      setReviewSubmitting(true);

      const res = await fetch(`${API_URL}/api/reviews/${task._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          rating,
          comment,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to submit review");

      toast({
        title: "Success",
        description: "Review submitted successfully",
        duration: 2000,
      });

      setComment("");
      setTask((prev) => {
        if (!prev) return prev;

        if (isTaskOwner && prev.acceptedBy) {
          // update worker's rating immediately
          return {
            ...prev,
            isReviewedByOwner: true,
            acceptedBy: {
              ...prev.acceptedBy,
              rating: data.revieweeUpdatedRating, // new rating from backend
            },
          };
        } else if (isTaskWorker && prev.owner) {
          // update owner's rating immediately
          return {
            ...prev,
            isReviewedByWorker: true,
            owner: {
              ...prev.owner,
              rating: data.revieweeUpdatedRating, // new rating from backend
            },
          };
        }
        return prev;
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Review failed",
        variant: "destructive",
      });
    } finally {
      setReviewSubmitting(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "pending":
        return "bg-white/5 text-white/60 border border-white/10";

      case "accepted":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.2)]";

      case "completed":
        return "bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_10px_rgba(34,197,94,0.2)]";

      case "confirmed":
        return "bg-gradient-to-r from-purple-600/20 to-blue-600/20 text-white border border-purple-500/30 shadow-[0_0_18px_rgba(139,92,246,0.35)]";

      default:
        return "bg-white/5 text-white/60 border border-white/10";
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Loading...</div>
        </main>
      </ProtectedRoute>
    );
  }

  if (!task) {
    return (
      <ProtectedRoute>
        <main className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8 text-center">
            <p className="text-muted-foreground">Task not found</p>
          </div>
        </main>
      </ProtectedRoute>
    );
  }

  const userId = user?._id;

  // Check if task.owner exists before comparing
  const isTaskOwner =
    userId && task.owner && userId.toString() === task.owner._id?.toString();

  // Check if task.acceptedBy exists before comparing
  const isTaskWorker =
    userId &&
    task.acceptedBy &&
    userId.toString() === task.acceptedBy._id?.toString();
  const alreadyReviewed =
    (isTaskOwner && task.isReviewedByOwner) ||
    (isTaskWorker && task.isReviewedByWorker);
  return (
    <ProtectedRoute>
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
            <h2 className="text-lg font-semibold mb-2">Delete Task</h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this task? This action cannot be
              undone.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                onClick={() => handleDeleteTask(task!._id)}
                disabled={actionLoading}
              >
                {actionLoading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <main className="min-h-screen bg-transparent text-white">
        {/* HEADER */}
        <Header title="Task Details" />

        <div className="container mx-auto px-4 py-6 min-h-0">
          <div
            className={`flex gap-5 items-stretch min-h-0 w-full overflow-x-hidden ${isMobile ? "" : "h-[calc(100dvh-8.5rem)] max-h-[calc(100dvh-8.5rem)]"}] ${
              showChat ? "" : "justify-center"
            }`}
          >
            {/* TASK CARD — only this node uses layout; parent/chat skip layout measurement */}
            <motion.div
              layout
              transition={TASK_COLUMN_TRANSITION}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex min-h-0 min-w-0 flex-col ${
                showChat && !isMobile
                  ? "flex-[1.22] basis-0"
                  : "w-full max-w-3xl shrink-0"
              }`}
            >
              <Card className="Card flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-md">
                <div
                  className={`flex-1 pr-2 ${
                    isMobile
                      ? "overflow-visible"
                      : "overflow-y-auto scrollbar-stable"
                  }`}
                >
                  {" "}
                  {/* Header */}
                  <div className="mb-8 pb-8 border-b border-white/10 text-white">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                      {/* LEFT */}
                      <div className="flex-1 space-y-4">
                        {editing ? (
                          <div className="space-y-4">
                            {/* Title */}
                            <input
                              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 
                       text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30
                       transition-all"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              placeholder="Title"
                            />

                            {/* Description */}
                            <textarea
                              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 
                       text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30
                       transition-all"
                              value={editDescription}
                              onChange={(e) =>
                                setEditDescription(e.target.value)
                              }
                              placeholder="Description"
                            />

                            {/* Item */}
                            <input
                              className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 
                       text-white placeholder:text-white/40
                       focus:outline-none focus:ring-2 focus:ring-purple-500/30
                       transition-all"
                              value={editItemName}
                              onChange={(e) => setEditItemName(e.target.value)}
                              placeholder="Item Name"
                            />

                            {/* Actions */}
                            <div className="flex gap-3 mt-2">
                              <Button
                                onClick={handleSaveEdit}
                                disabled={actionLoading}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white
                         hover:brightness-110 hover:shadow-[0_0_16px_rgba(139,92,246,0.25)]
                         active:brightness-95"
                              >
                                {actionLoading ? "Saving..." : "Save"}
                              </Button>

                              <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                                className="border-white/20 text-white/70 hover:bg-white/10"
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {/* Title */}
                            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
                              {task.title}
                            </h1>

                            {/* Description */}
                            <p className="text-white/60 text-base max-w-2xl leading-relaxed">
                              {task.description}
                            </p>
                          </>
                        )}
                      </div>

                      {/* RIGHT */}
                      <div className="flex flex-col items-start md:items-end gap-3">
                        {/* Reward */}
                        <div
                          className="text-3xl md:text-4xl font-bold 
                      bg-gradient-to-r from-purple-400 to-blue-400 
                      bg-clip-text text-transparent"
                        >
                          ₹{task.rewardAmount}
                        </div>

                        {/* Status Badge */}
                        <motion.div
                          key={task.status}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={PANEL_TWEEN}
                          className={`px-4 py-1.5 rounded-full ${getStatusStyle(task.status)}`}
                        >
                          {task.status.charAt(0).toUpperCase() +
                            task.status.slice(1)}
                        </motion.div>
                      </div>
                    </div>
                  </div>
                  {/* Owner / Worker Card (unchanged) */}
                  {/* Details Grid */}
                  <div className="grid md:grid-cols-2 gap-10 mb-10 pb-10 border-b border-white/10 text-white">
                    {/* LEFT PANEL */}
                    <div className="space-y-6 text-white">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        Task Details
                      </h3>

                      <div className="space-y-5 text-white/90">
                        {/* Category */}
                        <div className="flex flex-col">
                          <span className="text-xs uppercase tracking-wide text-white/50">
                            Category
                          </span>
                          <span className="text-base font-medium text-white">
                            {task.category.charAt(0).toUpperCase() +
                              task.category.slice(1)}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10" />

                        {/* Price */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/50">
                            Estimated Price
                          </span>
                          <span className="text-base font-semibold text-white">
                            ₹{task.estimatedPrice}
                          </span>
                        </div>

                        {/* Item */}
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white/50">Item</span>
                          <span className="text-base font-medium text-white">
                            {task.itemName}
                          </span>
                        </div>

                        {/* Divider */}
                        <div className="h-px bg-white/10" />

                        {/* Location */}
                        <div className="flex items-start gap-3">
                          <MapPin className="w-4 h-4 mt-1 text-white/50" />

                          <div className="flex flex-col">
                            <span className="text-xs uppercase tracking-wide text-white/50">
                              Location
                            </span>
                            <span className="text-sm leading-relaxed text-white/90">
                              {task.location.address ||
                                `${task.location.latitude}, ${task.location.longitude}`}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="space-y-6 text-white">
                      <h3 className="text-lg font-semibold tracking-tight text-white">
                        Activity
                      </h3>

                      <div className="space-y-5 text-white/90">
                        {/* Created */}
                        <div className="flex items-center gap-3">
                          <Clock className="w-4 h-4 text-white/50" />
                          <span className="text-sm text-white/60">
                            Posted on{" "}
                            <span className="font-medium text-white">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </span>
                        </div>

                        {/* Accepted */}
                        {task.status === "accepted" && task.acceptedAt && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 mt-0.5 text-purple-400" />
                            <p className="text-sm leading-relaxed text-white/60">
                              Accepted by{" "}
                              <span className="font-medium text-white">
                                {task.acceptedBy?.name}
                              </span>{" "}
                              on{" "}
                              <span className="text-white">
                                {new Date(task.acceptedAt).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Completed */}
                        {task.status === "completed" && task.completedAt && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 mt-0.5 text-green-400" />
                            <p className="text-sm leading-relaxed text-white/60">
                              Completed by{" "}
                              <span className="font-medium text-white">
                                {task.acceptedBy?.name}
                              </span>{" "}
                              on{" "}
                              <span className="text-white">
                                {new Date(
                                  task.completedAt,
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        )}

                        {/* Confirmed */}
                        {task.status === "confirmed" && task.completedAt && (
                          <div className="flex items-start gap-3">
                            <Clock className="w-4 h-4 mt-0.5 text-blue-400" />
                            <p className="text-sm leading-relaxed text-white/60">
                              Confirmed by{" "}
                              <span className="font-medium text-white">
                                {task.owner?.name}
                              </span>{" "}
                              on{" "}
                              <span className="text-white">
                                {new Date(
                                  task.completedAt,
                                ).toLocaleDateString()}
                              </span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* ================= ACTION SECTION ================= */}
                  {task.status === "open" && !isTaskOwner && (
                    <Card className="p-6 mt-6 bg-purple-500/10 border border-purple-500/20 text-white">
                      <h3 className="font-semibold text-lg">
                        Accept this Task
                      </h3>
                      <p className="text-sm text-white/60 mt-1">
                        You can accept this task and start working on it.
                      </p>

                      <Button
                        onClick={handleAcceptTask}
                        disabled={actionLoading}
                        className="w-full mt-4"
                      >
                        {actionLoading ? "Accepting..." : "Accept Task"}
                      </Button>
                    </Card>
                  )}
                  {/* 💬 CHAT BUTTON (available when task is accepted/completed/confirmed) */}
                  {(task.status === "accepted" ||
                    task.status === "completed" ||
                    task.status === "confirmed") && (
                    <div className="mt-6">
                      <Button
                        variant="outline"
                        className="w-full flex items-center justify-center gap-2 border-white/20 text-white hover:bg-white/10"
                        onClick={() => {
                          if (isMobile) {
                            router.push(`/chat/${task._id}`);
                          } else {
                            setShowChat((prev) => !prev);
                          }
                        }}
                      >
                        <MessageSquare className="w-4 h-4" />
                        {showChat ? "Close Chat" : "Message"}
                      </Button>
                    </div>
                  )}
                  {/* 🟢 WORKER → MARK COMPLETED */}
                  {task.status === "accepted" && isTaskWorker && (
                    <Card className="p-6 mt-6 bg-green-500/10 border border-green-500/20 text-white space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          Mark Task as Completed
                        </h3>
                        <p className="text-sm text-white/60 mt-1">
                          Once you're done, mark it as completed so the owner
                          can confirm.
                        </p>
                      </div>

                      <Button
                        onClick={handleMarkCompleted}
                        disabled={actionLoading}
                        className="w-full flex items-center justify-center gap-2"
                      >
                        {actionLoading ? (
                          <>
                            <Spinner className="h-4 w-4" />
                            Submitting...
                          </>
                        ) : (
                          "Mark as Completed"
                        )}
                      </Button>
                    </Card>
                  )}
                  {/* 🔵 OWNER → CONFIRM COMPLETION */}
                  {task.status === "completed" && isTaskOwner && (
                    <Card className="p-6 mt-6 bg-blue-500/10 border border-blue-500/20 text-white">
                      <h3 className="font-semibold mb-2">Confirm Task</h3>
                      <p className="text-sm text-white/60 mb-4">
                        Worker marked task completed. Confirm to finish.
                      </p>

                      <Button
                        onClick={handleConfirmCompletion}
                        disabled={actionLoading}
                      >
                        {actionLoading ? "Confirming..." : "Confirm Completion"}
                      </Button>
                    </Card>
                  )}
                  {/* ✏️ EDIT + DELETE (ONLY BEFORE ACCEPTED) */}
                  {task.status === "open" && isTaskOwner && !editing && (
                    <div className="flex gap-4 mt-6">
                      <Button variant="outline" onClick={handleEditTask}>
                        Edit Task
                      </Button>

                      <Button
                        variant="destructive"
                        onClick={() => setShowDeleteConfirm(true)}
                      >
                        Delete Task
                      </Button>
                    </div>
                  )}
                  {/* ⭐ REVIEW (ONLY AFTER CONFIRMED) */}
                  {task.status === "confirmed" &&
                    (isTaskOwner || isTaskWorker) &&
                    !alreadyReviewed && (
                      <div>
                        <Card className="p-6 mt-6 bg-white/5 border border-white/10 text-white">
                          <h3 className="font-semibold mb-4">Leave a Review</h3>

                          <div className="space-y-4">
                            <div>
                              <label className="text-sm text-white/70">
                                Rating
                              </label>
                              <Select
                                value={String(rating)}
                                onValueChange={(val) => setRating(Number(val))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select rating" />
                                </SelectTrigger>

                                <SelectContent>
                                  <SelectItem value="5">5 ⭐</SelectItem>
                                  <SelectItem value="4">4 ⭐</SelectItem>
                                  <SelectItem value="3">3 ⭐</SelectItem>
                                  <SelectItem value="2">2 ⭐</SelectItem>
                                  <SelectItem value="1">1 ⭐</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <label className="text-sm text-white/70">
                                Comment
                              </label>
                              <textarea
                                className="w-full mt-1 p-2 rounded bg-white/5 border border-white/10"
                                placeholder="Write your experience..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                              />
                            </div>

                            <Button
                              onClick={handleSubmitReview}
                              disabled={reviewSubmitting}
                            >
                              {reviewSubmitting
                                ? "Submitting..."
                                : "Submit Review"}
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )}
                  {/* ✅ REVIEW DONE */}
                  {task.status === "confirmed" && alreadyReviewed && (
                    <Card className="p-6 mt-6 bg-green-500/10 border border-green-500/20 text-white">
                      <h3 className="font-semibold">Review submitted</h3>
                      <p className="text-sm text-white/60 mt-2">
                        Thanks for your feedback.
                      </p>
                    </Card>
                  )}
                </div>
              </Card>
            </motion.div>
            <AnimatePresence mode="sync" initial={false}>
              {showChat && !isMobile && (
                <motion.div
                  key="task-chat"
                  variants={chatPanelVariants}
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  transition={PANEL_TWEEN}
                  className="flex min-h-0 min-w-0 flex-1 basis-0 flex-col"
                >
                  <ChatWindow taskId={task._id} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
