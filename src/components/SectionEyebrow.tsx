/**
 * SectionEyebrow — the small green label that sits above section titles
 * (e.g. "Multiple infrastructure", "Our projects", "Why us").
 *
 * Earlier this was implemented inline at ~12 call sites as
 *   `text-xs md:text-sm font-sans font-semibold uppercase tracking-[0.3em] ...`
 * which rendered badly in Georgian — the script wasn't designed for
 * letter-spacing, and `uppercase` is a no-op for it anyway, so the wide
 * tracking just made the words look stretched and disconnected.
 *
 * New style is a regular-weight, normal-tracking FiraGO subtitle in the
 * brand green. Works across Georgian / Latin / Cyrillic without weird
 * spacing artifacts.
 */
interface SectionEyebrowProps {
  children: React.ReactNode;
  className?: string;
  /** Centered alignment (used in section headers above title rows). */
  align?: "left" | "center";
}

export const SectionEyebrow = ({
  children,
  className = "",
  align = "left",
}: SectionEyebrowProps) => {
  return (
    <p
      className={`font-mtavruli font-sans text-sm md:text-base font-medium text-[hsl(130_55%_32%)] ${
        align === "center" ? "text-center" : ""
      } ${className}`}
    >
      {children}
    </p>
  );
};
