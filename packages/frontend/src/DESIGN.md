---
version: 2.0
name: TicketFlow (Modern Shadcn Dashboard × OKLCH Dual-Theme & Operational Craft)
website: "https://ticketflow.dev"
description: A modern, high-density POS and workshop management system built on standard free shadcn/ui and Base UI primitives. Features a collapsible inset sidebar layout, a unified contextual header, responsive KPI metric cards with container queries, and a pristine OKLCH neutral palette supporting both Dark and Light themes with instant toggle.

seo:
  title: "TicketFlow Design System — Modern Shadcn Inset Dashboard with OKLCH Dual Theme"
  metaDescription: "A developer-grade operational design system built with standard shadcn/ui, Base UI, collapsible inset sidebar navigation, container queries, and an OKLCH neutral palette for dark and light modes."
  highlights:
    - "Standard free shadcn/ui + Base UI accessible architecture — zero external paid registries"
    - "Collapsible Inset Sidebar navigation (`variant='inset'`) with `Ctrl+B` toggle, active badges, and mobile drawer"
    - "Dual-Theme OKLCH color system — seamless Light and Dark modes with clean neutral surfaces and 1px hairline borders"
    - "KPI Metric Cards (`SectionCards`) powered by container queries (`@container/main`, `@container/card`) and dynamic elevation gradients"
    - "Inter typography site-wide with mechanical letter-spacing and monospace precision for serials, prices, and barcodes"
    - "Contextual SiteHeader with live cash shift balance (`NumberFlow`), fast shortcuts, and theme switcher (`ModeToggle`)"
  tags:
    - "Developer Tools & SaaS"
    - "POS & Retail Operations"
    - "Repair Workshop Management"
    - "Shadcn UI & Base UI"
  lastUpdated: "2026-11-08"
  author:
    name: "TicketFlow Engineering & Design"
    url: "https://ticketflow.dev"
  opening: |
    TicketFlow is an operational desktop and mobile system engineered for fast retail point-of-sale and repair workshop management. Built on standard free shadcn/ui and Base UI components, it marries the mechanical density and tactile clarity of modern developer tools with the fluid responsiveness of modern SaaS dashboard design.

    The architecture centers on a collapsible inset sidebar (`variant="inset"`), a floating work canvas with 1px border contrast, and a unified top header that keeps live cash shift balances and operator identity always visible. The theme is built on standard OKLCH neutral color ladders, providing high-contrast readability in both Dark and Light modes.

  questions:
    - id: "dashboard-architecture"
      title: "What is TicketFlow's dashboard layout structure?"
      answer: "TicketFlow uses the standard shadcn collapsible inset sidebar pattern. The layout consists of `SidebarProvider` with CSS variables `--sidebar-width: 16.5rem` and `--header-height: 3.5rem`, `AppSidebar` with `collapsible='icon'` and `variant='inset'`, and `SidebarInset` containing the sticky `SiteHeader` and a container-query-enabled main viewport (`@container/main`). On screens below 768px, the sidebar automatically transforms into an accessible touch-friendly Sheet drawer."
    - id: "theming-and-colors"
      title: "How does the theming and dark/light mode work?"
      answer: "The theme system is 100% standard CSS variables using OKLCH neutral scales (`--base-50` through `--base-1000`). It supports Dark mode (deep `oklch(0.145 0 0)` canvas with `oklch(0.205 0 0)` cards and 10% alpha borders) and Light mode (crisp `oklch(1 0 0)` canvas with `oklch(0.922 0 0)` borders). Users can toggle between Dark, Light, and System preference via the `ModeToggle` in the header."
    - id: "components-and-dependencies"
      title: "What component library powers TicketFlow?"
      answer: "TicketFlow uses 100% free, standard open-source shadcn/ui built on `@base-ui/react` primitives (base-mira style). There are zero dependencies on paid kits or closed registries. All dashboard components (`AppSidebar`, `SiteHeader`, `SectionCards`, `sidebar.tsx`) are local, customizable code in the repository."
    - id: "typography"
      title: "What typography does TicketFlow use?"
      answer: "Inter Variable is the primary sans-serif font across UI and display headings with tight tracking (`-0.25px` body, down to `-1.0px` on headlines). Monospace type (JetBrains Mono / Geist Mono) is strictly reserved for ticket folios (`#TK-1001`), barcodes, monetary figures, and keyboard shortcuts."

