// components/ui/Blobs.tsx
"use client";

export function Blobs() {
  return (
    <>
      <div className="absolute w-[900px] h-[900px] bg-gradient-to-r from-purple-700/30 to-blue-600/20 blur-[180px] rounded-full top-[-300px] left-[-300px]" />
      <div className="absolute w-[800px] h-[800px] bg-gradient-to-r from-blue-600/30 to-cyan-500/20 blur-[180px] rounded-full bottom-[-300px] right-[-300px]" />
      <div className="absolute w-[600px] h-[600px] bg-gradient-to-r from-pink-600/20 to-purple-600/10 blur-[160px] rounded-full top-[30%] left-[30%]" />
    </>
  );
}
