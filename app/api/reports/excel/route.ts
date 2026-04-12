import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

import { requireOperationalUserApi } from '@/lib/auth';
import { getDashboardReportsData, getReportAnimalLabel } from '@/lib/services/report-service';
import { formatCurrency, formatDate, formatPercent, slugify } from '@/lib/utils';

type Worksheet = XLSX.WorkSheet & {
  '!cols'?: Array<{ wch?: number }>;
  '!rows'?: Array<{ hpx?: number }>;
  '!merges'?: XLSX.Range[];
  '!freeze'?: { xSplit?: number; ySplit?: number; topLeftCell?: string; activePane?: string; state?: string };
};

type CellStyle = {
  font?: {
    bold?: boolean;
    italic?: boolean;
    sz?: number;
    color?: { rgb: string };
  };
  fill?: {
    fgColor?: { rgb: string };
  };
  alignment?: {
    vertical?: 'top' | 'center' | 'bottom';
    horizontal?: 'left' | 'center' | 'right';
    wrapText?: boolean;
  };
};

type StyledCell = XLSX.CellObject & { s?: CellStyle };

const HEADER_FILL = '355E52';
const TITLE_FILL = '1F3C34';

function setCellStyle(cell: XLSX.CellObject | undefined, style: CellStyle) {
  if (!cell) return;
  (cell as StyledCell).s = style;
}

function autoFitColumns(rows: Array<Array<string | number>>, minimums: number[] = []): Array<{ wch: number }> {
  const widths = minimums.slice();

  rows.forEach((row) => {
    row.forEach((value, index) => {
      const text = String(value ?? '');
      const current = widths[index] ?? 10;
      widths[index] = Math.min(Math.max(current, text.length + 2), 36);
    });
  });

  return widths.map((width) => ({ wch: width }));
}

function appendSection(sheet: Worksheet, startRow: number, title: string, headers: string[], rows: Array<Array<string | number>>) {
  XLSX.utils.sheet_add_aoa(sheet, [[title]], { origin: { r: startRow, c: 0 } });
  XLSX.utils.sheet_add_aoa(sheet, [headers], { origin: { r: startRow + 1, c: 0 } });

  if (rows.length > 0) {
    XLSX.utils.sheet_add_aoa(sheet, rows, { origin: { r: startRow + 2, c: 0 } });
  }

  const merges = sheet['!merges'] ?? [];
  merges.push({ s: { r: startRow, c: 0 }, e: { r: startRow, c: Math.max(headers.length - 1, 0) } });
  sheet['!merges'] = merges;

  setCellStyle(sheet[XLSX.utils.encode_cell({ r: startRow, c: 0 })], {
    font: { bold: true, sz: 12, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: TITLE_FILL } },
    alignment: { vertical: 'center' },
  });

  headers.forEach((_, index) => {
    setCellStyle(sheet[XLSX.utils.encode_cell({ r: startRow + 1, c: index })], {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: HEADER_FILL } },
      alignment: { vertical: 'center', horizontal: 'center', wrapText: true },
    });
  });

  return startRow + rows.length + 4;
}

