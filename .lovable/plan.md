# Center the Green Frame cards grid

## Problem
`GreenFrameSection` uses a 3-column grid for 5 items, leaving the last row (2 cards) left-aligned. The user wants the layout centered so the bottom 2 cards sit in the middle.

## Approach
Switch from `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3` to a flex-wrap centered layout with fixed card widths per breakpoint — same pattern already used in `ServicesGlassGrid`. This naturally centers the trailing row.

## Files

| File | Change |
|------|--------|
| `src/components/GreenFrameSection.tsx` | Replace the grid wrapper with `flex flex-wrap justify-center gap-4`; give each card a responsive width (full on mobile, ~1/2 on md, ~1/3 on lg) so the last row of 2 cards centers. |

No logic, copy, or styling-token changes — only the layout wrapper and card width classes.
