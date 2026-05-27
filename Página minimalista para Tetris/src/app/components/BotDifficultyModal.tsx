import { motion, AnimatePresence } from "motion/react";
import { X, Zap, TrendingUp, Flame } from "lucide-react";
import { useState } from "react";

interface BotDifficultyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDifficulty: (difficulty: string) => void;
}

export default function BotDifficultyModal({ isOpen, onClose, onSelectDifficulty }: BotDifficultyModalProps) {
  const [hoveredDiff, setHoveredDiff] = useState<string | null>(null);

  const difficulties = [
    { id: "facil", label: "Fácil", icon: <Zap className="size-6" />, color: "from-gray-100 to-blue-200" },
    { id: "medio", label: "Médio", icon: <TrendingUp className="size-6" />, color: "from-gray-200 to-blue-400" },
    { id: "aura", label: "Aura++", icon: <Flame className="size-6" />, color: "from-gray-300 to-blue-600" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
          >
            <div className="relative w-full max-w-md bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-3xl shadow-2xl p-8">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
              >
                <X className="size-5 text-gray-700" />
              </button>

              <h2 className="text-3xl text-center mb-2 bg-gradient-to-r from-gray-700 via-gray-900 to-gray-700 bg-clip-text text-transparent">
                Escolha a Dificuldade
              </h2>
              <p className="text-center text-gray-500 mb-8 tracking-wide">Contra Bot</p>

              <div className="flex flex-col gap-4">
                {difficulties.map((diff, index) => (
                  <motion.button
                    key={diff.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.03, x: 4 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => onSelectDifficulty(diff.id)}
                    onMouseEnter={() => setHoveredDiff(diff.id)}
                    onMouseLeave={() => setHoveredDiff(null)}
                    className={`group relative overflow-hidden rounded-xl px-6 py-5 bg-gradient-to-br ${diff.color} shadow-md hover:shadow-lg transition-all duration-300`}
                  >
                    {diff.id === "aura" && (
                      <>
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/40 to-transparent"
                          animate={{
                            x: ["-100%", "100%"],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        <motion.div
                          className="absolute inset-0 bg-gradient-to-l from-transparent via-blue-600/30 to-transparent"
                          animate={{
                            x: ["100%", "-100%"],
                          }}
                          transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "linear",
                          }}
                        />

                        <motion.div
                          className="absolute top-0 left-[20%] w-0.5 h-full bg-gradient-to-b from-blue-400 via-transparent to-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.9)]"
                          animate={{
                            opacity: [0, 1, 0, 1, 0],
                            scaleX: [1, 2, 1, 2, 1]
                          }}
                          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 0.5 }}
                        />

                        <motion.div
                          className="absolute top-0 right-[30%] w-0.5 h-full bg-gradient-to-b from-blue-500 via-transparent to-blue-500 shadow-[0_0_10px_rgba(59,130,246,1)]"
                          animate={{
                            opacity: [0, 1, 0, 1, 0],
                            scaleX: [1, 2.5, 1]
                          }}
                          transition={{ duration: 1, repeat: Infinity, repeatDelay: 0.3 }}
                        />

                        <motion.div
                          className="absolute inset-0 rounded-xl border border-blue-400/0"
                          animate={{
                            borderColor: ["rgba(59, 130, 246, 0)", "rgba(59, 130, 246, 0.6)", "rgba(59, 130, 246, 0)"],
                            boxShadow: [
                              "inset 0 0 0px rgba(59, 130, 246, 0)",
                              "inset 0 0 20px rgba(59, 130, 246, 0.5)",
                              "inset 0 0 0px rgba(59, 130, 246, 0)",
                            ]
                          }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                        />

                        {hoveredDiff === "aura" && (
                          <>
                            <motion.div
                              className="absolute top-0 left-[10%] w-1 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0], x: [-15, 15, -15], scaleY: [1, 1.2, 0.8, 1] }}
                              transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.3 }}
                            />
                            <motion.div
                              className="absolute top-0 left-[30%] w-0.5 h-full bg-gradient-to-b from-transparent via-blue-300 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.7)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0], x: [10, -10, 10], scaleY: [0.8, 1.3, 1] }}
                              transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 0.2 }}
                            />
                            <motion.div
                              className="absolute top-0 right-[25%] w-1 h-full bg-gradient-to-b from-transparent via-blue-500 to-transparent shadow-[0_0_12px_rgba(59,130,246,0.9)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0], x: [15, -15, 15], scaleY: [1.1, 0.9, 1.2, 1] }}
                              transition={{ duration: 0.18, repeat: Infinity, repeatDelay: 0.4 }}
                            />
                            <motion.div
                              className="absolute top-0 right-[45%] w-0.5 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0], x: [-12, 12, -12], scaleY: [0.9, 1.4, 1] }}
                              transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 0.15 }}
                            />
                            <motion.div
                              className="absolute top-0 right-[10%] w-0.5 h-full bg-gradient-to-b from-transparent via-blue-600 to-transparent shadow-[0_0_15px_rgba(59,130,246,1)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0], x: [8, -8, 8], scaleY: [1.2, 0.8, 1.1, 1] }}
                              transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 0.25 }}
                            />

                            <motion.div
                              className="absolute top-[20%] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent shadow-[0_0_8px_rgba(59,130,246,0.7)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0], y: [-8, 8, -8] }}
                              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.5 }}
                            />
                            <motion.div
                              className="absolute top-[60%] left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent shadow-[0_0_10px_rgba(59,130,246,0.8)]"
                              initial={{ opacity: 0 }}
                              animate={{ opacity: [0, 1, 0], y: [10, -10, 10] }}
                              transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.4 }}
                            />

                            <motion.div
                              className="absolute top-[10%] left-[15%] w-1 h-1 rounded-full bg-blue-400 shadow-[0_0_15px_rgba(59,130,246,1)]"
                              animate={{ opacity: [0, 1, 0], scale: [0, 2, 0] }}
                              transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.6 }}
                            />
                            <motion.div
                              className="absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,1)]"
                              animate={{ opacity: [0, 1, 0], scale: [0, 2.5, 0] }}
                              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.3 }}
                            />
                            <motion.div
                              className="absolute top-[70%] left-[40%] w-1 h-1 rounded-full bg-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.9)]"
                              animate={{ opacity: [0, 1, 0], scale: [0, 2.2, 0] }}
                              transition={{ duration: 0.45, repeat: Infinity, repeatDelay: 0.5 }}
                            />
                            <motion.div
                              className="absolute top-[85%] right-[35%] w-1 h-1 rounded-full bg-blue-600 shadow-[0_0_18px_rgba(59,130,246,1)]"
                              animate={{ opacity: [0, 1, 0], scale: [0, 2.8, 0] }}
                              transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.7 }}
                            />

                            <motion.div
                              className="absolute inset-0 rounded-xl"
                              animate={{
                                boxShadow: [
                                  "0 0 0px rgba(59, 130, 246, 0)",
                                  "0 0 30px rgba(59, 130, 246, 0.8)",
                                  "0 0 0px rgba(59, 130, 246, 0)",
                                ],
                              }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            />
                            <motion.div
                              className="absolute inset-0 rounded-xl bg-blue-500/10"
                              animate={{
                                opacity: [0, 0.3, 0],
                              }}
                              transition={{ duration: 0.4, repeat: Infinity }}
                            />

                            <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ filter: 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.8))' }}>
                              <motion.path
                                d="M 20 0 L 25 30 L 20 30 L 28 100"
                                stroke="rgba(59, 130, 246, 0.9)"
                                strokeWidth="2"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.8 }}
                              />
                              <motion.path
                                d="M 60 0 L 58 25 L 65 25 L 62 50 L 68 50 L 63 100"
                                stroke="rgba(59, 130, 246, 1)"
                                strokeWidth="2.5"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.25, repeat: Infinity, repeatDelay: 0.5 }}
                              />
                              <motion.path
                                d="M 85 0 L 82 20 L 88 20 L 84 45 L 90 45 L 85 70 L 91 70 L 87 100"
                                stroke="rgba(96, 165, 250, 0.95)"
                                strokeWidth="2"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.28, repeat: Infinity, repeatDelay: 0.6 }}
                              />
                              <motion.path
                                d="M 40 0 L 42 35 L 38 35 L 41 60 L 36 100"
                                stroke="rgba(147, 197, 253, 0.9)"
                                strokeWidth="1.5"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 0.4 }}
                              />
                              <motion.path
                                d="M 95 0 L 93 15 L 97 15 L 94 100"
                                stroke="rgba(59, 130, 246, 0.85)"
                                strokeWidth="1.5"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 0.7 }}
                              />
                            </svg>

                            <motion.div
                              className="absolute top-[15%] left-[25%] w-2 h-2 rounded-full bg-blue-400"
                              style={{ boxShadow: '0 0 20px rgba(59, 130, 246, 1), 0 0 40px rgba(59, 130, 246, 0.5)' }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 3, 0],
                              }}
                              transition={{ duration: 0.3, repeat: Infinity, repeatDelay: 0.4 }}
                            />
                            <motion.div
                              className="absolute top-[40%] right-[15%] w-2 h-2 rounded-full bg-blue-500"
                              style={{ boxShadow: '0 0 25px rgba(59, 130, 246, 1), 0 0 50px rgba(59, 130, 246, 0.6)' }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 3.5, 0],
                              }}
                              transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.2 }}
                            />
                            <motion.div
                              className="absolute top-[65%] left-[45%] w-2 h-2 rounded-full bg-blue-300"
                              style={{ boxShadow: '0 0 22px rgba(59, 130, 246, 1), 0 0 44px rgba(59, 130, 246, 0.5)' }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 4, 0],
                              }}
                              transition={{ duration: 0.28, repeat: Infinity, repeatDelay: 0.6 }}
                            />
                            <motion.div
                              className="absolute top-[25%] right-[40%] w-2 h-2 rounded-full bg-blue-600"
                              style={{ boxShadow: '0 0 30px rgba(59, 130, 246, 1), 0 0 60px rgba(59, 130, 246, 0.7)' }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 3.2, 0],
                              }}
                              transition={{ duration: 0.32, repeat: Infinity, repeatDelay: 0.5 }}
                            />
                            <motion.div
                              className="absolute top-[80%] left-[60%] w-2 h-2 rounded-full bg-blue-400"
                              style={{ boxShadow: '0 0 28px rgba(59, 130, 246, 1), 0 0 56px rgba(59, 130, 246, 0.6)' }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 3.8, 0],
                              }}
                              transition={{ duration: 0.26, repeat: Infinity, repeatDelay: 0.3 }}
                            />
                            <motion.div
                              className="absolute top-[50%] left-[15%] w-2 h-2 rounded-full bg-blue-500"
                              style={{ boxShadow: '0 0 24px rgba(59, 130, 246, 1), 0 0 48px rgba(59, 130, 246, 0.55)' }}
                              animate={{
                                opacity: [0, 1, 0],
                                scale: [0, 3.3, 0],
                              }}
                              transition={{ duration: 0.29, repeat: Infinity, repeatDelay: 0.7 }}
                            />

                            {[...Array(8)].map((_, i) => (
                              <motion.div
                                key={`spark-${i}`}
                                className="absolute w-1 h-1 rounded-full bg-blue-400"
                                style={{
                                  top: `${Math.random() * 100}%`,
                                  left: `${Math.random() * 100}%`,
                                  boxShadow: '0 0 15px rgba(59, 130, 246, 1)'
                                }}
                                animate={{
                                  opacity: [0, 1, 0],
                                  scale: [0, 2, 0],
                                  x: [0, (Math.random() - 0.5) * 40],
                                  y: [0, (Math.random() - 0.5) * 40],
                                }}
                                transition={{
                                  duration: 0.4 + Math.random() * 0.3,
                                  repeat: Infinity,
                                  repeatDelay: 0.2 + Math.random() * 0.5,
                                  delay: Math.random() * 0.5,
                                }}
                              />
                            ))}

                            <motion.div
                              className="absolute inset-0 rounded-xl"
                              animate={{
                                background: [
                                  "radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
                                  "radial-gradient(circle at 80% 70%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
                                  "radial-gradient(circle at 40% 60%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
                                  "radial-gradient(circle at 60% 40%, rgba(59, 130, 246, 0.2) 0%, transparent 50%)",
                                ],
                              }}
                              transition={{ duration: 0.6, repeat: Infinity }}
                            />
                          </>
                        )}
                      </>
                    )}

                    <div className="flex items-center gap-4 relative z-10">
                      <div className="p-2 rounded-lg bg-white/70 shadow-sm">
                        <motion.div
                          className="text-gray-700 group-hover:text-gray-900 transition-colors"
                          animate={diff.id === "aura" && hoveredDiff === "aura" ? {
                            rotate: [0, -5, 5, -5, 5, 0],
                            scale: [1, 1.1, 1.1, 1.1, 1.1, 1],
                          } : {}}
                          transition={{ duration: 0.5, repeat: diff.id === "aura" && hoveredDiff === "aura" ? Infinity : 0, repeatDelay: 0.5 }}
                        >
                          {diff.icon}
                        </motion.div>
                      </div>
                      <span className="text-xl text-gray-800 group-hover:text-gray-900 transition-colors">
                        {diff.label}
                      </span>
                    </div>
                    <div className="absolute inset-0 rounded-xl ring-1 ring-inset ring-gray-300/30 group-hover:ring-gray-400/40 transition-all" />
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
