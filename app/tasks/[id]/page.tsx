'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { MapPin, Clock, User, Star, ArrowLeft, MessageSquare } from 'lucide-react';

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
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
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
}

export default function TaskDetailPage({
  params
}: {
  params: { id: string };
}) {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTask = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${API_URL}/api/tasks/${params.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Task not found');

        const data = await response.json();
        setTask(data.task);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load task details',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [params.id, token, API_URL, toast]);

  const handleConfirmCompletion = async () => {
    if (!token) return;

    setActionLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/tasks/${params.id}/confirm`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Failed to confirm completion');

      toast({
        title: 'Success',
        description: 'Task completion confirmed! Payment has been released.',
        duration: 2000
      });

      // Refetch task
      const res = await fetch(`${API_URL}/api/tasks/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setTask(data.task);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to confirm',
        variant: 'destructive'
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'accepted':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
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

  const isTaskOwner = user?._id === task.owner._id;
  const isTaskWorker = task.acceptedBy && user?._id === task.acceptedBy._id;

  return (
    <ProtectedRoute>
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
                <div className="flex items-start justify-between mb-4">
                  <h1 className="text-4xl font-bold text-foreground">{task.title}</h1>
                  <div className="text-right">
                    <div className="text-4xl font-bold text-primary">₹{task.rewardAmount}</div>
                    <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mt-2 ${getStatusColor(task.status)}`}>
                      {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">{task.description}</p>
              </div>

              {/* Details Grid */}
              <div className="grid md:grid-cols-2 gap-6 mb-8 pb-8 border-b border-border">
                <div>
                  <h3 className="font-semibold text-foreground mb-4">Task Details</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Category:</span>
                      <span className="font-medium capitalize">{task.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Estimated Price:</span>
                      <span className="font-medium">₹{task.estimatedPrice}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground text-sm">Item:</span>
                      <span className="font-medium">{task.itemName}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-1" />
                      <div>
                        <span className="text-muted-foreground text-sm block">Location</span>
                        <span className="font-medium">{task.location.address || `${task.location.latitude}, ${task.location.longitude}`}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-foreground mb-4">Posted Info</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Posted on {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {task.acceptedAt && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">
                          Accepted on {new Date(task.acceptedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Owner/Worker Info */}
              <Card className="p-6 bg-secondary/5">
                {isTaskOwner ? (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Task Owner (You)</h3>
                    {task.acceptedBy && (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground mb-4">Worker Assigned:</p>
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                            {task.acceptedBy.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{task.acceptedBy.name}</p>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                              <span className="text-muted-foreground">{task.acceptedBy.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <Link href={`/chat/${task._id}`}>
                            <Button size="sm" className="gap-2">
                              <MessageSquare className="w-4 h-4" />
                              Message
                            </Button>
                          </Link>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <h3 className="font-semibold text-foreground mb-4">Task Posted By</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                        {task.owner.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{task.owner.name}</p>
                        <p className="text-sm text-muted-foreground">{task.owner.completedTasks} tasks completed</p>
                        <div className="flex items-center gap-1 text-sm mt-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-muted-foreground">{task.owner.rating.toFixed(1)}</span>
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
            </Card>

            {/* Actions */}
            {task.status === 'completed' && isTaskOwner && (
              <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="font-semibold text-blue-900 mb-4">Confirm Task Completion</h3>
                <p className="text-sm text-blue-800 mb-4">
                  Please review the work done. If satisfied, confirm the completion to release payment to the worker.
                </p>
                <Button
                  onClick={handleConfirmCompletion}
                  disabled={actionLoading}
                  className="gap-2"
                >
                  {actionLoading ? 'Confirming...' : 'Confirm & Release Payment'}
                </Button>
              </Card>
            )}
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
