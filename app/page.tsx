"use client";

import { getLenis } from "@/lib/lenis";
import Link from "next/link";
import { useGLTF, Environment } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useAuth } from "@/lib/authContext";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  MapPin,
  Zap,
  ArrowRight,
  Linkedin,
  Twitter,
} from "lucide-react";

import { containerVariants, itemVariants } from "@/lib/animations";

useGLTF.preload("/models/magnifying_glass.glb");
useGLTF.preload("/models/check_mark.glb");
useGLTF.preload("/models/chat_bubble.glb");
useGLTF.preload("/models/trophy.glb");

export function Model3D({
  url,
  scale = 1,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}) {
  const gltf = useGLTF(url);

  useEffect(() => {
    gltf.scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.envMapIntensity = 0.15;
        child.material.metalness = 0.0;
        child.material.roughness = 1.0;
      }
    });
  }, [gltf]);

  return (
    <primitive
      object={gltf.scene.clone()} // IMPORTANT: avoid shared mutation issues
      scale={scale}
      position={position}
      rotation={rotation}
      castShadow
      receiveShadow
    />
  );
}

function RotatingModel({
  scrollYProgress,
  start,
  end,
  position,
  url,
  baseScale = 1,
  maxScale = 1,
  fixed = false,
  rotationAxis = [0, 1, 0],
  initialRotation = [0, 0, 0],
  floatIntensity = 0.4,
}) {
  const ref = useRef();

  useFrame(() => {
    if (!ref.current) return;

    const progress = scrollYProgress.get();
    let local = (progress - start) / (end - start);
    local = Math.max(0, Math.min(1, local));

    if (local <= 0) {
      ref.current.scale.setScalar(0.0001); // 👈 avoids full disappearance bug
      return;
    }

    if (local >= 1) {
      // stay fully visible + front-facing AFTER its step
      ref.current.rotation.y = 0;
      ref.current.rotation.x = 0;
      ref.current.scale.setScalar(baseScale);
      return;
    }

    // ✅ rotation stays scroll-based
    const angle = -Math.PI / 4 - local * (Math.PI / 2);

    ref.current.rotation.x = initialRotation[0] + rotationAxis[0] * angle;
    ref.current.rotation.y = initialRotation[1] + rotationAxis[1] * angle;
    ref.current.rotation.z = initialRotation[2] + rotationAxis[2] * angle;

    // ✅ CONDITION
    if (fixed) {
      ref.current.scale.setScalar(baseScale); // 👈 constant size
    } else {
      const eased = Math.pow(local, 1.5); // smoother slow start
      const scale = eased * maxScale * baseScale;
      ref.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={ref} position={position}>
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={floatIntensity}
      >
        {" "}
        <Model3D url={url} scale={1} />
      </Float>
    </group>
  );
}

export default function HomePage() {
  const { user, loading } = useAuth();
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const x = useTransform(() => pos.x * 0.01);
  const y = useTransform(() => pos.y * 0.01);
  const yBg = useTransform(scrollYProgress, [0, 1], [0, -200]);

  const step1 = useTransform(scrollYProgress, [0, 0.1], [0, 1]);
  const step2 = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const step3 = useTransform(scrollYProgress, [0.5, 0.75], [0, 1]);
  const step4 = useTransform(scrollYProgress, [0.75, 1], [0, 1]);

  const showTopBtn = useTransform(scrollYProgress, [0, 0.25], [0, 0]);
  const btnOpacity = useTransform(scrollYProgress, [0.25, 0.35, 1], [0, 1, 1]);

  const [isTopBlur, setIsTopBlur] = useState(false);
  const [isScrollingFast, setIsScrollingFast] = useState(false);

  return (
    <main ref={containerRef} className="relative overflow-hidden">
      {" "}
      {/* ================= BACKGROUND ================= */}
      <div className="absolute inset-0 z-0">
        {/* ===== FULL PAGE STORY LINE ===== */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none flex justify-center">
          {/* ================= FULL STORY LINE ================= */}
          <svg
            width="600"
            height="100%"
            viewBox="0 0 600 6000"
            opacity={0.65}
            preserveAspectRatio="xMidYMin meet"
          >
            <defs>
              {/* MAIN GRADIENT */}
              <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="35%" stopColor="#06b6d4" />
                <stop offset="65%" stopColor="#22c55e" />
                <stop offset="100%" stopColor="#facc15" />
              </linearGradient>

              {/* SOFT GLOW FILTER */}
              <filter id="softGlow">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* ================= BACK GLOW (VERY SOFT) ================= */}
            <motion.path
              d="M300 1200
      C100 1500, 500 2000, 300 2500
      S100 3000, 300 3500
      S500 4500, 300 5000"
              stroke="url(#grad)"
              strokeWidth="14"
              fill="transparent"
              opacity={0.12}
              filter="url(#softGlow)"
              style={{
                pathLength: scrollYProgress,
              }}
            />

            {/* ================= MAIN LINE ================= */}
            <motion.path
              d="M300 1200
      C100 1500, 500 2000, 300 2500
      S100 3000, 300 3500
      S500 4500, 300 5000"
              stroke="url(#grad)"
              strokeWidth="4"
              fill="transparent"
              strokeLinecap="round"
              style={{
                pathLength: scrollYProgress,
              }}
            />

            {/* ================= SUB GLOW (TIGHTER, BRIGHTER) ================= */}
            <motion.path
              d="M300 1200
      C100 1500, 500 2000, 300 2500
      S100 3000, 300 3500
      S500 4500, 300 5000"
              stroke="url(#grad)"
              strokeWidth="8"
              fill="transparent"
              opacity={0.18}
              filter="url(#softGlow)"
              style={{
                pathLength: scrollYProgress,
              }}
            />

            {/* ================= DOTS (unchanged but better pop) ================= */}
            <motion.circle
              cx="300"
              cy="1200"
              r="6"
              fill="#8b5cf6"
              style={{ scale: step1 }}
            />
            <motion.circle
              cx="300"
              cy="2500"
              r="6"
              fill="#3b82f6"
              style={{ scale: step2 }}
            />
            <motion.circle
              cx="300"
              cy="3500"
              r="6"
              fill="#22c55e"
              style={{ scale: step3 }}
            />
            <motion.circle
              cx="300"
              cy="5000"
              r="6"
              fill="#facc15"
              style={{ scale: step4 }}
            />

            {/* STEP POINTS */}
            <motion.circle
              cx="300"
              cy="1200"
              r="10"
              fill="#8b5cf6"
              style={{
                scale: step1,
                filter: "drop-shadow(0px 0px 10px #8b5cf6)",
              }}
            />

            <motion.circle
              cx="300"
              cy="1200"
              r="25"
              fill="#8b5cf6"
              opacity={0.15}
              style={{ scale: step1 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="300"
              cy="2500"
              r="10"
              fill="#3b82f6"
              style={{ scale: step2 }}
            />
            <motion.circle
              cx="300"
              cy="2500"
              r="25"
              opacity={0.15}
              fill="#3b82f6"
              style={{ scale: step2 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="300"
              cy="3500"
              r="10"
              fill="#22c55e"
              style={{ scale: step3 }}
            />
            <motion.circle
              cx="300"
              cy="3500"
              r="25"
              opacity={0.15}
              fill="#22c55e"
              style={{ scale: step3 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />
            <motion.circle
              cx="300"
              cy="5000"
              r="10"
              fill="#facc15"
              style={{ scale: step4 }}
            />
            <motion.circle
              cx="300"
              cy="5000"
              r="25"
              opacity={0.15}
              fill="#facc15"
              style={{ scale: step4 }}
              animate={{ scale: [1, 1.4, 1] }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: "easeInOut",
              }}
            />
          </svg>
        </div>
        <motion.div
          style={{ y: yBg }}
          className="absolute w-[900px] h-[900px] 
  bg-gradient-to-r from-purple-700/30 to-blue-600/20 
  blur-[180px] rounded-full top-[-300px] left-[-300px]"
        />{" "}
        <div className="absolute w-[800px] h-[800px] bg-gradient-to-r from-blue-600/30 to-cyan-500/20 blur-[180px] rounded-full bottom-[-300px] right-[-300px]" />
        {/* ================= 3D MODELS ================= */}
        <Canvas
          className="absolute inset-0 pointer-events-none z-0"
          shadows
          dpr={[1, 1.5]}
          gl={{ antialias: false }}
        >
          {" "}
          <Environment preset="city" intensity={0.1} />
          {/* MAGNIFYING GLASS */}
          <RotatingModel
            scrollYProgress={scrollYProgress}
            start={0}
            end={0.4}
            position={[0.2, 2.15, 0]}
            url="/models/magnifying_glass.glb"
            baseScale={1}
            maxScale={0.6}
            fixed={true}
            initialRotation={[0, -Math.PI / 2, 0]}
            floatIntensity={0.2}
          />
          {/* CHECK MARK */}
          <RotatingModel
            scrollYProgress={scrollYProgress}
            start={0.25}
            end={0.6}
            position={[-0.2, 0.55, 0]}
            url="/models/check_mark.glb"
            baseScale={0.1}
            fixed={true}
            floatIntensity={1}
          />
          {/* CHAT BUBBLE */}
          <RotatingModel
            scrollYProgress={scrollYProgress}
            start={0.35}
            end={0.8}
            position={[0.2, -0.7, 0]}
            url="/models/chat_bubble.glb"
            baseScale={0.05}
            initialRotation={[0, Math.PI / 2, 0]}
            fixed={true}
            floatIntensity={1}
          />
          {/* REWARD */}
          <RotatingModel
            scrollYProgress={scrollYProgress}
            start={0.7}
            end={1}
            position={[-0.2, -2.5, 0]}
            url="/models/reward.glb"
            baseScale={0.05}
            initialRotation={[0, 0, 0]}
            fixed={true}
            floatIntensity={1}
          />
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, -3.5, 0]}
            receiveShadow
          >
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.2} />
          </mesh>
        </Canvas>
      </div>
      <motion.div
        style={{
          opacity: step1,
          y: useTransform(step1, [0, 1], [50, 0]),
        }}
        className="absolute top-[20%] left-[calc(50%-250px)] md:left-[calc(50%-250px)] max-w-xs z-10 block"
      >
        <h3 className="text-lg font-semibold text-white/80 mb-1">
          Find Tasks Nearby —
        </h3>

        <p className="text-xs text-gray-500 max-w-[180px]">
          Discover tasks around you instantly
        </p>
      </motion.div>
      <motion.div
        style={{
          opacity: step2,
          y: useTransform(step2, [0, 1], [40, 0]),
        }}
        className="absolute top-[42%] right-[calc(50%-200px)] md:right-[calc(50%-250px)] z-10 block text-right"
      >
        <h3 className="text-lg font-semibold text-white/80 mb-1">
          — Complete & Earn
        </h3>

        <p className="text-xs text-gray-500 max-w-[180px] ml-auto">
          Finish tasks and get paid fast
        </p>
      </motion.div>
      <motion.div
        style={{
          opacity: step3,
          y: useTransform(step3, [0, 1], [40, 0]),
        }}
        className="absolute top-[58%] left-[calc(50%-270px)] md:left-[calc(50%-290px)] z-10 block"
      >
        <h3 className="text-lg font-semibold text-white/80 mb-1">
          — Connect & Communicate
        </h3>

        <p className="text-xs text-gray-500 max-w-[180px]">
          Chat directly with task posters
        </p>
      </motion.div>
      <motion.div
        style={{
          opacity: step4,
          y: useTransform(step4, [0, 1], [40, 0]),
        }}
        className="absolute top-[82%] right-[calc(50%-200px)] md:right-[calc(50%-250px)] z-10 block text-right"
      >
        <h3 className="text-lg font-semibold text-white/80 mb-1">
          — Get Rewarded
        </h3>

        <p className="text-xs text-gray-500 max-w-[180px] ml-auto">
          Withdraw earnings anytime
        </p>
      </motion.div>
      {/* ================= HERO ================= */}
      <motion.section
        initial={{ opacity: 0, y: 100, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-6 gap-8"
      >
        <span className="px-4 py-1 text-sm bg-white/10 border border-white/20 rounded-full backdrop-blur-md">
          Trusted by 5,000+ users
        </span>
        <div className="container mx-auto max-w-6xl">
          <motion.div style={{ x, y }}>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight drop-shadow-[0_10px_30px_rgba(0,0,0,0.6)]">
              <span className="bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent animate-gradient">
                Earn Money Locally
              </span>
              <br />
              <span className="text-white/80">Like Never Before</span>
            </h1>
          </motion.div>

          <p className="text-xl text-gray-400 mb-10 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Connect with your community. Post tasks or complete nearby tasks and
            get paid instantly. No commute. No hassle.
          </p>

          <div className="flex gap-4 justify-center flex-wrap items-center">
            {user ? (
              <motion.div whileTap={{ scale: 0.95 }}>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="flex items-center gap-2 px-8 py-6 text-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-[0_0_30px_rgba(139,92,246,0.6)] hover:scale-105 transition-all duration-300"
                  >
                    Go to Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <>
                <Link href="/auth/signup">
                  <motion.div whileTap={{ scale: 0.95 }}>
                    <Button
                      variant="primary"
                      size="lg"
                      className="flex items-center gap-2 btn-glow"
                    >
                      Start Earning
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </motion.div>
                </Link>

                <Link href="/auth/login">
                  <Button variant="outline" size="lg">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.section>
      {/* ================= FEATURES ================= */}
      <motion.section
        className="relative z-10 h-screen flex items-center justify-center px-6"
        initial={{ opacity: 0, y: 120, scale: 0.9 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        {" "}
        <div className="container mx-auto max-w-7xl space-y-20">
          <h2 className="text-5xl font-bold text-center mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,2)]">
            How It Works
          </h2>
          <p className="text-center text-gray-400 max-w-2xl mx-auto drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
            Discover how our platform connects people locally and helps you earn
            effortlessly.
          </p>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={{
              hidden: {},
              show: {
                transition: {
                  staggerChildren: 0.2,
                },
              },
            }}
            className="grid md:grid-cols-3 gap-10 "
          >
            {" "}
            {[
              {
                icon: MapPin,
                title: "Find Local Tasks",
                description:
                  "Browse tasks from people near you. See exactly what needs to be done and how much you can earn.",
              },
              {
                icon: CheckCircle2,
                title: "Complete & Earn",
                description:
                  "Accept a task, complete the work, and get paid directly. Money goes into your secure wallet.",
              },
              {
                icon: Zap,
                title: "Instant Payments",
                description:
                  "Withdraw your earnings anytime. Fast, secure transactions with 24/7 support.",
              },
            ].map((feature, idx) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="p-5 md:p-8 rounded-2xl backdrop-blur-xl bg-white/10 border border-white/20 flex md:block items-center justify-between gap-4"
              >
                <feature.icon className="w-12 h-12 text-purple-400 mb-4 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>
      {/* ================= STATS ================= */}
      <motion.section
        className="relative z-10 h-screen flex flex-col justify-center px-6"
        initial={{ opacity: 0, y: 80 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {" "}
        <h2 className="text-5xl font-bold text-center mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,2)]">
          Platform Growth
        </h2>
        <p className="text-center text-gray-400 mb-16">
          Trusted by thousands of users worldwide
        </p>
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 text-center">
            {[
              { label: "Tasks Completed", value: "25,000+" },
              { label: "Live Tasks", value: "1,284" },
              { label: "Avg Completion Time", value: "2.3 hrs" },
              { label: "Average Rating", value: "4.8★" },
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="p-6 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.25)]"
              >
                <div className="text-3xl md:text-5xl font-extrabold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                  {" "}
                  {stat.value}
                </div>
                <div className="text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      {/* ================= TASKS ================= */}
      <motion.section
        className="relative z-10 h-screen flex flex-col justify-center px-6"
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
      >
        {" "}
        <div className="container mx-auto">
          <h2 className="text-5xl font-bold text-center mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,2)]">
            Popular Tasks
          </h2>
          <p className="text-center text-gray-400 mb-10">
            Explore different types of tasks you can do or post.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {[
              { title: "Shopping & Delivery", icon: "🛍️" },
              { title: "Moving & Hauling", icon: "📦" },
              { title: "Cleaning & Laundry", icon: "🧹" },
              { title: "Repair & Assembly", icon: "🔧" },
              { title: "Photography", icon: "📸" },
              { title: "Tutoring", icon: "📚" },
              { title: "Pet Care", icon: "🐾" },
              { title: "Gardening", icon: "🌱" },
            ].map((cat, idx) => (
              <motion.div key={idx} whileHover={{ scale: 1.01 }}>
                <div className="p-6 rounded-xl text-center bg-gradient-to-br from-white/5 to-transparent border border-white/10 backdrop-blur-lg shadow-[0_20px_60px_rgba(0,0,0,0.6),0_0_40px_rgba(139,92,246,0.25)] hover:shadow-[0_0_60px_rgba(59,130,246,0.3)] transition hover:scale-105">
                  <div className="text-4xl mb-3">{cat.icon}</div>
                  <h3 className="font-semibold">{cat.title}</h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
      {/* ================= TRUST ================= */}
      <motion.section
        className="relative z-10 h-screen flex flex-col items-center justify-center px-6 gap-6"
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.9 }}
        viewport={{ once: true }}
      >
        {" "}
        <div className="container mx-auto max-w-3xl animate-fadeUp">
          <div className="p-10 rounded-2xl bg-gradient-to-br from-purple-600/10 to-transparent border border-purple-400/20 backdrop-blur-xl shadow-[0_0_80px_rgba(139,92,246,0.2)] text-center">
            <h2 className="text-3xl font-bold mb-4">Safe & Secure</h2>

            <p className="text-gray-400 mb-6">
              Your payments are held in secure escrow until work is confirmed.
              Verified users. Transparent ratings. Your data is protected with
              bank-level security.
            </p>

            <div className="flex justify-center gap-6 flex-wrap">
              {["Verified profiles", "Secure payments", "24/7 Support"].map(
                (item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-sm text-gray-300"
                  >
                    <CheckCircle2 className="w-4 h-4 text-purple-400 drop-shadow-[0_0_10px_rgba(139,92,246,0.8)]" />
                    {item}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
        <span className="hidden md:block text-m text-gray-500 mt-4">
          🔒 Bank-level encryption • 🛡 Fraud protection • ⭐ Rating system
        </span>
      </motion.section>
      <footer
        className="
    absolute md:bottom-0 sm:bottom-5 left-0 w-full z-20
    border-t border-white/10
    text-gray-400

    bg-black/40
    backdrop-blur-md

    md:bg-black/50
    md:backdrop-blur-xl
  "
      >
        {" "}
        <div className="max-w-7xl mx-auto px-6 py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {" "}
          {/* BRAND */}
          <div>
            <h3 className="text-white font-semibold mb-3">Taskora</h3>
            <p className="text-sm text-gray-500">
              Connect locally. Complete tasks. Earn instantly.
            </p>
          </div>
          {/* PRODUCT */}
          <div>
            <h4 className="text-white font-medium mb-3">Product</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm md:block md:space-y-2">
              {" "}
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Find Tasks
                </Link>
              </li>
              <li>
                <Link href="/post-task" className="hover:text-white transition">
                  Post a Task
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          {/* SUPPORT */}
          <div>
            <h4 className="text-white font-medium mb-3">Support</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm md:block md:space-y-2">
              {" "}
              <li>
                <Link href="/info#help" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/info#contact"
                  className="hover:text-white transition"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/info#faq" className="hover:text-white transition">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>
          {/* LEGAL + SOCIAL */}
          <div>
            <h4 className="text-white font-medium mb-3">Legal</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:text-sm md:block md:space-y-2">
              {" "}
              <li>
                <Link
                  href="/info#privacy"
                  className="hover:text-white transition"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/info#terms"
                  className="hover:text-white transition"
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  href="/info#safety"
                  className="hover:text-white transition"
                >
                  Safety
                </Link>
              </li>
              <li>
                <a
                  href="https://www.linkedin.com/in/raj-patil-cse/"
                  target="_blank"
                  className="hover:text-white transition"
                >
                  <Linkedin className="w-4 h-4" />
                </a>
              </li>
            </ul>
          </div>
        </div>
        {/* BOTTOM STRIP */}
        <div className="border-t border-white/10 text-center text-xs py-3 text-gray-500">
          © 2026 Taskora. All rights reserved.
        </div>
      </footer>
      {/* ================= SCROLL TO TOP ================= */}
      {/* CTA + FOOTER unchanged except slight glow improvements already applied */}
      <motion.button
        style={{
          opacity: btnOpacity,
        }}
        onClick={() => {
          setIsTopBlur(true);

          const lenis = getLenis();

          if (lenis) {
            lenis.scrollTo(0, {
              duration: 1.6,
              easing: (t) => 1 - Math.pow(1 - t, 3),
            });
          } else {
            window.scrollTo({ top: 0, behavior: "smooth" });
          }

          setTimeout(() => {
            setIsTopBlur(false);
          }, 800);
        }}
        className="
    fixed bottom-20 right-6 z-50
    px-4 py-3 rounded-full
    bg-gradient-to-r from-purple-600 to-blue-600
    text-white text-sm font-semibold
    shadow-[0_0_30px_rgba(139,92,246,0.6)]
    hover:scale-110 transition
    backdrop-blur-md 
  "
      >
        ↑ Top
      </motion.button>
    </main>
  );
}
