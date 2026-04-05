import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  strength?: number; // how strongly it pulls toward cursor (0-1)
  as?: "div" | "button" | "span";
}

export const MagneticButton = ({ children, className = "", strength = 0.3, as = "div" }: MagneticButtonProps) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 200, damping: 15, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 200, damping: 15, mass: 0.5 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = (e.clientX - centerX) * strength;
    const dy = (e.clientY - centerY) * strength;
    x.set(dx);
    y.set(dy);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  const MotionTag = as === "button" ? motion.button : as === "span" ? motion.span : motion.div;

  return (
    <MotionTag
      ref={ref as React.RefObject<HTMLDivElement & HTMLButtonElement & HTMLSpanElement>}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`inline-block ${className}`}
      style={{ x: springX, y: springY }}
    >
      {children}
    </MotionTag>
  );
};
