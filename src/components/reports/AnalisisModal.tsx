import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Contrato, ContratoCategoria, ItemContrato } from '../../types';
import { distribucionContrato, type InversionMes } from '../../services/reportes';
import { formatCOP } from '../../utils/format';
import { CONTRATO_COLOR, CONTRATO_LABEL } from '../../utils/labels';
import { Modal } from '../ui/Modal';

const SUPERFICIE = '#FFFFFF'; // fondo de la tarjeta de la gráfica
const CATEGORIAS: ContratoCategoria[] = ['electronica', 'mobiliario', 'herramientas'];
/** Paleta categórica validada (orden fijo) para los ítems de un contrato. */
const COLORES_PORCION = ['#1F6FA8', '#39A900', '#C44E2F', '#A77BCA'];
const MAX_PORCIONES = COLORES_PORCION.length;

const millones = (v: number) => `$${(v / 1_000_000).toLocaleString('es-CO', { maximumFractionDigits: 1 })} M`;

interface TooltipBarrasProps {
  active?: boolean;
  label?: string | number;
  payload?: ReadonlyArray<{ dataKey?: unknown; value?: unknown }>;
}

function TooltipBarras({ active, payload, label }: TooltipBarrasProps) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((acc, p) => acc + Number(p.value ?? 0), 0);
  return (
    <div className="rounded-input border border-sena-card-border bg-white px-3 py-2 font-data text-xs text-gray-800 shadow-card">
      <p className="mb-1 font-title font-bold text-sena-header">{label}</p>
      {[...payload].reverse().map((p) => {
        const cat = p.dataKey as ContratoCategoria;
        return (
          <p key={cat} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: CONTRATO_COLOR[cat].fondo }} aria-hidden />
              {CONTRATO_LABEL[cat]}
            </span>
            <span>{formatCOP(Number(p.value ?? 0))}</span>
          </p>
        );
      })}
      <p className="mt-1 flex justify-between gap-4 border-t border-sena-card-border pt-1 font-semibold">
        <span>Total</span>
        <span>{formatCOP(total)}</span>
      </p>
    </div>
  );
}

/** Leyenda en orden fijo de la pila; Mobiliario muestra la misma trama que sus barras. */
function LeyendaContratos() {
  return (
    <ul className="flex flex-wrap justify-center gap-4 pt-2 font-data text-xs text-gray-700">
      {CATEGORIAS.map((c) => (
        <li key={c} className="flex items-center gap-1.5">
          <svg width="12" height="12" aria-hidden>
            <rect width="12" height="12" rx="2" fill={c === 'mobiliario' ? 'url(#trama-mobiliario)' : CONTRATO_COLOR[c].fondo} />
          </svg>
          {CONTRATO_LABEL[c]}
        </li>
      ))}
    </ul>
  );
}

