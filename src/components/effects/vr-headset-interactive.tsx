"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

export function VRHeadsetInteractive() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rotationY, setRotationY] = useState(0);
  const [view, setView] = useState<"front" | "side" | "top">("front");

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(y, springConfig);
  const rotateY = useSpring(x, springConfig);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDrag = (_event: MouseEvent | TouchEvent | PointerEvent, info: { offset: { x: number; y: number } }) => {
    x.set(info.offset.x * 0.5);
    y.set(-info.offset.y * 0.3);
    setRotationY(info.offset.x * 0.5);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const switchView = (newView: "front" | "side" | "top") => {
    setView(newView);

    // Animate to specific rotation for each view
    switch (newView) {
      case "front":
        x.set(0);
        y.set(0);
        break;
      case "side":
        x.set(90);
        y.set(0);
        break;
      case "top":
        x.set(0);
        y.set(-80);
        break;
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center">
      {/* View Controls */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {(["front", "side", "top"] as const).map((v) => (
          <motion.button
            key={v}
            onClick={() => switchView(v)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
              view === v
                ? "bg-gradient-to-r from-brand-light to-brand-dark text-white"
                : "bg-white/10 text-gray-400 hover:bg-white/20"
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)} View
          </motion.button>
        ))}
      </div>

      {/* 3D Container */}
      <div
        ref={containerRef}
        className="relative w-full h-full flex items-center justify-center perspective-1000"
      >
        <motion.div
          drag
          dragElastic={0.1}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          style={{
            rotateX,
            rotateY,
            transformStyle: "preserve-3d",
            cursor: isDragging ? "grabbing" : "grab",
          }}
          className="relative w-80 h-80 md:w-96 md:h-96"
        >
          {/* Animated glow rings */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(0,212,255,0.4) 0%, transparent 70%)",
              transform: "translateZ(-120px)",
            }}
            animate={{
              scale: [1, 1.15, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)",
              transform: "translateZ(-140px)",
            }}
            animate={{
              scale: [1.15, 1, 1.15],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1,
            }}
          />

          {/* Main VR Headset */}
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              transformStyle: "preserve-3d",
            }}
          >
            {/* Enhanced Headset */}
            <div
              className="relative"
              style={{
                transformStyle: "preserve-3d",
              }}
            >
              {/* Front Face */}
              <motion.svg
                viewBox="0 0 240 140"
                className="w-60 h-36 md:w-80 md:h-48"
                style={{
                  filter: "drop-shadow(0 20px 60px rgba(0,212,255,0.5))",
                  transform: "translateZ(40px)",
                }}
                animate={{
                  filter: [
                    "drop-shadow(0 20px 60px rgba(0,212,255,0.5))",
                    "drop-shadow(0 20px 80px rgba(139,92,246,0.6))",
                    "drop-shadow(0 20px 60px rgba(255,45,146,0.5))",
                    "drop-shadow(0 20px 60px rgba(0,212,255,0.5))",
                  ],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <defs>
                  <linearGradient id="main-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00A5E0" />
                    <stop offset="50%" stopColor="#0077B6" />
                    <stop offset="100%" stopColor="#005A8C" />
                  </linearGradient>
                  <linearGradient id="lens-shine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#00A5E0" stopOpacity="0.4" />
                  </linearGradient>
                  <radialGradient id="lens-reflect">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#00A5E0" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#1a1a2e" stopOpacity="0.9" />
                  </radialGradient>
                </defs>

                {/* Main body with depth */}
                <motion.rect
                  x="15"
                  y="20"
                  width="210"
                  height="100"
                  rx="25"
                  fill="url(#main-grad)"
                  opacity="0.95"
                  animate={{
                    opacity: [0.95, 1, 0.95],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                />

                {/* Inner shadow for depth */}
                <rect
                  x="20"
                  y="25"
                  width="200"
                  height="90"
                  rx="20"
                  fill="rgba(0,0,0,0.3)"
                />

                {/* Left lens with animation */}
                <g>
                  <motion.circle
                    cx="80"
                    cy="70"
                    r="30"
                    fill="url(#lens-reflect)"
                    animate={{
                      r: [30, 32, 30],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <circle cx="80" cy="70" r="25" fill="#0a0a1e" opacity="0.9" />
                  <circle cx="80" cy="70" r="18" fill="url(#lens-shine)" opacity="0.4" />
                  {/* Lens reflection */}
                  <ellipse cx="75" cy="65" rx="8" ry="12" fill="white" opacity="0.6" />
                </g>

                {/* Right lens with animation */}
                <g>
                  <motion.circle
                    cx="160"
                    cy="70"
                    r="30"
                    fill="url(#lens-reflect)"
                    animate={{
                      r: [30, 32, 30],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.5,
                    }}
                  />
                  <circle cx="160" cy="70" r="25" fill="#0a0a1e" opacity="0.9" />
                  <circle cx="160" cy="70" r="18" fill="url(#lens-shine)" opacity="0.4" />
                  {/* Lens reflection */}
                  <ellipse cx="155" cy="65" rx="8" ry="12" fill="white" opacity="0.6" />
                </g>

                {/* Bridge */}
                <rect x="110" y="63" width="20" height="14" rx="3" fill="#0077B6" opacity="0.8" />

                {/* IPD adjustment indicator */}
                <circle cx="120" cy="70" r="2" fill="#00A5E0">
                  <animate attributeName="opacity" values="1;0.3;1" dur="2s" repeatCount="indefinite" />
                </circle>

                {/* Strap attachments */}
                <rect x="5" y="55" width="18" height="30" rx="4" fill="#6b46c1" opacity="0.7" />
                <rect x="217" y="55" width="18" height="30" rx="4" fill="#6b46c1" opacity="0.7" />

                {/* Detail lines and vents */}
                <line x1="30" y1="35" x2="210" y2="35" stroke="#00A5E0" strokeWidth="2" opacity="0.5" />
                <line x1="30" y1="105" x2="210" y2="105" stroke="#005A8C" strokeWidth="2" opacity="0.5" />

                {/* Vent holes */}
                {[...Array(8)].map((_, i) => (
                  <circle
                    key={i}
                    cx={40 + i * 22}
                    cy="110"
                    r="2"
                    fill="#00A5E0"
                    opacity="0.4"
                  />
                ))}

                {/* Power indicator */}
                <circle cx="220" cy="70" r="3" fill="#00ff00">
                  <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />
                </circle>
              </motion.svg>

              {/* Side panels for 3D depth */}
              <div
                className="absolute top-1/2 left-0 w-10 h-28 md:w-12 md:h-32 rounded-l-xl"
                style={{
                  background: "linear-gradient(to right, rgba(139,92,246,0.8), transparent)",
                  transform: "translateZ(30px) translateY(-50%) rotateY(90deg) translateX(-40px)",
                  boxShadow: "inset 0 0 20px rgba(0,212,255,0.3)",
                }}
              />
              <div
                className="absolute top-1/2 right-0 w-10 h-28 md:w-12 md:h-32 rounded-r-xl"
                style={{
                  background: "linear-gradient(to left, rgba(0,212,255,0.8), transparent)",
                  transform: "translateZ(30px) translateY(-50%) rotateY(-90deg) translateX(40px)",
                  boxShadow: "inset 0 0 20px rgba(255,45,146,0.3)",
                }}
              />

              {/* Top panel */}
              <div
                className="absolute top-0 left-1/2 w-48 h-8 md:w-64 md:h-10 rounded-t-xl"
                style={{
                  background: "linear-gradient(to bottom, rgba(139,92,246,0.6), transparent)",
                  transform: "translateZ(20px) translateX(-50%) rotateX(90deg) translateY(-20px)",
                }}
              />
            </div>

            {/* Floating energy particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${15 + Math.random() * 70}%`,
                  background: i % 3 === 0 ? "#00A5E0" : i % 3 === 1 ? "#0077B6" : "#005A8C",
                  transform: `translateZ(${60 + Math.random() * 120}px)`,
                  boxShadow: `0 0 10px ${i % 3 === 0 ? "#00A5E0" : i % 3 === 1 ? "#0077B6" : "#005A8C"}`,
                }}
                animate={{
                  y: [-20, 20, -20],
                  x: [-10, 10, -10],
                  opacity: [0.3, 1, 0.3],
                  scale: [0.8, 1.2, 0.8],
                }}
                transition={{
                  duration: 3 + Math.random() * 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>

          {/* Rotating tech rings */}
          <motion.div
            className="absolute inset-0 border-2 border-brand-light/40 rounded-full"
            style={{
              transform: "translateZ(10px)",
            }}
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: "linear",
            }}
          />

          <motion.div
            className="absolute inset-0 border-2 border-brand/40 rounded-full"
            style={{
              transform: "translateZ(5px)",
            }}
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </motion.div>
      </div>

      {/* Interaction hint */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: isDragging ? 0 : 1, y: 0 }}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-sm text-gray-400 mb-1">Drag to rotate • Click views to switch</p>
        <p className="text-xs text-gray-500">Current rotation: {Math.round(rotationY)}°</p>
      </motion.div>
    </div>
  );
}
