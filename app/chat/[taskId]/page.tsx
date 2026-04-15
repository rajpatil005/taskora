"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const { taskId } = useParams();

  return (
    <ProtectedRoute>
      <main className="min-h-screen text-white p-7 flex flex-col bg-transparent">
        <ChatWindow taskId={taskId as string} />
      </main>
    </ProtectedRoute>
  );
}
