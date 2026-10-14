import React, { useState } from 'react';
import { Plus, Download, Printer } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { ChartCard, ConsumptionChart, RevenueChart } from '../../components/charts/Charts';
import { GenerateBillModal } from '../../components/billing/GenerateBillModal';
import { BillBreakdownModal } from '../../components/billing/BillBreakdownModal';
import { BillPrintModal } from '../../components/billing/BillPrintModal';
import { PaymentReceiptModal } from '../../components/billing/PaymentReceiptModal';
import { exportBillingReport, exportPaymentReport } from '../../lib/csvExport';
import { useAppState } from '../../hooks/useAppState';
import { formatDate, formatDateTime, formatCurrency } from '../../lib/utils';
import type { Consumer, Meter, PaymentMethod, Bill, Payment } from '../../types';

const CONNECTION_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  INDUSTRIAL: 'Industrial',
  AGRICULTURAL: 'Agricultural',
};

const METER_TYPE_LABELS: Record<string, string> = {
  SINGLE_PHASE: 'Single Phase',
  THREE_PHASE: 'Three Phase',
  SMART: 'Smart',
  PREPAID: 'Prepaid',
};

const ITEMS_PER_PAGE = 6;

// --- Clerk Consumers ---
export const ClerkConsumersPage: React.FC = () => {
  const { consumers } = useAppState();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = consumers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.consumerId.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <AppShell>
      <PageHeader
        title="Consumers"
        subtitle="Search and view consumer accounts."
        breadcrumb={['Clerk', 'Consumers']}
      />
      <div className="bento-card mb-5">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search consumers..." className="max-w-sm" />
      </div>
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Consumers table">
            <thead>
              <tr>
                <th>Consumer ID</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Meter Number</th>
                <th>Connection</th>
                <th>Registered</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={7}><EmptyState title="No consumers found" description="Try a different search." /></td></tr>
              ) : (
                paginated.map((c: Consumer) => (
                  <tr key={c.id}>
                    <td><span className="font-mono text-xs text-gray-500">{c.consumerId}</span></td>
                    <td className="text-sm font-medium text-gray-900">{c.name}</td>
                    <td className="text-sm">{c.phone}</td>
                    <td><span className="font-mono text-xs text-gray-600">{c.meterNumber}</span></td>
                    <td><span className="badge badge-gray">{CONNECTION_LABELS[c.connectionType]}</span></td>
                    <td className="text-sm text-gray-500">{formatDate(c.registeredAt)}</td>
                    <td><StatusBadge status={c.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > ITEMS_PER_PAGE && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
        )}
      </div>
    </AppShell>
  );
};

// --- Clerk Meters ---
export const ClerkMetersPage: React.FC = () => {
  const { meters, recordMeterReading } = useAppState();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [readingModal, setReadingModal] = useState<Meter | null>(null);
  const [readingVal, setReadingVal] = useState('');
  const [readingError, setReadingError] = useState('');

  const filtered = meters.filter(m =>
    (m.meterId || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.consumerName || '').toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleOpenReading = (m: Meter) => {
    setReadingModal(m);
    setReadingVal(String((m.currentReading ?? 0) + 50));
    setReadingError('');
  };

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readingModal) return;
    const val = Number(readingVal);
    const curr = readingModal.currentReading ?? 0;
    if (isNaN(val) || val < curr) {
      setReadingError(`New reading must be ≥ current reading (${curr} kWh)`);
      return;
    }
    recordMeterReading(readingModal.id || readingModal.meterId, val);
    setReadingModal(null);
  };

  return (
    <AppShell>
      <PageHeader
        title="Meters"
        subtitle="Enter and view meter readings."
        breadcrumb={['Clerk', 'Meters']}
      />
      <div className="bento-card mb-5">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search by meter ID or consumer..." className="max-w-sm" />
      </div>
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Meters table">
            <thead>
              <tr>
                <th>Meter ID</th>
                <th>Consumer</th>
                <th>Type</th>
                <th>Current Reading</th>
                <th>Last Read Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}><EmptyState title="No meters found" description="Try a different search query." /></td>
                </tr>
              ) : (
                paginated.map(m => (
                  <tr key={m.id}>
                    <td><span className="font-mono text-xs text-gray-500">{m.meterId || m.id}</span></td>
                    <td className="text-sm font-medium text-gray-800">{m.consumerName || '—'}</td>
                    <td><span className="badge badge-gray">{METER_TYPE_LABELS[m.meterType] || m.meterType || 'Single Phase'}</span></td>
                    <td><span className="font-semibold">{(m.currentReading ?? 0).toLocaleString('en-IN')} kWh</span></td>
                    <td className="text-sm text-gray-500">{m.lastReadingDate ? formatDate(m.lastReadingDate) : '—'}</td>
                    <td><StatusBadge status={m.status || 'ACTIVE'} /></td>
                    <td>
                      <button
                        type="button"
                        onClick={() => handleOpenReading(m)}
                        className="text-xs text-accent hover:underline font-medium px-2 py-1 rounded hover:bg-accent-muted"
                      >
                        Enter Reading
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > ITEMS_PER_PAGE && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
        )}
      </div>

      {readingModal && (
        <Modal
          isOpen={!!readingModal}
          onClose={() => setReadingModal(null)}
          title={`Enter Meter Reading — ${readingModal.meterId || readingModal.id}`}
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setReadingModal(null)}>Cancel</Button>
              <Button variant="primary" onClick={handleSaveReading}>Save Reading</Button>
            </>
          }
        >
          <form onSubmit={handleSaveReading} className="space-y-3">
            <p className="text-xs text-gray-500">Consumer: <strong>{readingModal.consumerName || '—'}</strong></p>
            <p className="text-xs text-gray-500">Current Reading: <span className="font-mono font-bold text-gray-800">{readingModal.currentReading ?? 0} kWh</span></p>
            <Input
              label="New Reading (kWh)"
              type="number"
              value={readingVal}
              onChange={e => {
                setReadingVal(e.target.value);
                setReadingError('');
              }}
              error={readingError}
              required
            />
          </form>
        </Modal>
      )}
    </AppShell>
  );
};

