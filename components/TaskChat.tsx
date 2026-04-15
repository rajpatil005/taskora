"use client";

import { io } from "socket.io-client";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  _id: string;
  text: string;
  sender: {
    _id: any;
    name: string;
    profilePhoto?: string;
  };
  receiver: {
    _id: any;
    name: string;
    profilePhoto?: string;
  };
  createdAt: string;
}

export const TaskChat = ({ taskId }: { taskId: string }) => {
  const { token, user } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const socketRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const normalize = (id: any) => {
    if (!id) return "";

    if (typeof id === "object") {
      if (id._id) return String(id._id);
    }

    return String(id);
  };

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    try {
      const res = await fetch(`${API_URL}/api/messages/task/${taskId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error(err);
    }
  };

  // 🔥 SOCKET + INITIAL LOAD
  useEffect(() => {
    fetchMessages();

    socketRef.current = io(API_URL, {
      transports: ["websocket"],
    });

    socketRef.current.emit("joinTask", taskId);

    socketRef.current.on("newMessage", (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [taskId]);

  useEffect(() => {
    scrollBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;

    const msg = text;
    setText("");
    setSending(true);

    try {
      await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: taskId,
          text: msg,
        }),
      });

      // ❌ DO NOT setMessages here (socket will handle)
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="flex flex-col h-[600px] border rounded-2xl bg-white shadow-xl overflow-hidden">
      <div className="px-5 py-4 border-b font-semibold text-lg bg-gray-100">
        Task Chat
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2 bg-gray-50">
        {messages.map((msg, i) => {
          const myId = normalize(user?._id || user?.id);
          const senderId = normalize(msg.sender?._id);
          const isMine = myId === senderId;

          const prevMsg = messages[i - 1];
          const showAvatar =
            !prevMsg || normalize(prevMsg.sender?._id) !== senderId;

          return (
            <div
              key={msg._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div className="flex items-end gap-2 max-w-[75%]">
                {!isMine && showAvatar && (
                  <img
                    src={
                      msg.sender?.profilePhoto ||
                      `https://ui-avatars.com/api/?name=${msg.sender?.name}`
                    }
                    className="w-8 h-8 rounded-full"
                  />
                )}

                {!isMine && !showAvatar && <div className="w-8" />}

                <div
                  className={`px-4 py-2 rounded-2xl text-sm shadow-sm
                  ${
                    isMine
                      ? "bg-blue-500 text-white rounded-br-md"
                      : "bg-white border rounded-bl-md"
                  }`}
                >
                  {!isMine && showAvatar && (
                    <p className="text-xs font-semibold mb-1 text-gray-600">
                      {msg.sender?.name}
                    </p>
                  )}

                  <p>{msg.text}</p>

                  <p
                    className={`text-[10px] mt-1 text-right
                    ${isMine ? "text-blue-100" : "text-gray-400"}`}
                  >
                    {formatTime(msg.createdAt)}
                  </p>
                </div>

                {isMine && showAvatar && (
                  <img
                    src={
                      user?.profilePhoto ||
                      `https://ui-avatars.com/api/?name=${user?.name}`
                    }
                    className="w-8 h-8 rounded-full"
                  />
                )}

                {isMine && !showAvatar && <div className="w-8" />}
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className="border-t p-3 flex gap-2 bg-white">
        <Input
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        />

        <Button onClick={sendMessage} disabled={sending}>
          {sending ? "..." : "Send"}
        </Button>
      </div>
    </div>
  );
};
