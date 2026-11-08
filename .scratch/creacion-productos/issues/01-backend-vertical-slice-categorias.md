# 01: Backend Vertical Slice y Creación Inline de Categorías

**What to build:** 
Un módulo backend modular para inventario siguiendo la arquitectura de referencia (`AGENTS.md`) con validaciones Zod y errores tipados (`AppError`), que permita listar y crear categorías de producto de forma validada (evitando duplicados), junto con las mutaciones frontend en React Query y un selector de categoría que permita crear una nueva categoría sobre la marcha ("+ Nueva categoría").

**Blocked by:** None (can start immediately)

**Status:** completed

- [x] Vertical slice backend `packages/backend/src/modules/inventario/` implementado (`inventario.schema.ts`, `inventario.service.ts`, `inventario.routes.ts`, `index.ts`).
- [x] Endpoint `POST /api/inventario/categorias` valida campos con Zod y lanza `ConflictError` si el nombre de categoría ya existe.
- [x] Endpoint `GET /api/inventario/categorias` retorna categorías con formato coherente.
- [x] Mutación frontend `useCreateCategoria` agregada en `packages/frontend/src/queries/inventario/` con invalidación de caché.
- [x] Selector/Combobox con opción inline de creación rápida de categoría (`+ Nueva categoría`) disponible para los formularios de producto.
- [x] Los tests o builds de backend y frontend compilan sin errores de tipos.
