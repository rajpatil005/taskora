"use client";

import { useParams } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const { taskId } = useParams();

  return (
    <ProtectedRoute>
      <div className="fixed inset-0 overflow-hidden py-20 px-3 bg-transparent text-white flex flex-col">
        {" "}
        <ChatWindow taskId={taskId as string} />
      </div>
    </ProtectedRoute>
  );
}
