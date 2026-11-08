---
version: alpha
name: TicketFlow (Raycast Palette × Raycast & Linear Design)
website: "https://ticketflow.dev"
description: A dark-canvas developer and operational system built purely with Raycast's color palette (#07080a canvas, four-step surface ladder, #242728 hairline borders, universal #ffffff white CTA pill, and signature #ff6161 red / category accents) combined with the structural design craft of Raycast and Linear (command palette omnibar, tactile keycaps, 40px dense data tables, negative display letter-spacing, and Inter ss03). Zero drop shadows on chrome.

seo:
  title: "TicketFlow Design System — Pure Raycast Colors with Raycast & Linear Design"
  metaDescription: "A developer-grade dark design system built with Raycast's pure colors, command palette, and Inter ss03, combined with Linear's mechanical precision, negative display tracking, and operational density."
  highlights:
    - "100% Raycast color palette — pure near-black canvas at #07080a with a 4-step surface ladder (#0d0d0d, #101111, #121212, #18191a)"
    - "White CTA pill at #ffffff is the universal primary action — paired with hairline-strong 1px borders (#242728) and zero drop shadows"
    - "Raycast Red (#ff6161 / #ff5757) and hero gradient (#ff5757 to #a1131a) serve as the signature brand accents"
    - "Inter typography site-wide with font-feature-settings 'calt', 'kern', 'liga', 'ss03' (single-story alternate g)"
    - "Linear-grade mechanical negative letter-spacing on display type (-3.0px at 80px down to -0.6px at 28px)"
    - "Tactile keyboard shortcuts (Kbd keycaps from #121212 to #0d0d0d) and command palette quick-actions"
    - "Pure Raycast category accents inside soft 15% alpha containers: Accent Red #ff6161, Accent Green #59d499, Accent Yellow #ffc533, and Info Blue #57c1ff"
  tags:
    - "Developer Tools & IDEs"
    - "Project Management"
    - "Productivity & SaaS"
    - "POS & Operations"
  lastUpdated: "2026-11-08"
  author:
    name: "TicketFlow Engineering & Design"
    url: "https://ticketflow.dev"
  opening: |
    TicketFlow runs exclusively on the color palette of Raycast: pure near-black canvas at #07080a, hairline 1px borders at #242728, a four-step surface ladder (#0d0d0d → #101111 → #121212 → #18191a), the iconic white CTA pill (#ffffff) anchoring primary actions, and the signature Raycast Red (#ff6161 / #ff5757) as the brand accent.

    Onto this color foundation, we marry the best structural design patterns of both Raycast and Linear. From Raycast, we bring the keyboard-first command palette, tactile dual-gradient keycaps, search bar architecture, and Inter with the ss03 stylistic set (single-story alternate 'g'). From Linear, we bring the high-density operational data tables (40px rows), mechanical negative display letter-spacing (-3.0px down to -0.6px), status badge shapes, and code/monetary monospace precision.

    The result is a fast, high-density, dark-only interface where every pixel serves operational efficiency. There are zero drop shadows on chrome; depth comes entirely from the surface ladder and hairline contrast.
  related:
    - href: "https://github.com/google-labs-code/design.md"
      title: "The DESIGN.md specification"
      description: "Google Labs' open spec for machine-readable design system files."
    - href: "https://www.raycast.com"
      title: "Raycast Design System"
      description: "The source for the color tokens, near-black surfaces, command palette patterns, and Inter ss03."
    - href: "https://linear.app"
      title: "Linear Design System"
      description: "The source for negative tracking typography, dense operational data tables, and software craft."
  questions:
    - id: "primary-color"
      title: "What is TicketFlow's primary color?"
      answer: "In full accordance with Raycast's color discipline, the universal primary CTA is pure white at #ffffff paired with black text at #000000. Raycast's brand accent is signature Raycast Red at #ff6161 (with the hero launch gradient from #ff5757 to #a1131a). Focus rings and keyboard borders use crisp white at rgba(255,255,255,0.3) or Raycast Red (#ff6161). Saturated colors (green #59d499, yellow #ffc533, blue #57c1ff, red #ff6161) appear exclusively inside category tags, status chips, and charts, never on chrome surfaces."
    - id: "dark-mode"
      title: "Is there a light mode?"
      answer: "No. The system is dark-only by design. The canvas is near-black at #07080a, elevated through #0d0d0d, #101111, #121212, and #18191a with 1px hairline borders at #242728. There is no light variant. Depth is purely architectural without drop shadows."
    - id: "typography"
      title: "What typography does TicketFlow use?"
      answer: "Inter with font-feature-settings 'calt', 'kern', 'liga', 'ss03' enabled site-wide. The ss03 stylistic set swaps in Inter's single-story alternate 'g' (Raycast's signature hallmark). Headline metrics use Linear's negative letter-spacing ramp (-3.0px at 80px down to -0.6px at 28px). Monospace type (JetBrains Mono / Geist Mono) carries ticket IDs, barcode values, cash numbers, and keycaps."
    - id: "design-fusion"
      title: "How are Raycast and Linear blended?"
      answer: "The colors belong 100% to Raycast (near-black, white pill CTA, red brand accent, hairline borders, category accents). The structural design blends Raycast's command palette and keycaps with Linear's 40px dense data rows, negative tracking display typography, and product-focused card density."

