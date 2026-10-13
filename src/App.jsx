// Importar herramientas de React para cargar las pantallas solo cuando se necesitan
import { lazy, Suspense } from 'react';

// Importar los componentes de React Router para activar la navegación
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';

// Importar el contexto que guarda quién inició sesión
import { AuthProvider, useAuth } from './context/AuthContext';

// Importar el diseño general (encabezado + contenido) y la protección de rutas
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/layout/ProtectedRoute';

// Importar la pantalla de inicio que le corresponde a cada rol
import { RUTA_INICIO } from './utils/constants';

// Importar la vista Login.jsx (se carga de una vez porque es la primera pantalla)
import Login from './views/Login';

// Importar las demás vistas con lazy: el navegador las descarga solo cuando el usuario entra a ellas
const PanelInstructor = lazy(() => import('./views/PanelInstructor'));
const PanelAdministrativo = lazy(() => import('./views/PanelAdministrativo'));
const Ayuda = lazy(() => import('./views/Ayuda'));
const Reportes = lazy(() => import('./views/Reportes'));

// Redirige al usuario a su panel si ya inició sesión, o al login si no
function Inicio() {
  const { user } = useAuth();
  return <Navigate to={user ? RUTA_INICIO[user.rol] : '/login'} replace />;
}

// Mensaje que se ve mientras se descarga una vista
function Cargando() {
  return <p className="p-8 text-center font-data text-sena-header">Cargando…</p>;
}

function App() {
  return (
    // AuthProvider comparte el usuario en sesión con toda la aplicación
    <AuthProvider>
      {/* Router activa el mapa de navegación en toda la aplicación */}
      <Router>
        {/* Suspense muestra "Cargando…" mientras llega una vista cargada con lazy */}
        <Suspense fallback={<Cargando />}>
          {/* Routes actúa como un conmutador que lee la URL */}
          <Routes>
            {/* Ruta pública: inicio de sesión */}
            <Route path="/login" element={<Login />} />

            {/* Rutas privadas: todas comparten el encabezado de DashboardLayout */}
            <Route
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              {/* Panel del instructor: solo pueden entrar instructores */}
              <Route
                path="/dashboard/instructor"
                element={
                  <ProtectedRoute roles={['instructor']}>
                    <PanelInstructor />
                  </ProtectedRoute>
                }
              />

              {/* Panel administrativo: solo pueden entrar administrativos */}
              <Route
                path="/dashboard/administrativos"
                element={
                  <ProtectedRoute roles={['administrativo']}>
                    <PanelAdministrativo />
                  </ProtectedRoute>
                }
              />

              {/* Reportes: solo administrativos */}
              <Route
                path="/dashboard/reportes"
                element={
                  <ProtectedRoute roles={['administrativo']}>
                    <Reportes />
                  </ProtectedRoute>
                }
              />
              {/* Si alguien escribe la ruta corta "/reportes" lo llevamos a la completa */}
              <Route path="/reportes" element={<Navigate to="/dashboard/reportes" replace />} />

              {/* Centro de ayuda: cualquier usuario que haya iniciado sesión */}
              <Route path="/dashboard/ayuda" element={<Ayuda />} />
              <Route path="/ayuda" element={<Navigate to="/dashboard/ayuda" replace />} />
            </Route>

            {/* Cualquier otra ruta (incluida "/") redirige según la sesión */}
            <Route path="*" element={<Inicio />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
}

export default App;
