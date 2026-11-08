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

export type TipoAdjunto = 'IMAGEN' | 'AUDIO' | 'VIDEO';

export interface TicketAdjunto {
  id: number;
  ticketId: number | null;
  tipo: TipoAdjunto;
  url: string;
  nombreOriginal: string;
  mimeType: string;
  tamanoBytes: number;
  duracionSegundos: number | null;
  createdAt: string;
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
  adjuntos?: TicketAdjunto[];
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
  adjuntoIds?: number[];
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

// ============================================================================
// Inventario & Catálogo
// ============================================================================
export interface Categoria {
  id: number;
  nombre: string;
  createdAt?: string;
  updatedAt?: string;
  productos?: Producto[];
}

export interface Producto {
  id: number;
  categoriaId: number;
  nombre: string;
  descripcion: string | null;
  esServicio: number; // 0 = Físico con inventario, 1 = Servicio/Mano de obra
  activo?: number; // 1 = Activo, 0 = Archivado/Inactivo
  createdAt?: string;
  updatedAt?: string;
  categoria?: Categoria;
  variaciones?: Variacion[];
}

export interface Variacion {
  id: number;
  productoId: number;
  codigo: string;
  nombre: string;
  precioBase: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface VariacionWithProducto extends Variacion {
  producto: Producto;
}

export interface ProductoWithDetails extends Producto {
  categoria: Categoria;
  variaciones: Variacion[];
}

export interface CreateCategoriaInput {
  nombre: string;
}

export interface CreateProductoVariacionInput {
  codigo: string;
  nombre?: string;
  precioBase: number;
  stock?: number;
}

export interface CreateProductoInput {
  nombre: string;
  categoriaId: number;
  descripcion?: string | null;
  esServicio?: number | boolean;
  codigo?: string;
  nombreVariacion?: string;
  precioBase?: number;
  stock?: number;
  variaciones?: CreateProductoVariacionInput[];
}

export interface UpdateProductoInput {
  nombre?: string;
  categoriaId?: number;
  descripcion?: string | null;
  esServicio?: number | boolean;
  codigo?: string;
  nombreVariacion?: string;
  precioBase?: number;
  stock?: number;
  variaciones?: Array<{
    id?: number;
    codigo: string;
    nombre: string;
    precioBase: number;
    stock: number;
  }>;
}

export interface DeleteProductoResult {
  id: number;
  eliminado: boolean;
  archivado: boolean;
  mensaje: string;
}

// ============================================================================
// Punto de Venta (POS)
// ============================================================================
export type MetodoPagoVenta = 'EFECTIVO' | 'TARJETA' | 'TRANSFERENCIA' | 'MIXTO';

export interface VentaDetalle {
  id: number;
  ventaId: number;
  variacionId: number;
  cantidad: number;
  precioUnit: number;
  subtotal: number;
  variacion?: VariacionWithProducto;
}

export interface Venta {
  id: number;
  corteCajaId: number | null;
  clienteId: number | null;
  usuarioId: number;
  total: number;
  metodoPago: MetodoPagoVenta;
  notas: string | null;
  fecha: string;
  detalles?: VentaDetalle[];
  cliente?: Cliente | null;
  usuario?: Usuario;
}

export interface CreateVentaItemInput {
  variacionId: number;
  cantidad: number;
  precioUnit?: number;
}

export interface CreateVentaInput {
  usuarioId: number;
  items: CreateVentaItemInput[];
  clienteId?: number | null;
  metodoPago?: MetodoPagoVenta;
  notas?: string;
}

export interface VentaFilters {
  corteCajaId?: number;
  usuarioId?: number;
}

// Cart item for client state in POS terminal
export interface CartItem {
  variacionId: number;
  productoId: number;
  productoNombre: string;
  variacionNombre: string;
  codigo: string;
  esServicio: boolean;
  precioBase: number;
  precioUnit: number;
  cantidad: number;
  stockActual: number;
  isOfferPrice?: boolean;
}

// ============================================================================
// Corte de Caja (Turnos & Arqueo)
// ============================================================================
export type CorteCajaEstado = 'ABIERTO' | 'CERRADO';

export interface CorteCaja {
  id: number;
  usuarioId: number;
  montoInicial: number;
  montoCalculado: number;
  montoReal: number | null;
  diferencia: number | null;
  estado: CorteCajaEstado;
  notas: string | null;
  fechaApertura: string;
  fechaCierre: string | null;
  createdAt?: string;
  updatedAt?: string;
  usuario?: Usuario;
  ventas?: Venta[];
  pagosCobrados?: HistorialPago[];
}

export interface CorteCajaActivo extends CorteCaja {
  ventasEfectivo: number;
  pagosEfectivo: number;
}

export interface CorteCajaActivoResponse {
  activo: boolean;
  corte: CorteCajaActivo | null;
}

export interface AbrirCorteInput {
  usuarioId: number;
  montoInicial: number;
  notas?: string;
}

export interface CerrarCorteInput {
  montoReal: number;
  notas?: string;
}

export interface CerrarCorteResumen {
  id: number;
  montoInicial: number;
  ventasEfectivo: number;
  pagosEfectivo: number;
  montoCalculado: number;
  montoReal: number;
  diferencia: number;
  resultado: string;
}

export interface CerrarCorteResponse {
  mensaje: string;
  resumen: CerrarCorteResumen;
  corte: CorteCaja;
}