colors:
  # Universal Primary CTA (Raycast)
  primary: "#ffffff"
  primary-pressed: "#e8e8e8"
  primary-hover: "#f5f5f5"
  on-primary: "#000000"
  button-fg: "#18191a"

  # Brand Accent & Signature Red (Raycast)
  brand-red: "#ff6161"
  brand-red-hover: "#ff5757"
  brand-red-soft: "rgba(255, 97, 97, 0.15)"
  hero-stripe-start: "#ff5757"
  hero-stripe-end: "#a1131a"

  # Dark Canvas & 4-Step Surface Ladder (Raycast)
  canvas: "#07080a"
  surface: "#0d0d0d"
  surface-1: "#0d0d0d"
  surface-elevated: "#101111"
  surface-2: "#101111"
  surface-card: "#121212"
  surface-3: "#121212"
  surface-active: "#18191a"
  surface-4: "#18191a"

  # Hairlines & Borders (Raycast)
  hairline: "#242728"
  hairline-soft: "rgba(255, 255, 255, 0.08)"
  hairline-strong: "rgba(255, 255, 255, 0.16)"

  # Text & Ink Ladder (Raycast)
  ink: "#f4f4f6"
  body: "#cdcdcd"
  charcoal: "#d3d3d4"
  mute: "#9c9c9d"
  ash: "#6a6b6c"
  stone: "#434345"
  on-dark: "#ffffff"
  on-dark-mute: "rgba(255, 255, 255, 0.72)"

  # Category & Status Accents (Raycast)
  accent-blue: "#57c1ff"
  accent-blue-soft: "rgba(87, 193, 255, 0.15)"
  accent-green: "#59d499"
  accent-green-soft: "rgba(89, 212, 153, 0.15)"
  accent-yellow: "#ffc533"
  accent-yellow-soft: "rgba(255, 197, 51, 0.15)"
  accent-red: "#ff6161"
  accent-red-soft: "rgba(255, 97, 97, 0.15)"

  # Semantic Mapping
  semantic-success: "#59d499"
  semantic-warning: "#ffc533"
  semantic-danger: "#ff6161"
  semantic-info: "#57c1ff"
  semantic-overlay: "rgba(7, 8, 10, 0.80)"

  # Tactile Keycaps (Raycast)
  key-bg-start: "#121212"
  key-bg-end: "#0d0d0d"

