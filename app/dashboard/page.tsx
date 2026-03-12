'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Spinner } from '@/components/ui/spinner';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Search, MapPin, Filter } from 'lucide-react';

interface Task {
  _id: string;
  title: string;
  description: string;
  rewardAmount: number;
  category: string;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  owner: {
    _id: string;
    name: string;
    rating: number;
    profilePhoto?: string;
  };
  createdAt: string;
  distance?: number;
}

export default function DashboardPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [radius, setRadius] = useState(10);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Get user location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Geolocation error:', error);
          // Default location (San Francisco)
          setUserLocation({ lat: 37.7749, lon: -122.4194 });
        }
      );
    }
  }, []);

  // Fetch nearby tasks
  useEffect(() => {
    const fetchTasks = async () => {
      if (!userLocation || !token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          latitude: userLocation.lat.toString(),
          longitude: userLocation.lon.toString(),
          radius: radius.toString()
        });

        if (selectedCategory) {
          params.append('category', selectedCategory);
        }

        const response = await fetch(`${API_URL}/api/tasks/nearby?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error('Failed to fetch tasks');

        const data = await response.json();
        setTasks(data.tasks);
      } catch (error) {
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load tasks',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userLocation, token, selectedCategory, radius, API_URL, toast]);

  const handleAcceptTask = async (taskId: string) => {
    if (!token) return;

    try {
      const response = await fetch(`${API_URL}/api/tasks/${taskId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to accept task');

      toast({
        title: 'Success',
        description: 'Task accepted! You can now contact the owner.',
        duration: 2000
      });

      // Remove task from list
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to accept task',
        variant: 'destructive'
      });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const categories = ['shopping', 'delivery', 'cleaning', 'moving', 'repair', 'photography', 'tutoring'];

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b border-border/40 bg-background/95 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-3xl font-bold text-foreground">Find Tasks</h1>
              <Link href="/my-tasks">
                <Button variant="outline">My Tasks</Button>
              </Link>
            </div>

            {/* Location Info */}
            {userLocation && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <MapPin className="w-4 h-4" />
                <span>Showing tasks within {radius}km</span>
              </div>
            )}

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filters
                </Button>
              </div>

              {/* Radius Slider */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-foreground">Search Radius:</label>
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={radius}
                  onChange={(e) => setRadius(parseInt(e.target.value))}
                  className="flex-1 max-w-xs"
                />
                <span className="text-sm text-muted-foreground">{radius}km</span>
              </div>

              {/* Categories */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === '' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('')}
                >
                  All
                </Button>
                {categories.map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="container mx-auto px-4 py-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">No tasks found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your search or radius</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredTasks.map(task => (
                <TaskCard
                  key={task._id}
                  id={task._id}
                  title={task.title}
                  description={task.description}
                  rewardAmount={task.rewardAmount}
                  distance={task.distance || 0}
                  category={task.category}
                  owner={task.owner}
                  createdAt={task.createdAt}
                  onAccept={() => handleAcceptTask(task._id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </ProtectedRoute>
  );
}
