"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { positionClasses, calculatePosition } from "../context/Tooltip.context";

interface TooltipProps {
  content?: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  maxWidth?: number;
  className?: string;
}

export const Tooltip = ({
  content = "",
  children,
  position = "bottom",
  delay = 0,
  maxWidth = 200,
  className = "",
}: TooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [calculatedPosition, setCalculatedPosition] = useState(position);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  // ...existing code...

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const trigger = triggerRef.current.getBoundingClientRect();
      const tooltip = tooltipRef.current.getBoundingClientRect();
      const newPosition = calculatePosition(trigger, tooltip, position);
      setCalculatedPosition(newPosition as "top" | "bottom" | "left" | "right");
    }
  }, [isVisible, position]);

  // ...existing code...
  const animationVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  return (
    <div className={`relative inline-block ${className}`}>
      <div
        ref={triggerRef}
        onMouseEnter={() => setTimeout(() => setIsVisible(true), delay)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={animationVariants}
            transition={{ duration: 0.2 }}
            className={`
              absolute z-9999 bg-[#3c4043] text-white text-[13px] leading-4.5 px-2.5 py-1.5 rounded shadow-[0_2px_8px_rgba(0,0,0,0.26)] whitespace-nowrap font-semi-bold pointer-events-none
              ${positionClasses[calculatedPosition] || positionClasses.top}
            `}
            style={{ maxWidth: `${maxWidth}px` }}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
