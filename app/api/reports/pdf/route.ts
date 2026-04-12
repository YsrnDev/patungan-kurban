import { NextResponse } from 'next/server';
import { PDFDocument, PDFPage, PDFFont, StandardFonts, rgb } from 'pdf-lib';

import { requireOperationalUserApi } from '@/lib/auth';
import { getDashboardReportsData, getReportAnimalLabel } from '@/lib/services/report-service';
import { formatCurrency, formatDate, formatPercent, slugify } from '@/lib/utils';

const PAGE_WIDTH = 841.89;
const PAGE_HEIGHT = 595.28;
const MARGIN_X = 36;
const MARGIN_TOP = 34;
const MARGIN_BOTTOM = 28;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const DEFAULT_TEXT = rgb(0.15, 0.17, 0.15);
const MUTED_TEXT = rgb(0.39, 0.37, 0.33);
const BRAND = rgb(0.188, 0.302, 0.247);
const BRAND_SOFT = rgb(0.95, 0.92, 0.87);
const BORDER = rgb(0.84, 0.81, 0.75);
const BG = rgb(0.992, 0.976, 0.945);

type ReportData = Awaited<ReturnType<typeof getDashboardReportsData>>;

type PdfContext = {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  fontBold: PDFFont;
  y: number;
  pageNumber: number;
};

function lineHeight(size: number) {
  return size + 4;
}

function createPage(doc: PDFDocument, pageNumber: number) {
  const page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  page.drawRectangle({ x: 0, y: 0, width: PAGE_WIDTH, height: PAGE_HEIGHT, color: BG });
  page.drawRectangle({ x: MARGIN_X, y: PAGE_HEIGHT - 28, width: CONTENT_WIDTH, height: 2, color: BRAND_SOFT });
  page.drawText(`Halaman ${pageNumber}`, { x: PAGE_WIDTH - 100, y: 16, size: 9, color: MUTED_TEXT });
  return page;
}

function ensureSpace(ctx: PdfContext, heightNeeded: number) {
  if (ctx.y - heightNeeded >= MARGIN_BOTTOM) return;
  ctx.pageNumber += 1;
  ctx.page = createPage(ctx.doc, ctx.pageNumber);
  ctx.y = PAGE_HEIGHT - MARGIN_TOP;
}

function drawWrappedText(
  ctx: PdfContext,
  text: string,
  options: { x?: number; width?: number; size?: number; color?: ReturnType<typeof rgb>; font?: PDFFont; gapAfter?: number }
) {
  const x = options.x ?? MARGIN_X;
  const width = options.width ?? CONTENT_WIDTH;
  const size = options.size ?? 10;
  const font = options.font ?? ctx.font;
  const color = options.color ?? DEFAULT_TEXT;
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, size) <= width) {
      current = candidate;
      return;
    }

    if (current) {
      lines.push(current);
      current = word;
      return;
    }

    lines.push(candidate);
    current = '';
  });

  if (current) {
    lines.push(current);
  }

  const totalHeight = lines.length * lineHeight(size) + (options.gapAfter ?? 0);
  ensureSpace(ctx, totalHeight);

  lines.forEach((line, index) => {
    ctx.page.drawText(line, { x, y: ctx.y - index * lineHeight(size), size, font, color });
  });

  ctx.y -= lines.length * lineHeight(size) + (options.gapAfter ?? 0);
}

function drawSectionTitle(ctx: PdfContext, title: string, subtitle?: string) {
  ensureSpace(ctx, 40);
  ctx.page.drawRectangle({ x: MARGIN_X, y: ctx.y - 6, width: CONTENT_WIDTH, height: 24, color: BRAND_SOFT });
  ctx.page.drawText(title, { x: MARGIN_X + 12, y: ctx.y + 2, size: 13, font: ctx.fontBold, color: BRAND });
  ctx.y -= 28;
  if (subtitle) {
    drawWrappedText(ctx, subtitle, { size: 9, color: MUTED_TEXT, gapAfter: 6 });
  }
}