typography:
  display-xl:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 80px
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: -3.0px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  display-lg:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 56px
    fontWeight: 600
    lineHeight: 1.10
    letterSpacing: -1.8px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  display-md:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 40px
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: -1.0px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  headline:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  heading-xl:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 24px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: -0.4px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  heading-lg:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 22px
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: -0.3px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  heading-md:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 20px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: -0.2px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  heading-sm:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: -0.15px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  body-lg:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 18px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.1px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  body:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.05px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  body-strong:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: -0.05px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  body-sm:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
    fontFeature: '"calt", "kern", "liga", "ss03"'
  body-sm-strong:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.50
    letterSpacing: 0
    fontFeature: '"calt", "kern", "liga", "ss03"'
  button-md:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 14px
    fontWeight: 500
    lineHeight: 1.20
    letterSpacing: 0
    fontFeature: '"calt", "kern", "liga", "ss03"'
  caption-md:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0.1px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  caption-sm:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0.2px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  eyebrow:
    fontFamily: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.30
    letterSpacing: 0.4px
    fontFeature: '"calt", "kern", "liga", "ss03"'
  mono:
    fontFamily: "JetBrains Mono", "Geist Mono", "SF Mono", monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  none: 0px
  xs: 4px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  xxl: 24px
  pill: 9999px
  full: 9999px

spacing:
  xxs: 2px
  xs: 4px
  sm: 8px
  md: 12px
  lg: 16px
  xl: 24px
  xxl: 32px
  xxxl: 48px
  section: 96px

components:
  # Buttons
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
    padding: 8px 16px
    height: 36px
  button-primary-pressed:
    backgroundColor: "{colors.primary-pressed}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "{colors.on-primary}"
    typography: "{typography.button-md}"
    rounded: "{rounded.pill}"
  button-brand-red:
    backgroundColor: "{colors.brand-red}"
    textColor: "{colors.on-dark}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-secondary:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px
  button-disabled:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ash}"
    typography: "{typography.button-md}"
    rounded: "{rounded.md}"
    padding: 8px 16px
    height: 36px

  # Command Palette & Inputs
  command-palette-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.xl}"
    padding: 0px
  command-palette-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  command-palette-row-active:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm-strong}"
    rounded: "{rounded.sm}"
    padding: 8px 12px
  store-search-bar:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 10px 16px
    height: 44px
  text-input:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.md}"
    padding: 8px 12px
    height: 36px
  text-input-focused:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline-strong}"
    rounded: "{rounded.md}"
    height: 36px

  # Tactile Keycaps (Raycast)
  keycap:
    backgroundColor: "{colors.surface-4}"
    textColor: "{colors.body}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.mono}"
    rounded: "{rounded.xs}"
    padding: 1px 6px
    height: 20px

  # Navigation & Tabs
  pill-tab:
    backgroundColor: "transparent"
    textColor: "{colors.mute}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  pill-tab-active:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm-strong}"
    rounded: "{rounded.pill}"
    padding: 5px 12px
  top-nav:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.hairline}"
    typography: "{typography.body-sm-strong}"
    height: 56px

  # Status & Categorical Badges (Raycast Palette)
  status-badge-neutral:
    backgroundColor: "{colors.surface-3}"
    textColor: "{colors.mute}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  status-badge-blue:
    backgroundColor: "{colors.accent-blue-soft}"
    textColor: "{colors.accent-blue}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  status-badge-green:
    backgroundColor: "{colors.accent-green-soft}"
    textColor: "{colors.accent-green}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  status-badge-yellow:
    backgroundColor: "{colors.accent-yellow-soft}"
    textColor: "{colors.accent-yellow}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.pill}"
    padding: 2px 8px
  status-badge-red:
    backgroundColor: "{colors.accent-red-soft}"
    textColor: "{colors.accent-red}"
    typography: "{typography.caption-sm}"
    rounded: "{rounded.pill}"
    padding: 2px 8px

  # Cards & Panels
  feature-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  feature-card-elevated:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline-strong}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: 24px
  product-screenshot-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.xl}"
    padding: 24px
  pricing-tier-card:
    backgroundColor: "{colors.surface-1}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline}"
    rounded: "{rounded.lg}"
    padding: 24px
  pricing-tier-card-featured:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.ink}"
    border: "1px solid {colors.hairline-strong}"
    rounded: "{rounded.lg}"
    padding: 24px

  # Dense Data Table Rows (Linear Structure + Raycast Surfaces)
  data-table-row:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    borderBottom: "1px solid {colors.hairline}"
    typography: "{typography.body-sm}"
    height: 40px
    padding: 0 16px
  data-table-row-hover:
    backgroundColor: "{colors.surface-2}"
    textColor: "{colors.on-dark}"
    typography: "{typography.body-sm}"
    height: 40px
    padding: 0 16px

  # Hero Accent & Footer
  hero-stripe-band:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.on-dark}"
    typography: "{typography.display-xl}"
    rounded: "{rounded.none}"
    padding: 96px 48px
  footer-section:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.mute}"
    borderTop: "1px solid {colors.hairline}"
    typography: "{typography.caption-md}"
    padding: 64px 48px
