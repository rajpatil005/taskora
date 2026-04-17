"use client";

import { motion } from "framer-motion";
import Header from "@/components/Header";
import { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import Link from "next/link";
import { getLenis } from "@/lib/lenis";
import { ArrowLeft, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

const sections = [
  {
    id: "help",
    title: "Help Center",
    desc: "Everything you need to get started and solve issues quickly.",
    body: "Browse tasks, post work, manage your wallet, track earnings, and monitor your activity easily in one place. If you face any issue, our support system is available 24/7. You can also find step-by-step guides, tutorials, and troubleshooting tips to help you get started faster and use all features without confusion.",
  },
  {
    id: "contact",
    title: "Contact Us",
    desc: "We’re always here to help you.",
    body: "Reach us anytime at support@taskora.com or use the in-app support chat for instant assistance. Our team actively responds during working hours and tries to resolve all queries as quickly as possible. For urgent issues, please include screenshots and detailed descriptions so we can help you faster and more accurately.",
  },
  {
    id: "faq",
    title: "Frequently Asked Questions",
    desc: "Quick answers to common questions.",
    body: "• How do I earn?\nYou can earn by completing nearby tasks posted by users or businesses in your area.\n\n• How do payments work?\nPayments are securely processed and stored in your wallet after task verification.\n\n• Is Taskora safe?\nYes, we use secure systems, verification, and user ratings to ensure trust and safety across the platform.\n\n• Can I withdraw anytime?\nYes, withdrawals are available based on platform rules and instant payout options where supported.",
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    desc: "Your data security matters.",
    body: "We do not sell or share user data with third parties. All information is encrypted using industry-standard security protocols and stored securely. We only collect necessary data required for platform functionality, and users have full control over their account information, privacy settings, and visibility preferences.",
  },
  {
    id: "terms",
    title: "Terms & Conditions",
    desc: "Rules for using Taskora.",
    body: "By using Taskora, you agree to follow fair usage policies, community guidelines, and legal requirements. Misuse of the platform, fraudulent activity, or harmful behavior may result in account suspension. Users are responsible for maintaining accurate information and ensuring safe interactions while using the platform.",
  },
  {
    id: "safety",
    title: "Safety Guidelines",
    desc: "Stay safe while using the platform.",
    body: "Always verify task details before accepting work and avoid any off-platform payments or communication. Report suspicious activity immediately using the support system. Keep personal information private and ensure all interactions remain within platform guidelines for your safety and security.",
  },
];

export default function InfoPage() {
  const [active, setActive] = useState("help");
  const router = useRouter();

  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  /* ---------- detect active section ---------- */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { threshold: 0.6 },
    );

    sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  /* ---------- scroll to section  ---------- */
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    const lenis = getLenis();

    if (!el) return;

    if (lenis) {
      lenis.scrollTo(el, {
        duration: 1.2,
        easing: (t: number) => 1 - Math.pow(1 - t, 3),
      });
    } else {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  /* ---------- smooth scroll ---------- */
  const scrollToTop = () => {
    const lenis = getLenis();

    lenis?.scrollTo(0, {
      duration: 1.6,
      easing: (t: number) => 1 - Math.pow(1 - t, 3),
    });
  };

  return (
    <main className="min-h-screen text-white relative z-10">
      {/* ✅ HEADER */}
      <Header title="About" />

      {/* SIDE NAV */}
      <div className="hidden md:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-3 z-40">
        {sections.map((s) => (
          <button
            key={s.id}
            onClick={() => scrollToSection(s.id)}
            className={`text-xs transition ${
              active === s.id ? "text-white" : "text-gray-500 hover:text-white"
            }`}
          >
            {s.title}
          </button>
        ))}
      </div>
      {/* CONTENT */}
      <div className="relative z-10">
        {sections.map((section, idx) => (
          <section
            key={section.id}
            id={section.id}
            className="min-h-screen md:h-screen flex flex-col md:flex-row items-center md:items-center justify-center md:justify-center px-4 md:px-6 py-10 md:py-0"
          >
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.6 }}
              className="w-[92%] sm:w-[60%] md:w-full max-w-xl md:max-w-3xl mx-auto"
            >
              {/* CARD */}
              <div className="card relative overflow-hidden h-[50vh] p-10 md:p-15 flex flex-col justify-center">
                {" "}
                <div>
                  <h2 className="text-2xl md:text-4xl font-bold text-gradient">
                    {section.title}
                  </h2>

                  <p className="text-gray-400 mt-2">{section.desc}</p>
                </div>
                <div
                  className={`px-4 md:px-10 ${
                    section.id === "faq"
                      ? "overflow-y-auto max-h-[45vh] md:max-h-[40vh]"
                      : "flex-1 flex items-center"
                  }`}
                >
                  <p className="text-gray-300 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {section.body}
                  </p>
                </div>
                {/* BACK TO TOP (SMOOTH + PREMIUM) */}
                <div className="pt-4">
                  <button
                    onClick={scrollToTop}
                    className="text-sm text-purple-400 hover:text-purple-300 transition"
                  >
                    Back to top ↑
                  </button>
                </div>
                {/* glow shine effect */}
                <div className="shine" />
              </div>
            </motion.div>
          </section>
        ))}
      </div>
    </main>
  );
}
