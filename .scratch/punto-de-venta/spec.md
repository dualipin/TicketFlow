# Spec: Módulo de Punto de Venta (PdV), Historial y Arqueo de Caja

Status: ready-for-agent

## Problem Statement

El personal de mostrador y administradores del taller carecen de una interfaz integrada de Punto de Venta (PdV) en el frontend para despachar refacciones, accesorios y cobrar servicios directos de taller a clientes en ventanilla. Actualmente, el frontend solo permite gestionar órdenes de reparación de taller. La venta rápida de productos de mostrador requiere recurrir a llamadas directas al backend o registros manuales. Además, no existe una visualización accesible del estado del turno de caja (Corte de Caja), impidiendo monitorear el dinero físico en mostrador y realizar arqueos de cierre que unifiquen tanto los anticipos/liquidaciones de tickets como las ventas en mostrador.

## Solution

Implementar una solución de Punto de Venta completa y ágil en el frontend montada sobre un nuevo layout de Dashboard con navegación lateral (Sidebar) y enrutamiento con `react-router`:
1. **Navegación y Layout Dashboard:** Sidebar colapsable con accesos a Taller (`/taller`), Terminal de Ventas (`/pos`), Historial de Ventas (`/pos/historial`) y Control de Turno / Corte de Caja (`/corte-caja`), junto con un indicador en vivo del estado de la caja en el encabezado.
2. **Terminal de Ventas PdV (`/pos`):**
   - Bloqueo preventivo si la caja está cerrada, con modal rápido para apertura de turno.
   - Catálogo interactivo de variaciones de productos y servicios con filtrado por categoría y tipo.
   - Soporte para lector de código de barras (búsqueda por SKU con auto-adición al carrito al presionar Enter).
   - Carrito de compras con control de cantidades, validación de existencias para físicos, edición directa de precio para servicios y ajuste controlado por oferta para físicos.
   - Checkout con selección de cliente (Público General por defecto o búsqueda/alta de cliente), selección de método de pago, calculadora de cambio en efectivo y atajos de billetes.
3. **Historial de Ventas (`/pos/historial`):**
   - Tarjetas de resumen (KPIs) con total vendido, volumen de transacciones y desglose por método de pago.
   - Filtros por turno actual vs histórico general, método de pago y búsqueda.
   - Drawer de detalle de venta con desglose línea por línea.
4. **Control de Caja y Arqueo (`/corte-caja`):**
   - Panel de turno activo con cálculo automático de efectivo esperado (fondo inicial + ventas en efectivo + pagos de taller en efectivo).
   - Formulario de arqueo y cierre en vivo que calcula al instante sobrante, faltante o cuadre exacto.
   - Historial de cortes cerrados con registro de operador, fechas y discrepancias.

## User Stories