colors:
  # Base Neutral Scale (OKLCH)
  base-50: "oklch(0.96 0 0)"
  base-100: "oklch(0.967 0.0027 286.38)"
  base-200: "oklch(0.92 0.0053 286.32)"
  base-300: "oklch(0.871 0.008 286.29)"
  base-400: "oklch(0.705 0.012 286.07)"
  base-500: "oklch(0.552 0.016 285.94)"
  base-600: "oklch(0.5 0.01 286.04)"
  base-700: "oklch(0.37 0.012 285.81)"
  base-800: "oklch(0.274 0.008 286.03)"
  base-900: "oklch(0.21 0.0053 285.89)"
  base-950: "oklch(0.141 0.004 285.83)"
  base-1000: "oklch(0.096 0.0027 285.79)"

  # Light Mode Tokens
  light:
    background: "oklch(1 0 0)"
    foreground: "oklch(0.145 0 0)"
    card: "oklch(1 0 0)"
    card-foreground: "oklch(0.145 0 0)"
    popover: "oklch(1 0 0)"
    popover-foreground: "oklch(0.145 0 0)"
    primary: "oklch(0.205 0 0)"
    primary-foreground: "oklch(0.985 0 0)"
    secondary: "oklch(0.97 0 0)"
    secondary-foreground: "oklch(0.205 0 0)"
    muted: "oklch(0.97 0 0)"
    muted-foreground: "oklch(0.556 0 0)"
    accent: "oklch(0.97 0 0)"
    accent-foreground: "oklch(0.205 0 0)"
    border: "oklch(0.922 0 0)"
    input: "oklch(0.922 0 0)"
    sidebar: "oklch(0.985 0 0)"
    sidebar-border: "oklch(0.922 0 0)"

  # Dark Mode Tokens
  dark:
    background: "oklch(0.145 0 0)"
    foreground: "oklch(0.985 0 0)"
    card: "oklch(0.205 0 0)"
    card-foreground: "oklch(0.985 0 0)"
    popover: "oklch(0.205 0 0)"
    popover-foreground: "oklch(0.985 0 0)"
    primary: "oklch(0.922 0 0)"
    primary-foreground: "oklch(0.205 0 0)"
    secondary: "oklch(0.269 0 0)"
    secondary-foreground: "oklch(0.985 0 0)"
    muted: "oklch(0.269 0 0)"
    muted-foreground: "oklch(0.708 0 0)"
    accent: "oklch(0.269 0 0)"
    accent-foreground: "oklch(0.985 0 0)"
    border: "oklch(1 0 0 / 10%)"
    input: "oklch(1 0 0 / 15%)"
    sidebar: "oklch(0.205 0 0)"
    sidebar-border: "oklch(1 0 0 / 10%)"

  # Brand & Status Accents
  brand-red: "#ff6161"
  status-success: "#59d499"
  status-warning: "#ffc533"
  status-danger: "#ff6161"
  status-info: "#57c1ff"

typography:
  headline:
    fontFamily: Inter Variable, -apple-system, sans-serif
    fontSize: 28px
    fontWeight: 600
    lineHeight: 1.20
    letterSpacing: -0.6px
  heading-xl:
    fontFamily: Inter Variable, -apple-system, sans-serif
    fontSize: 24px
    fontWeight: 600
    lineHeight: 1.30
    letterSpacing: -0.4px
  heading-lg:
    fontFamily: Inter Variable, -apple-system, sans-serif
    fontSize: 20px
    fontWeight: 600
    lineHeight: 1.35
    letterSpacing: -0.3px
  heading-md:
    fontFamily: Inter Variable, -apple-system, sans-serif
    fontSize: 18px
    fontWeight: 500
    lineHeight: 1.40
    letterSpacing: -0.2px
  body:
    fontFamily: Inter Variable, -apple-system, sans-serif
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: -0.25px
  body-sm:
    fontFamily: Inter Variable, -apple-system, sans-serif
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0
  caption:
    fontFamily: Inter Variable, -apple-system, sans-serif
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.40
    letterSpacing: 0.1px
  mono:
    fontFamily: "JetBrains Mono", "Geist Mono", monospace
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.50
    letterSpacing: 0

