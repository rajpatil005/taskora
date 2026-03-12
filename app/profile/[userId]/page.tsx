'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/authContext';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner';
import { Star, MapPin, CheckCircle2 } from 'lucide-react';

interface UserProfile {
  id: string;
  name: string;
  profilePhoto?: string;
  rating: number;
  completedTasks: number;
  verificationStatus: 'verified' | 'unverified' | 'rejected';
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

export default function ProfilePage({
  params
}: {
  params: { userId: string };
}) {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profileRes = await fetch(`${API_URL}/api/users/${params.userId}`);
        const reviewsRes = await fetch(`${API_URL}/api/reviews/user/${params.userId}`);

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
          title: 'Error',
          description: 'Failed to load profile',
          variant: 'destructive'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params.userId, API_URL, toast]);

  if (loading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">User not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Profile Header */}
        <Card className="p-8 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-8 mb-6 pb-6 border-b border-border">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-4xl font-bold flex-shrink-0">
              {profile.profilePhoto ? (
                <img
                  src={profile.profilePhoto}
                  alt={profile.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                profile.name.charAt(0)
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-foreground">{profile.name}</h1>
                {profile.verificationStatus === 'verified' && (
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                )}
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.round(profile.rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="font-semibold text-foreground">{profile.rating.toFixed(1)}</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{profile.completedTasks} tasks completed</span>
              </div>

              {profile.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location.address}</span>
                </div>
              )}
            </div>

            {/* Action Button */}
            {currentUser?.id !== profile.id && (
              <Link href={`/chat/profile/${profile.id}`}>
                <Button>Message</Button>
              </Link>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile.completedTasks}</p>
              <p className="text-sm text-muted-foreground">Tasks Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{profile.rating.toFixed(1)}</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {profile.verificationStatus === 'verified' ? 'Yes' : 'No'}
              </p>
              <p className="text-sm text-muted-foreground">Verified</p>
            </div>
          </div>
        </Card>

        {/* Reviews */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Reviews ({reviews.length})
          </h2>

          {reviews.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No reviews yet</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <Card key={review._id} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      {review.reviewer.profilePhoto ? (
                        <img
                          src={review.reviewer.profilePhoto}
                          alt={review.reviewer.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold">
                          {review.reviewer.name.charAt(0)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{review.reviewer.name}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-muted-foreground">{review.comment}</p>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