1. Como cajero o recepcionista, quiero acceder a una terminal de Punto de Venta dedicada, para poder vender productos físicos y cobrar servicios de mostrador rápidamente.
2. Como cajero, quiero ver en todo momento si la caja se encuentra abierta o cerrada, para saber si puedo registrar cobros en el turno actual.
3. Como cajero, quiero que la terminal me impida cobrar si la caja está cerrada y me ofrezca un botón para abrir turno en ese instante, para asegurar la trazabilidad del dinero físico.
4. Como cajero, quiero abrir turno de caja ingresando el fondo inicial y notas opcionales, para dejar constancia del dinero disponible al inicio del turno.
5. Como operador, quiero un sidebar de navegación permanente, para alternar de forma inmediata entre Taller, Terminal PdV, Historial de Ventas y Corte de Caja.
6. Como cajero, quiero navegar las variaciones de productos por categorías visuales, para localizar refacciones o accesorios rápidamente con mouse o pantalla táctil.
7. Como cajero, quiero filtrar el catálogo entre productos físicos y servicios de taller, para acotar las opciones disponibles según la necesidad del cliente.
8. Como cajero, quiero un campo de búsqueda en vivo que filtre por nombre, SKU o categoría, para encontrar productos en segundos.
9. Como cajero con escáner de código de barras, quiero que al leer o teclear un SKU exacto y presionar Enter se agregue automáticamente la variación al carrito, para agilizar la atención en ventanilla.
10. Como cajero, quiero ver el stock disponible en cada tarjeta de variación física, para evitar comprometer existencias inexistentes.
11. Como cajero, quiero que los productos sin existencias aparezcan deshabilitados o con advertencia clara de agotado, para prevenir inconsistencias de inventario.
12. Como cajero, quiero que los servicios de taller tengan un distintivo visual propio y permitan venta sin límite de stock, para registrar reparaciones y mano de obra sin fricción.
13. Como cajero, quiero hacer clic en cualquier variación disponible para agregarla al carrito de compra, acumulando cantidades si ya existía en la lista.
14. Como cajero, quiero modificar la cantidad de cualquier ítem en el carrito con botones de incremento/decremento o input numérico, para ajustar la orden según el pedido del cliente.
15. Como cajero, quiero eliminar ítems individuales del carrito o vaciarlo por completo, para corregir cancelaciones del cliente antes de cobrar.
16. Como cajero, quiero editar libremente el precio unitario de los servicios en el carrito, para cotizar reparaciones especiales o acuerdos a la medida.
17. Como cajero, quiero que los productos físicos mantengan su precio de catálogo protegido pero tengan un control para aplicar ofertas o descuentos cuando sea necesario, para evitar errores de captura sin perder flexibilidad comercial.
18. Como cajero, quiero ver un indicador visual en cualquier ítem cuyo precio difiera del catálogo base, para tener visibilidad de los precios modificados.
19. Como cajero, quiero asociar la venta a un cliente existente o dejarla como "Público en General" por defecto, para no frenar la venta ante clientes ocasionales.
20. Como cajero, quiero buscar clientes por nombre o teléfono directamente en la terminal de cobro, para vincular la compra a su expediente.
21. Como cajero, quiero dar de alta un cliente nuevo mediante un modal rápido sin perder los productos cargados en el carrito, para registrar al cliente y continuar con la venta.
22. Como cajero, quiero seleccionar el método de pago entre Efectivo, Tarjeta, Transferencia o Mixto, para registrar con exactitud la vía de ingreso.
23. Como cajero, quiero ingresar el monto recibido en efectivo y ver el cambio a devolver calculado automáticamente, para eliminar errores aritméticos en mostrador.
24. Como cajero, quiero contar con atajos rápidos de denominaciones de billetes ($100, $200, $500, exacto), para agilizar el cálculo de efectivo recibido con un solo clic.
25. Como cajero, quiero procesar la venta y recibir retroalimentación visual de éxito, vaciando el carrito y dejándolo listo para la siguiente orden sin interrupciones.
26. Como encargado de inventario, quiero que cada venta de productos físicos descuente automáticamente el stock de la variación correspondiente en la base de datos, para mantener las existencias al día.
27. Como cajero o supervisor, quiero consultar el Historial de Ventas con métricas clave (total vendido, número de ventas y desglose por método de pago), para tener un resumen financiero rápido.
28. Como cajero, quiero alternar en el historial entre las ventas del turno/corte activo y todas las ventas históricas, para auditar mi propio turno de trabajo.
29. Como cajero, quiero filtrar el historial por método de pago y buscar por cliente o folio, para localizar ventas específicas con rapidez.
30. Como cajero, quiero hacer clic en cualquier venta del historial para abrir un detalle con los artículos vendidos, cajero responsable y fecha, para aclarar dudas con clientes.
31. Como encargado de mostrador, quiero acceder al módulo de Corte de Caja y ver en tiempo real el dinero inicial, las ventas en efectivo y los cobros de tickets en efectivo, para conocer el efectivo total esperado en gaveta.
32. Como encargado de mostrador, quiero capturar el arqueo ingresando el efectivo físico contado y ver si el turno cuadra exactamente o si presenta sobrante/faltante antes de cerrar, para conciliar discrepancias a tiempo.
33. Como encargado de mostrador, quiero cerrar formalmente el turno de caja con notas de arqueo, dejando el corte archivado y la caja lista para un nuevo turno.
34. Como administrador, quiero consultar el histórico de cortes de caja pasados con sus montos iniciales, esperados, reales y diferencias, para mantener una auditoría contable transparente.

## Implementation Decisions

- **Arquitectura de Navegación (react-router):**
  - Implementar una estructura de enrutamiento con `createBrowserRouter` o `<BrowserRouter>` envolviendo la aplicación.
  - Crear un componente de Layout principal (`DashboardLayout`) que aloje:
    - Sidebar lateral de navegación con enlaces a Taller, Terminal PdV, Historial de Ventas y Corte de Caja, respetando estados activos y accesibilidad.
    - Header superior con selector de usuario/bloqueo de pantalla e indicador en tiempo real del estado de la caja (badge verde para abierto, badge ámbar para cerrado).
    - Contenedor dinámico de rutas hijas (`<Outlet />`).
  - Redirigir la ruta raíz `/` hacia `/taller`.
