import { autoincrement, defineContract, now } from '@prisma/orm-sqlite/contract-builder';

export const contract = defineContract({}, ({ field, model, rel, gen, type }) => {
  // 1. Módulo de Seguridad y Auditoría
  const Usuario = model('Usuario', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      nombre: field.column(type.String()),
      rol: field.column(type.String()).default('TECNICO'), // 'ADMIN', 'TECNICO', 'MOSTRADOR'
      pin: field.column(type.String()).optional(), // Hash de PIN rápido (4 o 6 dígitos para ADMIN)
      password: field.column(type.String()).optional(), // Hash de contraseña tradicional para ADMIN / acceso remoto
      activo: field.column(type.Int()).default(1),
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  const CorteCaja = model('CorteCaja', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      usuarioId: field.column(type.Int()),
      fechaApertura: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      fechaCierre: field.column(type.DateTime()).optional(),
      montoInicial: field.column(type.Float()).default(0.0),
      montoCalculado: field.column(type.Float()).default(0.0), // Ventas + pagos cobrados en el turno
      montoReal: field.column(type.Float()).optional(), // Conteo físico al cierre
      diferencia: field.column(type.Float()).optional(), // montoReal - montoCalculado
      estado: field.column(type.String()).default('ABIERTO'), // 'ABIERTO', 'CERRADO'
      notas: field.column(type.String()).optional(),
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  // 2. Módulo de Clientes
  const Cliente = model('Cliente', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      nombre: field.column(type.String()),
      telefono: field.column(type.String()).unique(), // Llave única para bot de WhatsApp
      notas: field.column(type.String()).optional(),
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  // 3. Módulo de Inventario
  const Categoria = model('Categoria', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      nombre: field.column(type.String()).unique(),
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  const Producto = model('Producto', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      categoriaId: field.column(type.Int()),
      nombre: field.column(type.String()),
      descripcion: field.column(type.String()).optional(),
      esServicio: field.column(type.Int()).default(0), // 1 = servicio (no descuenta stock), 0 = producto físico
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  const Variacion = model('Variacion', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      productoId: field.column(type.Int()),
      codigo: field.column(type.String()).unique(), // SKU / Código de barras
      nombre: field.column(type.String()), // ej. "Negro", "Azul", "Estándar"
      precioBase: field.column(type.Float()).default(0.0),
      stock: field.column(type.Int()).default(0),
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  // 4. Módulo de Taller (Flujo Core)
  const Ticket = model('Ticket', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      folio: field.column(type.String()).unique(), // Folio amigable ej. "TK-1001"
      clienteId: field.column(type.Int()),
      tecnicoId: field.column(type.Int()).optional(),
      estado: field.column(type.String()).default('RECIBIDO'), // RECIBIDO, DIAGNOSTICO, EN_REPARACION, LISTO, ENTREGADO, CANCELADO
      dispositivo: field.column(type.String()),
      falla: field.column(type.String()),
      contrasena: field.column(type.String()).optional(), // PIN / patrón del dispositivo
      accesorios: field.column(type.String()).optional(), // Cargador, cable, funda, etc.
      fotoRecepcion: field.column(type.String()).optional(), // Ruta en disco local
      fotoAccesorios: field.column(type.String()).optional(), // Ruta en disco local
      costoTotal: field.column(type.Float()).default(0.0),
      saldoPendiente: field.column(type.Float()).default(0.0), // Permite entrega con saldo deudor ("fiado por confianza")
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  const Bitacora = model('Bitacora', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      ticketId: field.column(type.Int()),
      usuarioId: field.column(type.Int()),
      nota: field.column(type.String()),
      esPrivada: field.column(type.Int()).default(0), // 1 = privada (técnicos), 0 = pública (visible en WhatsApp)
      createdAt: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
      updatedAt: field.column(type.temporal.UpdatedAt()),
    },
  });

  const HistorialPago = model('HistorialPago', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      ticketId: field.column(type.Int()),
      usuarioId: field.column(type.Int()), // Quien cobró
      corteCajaId: field.column(type.Int()).optional(), // Vinculado al corte de caja activo si aplica
      monto: field.column(type.Float()),
      metodoPago: field.column(type.String()).default('EFECTIVO'), // EFECTIVO, TARJETA, TRANSFERENCIA
      notas: field.column(type.String()).optional(),
      fecha: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
    },
  });

  // 5. Módulo de Punto de Venta (Mostrador)
  const Venta = model('Venta', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      corteCajaId: field.column(type.Int()).optional(),
      clienteId: field.column(type.Int()).optional(),
      usuarioId: field.column(type.Int()), // Quién cobró la venta
      total: field.column(type.Float()).default(0.0),
      metodoPago: field.column(type.String()).default('EFECTIVO'), // EFECTIVO, TARJETA, TRANSFERENCIA, MIXTO
      notas: field.column(type.String()).optional(),
      fecha: field.column(type.DateTime()).default(now()).onCreate(gen.now()),
    },
  });

  const VentaDetalle = model('VentaDetalle', {
    fields: {
      id: field.column(type.Int()).id().default(autoincrement()),
      ventaId: field.column(type.Int()),
      variacionId: field.column(type.Int()),
      cantidad: field.column(type.Int()).default(1),
      precioUnit: field.column(type.Float()).default(0.0), // Precio sellado al momento de la venta
      subtotal: field.column(type.Float()).default(0.0),
    },
  });

  return {
    models: {
      Usuario: Usuario.relations({
        cortesCaja: rel.hasMany(CorteCaja, { by: 'usuarioId' }),
        tickets: rel.hasMany(Ticket, { by: 'tecnicoId' }),
        pagosCobrados: rel.hasMany(HistorialPago, { by: 'usuarioId' }),
        notasBitacora: rel.hasMany(Bitacora, { by: 'usuarioId' }),
        ventas: rel.hasMany(Venta, { by: 'usuarioId' }),
      }),
      CorteCaja: CorteCaja.relations({
        usuario: rel.belongsTo(Usuario, { from: 'usuarioId', to: 'id' }),
        ventas: rel.hasMany(Venta, { by: 'corteCajaId' }),
        pagosCobrados: rel.hasMany(HistorialPago, { by: 'corteCajaId' }),
      }),
      Cliente: Cliente.relations({
        tickets: rel.hasMany(Ticket, { by: 'clienteId' }),
        ventas: rel.hasMany(Venta, { by: 'clienteId' }),
      }),
      Categoria: Categoria.relations({
        productos: rel.hasMany(Producto, { by: 'categoriaId' }),
      }),
      Producto: Producto.relations({
        categoria: rel.belongsTo(Categoria, { from: 'categoriaId', to: 'id' }),
        variaciones: rel.hasMany(Variacion, { by: 'productoId' }),
      }),
      Variacion: Variacion.relations({
        producto: rel.belongsTo(Producto, { from: 'productoId', to: 'id' }),
        ventaDetalles: rel.hasMany(VentaDetalle, { by: 'variacionId' }),
      }),
      Ticket: Ticket.relations({
        cliente: rel.belongsTo(Cliente, { from: 'clienteId', to: 'id' }),
        tecnico: rel.belongsTo(Usuario, { from: 'tecnicoId', to: 'id', optional: true }),
        bitacora: rel.hasMany(Bitacora, { by: 'ticketId' }),
        historialPagos: rel.hasMany(HistorialPago, { by: 'ticketId' }),
      }),
      Bitacora: Bitacora.relations({
        ticket: rel.belongsTo(Ticket, { from: 'ticketId', to: 'id' }),
        usuario: rel.belongsTo(Usuario, { from: 'usuarioId', to: 'id' }),
      }),
      HistorialPago: HistorialPago.relations({
        ticket: rel.belongsTo(Ticket, { from: 'ticketId', to: 'id' }),
        usuario: rel.belongsTo(Usuario, { from: 'usuarioId', to: 'id' }),
        corteCaja: rel.belongsTo(CorteCaja, { from: 'corteCajaId', to: 'id', optional: true }),
      }),
      Venta: Venta.relations({
        corteCaja: rel.belongsTo(CorteCaja, { from: 'corteCajaId', to: 'id', optional: true }),
        cliente: rel.belongsTo(Cliente, { from: 'clienteId', to: 'id', optional: true }),
        usuario: rel.belongsTo(Usuario, { from: 'usuarioId', to: 'id' }),
        detalles: rel.hasMany(VentaDetalle, { by: 'ventaId' }),
      }),
      VentaDetalle: VentaDetalle.relations({
        venta: rel.belongsTo(Venta, { from: 'ventaId', to: 'id' }),
        variacion: rel.belongsTo(Variacion, { from: 'variacionId', to: 'id' }),
      }),
    },
  };
});
