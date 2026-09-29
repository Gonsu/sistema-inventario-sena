import type { ContratoCategoria, Contrato, Coordinacion, ItemContrato } from '../types';
import { PRESUPUESTO_CONTRATOS } from '../utils/constants';

interface SeedItem {
  codigo: string;
  nombre: string;
  valorUnitario: number;
  cantidadTotal: number;
  ubicacion: string;
  coordinacion: Coordinacion;
}

interface SeedContrato {
  categoria: ContratoCategoria;
  nombre: string;
  numeroContrato: string;
  proveedor: string;
  items: SeedItem[];
}

// Los ítems de cada contrato suman exactamente PRESUPUESTO_CONTRATOS.
const CONTRATOS_SEED: SeedContrato[] = [
  {
    categoria: 'electronica',
    nombre: 'Electrónica',
    numeroContrato: 'CT-2026-001',
    proveedor: 'Tecnología Andina S.A.S.',
    items: [
      { codigo: 'ELEC-001', nombre: 'Laptop HP ProBook 440', valorUnitario: 3_200_000, cantidadTotal: 8, ubicacion: 'Bodega A', coordinacion: 'tecnologia' },
      { codigo: 'ELEC-002', nombre: 'Proyector Epson PowerLite', valorUnitario: 2_100_000, cantidadTotal: 4, ubicacion: 'Bodega A', coordinacion: 'administracion' },
      { codigo: 'ELEC-003', nombre: 'Multímetro digital Fluke', valorUnitario: 450_000, cantidadTotal: 10, ubicacion: 'Laboratorio 1', coordinacion: 'industria' },
      { codigo: 'ELEC-004', nombre: 'Kit Arduino Uno R3', valorUnitario: 190_000, cantidadTotal: 10, ubicacion: 'Laboratorio 1', coordinacion: 'tecnologia' },
    ],
  },
  {
    categoria: 'mobiliario',
    nombre: 'Mobiliario',
    numeroContrato: 'CT-2026-002',
    proveedor: 'Muebles del Oriente Ltda.',
    items: [
      { codigo: 'MOB-001', nombre: 'Silla ergonómica', valorUnitario: 385_000, cantidadTotal: 30, ubicacion: 'Bodega B', coordinacion: 'administracion' },
      { codigo: 'MOB-002', nombre: 'Mesa de trabajo 120x60', valorUnitario: 620_000, cantidadTotal: 12, ubicacion: 'Bodega B', coordinacion: 'diseno' },
      { codigo: 'MOB-003', nombre: 'Tablero acrílico', valorUnitario: 530_000, cantidadTotal: 4, ubicacion: 'Bodega B', coordinacion: 'diseno' },
    ],
  },
  {
    categoria: 'herramientas',
    nombre: 'Herramientas',
    numeroContrato: 'CT-2026-003',
    proveedor: 'Ferretería Industrial Cúcuta',
    items: [
      { codigo: 'HER-001', nombre: 'Taladro percutor DeWalt', valorUnitario: 540_000, cantidadTotal: 8, ubicacion: 'Taller', coordinacion: 'construccion' },
      { codigo: 'HER-002', nombre: 'Juego de destornilladores', valorUnitario: 95_000, cantidadTotal: 20, ubicacion: 'Taller', coordinacion: 'industria' },
      { codigo: 'HER-003', nombre: 'Caja de herramientas completa', valorUnitario: 780_000, cantidadTotal: 6, ubicacion: 'Taller', coordinacion: 'construccion' },
      { codigo: 'HER-004', nombre: 'Pinza amperimétrica', valorUnitario: 260_000, cantidadTotal: 4, ubicacion: 'Taller', coordinacion: 'industria' },
    ],
  },
];

export function construirInventarioInicial(): { contratos: Contrato[]; items: ItemContrato[] } {
  const ahora = new Date().toISOString();
  const fin = new Date(new Date().getFullYear(), 11, 31).toISOString();
  const contratos: Contrato[] = [];
  const items: ItemContrato[] = [];

  for (const c of CONTRATOS_SEED) {
    const contratoId = `contrato-${c.categoria}`;
    contratos.push({
      id: contratoId,
      categoria: c.categoria,
      nombre: c.nombre,
      numeroContrato: c.numeroContrato,
      proveedor: c.proveedor,
      presupuesto: PRESUPUESTO_CONTRATOS[c.categoria],
      fechaInicio: ahora,
      fechaFin: fin,
      actualizadoEn: ahora,
    });
    for (const it of c.items) {
      items.push({
        id: `item-${it.codigo.toLowerCase()}`,
        contratoId,
        nombre: it.nombre,
        codigo: it.codigo,
        valorUnitario: it.valorUnitario,
        cantidadTotal: it.cantidadTotal,
        cantidadDisponible: it.cantidadTotal,
        ubicacion: it.ubicacion,
        coordinacion: it.coordinacion,
        estado: 'disponible',
        actualizadoEn: ahora,
      });
    }
  }
  return { contratos, items };
}

/** Usuarios de demostración (las contraseñas se hashean al sembrar). */
export const USUARIOS_SEED = [
  { id: 'user-instructor-1', nombre: 'Laura Martínez', correo: 'instructor@sena.edu.co', password: 'Instructor123', rol: 'instructor' },
  { id: 'user-instructor-2', nombre: 'Carlos Pérez', correo: 'instructor2@sena.edu.co', password: 'Instructor123', rol: 'instructor' },
  { id: 'user-admin-1', nombre: 'Administración SENA', correo: 'admin@sena.edu.co', password: 'Admin123', rol: 'administrativo' },
] as const;

/** Coordinación por código, para datos guardados antes de existir el campo. */
const COORDINACION_POR_CODIGO: Record<string, Coordinacion> = Object.fromEntries(
  CONTRATOS_SEED.flatMap((c) => c.items.map((i) => [i.codigo, i.coordinacion])),
);

export function coordinacionDeItem(item: Pick<ItemContrato, 'codigo' | 'coordinacion'>): Coordinacion {
  return item.coordinacion ?? COORDINACION_POR_CODIGO[item.codigo] ?? 'administracion';
}
