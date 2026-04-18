"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { getSocket } from "@/lib/socket";

interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  rating: number;
  completedTasks: number;
  verificationStatus: string;
  wallet?: {
    balance: number;
    lockedEscrow: number;
  };
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // ✅ ADD THIS
  loading: boolean;
  error: string | null;
  token: string | null;
  socket: any;
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;

  unreadNotifications: number;
  setUnreadNotifications: React.Dispatch<React.SetStateAction<number>>;

  unreadMessages: number;
  setUnreadMessages: React.Dispatch<React.SetStateAction<number>>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [socket, setSocket] = useState(null);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  if (!API_URL) {
    console.error("API_URL is missing in environment variables");
  }

  // Initialize auth on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("taskora_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      const s = getSocket(storedToken);
      setSocket(s);

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        } else if (response.status === 401) {
          localStorage.removeItem("taskora_token");
          setToken(null);
          setUser(null);
        } else {
          console.warn("Auth check failed but not logging out");
        }
      } catch (err) {
        console.error("Auth fetch failed (network issue):", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [API_URL]);

  // LOGIN
  const login = async (email: string, password: string) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("taskora_token", data.token);

      const s = getSocket(data.token);
      setSocket(s);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // REGISTER
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => {
    setError(null);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem("taskora_token", data.token);

      const s = getSocket(data.token);
      setSocket(s);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadMessages = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUnreadMessages(data.count);
    } catch (err) {
      console.log("Failed to fetch unread messages");
    }
  };

  const fetchUnreadNotifications = async (token: string) => {
    try {
      const res = await fetch(`${API_URL}/api/notifications`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      const unread = data.filter((n: any) => !n.isRead).length;
      setUnreadNotifications(unread);
    } catch (err) {
      console.log("Failed to fetch unread notifications");
    }
  };

  useEffect(() => {
    if (!token || !socket) return;

    const handleMessage = (data: any) => {
      const currentPath = window.location.pathname;

      if (currentPath.startsWith("/chat")) return;

      setUnreadMessages((prev) => prev + 1);
    };

    socket.on("messageNotification", handleMessage);

    return () => {
      socket.off("messageNotification", handleMessage);
    };
  }, [token, socket]);

  useEffect(() => {
    if (token) {
      fetchUnreadNotifications(token);
      fetchUnreadMessages(token);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;

    if (!socket) return;

    const handleNotification = (data: any) => {
      if (data.type !== "message") {
        setUnreadNotifications((prev) => prev + 1);
      }
    };

    socket.on("notification", handleNotification);

    return () => {
      socket.off("notification", handleNotification);
    };
  }, [token]);
  // LOGOUT (FIXED)
  const logout = () => {
    if (socket) {
      socket.disconnect(); // ✅ IMPORTANT
    }

    setUser(null);
    setToken(null);
    setError(null);
    localStorage.removeItem("taskora_token");
  };

  // UPDATE USER
  const updateUser = (userData: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...userData });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        error,
        token,
        socket,
        login,
        register,
        logout,
        updateUser,
        unreadNotifications,
        setUnreadNotifications,
        unreadMessages,
        setUnreadMessages,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
