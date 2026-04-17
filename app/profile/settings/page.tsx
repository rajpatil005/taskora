"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useAuth } from "@/lib/authContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogOut } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, token, logout, updateUser } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
        }),
      });

      if (!response.ok) throw new Error("Failed to update profile");

      const data = await response.json();
      updateUser({
        name: data.user.name,
        phone: data.user.phone,
      });

      toast({
        title: "Success",
        description: "Profile updated successfully",
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/users/password/change`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword,
        }),
      });

      if (!response.ok) throw new Error("Failed to change password");

      toast({
        title: "Success",
        description: "Password changed successfully",
        duration: 2000,
      });

      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to change password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <ProtectedRoute>
      <main className="min-h-screen bg-transparent text-white">
        {/* HEADER */}
        <Header title="Profile Settings" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="container mx-auto px-4 py-10 max-w-2xl space-y-8"
        >
          {" "}
          {/* PROFILE INFO */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 bg-white/[0.04] border border-white/10 backdrop-blur-xl rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              {" "}
              <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
              <div className="h-px bg-white/10 mb-6"></div>
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-white/5 border-white/10 text-white
focus:ring-2 focus:ring-purple-500/30
focus:border-purple-400/40
transition-all duration-200
hover:bg-white/[0.08]"
                  />
                  <p className="text-xs text-white/40 mt-2">
                    Email cannot be changed
                  </p>
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Full Name
                  </label>
                  <Input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-white/5 border-white/10 text-white
focus:ring-2 focus:ring-purple-500/30
focus:border-purple-400/40
transition-all duration-200
hover:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-white/5 border-white/10 text-white
focus:ring-2 focus:ring-purple-500/30
focus:border-purple-400/40
transition-all duration-200
hover:bg-white/[0.08]"
                  />
                </div>

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full transition-all duration-200 hover:scale-[1.02]"
                  >
                    {" "}
                    {loading ? "Updating..." : "Update Profile"}
                  </Button>
                </motion.div>
              </form>
            </Card>{" "}
          </motion.div>
          {/* PASSWORD */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 bg-white/5 border border-white/10 backdrop-blur-lg">
              <h2 className="text-2xl font-bold mb-6">Change Password</h2>
              <div className="h-px bg-white/10 mb-6"></div>

              <form onSubmit={handleChangePassword} className="space-y-6">
                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Current Password
                  </label>
                  <Input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-white/5 border-white/10 text-white
focus:ring-2 focus:ring-purple-500/30
focus:border-purple-400/40
transition-all duration-200
hover:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    New Password
                  </label>
                  <Input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-white/5 border-white/10 text-white
focus:ring-2 focus:ring-purple-500/30
focus:border-purple-400/40
transition-all duration-200
hover:bg-white/[0.08]"
                  />
                </div>

                <div>
                  <label className="text-sm text-white/70 mb-2 block">
                    Confirm Password
                  </label>
                  <Input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    disabled={loading}
                    className="bg-white/5 border-white/10 text-white
focus:ring-2 focus:ring-purple-500/30
focus:border-purple-400/40
transition-all duration-200
hover:bg-white/[0.08]"
                  />
                </div>

                <motion.div whileTap={{ scale: 0.97 }}>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="w-full transition-all duration-200 hover:scale-[1.02]"
                  >
                    {" "}
                    {loading ? "Updating..." : "Change Password"}
                  </Button>
                </motion.div>
              </form>
            </Card>
          </motion.div>
          {/* ACCOUNT ACTION */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="p-8 bg-red-500/10 border border-red-500/20 backdrop-blur-xl rounded-2xl shadow-lg">
              {" "}
              <h2 className="text-2xl font-bold text-red-400 mb-6">
                Account Actions
              </h2>
              <div className="h-px bg-white/10 mb-6"></div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                className="w-full gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </Card>
          </motion.div>
        </motion.div>
      </main>
    </ProtectedRoute>
  );
}
