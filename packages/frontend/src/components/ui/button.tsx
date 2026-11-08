import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center border border-transparent bg-clip-padding text-xs font-medium whitespace-nowrap transition-colors duration-150 outline-none select-none focus-visible:outline-2 focus-visible:outline-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:pointer-events-none disabled:opacity-40 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary-hover active:bg-primary-pressed rounded-full",
        brand:
          "bg-[#ff6161] text-white hover:bg-[#ff5757] active:bg-[#a1131a] rounded-lg",
        outline:
          "border-border bg-card text-foreground hover:bg-secondary hover:text-foreground rounded-lg",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-card border border-border rounded-lg",
        ghost:
          "hover:bg-secondary hover:text-foreground aria-expanded:bg-secondary aria-expanded:text-foreground text-muted-foreground rounded-lg",
        destructive:
          "bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/20 rounded-lg focus-visible:ring-destructive/30",
        link: "text-[#57c1ff] underline-offset-4 hover:underline",
        "pill-secondary":
          "border-border bg-secondary text-foreground hover:bg-card rounded-full",
        "dark-utility":
          "bg-secondary text-foreground hover:bg-card border border-border rounded-lg",
        pearl:
          "bg-secondary text-foreground border border-border rounded-lg hover:bg-card",
      },
      size: {
        default:
          "h-8 gap-1.5 px-3.5 text-xs has-data-[icon=inline-end]:pr-2.5 has-data-[icon=inline-start]:pl-2.5 [&_svg:not([class*='size-'])]:size-3.5",
        xs: "h-6 gap-1 px-2.5 text-[11px] has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1.5 px-3 text-xs has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2 [&_svg:not([class*='size-'])]:size-3",
        lg: "h-9.5 gap-2 px-4.5 text-sm has-data-[icon=inline-end]:pr-3.5 has-data-[icon=inline-start]:pl-3.5 [&_svg:not([class*='size-'])]:size-4",
        "store-hero":
          "h-10 gap-2.5 px-6 text-sm font-medium has-data-[icon=inline-end]:pr-4 has-data-[icon=inline-start]:pl-4 [&_svg:not([class*='size-'])]:size-4",
        icon: "size-8 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-xs": "size-6 [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-7 [&_svg:not([class*='size-'])]:size-3",
        "icon-lg": "size-9 [&_svg:not([class*='size-'])]:size-4",
        "icon-circular": "size-9 bg-secondary text-foreground hover:bg-card border border-border rounded-full [&_svg:not([class*='size-'])]:size-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
