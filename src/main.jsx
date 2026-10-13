// Importar las herramientas de React para dibujar la aplicación en la página
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Importar los estilos globales (Tailwind + carpeta styles/)
import './index.css';

// Importar el componente principal con todas las rutas
import App from './App';

// Importar la función que carga los datos iniciales (usuarios, contratos, materiales)
import { inicializarAlmacenamiento } from './services/bootstrap';

// Primero se preparan los datos en el navegador y después se muestra la aplicación
// dentro del <div id="root"> de index.html
void inicializarAlmacenamiento().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
