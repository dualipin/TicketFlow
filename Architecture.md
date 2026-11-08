# Reporte de Arquitectura y Modelado de Datos
**Proyecto:** Sistema de Ticket + Punto de Venta (PdV)
**Fecha:** Noviembre 2026

---

## 1. Visión General del Proyecto
El proyecto consiste en un sistema integral de Punto de Venta y gestión de taller de reparaciones. Está diseñado con una arquitectura "Edge" (local) para garantizar que el negocio siga operando independientemente de la estabilidad de la conexión a internet. Al mismo tiempo, permite el monitoreo remoto por parte del dueño y notificaciones automáticas por WhatsApp para los clientes.

## 2. Stack Tecnológico Seleccionado
Para resolver los retos de infraestructura sin depender de configuraciones complejas de red (como abrir puertos en módems restrictivos), se seleccionó el siguiente stack:

*   **Backend & Runtime:** **Bun + Hono**. Sustituye a Node.js y Express, ofreciendo un rendimiento ultrarrápido y soporte nativo para TypeScript sin configuraciones complejas.
*   **Base de Datos:** **SQLite** gestionado a través de **Prisma ORM 8**. Al ser una base de datos de un solo archivo (`dev.db`), es extremadamente rápida en redes locales y trivial de respaldar.
*   **Acceso Remoto:** **Cloudflare Tunnels**. Permite exponer el sistema local a un dominio seguro en internet sin tocar el módem del proveedor de internet (Telmex).
*   **Notificaciones y Bot:** **whatsapp-web.js** con **Google Gemini 1.5 Flash** para interpretar mensajes y enviar actualizaciones de los tickets.
*   **Backups:** Automatizados hacia la nube (**Cloudflare R2 / Backblaze**) durante la noche, sincronizando tanto la base de datos como las fotografías locales.

---

## 3. Reglas de Negocio Definidas

Durante nuestra fase de descubrimiento, establecimos las siguientes reglas operativas que dictaron el diseño de la base de datos:

1.  **Flujo del Taller:** Se requiere un ticket por dispositivo. Se deben registrar datos sensibles (contraseñas), accesorios dejados y fotografías locales del estado de recepción.
2.  **Transparencia y Trazabilidad:** Necesidad de una bitácora interna privada para notas técnicas. Todos los usuarios (dueño, técnico, mostrador) pueden interactuar con la caja y los tickets, por lo que es vital auditar quién realiza cada acción.
3.  **Inventario y Servicios:** El sistema maneja tanto productos físicos (con variaciones/SKUs) como servicios (mano de obra, soldadura) que no descuentan stock. El precio de los servicios es dinámico y lo ajusta el técnico en el momento.
4.  **Finanzas Flexibles:** Soporte para múltiples pagos parciales (anticipos) en reparaciones, pagos mixtos en ventas, y entregas basadas en confianza (entregar el equipo manteniendo un saldo deudor). Es obligatorio el control mediante "Cortes de Caja".

---

## 4. Modelos de Base de Datos y Justificación

A continuación se detallan las tablas generadas en Prisma, organizadas por módulo.

### Módulo de Seguridad y Auditoría

| Modelo | Campos Principales | Relaciones |
| :--- | :--- | :--- |
| **Usuario** | `id`, `nombre`, `rol`, `pin`, `password` | `tickets`, `pagosCobrados`, `cortesCaja`, `notasBitacora` |
| **CorteCaja** | `id`, `fechas`, `montoInicial`, `montoCalculado`, `montoReal`, `estado` | Pertenece a un `Usuario`, contiene múltiples `Ventas` |

*   **Justificación:** Autenticación híbrida y trazabilidad: en mostrador se utiliza **Selección de Operador + PIN hasheado con Argon2** (4 dígitos para mostrador/técnicos, 6 dígitos opcionales para ADMIN) con bloqueo por fuerza bruta para permitir compartir la terminal y cambiar de sesión en segundos. Para el Dueño/ADMIN y acceso remoto (vía Cloudflare Tunnel), se soporta contraseña robusta tradicional. El `CorteCaja` es vital porque todos los roles pueden cobrar; cuadra el dinero físico contra el registrado en el sistema.

