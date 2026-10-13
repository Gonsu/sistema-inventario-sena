# Sistema de Inventario SENA — Contexto del proyecto

> Documento de contexto: qué se ha construido hasta ahora y cuál fue el último cambio.
> Actualizado: 2026-10-13.

## Resumen

Aplicación web (SPA) para gestionar el inventario de materiales del SENA: los **instructores** solicitan, reciben, devuelven y documentan materiales, y el personal **administrativo** aprueba solicitudes, administra los contratos y consulta reportes.

No hay backend: todos los datos viven en el navegador (`localStorage`), y la sesión en `sessionStorage`.

## Stack

| Área | Tecnología |
|---|---|
| UI | React 18 + React Router 6 |
| Build | Vite 6 |
| Estilos | Tailwind CSS 3 |
| Gráficas | Recharts |
| Exportación | jsPDF + jspdf-autotable (PDF), SheetJS `xlsx` (Excel); se cargan bajo demanda |
| Íconos | lucide-react |
| Lenguaje | **JavaScript** (JSX), con tipos documentados por JSDoc |

Comandos: `npm run dev`, `npm run build`, `npm run preview`.

## Historial

### 1. `06c850b` — Versión inicial (2026-09-29)

Primera versión completa del sistema, escrita en TypeScript:

- **Login por rol** (instructor / administrativo) con contraseñas en SHA-256 y rutas protegidas.
- **Panel del instructor**
  - Solicitud de materiales con el formato oficial SENA, PDF adjunto obligatorio y tope de presupuesto de **$3.000.000 COP** por solicitud.
  - Tabla "Mis materiales" con semáforo de días en uso (verde < 25, amarillo 25–44, rojo ≥ 45).
  - Devoluciones de materiales.
  - Evidencias fotográficas con la webcam o con archivo.
  - Historial de movimientos.
- **Panel administrativo**
  - Solicitudes pendientes: aceptarlas asigna los materiales y descuenta stock.
  - Solicitudes de compra (cuando no hay disponibilidad suficiente).
  - Grilla de contratos (Electrónica, Mobiliario, Herramientas) y edición de contratos con historial de cambios.
  - Revisión de evidencias e historial general.
- **Reportes** (solo para el administrativo): costos, entregas, trazabilidad y un modal de análisis con gráficas; exportación a PDF y XLSX.
- **Centro de ayuda**: preguntas frecuentes, recursos, contactos y formulario de contacto.
- **Sincronización entre pestañas**: polling cada 2 s sobre `localStorage`, más el evento `storage` y un evento propio para la pestaña actual.

### 2. `35515f8` — Migración de TypeScript a JavaScript (2026-10-06)

- Se convirtieron todos los `.ts/.tsx` a `.js/.jsx`, conservando la lógica y los comentarios.
- El modelo de datos quedó documentado con JSDoc en `src/types/index.js`.
- `tsconfig.json` se reemplazó por `jsconfig.json`, y `vite.config.ts` por `vite.config.js`.
- Se quitaron `typescript` y `@types/*` de las dependencias.
- Se agregó `public/favicon.svg` con el logo SENA (antes el favicon daba 404).
- Se ajustó el límite del aviso de tamaño de chunks en Vite, porque `xlsx` y `jspdf` se cargan bajo demanda.

### 3. Organización y redacción al estilo de AmbiGest (2026-10-13) ⬅ **último cambio**

Rama `estilo-ambigest`. No cambia lo que hace la aplicación: mismas pantallas, mismos datos y mismo aspecto (se comprobó con una prueba automática de punta a punta antes y después).

- `pages/` pasó a `views/`, con el nombre de cada pantalla: `Login`, `PanelInstructor`, `PanelAdministrativo`, `Reportes` y `Ayuda`.
- Un componente por archivo, escrito como `function Nombre() { ... }` con `export default Nombre;` al final.
  - `ui/Primitives.jsx` se separó en `SectionCard`, `SearchInput`, `EmptyState`, `CantidadBadge`, `Badge`, `Alerta` y `MetricCard`.
  - `reports/Controles.jsx` se separó en `FiltroSelect`, `FiltroContratoSelect`, `FiltroCoordinacionSelect` y `ContratoBadge`.
  - `useToast` pasó de `components/ui/Toast.jsx` a `hooks/useToast.jsx`, y `RUTA_INICIO` pasó a `utils/constants.js`.
