import { NavLink, useNavigate } from 'react-router-dom';
import type { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { SenaLogo } from '../ui/SenaLogo';

const NAV: Record<UserRole, Array<{ to: string; label: string }>> = {
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

const claseEnlace = ({ isActive }: { isActive: boolean }) =>
  `rounded-input px-3 py-2 font-title text-sm font-semibold transition-colors ${
    isActive ? 'bg-sena-primary text-white shadow-inner' : 'text-white/85 hover:bg-sena-primary/60 hover:text-white'
  }`;

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  if (!user) return null;

  const salir = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-40 bg-sena-header shadow-md">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-3">
          <SenaLogo />
          <div className="leading-tight">
            <p className="font-title text-base font-bold text-white">Inventario SENA</p>
            <p className="font-data text-xs text-white/75">{user.nombre}</p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-1" aria-label="Navegación principal">
          {NAV[user.rol].map((l) => (
            <NavLink key={l.to} to={l.to} className={claseEnlace}>
              {l.label}
            </NavLink>
          ))}
          <button onClick={salir} className="rounded-input px-3 py-2 font-title text-sm font-semibold text-white/85 hover:bg-red-700/80 hover:text-white">
            Cerrar Sesión
          </button>
        </nav>
      </div>
    </header>
  );
}
