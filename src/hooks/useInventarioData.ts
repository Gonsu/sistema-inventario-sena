import { useMemo } from 'react';
import type {
  Asignacion,
  Contrato,
  Evidencia,
  ItemContrato,
  Movimiento,
  Solicitud,
  User,
} from '../types';
import { STORAGE_KEYS } from '../utils/constants';
import { useLocalStorageSync } from './useLocalStorageSync';

const VACIO: never[] = [];

export const useContratos = () => useLocalStorageSync<Contrato[]>(STORAGE_KEYS.contratos, VACIO);
export const useItems = () => useLocalStorageSync<ItemContrato[]>(STORAGE_KEYS.items, VACIO);
export const useAsignaciones = () => useLocalStorageSync<Asignacion[]>(STORAGE_KEYS.asignaciones, VACIO);
export const useMovimientos = () => useLocalStorageSync<Movimiento[]>(STORAGE_KEYS.movimientos, VACIO);
export const useSolicitudes = () => useLocalStorageSync<Solicitud[]>(STORAGE_KEYS.solicitudes, VACIO);
export const useEvidencias = () => useLocalStorageSync<Evidencia[]>(STORAGE_KEYS.evidencias, VACIO);
export const useUsuarios = () => useLocalStorageSync<User[]>(STORAGE_KEYS.users, VACIO);

/** Índices por id para búsquedas O(1) en tablas. */
export function useCatalogo() {
  const items = useItems();
  const contratos = useContratos();
  const usuarios = useUsuarios();
  return useMemo(
    () => ({
      items,
      contratos,
      itemPorId: new Map(items.map((i) => [i.id, i])),
      contratoPorId: new Map(contratos.map((c) => [c.id, c])),
      nombreUsuario: (id: string | undefined) => usuarios.find((u) => u.id === id)?.nombre ?? 'Desconocido',
    }),
    [items, contratos, usuarios],
  );
}

export interface MaterialAsignado {
  itemId: string;
  nombre: string;
  codigo: string;
  cantidad: number;
}

/** "materialesAsignados": asignaciones activas del instructor agrupadas por ítem. */
export function useMaterialesAsignados(instructorId: string): MaterialAsignado[] {
  const asignaciones = useAsignaciones();
  const { itemPorId } = useCatalogo();
  return useMemo(() => {
    const porItem = new Map<string, number>();
    for (const a of asignaciones) {
      if (a.instructorId !== instructorId || a.fechaDevolucion !== null) continue;
      porItem.set(a.itemId, (porItem.get(a.itemId) ?? 0) + a.cantidad);
    }
    return [...porItem.entries()]
      .map(([itemId, cantidad]) => {
        const item = itemPorId.get(itemId);
        return { itemId, cantidad, nombre: item?.nombre ?? 'Material eliminado', codigo: item?.codigo ?? '—' };
      })
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [asignaciones, itemPorId, instructorId]);
}
