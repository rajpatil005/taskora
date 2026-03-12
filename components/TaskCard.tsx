'use client';

import { MapPin, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

interface TaskCardProps {
  id: string;
  title: string;
  description: string;
  rewardAmount: number;
  distance: number;
  category: string;
  owner: {
    name: string;
    rating: number;
    profilePhoto?: string;
  };
  createdAt: string;
  onAccept?: () => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  rewardAmount,
  distance,
  category,
  owner,
  createdAt,
  onAccept
}) => {
  const getTimeAgo = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffMs = now.getTime() - posted.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="p-6 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link href={`/tasks/${id}`}>
            <h3 className="text-lg font-semibold text-foreground hover:text-primary cursor-pointer">
              {title}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{description}</p>
        </div>
        <div className="text-right ml-4">
          <div className="text-2xl font-bold text-primary">₹{rewardAmount}</div>
          <div className="text-xs text-muted-foreground">{category}</div>
        </div>
      </div>

      <div className="space-y-2 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          <span>{distance.toFixed(1)} km away</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>{getTimeAgo(createdAt)}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-border mb-4">
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
          {owner.profilePhoto ? (
            <img
              src={owner.profilePhoto}
              alt={owner.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="text-xs font-semibold">{owner.name.charAt(0)}</div>
          )}
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium text-foreground">{owner.name}</div>
          <div className="flex items-center gap-1 text-xs">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-muted-foreground">{owner.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      <Button
        onClick={onAccept}
        className="w-full"
      >
        Accept Task
      </Button>
    </Card>
  );
};
