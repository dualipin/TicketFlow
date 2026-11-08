# button

2026-11-07, golden pair via CLI (shadcn add button --overwrite), pristine stock replacement with `@base-ui/react/button`.

## Changed

- `packages/frontend/src/components/ui/button.tsx`: Replaced Radix `Slot` (`asChild` pattern) with `@base-ui/react/button`'s native `<ButtonPrimitive>` component supporting the `render` prop.
  - Leftover scan: clean (`grep -n "radix-ui\|@radix-ui" packages/frontend/src/components/ui/button.tsx` returned 0 matches).

## Left alone

- None. `button` is the only UI component present in `packages/frontend/src/components/ui`.

## Behavior changes

- None. Base UI Button supports `render` prop in place of Radix `asChild`. Default click, disabled states, and styling remain identical.

## Verify by hand

- Click button: Verify active/pressed state works as expected.
- Disabled state: Confirm disabled button receives opacity styles and ignores clicks.
- Polymorphism: Test passing `render={<a href="#" />}` if used as a link wrapper.
