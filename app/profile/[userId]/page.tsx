"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useAuth } from "@/lib/authContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { Star, MapPin, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { getAvatarUrl } from "@/lib/avatar";

interface UserProfile {
  _id: string;
  name: string;
  profilePhoto?: string;
  rating: number;
  completedTasks: number;
  verificationStatus: "verified" | "unverified" | "rejected";
  location?: {
    address: string;
  };
}

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    name: string;
    profilePhoto?: string;
  };
  createdAt: string;
}

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const params = useParams();
  const userId = params.userId;
  const router = useRouter();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (!userId) return; // 🚨 prevents fetch if userId undefined

    const fetchProfile = async () => {
      try {
        const [profileRes, reviewsRes] = await Promise.all([
          fetch(`${API_URL}/api/users/${userId}`),
          fetch(`${API_URL}/api/reviews/user/${userId}`),
        ]);

        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setProfile(profileData.user);
        }

        if (reviewsRes.ok) {
          const reviewsData = await reviewsRes.json();
          setReviews(reviewsData.reviews);
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, API_URL, toast]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-3">
          <Spinner />
          <p className="text-white/50 text-sm">Loading profile...</p>
        </div>{" "}
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen flex items-center justify-center text-white">
        User not found
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-transparent text-white">
      {/* HEADER */}
      <Header title="Profile" />

      <div className="container mx-auto px-4 py-10 max-w-3xl space-y-8">
        {/* PROFILE CARD */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8 bg-white/5 border border-white/10 backdrop-blur-xl shadow-[0_0_60px_rgba(139,92,246,0.2)]">
            {" "}
            <div className="flex flex-col md:flex-row gap-8 mb-6 pb-6 border-b border-white/10">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-full bg-white/10 flex items-center justify-center text-4xl font-bold">
                <img
                  src={getAvatarUrl(profile)}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-purple-400 "
                />
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h1 className="text-3xl font-bold">{profile.name}</h1>
                  {profile.verificationStatus === "verified" && (
                    <CheckCircle2 className="w-6 h-6 text-green-400" />
                  )}
                </div>

                {/* Rating */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${
                          i < Math.round(profile.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-white/20"
                        }`}
                      />
                    ))}
                  </div>

                  <span className="font-semibold text-yellow-400">
                    {" "}
                    {profile.rating.toFixed(1)}
                  </span>

                  <span className="text-white/30">·</span>

                  <span className="text-white/60">
                    {profile.completedTasks} tasks
                  </span>
                </div>

                {profile.location && (
                  <div className="flex items-center gap-2 text-white/60">
                    <MapPin className="w-4 h-4" />
                    {profile.location.address}
                  </div>
                )}
              </div>

              {/* Action: Message & Settings */}
              <div className="flex gap-2 mt-4">
                {/* Message button if viewing other users */}
                {currentUser?._id !== profile._id && (
                  <Link href={`/chat/profile/${profile._id}`}>
                    <Button>Message</Button>
                  </Link>
                )}

                {/* Settings and wallet button */}
                {currentUser?._id === profile._id && (
                  <>
                    <Link href="/wallet">
                      <Button className="bg-purple-600 hover:bg-purple-700 shadow-md shadow-purple-500/30">
                        Wallet
                      </Button>
                    </Link>

                    <Link href="/profile/settings">
                      <Button
                        variant="outline"
                        className="px-4 py-2 text-sm font-medium border-white/20 text-white hover:bg-white/10"
                      >
                        Settings
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-extrabold text-purple-400">
                  {profile.completedTasks}
                </p>
                <p className="text-sm text-white/60">Tasks</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {profile.rating.toFixed(1)}
                </p>
                <p className="text-sm text-white/60">Rating</p>
              </div>

              <div>
                <p className="text-2xl font-bold text-purple-400">
                  {profile.verificationStatus === "verified" ? "Yes" : "No"}
                </p>
                <p className="text-sm text-white/60">Verified</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* REVIEWS */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center bg-white/5 border-white/10">
              <p className="text-white/60">
                No reviews yet. Complete tasks to build trust!
              </p>
            </Card>
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: { transition: { staggerChildren: 0.08 } },
              }}
              className="space-y-4"
            >
              <div className="space-y-4">
                {reviews.map((review) => (
                  <motion.div
                    key={review._id}
                    variants={{
                      hidden: { opacity: 0, y: 20 },
                      show: { opacity: 1, y: 0 },
                    }}
                  >
                    <Card className="p-6 bg-white/5 border border-white/10 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(139,92,246,0.2)]">
                      <div className="flex gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          {review.reviewer.profilePhoto ? (
                            <img
                              src={review.reviewer.profilePhoto}
                              alt={review.reviewer.name}
                              className="w-10 h-10 rounded-full object-cover border border-white/10"
                            />
                          ) : (
                            review.reviewer.name.charAt(0)
                          )}
                        </div>

                        <div className="flex-1">
                          <p className="font-semibold">
                            {review.reviewer.name}
                          </p>

                          <div className="flex gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${
                                  i < review.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-white/20"
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <span className="text-xs text-white/40">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      {review.comment && (
                        <p className="text-white/60">{review.comment}</p>
                      )}
                    </Card>
                  </motion.div>
                ))}
              </div>{" "}
            </motion.div>
          )}
        </div>
      </div>
    </main>
  );
}