function drawKeyValueGrid(ctx: PdfContext, items: Array<{ label: string; value: string }>, columns: 3) {
  const cardGap = 12;
  const cardWidth = (CONTENT_WIDTH - cardGap * (columns - 1)) / columns;
  const cardHeight = 58;
  const rowCount = Math.ceil(items.length / columns);
  ensureSpace(ctx, rowCount * (cardHeight + 10));

  items.forEach((item, index) => {
    const row = Math.floor(index / columns);
    const col = index % columns;
    const x = MARGIN_X + col * (cardWidth + cardGap);
    const y = ctx.y - row * (cardHeight + 10);

    ctx.page.drawRectangle({ x, y: y - cardHeight + 10, width: cardWidth, height: cardHeight, color: rgb(1, 1, 1), borderColor: BORDER, borderWidth: 1 });
    ctx.page.drawText(item.label, { x: x + 12, y: y - 8, size: 9, font: ctx.font, color: MUTED_TEXT });
    ctx.page.drawText(item.value, { x: x + 12, y: y - 32, size: 15, font: ctx.fontBold, color: BRAND });
  });

  ctx.y -= rowCount * (cardHeight + 10) + 4;
}

function drawBulletList(ctx: PdfContext, items: string[]) {
  items.forEach((item) => {
    ensureSpace(ctx, 18);
    ctx.page.drawCircle({ x: MARGIN_X + 4, y: ctx.y + 5, size: 2.2, color: BRAND });
    drawWrappedText(ctx, item, { x: MARGIN_X + 14, width: CONTENT_WIDTH - 14, size: 10, gapAfter: 2 });
  });
}

function drawSimpleTable(ctx: PdfContext, headers: string[], rows: string[][], widths: number[]) {
  const headerHeight = 24;
  const baseRowHeight = 18;

  const drawHeader = () => {
    ensureSpace(ctx, headerHeight + 8);
    let x = MARGIN_X;
    headers.forEach((header, index) => {
      ctx.page.drawRectangle({ x, y: ctx.y - headerHeight + 6, width: widths[index], height: headerHeight, color: BRAND, borderColor: BRAND, borderWidth: 1 });
      ctx.page.drawText(header, { x: x + 6, y: ctx.y - 10, size: 9, font: ctx.fontBold, color: rgb(1, 1, 1) });
      x += widths[index];
    });
    ctx.y -= headerHeight;
  };

  drawHeader();

  rows.forEach((row, rowIndex) => {
    const wrappedLines = row.map((cell, index) => {
      const words = cell.split(/\s+/).filter(Boolean);
      const lines: string[] = [];
      let current = '';

      words.forEach((word) => {
        const candidate = current ? `${current} ${word}` : word;
        if (ctx.font.widthOfTextAtSize(candidate, 8.5) <= widths[index] - 10) {
          current = candidate;
        } else {
          if (current) lines.push(current);
          current = word;
        }
      });

      if (current) lines.push(current);
      return lines.length > 0 ? lines : ['-'];
    });

    const rowHeight = Math.max(...wrappedLines.map((lines) => lines.length)) * 11 + 8;
    if (ctx.y - rowHeight < MARGIN_BOTTOM) {
      ctx.pageNumber += 1;
      ctx.page = createPage(ctx.doc, ctx.pageNumber);
      ctx.y = PAGE_HEIGHT - MARGIN_TOP;
      drawHeader();
    }

    let x = MARGIN_X;
    row.forEach((_, index) => {
      ctx.page.drawRectangle({
        x,
        y: ctx.y - rowHeight + 4,
        width: widths[index],
        height: rowHeight,
        color: rowIndex % 2 === 0 ? rgb(1, 1, 1) : rgb(0.985, 0.978, 0.965),
        borderColor: BORDER,
        borderWidth: 0.6,
      });

      wrappedLines[index].forEach((line, lineIndex) => {
        ctx.page.drawText(line, {
          x: x + 5,
          y: ctx.y - 10 - lineIndex * 11,
          size: 8.5,
          font: ctx.font,
          color: DEFAULT_TEXT,
        });
      });

      x += widths[index];
    });

    ctx.y -= rowHeight;
  });

  ctx.y -= 10;
}

