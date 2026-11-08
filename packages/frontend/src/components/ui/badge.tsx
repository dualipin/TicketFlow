import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const badgeVariants = cva(
  "group/badge inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 overflow-hidden rounded-full border border-transparent px-2.5 py-0.5 text-[0.6875rem] font-medium whitespace-nowrap transition-all focus-visible:border-ring focus-visible:ring-[2px] focus-visible:ring-ring/50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-invalid:border-destructive aria-invalid:ring-destructive/20 [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-muted-foreground border border-border [a]:hover:bg-card",
        destructive:
          "bg-destructive/15 text-destructive border border-destructive/25 focus-visible:ring-destructive/20 [a]:hover:bg-destructive/25",
        outline:
          "border-border bg-card text-foreground [a]:hover:bg-secondary",
        ghost:
          "hover:bg-secondary hover:text-foreground text-muted-foreground",
        link: "text-[#57c1ff] underline-offset-4 hover:underline",
        blue: "bg-[#57c1ff]/15 text-[#57c1ff] border border-[#57c1ff]/25",
        green: "bg-[#59d499]/15 text-[#59d499] border border-[#59d499]/25",
        yellow: "bg-[#ffc533]/15 text-[#ffc533] border border-[#ffc533]/25",
        red: "bg-[#ff6161]/15 text-[#ff6161] border border-[#ff6161]/25",
        brand: "bg-[#ff6161]/15 text-[#ff6161] border border-[#ff6161]/25",
        pearl: "bg-secondary text-foreground border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