---

## Overview

TicketFlow runs on **Raycast's pure color palette**, paired with the structural ergonomics of **Raycast and Linear**, completely abandoning Apple design.

The system is strictly **dark-only**. The canvas sits at Raycast's near-black (`{colors.canvas}` — `#07080a`), framed by hairline 1px borders (`{colors.hairline}` — `#242728`) and a calibrated **four-step surface ladder**:
1. `{colors.canvas}` (`#07080a`): The base viewport floor.
2. `{colors.surface-1}` (`#0d0d0d`): Structural cards, data panels, and base dialog shells.
3. `{colors.surface-2}` (`#101111`): Elevated containers, input fields, and hover planes.
4. `{colors.surface-3}` (`#121212`): Command palette bodies, active rows, and popovers.
5. `{colors.surface-4}` (`#18191a`): Active row highlights, keycap bases, and selected options.

### The Pure Division: Raycast Colors + Raycast & Linear Design

| Dimension | Origin | Implementation in TicketFlow |
|---|---|---|
| **Color Palette** | **100% Raycast** | Canvas `#07080a`, Hairlines `#242728`, 4-step surface ladder, White CTA pill `#ffffff`, Raycast Red `#ff6161`, category accents (`#57c1ff`, `#59d499`, `#ffc533`). No Linear lavender. |
| **Typography Soul** | **Raycast** | Inter with `font-feature-settings: "ss03"` (single-story `g`). |
| **Typographic Scale** | **Linear** | Aggressive negative letter-spacing on display headlines (`-3.0px` down to `-0.6px`). |
| **Interaction Patterns** | **Raycast** | Omnibar command palette, tactile dual-gradient keycaps (`Kbd`), search bars with keyboard glyphs. |
| **Data Density** | **Linear** | Fixed `40px` table rows, high-density POS catalog grids, ticket triage workflows. |
| **Elevation & Depth** | **Raycast & Linear** | Zero drop shadows on chrome; 100% architectural depth via surface ladder + hairline 1px borders. |

---

## Colors (Pure Raycast)

### Canvas & Surface Ladder

- **Canvas (`{colors.canvas}` — `#07080a`):** The foundational viewport floor. Pure near-black, never muddy `#000000` and never blue-tinted.
- **Surface 1 (`{colors.surface-1}` / `{colors.surface}` — `#0d0d0d`):** Primary panel layer for cards, data table containers, and sidebar backdrops.
- **Surface 2 (`{colors.surface-2}` / `{colors.surface-elevated}` — `#101111`):** Secondary interactive elevation for text inputs, search inputs, and hover surfaces.
- **Surface 3 (`{colors.surface-3}` / `{colors.surface-card}` — `#121212`):** Card-level lift for command palette dialogs, popovers, and floating toolbars.
- **Surface 4 (`{colors.surface-4}` / `{colors.surface-active}` — `#18191a`):** Maximum chrome lift for active palette rows, selected table rows, and keycaps.

### Primary Action & Brand Red

