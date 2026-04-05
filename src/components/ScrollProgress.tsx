import { motion, useScroll, useSpring } from "framer-motion";

export const ScrollProgress = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] z-[9999] origin-left
        bg-gradient-to-r from-[#2d8f43] via-[#3aa557] to-[#44b862]
        shadow-[0_0_12px_rgba(45,143,67,0.6)]"
      style={{ scaleX }}
    />
  );
};
