---
target: /corte-caja
total_score: 21
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 2
target_identity: "file:C:\\Users\\dualipin\\Projects\\ticketflow\\packages\\frontend\\src\\components\\corte-caja\\CorteCajaView.tsx"
target_fingerprint: "sha256:4d5c89774163e15468910d2f3c68579ee54975cb2fbb3ecd1931aeaf72cac66b"
target_path: "C:\\Users\\dualipin\\Projects\\ticketflow\\packages\\frontend\\src\\components\\corte-caja\\CorteCajaView.tsx"
timestamp: 2026-11-08T22-23-03Z
slug: c-components-corte-caja-cortecajaview-tsx-db532996
---
# Critique Snapshot: /corte-caja (CorteCajaView.tsx)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|---|:---:|---|
| 1 | Visibility of System Status | 3/4 | Open shift state and expected balances are clear, but multi-terminal live activity is invisible. |
| 2 | Match System / Real World | 1.5/4 | Cashiers count money trays by physical bill/coin denominations, not a single lump-sum scalar. Lacks standard POS concepts (Arqueo Ciego, Corte X, Retiros/Sangrías). |
| 3 | User Control and Freedom | 1.5/4 | Irreversible closure with zero confirmation or back-out step; no interim audit (Corte X). |
| 4 | Consistency and Standards | 2.5/4 | Violates design system rules: buttons use `rounded-full`, numbers miss `<NumberFlow>`, raw HTML table used without primitives. |
| 5 | Error Prevention | 1/4 | Single-click permanent shift closure with no guardrails on severe cash deficit or keystroke typo. |
| 6 | Recognition Rather Than Recall | 3/4 | Core totals, arithmetic chain, and transaction counters are directly visible. |
| 7 | Flexibility and Efficiency | 1.5/4 | No numpad quick-entry workflow, no denomination multipliers, no thermal print shortcuts. |
| 8 | Aesthetic and Minimalist Design | 3.5/4 | Crisp layout, clean 1px hairline borders, good spatial organization and card elevation. |
| 9 | Error Recovery | 2/4 | Clear labeling of deficit vs. surplus, but zero diagnostic paths to resolve discrepancies. |
| 10 | Help and Documentation | 1/4 | No inline tolerance guidance or explanation of petty cash / discrepancy policies. |
| **Total** | | **21/40** | **Acceptable (Significant UX improvements needed)** |

---

## Design Specificity Verdict

- **LLM Assessment**: The screen presents clean visual aesthetics, but functions as a 60% generic SaaS form / 40% operational POS tool. Cash counting in retail/workshop environments is an ergonomic, tactile physical process (counting bills and coins) rather than a single abstract number input.
- **Deterministic Scan**: 11 violations flagged by `impeccable detect` (`design-system-font-size`). All 11 are verified true positives where arbitrary `text-[10px]` and `text-[11px]` circumvent the documented type ramp.
- **Visual Overlays**: Headless CLI verification completed; live browser injection skipped.

---

## Overall Impression
Visually tidy and legible, but functionally fragile for high-stakes cash handling. It provides good real-time balance calculations, but exposes the operator to severe anxiety by allowing instantaneous, unconfirmed shift closures and forcing mental/external arithmetic for bill counts.

---

## What's Working
1. **Arithmetic Formula Clarity**: The 4-card telemetry (`Fondo Inicial` + `Ventas PdV` + `Pagos Taller` = `Efectivo Esperado`) effectively unifies retail POS and workshop repair deposits.
2. **Instant Discrepancy Reactive Feedback**: Dynamic status badge updating in real-time with semantic indicators (`Cuadre Exacto`, `Sobrante en Caja`, `Faltante en Caja`).
3. **Clean Visual Hierarchy**: Polished OKLCH surface styling and subtle 1px border contrast adhering to TicketFlow's design language.

---

## Priority Issues

- **[P0] Irreversible Closure with Zero Confirmation on Discrepancy**
  - **Why it matters**: A single accidental click permanently locks a shift even with severe deficits (-$1,500), risking immediate disciplinary or financial penalties for the clerk.
  - **Fix**: Introduce a modal guardrail confirming closure, with elevated warning states and required acknowledgment if `diferencia !== 0`.
  - **Suggested command**: `$impeccable harden`

- **[P1] Missing Cash Denomination Tray (Arqueo por Billetes y Monedas)**
  - **Why it matters**: Forces cashiers to count bills and coins on phone calculators or scrap paper before typing a scalar number, causing math errors and slow handoffs.
  - **Fix**: Add a toggleable Denomination Breakdown Tray ($1000, $500, $200, $100, $50, $20, coins) that auto-sums into the counted total.
  - **Suggested command**: `$impeccable shape`

- **[P1] Missing Printable Corte Z / Thermal Receipt Slip**
  - **Why it matters**: Cash shifts require physical signed accountability slips placed in the cash deposit envelope for the shop manager or accountant.
  - **Fix**: Show a post-cierre modal with an "Imprimir Ticket de Corte Z" action formatted for 80mm/58mm thermal printers and PDF export.
  - **Suggested command**: `$impeccable polish`

- **[P2] Missing Non-Cash Reconciliation & Petty Cash Drops (Gastos/Sangrías)**
  - **Why it matters**: Omits card terminal voucher totals, electronic transfers, and cash drawer withdrawals for workshop supplies.
  - **Fix**: Add a secondary panel for bank terminal batch reconciliation and petty cash expense logging.
  - **Suggested command**: `$impeccable shape`

- **[P3] Design System Violations (Font Sizes, Button Radius, & NumberFlow)**
  - **Why it matters**: Sub-12px text (`text-[10px]`, `text-[11px]`) violates the type ramp and WCAG legibility; buttons use non-standard `rounded-full`; currency figures omit `<NumberFlow>`.
  - **Fix**: Normalize font sizes to `text-xs`, adopt canonical button styles, and wrap currency transitions with `<NumberFlow>`.
  - **Suggested command**: `$impeccable distill`

---

## Persona Red Flags
- **Alex (Rapid Cashier / Power User)**: Shift handoff takes 5+ minutes because Alex must count all bills and coins on a phone calculator and cannot navigate the form via keyboard numpad shortcuts.
- **Jordan (First-Timer Store Clerk)**: Enters an accidental typo, clicks "Cerrar Turno", and permanently locks the shift with a recorded cash deficit with no way to back out or re-count.
- **Elena (Strict Store Owner / Auditor)**: Reviews the history log but cannot click any row to inspect sales itemization, operator notes, or print a signed fiscal receipt.

---

## Minor Observations
- `AbrirCajaModal.tsx` pre-fills "$500" and "Apertura de turno", which invites uncritical rubber-stamping of opening floats.
- History table lacks pagination or date filtering, which will cause rendering bloat over time.
- Monetary figures lack standard Mexican locale thousand separators (`$12,450.00` vs `$12450.00`).

---

## Questions to Consider
1. Should the cash drawer count be an "Arqueo Ciego" (where expected cash is hidden until after the physical count is entered) to prevent cashier anchoring?
2. What is the business tolerance threshold before manager approval is mandatory for a cash shortage?
3. How should thermal receipt printing be integrated with physical cash drawer kick-out triggers?
