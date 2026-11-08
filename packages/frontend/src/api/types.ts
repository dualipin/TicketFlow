export type TicketEstado =
  | 'RECIBIDO'
  | 'DIAGNOSTICO'
  | 'EN_REPARACION'
  | 'LISTO'
  | 'ENTREGADO'
  | 'CANCELADO';

export type MetodoPago = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA';

export type RolUsuario = 'ADMIN' | 'TECNICO' | 'MOSTRADOR';

export interface Usuario {
  id: number;
  nombre: string;
  rol: RolUsuario;
  pin?: string;
  password?: string;
  activo: number | boolean;
  hasPin?: boolean;
  hasPassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthUser {
  id: number;
  nombre: string;
  rol: RolUsuario;
}

export interface LoginPinPayload {
  usuarioId: number;
  pin: string;
}

export interface LoginPasswordPayload {
  usuarioId?: number;
  nombre?: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user: AuthUser;
}

export interface Cliente {
  id: number;
  nombre: string;
  telefono: string;
  notas: string | null;
  createdAt: string;
  updatedAt: string;
  tickets?: Ticket[];
}

export interface Bitacora {
  id: number;
  ticketId: number;
  usuarioId: number;
  nota: string;
  esPrivada: number; // 0 o 1
  createdAt: string;
  updatedAt: string;
}

export interface HistorialPago {
  id: number;
  ticketId: number;
  usuarioId: number;
  corteCajaId: number | null;
  monto: number;
  metodoPago: MetodoPago;
  notas: string | null;
  fecha: string;
}

export interface Ticket {
  id: number;
  folio: string;
  clienteId: number;
  tecnicoId: number | null;
  estado: TicketEstado;
  dispositivo: string;
  falla: string;
  contrasena: string | null;
  accesorios: string | null;
  fotoRecepcion: string | null;
  fotoAccesorios: string | null;
  costoTotal: number;
  saldoPendiente: number;
  createdAt: string;
  updatedAt: string;
  cliente: Cliente;
  tecnico: Usuario | null;
  bitacora: Bitacora[];
  historialPagos: HistorialPago[];
}

export interface TicketFilters {
  estado?: TicketEstado | 'ALL';
  q?: string;
  tecnicoId?: number;
  conSaldo?: boolean;
}

export interface CreateTicketInput {
  clienteId?: number;
  nombreCliente?: string;
  telefonoCliente?: string;
  notasCliente?: string;
  dispositivo: string;
  falla: string;
  contrasena?: string;
  accesorios?: string;
  costoTotal?: number;
  anticipo?: number;
  metodoPago?: MetodoPago;
  usuarioId?: number;
  notaInicial?: string;
  notaEsPrivada?: boolean;
  tecnicoId?: number;
}

export interface UpdateTicketStatusInput {
  id: number;
  estado: TicketEstado;
  usuarioId?: number;
  nota?: string;
  esPrivada?: boolean;
}

export interface AddBitacoraInput {
  ticketId: number;
  usuarioId: number;
  nota: string;
  esPrivada?: boolean;
}

export interface UpdateTicketCostoInput {
  id: number;
  costoTotal: number;
  usuarioId?: number;
}

export interface RegisterPagoInput {
  ticketId: number;
  usuarioId: number;
  monto: number;
  metodoPago?: MetodoPago;
  notas?: string;
}

export interface CreateClienteInput {
  nombre: string;
  telefono: string;
  notas?: string;
}
