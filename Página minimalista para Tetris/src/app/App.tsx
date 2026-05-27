import { useState } from "react";
import { motion } from "motion/react";
import { Sparkles, User, Users, Bot } from "lucide-react";
import GameButton from "./components/GameButton";
import BotDifficultyModal from "./components/BotDifficultyModal";
import BackgroundDecorations from "./components/BackgroundDecorations";

export default function App() {
  const [showBotModal, setShowBotModal] = useState(false);

  const handleSoloPlay = () => {
    console.log("Jogador Solo iniciado");
  };

  const handleMultiplayer = () => {
    console.log("Multiplayer iniciado");
  };

  const handleBotDifficulty = (difficulty: string) => {
    console.log(`Contra Bot - Dificuldade: ${difficulty}`);
    setShowBotModal(false);
  };

  return (
    <div className="relative size-full bg-white overflow-hidden flex items-center justify-center">
      <BackgroundDecorations />

      <div className="relative z-10 flex flex-col items-center justify-center gap-12 px-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="relative text-8xl tracking-wider mb-4">
            <span className="relative inline-block bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 bg-clip-text text-transparent">
              TETRIS
            </span>
            <motion.span
              className="absolute -top-1 -right-1"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="size-5 text-blue-400/60" />
            </motion.span>
            <motion.span
              className="absolute -bottom-1 -left-1"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            >
              <Sparkles className="size-4 text-blue-300/50" />
            </motion.span>
          </h1>
          <p className="text-gray-400 tracking-widest">ESCOLHA SEU MODO</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-4 w-full max-w-md"
        >
          <GameButton
            icon={<User className="size-5" />}
            label="Jogador Solo"
            onClick={handleSoloPlay}
            delay={0}
          />
          <GameButton
            icon={<Users className="size-5" />}
            label="Multiplayer"
            onClick={handleMultiplayer}
            delay={0.1}
          />
          <GameButton
            icon={<Bot className="size-5" />}
            label="Contra Bot"
            onClick={() => setShowBotModal(true)}
            delay={0.2}
          />
        </motion.div>
      </div>

      <BotDifficultyModal
        isOpen={showBotModal}
        onClose={() => setShowBotModal(false)}
        onSelectDifficulty={handleBotDifficulty}
      />
    </div>
  );
}