import React, { useState } from 'react';
import { Outlet } from 'react-router';
import { SidebarProvider, SidebarInset } from '../ui/sidebar.tsx';
import { AppSidebar } from './AppSidebar.tsx';
import { SiteHeader } from './SiteHeader.tsx';
import { AbrirCajaModal } from '../corte-caja/AbrirCajaModal.tsx';
import { CreateTicketModal } from '../tickets/CreateTicketModal.tsx';

export const DashboardLayout: React.FC = () => {
  const [isAbrirCajaModalOpen, setIsAbrirCajaModalOpen] = useState(false);
  const [isCreateTicketModalOpen, setIsCreateTicketModalOpen] = useState(false);

  return (
    <SidebarProvider
      style={
        {
          '--sidebar-width': '16.5rem',
          '--sidebar-width-icon': '3.25rem',
          '--header-height': '3.5rem',
        } as React.CSSProperties
      }
      className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary"
    >
      {/* 1. Collapsible Inset Sidebar (bundui / shadcn ui kit architecture) */}
      <AppSidebar
        variant="inset"
        onOpenCreateTicket={() => setIsCreateTicketModalOpen(true)}
        onOpenAbrirCaja={() => setIsAbrirCajaModalOpen(true)}
      />

      {/* 2. Floating Inset Content Canvas */}
      <SidebarInset className="flex flex-col min-w-0">
        {/* Header Bar with SidebarTrigger, Dynamic Route Metadata and Turno Status */}
        <SiteHeader onOpenAbrirCaja={() => setIsAbrirCajaModalOpen(true)} />

        {/* Main Workspace Viewport with Container Queries */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="@container/main flex flex-1 flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 max-w-[1680px] w-full mx-auto">
            <Outlet />
          </div>
        </div>
      </SidebarInset>

      {/* Global Modals triggered from anywhere */}
      <AbrirCajaModal
        isOpen={isAbrirCajaModalOpen}
        onClose={() => setIsAbrirCajaModalOpen(false)}
      />

      <CreateTicketModal
        isOpen={isCreateTicketModalOpen}
        onClose={() => setIsCreateTicketModalOpen(false)}
      />
    </SidebarProvider>
  );
};

export default DashboardLayout;
