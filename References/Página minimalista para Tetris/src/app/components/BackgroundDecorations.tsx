import { motion } from "motion/react";
import { Star } from "lucide-react";

export default function BackgroundDecorations() {
  const stars = [
    { top: "10%", left: "15%", size: 12, delay: 0, duration: 3 },
    { top: "20%", right: "25%", size: 16, delay: 0.5, duration: 4 },
    { top: "35%", left: "8%", size: 10, delay: 1, duration: 3.5 },
    { top: "45%", right: "12%", size: 14, delay: 1.5, duration: 3 },
    { top: "60%", left: "30%", size: 12, delay: 2, duration: 4 },
    { top: "75%", right: "40%", size: 10, delay: 0.3, duration: 3.2 },
    { top: "85%", left: "60%", size: 16, delay: 0.8, duration: 3.8 },
    { top: "15%", right: "18%", size: 11, delay: 1.2, duration: 3.3 },
    { top: "25%", left: "45%", size: 13, delay: 0.6, duration: 4.2 },
    { top: "50%", right: "55%", size: 15, delay: 1.8, duration: 3.6 },
    { top: "12%", right: "35%", size: 9, delay: 0.4, duration: 3.9 },
    { top: "28%", left: "42%", size: 11, delay: 1.4, duration: 3.4 },
    { top: "68%", left: "72%", size: 10, delay: 0.9, duration: 3.7 },
    { top: "32%", right: "68%", size: 14, delay: 1.6, duration: 3.1 },
    { top: "55%", left: "25%", size: 12, delay: 0.2, duration: 4.1 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1],
        }}
        transition={{
          rotate: { duration: 60, repeat: Infinity, ease: "linear" },
          scale: { duration: 8, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -top-32 -left-32 size-96 rounded-full bg-gradient-to-br from-blue-100/40 via-gray-100/30 to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          rotate: -360,
          scale: [1, 1.2, 1],
        }}
        transition={{
          rotate: { duration: 50, repeat: Infinity, ease: "linear" },
          scale: { duration: 10, repeat: Infinity, ease: "easeInOut" },
        }}
        className="absolute -bottom-32 -right-32 size-96 rounded-full bg-gradient-to-tl from-gray-100/40 via-blue-50/30 to-transparent blur-3xl"
      />

      <motion.div
        animate={{
          y: [0, -20, 0],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-1/4 left-1/4 size-64 rounded-full bg-gradient-to-br from-white/30 to-gray-200/20 blur-2xl"
      />

      <motion.div
        animate={{
          y: [0, 20, 0],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="absolute bottom-1/3 right-1/3 size-48 rounded-full bg-gradient-to-tl from-blue-100/30 to-transparent blur-2xl"
      />

      <svg className="absolute inset-0 size-full opacity-10">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e5e7eb" />
            <stop offset="50%" stopColor="#60a5fa" />
            <stop offset="100%" stopColor="#e5e7eb" />
          </linearGradient>
        </defs>

        <motion.line
          x1="0"
          y1="30%"
          x2="100%"
          y2="30%"
          stroke="url(#line-gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2, delay: 0.5 }}
        />

        <motion.line
          x1="0"
          y1="70%"
          x2="100%"
          y2="70%"
          stroke="url(#line-gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2, delay: 1 }}
        />

        <motion.circle
          cx="15%"
          cy="20%"
          r="80"
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 0.3 }}
        />

        <motion.circle
          cx="85%"
          cy="80%"
          r="60"
          fill="none"
          stroke="url(#line-gradient)"
          strokeWidth="2"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.4 }}
          transition={{ duration: 1.5, delay: 0.6 }}
        />
      </svg>

      {stars.map((star, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            top: star.top,
            left: star.left,
            right: star.right,
          }}
          animate={{
            opacity: [0.2, 0.6, 0.2],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: star.duration,
            delay: star.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <Star className="text-blue-400/40 fill-blue-400/20" style={{ width: star.size, height: star.size }} />
        </motion.div>
      ))}
    </div>
  );
}
