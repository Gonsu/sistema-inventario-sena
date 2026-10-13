// Importar Outlet: es el "hueco" donde React Router pone la vista de la ruta actual
import { Outlet } from 'react-router-dom';

// Importar el encabezado con el menú
import Header from './Header';

// Diseño general de todas las pantallas privadas:
// arriba el encabezado y debajo el contenido de la vista actual.
function DashboardLayout() {
  return (
    <div className="min-h-screen bg-sena-bg">
      {/* Encabezado fijo con el menú de navegación */}
      <Header />
      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        {/* Aquí se dibuja la vista (Panel, Reportes, Ayuda...) */}
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
