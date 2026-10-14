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
import { PaymentReceiptModal } from '../../components/billing/PaymentReceiptModal';
import { exportPaymentReport } from '../../lib/csvExport';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { PaymentMethod, Payment } from '../../types';

const ITEMS_PER_PAGE = 6;

export const PaymentsPage: React.FC = () => {
  const { payments, bills, recordPayment } = useAppState();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [recordOpen, setRecordOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Record Payment Form
  const [billId, setBillId] = useState('');
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('UPI');
  const [remarks, setRemarks] = useState('');

  const filtered = payments.filter(p =>
    p.consumerName.toLowerCase().includes(search.toLowerCase()) ||
    p.paymentId.toLowerCase().includes(search.toLowerCase()) ||
    p.billId.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const totalCollected = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const matchedBill = bills.find(b => b.billId === billId.trim() || b.id === billId.trim()) || bills[0];

    recordPayment({
      billId: matchedBill ? matchedBill.billId : (billId.trim() || 'BILL-2026-001'),
      consumerId: matchedBill ? matchedBill.consumerId : 'CON-001',
      consumerName: matchedBill ? matchedBill.consumerName : 'Rahul Kumar',
      amount: Number(amount) || (matchedBill ? matchedBill.totalAmount : 1000),
      paymentMethod: method,
      status: 'SUCCESS',
      transactionRef: `${method}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      remarks: remarks.trim() || 'Manual payment entry',
    });

    setBillId('');
    setAmount('');
    setRemarks('');
    setRecordOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Payments"
        subtitle="Track and record payment transactions. Demo payments only — no real gateway."
        breadcrumb={['Admin', 'Payments']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportPaymentReport(filtered, 'payments-collection.csv')}
              id="export-payments-btn"
            >
              <Download size={14} />Export CSV
            </Button>
            <Button variant="primary" size="sm" onClick={() => setRecordOpen(true)} id="record-payment-btn">
              <Plus size={14} />Record Payment
            </Button>
          </div>
        }
      />

      {/* Demo notice */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-5 flex items-center gap-3">
        <span className="text-amber-500">⚠</span>
        <p className="text-sm text-amber-800 font-medium">
          Payment is <strong>DEMO ONLY</strong>. No real payment gateway is connected. All transactions shown are mock data.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Collected', value: formatCurrency(totalCollected), color: 'text-green-600' },
          { label: 'Successful', value: String(payments.filter(p => p.status === 'SUCCESS').length), color: 'text-green-600' },
          { label: 'Pending', value: String(payments.filter(p => p.status === 'PENDING').length), color: 'text-amber-600' },
          { label: 'Failed', value: String(payments.filter(p => p.status === 'FAILED').length), color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bento-card text-center py-3">
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bento-card mb-5">
        <SearchBar
          value={search}
          onChange={v => { setSearch(v); setPage(1); }}
          placeholder="Search by payment ID, consumer, bill..."
          className="max-w-sm"
        />
      </div>

      {/* Table */}
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
                <th>Transaction Ref</th>
                <th>Date & Time</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={9}><EmptyState title="No payments found" description="No payment records match your search." /></td></tr>
              ) : (
                paginated.map(p => (
                  <tr key={p.id}>
                    <td><span className="font-mono text-xs text-gray-500">{p.paymentId}</span></td>
                    <td><span className="font-mono text-xs text-gray-500">{p.billId}</span></td>
                    <td className="text-sm font-medium text-gray-800">{p.consumerName}</td>
                    <td><span className="font-bold text-gray-900">{formatCurrency(p.amount)}</span></td>
                    <td><StatusBadge status={p.paymentMethod} /></td>
                    <td>
                      <span className="font-mono text-xs text-gray-500">
                        {p.transactionRef ?? '—'}
                      </span>
                    </td>
                    <td className="text-sm text-gray-500">{formatDateTime(p.paidAt)}</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <button
                        onClick={() => setSelectedReceipt(p)}
                        className="text-xs text-emerald-700 hover:text-emerald-900 font-medium px-2 py-1 rounded hover:bg-emerald-50 flex items-center gap-1 border border-emerald-200"
                        title="View Official Receipt"
                      >
                        <Printer size={12} />
                        Receipt
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filtered.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={page} totalPages={totalPages}
            onPageChange={setPage} totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={recordOpen}
        onClose={() => setRecordOpen(false)}
        title="Record Payment (Demo)"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setRecordOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleRecordPayment}>Record Payment</Button>
          </>
        }
      >
        <form onSubmit={handleRecordPayment} className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-xs text-amber-700">
            This is a DEMO payment entry. No real transaction will be processed. Recording payment automatically updates the bill to PAID.
          </div>
          <Select
            label="Select Bill to Pay"
            id="pay-bill-select"
            value={billId}
            onChange={e => {
              setBillId(e.target.value);
              const b = bills.find(x => x.billId === e.target.value);
              if (b) setAmount(String(b.totalAmount));
            }}
            options={bills.map(b => ({
              value: b.billId,
              label: `${b.billId} — ${b.consumerName} (${formatCurrency(b.totalAmount)} · ${b.status})`,
            }))}
            placeholder="Select a bill"
          />
          <Input
            label="Amount (₹)"
            type="number"
            placeholder="1010"
            id="pay-amount"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            required
          />
          <Select
            label="Payment Method"
            id="pay-method"
            value={method}
            onChange={e => setMethod(e.target.value as PaymentMethod)}
            options={[
              { value: 'UPI', label: 'UPI' },
              { value: 'CARD', label: 'Credit / Debit Card' },
              { value: 'CASH', label: 'Cash' },
              { value: 'NETBANKING', label: 'Net Banking' },
              { value: 'CHEQUE', label: 'Cheque' },
            ]}
          />
          <Input
            label="Remarks"
            placeholder="Any additional notes"
            id="pay-remarks"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </form>
      </Modal>

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />
    </AppShell>
  );
};
