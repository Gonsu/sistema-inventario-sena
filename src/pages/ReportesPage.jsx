import { lazy, Suspense, useMemo, useState } from 'react';
import { BarChart3, FileDown } from 'lucide-react';
import {
  useAsignaciones,
  useCatalogo,
  useSolicitudes,
  useUsuarios,
} from '../hooks/useInventarioData';
import {
  filasCostos,
  filasEntregas,
  filasTrazabilidad,
  filtrarEntregas,
  inversionMensual,
  proyeccionAnual,
  resumenInventario,
} from '../services/reportes';
import { exportarReportePDF } from '../utils/exportar';
import { CostosReporte } from '../components/reports/CostosReporte';
import { EntregasReporte } from '../components/reports/EntregasReporte';
import { TrazabilidadReporte } from '../components/reports/TrazabilidadReporte';
import { Alerta } from '../components/ui/Primitives';

// Recharts solo se descarga al abrir el modal.
const AnalisisModal = lazy(() => import('../components/reports/AnalisisModal'));

export default function ReportesPage() {
  const { items, contratos, itemPorId, contratoPorId } = useCatalogo();
  const solicitudes = useSolicitudes();
  const asignaciones = useAsignaciones();
  const usuarios = useUsuarios();

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
  const [graficas, setGraficas] = useState(false);
  const [exportando, setExportando] = useState(false);
  const [error, setError] = useState(null);

  const hoy = new Date();
  const anio = hoy.getFullYear();

  const costos = useMemo(
    () => filasCostos(items, contratoPorId, fCostos),
    [items, contratoPorId, fCostos],
  );
  const mensual = useMemo(
    () => inversionMensual(solicitudes, itemPorId, contratoPorId, anio),
    [solicitudes, itemPorId, contratoPorId, anio],
  );
  const { ejecutado, proyeccion } = proyeccionAnual(mensual, hoy);

  const entregasTodas = useMemo(
    () => filasEntregas(solicitudes, itemPorId, contratoPorId),
    [solicitudes, itemPorId, contratoPorId],
  );
  const entregasSinEstado = useMemo(
    () => filtrarEntregas(entregasTodas, { ...fEntregas, estado: '' }),
    [entregasTodas, fEntregas],
  );
  const entregas = useMemo(
    () => filtrarEntregas(entregasTodas, fEntregas),
    [entregasTodas, fEntregas],
  );

  const trazabilidad = useMemo(
    () => filasTrazabilidad(asignaciones, itemPorId, usuarios, fTraza),
    [asignaciones, itemPorId, usuarios, fTraza],
  );
  const resumen = useMemo(() => resumenInventario(items), [items]);

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

  return (
    <>
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
      {error && <Alerta>{error}</Alerta>}

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
