import { db } from "./db.ts";

export async function seed(): Promise<void> {
  const existingUsers = await db.orm.Usuario.all();
  if (existingUsers.length > 0) {
    return;
  }

  console.log("Seeding database according to Architecture.md...");

  // 1. Usuarios
  const admin = await db.orm.Usuario.create({
    nombre: "Administrador",
    rol: "ADMIN",
    pin: "1234",
    activo: 1,
  });

  const tecnico = await db.orm.Usuario.create({
    nombre: "Daniel (Técnico)",
    rol: "TECNICO",
    pin: "2222",
    activo: 1,
  });

  const mostrador = await db.orm.Usuario.create({
    nombre: "Mariana (Mostrador)",
    rol: "MOSTRADOR",
    pin: "3333",
    activo: 1,
  });

  // 2. Corte de Caja inicial abierto
  const corteCaja = await db.orm.CorteCaja.create({
    usuarioId: mostrador.id,
    montoInicial: 500.0,
    montoCalculado: 500.0,
    estado: "ABIERTO",
    notas: "Apertura de turno matutino",
  });

  // 3. Clientes
  const clienteRoberto = await db.orm.Cliente.create({
    nombre: "Roberto Gómez",
    telefono: "5215511223344",
    notas: "Cliente frecuente de la zona",
  });

  const clienteLaura = await db.orm.Cliente.create({
    nombre: "Laura Martínez",
    telefono: "5215599887766",
    notas: "Recomendada por Roberto",
  });

  // 4. Categorías
  const catRefacciones = await db.orm.Categoria.create({ nombre: "Refacciones" });
  const catAccesorios = await db.orm.Categoria.create({ nombre: "Accesorios" });
  const catServicios = await db.orm.Categoria.create({ nombre: "Servicios de Taller" });

  // 5. Productos y Variaciones
  // Productos Físicos
  const prodPantalla = await db.orm.Producto.create({
    categoriaId: catRefacciones.id,
    nombre: "Pantalla iPhone 11 Incell",
    descripcion: "Pantalla de alta calidad con TrueTone compatible",
    esServicio: 0,
  });
  await db.orm.Variacion.create({
    productoId: prodPantalla.id,
    codigo: "REF-PNT-IP11",
    nombre: "Negro",
    precioBase: 850.0,
    stock: 5,
  });

  const prodBateria = await db.orm.Producto.create({
    categoriaId: catRefacciones.id,
    nombre: "Batería iPhone 11 Premium",
    descripcion: "Batería de repuesto 3110 mAh",
    esServicio: 0,
  });
  await db.orm.Variacion.create({
    productoId: prodBateria.id,
    codigo: "REF-BAT-IP11",
    nombre: "Estándar 3110mAh",
    precioBase: 450.0,
    stock: 8,
  });

  const prodFunda = await db.orm.Producto.create({
    categoriaId: catAccesorios.id,
    nombre: "Funda de Silicón Uso Rudo",
    descripcion: "Funda antichoques esquinas reforzadas",
    esServicio: 0,
  });
  await db.orm.Variacion.create({
    productoId: prodFunda.id,
    codigo: "ACC-FND-NEG",
    nombre: "Negro",
    precioBase: 150.0,
    stock: 10,
  });
  await db.orm.Variacion.create({
    productoId: prodFunda.id,
    codigo: "ACC-FND-AZL",
    nombre: "Azul Marino",
    precioBase: 150.0,
    stock: 6,
  });

  const prodCargador = await db.orm.Producto.create({
    categoriaId: catAccesorios.id,
    nombre: "Cargador Carga Rápida 20W USB-C",
    descripcion: "Cubo de carga rápida certificación CE",
    esServicio: 0,
  });
  await db.orm.Variacion.create({
    productoId: prodCargador.id,
    codigo: "ACC-CHG-20W",
    nombre: "Blanco",
    precioBase: 220.0,
    stock: 12,
  });

  // Servicios (No descuentan stock físico)
  const prodFormateo = await db.orm.Producto.create({
    categoriaId: catServicios.id,
    nombre: "Formateo e Instalación de SO",
    descripcion: "Respaldo básico, instalación limpia de Windows/Mac y drivers",
    esServicio: 1,
  });
  await db.orm.Variacion.create({
    productoId: prodFormateo.id,
    codigo: "SRV-FORM-01",
    nombre: "Servicio PC / Laptop",
    precioBase: 350.0,
    stock: 0,
  });

  const prodSoldadura = await db.orm.Producto.create({
    categoriaId: catServicios.id,
    nombre: "Microsoldadura / Reparación Placa",
    descripcion: "Detección de cortos, reballing y cambio de integrados",
    esServicio: 1,
  });
  await db.orm.Variacion.create({
    productoId: prodSoldadura.id,
    codigo: "SRV-SOLD-01",
    nombre: "Diagnóstico y Soldadura",
    precioBase: 650.0,
    stock: 0,
  });

  // 6. Tickets de Taller (Flujo Core)
  const ticket1 = await db.orm.Ticket.create({
    folio: "TK-1001",
    clienteId: clienteRoberto.id,
    tecnicoId: tecnico.id,
    estado: "EN_REPARACION",
    dispositivo: "iPhone 11 Negro",
    falla: "No enciende tras golpe; pantalla estrellada",
    contrasena: "1994",
    accesorios: "Funda de silicón azul",
    fotoRecepcion: "/uploads/tickets/demo-recepcion-1001.jpg",
    fotoAccesorios: "/uploads/tickets/demo-accesorios-1001.jpg",
    costoTotal: 1100.0,
    saldoPendiente: 600.0,
  });

  // Historial de Pago (Anticipo de $500)
  await db.orm.HistorialPago.create({
    ticketId: ticket1.id,
    usuarioId: mostrador.id,
    corteCajaId: corteCaja.id,
    monto: 500.0,
    metodoPago: "EFECTIVO",
    notas: "Anticipo al dejar el equipo",
  });

  // Bitácora del ticket (1 pública para WhatsApp y 1 técnica privada)
  await db.orm.Bitacora.create({
    ticketId: ticket1.id,
    usuarioId: mostrador.id,
    nota: "Equipo recibido en mostrador con pantalla rota. Se solicita anticipo de $500.",
    esPrivada: 0,
  });

  await db.orm.Bitacora.create({
    ticketId: ticket1.id,
    usuarioId: tecnico.id,
    nota: "Revisión técnica interna: Corto localizado en capacitor C3201 de línea primaria. Procediendo a desoldar.",
    esPrivada: 1,
  });

  // Ticket 2 (Laura Martínez)
  const ticket2 = await db.orm.Ticket.create({
    folio: "TK-1002",
    clienteId: clienteLaura.id,
    tecnicoId: tecnico.id,
    estado: "RECIBIDO",
    dispositivo: "Samsung Galaxy A52",
    falla: "Falso contacto en centro de carga, carga muy lento o se desconecta",
    contrasena: "Patrón L",
    accesorios: "Sin accesorios",
    costoTotal: 400.0,
    saldoPendiente: 400.0,
  });

  await db.orm.Bitacora.create({
    ticketId: ticket2.id,
    usuarioId: mostrador.id,
    nota: "Equipo recibido para cambio o limpieza de centro de carga.",
    esPrivada: 0,
  });

  console.log("Database seeded successfully!");
}
