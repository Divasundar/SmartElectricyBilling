import React, { useState } from 'react';
import { CreditCard, Eye, CheckCircle2, Download, Printer } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { BillBreakdownModal } from '../../components/billing/BillBreakdownModal';
import { BillPrintModal } from '../../components/billing/BillPrintModal';
import { PaymentReceiptModal } from '../../components/billing/PaymentReceiptModal';
import { exportBillingReport } from '../../lib/csvExport';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Bill, Payment } from '../../types';

export const ConsumerBillsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { bills, payments, recordPayment } = useAppState();

  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'UNPAID'>('ALL');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [printBill, setPrintBill] = useState<Bill | null>(null);
  const [payModalBill, setPayModalBill] = useState<Bill | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  // Filter bills for authenticated Consumer (Rahul Kumar: C10234 / CON-001)
  const consumerBills = bills.filter(
    b =>
      b.consumerId === currentUser?.consumerId ||
      b.consumerId === currentUser?.id ||
      b.consumerId === 'CON-001' ||
      b.consumerName === currentUser?.name
  );

  const filteredBills = consumerBills.filter(b => {
    if (filter === 'PAID') return b.status === 'PAID';
    if (filter === 'UNPAID') return b.status === 'UNPAID' || b.status === 'OVERDUE';
    return true;
  });

  const handlePayDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payModalBill) return;

    recordPayment({
      billId: payModalBill.billId,
      consumerId: payModalBill.consumerId,
      consumerName: payModalBill.consumerName,
      amount: payModalBill.totalAmount,
      paymentMethod: selectedMethod,
      status: 'SUCCESS',
      transactionRef: `${selectedMethod}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      remarks: 'Paid via Consumer Portal',
    });

    setPaymentSuccess(true);
    setTimeout(() => {
      setPaymentSuccess(false);
      setPayModalBill(null);
    }, 1600);
  };

  return (
    <AppShell>
      <PageHeader
        title="My Bills"
        subtitle="View and download electricity invoices, track payment status."
        breadcrumb={['Consumer', 'My Bills']}
        actions={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => exportBillingReport(consumerBills, 'my-electricity-invoices.csv')}
            id="export-my-bills-btn"
          >
            <Download size={14} /> Export Invoices (CSV)
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-5 border-b border-gray-200 pb-3">
        {(['ALL', 'UNPAID', 'PAID'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              filter === tab
                ? 'bg-black text-white'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {tab === 'ALL' ? 'All Invoices' : tab === 'UNPAID' ? 'Pending Bills' : 'Paid Invoices'}
          </button>
        ))}
      </div>

      {/* Bills Table Bento */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Consumer Bills table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Billing Period</th>
                <th>Units (kWh)</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                    No bills match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredBills.map(bill => (
                  <tr key={bill.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-gray-900">
                        {bill.billNumber || bill.billId}
                      </span>
                    </td>
                    <td>
                      <span className="text-sm font-medium text-gray-800">{bill.billingPeriod}</span>
                    </td>
                    <td>
                      <span className="text-sm font-semibold text-gray-900">{bill.unitsConsumed}</span>
                      <span className="text-xs text-gray-400 ml-1">kWh</span>
                    </td>
                    <td>
                      <span className="font-bold text-gray-900 text-sm">
                        {formatCurrency(bill.totalAmount)}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-600">{formatDate(bill.dueDate)}</span>
                    </td>
                    <td>
                      <StatusBadge status={bill.status} />
                    </td>
                    <td>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setSelectedBill(bill)}
                        >
                          <Eye size={13} />
                          Breakdown
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPrintBill(bill)}
                          title="Print / Save PDF"
                        >
                          <Printer size={13} />
                          Print
                        </Button>
                        {bill.status !== 'PAID' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              setSelectedBill(null);
                              setPayModalBill(bill);
                            }}
                          >
                            <CreditCard size={13} />
                            Pay (Demo)
                          </Button>
                        )}
                        {bill.status === 'PAID' && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              const p = payments.find(x => x.billId === bill.billId) || {
                                id: 'RCP-MOCK',
                                paymentId: 'PAY-' + bill.billId,
                                billId: bill.billId,
                                consumerId: bill.consumerId,
                                consumerName: bill.consumerName,
                                amount: bill.totalAmount,
                                paymentMethod: 'UPI',
                                status: 'SUCCESS',
                                paidAt: bill.generatedAt || new Date().toISOString(),
                                transactionRef: `UPI-${Math.floor(10000000 + Math.random() * 90000000)}`,
                              };
                              setSelectedReceipt(p);
                            }}
                            className="text-emerald-700 hover:text-emerald-900 border-emerald-200"
                            title="View Payment Receipt"
                          >
                            <Printer size={13} />
                            Receipt
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Breakdown Modal (Parts 21 & 22) */}
      <BillBreakdownModal
        isOpen={!!selectedBill}
        onClose={() => setSelectedBill(null)}
        bill={selectedBill}
        showPayButton={true}
        onPay={(bill) => {
          setSelectedBill(null);
          setPayModalBill(bill);
        }}
      />

      {/* Bill Print / PDF Modal */}
      <BillPrintModal
        isOpen={!!printBill}
        onClose={() => setPrintBill(null)}
        bill={printBill}
      />

      {/* Payment Receipt Modal */}
      <PaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
      />

      {/* Pay Bill Modal (Demo) */}
      {payModalBill && (
        <Modal
          isOpen={!!payModalBill}
          onClose={() => setPayModalBill(null)}
          title={`Pay Electricity Bill: ${payModalBill.billId}`}
          size="md"
        >
          {paymentSuccess ? (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Demo receipt generated. Bill marked as PAID.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePayDemo} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>DEMO NOTICE:</strong> This is a simulation environment. No actual banking or payment gateway is invoked.
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount Due</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(payModalBill.totalAmount)}</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['UPI', 'CARD', 'NETBANKING'] as const).map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setSelectedMethod(method)}
                      className={`p-3 rounded-lg border text-center text-xs font-semibold transition-all ${
                        selectedMethod === method
                          ? 'border-black bg-black text-white shadow-sm'
                          : 'border-gray-200 hover:border-gray-400 text-gray-700'
                      }`}
                    >
                      {method === 'NETBANKING' ? 'Net Banking' : method}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" variant="primary" size="lg" className="w-full">
                  Authorize Demo Payment ({formatCurrency(payModalBill.totalAmount)})
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AppShell>
  );
};