function drawHeader(ctx: PdfContext, reports: ReportData) {
  ctx.page.drawRectangle({ x: MARGIN_X, y: PAGE_HEIGHT - 96, width: CONTENT_WIDTH, height: 66, color: BRAND });
  ctx.page.drawText('Laporan Operasional Qurban', { x: MARGIN_X + 18, y: PAGE_HEIGHT - 58, size: 21, font: ctx.fontBold, color: rgb(1, 1, 1) });
  ctx.page.drawText(`${reports.mosque.name} - ${reports.mosque.city}`, { x: MARGIN_X + 18, y: PAGE_HEIGHT - 76, size: 10, font: ctx.font, color: rgb(0.94, 0.93, 0.88) });
  ctx.page.drawText(`Tahun kampanye ${reports.mosque.campaignYear}`, { x: PAGE_WIDTH - 220, y: PAGE_HEIGHT - 58, size: 10, font: ctx.fontBold, color: rgb(1, 1, 1) });
  ctx.page.drawText(`Dibuat ${formatDate(reports.generatedAt)}`, { x: PAGE_WIDTH - 220, y: PAGE_HEIGHT - 76, size: 10, font: ctx.font, color: rgb(0.94, 0.93, 0.88) });
  ctx.y = PAGE_HEIGHT - 118;
}