function buildOverviewSheet(reports: Awaited<ReturnType<typeof getDashboardReportsData>>): Worksheet {
  const sheet = XLSX.utils.aoa_to_sheet([]) as Worksheet;

  const metadataRows = [
    ['Laporan Operasional Qurban'],
    [`${reports.mosque.name} - ${reports.mosque.city}`],
    [],
    ['Metadata Laporan', 'Nilai'],
    ['Masjid', reports.mosque.name],
    ['Kota', reports.mosque.city],
    ['Tahun kampanye', reports.mosque.campaignYear],
    ['Batas pendaftaran', formatDate(reports.mosque.registrationDeadline)],
    ['Kontak panitia', reports.mosque.contactPhone],
    ['Info rekening', reports.mosque.bankInfo],
    ['Dibuat pada', formatDate(reports.generatedAt)],
  ];

  XLSX.utils.sheet_add_aoa(sheet, metadataRows, { origin: 'A1' });
  sheet['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 5 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 5 } },
  ];

  setCellStyle(sheet.A1, {
    font: { bold: true, sz: 16, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: TITLE_FILL } },
    alignment: { vertical: 'center' },
  });
  setCellStyle(sheet.A2, {
    font: { italic: true, sz: 11, color: { rgb: 'F1EADA' } },
    fill: { fgColor: { rgb: TITLE_FILL } },
    alignment: { vertical: 'center' },
  });
  setCellStyle(sheet.A4, {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: HEADER_FILL } },
  });
  setCellStyle(sheet.B4, {
    font: { bold: true, color: { rgb: 'FFFFFF' } },
    fill: { fgColor: { rgb: HEADER_FILL } },
  });

  let nextRow = 13;

  nextRow = appendSection(
    sheet,
    nextRow,
    'KPI Utama',
    ['Indikator', 'Nilai', 'Keterangan'],
    [
      ['Total peserta', reports.summary.totalParticipants, `${reports.summary.paidParticipants} lunas, ${reports.summary.pendingParticipants} menunggu`],
      ['Total grup', reports.summary.totalGroups, `${reports.summary.openGroups} aktif, ${reports.summary.closedGroups} ditutup`],
      ['Kapasitas slot', `${reports.summary.occupiedSlots}/${reports.summary.totalCapacity}`, `Okupansi ${formatPercent(reports.summary.occupancyRate, 0)}`],
      ['Slot tersedia', reports.summary.availableSlots, `${reports.summary.fullGroups} grup penuh, ${reports.summary.urgentGroups} grup urgent`],
      ['Nilai okupansi', formatCurrency(reports.summary.occupiedRevenue), `Potensi total ${formatCurrency(reports.summary.projectedRevenueTotal)}`],
      ['Sebaran domisili', reports.summary.distinctCities, `${reports.summary.participantsWithNotes} peserta memiliki catatan`],
    ]
  );

  nextRow = appendSection(
    sheet,
    nextRow,
    'Ringkasan Pembayaran',
    ['Status pembayaran', 'Jumlah peserta', 'Persentase', 'Estimasi nilai slot'],
    reports.paymentBreakdown.map((item) => [item.label, item.count, formatPercent(item.percentage, 0), formatCurrency(item.estimatedValue)])
  );

  nextRow = appendSection(
    sheet,
    nextRow,
    'Sorotan Operasional',
    ['Sorotan', 'Detail'],
    reports.highlights.map((item) => [item.title, item.detail])
  );

  appendSection(
    sheet,
    nextRow,
    'Sebaran Domisili Teratas',
    ['Domisili', 'Jumlah peserta'],
    reports.topCities.length > 0 ? reports.topCities.map((item) => [item.city, item.count]) : [['Belum ada data', 0]]
  );

  sheet['!cols'] = autoFitColumns(
    [
      ['Laporan Operasional Qurban', '', '', '', '', ''],
      ...metadataRows,
      ...reports.paymentBreakdown.map((item) => [item.label, item.count, formatPercent(item.percentage, 0), formatCurrency(item.estimatedValue)]),
      ...reports.highlights.map((item) => [item.title, item.detail]),
      ...reports.topCities.map((item) => [item.city, item.count]),
    ],
    [24, 20, 18, 22, 18, 18]
  );
  sheet['!rows'] = [{ hpx: 28 }, { hpx: 22 }];
  sheet['!freeze'] = { xSplit: 0, ySplit: 4, topLeftCell: 'A5', activePane: 'bottomLeft', state: 'frozen' };

  return sheet;
}

function buildGroupSheet(reports: Awaited<ReturnType<typeof getDashboardReportsData>>): Worksheet {
  const rows = reports.groups.map((group) => ({
    prioritas: group.isUrgent ? 'Perlu follow up' : group.isFull ? 'Penuh' : group.status === 'closed' ? 'Ditutup' : 'Normal',
    nama_grup: group.name,
    jenis_hewan: getReportAnimalLabel(group.animalType),
    status_grup: group.status === 'open' ? 'Aktif' : 'Ditutup',
    slot: `${group.filledSlots}/${group.capacity}`,
    okupansi: group.occupancyLabel,
    slot_tersisa: group.slotsLeft,
    harga_per_slot: formatCurrency(group.pricePerSlot),
    nilai_terisi: formatCurrency(group.occupiedValue),
    nilai_sisa: formatCurrency(group.remainingValue),
    komposisi_pembayaran: `${group.paymentPaidCount} lunas / ${group.paymentPartialCount} DP / ${group.paymentPendingCount} menunggu`,
    catatan: group.notes || '-',
  }));

  const sheet = XLSX.utils.json_to_sheet(rows) as Worksheet;
  sheet['!cols'] = [
    { wch: 16 },
    { wch: 22 },
    { wch: 16 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 18 },
    { wch: 18 },
    { wch: 18 },
    { wch: 34 },
    { wch: 28 },
  ];

  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    setCellStyle(sheet[XLSX.utils.encode_cell({ r: 0, c: col })], {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: HEADER_FILL } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    });
  }
  sheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

  return sheet;
}

