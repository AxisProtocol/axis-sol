"use client";
import React from "react";
import { motion, Variants } from "framer-motion";

interface DashboardCardProps {
  children: React.ReactNode;
  className?: string;
  variants?: Variants;
  initial?: string;
  whileInView?: string;
  viewport?: { once: boolean; amount: number };
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  children,
  className = "",
  variants,
  initial = "hidden",
  whileInView = "visible",
  viewport = { once: true, amount: 0.8 },
}) => {
  const defaultVariants: Variants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeInOut" },
    },
  };

  const cardVariants = variants || defaultVariants;

  return (
    <motion.div
      className={`bg-gray-900/50 backdrop-blur-md border border-gray-800/50 rounded-2xl shadow-xl mb-3 w-full max-w-[500px] mx-auto ${className}`}
      variants={cardVariants}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
    >
      <div className="p-6">{children}</div>
    </motion.div>
  );
};

export default DashboardCard;