// --- Clerk Bills ---
export const ClerkBillsPage: React.FC = () => {
  const { bills } = useAppState();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [genModal, setGenModal] = useState(false);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [printBill, setPrintBill] = useState<Bill | null>(null);

  const filtered = bills.filter(b =>
    b.consumerName.toLowerCase().includes(search.toLowerCase()) ||
    b.billId.toLowerCase().includes(search.toLowerCase()) ||
    (b.billNumber && b.billNumber.toLowerCase().includes(search.toLowerCase())) ||
    b.billingPeriod.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <AppShell>
      <PageHeader
        title="Bills"
        subtitle="Generate and manage consumer bills."
        breadcrumb={['Clerk', 'Bills']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportBillingReport(filtered, 'clerk-bills.csv')}
              id="clerk-export-bills-btn"
            >
              <Download size={14} />Export CSV
            </Button>
            <Button variant="primary" size="sm" id="clerk-generate-bill-btn" onClick={() => setGenModal(true)}>
              <Plus size={14} />Generate Bill
            </Button>
          </div>
        }
      />
      <div className="bento-card mb-5">
        <SearchBar value={search} onChange={v => { setSearch(v); setPage(1); }} placeholder="Search bills..." className="max-w-sm" />
      </div>
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Bills table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Consumer</th>
                <th>Period</th>
                <th>Units</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8}><EmptyState title="No bills found" description="Try a different search query." /></td>
                </tr>
              ) : (
                paginated.map(b => (
                  <tr key={b.id}>
                    <td><span className="font-mono text-xs font-semibold text-gray-800">{b.billNumber || b.billId}</span></td>
                    <td>
                      <p className="text-sm font-medium text-gray-800">{b.consumerName}</p>
                      <p className="text-xs text-gray-400 font-mono">{b.meterNumber || b.meterId}</p>
                    </td>
                    <td className="text-sm text-gray-500">{b.billingPeriod}</td>
                    <td><span className="font-semibold">{b.unitsConsumed} kWh</span></td>
                    <td><span className="font-bold text-gray-900">{formatCurrency(b.totalAmount)}</span></td>
                    <td className="text-sm text-gray-500">{formatDate(b.dueDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewBill(b)}
                          className="text-xs text-accent hover:underline font-medium px-2 py-1 rounded hover:bg-accent-muted"
                        >
                          Breakdown
                        </button>
                        <button
                          onClick={() => setPrintBill(b)}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
                          title="Print / PDF"
                        >
                          <Printer size={12} />
                          Print
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > ITEMS_PER_PAGE && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={ITEMS_PER_PAGE} />
        )}
      </div>

      {/* Generate Bill Modal for Clerk */}
      <GenerateBillModal
        isOpen={genModal}
        onClose={() => setGenModal(false)}
        onSuccess={(newBill) => {
          setViewBill(newBill);
        }}
      />

      {/* Bill Breakdown Modal */}
      <BillBreakdownModal
        isOpen={!!viewBill}
        onClose={() => setViewBill(null)}
        bill={viewBill}
      />

      {/* Bill Print Modal */}
      <BillPrintModal
        isOpen={!!printBill}
        onClose={() => setPrintBill(null)}
        bill={printBill}
      />
    </AppShell>
  );
};

