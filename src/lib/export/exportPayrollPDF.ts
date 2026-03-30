import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extend jsPDF type for autoTable
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: { finalY: number };
  }
}

interface SessionDetail {
  id: string;
  client_name: string;
  checked_in_at: string;
}

interface PTPayrollData {
  name: string;
  ratePerSession: number;
  sessionsCount: number;
  totalAmount: number;
  sessions: SessionDetail[];
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
}

function formatDate(iso: string): string {
  if (!iso) return 'N/A';
  const d = new Date(iso);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

function formatTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
}

export function exportPayrollPDF(pt: PTPayrollData, month: string) {
  const doc = new jsPDF();

  // Use Helvetica (built-in, no Vietnamese diacritics but functional)
  doc.setFont('Helvetica');

  // Header
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text('PHIEU LUONG HUAN LUYEN VIEN', 105, 20, { align: 'center' });

  doc.setDrawColor(100, 80, 220);
  doc.setLineWidth(0.5);
  doc.line(14, 25, 196, 25);

  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Thang: ${month}`, 14, 35);
  doc.text(`PT: ${pt.name}`, 14, 43);
  doc.text(`Don gia/ca: ${formatVND(pt.ratePerSession)}`, 14, 51);
  doc.text(`Tong so ca: ${pt.sessionsCount}`, 120, 43);
  doc.text(`Thanh tien: ${formatVND(pt.totalAmount)}`, 120, 51);

  // Session details table
  autoTable(doc, {
    startY: 60,
    head: [['STT', 'Ngay', 'Hoc vien', 'Gio check-in']],
    body: pt.sessions.map((s, i) => [
      (i + 1).toString(),
      formatDate(s.checked_in_at),
      s.client_name,
      formatTime(s.checked_in_at),
    ]),
    headStyles: {
      fillColor: [83, 74, 183], // #534AB7
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [50, 50, 50],
    },
    alternateRowStyles: {
      fillColor: [248, 248, 255],
    },
    columnStyles: {
      0: { cellWidth: 15, halign: 'center' },
      1: { cellWidth: 35 },
      2: { cellWidth: 60 },
      3: { cellWidth: 35, halign: 'center' },
    },
    margin: { left: 14, right: 14 },
  });

  // Total summary
  const finalY = doc.lastAutoTable.finalY + 12;
  doc.setDrawColor(100, 80, 220);
  doc.line(14, finalY - 2, 196, finalY - 2);

  doc.setFontSize(13);
  doc.setTextColor(30, 30, 30);
  doc.text(
    `TONG: ${pt.sessionsCount} ca x ${formatVND(pt.ratePerSession)} = ${formatVND(pt.totalAmount)}`,
    14,
    finalY + 5
  );

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(`Xuat boi GymApp - ${new Date().toLocaleString('vi-VN')}`, 105, 285, { align: 'center' });

  doc.save(`phieu-luong-${pt.name}-${month}.pdf`);
}
