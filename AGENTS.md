# Reglas y Estándares de Desarrollo - TicketFlow

Guía de diseño, arquitectura y convenciones para agentes de IA y desarrolladores en el repositorio TicketFlow.

---

## 1. Frontend: Shadcn UI & Componentes

### 1.1 Jerarquía de Selección de Componentes
1. **Reutilizar instalados:** Comprobar siempre `packages/frontend/src/components/ui/` antes de crear elementos visuales.
2. **Instalar del registro shadcn:** Si no está instalado, añadirlo mediante el CLI oficial:
   ```bash
   bunx --bun shadcn@latest add <componente>
   ```
3. **Creación de componentes nuevos (solo si no existe en shadcn):**
   - **Primitivas genéricas reutilizables:** Ubicar en `packages/frontend/src/components/ui/<componente>.tsx`. Diseñar siguiendo las convenciones de shadcn: Base UI como motor accesible (o etiquetas nativas con accesibilidad ARIA), variantes con `class-variance-authority` (CVA) y combinación de clases con `cn()` (`@/lib/utils`).
   - **Componentes de dominio o pantalla:** Ubicar en `packages/frontend/src/components/<modulo>/<Componente>.tsx`, componiendo exclusivamente primitivas de `ui/`.

### 1.2 Reglas Críticas de Composición y Estilo
- **Tokens Semánticos:** Usar únicamente variables semánticas (`bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `bg-destructive`, `border-border`). Evitar colores fijos directos (ej. `bg-blue-600` o `#1e40af`).
- **Espaciado y Layout:** Utilizar `flex` / `grid` con `gap-*` (ej. `flex flex-col gap-4`). Evitar clases `space-y-*` o `space-x-*`.
- **Dimensiones cuadradas:** Emplear `size-*` (ej. `size-8`, `size-10`) en lugar de `w-* h-*`.
- **Elementos de Estado y Feedback:**
  - Avisos / Mensajes informativos: usar `Alert` (`<Alert>`, `<AlertTitle>`, `<AlertDescription>`).
  - Pantallas vacías: usar `Empty` (`<Empty>`, `<EmptyHeader>`, `<EmptyMedia>`, `<EmptyTitle>`).
  - Indicadores de carga: usar `Spinner` o `Skeleton` con `data-icon` o tamaño explícito.
  - Etiquetas y badges de estado: usar `Badge` con variantes semánticas.
  - Separadores: usar `Separator` en vez de `<hr />` o bordes arbitrarios.
- **Formularios e Inputs (Base UI):**
  - Componer campos mediante `FieldGroup` y `Field` con sus subcomponentes (`FieldLabel`, `FieldDescription`, `FieldError`).
  - Inputs con botones/iconos integrados mediante `InputGroup` + `InputGroupInput` + `InputGroupAddon`.
  - Estados de validación: `data-invalid` en `Field` y `aria-invalid` en el control.
- **Iconos:**
  - Importar iconos exclusivamente de `lucide-react`.
  - En botones, usar el atributo `data-icon="inline-start"` o `data-icon="inline-end"` sin clases de tamaño (`size-4`).

---

## 2. Backend: Arquitectura Modular con Hono & Bun

### 2.1 Estructura por Dominios / Vertical Slice (`src/modules/<feature>/`)
Toda funcionalidad de backend debe residir en su módulo vertical dentro de `packages/backend/src/modules/<modulo>/`:

```
packages/backend/src/modules/<modulo>/
├── <modulo>.schema.ts   # Esquemas Zod de entrada/salida y tipos inferidos
├── <modulo>.service.ts  # Lógica de negocio y consultas a base de datos (Prisma)
├── <modulo>.routes.ts   # Rutas HTTP en Hono con zValidator y respuestas
└── index.ts             # Exportador de rutas, servicio y tipos públicos
```

### 2.2 Separación Estricta de Responsabilidades
- **Routes (`<modulo>.routes.ts`):**
  - Declara únicamente endpoints HTTP con Hono.
  - Valida `param`, `query` o `json` con `zValidator(...)`.
  - Extrae parámetros validados mediante `c.req.valid(...)` y delega la ejecución al `service`.
  - Retorna respuestas con códigos de estado HTTP semánticos (`200 OK`, `201 Created`, `204 No Content`).
  - **No** ejecuta consultas de base de datos ni lógica de negocio directamente en el route handler.
- **Service (`<modulo>.service.ts`):**
  - Métodos asíncronos puros e independientes del contexto HTTP (`c: Context`).
  - Ejecuta la persistencia y consultas mediante `db.orm`.
  - Lanza errores tipados de dominio cuando no se cumplen las precondiciones.
- **Schema (`<modulo>.schema.ts`):**
  - Define contratos con `zod` (`clienteIdParamSchema`, `createClienteSchema`, etc.).
  - Exporta tipos TypeScript inferidos (`z.infer<typeof schema>`).
- **Módulo de Referencia:** Consultar `packages/backend/src/modules/clientes/` como estándar vivo.

### 2.3 Manejo de Errores Centralizado
- Lanzar instancias de `AppError` (ubicadas en `packages/backend/src/lib/errors.ts`):
  - `NotFoundError` (404) cuando el recurso no existe.
  - `ConflictError` (409) ante duplicados o violaciones de unicidad.
  - `BadRequestError` (400) para reglas de negocio incumplidas.
  - `UnauthorizedError` (401) y `ForbiddenError` (403) para accesos denegados.
- El servidor central `packages/backend/src/index.ts` intercepta todos los errores en `app.onError` y genera respuestas JSON homogéneas `{ error: string, details?: unknown }`.

---

## 3. Contratos de Datos y Tipos entre Backend y Frontend

1. **Fuente Única de Verdad:** Los schemas Zod de backend en `src/modules/<modulo>/<modulo>.schema.ts` definen la forma de los datos.
2. **Consumo en Frontend:** Los tipos TypeScript para peticiones y respuestas se infieren directamente de estos schemas o se exportan para ser consumidos por los clientes de API y hooks de `@tanstack/react-query`.
3. **Cero Duplicación:** No crear interfaces manuales que redefinan campos ya modelados en los schemas de Zod o en los modelos de Prisma.

---

## 4. Comandos de Verificación
- **Backend:** `bun run --cwd packages/backend build` para compilar con `tsdown` y verificar tipos.
- **Frontend:** `bun run --cwd packages/frontend build` para validar bundle con Vite y TypeScript (`tsc -b`).
