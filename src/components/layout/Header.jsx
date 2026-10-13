// Importar NavLink (enlace que sabe si está activo) y useNavigate (cambiar de pantalla)
import { NavLink, useNavigate } from 'react-router-dom';

// Importar el contexto de sesión
import { useAuth } from '../../context/AuthContext';

// Importar el logo
import SenaLogo from '../ui/SenaLogo';

// Opciones del menú según el rol del usuario
const NAV = {
  instructor: [
    { to: '/dashboard/instructor', label: 'Instructor' },
    { to: '/dashboard/ayuda', label: 'Ayuda' },
  ],
  administrativo: [
    { to: '/dashboard/administrativos', label: 'Administrativos' },
    { to: '/dashboard/ayuda', label: 'Ayuda' },
    { to: '/dashboard/reportes', label: 'Reportes' },
  ],
};

// Clases del enlace del menú: el de la pantalla actual se pinta de verde
const claseEnlace = ({ isActive }) =>
  `rounded-input px-3 py-2 font-title text-sm font-semibold transition-colors ${
    isActive
      ? 'bg-sena-primary text-white shadow-inner'
      : 'text-white/85 hover:bg-sena-primary/60 hover:text-white'
  }`;

// Encabezado verde con el logo, el nombre del usuario, el menú y el botón de cerrar sesión
function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  // Sin sesión no se muestra nada
  if (!user) return null;

  // Cerrar sesión y volver al login
  const salir = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-sena-header shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        {/* Logo y nombre del usuario */}
        <div className="flex items-center gap-3">
          <SenaLogo />
          <div className="leading-tight">
            <p className="font-title text-base font-bold text-white">Inventario SENA</p>
            <p className="font-data text-xs text-white/75">{user.nombre}</p>
          </div>
        </div>
        {/* Menú de navegación */}
        <nav className="flex flex-wrap items-center gap-1" aria-label="Navegación principal">
          {/* Crear un enlace por cada opción del menú de este rol */}
          {NAV[user.rol].map((l) => (
            <NavLink key={l.to} to={l.to} className={claseEnlace}>
              {l.label}
            </NavLink>
          ))}
          {/* Botón de cerrar sesión */}
          <button
            onClick={salir}
            className="rounded-input px-3 py-2 font-title text-sm font-semibold text-white/85 hover:bg-red-700/80 hover:text-white"
          >
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
