// Importar herramientas básicas de React
import { useEffect, useMemo, useState } from 'react';

// Importar los datos del inventario (se actualizan solos cuando cambian)
import { useCatalogo } from '../../hooks/useInventarioData';

// Importar las reglas de negocio del inventario
import { calcularTotal, crearSolicitud } from '../../services/inventario';

// Importar constantes del sistema
import { PRESUPUESTO_MAX_SOLICITUD } from '../../utils/constants';

// Importar componentes visuales reutilizables
import Modal from '../ui/Modal';
import Alerta from '../ui/Alerta';

// Importar componentes de esta misma sección
import FormularioSena from './FormularioSena';
import PresupuestoBar from './PresupuestoBar';
import SeleccionMateriales from './SeleccionMateriales';

// Datos iniciales del formulario: se toma el nombre del usuario y se separa en nombre y apellido
function formularioInicial(usuario) {
  const [nombre = '', ...resto] = usuario.nombre.split(' ');
  return {
    nombre,
    apellido: resto.join(' '),
    programa: '',
    tipoFormacion: 'tecnologo',
  };
}

// Ventana para hacer una nueva solicitud de materiales. Tiene dos pasos:
//  1. Elegir los materiales y cantidades (SeleccionMateriales)
//  2. Llenar el formato SENA y adjuntar el PDF (FormularioSena)
function SolicitudMaterialesModal({ abierto, onCerrar, usuario, onExito }) {
  // Catálogo de materiales y contratos
  const { items, contratos, itemPorId } = useCatalogo();
  // Estados de la ventana:
  //  - fase: paso actual (1 o 2)
  //  - seleccion: materiales elegidos { id: cantidad }
  //  - formulario: datos del formato SENA
  //  - pdf: archivo adjunto
  //  - numero y fecha: identificación de la solicitud
  const [fase, setFase] = useState(1);
  const [seleccion, setSeleccion] = useState({});
  const [formulario, setFormulario] = useState(() => formularioInicial(usuario));
  const [pdf, setPdf] = useState(null);
  const [error, setError] = useState(null);
  const [numero, setNumero] = useState('');
  const [fecha, setFecha] = useState('');
  const [enviando, setEnviando] = useState(false);

  // Deja la ventana como nueva
  const limpiar = () => {
    setFase(1);
    setSeleccion({});
    setFormulario(formularioInicial(usuario));
    setPdf(null);
    setError(null);
    setEnviando(false);
  };

  // Cada vez que se abre: limpiar y generar un número de solicitud nuevo
  useEffect(() => {
    if (abierto) {
      limpiar();
      const ahora = Date.now();
      setNumero(`SOL-${ahora}`);
      setFecha(new Date(ahora).toISOString());
    }
  }, [abierto]);

  // Convertir la selección en una lista de { material, cantidad }
  const lineas = useMemo(
    () =>
      Object.entries(seleccion).flatMap(([itemId, cantidad]) => {
        const item = itemPorId.get(itemId);
        return item ? [{ item, cantidad }] : [];
      }),
    [seleccion, itemPorId],
  );
  // Valor total de la solicitud y si se pasa del tope
  const total = calcularTotal(
    lineas.map(({ item, cantidad }) => ({
      cantidad,
      valorUnitario: item.valorUnitario,
    })),
  );
  const excedido = total > PRESUPUESTO_MAX_SOLICITUD;

  // Crear la solicitud y avisar al usuario
  const enviar = () => {
    setEnviando(true);
    try {
      const solicitud = crearSolicitud({
        instructorId: usuario.id,
        lineas: lineas.map(({ item, cantidad }) => ({
          itemId: item.id,
          cantidad,
        })),
        formulario,
        formatoPdf: pdf,
        numero,
      });
      onExito(`Solicitud ${solicitud.numero} enviada. Queda pendiente de aprobación.`);
      limpiar();
      onCerrar();
      // Si algo no es válido, mostrar el error
    } catch (e) {
      setError(e.message);
      setEnviando(false);
    }
  };

  // Botones de abajo: cambian según el paso en el que esté el usuario
  const pie =
    fase === 1 ? (
      <>
        <button className="btn-secondary" onClick={onCerrar}>
          Cancelar
        </button>
        <button
          className="btn-primary"
          disabled={lineas.length === 0 || excedido}
          onClick={() => {
            setError(null);
            setFase(2);
          }}
        >
          Continuar al formulario →
        </button>
      </>
    ) : (
      <>
        <button className="btn-secondary" onClick={() => setFase(1)} disabled={enviando}>
          ← Volver
        </button>
        <button
          className="btn-primary"
          onClick={enviar}
          disabled={
            enviando ||
            excedido ||
            !pdf ||
            !formulario.nombre.trim() ||
            !formulario.apellido.trim() ||
            !formulario.programa.trim()
          }
        >
          {enviando ? 'Enviando…' : 'Enviar solicitud'}
        </button>
      </>
    );

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <Modal
      abierto={abierto}
      titulo={
        fase === 1 ? 'Nueva Solicitud — Selección de materiales' : 'Nueva Solicitud — Formato SENA'
      }
      onCerrar={onCerrar}
      ancho="2xl"
      pie={pie}
    >
      <div className="space-y-4">
        {/* Barra de presupuesto (se ve en los dos pasos) */}
        <PresupuestoBar total={total} />
        {fase === 1 ? (
          <SeleccionMateriales
            items={items}
            contratos={contratos}
            seleccion={seleccion}
            onCambiar={setSeleccion}
          />
        ) : (
          <FormularioSena
            numero={numero}
            fecha={fecha}
            formulario={formulario}
            onFormulario={setFormulario}
            lineas={lineas}
            total={total}
            pdf={pdf}
            onPdf={setPdf}
            onError={setError}
          />
        )}
        {/* Mensaje de error */}
        {error && <Alerta>{error}</Alerta>}
      </div>
    </Modal>
  );
}

export default SolicitudMaterialesModal;
