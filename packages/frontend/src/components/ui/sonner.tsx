import { Toaster as Sonner, toast } from "sonner"
import { useTheme } from "../../lib/theme-context.tsx"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme()
  return (
    <Sonner
      theme={theme}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-card/95 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-none group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:text-xs font-sans",
          description: "group-[.toast]:text-muted-foreground group-[.toast]:text-xs",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground group-[.toast]:rounded-full group-[.toast]:px-3.5 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium",
          cancelButton:
            "group-[.toast]:bg-secondary group-[.toast]:text-muted-foreground group-[.toast]:rounded-lg group-[.toast]:border group-[.toast]:border-border group-[.toast]:px-3.5 group-[.toast]:py-1.5 group-[.toast]:text-xs group-[.toast]:font-medium",
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