function InversionMensualChart({ datos, anio }: { datos: InversionMes[]; anio: number }) {
  const [verTabla, setVerTabla] = useState(false);
  const vacio = datos.every((m) => m.electronica + m.mobiliario + m.herramientas === 0);

  return (
    <section className="rounded-input bg-white p-4">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-base">Inversión Mensual {anio}</h3>
          <p className="font-data text-xs text-gray-600">Valor de las solicitudes aceptadas por mes de entrega</p>
        </div>
        <button type="button" className="font-title text-xs font-semibold text-sena-primary hover:underline" onClick={() => setVerTabla((v) => !v)}>
          {verTabla ? 'Ver gráfica' : 'Ver tabla'}
        </button>
      </div>

      {verTabla ? (
        <div className="max-h-72 overflow-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Mes</th>
                {CATEGORIAS.map((c) => <th key={c} className="text-right">{CONTRATO_LABEL[c]}</th>)}
                <th className="text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {datos.map((m) => (
                <tr key={m.mes}>
                  <td>{m.mes}</td>
                  {CATEGORIAS.map((c) => <td key={c} className="text-right">{formatCOP(m[c])}</td>)}
                  <td className="text-right font-semibold">{formatCOP(m.electronica + m.mobiliario + m.herramientas)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="relative h-72">
          {vacio && (
            <p className="absolute inset-0 z-10 flex items-center justify-center font-data text-sm text-gray-500">
              Aún no hay solicitudes aceptadas en {anio}.
            </p>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={datos} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
              <defs>
                {/* Textura para separar Mobiliario de Electrónica: sus verdes son muy cercanos. */}
                <pattern id="trama-mobiliario" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                  <rect width="6" height="6" fill={CONTRATO_COLOR.mobiliario.fondo} />
                  <line x1="0" y1="0" x2="0" y2="6" stroke="#FFFFFF" strokeOpacity={0.35} strokeWidth={2} />
                </pattern>
              </defs>
              <CartesianGrid vertical={false} stroke="#E4DCC5" />
              <XAxis dataKey="mes" tickLine={false} axisLine={{ stroke: '#C9C1A8' }} tick={{ fontSize: 12, fill: '#4B5563' }} />
              <YAxis tickFormatter={millones} tickLine={false} axisLine={false} width={64} tick={{ fontSize: 12, fill: '#4B5563' }} />
              <Tooltip content={<TooltipBarras />} cursor={{ fill: '#014011', fillOpacity: 0.06 }} />
              <Legend content={<LeyendaContratos />} />
              {CATEGORIAS.map((c, i) => (
                <Bar
                  key={c}
                  dataKey={c}
                  stackId="inversion"
                  fill={c === 'mobiliario' ? 'url(#trama-mobiliario)' : CONTRATO_COLOR[c].fondo}
                  stroke={SUPERFICIE}
                  strokeWidth={2}
                  maxBarSize={36}
                  radius={i === CATEGORIAS.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function DistribucionContratoChart({ contratos, items }: { contratos: Contrato[]; items: ItemContrato[] }) {
  const [categoria, setCategoria] = useState<ContratoCategoria>('electronica');
  const contrato = contratos.find((c) => c.categoria === categoria);
  const { porciones: todas, total } = distribucionContrato(items, contrato?.id);

  // Más ítems que colores validados: los menores se agrupan en "Otros".
  const ordenadas = [...todas].sort((a, b) => b.valor - a.valor);
  const porciones =
    ordenadas.length <= MAX_PORCIONES
      ? todas
      : [
          ...ordenadas.slice(0, MAX_PORCIONES - 1),
          ordenadas.slice(MAX_PORCIONES - 1).reduce(
            (acc, p) => ({ ...acc, valor: acc.valor + p.valor, porcentaje: acc.porcentaje + p.porcentaje }),
            { itemId: 'otros', nombre: 'Otros', valor: 0, porcentaje: 0 },
          ),
        ];

  return (
    <section className="rounded-input bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base">Distribución por Contrato</h3>
        <div className="flex overflow-hidden rounded-input border border-sena-primary" role="group" aria-label="Seleccionar contrato">
          {CATEGORIAS.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={categoria === c}
              onClick={() => setCategoria(c)}
              className={`px-3 py-1.5 font-title text-xs font-semibold ${categoria === c ? 'bg-sena-primary text-white' : 'bg-white text-sena-primary hover:bg-sena-card'}`}
            >
              {CONTRATO_LABEL[c]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid items-center gap-4 md:grid-cols-2">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={porciones}
                dataKey="valor"
                nameKey="nombre"
                outerRadius="80%"
                stroke="#FFFFFF"
                strokeWidth={2}
                label={({ x, y, percent, textAnchor }: { x?: number; y?: number; percent?: number; textAnchor?: string }) => (
                  <text x={x} y={y} textAnchor={textAnchor as 'start' | 'middle' | 'end'} dominantBaseline="central" fill="#374151" fontSize={12} fontFamily='"Josefin Sans", sans-serif'>
                    {`${((percent ?? 0) * 100).toFixed(1)}%`}
                  </text>
                )}
                labelLine={false}
                isAnimationActive={false}
              >
                {porciones.map((p, i) => <Cell key={p.itemId} fill={COLORES_PORCION[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => formatCOP(Number(v))} contentStyle={{ fontFamily: '"Josefin Sans", sans-serif', fontSize: 12, borderRadius: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <table className="table-base">
          <thead>
            <tr>
              <th>Ítem</th>
              <th className="text-right">Valor</th>
              <th className="text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {porciones.map((p, i) => (
              <tr key={p.itemId}>
                <td>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: COLORES_PORCION[i] }} aria-hidden />
                    {p.nombre}
                  </span>
                </td>
                <td className="text-right">{formatCOP(p.valor)}</td>
                <td className="text-right">{p.porcentaje.toFixed(1)}%</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-title font-bold text-sena-header">
              <td className="px-3 py-2">Total {CONTRATO_LABEL[categoria]}</td>
              <td className="px-3 py-2 text-right">{formatCOP(total)}</td>
              <td className="px-3 py-2 text-right">100%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </section>
  );
}

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  mensual: InversionMes[];
  anio: number;
  contratos: Contrato[];
  items: ItemContrato[];
}

export default function AnalisisModal({ abierto, onCerrar, mensual, anio, contratos, items }: Props) {
  return (
    <Modal
      abierto={abierto}
      titulo="Análisis Estadístico — Inventario"
      onCerrar={onCerrar}
      ancho="2xl"
      pie={<button className="btn-secondary" onClick={onCerrar}>Cerrar panel</button>}
    >
      <div className="space-y-5">
        <InversionMensualChart datos={mensual} anio={anio} />
        <DistribucionContratoChart contratos={contratos} items={items} />
      </div>
    </Modal>
  );
}
