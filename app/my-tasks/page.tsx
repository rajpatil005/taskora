'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: string;
  status: 'open' | 'accepted' | 'completed' | 'cancelled';
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
  const [activeTab, setActiveTab] = useState<'posted' | 'accepted'>('posted');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchTasks = async () => {
      if (!token) return;

      setLoading(true);
      try {
        // Fetch posted tasks
        const postedRes = await fetch(`${API_URL}/api/tasks/user/list?role=owner`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        // Fetch accepted tasks
        const acceptedRes = await fetch(`${API_URL}/api/tasks/user/list?role=worker`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

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
          title: 'Error',
          description: 'Failed to load tasks',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [token, API_URL, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      case 'accepted':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'cancelled':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const TaskList = ({ tasks, role }: { tasks: Task[]; role: 'posted' | 'accepted' }) => (
    <div className="space-y-4">
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            {role === 'posted' ? 'No tasks posted yet' : 'No accepted tasks'}
          </p>
          {role === 'posted' && (
            <Link href="/post-task">
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Post a Task
              </Button>
            </Link>
          )}
        </div>
      ) : (
        tasks.map(task => (
          <Card key={task._id} className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <Link href={`/tasks/${task._id}`}>
                  <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
                    {task.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
              </div>
              <div className="text-right ml-4">
                <div className="text-2xl font-bold text-primary">₹{task.rewardAmount}</div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">{task.status}</div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm mb-4 pb-4 border-b border-border">
              {getStatusIcon(task.status)}
              <span className="text-muted-foreground">{task.category}</span>
              {role === 'posted' && task.acceptedBy && (
                <span className="text-muted-foreground">
                  Accepted by <span className="font-medium">{task.acceptedBy.name}</span>
                </span>
              )}
              {role === 'accepted' && (
                <span className="text-muted-foreground">
                  Posted by <span className="font-medium">{task.owner.name}</span>
                </span>
              )}
            </div>

            <Link href={`/tasks/${task._id}`}>
              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </Link>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold text-foreground">My Tasks</h1>
              <Link href="/dashboard">
                <Button variant="outline">Find More Tasks</Button>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          {/* Tabs */}
          <div className="flex gap-2 mb-8 border-b border-border">
            <button
              onClick={() => setActiveTab('posted')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'posted'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Tasks I Posted ({postedTasks.length})
            </button>
            <button
              onClick={() => setActiveTab('accepted')}
              className={`px-4 py-2 font-medium border-b-2 transition ${
                activeTab === 'accepted'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              Tasks I Accepted ({acceptedTasks.length})
            </button>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              {activeTab === 'posted' && <TaskList tasks={postedTasks} role="posted" />}
              {activeTab === 'accepted' && <TaskList tasks={acceptedTasks} role="accepted" />}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
