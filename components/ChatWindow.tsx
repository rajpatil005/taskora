"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/authContext";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAvatarUrl } from "@/lib/avatar";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  Trash2,
  Copy,
  Reply,
  X,
} from "lucide-react";
import Link from "next/link";
import { io } from "socket.io-client";

interface Message {
  _id: string;
  text: string;
  createdAt: string;
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

export default function ChatWindow({ taskId }: { taskId: string }) {
  const { user, token } = useAuth();

  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [menuMsg, setMenuMsg] = useState<string | null>(null);
  const [showTopMenu, setShowTopMenu] = useState(false);

  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);

  const socketRef = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const chatUser = (() => {
    const msg = messages.find(
      (m) => m.sender._id !== user?._id || m.receiver._id !== user?._id,
    );

    if (!msg) return null;

    return msg.sender._id !== user?._id ? msg.sender : msg.receiver;
  })();

  const normalize = (id: any) => {
    if (!id) return "";
    if (typeof id === "object") return String(id._id);
    return String(id);
  };

  const scrollBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchMessages = async () => {
    if (!token) return;

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

  useEffect(() => {
    if (!taskId || !token) return;

    fetchMessages();

    socketRef.current = io(API_URL, {
      auth: { token },
    });

    socketRef.current.emit("joinTask", taskId);

    socketRef.current.on("newMessage", (msg: Message) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    });

    return () => socketRef.current.disconnect();
  }, [taskId, token]);

  useEffect(() => scrollBottom(), [messages]);

  const sendMessage = async () => {
    if (!text.trim() || sending) return;

    const msg = text;
    setText("");
    setSending(true);

    try {
      const res = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          task: taskId,
          text: msg,
          replyTo: replyTo?._id,
        }),
      });

      if (!res.ok) throw new Error("Failed");

      setReplyTo(null);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const deleteMessage = async (id: string, type: "me" | "all") => {
    await fetch(`${API_URL}/api/messages/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify({ type }),
    });

    setMessages((prev) => prev.filter((m) => m._id !== id));
  };

  const copyMessage = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const deleteSelected = async () => {
    for (let id of selected) {
      await deleteMessage(id, "me");
    }
    setSelected([]);
    setSelectMode(false);
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="h-full min-h-0 flex flex-col">
      {" "}
      <Card className="chat-container flex flex-col h-full w-full p-0 rounded-2xl overflow-hidden border border-white/10 bg-white/[0.04] backdrop-blur-md shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
        {" "}
        <header>
          <div className="flex items-center justify-between px-5 py-5 border-b border-white/10 bg-black/40 backdrop-blur-xl">
            {" "}
            <div className="flex items-center gap-3">
              <img
                src={getAvatarUrl(chatUser)}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border border-white/20"
              />

              <div className="flex flex-col">
                <h2 className="text-lg font-semibold leading-tight">
                  {chatUser?.name || "Loading..."}
                </h2>

                <p className="text-xs text-white/50">Online</p>
              </div>
            </div>
            {/* TOP MENU */}
            <div className="relative">
              <MoreVertical
                className="cursor-pointer"
                onClick={() => setShowTopMenu(!showTopMenu)}
              />

              {showTopMenu && (
                <div className="absolute right-0 mt-2 w-40 bg-black border border-white/10 rounded-lg shadow-lg z-50">
                  {" "}
                  <p
                    className="cursor-pointer p-1 hover:bg-white/10"
                    onClick={() => {
                      setSelectMode(true);
                      setShowTopMenu(false);
                    }}
                  >
                    Select Messages
                  </p>
                  <p
                    className="cursor-pointer p-1 hover:bg-white/10"
                    onClick={deleteSelected}
                  >
                    Delete Selected
                  </p>
                </div>
              )}
            </div>
          </div>
        </header>
        {/* MESSAGES */}
        <div className="flex-1 min-h-0 overflow-y-auto px-6 pt-2 mt-2 pb-2 space-y-4 chat-scroll">
          {" "}
          {messages.map((msg) => {
            const currentUserId =
              user?._id || user?.id || localStorage.getItem("userId");

            const isMine =
              normalize(msg.sender?._id || msg.sender) ===
              normalize(currentUserId);

            return (
              <div
                key={msg._id}
                className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                style={{ animationDelay: "0.05s" }}
                onClick={() => selectMode && toggleSelect(msg._id)}
              >
                <div
                  className={`message-wrapper max-w-[75%] group ${
                    selected.includes(msg._id) ? "message-selected" : ""
                  }`}
                >
                  {selected.includes(msg._id) && (
                    <div className="message-check">✓</div>
                  )}
                  <div
                    className={`chat-bubble ${
                      isMine ? "mine" : "other"
                    } ${isMine ? "reply-right" : "reply-left"}`}
                    onClick={() => setMenuMsg(msg._id)}
                  >
                    <p className="text-lg leading-relaxed">{msg.text}</p>

                    <p className="chat-time">{formatTime(msg.createdAt)}</p>
                  </div>
                  {/* MESSAGE MENU */}
                  {menuMsg === msg._id && (
                    <div className="message-menu">
                      {" "}
                      <p onClick={() => copyMessage(msg.text)}>
                        <Copy className="inline w-3 h-3" /> Copy
                      </p>
                      <p onClick={() => setReplyTo(msg)}>
                        <Reply className="inline w-3 h-3" /> Reply
                      </p>
                      {isMine ? (
                        <>
                          <p onClick={() => deleteMessage(msg._id, "me")}>
                            Delete for me
                          </p>
                          <p onClick={() => deleteMessage(msg._id, "all")}>
                            Unsend
                          </p>
                        </>
                      ) : (
                        <p onClick={() => deleteMessage(msg._id, "me")}>
                          Delete for me
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        {/* INPUT */}
        <div className="border-t border-white/10 px-4 py-2 bg-black/40 backdrop-blur-xl">
          {" "}
          {replyTo && (
            <div className="reply-box mb-2 text-xs w-full flex items-center gap-2">
              <span className="reply-text flex-1">{replyTo.text}</span>
              <X
                className="flex-shrink-0 cursor-pointer opacity-70 hover:opacity-100"
                onClick={() => setReplyTo(null)}
              />
            </div>
          )}
          <div className="flex gap-2 items-center chat-input py-3">
            {" "}
            <Input
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1 h-11 rounded-xl bg-white/5 border-white/10 focus:ring-1 focus:ring-white/20 px-3 py-0"
            />
            <Button
              onClick={sendMessage}
              disabled={sending}
              className="chat-send-btn h-11 w-11 flex items-center justify-center rounded-xl"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
