import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export const Cursor = () => {
  const reduced = useReducedMotion();
  const [hidden, setHidden] = useState(true);
  const [hovered, setHovered] = useState(false);

  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);

  const springConfig = { stiffness: 500, damping: 35, mass: 0.4 };
  const x = useSpring(cursorX, springConfig);
  const y = useSpring(cursorY, springConfig);

  useEffect(() => {
    if (reduced) return;
    // Don't show on touch devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
      if (hidden) setHidden(false);
    };

    const onMouseLeave = () => setHidden(true);
    const onMouseEnter = () => setHidden(false);

    // Detect interactive elements
    const checkHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInteractive = target.closest(
        'a, button, [role="button"], input, textarea, select, [data-cursor="hover"]'
      );
      setHovered(!!isInteractive);
    };

    window.addEventListener("mousemove", moveCursor);
    window.addEventListener("mousemove", checkHover);
    document.body.addEventListener("mouseleave", onMouseLeave);
    document.body.addEventListener("mouseenter", onMouseEnter);

    return () => {
      window.removeEventListener("mousemove", moveCursor);
      window.removeEventListener("mousemove", checkHover);
      document.body.removeEventListener("mouseleave", onMouseLeave);
      document.body.removeEventListener("mouseenter", onMouseEnter);
    };
  }, [cursorX, cursorY, hidden, reduced]);

  if (reduced) return null;

  return (
    <>
      {/* Outer ring */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[10000] rounded-full border border-[hsl(130_55%_40%/0.5)] mix-blend-difference hidden md:block"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: hovered ? 56 : 28,
          height: hovered ? 56 : 28,
          opacity: hidden ? 0 : 1,
        }}
        animate={{
          width: hovered ? 56 : 28,
          height: hovered ? 56 : 28,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      />
      {/* Inner dot */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-[10000] rounded-full bg-[hsl(130_55%_40%)] hidden md:block"
        style={{
          x,
          y,
          translateX: "-50%",
          translateY: "-50%",
          width: hovered ? 6 : 4,
          height: hovered ? 6 : 4,
          opacity: hidden ? 0 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 25 }}
      />
    </>
  );
};
