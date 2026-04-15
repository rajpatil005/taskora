"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
  ) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // 🔥 Initialize auth on mount (FIXED)
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem("taskora_token");

      if (!storedToken) {
        setLoading(false);
        return;
      }

      setToken(storedToken);

      try {
        const response = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        // ✅ Token is valid
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
        }

        // 🔥 Token invalid → remove
        else if (response.status === 401) {
          localStorage.removeItem("taskora_token");
          setToken(null);
          setUser(null);
        }

        // ⚠️ Other errors → DON'T logout
        else {
          console.warn("Auth check failed but not logging out");
        }
      } catch (err) {
        // 🔥 IMPORTANT: network error → DO NOT logout
        console.error("Auth fetch failed (network issue):", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [API_URL]);

  // 🔥 LOGIN
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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔥 REGISTER
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Registration failed";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // 🔥 LOGOUT (FIXED)
  const logout = () => {
    setUser(null);
    setToken(null); // ✅ IMPORTANT
    setError(null);
    localStorage.removeItem("taskora_token");
  };

  // 🔥 UPDATE USER
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
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// 🔥 HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
