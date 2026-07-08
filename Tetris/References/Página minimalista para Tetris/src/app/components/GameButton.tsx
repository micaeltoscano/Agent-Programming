import { motion } from "motion/react";
import { ReactNode } from "react";

interface GameButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  delay?: number;
}

export default function GameButton({ icon, label, onClick, delay = 0 }: GameButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="group relative overflow-hidden rounded-2xl px-8 py-6 bg-gradient-to-br from-white via-gray-100 to-gray-200 shadow-lg hover:shadow-xl transition-all duration-300"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-gray-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative flex items-center justify-center gap-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-gray-200 to-white shadow-inner">
          <div className="text-gray-700 group-hover:text-blue-600 transition-colors duration-300">
            {icon}
          </div>
        </div>
        <span className="text-xl tracking-wide text-gray-800 group-hover:text-gray-900 transition-colors duration-300">
          {label}
        </span>
      </div>

      <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-gray-300/50 group-hover:ring-blue-300/50 transition-all duration-300" />
    </motion.button>
  );
}
