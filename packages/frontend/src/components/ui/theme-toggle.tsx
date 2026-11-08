import { MoonStar, Sun } from "lucide-react";
import { useTheme } from "../../lib/theme-context.tsx";
import { Button } from "./button.tsx";

export function ModeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon-xs"
      className="size-7 text-muted-foreground hover:text-foreground relative rounded-lg"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      title="Alternar tema claro / oscuro"
    >
      <MoonStar className="size-3.5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Sun className="absolute size-3.5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