- **Universal Primary CTA (`{colors.primary}` — `#ffffff`):** Raycast's iconic white pill button. Paired with `{colors.on-primary}` (`#000000`). Pressed state shifts to `{colors.primary-pressed}` (`#e8e8e8`).
- **Brand Red (`{colors.brand-red}` — `#ff6161`):** Raycast's signature red brand color. Used on brand emblems, live indicators, and urgent system actions. Hover state lightens to `{colors.brand-red-hover}` (`#ff5757`).
- **Hero Stripe Gradient (`{colors.hero-stripe-start}` — `#ff5757` to `{colors.hero-stripe-end}` — `#a1131a`):** Diagonal launch gradient, used once per page maximum.

### Hairlines & Borders

- **Hairline (`{colors.hairline}` — `#242728`):** The standard 1px border across every card, table row, input, and divider.
- **Hairline Soft (`{colors.hairline-soft}` — `rgba(255, 255, 255, 0.08)`): Internal table row dividers and quiet separators.
- **Hairline Strong (`{colors.hairline-strong}` — `rgba(255, 255, 255, 0.16)`): Active popovers and focused container boundaries.

### Text & Ink

- **Ink (`{colors.ink}` — `#f4f4f6`):** Pure high-contrast white-ink for headlines and active values.
- **Body (`{colors.body}` — `#cdcdcd`):** Default reading text and body copy.
- **Mute (`{colors.mute}` — `#9c9c9d`):** Secondary metadata, column labels, table headers, and timestamps.
- **Ash (`{colors.ash}` — `#6a6b6c`):** Disabled items and placeholder text.
- **Stone (`{colors.stone}` — `#434345`):** Structural borders and inactive status icons.

### Categorical & Status Semantics

Saturated colors appear only inside category tags, status chips, and data charts:
- **Accent Blue (`{colors.accent-blue}` — `#57c1ff`):** Info / new tickets. Paired with `{colors.accent-blue-soft}` (`rgba(87, 193, 255, 0.15)`).
- **Accent Green (`{colors.accent-green}` — `#59d499`):** Completed tickets / verified payments. Paired with `{colors.accent-green-soft}` (`rgba(89, 212, 153, 0.15)`).
- **Accent Yellow (`{colors.accent-yellow}` — `#ffc533`):** Pending approvals / warnings. Paired with `{colors.accent-yellow-soft}` (`rgba(255, 197, 51, 0.15)`).
- **Accent Red (`{colors.accent-red}` — `#ff6161`):** Urgent tickets / discrepancies. Paired with `{colors.accent-red-soft}` (`rgba(255, 97, 97, 0.15)`).

---

## Typography

### Font Families & Features

1. **Primary Sans (UI & Display):** `Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
   - **OpenType Setting:** `font-feature-settings: "calt", "kern", "liga", "ss03"` must be enabled site-wide on `body`.
   - **Why `ss03`?** Activates Inter's single-story alternate `g` (Raycast's typographic hallmark).
2. **Monospace (Data & Glyphs):** `"JetBrains Mono", "Geist Mono", "SF Mono", monospace`
   - Used for ticket serial numbers (`#TK-9402`), monetary amounts (`$1,240.00`), barcode strings, timestamps, and keycaps (`⌘K`, `ESC`).

### Typographic Ladder & Metric Tracking

Following Linear's negative tracking formula, display headings are pulled together tightly:

