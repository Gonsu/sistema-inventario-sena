import { useAuth } from '../context/AuthContext';
import { ContactoForm } from '../components/help/ContactoForm';
import { ContactoGrid } from '../components/help/ContactoGrid';
import { FaqSection } from '../components/help/FaqSection';
import { RecursosGrid } from '../components/help/RecursosGrid';

export default function AyudaPage() {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <>
      <header>
        <h1 className="font-title text-3xl font-bold text-sena-header">Centro de Ayuda</h1>
        <p className="font-data text-base text-sena-header/80">
          Encuentra respuestas y soporte técnico
        </p>
      </header>
      <FaqSection rol={user.rol} />
      <ContactoGrid />
      <RecursosGrid />
      <ContactoForm />
    </>
  );
}