- **Capa de Tipos y Contratos de Datos:**
  - Extender los tipos del frontend para modelar las entidades de catálogo (`Categoria`, `Producto`, `Variacion`), ventas (`Venta`, `VentaDetalle`, `CreateVentaInput`) y corte de caja (`CorteCaja`, `CorteCajaActivoResponse`, `AbrirCorteInput`, `CerrarCorteInput`).
  - Extender el cliente de API HTTP para interactuar con los endpoints existentes del backend:
    - Inventario: `GET /api/inventario/categorias`, `GET /api/inventario/productos`, `GET /api/inventario/variaciones`.
    - POS: `POST /api/pos/ventas`, `GET /api/pos/ventas`, `GET /api/pos/ventas/:id`.
    - Corte de Caja: `GET /api/corte-caja/activo`, `POST /api/corte-caja/abrir`, `POST /api/corte-caja/:id/cerrar`, `GET /api/corte-caja`.
- **Módulos de Estado de Servidor (TanStack Query):**
  - Crear módulos de query dedicados para `pos`, `inventario` y `corte-caja` siguiendo el patrón del repositorio: `keys.ts`, `queries.ts` e `index.ts`.
  - Configurar invalidación cruzada dirigida: al registrar una venta exitosa en `pos`, invalidar las listas de ventas, el corte de caja activo y el catálogo de variaciones/productos (para actualizar stock en caché).
- **Manejo de Estado del Carrito (Client State):**
  - Administrar el carrito de compra en la terminal como estado cliente reactivo, asegurando que los ítems contengan variaciónId, producto, cantidad, precio unitario aplicado, precio base y si es servicio.
  - Regla de negocio de precios:
    - Servicios: precio unitario editable libremente en el renglón.
    - Productos físicos: precio base fijo protegido, con acción explícita para habilitar ajuste promocional.
- **Flujo de Cobro y Cierre de Venta:**
  - Sin impresión física automática (`window.print()`). Al confirmar la venta: emitir la mutación, mostrar alerta de éxito toast/banner, limpiar el carrito y refrescar las queries correspondientes.
- **Diseño Visual y Componentes UI:**
  - Componer pantallas utilizando exclusivamente los componentes base de shadcn instalados (`packages/frontend/src/components/ui/`), aplicando tokens semánticos de color, espaciado con flex/grid y gaps, e iconos de `lucide-react`.

## Testing Decisions

- **Criterio de Buen Test:**
  - Evaluar el comportamiento observable del sistema y las transiciones del estado del servidor, evitando acoplarse a detalles internos de implementación.
  - Validar que las jerarquías de query keys sean deterministas y tipadas.
  - Verificar que las mutaciones de venta y corte de caja ejecuten invalidación selectiva de las caches relacionadas (ventas, stock de variaciones y estado del corte) sin purgar caches ajenas (como clientes o tickets no relacionados).
- **Módulos a Probar:**
  - Módulos de TanStack Query para POS, Inventario y Corte de Caja (`keys.ts`, `queries.ts` e invalidaciones cruzadas).
  - Comportamiento de discriminación de errores y políticas de reintento en peticiones de venta y arqueo.
- **Arte Previo en el Repositorio:**
  - Pruebas unitarias de estado del servidor en `packages/frontend/src/queries/server-state.test.ts`.

## Out of Scope

- Impresión en papel o formateo térmico (`window.print()`, tickets ESC/POS).
- Modificación de endpoints existentes en el backend (se consumen los endpoints actuales de `src/routes/pos.ts`, `inventario.ts` y `corte-caja.ts`).
- Facturación electrónica fiscal (CFDI / SAT).
- Pagos electrónicos integrados por hardware (terminal bancaria física / datáfono vía webhook).

## Further Notes

- El backend ya cuenta con datos de prueba generados por seed (categorías de Refacciones, Accesorios y Servicios, con productos y variaciones asociadas, y un corte de caja inicial).
- En el punto de venta, cuando un cliente no se especifica, el campo `clienteId` se envía como `null` en la venta, registrándose como Público en General.
