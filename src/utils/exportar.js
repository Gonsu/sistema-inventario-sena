// Exportaciones a PDF (jsPDF) y Excel (SheetJS). Las librerías se cargan
// bajo demanda para no inflar el bundle inicial.
import { formatCOP, formatFecha } from './format';
import {
  CONTRATO_LABEL,
  COORDINACION_LABEL,
  ESTADO_SOLICITUD_LABEL,
  TIPO_FORMACION_LABEL,
} from './labels';

const VERDE_OSCURO = [1, 64, 17];

function filasSolicitud(solicitud, itemPorId) {
  return solicitud.items.map((l) => {
    const item = itemPorId.get(l.itemId);
    return {
      codigo: item?.codigo ?? '—',
      material: item?.nombre ?? 'Material eliminado',
      cantidad: l.cantidad,
      valorUnitario: l.valorUnitario,
      subtotal: l.cantidad * l.valorUnitario,
    };
  });
}

export async function exportarSolicitudPDF(solicitud, itemPorId) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const ancho = doc.internal.pageSize.getWidth();

  doc.setFillColor(...VERDE_OSCURO);
  doc.rect(0, 0, ancho, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SERVICIO NACIONAL DE APRENDIZAJE', ancho / 2, 12, {
    align: 'center',
  });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Formato de Solicitud de Materiales de Formación', ancho / 2, 19, {
    align: 'center',
  });

  const f = solicitud.formulario;
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  const datos = [
    ['N° solicitud', solicitud.numero],
    ['Fecha', formatFecha(solicitud.creadaEn)],
    ['Instructor', `${f.nombre} ${f.apellido}`],
    ['Programa', f.programa],
    ['Tipo de formación', TIPO_FORMACION_LABEL[f.tipoFormacion]],
    ['Estado', ESTADO_SOLICITUD_LABEL[solicitud.estado]],
  ];
  datos.forEach(([k, v], i) => {
    const y = 38 + i * 6;
    doc.setFont('helvetica', 'bold');
    doc.text(`${k}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(v, 55, y);
  });

  autoTable(doc, {
    startY: 38 + datos.length * 6 + 4,
    head: [['Código', 'Material', 'Cant.', 'Valor unitario', 'Subtotal']],
    body: filasSolicitud(solicitud, itemPorId).map((r) => [
      r.codigo,
      r.material,
      r.cantidad,
      formatCOP(r.valorUnitario),
      formatCOP(r.subtotal),
    ]),
    foot: [['', '', '', 'VALOR TOTAL', formatCOP(solicitud.valorTotal)]],
    headStyles: { fillColor: VERDE_OSCURO },
    footStyles: { fillColor: [2, 89, 24] },
    columnStyles: {
      2: { halign: 'center' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    styles: { fontSize: 9 },
  });

  doc.save(`${solicitud.numero}.pdf`);
}

export async function exportarSolicitudXLSX(solicitud, itemPorId) {
  const XLSX = await import('xlsx');
  const f = solicitud.formulario;
  const encabezado = [
    ['SERVICIO NACIONAL DE APRENDIZAJE'],
    ['Formato de Solicitud de Materiales'],
    [],
    ['N° solicitud', solicitud.numero],
    ['Fecha', formatFecha(solicitud.creadaEn)],
    ['Instructor', `${f.nombre} ${f.apellido}`],
    ['Programa', f.programa],
    ['Tipo de formación', TIPO_FORMACION_LABEL[f.tipoFormacion]],
    [],
    ['Código', 'Material', 'Cantidad', 'Valor unitario (COP)', 'Subtotal (COP)'],
  ];
  const filas = filasSolicitud(solicitud, itemPorId).map((r) => [
    r.codigo,
    r.material,
    r.cantidad,
    r.valorUnitario,
    r.subtotal,
  ]);
  const hoja = XLSX.utils.aoa_to_sheet([
    ...encabezado,
    ...filas,
    [],
    ['', '', '', 'VALOR TOTAL', solicitud.valorTotal],
  ]);
  hoja['!cols'] = [{ wch: 14 }, { wch: 34 }, { wch: 10 }, { wch: 20 }, { wch: 18 }];
  const libro = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(libro, hoja, 'Solicitud');
  XLSX.writeFile(libro, `${solicitud.numero}.xlsx`);
}

/** Reporte multipágina: costos, entregas y trazabilidad (con los filtros activos). */
export async function exportarReportePDF(d) {
  const [{ jsPDF }, { autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);
  const doc = new jsPDF({ unit: 'mm', format: 'letter' });
  const ancho = doc.internal.pageSize.getWidth();
  const estilos = {
    headStyles: { fillColor: VERDE_OSCURO },
    footStyles: { fillColor: [2, 89, 24] },
    styles: { fontSize: 8.5 },
  };

  const encabezado = (titulo) => {
    doc.setFillColor(...VERDE_OSCURO);
    doc.rect(0, 0, ancho, 24, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.text('SERVICIO NACIONAL DE APRENDIZAJE', ancho / 2, 10, {
      align: 'center',
    });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(
      `${titulo} · Reporte de inventario ${d.anio} · ${formatFecha(new Date().toISOString())}`,
      ancho / 2,
      17,
      { align: 'center' },
    );
    doc.setTextColor(30, 30, 30);
  };

  encabezado('Reporte de Costos');
  const costoTotal = d.costos.reduce((acc, f) => acc + f.costoMayor, 0);
  autoTable(doc, {
    ...estilos,
    startY: 30,
    head: [['Ítem', 'Código', 'Contrato', 'Coordinación', 'Cant.', 'Costo/Unidad', 'Costo/Mayor']],
    body: d.costos.map((f) => [
      f.item,
      f.codigo,
      CONTRATO_LABEL[f.categoria],
      COORDINACION_LABEL[f.coordinacion],
      f.cantidad,
      formatCOP(f.costoUnidad),
      formatCOP(f.costoMayor),
    ]),
    foot: [[`${d.costos.length} ítems`, '', '', '', '', 'Total', formatCOP(costoTotal)]],
    columnStyles: {
      4: { halign: 'center' },
      5: { halign: 'right' },
      6: { halign: 'right' },
    },
  });
  doc.setFontSize(10);
  doc.text(
    `Proyección anual ${d.anio}: ${formatCOP(d.proyeccion)}`,
    14,
    doc.lastAutoTable.finalY + 8,
  );

  doc.addPage();
  encabezado('Estado de Entregas');
  const entregados = d.entregas.filter((e) => e.estado === 'entregado').length;
  autoTable(doc, {
    ...estilos,
    startY: 30,
    head: [
      [
        'Código',
        'Nombre',
        'Contrato',
        'Coordinación',
        'Cant.',
        'Estado',
        'Fecha entrega',
        'Instructor',
      ],
    ],
    body: d.entregas.map((e) => [
      e.codigo,
      e.nombre,
      CONTRATO_LABEL[e.categoria],
      COORDINACION_LABEL[e.coordinacion],
      e.cantidad,
      e.estado === 'entregado' ? 'Entregado' : 'Pendiente',
      e.fechaEntrega ? formatFecha(e.fechaEntrega, false) : '—',
      e.instructor,
    ]),
    foot: [
      [
        `Entregados: ${entregados}`,
        `Pendientes: ${d.entregas.length - entregados}`,
        '',
        '',
        '',
        '',
        '',
        '',
      ],
    ],
    columnStyles: { 4: { halign: 'center' } },
  });

  doc.addPage();
  encabezado('Trazabilidad de Material');
  autoTable(doc, {
    ...estilos,
    startY: 30,
    head: [['Material', 'Código', 'Ubicación actual', 'Instructor', 'Días en uso', 'Semáforo']],
    body: d.trazabilidad.map((t) => [
      t.material,
      t.codigo,
      t.ubicacionActual,
      t.instructorAsignado,
      t.diasEnUso,
      t.semaforo.toUpperCase(),
    ]),
    foot: [
      [
        `Total: ${d.resumen.totalMateriales}`,
        `En uso: ${d.resumen.enUso}`,
        `Disponibles: ${d.resumen.disponibles}`,
        '',
        '',
        '',
      ],
    ],
    columnStyles: { 4: { halign: 'center' } },
  });

  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Página ${i} de ${paginas}`, ancho - 14, doc.internal.pageSize.getHeight() - 8, {
      align: 'right',
    });
  }

  doc.save(`reporte_sena_inventario_${d.anio}.pdf`);
}