### Módulo de Clientes

| Modelo | Campos Principales | Relaciones |
| :--- | :--- | :--- |
| **Cliente** | `id`, `nombre`, `telefono` (único) | `tickets`, `ventas` |

*   **Justificación:** El teléfono es único y es la llave principal para que el bot de WhatsApp funcione correctamente al vincular los mensajes entrantes con sus tickets correspondientes. No se incluyen datos de facturación (RFC) por simplificación operativa.

### Módulo de Inventario

| Modelo | Campos Principales | Relaciones |
| :--- | :--- | :--- |
| **Categoria** | `id`, `nombre` | `productos` |
| **Producto** | `id`, `nombre`, `esServicio` | Pertenece a una `Categoria`, tiene `Variaciones` |
| **Variacion** | `id`, `codigo` (SKU), `nombre`, `precioBase`, `stock` | Pertenece a un `Producto`, está en `VentaDetalle` |

*   **Justificación:** Separar el `Producto` de la `Variacion` permite tener, por ejemplo, "Funda de Silicón" y debajo de ella los SKUs independientes por color. El campo booleano `esServicio` en el producto es la clave para vender "Formateos" sin que el sistema intente restar stock físico.

### Módulo de Taller (Flujo Core)

| Modelo | Campos Principales | Relaciones |
| :--- | :--- | :--- |
| **Ticket** | `id`, `folio`, `estado`, `dispositivo`, `falla`, `contrasena`, `accesorios`, `fotoRecepcion`, `fotoAccesorios`, `costoTotal`, `saldoPendiente` | Pertenece a `Cliente`, asignado a `Tecnico`, tiene `Bitacora`, tiene `HistorialPago` |
| **Bitacora** | `id`, `nota`, `esPrivada` | Pertenece a `Ticket` y a `Usuario` (autor) |
| **HistorialPago** | `id`, `monto`, `metodoPago`, `fecha` | Pertenece a `Ticket` y a `Usuario` (quien cobró) |

*   **Justificación:**
    *   **Imágenes Locales:** `fotoRecepcion` y `fotoAccesorios` guardan rutas de disco locales (ej. `/fotos/ticket1.jpg`), evitando saturar la base de datos pero permitiendo sincronizarlas a la nube (Backblaze/R2).
    *   **Pagos Parciales:** `HistorialPago` permite registrar desde un anticipo de $100 hasta la liquidación final, manteniendo el rastro de quién recibió el dinero.
    *   **Deuda vs Estado:** Separar el `estado` (ej. "ENTREGADO") del `saldoPendiente` permite el "fiado por confianza": un equipo puede estar entregado y funcionando, pero aún deber $500.
    *   **Bitácora:** `esPrivada` diferencia entre notas que el cliente puede consultar vía WhatsApp y chismorreos técnicos internos.

### Módulo de Punto de Venta (Mostrador)

| Modelo | Campos Principales | Relaciones |
| :--- | :--- | :--- |
| **Venta** | `id`, `total`, `metodoPago`, `fecha` | Opcional a `Cliente`, pertenece a `CorteCaja`, tiene `VentaDetalle` |
| **VentaDetalle**| `id`, `cantidad`, `precioUnit` | Pertenece a `Venta` y a `Variacion` |

*   **Justificación:** `precioUnit` se guarda de forma independiente en la venta en lugar de leerlo siempre de la tabla de inventario. Esto cumple con la regla de flexibilidad: un técnico puede cobrar un servicio de "Microsoldadura" a un precio distinto al de lista dependiendo de la dificultad, y ese precio acordado queda sellado en el detalle de la venta.