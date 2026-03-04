# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/centro/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** GFA Nossa Casa — Spiritist Center
**Generated:** 2026-03-04
**Category:** Mobile-First Management App (PWA)

---

## Global Rules

### Color Palette

| Role | Hex | Tailwind Class |
|------|-----|----------------|
| Primary | `#44d2f0` | `primary` |
| Primary dark | `#13c8ec` | `primary-dark` |
| GFA Blue (institutional) | `#004e89` | `gfa-blue` |
| Secondary | `#8ecae6` | `secondary` |
| Accent/CTA | `#ffb703` | `accent` |
| Background | `#f2f5f7` | `background` |
| Beige light | `#fdfbf7` | `beige-light` |
| Beige dim | `#f4f1ea` | `beige-dim` |
| Card border | `#e8e4db` | `card-border` |
| Surface | `#ffffff` | `surface` |
| Text main | `#0d191b` | `text-main` |
| Text light | `#7a8c90` | `text-light` |

**Color Notes:** Light bg + cyan blue/yellow accents for warm institutional tone

### Typography

- **Heading Font:** Playfair Display (serif)
- **Body Font:** Inter (sans-serif)
- **Mood:** welcoming, serene, professional, spiritual, organizational

### Spacing Variables

| Token | Tailwind | Value | Usage |
|-------|----------|-------|-------|
| xs | `p-1` | `4px` | Tight gaps |
| sm | `p-2` | `8px` | Icon gaps, inline |
| md | `p-4` | `16px` | Standard padding |
| lg | `p-6` | `24px` | Section padding |
| xl | `p-8` | `32px` | Large gaps |
| 2xl | `p-12` | `48px` | Section margins |

### Shadow Depths

| Level | Class | Usage |
|-------|-------|-------|
| Soft | `shadow-soft` | Cards, subtle lift |
| Glow | `shadow-glow` | Primary highlight, featured cards |
| Default | `shadow` | Buttons, focused inputs |
| Large | `shadow-lg` | Modals, dropdowns |
| 2xl | `shadow-2xl` | Main app container |

---

## Anti-Patterns (Do NOT Use)

- ❌ Ornate or overly colorful design
- ❌ **Emojis as icons** — Use SVG icons (Lucide React)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y
- ❌ **Touch targets < 44x44px** — All interactive elements must be tappable on mobile

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Lucide React)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px (mobile), 768px (tablet)
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
- [ ] Touch targets ≥ 44x44px
- [ ] All text in Brazilian Portuguese
- [ ] Skeleton loading instead of abrupt loaders
