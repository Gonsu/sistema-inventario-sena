import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RUTA_INICIO } from '../components/layout/ProtectedRoute';
import { Alerta } from '../components/ui/Primitives';
import { SenaLogo } from '../components/ui/SenaLogo';

// Login mínimo para poder navegar a los paneles. Si ya tienes tu propia vista
// de Login, reemplaza este archivo manteniendo la llamada a `login()`.
export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [rol, setRol] = useState('instructor');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  if (user) return <Navigate to={RUTA_INICIO[user.rol]} replace />;

  const enviar = async (e) => {
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      const u = await login({ rol, correo, password });
      navigate(RUTA_INICIO[u.rol], { replace: true });
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-sena-bg p-4">
      <form onSubmit={enviar} className="card w-full max-w-sm space-y-4">
        <div className="flex flex-col items-center gap-2 rounded-input bg-sena-header p-4">
          <SenaLogo className="h-14 w-14" />
          <h1 className="text-lg text-white">Inventario SENA</h1>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {['instructor', 'administrativo'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRol(r)}
              className={`btn border ${rol === r ? 'border-sena-primary bg-sena-primary text-white' : 'border-sena-card-border bg-white text-sena-header'}`}
            >
              {r === 'instructor' ? 'Instructor' : 'Administrativo'}
            </button>
          ))}
        </div>
        <div>
          <label className="label" htmlFor="correo">
            Correo
          </label>
          <input
            id="correo"
            type="email"
            className="input"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
            autoComplete="username"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">
            Contraseña
          </label>
          <input
            id="password"
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        {error && <Alerta>{error}</Alerta>}
        <button type="submit" className="btn-primary w-full" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}
