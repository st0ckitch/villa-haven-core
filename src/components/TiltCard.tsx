import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number; // max rotation in degrees
  glare?: boolean;  // show cursor-tracking highlight
  scale?: number;   // scale on hover
}

export const TiltCard = ({ children, className = "", maxTilt = 8, glare = true, scale = 1.02 }: TiltCardProps) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Normalized -0.5 to 0.5 based on cursor position
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [maxTilt, -maxTilt]), { stiffness: 300, damping: 30 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-maxTilt, maxTilt]), { stiffness: 300, damping: 30 });

  // Glare position (0-100%)
  const glareX = useTransform(mouseX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(mouseY, [0, 1], ["0%", "100%"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current || reduced) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative ${className}`}
      style={{
        transformStyle: "preserve-3d",
        perspective: 1000,
        rotateX,
        rotateY,
      }}
      whileHover={{ scale }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {children}
      {glare && (
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[inherit] overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: useTransform(
              [glareX, glareY],
              ([x, y]) =>
                `radial-gradient(circle at ${x} ${y}, rgba(255,255,255,0.4) 0%, transparent 50%)`
            ),
          }}
        />
      )}
    </motion.div>
  );
};
