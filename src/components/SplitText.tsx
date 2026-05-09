import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface SplitTextProps {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
  split?: "word" | "char";
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span" | "div";
}

export const SplitText = ({
  text,
  className = "",
  stagger = 0.03,
  delay = 0,
  split = "word",
  as = "span",
}: SplitTextProps) => {
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [reduced]);

  if (reduced) {
    const Tag = as as keyof JSX.IntrinsicElements;
    return <Tag className={className}>{text}</Tag>;
  }

  const units = split === "char" ? text.split("") : text.split(/(\s+)/);

  const Wrapper = motion[as as keyof typeof motion] as typeof motion.div;

  return (
    <Wrapper
      ref={ref as any}
      className={className}
      style={{ display: "inline-block" }}
      aria-label={text}
    >
      {units.map((unit, i) => {
        if (unit.match(/^\s+$/)) return <span key={i}>{unit}</span>;
        return (
          <span
            key={i}
            aria-hidden="true"
            style={{
              display: "inline-block",
              overflow: "hidden",
              verticalAlign: "top",
              // Georgian glyphs (გ, ფ, ც, ჯ, ჰ) have descenders that extend below
              // the baseline. Pad the wrapper so overflow:hidden doesn't clip them;
              // a matching negative margin keeps surrounding layout unchanged.
              paddingBottom: "0.25em",
              marginBottom: "-0.25em",
            }}
          >
            <motion.span
              initial={{ y: "150%", opacity: 0 }}
              animate={visible ? { y: "0%", opacity: 1 } : { y: "150%", opacity: 0 }}
              transition={{
                duration: 0.7,
                delay: delay + i * stagger,
                ease: [0.22, 1, 0.36, 1], // easeOutExpo
              }}
              style={{ display: "inline-block" }}
            >
              {unit}
            </motion.span>
          </span>
        );
      })}
    </Wrapper>
  );
};
