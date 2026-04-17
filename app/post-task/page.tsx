"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

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
            description: "Enable location services",
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
        description: "Please select a location",
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
        description: "Fill all required fields",
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
        throw new Error(data.message || "Failed");
      }

      toast({
        title: "Success",
        description: "Task posted successfully!",
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
      <main className="min-h-screen bg-transparent text-white">
        {/* HEADER */}
        <Header title="Post Task" />

        {/* FORM */}
        <div className="container mx-auto px-4 py-10 max-w-2xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {" "}
            <Card className="space-y-6 p-8 bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_60px_rgba(139,92,246,0.2)]">
              {" "}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">
                      Task Title *
                    </label>
                    <Input
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Buy groceries from nearby market"
                      disabled={loading}
                    />
                  </div>
                </motion.div>

                {/* Item */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Item / Service *
                  </label>
                  <Input
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    placeholder="Groceries"
                    disabled={loading}
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Description *
                  </label>
                  <Textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    disabled={loading}
                    placeholder="Describe task..."
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Category
                  </label>

                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>

                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Price */}
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">
                      Price (₹)
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
                        ₹
                      </span>

                      <Input
                        type="number"
                        name="estimatedPrice"
                        value={formData.estimatedPrice}
                        onChange={handleChange}
                        disabled={loading}
                        className="no-spinner pl-8 text-right"
                      />
                    </div>
                  </div>

                  {/* Reward */}
                  <div>
                    <label className="text-sm text-white/70 mb-2 block">
                      Reward (₹)
                    </label>

                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50 text-sm">
                        ₹
                      </span>

                      <Input
                        type="number"
                        name="rewardAmount"
                        value={formData.rewardAmount}
                        onChange={handleChange}
                        disabled={loading}
                        className="no-spinner pl-8 text-right
        bg-white/5 border-white/10
        focus:ring-purple-500/30
        focus:border-purple-400/40
        transition-all duration-200
        hover:bg-white/[0.08]"
                      />
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Location *
                  </label>

                  {location ? (
                    <div className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_20px_rgba(255,255,255,0.05)]">
                      {" "}
                      <p className="text-sm text-white/80">
                        {location.lat.toFixed(4)}, {location.lon.toFixed(4)}
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGetLocation}
                        className="mt-3 transition-all hover:scale-105 active:scale-95"
                      >
                        Update Location
                      </Button>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGetLocation}
                      className="w-full"
                    >
                      Get My Location
                    </Button>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Address
                  </label>
                  <Input
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Optional"
                    disabled={loading}
                  />
                </div>

                {/* ACTIONS */}
                <div className="flex gap-4 pt-4">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      type="submit"
                      variant="primary"
                      className="flex-1"
                      disabled={loading}
                    >
                      {loading ? "Posting..." : "Post Task"}
                    </Button>
                  </motion.div>

                  <Link href="/my-tasks" className="flex-1">
                    <Button variant="destructive" className="w-full">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </Card>
          </motion.div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
