import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import { DashboardLayout } from './components/layout/DashboardLayout.tsx';
import { TallerView } from './components/tickets/TallerView.tsx';
import { PosTerminal } from './components/pos/PosTerminal.tsx';
import { VentasHistorial } from './components/pos/VentasHistorial.tsx';
import { CorteCajaView } from './components/corte-caja/CorteCajaView.tsx';
import { InventarioView } from './components/inventario/InventarioView.tsx';
import { LockScreen } from './components/auth/LockScreen.tsx';
import { useAuth } from './lib/auth-context.tsx';
import { Toaster } from './components/ui/sonner.tsx';

export function App() {
  const { isLocked, setIsLocked } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/taller" replace />} />
          <Route path="/taller" element={<TallerView />} />
          <Route path="/pos" element={<PosTerminal />} />
          <Route path="/pos/historial" element={<VentasHistorial />} />
          <Route path="/corte-caja" element={<CorteCajaView />} />
          <Route path="/inventario" element={<InventarioView />} />
          <Route path="*" element={<Navigate to="/taller" replace />} />
        </Route>
      </Routes>

      {/* Pantalla de Bloqueo / Cambio de Operador */}
      {isLocked && <LockScreen onSuccess={() => setIsLocked(false)} />}

      {/* Sistema Global de Notificaciones (Sonner) */}
      <Toaster position="bottom-right" />
    </BrowserRouter>
  );
}

export default App;
