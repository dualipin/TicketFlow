import React, { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router';
import NumberFlow from '@number-flow/react';
import { MetalBadge } from 'metal-fx';
import { useAuth } from '../../lib/auth-context.tsx';
import { useCorteActivo } from '../../queries/corte-caja/queries.ts';
import { AbrirCajaModal } from '../corte-caja/AbrirCajaModal.tsx';
import { Button } from '../ui/button.tsx';
import { Avatar, AvatarFallback } from '../ui/avatar.tsx';
import {
  Wrench,
  Store,
  Receipt,
  Coins,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Menu,
  X,
  Layers,
} from 'lucide-react';
import { cn } from '../../lib/utils.ts';

export const DashboardLayout: React.FC = () => {
  const { currentUser, lock, setIsLocked } = useAuth();
  const { data: corteActivoData } = useCorteActivo();
  const location = useLocation();

  const [isAbrirCajaModalOpen, setIsAbrirCajaModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isCajaAbierta = Boolean(corteActivoData?.activo);
  const corte = corteActivoData?.corte;

  const getRoleIcon = (rol?: string) => {
    switch (rol) {
      case 'ADMIN':
        return <Shield className="size-3 text-amber-500" />;
      case 'TECNICO':
        return <Wrench className="size-3 text-primary" />;
      case 'MOSTRADOR':
      default:
        return <Store className="size-3 text-emerald-500" />;
    }
  };

  const navItems = [
    {
      to: '/taller',
      label: 'Taller',
      categoryTitle: 'Taller & Órdenes',
      icon: Wrench,
      description: 'Cola de reparaciones',
    },
    {
      to: '/pos',
      label: 'Punto de Venta',
      categoryTitle: 'Terminal PdV',
      icon: Store,
      description: 'Venta de mostrador',
    },
    {
      to: '/pos/historial',
      label: 'Historial',
      categoryTitle: 'Historial de Ventas',
      icon: Receipt,
      description: 'Auditoría de tickets',
    },
    {
      to: '/corte-caja',
      label: 'Corte de Caja',
      categoryTitle: 'Corte & Arqueo',
      icon: Coins,
      description: 'Turnos de caja',
    },
  ];

  const currentNav = navItems.find((item) =>
    item.to === '/pos'
      ? location.pathname === '/pos'
      : location.pathname.startsWith(item.to)
  ) ?? navItems[0];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-primary/20 selection:text-primary">
      {/* =================================================================== */}
      {/* 1. TOP NAV (Raycast Near-Black Canvas + Hairline Border, 56px)       */}
      {/* =================================================================== */}
      <header className="sticky top-0 z-40 h-14 w-full bg-background/90 text-foreground backdrop-blur-md transition-colors border-b border-border select-none">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Brand Mark */}
          <div className="flex items-center gap-2">
            <NavLink
              to="/taller"
              className="flex items-center gap-2 text-foreground/90 hover:text-foreground transition-opacity"
            >
              <div className="size-6 rounded-md bg-secondary border border-border flex items-center justify-center">
                <Layers className="size-3.5 text-[#ff6161]" />
              </div>
              <span className="font-semibold text-xs tracking-tight text-foreground">
                TicketFlow
              </span>
            </NavLink>
            <div className="hidden sm:inline-flex items-center scale-90 origin-left">
              <MetalBadge>v1.0</MetalBadge>
            </div>
          </div>

          {/* Center Links (Desktop ≥ 768px) */}
          <nav className="hidden md:flex items-center gap-6 text-[12px] font-medium tracking-tight">
            {navItems.map((item) => {
              const isActive =
                item.to === '/pos'
                  ? location.pathname === '/pos'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={cn(
                    'transition-colors duration-150 py-1 hover:text-foreground',
                    isActive
                      ? 'text-foreground font-semibold relative after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          {/* Right cluster: User identity & Lock */}
          <div className="flex items-center gap-2 sm:gap-3">
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-secondary border border-border text-xs">
                  <Avatar className="size-5 rounded-full bg-[#ff6161] text-[10px] text-white">
                    <AvatarFallback>
                      {currentUser.nombre.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground/90 font-normal text-[11px]">
                    {currentUser.nombre}
                  </span>
                  {getRoleIcon(currentUser.rol)}
                </div>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={lock}
                  className="text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg h-7 px-2.5 gap-1 text-[11px]"
                  title="Bloquear pantalla o cambiar operador"
                >
                  <Lock className="size-3" data-icon="inline-start" />
                  <span className="hidden sm:inline">Cambiar Usuario</span>
                </Button>
              </div>
            ) : (
              <Button
                variant="default"
                size="xs"
                onClick={() => setIsLocked(true)}
                className="h-7 px-3 text-[11px] rounded-full"
              >
                <Lock className="size-3" data-icon="inline-start" />
                <span>Identificarse</span>
              </Button>
            )}

            {/* Mobile Hamburger toggle */}
            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="size-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Nav Tray */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-border bg-background/95 backdrop-blur-xl p-4 flex flex-col gap-2 animate-in fade-in-0 duration-150">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.to === '/pos'
                  ? location.pathname === '/pos'
                  : location.pathname.startsWith(item.to);

              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="size-4" />
                  <span>{item.categoryTitle}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* =================================================================== */}
      {/* 2. CONTEXTUAL SUB-NAV (Surface 1 bar, 48px)                         */}
      {/* =================================================================== */}
      <div className="sticky top-14 z-30 h-12 w-full bg-card/80 backdrop-blur-xl border-b border-border transition-all select-none">
        <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
          {/* Surface Category Title (Inter ss03 Display, mechanical tracking) */}
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-foreground">
              {currentNav.categoryTitle}
            </h1>
            <span className="hidden sm:inline-block text-xs text-muted-foreground font-normal">
              — {currentNav.description}
            </span>
          </div>

          {/* Contextual Quick Actions (Turno / Cash Status) */}
          <div className="flex items-center gap-2">
            {isCajaAbierta && corte ? (
              <NavLink
                to="/corte-caja"
                className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-foreground hover:border-white/30 text-xs transition-all"
                title="Ir al arqueo de caja"
              >
                <CheckCircle2 className="size-3 text-[#59d499]" />
                <span className="text-muted-foreground text-[11px]">Turno #{corte.id}</span>
                <span className="font-semibold text-foreground text-xs font-mono">
                  <NumberFlow value={corte.montoCalculado} format={{ style: 'currency', currency: 'USD' }} />
                </span>
              </NavLink>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAbrirCajaModalOpen(true)}
                className="gap-1.5 text-xs rounded-full border-border hover:border-white/30"
              >
                <AlertCircle className="size-3 text-[#ffc533]" data-icon="inline-start" />
                <span>Abrir Turno</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* 3. MAIN WORKSPACE CANVAS                                           */}
      {/* =================================================================== */}
      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 sm:py-8 flex flex-col gap-6">
        <Outlet />
      </main>

      {/* Modal para Abrir Caja desde cualquier punto */}
      <AbrirCajaModal
        isOpen={isAbrirCajaModalOpen}
        onClose={() => setIsAbrirCajaModalOpen(false)}
      />
    </div>
  );
};
