# Gym-Git Mobile UI Migration & Alignment Plan

This document details the UI audit and migration strategy to align the React Native Expo mobile application with the premium Cyberpunk/Glassmorphic design system established in the Next.js frontend web app.

---

## 1. UI Audit & Gap Analysis

Our audit of the nextjs frontend vs. the current expo mobile codebase has identified several major discrepancies in style, themes, layouts, and component completeness:

### A. Color Palette & Branding
- **Next.js Frontend**: Uses a premium Cyberpunk aesthetics framework. The primary action color is **Indigo (`#818cf8`)**, supplemented by neon glows and custom workout-type color mapping (Sky, Purple, Rose, Amber, Cyan).
- **Mobile Expo App**: Standardized on a flat **Emerald Green (`#10b981`)** theme. It lacks the cohesive gradient systems, dark shadow backdrops, and neon cyberpunk glows of the web version.

### B. Contribution Graph Component
- **Next.js Frontend**: Fully implemented with 3 timeframe modes:
  1. **365 Days Grid**: Glowing rings, locking future dates, and complex custom hover tooltips.
  2. **Month View**: A complete 7x5/7x6 calendar grid featuring activity hours pills, current day glowing ring, and today neon dot indicators.
  3. **Week View**: A responsive 7-day card layout with vertical progress bar fills.
- **Mobile Expo App**: Implements only a basic 365d horizontal grid. The **Month View** and **Week View** are static text placeholders containing no actual grids or calendar views.

### C. Power Levels Chart Component
- **Next.js Frontend**: Side-by-side split layout:
  1. **Weekly Progress** (left): Showing current and past weeks' scientific power scores.
  2. **Last 12 Months** (right): Showing monthly metrics.
  - Dynamically colors bars with **6 distinct gradient tiers** matching target scores, and overlays floating character portraits relative to height percent.
- **Mobile Expo App**: Renders only a single monthly vertical bar chart, using a standard flat green gradient. It lacks the weekly progress chart, floating avatar adjustments, and score-based gradient tiers.

### D. Modals & Guides
- **Next.js Frontend**: Feature-rich overlay dialogs:
  - **Power Score Guide**: Horizontal interactive scrolling roadmap displaying character tiers, connecting stems, tooltips, and detailed scoring lists.
  - **Weekly Plan Modal**: Grid layout of prebuilt splits and custom form inputs for editing, name settings, and tag builders.
- **Mobile Expo App**: Modals are simple form overlays and lack custom progression indicators, maps, and detailed cards.

---

## 2. Proposed Mobile UI Alignment Architecture

To match the Next.js frontend, we will structure the mobile refactoring into corresponding components:

```
mobile/
 ├── components/
 │    ├── contribution-graph/           <-- Decomposed grid views
 │    │    ├── Header.tsx               <-- Switched to Indigo, timeframe toggles
 │    │    ├── YearView.tsx             <-- Horizontal commit grid
 │    │    ├── MonthView.tsx            <-- Calendar cell grids (NEW implementation)
 │    │    ├── WeekView.tsx             <-- 7-day summary card list (NEW implementation)
 │    │    └── theme-utils.ts           <-- Mapped colors and themes matching Next.js
 │    │
 │    ├── power-level/                  <-- Modular power progress charts
 │    │    ├── power-chart-utils.ts     <-- Mapped gradients for the 6 tiers
 │    │    ├── WeeklyProgress.tsx       <-- Weekly chart layout with floating portraits
 │    │    └── MonthlyProgress.tsx      <-- Monthly chart layout with floating portraits
 │    │
 │    ├── modals/
 │    │    ├── WeeklyPlanModal.tsx      <-- Split grid selection + custom split editors
 │    │    └── PowerScoreGuideModal.tsx <-- Progression roadmap slider with anime tiers
```

---

## 3. Step-by-Step Migration Roadmap

The migration will be carried out in 5 distinct phases to ensure stability:

### Phase 1: Theme & Style Tokens Integration
1. Define a unified `theme` object matching Next.js color styles:
   - Primary Dark Background: `#09090b` (zinc-950)
   - Secondary Cards: `#18181b` (zinc-900)
   - Border lines: `#27272a` (zinc-800)
   - Branding accents: Indigo (`#818cf8`)
   - Custom workout tags mapping:
     - Sky: `['#38bdf8', '#0284c7']`
     - Purple: `['#c084fc', '#7e22ce']`
     - Rose: `['#fb7185', '#be123c']`
     - Amber: `['#fbbf24', '#b45309']`
     - Cyan: `['#22d3ee', '#0891b2']`
2. Update the brand logos and overall headers to use the Indigo gradient styling.

### Phase 2: Implement Contribution Graph Month & Week Views
1. **Header component**: Rewrite toggles to match Next.js style and timeframe states.
2. **Month View**: Implement a grid of 7 columns using React Native `FlatList` or nested `View`s to render calendar cells. Use custom border styling for "Today" and colored pills (`hours` + 'h') inside the boxes.
3. **Week View**: Build a scrollable or stack list of 7 cards. Include progress indicator lines at the bottom of active day cards.

### Phase 3: Implement Dual Power Level Chart Views
1. Create a layout rendering two progress blocks (Weekly and Monthly progress).
2. Write `getPowerColorTheme` in React Native style outputs returning colors corresponding to the 6 tiers:
   - Cyan (Score < 35)
   - Emerald (Score < 55)
   - Indigo (Score < 72)
   - Purple (Score < 88)
   - Rose (Score < 97)
   - Amber (Score >= 97)
3. Implement floating anime character avatars using absolute positioning. Set bottom values dynamically based on `heightPercent`.

### Phase 4: Recreate the Power Score Progression Roadmap
1. Develop the `PowerScoreGuideModal` in React Native:
   - Left Panel (horizontal roadmap): Use a horizontal `ScrollView` containing a main path bar (`LinearGradient` from Cyan to Indigo to Amber). Place character icons above/below the path at offsets relative to their `minPower` score.
   - Right Panel (scoring details): Render clean card listings describing Consistency (45%), Optimal Length (25%), Split Variety (20%), and Momentum (10%).

### Phase 5: Polish & Interactions
- Add micro-animations using `react-native-reanimated`.
- Integrate haptics triggers (`expo-haptics`) on tile/card presses to replicate premium micro-interactions.
