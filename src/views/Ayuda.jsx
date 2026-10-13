// Importar el contexto de sesión para saber el rol del usuario
import { useAuth } from '../context/AuthContext';

// Importar las secciones del centro de ayuda
import ContactoForm from '../components/help/ContactoForm';
import ContactoGrid from '../components/help/ContactoGrid';
import FaqSection from '../components/help/FaqSection';
import RecursosGrid from '../components/help/RecursosGrid';

// Pantalla del Centro de Ayuda.
// La pueden ver instructores y administrativos; las preguntas frecuentes cambian según el rol.
function Ayuda() {
  // Traer el usuario que inició sesión
  const { user } = useAuth();
  if (!user) return null;

  // Todo componente de React debe retornar un solo contenedor padre (aquí un fragmento <>)
  return (
    <>
      {/* Título de la pantalla */}
      <header>
        <h1 className="font-title text-3xl font-bold text-sena-header">Centro de Ayuda</h1>
        <p className="font-data text-base text-sena-header/80">
          Encuentra respuestas y soporte técnico
        </p>
      </header>
      {/* Preguntas frecuentes según el rol */}
      <FaqSection rol={user.rol} />
      {/* Datos de contacto de soporte */}
      <ContactoGrid />
      {/* Manuales y recursos descargables */}
      <RecursosGrid />
      {/* Formulario para escribirle a soporte */}
      <ContactoForm />
    </>
  );
}

export default Ayuda;
