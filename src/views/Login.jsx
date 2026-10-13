// Importar useState para guardar lo que el usuario escribe en el formulario
import { useState } from 'react';

// Importar herramientas de navegación de React Router
import { Navigate, useNavigate } from 'react-router-dom';

// Importar el contexto de sesión (para saber si ya hay alguien conectado y poder iniciar sesión)
import { useAuth } from '../context/AuthContext';

// Importar a qué panel debe ir cada rol
import { RUTA_INICIO } from '../utils/constants';

// Importar componentes visuales
import Alerta from '../components/ui/Alerta';
import SenaLogo from '../components/ui/SenaLogo';

// Pantalla de inicio de sesión.
// El usuario elige su rol (Instructor o Administrativo), escribe correo y contraseña,
// y si los datos son correctos lo enviamos a su panel.
function Login() {
  // Usuario en sesión y función para iniciar sesión
  const { user, login } = useAuth();
  // navigate sirve para cambiar de pantalla desde el código
  const navigate = useNavigate();
  // Estados del formulario: cada uno guarda un dato que puede cambiar
  const [rol, setRol] = useState('instructor');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [cargando, setCargando] = useState(false);

  // Si ya hay una sesión abierta no tiene sentido mostrar el login: ir directo al panel
  if (user) return <Navigate to={RUTA_INICIO[user.rol]} replace />;

  // Se ejecuta al presionar "Ingresar"
  const enviar = async (e) => {
    // Evitar que el formulario recargue la página
    e.preventDefault();
    setError(null);
    setCargando(true);
    try {
      // Validar las credenciales y, si son correctas, ir al panel del rol
      const u = await login({ rol, correo, password });
      navigate(RUTA_INICIO[u.rol], { replace: true });
      // Si algo falla, mostrar el mensaje de error y volver a habilitar el botón
    } catch (err) {
      setError(err.message);
      setCargando(false);
    }
  };

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <div className="flex min-h-screen items-center justify-center bg-sena-bg p-4">
      <form onSubmit={enviar} className="card w-full max-w-sm space-y-4">
        {/* Encabezado verde con el logo del SENA */}
        <div className="flex flex-col items-center gap-2 rounded-input bg-sena-header p-4">
          <SenaLogo className="h-14 w-14" />
          <h1 className="text-lg text-white">Inventario SENA</h1>
        </div>
        {/* Botones para elegir el rol: el seleccionado se pinta de verde */}
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
          {/* Campo de correo */}
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
          {/* Campo de contraseña */}
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
        {/* Mensaje de error (solo aparece si hay un error) */}
        {error && <Alerta>{error}</Alerta>}
        {/* Botón para enviar el formulario */}
        <button type="submit" className="btn-primary w-full" disabled={cargando}>
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;
