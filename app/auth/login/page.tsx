"use client";

import { useState } from "react";
import Link from "next/link";
import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Blobs } from "@/components/ui/blobs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/authContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(email, password);

      toast({
        title: "Login Successful",
        description: "Redirecting...",
      });

      router.push("/dashboard");
    } catch (err: any) {
      toast({
        title: "Login Failed",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen relative flex items-center justify-center text-white px-4 overflow-hidden">
      {" "}
      {/* Background Blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <Blobs />
      </div>
      {/* Login Card */}
      <Card className="max-w-md w-full text-white p-12">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-6 text-gradient text-center">
          Welcome Back
        </h1>
        {/* Google login */}
        <div className="mb-4 flex justify-center">
          <GoogleLogin
            onSuccess={async (credentialResponse) => {
              try {
                const res = await fetch(
                  `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      credential: credentialResponse.credential,
                    }),
                  },
                );

                const data = await res.json();

                if (!res.ok) throw new Error(data.message);

                localStorage.setItem("taskora_token", data.token);

                toast({
                  title: "Google Login Successful",
                  description: "Redirecting...",
                });
                localStorage.setItem("taskora_token", data.token);

                toast({
                  title: "Google Login Successful",
                  description: "Redirecting...",
                });

                // ✅ let AuthContext re-fetch user properly
                window.location.href = "/dashboard";
              } catch (err: any) {
                toast({
                  title: "Google Login Failed",
                  description: err.message,
                  variant: "destructive",
                });
              }
            }}
            onError={() => {
              toast({
                title: "Google Login Failed",
                description: "Try again",
                variant: "destructive",
              });
            }}
          />
        </div>
        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1 bg-white/10" />
          <p className="text-xs text-white/40">OR</p>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        {/* Email login */}
        <p className="text-gray-400 mb-8 text-center">
          Sign in to continue to your dashboard
        </p>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
          {/* Email */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-300">
              Password
            </label>
            <Input
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="mt-2"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-gray-400 text-sm">
          Don't have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-purple-400 underline hover:text-purple-300"
          >
            Create Account
          </Link>
        </div>
      </Card>
    </main>
  );
}
