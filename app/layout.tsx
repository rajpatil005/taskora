import { Navbar } from "@/components/Navbar";
import type { Metadata } from "next";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { AuthProvider } from "@/lib/authContext";
import { Toaster } from "@/components/ui/toaster";
import SmoothScroll from "./providers/SmoothScroll";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Taskora - Local Task Marketplace",
  description:
    "Connect with your community. Post tasks or complete nearby tasks and earn money instantly",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <GoogleOAuthProvider
          clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}
        >
          <AuthProvider>
            <SmoothScroll>
              <Navbar />

              <main className="pb-20 md:pb-0">{children}</main>

              <Toaster />
            </SmoothScroll>
          </AuthProvider>
        </GoogleOAuthProvider>

        <Analytics />
      </body>
    </html>
  );
}
