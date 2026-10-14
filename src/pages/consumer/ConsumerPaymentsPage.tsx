import React, { useState } from 'react';
import { CreditCard, Download, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { PaymentReceiptModal } from '../../components/billing/PaymentReceiptModal';
import { exportPaymentReport } from '../../lib/csvExport';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { PaymentMethod, Payment } from '../../types';

export const ConsumerPaymentsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { payments, bills, recordPayment } = useAppState();

  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [payMethod, setPayMethod] = useState<PaymentMethod>('UPI');
  const [paySuccess, setPaySuccess] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  // Consumer's payments
  const consumerPayments = payments.filter(
    p =>
      p.consumerId === currentUser?.consumerId ||
      p.consumerId === currentUser?.id ||
      p.consumerId === 'CON-001' ||
      p.consumerName === currentUser?.name
  );

  // Consumer's pending bill
  const pendingBill = bills.find(
    b =>
      (b.consumerId === currentUser?.consumerId ||
        b.consumerId === currentUser?.id ||
        b.consumerId === 'CON-001' ||
        b.consumerName === currentUser?.name) &&
      (b.status === 'UNPAID' || b.status === 'OVERDUE')
  );

  const handleDemoPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingBill) return;

    recordPayment({
      billId: pendingBill.billId,
      consumerId: pendingBill.consumerId,
      consumerName: pendingBill.consumerName,
      amount: pendingBill.totalAmount,
      paymentMethod: payMethod,
      transactionRef: `TXN${Date.now().toString().slice(-8)}`,
      status: 'SUCCESS',
      remarks: 'Paid via Consumer Payments Page',
    });

    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setIsPayModalOpen(false);
    }, 1500);
  };

  return (
    <AppShell>
      <PageHeader
        title="Payments & Receipts"
        subtitle="Manage payment transactions and download official payment receipts."
        breadcrumb={['Consumer', 'Payments']}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportPaymentReport(consumerPayments, 'my-payment-history.csv')}
              id="export-consumer-payments-btn"
            >
              <Download size={14} /> Export History (CSV)
            </Button>
            {pendingBill && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsPayModalOpen(true)}
                id="consumer-pay-bill-btn"
              >
                <CreditCard size={14} />
                Pay Due Bill ({formatCurrency(pendingBill.totalAmount)})
              </Button>
            )}
          </div>
        }
      />

      {/* Demo Notice Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3.5 mb-5 flex items-start gap-2.5">
        <AlertCircle size={17} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800 leading-relaxed">
          <strong>DEMO ENVIRONMENT NOTICE:</strong> This application operates in prototype demonstration mode.
          No actual banking transactions, cards, or UPI calls occur. Simulated payment confirmations are generated locally.
        </div>
      </div>

      {/* Payments Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="section-title">Payment History</h3>
          <span className="text-xs text-gray-400 font-mono">{consumerPayments.length} records</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table" aria-label="Consumer Payments table">
            <thead>
              <tr>
                <th>Receipt / Payment ID</th>
                <th>Bill Reference</th>
                <th>Transaction Ref</th>
                <th>Payment Mode</th>
                <th>Amount</th>
                <th>Paid On</th>
                <th>Status</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {consumerPayments.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400 text-sm">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              ) : (
                consumerPayments.map(p => (
                  <tr key={p.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-gray-900">{p.paymentId}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-gray-500">{p.billId}</span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-gray-500">{p.transactionRef ?? '—'}</span>
                    </td>
                    <td>
                      <StatusBadge status={p.paymentMethod} />
                    </td>
                    <td>
                      <span className="font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                    </td>
                    <td className="text-sm text-gray-500">{formatDateTime(p.paidAt)}</td>
                    <td>
                      <StatusBadge status={p.status} />
                    </td>
                    <td>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setSelectedReceipt(p)}
                        title="View Official Receipt"
                        className="text-emerald-700 hover:text-emerald-900 border-emerald-200"
                      >
                        <Printer size={13} />
                        Receipt
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pay Modal */}
      {isPayModalOpen && pendingBill && (
        <Modal
          isOpen={isPayModalOpen}
          onClose={() => setIsPayModalOpen(false)}
          title="Instant Electricity Bill Payment (Demo)"
          size="md"
        >
          {paySuccess ? (
            <div className="text-center py-6">
              <CheckCircle2 size={46} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Your payment of {formatCurrency(pendingBill.totalAmount)} has been credited. Bill marked as PAID.
              </p>
            </div>
          ) : (
            <form onSubmit={handleDemoPay} className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center border border-gray-100">
                <div>
                  <p className="text-xs text-gray-500">Bill ID</p>
                  <p className="font-mono font-semibold text-gray-900 text-sm">{pendingBill.billId}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Payable Amount</p>
                  <p className="font-bold text-gray-900 text-lg">{formatCurrency(pendingBill.totalAmount)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Demo Payment Gateway Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'UPI' as const, label: 'UPI / QR' },
                    { id: 'CARD' as const, label: 'Card / Debit' },
                    { id: 'NETBANKING' as const, label: 'Net Banking' },
                  ].map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setPayMethod(m.id)}
                      className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                        payMethod === m.id
                          ? 'border-black bg-black text-white font-semibold'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button variant="secondary" type="button" onClick={() => setIsPayModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" id="consumer-demo-confirm-btn">
                  Simulate Payment ({formatCurrency(pendingBill.totalAmount)})
                </Button>
              </div>
            </form>
          )}
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