rounded:
  sm: "calc(var(--radius) - 4px)"
  md: "calc(var(--radius) - 2px)"
  lg: "var(--radius)" # 0.45rem (7.2px)
  xl: "calc(var(--radius) + 4px)"
  "2xl": "calc(var(--radius) + 8px)"
  "3xl": "calc(var(--radius) + 12px)"
  "4xl": "calc(var(--radius) + 16px)"
  pill: "9999px"

---

# TicketFlow Design System Guide

## 1. Dashboard Layout Architecture

TicketFlow employs a modern collapsible inset layout structured in four cooperating layers:

```mermaid
flowchart TD
    SP["SidebarProvider (--sidebar-width: 16.5rem, --header-height: 3.5rem)"]
    AS["AppSidebar (variant='inset', collapsible='icon')"]
    SI["SidebarInset (Floating workspace canvas)"]
    SH["SiteHeader (Sticky h-14, SidebarTrigger, Title, Turno Widget, ModeToggle)"]
    MC["Main Canvas (@container/main p-4 lg:p-6 max-w-7xl)"]
    SC["SectionCards (KPI Metric Cards Grid)"]
    OUT["Outlet (Taller, POS Terminal, Historial, Corte de Caja)"]

    SP --> AS
    SP --> SI
    SI --> SH
    SI --> MC
    MC --> SC
    MC --> OUT
```

### 1.1 AppSidebar (`packages/frontend/src/components/layout/AppSidebar.tsx`)
- **Header:** Brand mark with icon container, "TicketFlow" title, and version badge.
- **Operaciones:** Core modules (`/taller`, `/pos`, `/pos/historial`, `/corte-caja`) with active state indicators and live counts (e.g. active tickets badge).
- **Acciones Rápidas:** Direct action triggers for "Nuevo Ticket" and "Abrir Turno / Arqueo".
- **Footer:** Operator card with user avatar, name, role badge, and quick screen lock action.
- **SidebarRail:** Interactive edge rail allowing click/drag collapse, paired with the universal `Ctrl+B` / `Cmd+B` keyboard shortcut.
- **Mobile Sheet:** Automatically renders as an off-canvas drawer on viewport widths below `768px`.

### 1.2 SiteHeader (`packages/frontend/src/components/layout/SiteHeader.tsx`)
- **Left Cluster:** `SidebarTrigger` toggle button, vertical separator, and active route title with module icon.
- **Right Cluster:**
  - **Live Cash Drawer Pill:** Real-time shift indicator with green checkmark, Shift ID, and animated currency calculation via `<NumberFlow />`.
  - **ModeToggle:** Instant theme cycling between Dark, Light, and System modes.
  - **User Lock Action:** One-click screen lock for operator handoff.

---

## 2. KPI Metric Cards (`SectionCards`)

