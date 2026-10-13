# Guía de estilo del proyecto

Sistema de Inventario SENA (React 18 + Vite + Tailwind). Antes de cambiar algo, lee `CONTEXTO.md`.

El código sigue la organización y la forma de redactar del proyecto **AmbiGest**. Todo cambio nuevo debe seguir estas reglas:

## Organización

- Cada pantalla va en `src/views/` y se llama como la pantalla, en español (`PanelInstructor.jsx`, `Reportes.jsx`).
- Las piezas de una pantalla van en `src/components/<seccion>/`; las reutilizables, en `src/components/ui/`.
- **Un componente por archivo.** Si un archivo empieza a tener varios componentes que se usan en otras partes, se separan.
- Los estilos propios van en `src/styles/` (`base.css` y `styles/components/*.css`) y se importan desde `src/index.css`. En el JSX se siguen usando clases de Tailwind.
- La lógica que guarda o calcula datos va en `src/services/`, no dentro de los componentes.

## Forma de escribir un componente

```jsx
// Importar herramientas básicas de React
import { useState } from 'react';

// Importar componentes visuales reutilizables
import SectionCard from '../components/ui/SectionCard';

// Qué es esta pantalla o componente y para qué sirve (en una o dos líneas).
function NombreDelComponente({ prop1, prop2 }) {
  // Para qué sirve este estado
  const [valor, setValor] = useState('');

  // Qué hace esta función
  const guardar = () => { ... };

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <SectionCard titulo="...">
      {/* Qué es este bloque */}
      ...
    </SectionCard>
  );
}

export default NombreDelComponente;
```

- `function Nombre() { ... }` y `export default Nombre;` **al final** del archivo (no `export default function` ni exports con nombre en componentes).
- Hooks, servicios y utilidades sí usan exports con nombre (`export function ...`), porque un archivo puede tener varias funciones.
- Imports agrupados, cada grupo con un comentario `// Importar ...` y una línea en blanco entre grupos.

## Comentarios

- En español, sencillos, explicando **para qué** sirve cada cosa, pensados para alguien que está aprendiendo React.
- Un comentario arriba de cada componente y de cada función exportada.
- Comentarios `{/* ... */}` sobre cada bloque importante del JSX.
- Nada de JSDoc `/** */` salvo en `src/types/index.js`.

## Antes de terminar

- `npm run build` debe compilar sin errores.
- Formato: `npx prettier --write --print-width 100 --single-quote "src/**/*.{js,jsx}"`.
