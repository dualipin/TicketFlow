import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router';
import { MetalBadge } from 'metal-fx';
import { useAuth } from '../../lib/auth-context.tsx';
import { usePwaInstall } from '../../hooks/usePwaInstall.ts';
import { useCorteActivo } from '../../queries/corte-caja/queries.ts';
import { useTickets } from '../../queries/tickets/queries.ts';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from '../ui/sidebar.tsx';
import { Avatar, AvatarFallback } from '../ui/avatar.tsx';
import { Button } from '../ui/button.tsx';
import {
  Wrench,
  Store,
  Receipt,
  Coins,
  Boxes,
  Layers,
  Plus,
  Lock,
  Shield,
  CheckCircle2,
  AlertCircle,
  Download,
} from 'lucide-react';

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  onOpenCreateTicket?: () => void;
  onOpenAbrirCaja?: () => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({
  onOpenCreateTicket,
  onOpenAbrirCaja,
  ...props
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, lock, setIsLocked } = useAuth();
  const { isInstallable, installApp } = usePwaInstall();
  const { data: corteData } = useCorteActivo();
  const { data: tickets = [] } = useTickets();

  const isCajaAbierta = Boolean(corteData?.activo);
  const activeTicketsCount = tickets.filter((t) =>
    ['RECIBIDO', 'DIAGNOSTICO', 'EN_REPARACION'].includes(t.estado)
  ).length;

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
      title: 'Taller',
      url: '/taller',
      icon: Wrench,
      description: 'Cola de servicio y órdenes',
      badge: activeTicketsCount > 0 ? String(activeTicketsCount) : undefined,
    },
    {
      title: 'Punto de Venta',
      url: '/pos',
      icon: Store,
      description: 'Terminal de cobro en mostrador',
    },
    {
      title: 'Historial',
      url: '/pos/historial',
      icon: Receipt,
      description: 'Auditoría y tickets de venta',
    },
    {
      title: 'Inventario',
      url: '/inventario',
      icon: Boxes,
      description: 'Catálogo de artículos y stock',
    },
    {
      title: 'Corte de Caja',
      url: '/corte-caja',
      icon: Coins,
      description: 'Turnos de caja y arqueos',
      badge: isCajaAbierta ? 'Activo' : undefined,
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* 1. Header con Brand Mark */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="hover:bg-transparent cursor-pointer select-none"
              onClick={() => navigate('/taller')}
            >
              <div className="size-7 rounded-md bg-secondary border border-border flex items-center justify-center shrink-0">
                <Layers className="size-4 text-[#ff6161]" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-semibold text-xs tracking-tight text-foreground">
                  TicketFlow
                </span>
                <span className="text-[10px] text-muted-foreground font-normal">
                  POS & Workshop OS
                </span>
              </div>
              <div className="ml-auto group-data-[collapsible=icon]:hidden scale-90 origin-right">
                <MetalBadge>v1.0</MetalBadge>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarSeparator />

      {/* 2. Main Content & Navigation */}
      <SidebarContent>
        {/* Navigation Group: Operaciones */}
        <SidebarGroup>
          <SidebarGroupLabel>Operaciones</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.url === '/pos'
                    ? location.pathname === '/pos'
                    : location.pathname.startsWith(item.url);

                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton
                      tooltip={item.title}
                      isActive={isActive}
                      render={<NavLink to={item.url} />}
                    >
                      <Icon className="size-4 shrink-0" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Quick Actions Group */}
        <SidebarGroup className="mt-2">
          <SidebarGroupLabel>Acciones Rápidas</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {onOpenCreateTicket && (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Nuevo Folio de Taller"
                    onClick={onOpenCreateTicket}
                    className="hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    <Plus className="size-4 text-primary shrink-0" />
                    <span>Nuevo Ticket</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}

              {isCajaAbierta ? (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Ver Arqueo de Turno"
                    onClick={() => navigate('/corte-caja')}
                    className="hover:bg-emerald-500/10 hover:text-emerald-400 transition-colors"
                  >
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>Turno #{corteData?.corte?.id} Abierto</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    tooltip="Iniciar Turno de Caja"
                    onClick={onOpenAbrirCaja ? onOpenAbrirCaja : () => navigate('/corte-caja')}
                    className="hover:bg-amber-500/10 hover:text-amber-400 transition-colors"
                  >
                    <AlertCircle className="size-4 text-amber-400 shrink-0" />
                    <span>Abrir Turno de Caja</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      {/* 3. Footer con NavUser / Operador */}
      <SidebarFooter>
        <SidebarMenu>
          {isInstallable && (
            <SidebarMenuItem>
              <SidebarMenuButton
                tooltip="Instalar TicketFlow en este equipo"
                onClick={installApp}
                className="bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary font-medium transition-colors cursor-pointer"
              >
                <Download className="size-4 shrink-0" />
                <span>Instalar Aplicación</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
          <SidebarMenuItem>
            {currentUser ? (
              <div className="flex items-center gap-2 p-1.5 rounded-lg bg-secondary/60 border border-border/80 group-data-[collapsible=icon]:p-1 group-data-[collapsible=icon]:justify-center">
                <Avatar className="size-7 rounded-full bg-[#ff6161] text-xs text-white shrink-0">
                  <AvatarFallback>
                    {currentUser.nombre.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                  <div className="flex items-center gap-1.5">
                    <span className="truncate text-xs font-medium text-foreground">
                      {currentUser.nombre}
                    </span>
                    {getRoleIcon(currentUser.rol)}
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate">
                    Rol: {currentUser.rol}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={lock}
                  className="size-6 text-muted-foreground hover:text-foreground shrink-0 group-data-[collapsible=icon]:hidden"
                  title="Bloquear pantalla o cambiar operador"
                >
                  <Lock className="size-3" />
                </Button>
              </div>
            ) : (
              <SidebarMenuButton
                tooltip="Identificarse"
                onClick={() => setIsLocked(true)}
                className="bg-primary text-primary-foreground hover:bg-primary-hover font-medium"
              >
                <Lock className="size-4 shrink-0" />
                <span>Identificarse</span>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      {/* 4. Rail redimensionador y colapsador */}
      <SidebarRail />
    </Sidebar>
  );
};