Located at [`packages/frontend/src/components/layout/SectionCards.tsx`](file:///c:/Users/dualipin/Projects/ticketflow/packages/frontend/src/components/layout/SectionCards.tsx), this component sets the visual standard for data overview:

- **Grid Hierarchy:**
  ```css
  *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4
  ```
- **Container Queries:** Each card is marked `@container/card`, allowing typography to scale smoothly (`tabular-nums text-2xl @[250px]/card:text-3xl`).
- **Core Metrics:**
  1. **Taller Activo:** Total repair orders in diagnosis or service.
  2. **Listos para Entrega:** Completed repairs awaiting customer pickup and settlement.
  3. **Ventas del Turno:** Live total sales processed in the current shift.
  4. **Efectivo en Caja:** Real-time theoretical cash balance in the register.

---

## 3. Theming & Color Discipline

TicketFlow utilizes a dual-mode OKLCH neutral color foundation:

### 3.1 Dark Mode (Default)
- **Canvas (`--background`):** Deep near-black `oklch(0.145 0 0)`.
- **Surfaces (`--card`, `--popover`, `--sidebar`):** Elevated dark gray `oklch(0.205 0 0)`.
- **Borders (`--border`, `--input`):** 1px subtle hairline `oklch(1 0 0 / 10%)`.
- **Typography (`--foreground`):** High-contrast white `oklch(0.985 0 0)`.

### 3.2 Light Mode
- **Canvas (`--background`):** Clean white `oklch(1 0 0)`.
- **Surfaces (`--card`, `--popover`):** Crisp white `oklch(1 0 0)` with light sidebar `oklch(0.985 0 0)`.
- **Borders (`--border`, `--input`):** Defined neutral `oklch(0.922 0 0)`.
- **Typography (`--foreground`):** Deep neutral `oklch(0.145 0 0)`.

### 3.3 Semantic Accents
Saturated chromatic colors are strictly reserved for data visualization and status tags:
- **Success (`#59d499`):** Ready tickets, positive cash balance, cash sales.
- **Warning (`#ffc533`):** Unopened shifts, diagnostic pending, partial deposits.
- **Danger (`#ff6161`):** Cancelled tickets, cash discrepancies, destructive actions.
- **Info (`#57c1ff`):** Card / transfer transactions, customer metadata.

---

## 4. Components & Interactive States

### Buttons ([`button.tsx`](file:///c:/Users/dualipin/Projects/ticketflow/packages/frontend/src/components/ui/button.tsx))
- Built on `@base-ui/react/button` with `class-variance-authority`.
- Standard sizes: `h-8` (default), `h-7` (sm), `h-6` (xs), `h-9.5` (lg).
- Variants: `default` (high-contrast pill), `outline` (border-border), `ghost`, `secondary`, `destructive`.
- Focus ring: `focus-visible:ring-2 focus-visible:ring-ring/30`.

### Cards ([`card.tsx`](file:///c:/Users/dualipin/Projects/ticketflow/packages/frontend/src/components/ui/card.tsx))
- Structure: `Card` -> `CardHeader` -> `CardTitle` + `CardAction` + `CardDescription` -> `CardContent` -> `CardFooter`.
- Radius: `rounded-xl` with `ring-1 ring-border/50` or `border border-border`.

### Badges ([`badge.tsx`](file:///c:/Users/dualipin/Projects/ticketflow/packages/frontend/src/components/ui/badge.tsx))
- Compact pill shape (`rounded-3xl` / `rounded-full`), `h-5` or `h-5.5`, with semantic outline or soft tinted backgrounds.

---

## 5. Do's and Don'ts

### Do
- Use **semantic color tokens** (`bg-background`, `bg-card`, `text-foreground`, `border-border`) so components adapt automatically to both Light and Dark themes.
- Wrap numerical figures and currency with `<NumberFlow />` for smooth, mechanical digit transitions.
- Use **container query classes** (`@container/main`, `@container/card`) for cards and layout blocks that must adapt to sidebar expansion.
- Import icons exclusively from `lucide-react` using `data-icon="inline-start"` or `data-icon="inline-end"` inside buttons.
- Use `flex` / `grid` with `gap-*` for all spatial layout.
- Maintain `16px` base root font size (`1rem = 16px`).

### Don't
- **Never add paid third-party registries to `components.json`**. TicketFlow is 100% free and uses standard open-source shadcn/ui.
- **Never hardcode dark-only background colors** like `#07080a` or `#0d0d0d` in component classes; use `bg-background` and `bg-card`.
- **Never use legacy `space-y-*` or `space-x-*` utilities**; use `flex flex-col gap-*`.
- **Never use arbitrary width/height for square icons**; use `size-*` (`size-3.5`, `size-4`, `size-5`).
- **Never disable the sidebar collapsible behavior** on desktop; allow users to toggle it with `Ctrl+B`.