function buildParticipantSheet(reports: Awaited<ReturnType<typeof getDashboardReportsData>>): Worksheet {
  const rows = reports.participants.map((participant, index) => ({
    no: index + 1,
    nama_peserta: participant.fullName,
    whatsapp: participant.phone,
    domisili: participant.city,
    grup: participant.groupName,
    jenis_hewan: getReportAnimalLabel(participant.animalType),
    status_grup: participant.groupStatus === 'open' ? 'Aktif' : participant.groupStatus === 'closed' ? 'Ditutup' : '-',
    harga_slot: formatCurrency(participant.pricePerSlot),
    status_pembayaran: participant.paymentLabel,
    terdaftar_pada: formatDate(participant.registeredAt),
    catatan: participant.notes || '-',
  }));

  const sheet = XLSX.utils.json_to_sheet(rows) as Worksheet;
  sheet['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 18 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 12 },
    { wch: 16 },
    { wch: 16 },
    { wch: 20 },
    { wch: 28 },
  ];

  const range = XLSX.utils.decode_range(sheet['!ref'] ?? 'A1');
  for (let col = range.s.c; col <= range.e.c; col += 1) {
    setCellStyle(sheet[XLSX.utils.encode_cell({ r: 0, c: col })], {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: HEADER_FILL } },
      alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
    });
  }
  sheet['!freeze'] = { xSplit: 0, ySplit: 1, topLeftCell: 'A2', activePane: 'bottomLeft', state: 'frozen' };

  return sheet;
}

function buildPaymentSheet(reports: Awaited<ReturnType<typeof getDashboardReportsData>>): Worksheet {
  const detailRows = reports.paymentBreakdown.map((item) => ({
    status: item.label,
    jumlah_peserta: item.count,
    persentase: formatPercent(item.percentage, 0),
    estimasi_nilai_slot: formatCurrency(item.estimatedValue),
  }));

  const sheet = XLSX.utils.aoa_to_sheet([]) as Worksheet;
  let nextRow = appendSection(
    sheet,
    0,
    'Rekap Pembayaran',
    ['Status pembayaran', 'Jumlah peserta', 'Persentase', 'Estimasi nilai slot'],
    detailRows.map((row) => [row.status, row.jumlah_peserta, row.persentase, row.estimasi_nilai_slot])
  );

  nextRow = appendSection(
    sheet,
    nextRow,
    'Catatan Pembayaran',
    ['Indikator', 'Nilai'],
    [
      ['Peserta lunas', `${reports.summary.paidParticipants} peserta (${formatPercent(reports.summary.paidRate, 0)})`],
      ['Peserta DP', `${reports.summary.partialParticipants} peserta (${formatPercent(reports.summary.partialRate, 0)})`],
      ['Peserta menunggu', `${reports.summary.pendingParticipants} peserta (${formatPercent(reports.summary.pendingRate, 0)})`],
      ['Nilai okupansi saat ini', formatCurrency(reports.summary.occupiedRevenue)],
      ['Potensi nilai slot tersisa', formatCurrency(reports.summary.remainingRevenue)],
    ]
  );

  appendSection(
    sheet,
    nextRow,
    'Arahan Operasional',
    ['Arahan'],
    reports.highlights.map((item) => [item.detail])
  );

  sheet['!cols'] = [
    { wch: 22 },
    { wch: 20 },
    { wch: 16 },
    { wch: 22 },
  ];
  sheet['!freeze'] = { xSplit: 0, ySplit: 2, topLeftCell: 'A3', activePane: 'bottomLeft', state: 'frozen' };

  const headerCells = ['A2', 'B2', 'C2', 'D2'];
  headerCells.forEach((address) => {
    setCellStyle(sheet[address], {
      font: { bold: true, color: { rgb: 'FFFFFF' } },
      fill: { fgColor: { rgb: HEADER_FILL } },
      alignment: { horizontal: 'center', vertical: 'center' },
    });
  });

  return sheet;
}

export async function GET() {
  const authResult = await requireOperationalUserApi();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const reports = await getDashboardReportsData();
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: `Laporan Operasional Qurban ${reports.mosque.name}`,
    Subject: 'Export laporan qurban',
    Author: 'Patungan Kurban',
    Company: reports.mosque.name,
    CreatedDate: new Date(reports.generatedAt),
  };

  XLSX.utils.book_append_sheet(workbook, buildOverviewSheet(reports), 'Ikhtisar');
  XLSX.utils.book_append_sheet(workbook, buildPaymentSheet(reports), 'Pembayaran');
  XLSX.utils.book_append_sheet(workbook, buildGroupSheet(reports), 'Grup');
  XLSX.utils.book_append_sheet(workbook, buildParticipantSheet(reports), 'Peserta');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx', cellStyles: true });
  const filename = `laporan-${slugify(reports.mosque.name)}-${new Date().toISOString().slice(0, 10)}.xlsx`;

  return new NextResponse(buffer as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