// --- Clerk Payments ---
export const ClerkPaymentsPage: React.FC = () => {
  const { payments, bills, recordPayment } = useAppState();
  const [search, setSearch] = useState('');
  const [recordOpen, setRecordOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI');

  const filtered = payments.filter(p =>
    p.consumerName.toLowerCase().includes(search.toLowerCase()) ||
    p.billId.toLowerCase().includes(search.toLowerCase())
  );

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const matched = bills.find(b => b.billId === billId.trim() || b.id === billId.trim()) || bills[0];

    recordPayment({
      billId: matched?.billId || 'BILL-2026-001',
      consumerId: matched?.consumerId || 'CON-001',
      consumerName: matched?.consumerName || 'Rahul Kumar',
      amount: Number(amount) || (matched?.totalAmount || 1000),
      paymentMethod: method,
      status: 'SUCCESS',
      transactionRef: `${method}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      remarks: 'Recorded by Clerk counter',
    });

    setRecordOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Payments"
        subtitle="Record and view payment transactions (Demo)."
        breadcrumb={['Clerk', 'Payments']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportPaymentReport(filtered, 'clerk-payments.csv')}
              id="clerk-export-payments-btn"
            >
              <Download size={14} />Export CSV
            </Button>
            <Button variant="primary" size="sm" id="clerk-record-payment-btn" onClick={() => setRecordOpen(true)}>
              <Plus size={14} />Record Payment
            </Button>
          </div>
        }
      />
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5">
        <p className="text-sm text-amber-800 font-medium">⚠ Payment is <strong>DEMO ONLY</strong>. No real gateway connected.</p>
      </div>
      <div className="bento-card mb-5">
        <SearchBar value={search} onChange={setSearch} placeholder="Search payments..." className="max-w-sm" />
      </div>
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Payments table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Bill ID</th>
                <th>Consumer</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id}>
                  <td><span className="font-mono text-xs text-gray-500">{p.paymentId}</span></td>
                  <td><span className="font-mono text-xs text-gray-500">{p.billId}</span></td>
                  <td className="text-sm font-medium text-gray-800">{p.consumerName}</td>
                  <td><span className="font-bold text-gray-900">{formatCurrency(p.amount)}</span></td>
                  <td><StatusBadge status={p.paymentMethod} /></td>
                  <td className="text-sm text-gray-500">{formatDateTime(p.paidAt)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <button
                      onClick={() => setSelectedReceipt(p)}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-medium px-2 py-1 rounded hover:bg-emerald-50 flex items-center gap-1 border border-emerald-200"
                      title="View Receipt"
                    >
                      <Printer size={12} />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {recordOpen && (
        <Modal
          isOpen={recordOpen}
          onClose={() => setRecordOpen(false)}
          title="Record Counter Payment"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSavePayment}>Save Payment</Button>
            </>
          }
        >
          <form onSubmit={handleSavePayment} className="space-y-4">
            <Select
              label="Select Bill"
              value={billId}
              onChange={e => {
                setBillId(e.target.value);
                const b = bills.find(x => x.billId === e.target.value);
                if (b) setAmount(String(b.totalAmount));
              }}
              options={bills.map(b => ({
                value: b.billId,
                label: `${b.billId} — ${b.consumerName} (${formatCurrency(b.totalAmount)})`,
              }))}
              placeholder="Choose bill"
            />
            <Input
              label="Amount (₹)"
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              required
            />
            <Select
              label="Payment Method"
              value={method}
              onChange={e => setMethod(e.target.value as PaymentMethod)}
              options={[
                { value: 'CASH', label: 'Cash Counter' },
                { value: 'UPI', label: 'UPI QR' },
                { value: 'CARD', label: 'POS Card' },
                { value: 'CHEQUE', label: 'Cheque' },
              ]}
            />
          </form>
        </Modal>
      )}

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </AppShell>
  );
};

// --- Clerk Reports ---
export const ClerkReportsPage: React.FC = () => {
  const { monthlyStats, bills, payments } = useAppState();
  return (
    <AppShell>
      <PageHeader
        title="Reports"
        subtitle="View consumption and revenue summaries."
        breadcrumb={['Clerk', 'Reports']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportBillingReport(bills, 'clerk-billing-summary.csv')}
              id="clerk-export-bills-report-btn"
            >
              <Download size={14} />Export Bills (CSV)
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportPaymentReport(payments, 'clerk-payments-summary.csv')}
              id="clerk-export-payments-report-btn"
            >
              <Download size={14} />Export Payments (CSV)
            </Button>
          </div>
        }
      />
      <div className="space-y-4">
        <ChartCard title="Monthly Consumption (kWh)" subtitle="Jan – Oct 2026">
          <ConsumptionChart data={monthlyStats} height={240} />
        </ChartCard>
        <ChartCard title="Revenue Trend (₹)" subtitle="Jan – Oct 2026">
          <RevenueChart data={monthlyStats} height={240} />
        </ChartCard>
      </div>
    </AppShell>
  );
};
