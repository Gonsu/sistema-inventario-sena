import { useMemo } from 'react';
import { STORAGE_KEYS } from '../utils/constants';
import { useLocalStorageSync } from './useLocalStorageSync';

const VACIO = [];

export const useContratos = () => useLocalStorageSync(STORAGE_KEYS.contratos, VACIO);
export const useItems = () => useLocalStorageSync(STORAGE_KEYS.items, VACIO);
export const useAsignaciones = () => useLocalStorageSync(STORAGE_KEYS.asignaciones, VACIO);
export const useMovimientos = () => useLocalStorageSync(STORAGE_KEYS.movimientos, VACIO);
export const useSolicitudes = () => useLocalStorageSync(STORAGE_KEYS.solicitudes, VACIO);
export const useEvidencias = () => useLocalStorageSync(STORAGE_KEYS.evidencias, VACIO);
export const useUsuarios = () => useLocalStorageSync(STORAGE_KEYS.users, VACIO);

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
      nombreUsuario: (id) => usuarios.find((u) => u.id === id)?.nombre ?? 'Desconocido',
    }),
    [items, contratos, usuarios],
  );
}

/** "materialesAsignados": asignaciones activas del instructor agrupadas por ítem. */
export function useMaterialesAsignados(instructorId) {
  const asignaciones = useAsignaciones();
  const { itemPorId } = useCatalogo();
  return useMemo(() => {
    const porItem = new Map();
    for (const a of asignaciones) {
      if (a.instructorId !== instructorId || a.fechaDevolucion !== null) continue;
      porItem.set(a.itemId, (porItem.get(a.itemId) ?? 0) + a.cantidad);
    }
    return [...porItem.entries()]
      .map(([itemId, cantidad]) => {
        const item = itemPorId.get(itemId);
        return {
          itemId,
          cantidad,
          nombre: item?.nombre ?? 'Material eliminado',
          codigo: item?.codigo ?? '—',
        };
      })
      .sort((a, b) => a.codigo.localeCompare(b.codigo));
  }, [asignaciones, itemPorId, instructorId]);
}
