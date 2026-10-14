// ============================================================
// SMART BILLING - CSV Export Utility
// ============================================================

export function exportToCSV(data: Record<string, unknown>[], filename: string): void {
  if (!data || data.length === 0) {
    alert('No data to export.');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvRows: string[] = [];

  // Header row
  csvRows.push(headers.map(h => '"' + String(h).replace(/"/g, '""') + '"').join(','));

  // Data rows
  for (const row of data) {
    const values = headers.map(h => {
      const val = row[h];
      const str = val === null || val === undefined ? '' : String(val);
      return '"' + str.replace(/"/g, '""') + '"';
    });
    csvRows.push(values.join(','));
  }

  const csvContent = csvRows.join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportBillingReport(bills: { billId: string; consumerName: string; consumerId: string; billingPeriod: string; unitsConsumed: number; energyCharges: number; fixedCharge: number; tax: number; surcharge: number; totalAmount: number; status: string; dueDate: string }[], filename?: string): void {
  const data = bills.map(b => ({
    'Bill ID': b.billId,
    'Consumer': b.consumerName,
    'Consumer ID': b.consumerId,
    'Billing Period': b.billingPeriod,
    'Units (kWh)': b.unitsConsumed,
    'Energy Charges': b.energyCharges,
    'Fixed Charge': b.fixedCharge,
    'Tax': b.tax,
    'Surcharge': b.surcharge,
    'Total Amount': b.totalAmount,
    'Status': b.status,
    'Due Date': b.dueDate,
  }));
  exportToCSV(data, filename || 'billing-report.csv');
}

export function exportPaymentReport(payments: { paymentId: string; consumerName: string; consumerId: string; amount: number; paymentMethod: string; status: string; paidAt: string; billId: string }[], filename?: string): void {
  const data = payments.map(p => ({
    'Payment ID': p.paymentId,
    'Bill ID': p.billId,
    'Consumer': p.consumerName,
    'Consumer ID': p.consumerId,
    'Amount': p.amount,
    'Method': p.paymentMethod,
    'Status': p.status,
    'Paid At': p.paidAt,
  }));
  exportToCSV(data, filename || 'payment-report.csv');
}

export function exportConsumptionReport(records: { consumerName: string; consumerId: string; meterNumber: string; billingPeriod: string; previousReading: number; currentReading: number; unitsConsumed: number }[], filename?: string): void {
  const data = records.map(r => ({
    'Consumer': r.consumerName,
    'Consumer ID': r.consumerId,
    'Meter': r.meterNumber,
    'Billing Period': r.billingPeriod,
    'Previous Reading': r.previousReading,
    'Current Reading': r.currentReading,
    'Units Consumed': r.unitsConsumed,
  }));
  exportToCSV(data, filename || 'consumption-report.csv');
}