| Token | Size | Weight | Line Height | Letter Spacing | Target Use |
|---|---|---|---|---|---|
| `{typography.display-xl}` | 80px | 600 | 1.05 | -3.0px | Hero display statements |
| `{typography.display-lg}` | 56px | 600 | 1.10 | -1.8px | Large modal titles & dashboard stats |
| `{typography.display-md}` | 40px | 600 | 1.15 | -1.0px | Section headers, drawer totals |
| `{typography.headline}` | 28px | 600 | 1.20 | -0.6px | View headers, POS terminal totals |
| `{typography.heading-xl}` | 24px | 500 | 1.30 | -0.4px | Card headers, table group headers |
| `{typography.heading-lg}` | 22px | 500 | 1.25 | -0.3px | Panel headers, modal dialog titles |
| `{typography.heading-md}` | 20px | 500 | 1.40 | -0.2px | Sub-section titles |
| `{typography.heading-sm}` | 18px | 500 | 1.40 | -0.15px | Compact card titles |
| `{typography.body-lg}` | 18px | 400 | 1.50 | -0.1px | Large body text, introductory remarks |
| `{typography.body}` | 16px | 400 | 1.50 | -0.05px | Default body copy, descriptions |
| `{typography.body-strong}` | 16px | 500 | 1.40 | -0.05px | Strong body copy, active cell labels |
| `{typography.body-sm}` | 14px | 400 | 1.50 | 0 | Standard UI text, table cell values |
| `{typography.body-sm-strong}`| 14px | 500 | 1.50 | 0 | Emphasized table cell labels |
| `{typography.button-md}` | 14px | 500 | 1.20 | 0 | Button labels, command row text |
| `{typography.caption-md}` | 13px | 400 | 1.40 | +0.1px | Secondary captions, timestamps |
| `{typography.caption-sm}` | 12px | 400 | 1.40 | +0.2px | Status tags, badge text |
| `{typography.eyebrow}` | 12px | 500 | 1.30 | +0.4px | Uppercase section taxonomy labels |
| `{typography.mono}` | 13px | 400 | 1.50 | 0 | Ticket IDs, currency, keycap glyphs |

---

## Layout, Density & Elevation

- **Section Rhythm:** `{spacing.section}` (`96px`).
- **Dense Data Rows:** Table rows run at fixed `40px` height with `0 16px` padding.
- **Zero Drop Shadow Rule:** No drop shadows on chrome elements. Depth is achieved strictly through:
  1. The 4-step surface ladder (`#07080a` → `#0d0d0d` → `#101111` → `#121212` → `#18191a`).
  2. 1px hairline borders (`#242728`).
  3. Backdrop blur (`backdrop-filter: blur(12px)`) on floating sheets or sticky headers.

---

## Shapes & Geometry

- `{rounded.xs}` (4px): Keycaps (`Kbd`), status indicator dots.
- `{rounded.sm}` (6px): Command palette list items, dropdown menu items, dense table rows.
- `{rounded.md}` (8px): Standard buttons, text inputs, select triggers.
- `{rounded.lg}` (12px): Feature cards, pricing cards, modal dialogs, POS checkout panels.
- `{rounded.xl}` (16px): Command palette omnibar dialog, drawer sheets.
- `{rounded.pill}` (9999px): Primary white CTA buttons, status badges, filter tabs, avatar circles.

---

## Components

### Buttons
- **`button-primary`:** Raycast universal high-contrast anchor.
  - Background: `{colors.primary}` (`#ffffff`)
  - Text: `{colors.on-primary}` (`#000000`)
  - Typography: `{typography.button-md}` (14px / 500)
  - Rounded: `{rounded.pill}` (9999px)
  - Height: `36px` | Padding: `8px 16px`
  - Active: `{colors.primary-pressed}` (`#e8e8e8`)
- **`button-brand-red`:** Raycast signature brand action.
  - Background: `{colors.brand-red}` (`#ff6161`)
  - Text: `#ffffff`
  - Rounded: `{rounded.md}` (8px)
  - Height: `36px` | Padding: `8px 16px`
  - Hover: `{colors.brand-red-hover}` (`#ff5757`)
- **`button-secondary`:** Hairline-bordered dark button.
  - Background: `{colors.surface-1}` (`#0d0d0d`)
  - Border: 1px solid `{colors.hairline}` (`#242728`)
  - Text: `{colors.ink}` (`#f4f4f6`)
  - Rounded: `{rounded.md}` (8px)
