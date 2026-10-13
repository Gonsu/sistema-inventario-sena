// Importar herramientas básicas de React
import { lazy, Suspense, useMemo, useState } from 'react';

// Importar íconos
import { BarChart3, FileDown } from 'lucide-react';

// Importar los datos del inventario
import {
  useAsignaciones,
  useCatalogo,
  useSolicitudes,
  useUsuarios,
} from '../hooks/useInventarioData';

// Importar los cálculos de cada reporte
import {
  filasCostos,
  filasEntregas,
  filasTrazabilidad,
  filtrarEntregas,
  inversionMensual,
  proyeccionAnual,
  resumenInventario,
} from '../services/reportes';

// Importar la función que genera el PDF
import { exportarReportePDF } from '../utils/exportar';

// Importar las secciones de reportes
import CostosReporte from '../components/reports/CostosReporte';
import EntregasReporte from '../components/reports/EntregasReporte';
import TrazabilidadReporte from '../components/reports/TrazabilidadReporte';

// Importar componentes visuales
import Alerta from '../components/ui/Alerta';

// Importar la ventana de gráficas con lazy:
// la librería de gráficas (Recharts) solo se descarga cuando se abre.
const AnalisisModal = lazy(() => import('../components/reports/AnalisisModal'));

// Pantalla de Reportes y Análisis (solo administrativos).
// Muestra tres reportes: costos, entregas y trazabilidad,
// y permite exportarlos a PDF o ver las gráficas.
function Reportes() {
  // Traer todos los datos que se van a analizar
  const { items, contratos, itemPorId, contratoPorId } = useCatalogo();
  const solicitudes = useSolicitudes();
  const asignaciones = useAsignaciones();
  const usuarios = useUsuarios();

  // Filtros de cada reporte (lo que el usuario elige en los selects y buscadores)
  const [fCostos, setFCostos] = useState({
    contrato: '',
    coordinacion: '',
    busqueda: '',
  });
  const [fEntregas, setFEntregas] = useState({
    contrato: '',
    coordinacion: '',
    estado: '',
  });
  const [fTraza, setFTraza] = useState({
    material: '',
    ubicacion: '',
    instructor: '',
    semaforo: '',
  });
  // graficas: si la ventana de gráficas está abierta
  // exportando: si se está generando el PDF (para deshabilitar el botón)
  const [graficas, setGraficas] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState(null);

  // Año actual, para el reporte de inversión
  const hoy = new Date();
  const anio = hoy.getFullYear();

  // ---- Reporte de costos ----
  // useMemo evita repetir el cálculo si los datos y filtros no cambiaron
  const costos = useMemo(
    () => filasCostos(items, contratoPorId, fCostos),
    [items, contratoPorId, fCostos],
  );
  const mensual = useMemo(
    () => inversionMensual(solicitudes, itemPorId, contratoPorId, anio),
    [solicitudes, itemPorId, contratoPorId, anio],
  );
  const { ejecutado, proyeccion } = proyeccionAnual(mensual, hoy);

  // ---- Reporte de entregas ----
  const entregasTodas = useMemo(
    () => filasEntregas(solicitudes, itemPorId, contratoPorId),
    [solicitudes, itemPorId, contratoPorId],
  );
  // Para los contadores se ignora el filtro de estado
  const entregasSinEstado = useMemo(
    () => filtrarEntregas(entregasTodas, { ...fEntregas, estado: '' }),
    [entregasTodas, fEntregas],
  );
  const entregas = useMemo(
    () => filtrarEntregas(entregasTodas, fEntregas),
    [entregasTodas, fEntregas],
  );

  // ---- Reporte de trazabilidad ----
  const trazabilidad = useMemo(
    () => filasTrazabilidad(asignaciones, itemPorId, usuarios, fTraza),
    [asignaciones, itemPorId, usuarios, fTraza],
  );
  const resumen = useMemo(() => resumenInventario(items), [items]);

  // Genera y descarga el PDF con los tres reportes (tal como están filtrados)
  const exportar = async () => {
    setError(null);
    setExportando(true);
    try {
      await exportarReportePDF({
        anio,
        costos,
        proyeccion,
        entregas,
        trazabilidad,
        resumen,
      });
    } catch {
      setError('No fue posible generar el PDF.');
    } finally {
      setExportando(false);
    }
  };

  // Todo componente de React debe retornar un solo contenedor padre
  return (
    <>
      {/* Título y botones de exportar / ver gráficas */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-title text-3xl font-bold text-sena-header">Reportes y Análisis</h1>
          <p className="font-data text-base text-sena-header/80">
            Información detallada sobre ítems, costos, coordinaciones, trazabilidad y estado de
            entregas
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={() => void exportar()} disabled={exportando}>
            <FileDown className="h-4 w-4" aria-hidden />{' '}
            {exportando ? 'Generando…' : 'Exportar PDF'}
          </button>
          <button
            className="btn bg-sena-header text-white hover:bg-black/80"
            onClick={() => setGraficas(true)}
          >
            <BarChart3 className="h-4 w-4" aria-hidden /> Ver Gráficas
          </button>
        </div>
      </header>
      {/* Error al exportar */}
      {error && <Alerta>{error}</Alerta>}

      {/* Los tres reportes */}
      <CostosReporte
        filtros={fCostos}
        onFiltros={setFCostos}
        filas={costos}
        anio={anio}
        ejecutado={ejecutado}
        proyeccion={proyeccion}
      />
      <EntregasReporte
        filtros={fEntregas}
        onFiltros={setFEntregas}
        todas={entregasSinEstado}
        filas={entregas}
      />
      <TrazabilidadReporte
        filtros={fTraza}
        onFiltros={setFTraza}
        filas={trazabilidad}
        resumen={resumen}
      />

      {/* Ventana de gráficas: solo se carga cuando el usuario la abre */}
      {graficas && (
        <Suspense fallback={null}>
          <AnalisisModal
            abierto
            onCerrar={() => setGraficas(false)}
            mensual={mensual}
            anio={anio}
            contratos={contratos}
            items={items}
          />
        </Suspense>
      )}
    </>
  );
}

export default Reportes;
