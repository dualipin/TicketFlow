import React from 'react';
import { NavLink, useLocation } from 'react-router';
import NumberFlow from '@number-flow/react';
import { useAuth } from '../../lib/auth-context.tsx';
import { useTheme } from '../../lib/theme-context.tsx';
import { usePwaInstall } from '../../hooks/usePwaInstall.ts';
import { useCorteActivo } from '../../queries/corte-caja/queries.ts';
import { SidebarTrigger } from '../ui/sidebar.tsx';
import { Separator } from '../ui/separator.tsx';
import { Button } from '../ui/button.tsx';
import {
  CheckCircle2,
  AlertCircle,
  Lock,
  Wrench,
  Store,
  Receipt,
  Coins,
  Sun,
  Moon,
  Monitor,
  Download,
} from 'lucide-react';

interface SiteHeaderProps {
  onOpenAbrirCaja?: () => void;
}

const titles: Record<
  string,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  '/taller': {
    title: 'Taller & Órdenes',
    subtitle: 'Cola técnica y diagnóstico',
    icon: Wrench,
  },
  '/pos': {
    title: 'Punto de Venta',
    subtitle: 'Terminal de mostrador y cobro',
    icon: Store,
  },
  '/pos/historial': {
    title: 'Historial de Ventas',
    subtitle: 'Auditoría de tickets y transacciones',
    icon: Receipt,
  },
  '/corte-caja': {
    title: 'Corte de Caja',
    subtitle: 'Arqueo de turnos y balance',
    icon: Coins,
  },
};

export const SiteHeader: React.FC<SiteHeaderProps> = ({ onOpenAbrirCaja }) => {
  const location = useLocation();
  const { currentUser, lock, setIsLocked } = useAuth();
  const { theme, resolvedTheme, cycleTheme } = useTheme();
  const { isInstallable, installApp } = usePwaInstall();
  const { data: corteActivoData } = useCorteActivo();

  const isCajaAbierta = Boolean(corteActivoData?.activo);
  const corte = corteActivoData?.corte;

  const currentMeta =
    location.pathname === '/pos'
      ? titles['/pos']
      : Object.entries(titles).find(([path]) =>
          path !== '/pos' && location.pathname.startsWith(path)
        )?.[1] ?? titles['/taller'];

  const Icon = currentMeta.icon;

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background/95 backdrop-blur-md px-4 transition-[width,height] ease-linear select-none">
      <div className="flex w-full items-center justify-between">
        {/* Left Side: Sidebar trigger & Title */}
        <div className="flex items-center gap-2">
          <SidebarTrigger />
          <Separator
            orientation="vertical"
            className="mx-1 h-4 bg-border"
          />

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Icon className="size-4.5 text-muted-foreground hidden sm:inline-block" />
              <h1 className="text-base font-semibold tracking-tight text-foreground">
                {currentMeta.title}
              </h1>
            </div>
            <span className="hidden md:inline-block text-sm text-muted-foreground font-normal">
              — {currentMeta.subtitle}
            </span>
          </div>
        </div>

        {/* Right Side: Turno status & User quick actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Turno Activo Pill */}
          {isCajaAbierta && corte ? (
            <NavLink
              to="/corte-caja"
              className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary border border-border text-foreground hover:border-foreground/30 text-xs transition-colors"
              title="Ir al arqueo de caja"
            >
              <CheckCircle2 className="size-3 text-[#59d499]" />
              <span className="text-muted-foreground text-[11px] hidden sm:inline">
                Turno #{corte.id}
              </span>
              <span className="font-semibold text-foreground text-xs font-mono tabular-nums">
                <NumberFlow
                  value={corte.montoCalculado}
                  format={{ style: 'currency', currency: 'USD' }}
                />
              </span>
            </NavLink>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenAbrirCaja}
              className="gap-1.5 text-xs rounded-full border-border hover:border-foreground/30 h-7"
            >
              <AlertCircle className="size-3 text-[#ffc533]" data-icon="inline-start" />
              <span>Abrir Turno</span>
            </Button>
          )}

          {/* Botón de Instalación PWA (Visible cuando el navegador detecta que es instalable) */}
          {isInstallable && (
            <Button
              variant="outline"
              size="sm"
              onClick={installApp}
              className="gap-1.5 text-xs rounded-full border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary h-7 font-medium"
              title="Instalar TicketFlow como aplicación en el escritorio o dispositivo"
            >
              <Download data-icon="inline-start" />
              <span className="hidden sm:inline">Instalar App</span>
            </Button>
          )}

          {/* Theme Toggle (Oscuro -> Claro -> Sistema) */}
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={cycleTheme}
            className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg h-7 w-7"
            title={
              theme === 'dark'
                ? 'Tema: Oscuro (clic para cambiar a Claro)'
                : theme === 'light'
                  ? 'Tema: Claro (clic para cambiar a Sistema)'
                  : `Tema: Sistema [${resolvedTheme === 'dark' ? 'Oscuro' : 'Claro'}] (clic para cambiar a Oscuro)`
            }
            aria-label="Cambiar tema de la interfaz"
          >
            {theme === 'dark' ? (
              <Moon className="size-3.5" />
            ) : theme === 'light' ? (
              <Sun className="size-3.5" />
            ) : (
              <Monitor className="size-3.5" />
            )}
          </Button>

          {/* User Quick Switch */}
          {currentUser ? (
            <Button
              variant="ghost"
              size="xs"
              onClick={lock}
              className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg h-7 px-2.5 gap-1.5 text-xs"
              title="Bloquear pantalla o cambiar operador"
            >
              <Lock className="size-3" data-icon="inline-start" />
              <span className="hidden sm:inline">Bloquear</span>
            </Button>
          ) : (
            <Button
              variant="default"
              size="xs"
              onClick={() => setIsLocked(true)}
              className="h-7 px-3 text-xs rounded-full"
            >
              <Lock className="size-3" data-icon="inline-start" />
              <span>Identificarse</span>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