- **`button-tertiary`:** Ghost button.
  - Background: `transparent`
  - Text: `{colors.mute}` (`#9c9c9d`)
  - Rounded: `{rounded.md}` (8px)

### Command Palette & Inputs
- **`command-palette-card`:** Raycast omnibar dialog.
  - Background: `{colors.surface-1}` (`#0d0d0d`)
  - Border: 1px solid `{colors.hairline}` (`#242728`)
  - Rounded: `{rounded.xl}` (16px)
- **`command-palette-row`:** Palette list item.
  - Background: `transparent`
  - Rounded: `{rounded.sm}` (6px)
  - Active: Background `{colors.surface-3}` (`#121212`), text `{colors.on-dark}`
- **`text-input`:**
  - Background: `{colors.surface-2}` (`#101111`)
  - Border: 1px solid `{colors.hairline}` (`#242728`)
  - Text: `{colors.ink}` (`#f4f4f6`)
  - Rounded: `{rounded.md}` (8px)
  - Height: `36px` | Padding: `8px 12px`
  - Focused: Border `{colors.hairline-strong}` (`rgba(255,255,255,0.16)`), ring `2px rgba(255,255,255,0.2)`

### Keyboard Glyphs (`Kbd`)
- **`keycap`:** Tactile Raycast keyboard shortcut chip.
  - Background: Linear gradient from `{colors.key-bg-start}` (`#121212`) to `{colors.key-bg-end}` (`#0d0d0d`)
  - Border: 1px solid `{colors.hairline}` (`#242728`)
  - Text: `{colors.body}` (`#cdcdcd`)
  - Typography: `{typography.mono}` (13px / 400)
  - Rounded: `{rounded.xs}` (4px)
  - Height: `20px` | Padding: `1px 6px`

### Status Badges
- **`status-badge-neutral`:** Background `{colors.surface-3}`, text `{colors.mute}`, rounded `{rounded.pill}`.
- **`status-badge-blue`:** Background `{colors.accent-blue-soft}`, text `{colors.accent-blue}` (`#57c1ff`).
- **`status-badge-green`:** Background `{colors.accent-green-soft}`, text `{colors.accent-green}` (`#59d499`).
- **`status-badge-yellow`:** Background `{colors.accent-yellow-soft}`, text `{colors.accent-yellow}` (`#ffc533`).
- **`status-badge-red`:** Background `{colors.accent-red-soft}`, text `{colors.accent-red}` (`#ff6161`).

---

## Do's and Don'ts

### Do
- Use the **Raycast near-black color ladder** (`#07080a` → `#0d0d0d` → `#101111` → `#121212` → `#18191a`).
- Use the **white CTA pill** (`#ffffff` with `#000000` text) as the universal primary action.
- Use **Raycast Red** (`#ff6161`) as the brand accent.
- Enable `font-feature-settings: "calt", "kern", "liga", "ss03"` site-wide on `Inter` to render the iconic single-story `g`.
- Apply **Linear negative letter-spacing** on display headings (`-3.0px` at 80px down to `-0.6px` at 28px).
- Use **1px hairline borders** (`#242728`) for defining card, input, and table bounds.
- Use **monospace type** (`JetBrains Mono` / `Geist Mono`) for ticket IDs, prices, codes, and timestamps.
- Use **dense 40px table rows** for high-volume POS and ticket management.

### Don't
- **Never use Linear lavender-blue (#5e6ad2)**. The color palette belongs strictly to Raycast.
- **Never use light mode or parchment backgrounds**.
- **Never add drop shadows to chrome** (no `box-shadow` on cards or buttons). Depth is purely architectural.
- **Never use pure `#000000` true black for the canvas** (use `#07080a`).
- **Never use saturated chromatic colors for main buttons or large card backgrounds**. Saturated colors are exclusively for status chips, tags, and category tiles.
- **Never use legacy `space-y-*` or `space-x-*` utilities**. Use `flex` / `grid` with `gap-*`.
- **Never use Apple 17px body copy or SF Pro**.
