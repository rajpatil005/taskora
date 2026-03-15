"use client";

import { useState } from "react";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PostTaskPage() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    itemName: "",
    category: "shopping",
    estimatedPrice: "",
    rewardAmount: "",
    address: "",
  });
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(
    null,
  );

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const categories = [
    "shopping",
    "delivery",
    "cleaning",
    "moving",
    "repair",
    "photography",
    "tutoring",
    "other",
  ];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          });
          toast({
            title: "Success",
            description: "Location captured successfully",
            duration: 2000,
          });
        },
        () => {
          toast({
            title: "Error",
            description:
              "Failed to get location. Please enable location services.",
            variant: "destructive",
          });
        },
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast({
        title: "Error",
        description: "Please select a location for the task",
        variant: "destructive",
      });
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.itemName ||
      !formData.estimatedPrice ||
      !formData.rewardAmount
    ) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        ...formData,
        estimatedPrice: parseFloat(formData.estimatedPrice),
        rewardAmount: parseFloat(formData.rewardAmount),
        location: {
          latitude: location.lat,
          longitude: location.lon,
          address: formData.address || "Location set",
        },
      };

      const response = await fetch(`${API_URL}/api/tasks`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Failed to create task");
      }

      toast({
        title: "Success",
        description: "Task posted successfully!",
        duration: 2000,
      });

      router.push("/my-tasks");
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to post task",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-background">
        <header className="border-b border-border/40 bg-background/95 sticky top-0 z-40">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center gap-4">
              <Link href="/my-tasks">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-foreground">
                Post a New Task
              </h1>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Task Title *
                </label>
                <Input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Buy groceries from nearby market"
                  required
                  disabled={loading}
                />
              </div>

              {/* Item Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Item/Service Name *
                </label>
                <Input
                  type="text"
                  name="itemName"
                  value={formData.itemName}
                  onChange={handleChange}
                  placeholder="e.g., Groceries"
                  required
                  disabled={loading}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the task in detail..."
                  rows={4}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-input rounded-md text-foreground bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="capitalize">
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Estimated Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Estimated Price (₹) *
                </label>
                <Input
                  type="number"
                  name="estimatedPrice"
                  value={formData.estimatedPrice}
                  onChange={handleChange}
                  placeholder="e.g., 500"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              {/* Reward Amount */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Reward Amount (₹) *
                </label>
                <p className="text-xs text-muted-foreground mb-2">
                  This amount will be locked from your wallet until task
                  completion
                </p>
                <Input
                  type="number"
                  name="rewardAmount"
                  value={formData.rewardAmount}
                  onChange={handleChange}
                  placeholder="e.g., 100"
                  min="0"
                  required
                  disabled={loading}
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Location *
                </label>
                <div className="space-y-2">
                  {location ? (
                    <div className="p-3 bg-secondary/50 rounded-md border border-border">
                      <p className="text-sm font-medium text-foreground">
                        Location: {location.lat.toFixed(4)},{" "}
                        {location.lon.toFixed(4)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetLocation}
                        disabled={loading}
                        className="mt-2"
                      >
                        Update Location
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGetLocation}
                      disabled={loading}
                      className="w-full"
                    >
                      Get My Location
                    </Button>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Address (Optional)
                </label>
                <Input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g., 123 Main St, Downtown"
                  disabled={loading}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-4">
                <Button type="submit" disabled={loading} className="flex-1">
                  {loading ? "Posting..." : "Post Task"}
                </Button>
                <Link href="/my-tasks" className="flex-1">
                  <Button
                    variant="outline"
                    disabled={loading}
                    className="w-full"
                  >
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </ProtectedRoute>
  );
}
