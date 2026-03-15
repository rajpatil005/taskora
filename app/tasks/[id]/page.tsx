"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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

export default function TaskDetailPage() {
  const { user, token, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const id = params.id;

  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

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
    const fetchTask = async () => {
      if (!token || !id) return;

      try {
        const response = await fetch(`${API_URL}/api/tasks/${id}`, {
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
  }, [id, token, API_URL, toast]);

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

      window.location.href = "/dashboard";
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
    if (!token || !id) return;

    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks/${id}/complete`, {
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

      const res = await fetch(`${API_URL}/api/tasks/${id}`, {
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
    if (!token || !id) return;

    setActionLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/tasks/${id}/confirm`, {
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
      window.location.href = "/my-tasks";
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-yellow-100 text-yellow-800";
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

  const userId = user?._id || user?.id;

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
      <main className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="gap-2 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
            </Link>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="grid gap-8">
            {/* Main Content */}
            <Card className="p-8">
              {/* Header */}
              <div className="mb-6 pb-6 border-b border-border">
                <div className="flex flex-col md:flex-row items-start justify-between mb-4">
                  <div className="flex-1 space-y-2">
                    {editing ? (
                      <div className="space-y-2">
                        <input
                          className="w-full border p-2 rounded"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          placeholder="Title"
                        />
                        <textarea
                          className="w-full border p-2 rounded"
                          value={editDescription}
                          onChange={(e) => setEditDescription(e.target.value)}
                          placeholder="Description"
                        />
                        <input
                          className="w-full border p-2 rounded"
                          value={editItemName}
                          onChange={(e) => setEditItemName(e.target.value)}
                          placeholder="Item Name"
                        />

                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={handleSaveEdit}
                            disabled={actionLoading}
                          >
                            {actionLoading ? "Saving..." : "Save"}
                          </Button>
                          <Button variant="outline" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-4xl font-bold text-foreground">
                          {task.title}
                        </h1>
                        <p className="text-muted-foreground">
                          {task.description}
                        </p>
                      </>
                    )}
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <div className="text-4xl font-bold text-primary">
                      ₹{task.rewardAmount}
                    </div>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(
                        task.status,
                      )}`}
                    >
                      {task.status.charAt(0).toUpperCase() +
                        task.status.slice(1)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Details Grid (unchanged) */}
              <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">
                    Task Details
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-muted-foreground text-sm block">
                        Category
                      </span>
                      <span className="font-medium">
                        {task.category.charAt(0).toUpperCase() +
                          task.category.slice(1)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Estimated Price:
                      </span>
                      <span className="font-medium">
                        ₹{task.estimatedPrice}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">
                        Item:
                      </span>
                      <span className="font-medium">{task.itemName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <span className="text-muted-foreground text-sm block">
                          Location
                        </span>
                        <span className="font-medium">
                          {task.location.address ||
                            `${task.location.latitude}, ${task.location.longitude}`}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground mb-4">
                    Posted Info
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Posted on{" "}
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {/* Accepted / Completed / Confirmed Info */}
                    {/* Accepted Info */}
                    {task.status === "accepted" && task.acceptedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <p className="text-sm text-muted-foreground">
                          Accepted by {task.acceptedBy?.name} on{" "}
                          {new Date(task.acceptedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {/* Completed Info */}
                    {task.status === "completed" && task.completedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <p className="text-sm text-green-700">
                          Completed by {task.acceptedBy?.name} on{" "}
                          {new Date(task.completedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {task.status === "confirmed" && task.completedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-muted-foreground">
                          Confirmed by {task.owner?.name} on{" "}
                          {new Date(task.completedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner / Worker Card (unchanged) */}
              <Card className="p-6 bg-secondary/5">
                {isTaskOwner ? (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Task Owner (You)
                    </h3>
                    {task.acceptedBy && (
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          {task.acceptedBy.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{task.acceptedBy.name}</p>
                          <div className="flex items-center gap-1 text-sm">
                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-muted-foreground">
                              {task.acceptedBy?.rating?.toFixed(1) || "0.0"}
                            </span>
                          </div>
                        </div>
                        <Link href={`/chat/${task._id}`}>
                          <Button size="sm" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">
                      Task Posted By
                    </h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {task.owner?.name?.charAt(0) || "U"}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{task.owner.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.owner.completedTasks} tasks completed
                        </p>
                        <div className="flex items-center gap-1 text-sm mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-muted-foreground">
                            {task.owner?.rating?.toFixed(1) || "0.0"}
                          </span>
                        </div>
                      </div>
                      {isTaskWorker && (
                        <Link href={`/chat/${task._id}`}>
                          <Button size="sm" className="gap-2">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </Card>

              {/* Action Buttons */}
              {task.status === "accepted" && isTaskWorker && (
                <Card className="p-6 bg-green-50 border-green-200">
                  <h3 className="font-semibold text-green-900 mb-4">
                    Mark Task as Completed
                  </h3>
                  <p className="text-sm text-green-800 mb-4">
                    Once you have finished the task, mark it as completed so the
                    task owner can review and release payment.
                  </p>
                  <Button
                    onClick={handleMarkCompleted}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading ? "Submitting..." : "Mark as Completed"}
                  </Button>
                </Card>
              )}
              {isTaskOwner && task.status === "open" && !editing && (
                <div className="flex gap-4 mt-6">
                  <Button
                    variant="outline"
                    onClick={handleEditTask}
                    className="gap-2"
                  >
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

              {task.status === "completed" && isTaskOwner && (
                <Card className="p-6 bg-blue-50 border-blue-200">
                  <h3 className="font-semibold text-blue-900 mb-4">
                    Confirm Task Completion
                  </h3>
                  <p className="text-sm text-blue-800 mb-4">
                    The worker marked this task as completed. Please confirm if
                    the work is done.
                  </p>
                  <Button
                    onClick={handleConfirmCompletion}
                    disabled={actionLoading}
                    className="gap-2"
                  >
                    {actionLoading ? "Confirming..." : "Confirm Completion"}
                  </Button>
                </Card>
              )}
              {task.status === "confirmed" &&
                (isTaskOwner || isTaskWorker) &&
                !alreadyReviewed && (
                  <Card className="p-6 mt-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Leave a Review
                    </h3>

                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium">Rating</label>
                        <select
                          className="w-full border p-2 rounded mt-1"
                          value={rating}
                          onChange={(e) => setRating(Number(e.target.value))}
                        >
                          <option value={5}>5 ⭐</option>
                          <option value={4}>4 ⭐</option>
                          <option value={3}>3 ⭐</option>
                          <option value={2}>2 ⭐</option>
                          <option value={1}>1 ⭐</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium">Comment</label>
                        <textarea
                          className="w-full border p-2 rounded mt-1"
                          placeholder="Write your experience..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                      </div>

                      <Button
                        onClick={handleSubmitReview}
                        disabled={reviewSubmitting}
                      >
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </Button>
                    </div>
                  </Card>
                )}
              {task.status === "confirmed" && alreadyReviewed && (
                <Card className="p-6 mt-6">
                  <h3 className="font-semibold text-green-700">
                    Review submitted
                  </h3>
                  <p className="text-sm text-muted-foreground mt-2">
                    Thank you for leaving feedback.
                  </p>
                </Card>
              )}
            </Card>
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
