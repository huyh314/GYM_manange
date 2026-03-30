import * as XLSX from 'xlsx';

interface PTStat {
  name: string;
  sessionsThisMonth: number;
  activeClients: number;
  ratePerSession: number;
}

interface PackageEntry {
  soldAt: string;
  clientName: string;
  packageName: string;
  ptName: string;
  amountPaid: number;
}

interface MonthlyReportData {
  revenue: number;
  packagesSold: number;
  totalSessions: number;
  newClients: number;
  ptStats: PTStat[];
  packages: PackageEntry[];
}

function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
}

export function exportMonthlyReport(data: MonthlyReportData, month: string) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Summary
  const summarySheet = XLSX.utils.aoa_to_sheet([
    ['BAO CAO THANG ' + month],
    [],
    ['Doanh thu', formatVND(data.revenue)],
    ['Goi da ban', data.packagesSold],
    ['Tong ca da day', data.totalSessions],
    ['Hoc vien moi', data.newClients],
  ]);
  // Set column width
  summarySheet['!cols'] = [{ wch: 20 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(wb, summarySheet, 'Tong quan');

  // Sheet 2: PT Stats
  const ptRows = data.ptStats.map(pt => ([
    pt.name,
    pt.sessionsThisMonth,
    pt.activeClients,
    formatVND(pt.sessionsThisMonth * pt.ratePerSession)
  ]));
  const ptSheet = XLSX.utils.aoa_to_sheet([
    ['Ten PT', 'Ca da day', 'Hoc vien', 'Luong uoc tinh'],
    ...ptRows
  ]);
  ptSheet['!cols'] = [{ wch: 20 }, { wch: 12 }, { wch: 12 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ptSheet, 'PT');

  // Sheet 3: Packages Sold
  const packageRows = data.packages.map(p => ([
    p.soldAt,
    p.clientName,
    p.packageName,
    p.ptName,
    formatVND(p.amountPaid)
  ]));
  const packageSheet = XLSX.utils.aoa_to_sheet([
    ['Ngay ban', 'Hoc vien', 'Goi', 'PT', 'So tien'],
    ...packageRows
  ]);
  packageSheet['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 20 }, { wch: 15 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, packageSheet, 'Goi da ban');

  XLSX.writeFile(wb, `bao-cao-${month}.xlsx`);
}
