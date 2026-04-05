

# Use DM Galaktioni Font for All Headings

## Overview
Replace the heading font from FiraGO to DM Galaktioni across the entire website. FiraGO remains as the body/sans font.

## Steps

### 1. Extract and install the font
- Extract `typeface.ge-DM_GalaktioniUNI-.zip` to get the font file(s)
- Copy the `.ttf`/`.otf` file(s) to `public/fonts/`

### 2. `src/index.css` — Add @font-face declarations
- Add `@font-face` for `'DM Galaktioni'` pointing to the extracted font file(s)
- Update the `h1-h6` rule to use `font-family: "DM Galaktioni", "FiraGO", serif;`

### 3. `tailwind.config.ts` — Update `fontFamily.serif`
- Change serif stack to `['"DM Galaktioni"', '"FiraGO"', "Georgia", "serif"]`
- Add a new `heading` font family: `['"DM Galaktioni"', '"FiraGO"', "serif"]`

### 4. No individual page changes needed
The CSS rule `h1, h2, h3, h4, h5, h6 { font-family: ... }` in `index.css` will globally apply the new heading font. Any component using `font-serif` class will also pick it up via the Tailwind config update.

## Files

| File | Change |
|------|--------|
| `public/fonts/` | Add DM Galaktioni font file(s) |
| `src/index.css` | Add @font-face + update heading font-family rule |
| `tailwind.config.ts` | Update serif font stack to include DM Galaktioni |