export async function GET() {
  const authResult = await requireOperationalUserApi();

  if (authResult instanceof NextResponse) {
    return authResult;
  }

  const reports = await getDashboardReportsData();
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const ctx: PdfContext = {
    doc: pdfDoc,
    page: createPage(pdfDoc, 1),
    font,
    fontBold,
    y: PAGE_HEIGHT - MARGIN_TOP,
    pageNumber: 1,
  };

  drawHeader(ctx, reports);

  drawSectionTitle(ctx, 'Metadata Laporan', 'Dokumen ini merangkum kondisi operasional qurban untuk koordinasi panitia dan pemantauan progres pembayaran.');
  drawKeyValueGrid(ctx, [
    { label: 'Masjid', value: reports.mosque.name },
    { label: 'Kota', value: reports.mosque.city },
    { label: 'Kontak panitia', value: reports.mosque.contactPhone || '-' },
    { label: 'Batas pendaftaran', value: formatDate(reports.mosque.registrationDeadline) },
    { label: 'Info rekening', value: reports.mosque.bankInfo || '-' },
    { label: 'Waktu export', value: formatDate(reports.generatedAt) },
  ], 3);

  drawSectionTitle(ctx, 'KPI Utama', 'Indikator inti untuk membaca kondisi kapasitas, pembayaran, dan nilai okupansi saat ini.');
  drawKeyValueGrid(ctx, [
    { label: 'Total peserta', value: String(reports.summary.totalParticipants) },
    { label: 'Total grup', value: String(reports.summary.totalGroups) },
    { label: 'Okupansi slot', value: `${reports.summary.occupiedSlots}/${reports.summary.totalCapacity}` },
    { label: 'Persentase okupansi', value: formatPercent(reports.summary.occupancyRate, 0) },
    { label: 'Slot tersedia', value: String(reports.summary.availableSlots) },
    { label: 'Nilai okupansi', value: formatCurrency(reports.summary.occupiedRevenue) },
  ], 3);

  drawSectionTitle(ctx, 'Breakdown Pembayaran', 'Komposisi status pembayaran peserta berikut estimasi nilai slot pada setiap kategori.');
  drawSimpleTable(
    ctx,
    ['Status', 'Peserta', 'Persentase', 'Estimasi nilai slot'],
    reports.paymentBreakdown.map((item) => [item.label, String(item.count), formatPercent(item.percentage, 0), formatCurrency(item.estimatedValue)]),
    [150, 90, 100, 180]
  );

  drawSectionTitle(ctx, 'Sorotan Operasional', 'Poin yang layak menjadi perhatian tindak lanjut panitia dalam waktu dekat.');
  drawBulletList(ctx, reports.highlights.map((item) => `${item.title}: ${item.detail}`));
  drawBulletList(ctx, [
    `Peserta dengan catatan operasional: ${reports.summary.participantsWithNotes} orang.`,
    `Sebaran domisili tercatat di ${reports.summary.distinctCities} kota.`,
    `Potensi nilai slot tersisa saat ini sebesar ${formatCurrency(reports.summary.remainingRevenue)}.`,
  ]);

  drawSectionTitle(ctx, 'Ringkasan Grup', 'Tabel grup diperluas agar panitia dapat melihat kapasitas, status pembayaran, dan potensi nilai per grup.');
  drawSimpleTable(
    ctx,
    ['Grup', 'Hewan', 'Slot', 'Pembayaran', 'Status / catatan'],
    reports.groups.map((group) => [
      group.name,
      `${getReportAnimalLabel(group.animalType)}\n${formatCurrency(group.pricePerSlot)}`,
      `${group.filledSlots}/${group.capacity} (${group.occupancyLabel})`,
      `${group.paymentPaidCount} lunas | ${group.paymentPartialCount} DP | ${group.paymentPendingCount} tunggu`,
      `${group.isFull ? 'Penuh' : group.status === 'closed' ? 'Ditutup' : `${group.slotsLeft} slot tersisa`}\n${group.notes || 'Tanpa catatan'}`,
    ]),
    [150, 120, 120, 160, 205]
  );

  drawSectionTitle(ctx, 'Rekap Peserta', 'Daftar peserta menonjolkan informasi yang diperlukan untuk follow up dan konfirmasi administratif.');
  drawSimpleTable(
    ctx,
    ['Peserta', 'Kontak / domisili', 'Grup', 'Pembayaran', 'Registrasi / catatan'],
    reports.participants.map((participant) => [
      participant.fullName,
      `${participant.phone}\n${participant.city}`,
      `${participant.groupName}\n${getReportAnimalLabel(participant.animalType)}`,
      `${participant.paymentLabel}\n${formatCurrency(participant.pricePerSlot)}`,
      `${formatDate(participant.registeredAt)}\n${participant.notes || 'Tanpa catatan'}`,
    ]),
    [150, 145, 145, 110, 185]
  );

  drawSectionTitle(ctx, 'Rekap Domisili', 'Lima domisili teratas membantu pembacaan jangkauan peserta dan komunikasi panitia.');
  drawSimpleTable(
    ctx,
    ['Domisili', 'Jumlah peserta'],
    (reports.topCities.length > 0 ? reports.topCities : [{ city: 'Belum ada data', count: 0 }]).map((item) => [item.city, String(item.count)]),
    [240, 120]
  );

  drawSectionTitle(ctx, 'Catatan Penutup');
  drawBulletList(ctx, [
    `Dokumen PDF ini dirancang sebagai laporan distribusi cepat, sedangkan export Excel memuat rekap operasional yang lebih rinci per sheet.`,
    `Alur autentikasi dan endpoint export tetap menggunakan proteksi operasional yang sama seperti sebelumnya.`,
  ]);

  const pdfBytes = await pdfDoc.save();
  const filename = `laporan-ringkas-${slugify(reports.mosque.name)}-${new Date().toISOString().slice(0, 10)}.pdf`;

  return new NextResponse(Buffer.from(pdfBytes) as BodyInit, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-store',
    },
  });
}