- Los estilos propios salieron de `index.css` hacia `styles/base.css` y `styles/components/` (tarjeta, botones, formularios y tablas).
- Comentarios en español en todos los archivos: qué importa cada grupo, qué hace cada componente y función, y qué es cada bloque del JSX.
- Se agregó `CLAUDE.md` con la guía de estilo, para que Claude Code la siga en los cambios futuros.

## Estructura

```
src/
├── App.jsx                 # Mapa de rutas (las vistas se cargan con lazy)
├── main.jsx                # Punto de entrada: carga los datos iniciales y dibuja <App />
├── index.css               # Activa Tailwind e importa la carpeta styles/
├── views/                  # Una pantalla por archivo
│   ├── Login.jsx
│   ├── PanelInstructor.jsx
│   ├── PanelAdministrativo.jsx
│   ├── Reportes.jsx
│   └── Ayuda.jsx
├── components/             # Piezas de las pantallas (un componente por archivo)
│   ├── admin/              # Solicitudes, contratos, evidencias, historial
│   ├── instructor/         # Formulario SENA, selección de materiales, devoluciones, evidencias
│   ├── reports/            # Costos, entregas, trazabilidad, gráficas y filtros
│   ├── help/               # Preguntas frecuentes, recursos, contacto
│   ├── layout/             # Header, DashboardLayout, ProtectedRoute
│   └── ui/                 # Modal, ConfirmDialog, SectionCard, Badge, Alerta, MetricCard...
├── styles/
│   ├── base.css            # Fondo, tipografía y títulos
│   └── components/         # tarjeta, botones, formularios, tablas
├── context/AuthContext.jsx # Usuario en sesión
├── hooks/                  # useInventarioData, useLocalStorageSync, useToast, useWebcam
├── services/
│   ├── storage.js          # Leer y guardar en localStorage
│   ├── bootstrap.js        # Carga los datos iniciales si no existen
│   ├── auth.js             # Inicio y cierre de sesión
│   ├── inventario.js       # Reglas de negocio: solicitudes, aprobación, devolución, evidencias, contratos
│   └── reportes.js         # Cálculos para los reportes
├── data/seed.js            # Usuarios y contratos de prueba
├── types/index.js          # Modelo de datos (JSDoc)
└── utils/                  # Constantes, formato, exportación PDF/XLSX, textos, ids
```

## Rutas

| Ruta | Rol |
|---|---|
| `/login` | Público |
| `/dashboard/instructor` | instructor |
| `/dashboard/administrativos` | administrativo |
| `/dashboard/reportes` | administrativo |
| `/dashboard/ayuda` | Cualquier usuario autenticado |

## Datos

Las claves de `localStorage` llevan el prefijo `sena_inv_v1_`: `users`, `contratos`, `items`, `asignaciones`, `movimientos`, `solicitudes` y `evidencias`. La sesión (`sena_inv_v1_session`) se guarda en `sessionStorage`, así que cada pestaña tiene su propia sesión: se puede abrir un instructor y un administrativo en el mismo navegador.

Presupuestos iniciales de los contratos (`src/utils/constants.js`):

- Electrónica (CT-2026-001): $40.400.000
- Mobiliario (CT-2026-002): $21.110.000
- Herramientas (CT-2026-003): $11.940.000

### Usuarios de prueba

| Rol | Correo | Contraseña |
|---|---|---|
| Instructor | instructor@sena.edu.co | Instructor123 |
| Instructor | instructor2@sena.edu.co | Instructor123 |
| Administrativo | admin@sena.edu.co | Admin123 |

> Para reiniciar los datos, borra las claves `sena_inv_v1_*` del `localStorage` del navegador y recarga la página.

## Limitaciones conocidas

- Sin backend ni base de datos: los datos son locales a cada navegador y los PDF y fotos adjuntos ocupan la cuota de `localStorage` (~5 MB). Cuando se llena, la app lanza `StorageQuotaError`.
- La autenticación es solo del lado del cliente; sirve para demostración, no da seguridad real.
- No hay pruebas automatizadas.
