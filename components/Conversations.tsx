"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Conversation {
  _id: string;
  text: string;
  createdAt: string;
  task: {
    _id: string;
    title: string;
  };
  sender: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
  receiver: {
    _id: string;
    name: string;
    profilePhoto?: string;
  };
}

export default function Conversations() {
  const router = useRouter();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem("taskora_token");

      if (!token) {
        console.log("❌ No token in localStorage");
        setLoading(false);
        return;
      }

      console.log("✅ Token found:", token);

      const res = await fetch(`${API_URL}/api/messages/conversations`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("📦 Conversations:", data);

      setConversations(data.conversations || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const formatTime = (date: string) => {
    return new Date(date).toLocaleString();
  };

  const getOtherUser = (conv: Conversation) => {
    const tokenUser = JSON.parse(
      localStorage.getItem("taskora_user") || "null",
    );

    if (!tokenUser) return conv.sender;

    return conv.sender._id === tokenUser._id ? conv.receiver : conv.sender;
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading conversations...
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white shadow rounded-xl">
      <div className="p-4 border-b font-semibold text-lg">Messages</div>

      {conversations.length === 0 ? (
        <div className="p-6 text-center text-gray-500">
          No conversations yet
        </div>
      ) : (
        conversations.map((conv) => {
          const otherUser = getOtherUser(conv);

          return (
            <div
              key={conv._id}
              onClick={() => router.push(`/chat/${conv.task._id}`)}
              className="flex items-center gap-3 p-4 border-b cursor-pointer hover:bg-gray-50"
            >
              <img
                src={
                  otherUser.profilePhoto ||
                  `https://ui-avatars.com/api/?name=${otherUser.name}`
                }
                className="w-10 h-10 rounded-full"
              />

              <div className="flex-1">
                <p className="font-medium">{otherUser.name}</p>
                <p className="text-sm text-gray-500 truncate">{conv.text}</p>
              </div>

              <div className="text-xs text-gray-400">
                {formatTime(conv.createdAt)}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
