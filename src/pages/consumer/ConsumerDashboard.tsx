import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, AlertCircle, CreditCard, TrendingUp, CheckCircle2 } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ChartCard, ConsumptionChart } from '../../components/charts/Charts';
import { useAuth } from '../../hooks/useAuth';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency, formatDate, daysFromNow } from '../../lib/utils';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { BillBreakdownModal } from '../../components/billing/BillBreakdownModal';

export const ConsumerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { bills, consumptionRecords, payments, recordPayment } = useAppState();

  const [payModalOpen, setPayModalOpen] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<'UPI' | 'CARD' | 'NETBANKING'>('UPI');

  // Filter bills for Rahul Kumar (C10234 / CON-001)
  const myBills = bills.filter(
    b =>
      b.consumerId === currentUser?.consumerId ||
      b.consumerId === currentUser?.id ||
      b.consumerId === 'CON-001' ||
      b.consumerName === currentUser?.name
  );

  const currentBill = myBills.find(b => b.status === 'UNPAID' || b.status === 'OVERDUE') || myBills[0] || {
    id: 'B-001',
    billId: 'BILL-2026-001',
    consumerId: 'CON-001',
    consumerName: 'Rahul Kumar',
    meterNumber: 'MTR-BLR-00124',
    billingPeriod: 'September 2026',
    billingPeriodFrom: '2026-09-01',
    billingPeriodTo: '2026-09-30',
    previousReading: 15232,
    currentReading: 15482,
    unitsConsumed: 250,
    energyCharges: 855,
    fixedCharge: 25,
    tax: 88,
    surcharge: 42,
    totalAmount: 1010,
    dueDate: '2026-10-15',
    status: 'PAID' as const,
    generatedAt: '2026-10-01',
  };

  const daysLeft = daysFromNow(currentBill.dueDate);
  const myPayments = payments.filter(
    p =>
      p.consumerId === currentUser?.consumerId ||
      p.consumerId === currentUser?.id ||
      p.consumerId === 'CON-001' ||
      p.consumerName === currentUser?.name
  );

  const handlePayNow = (e: React.FormEvent) => {
    e.preventDefault();
    recordPayment({
      billId: currentBill.billId,
      consumerId: currentBill.consumerId,
      consumerName: currentBill.consumerName,
      amount: currentBill.totalAmount,
      paymentMethod: selectedMethod,
      status: 'SUCCESS',
      transactionRef: `${selectedMethod}-${Math.floor(10000000 + Math.random() * 90000000)}`,
      remarks: 'Paid from Consumer Dashboard',
    });

    setPaySuccess(true);
    setTimeout(() => {
      setPaySuccess(false);
      setPayModalOpen(false);
    }, 1500);
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Good evening, {currentUser?.name?.split(' ')[0] || 'Rahul'} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Welcome to your electricity account.
        </p>
      </div>

      {/* Current Bill + Usage row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
        {/* Current Bill */}
        <div className="bento-card bg-black text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Current Bill</p>
              <p className="text-3xl font-bold text-white mt-1">{formatCurrency(currentBill.totalAmount)}</p>
              <p className="text-sm text-gray-400 mt-0.5">{currentBill.billingPeriod}</p>
            </div>
            <div className="bg-white/10 p-2.5 rounded-lg">
              <Zap size={18} className="text-accent" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <AlertCircle size={13} className={currentBill.status === 'PAID' ? 'text-accent' : daysLeft <= 3 ? 'text-red-400' : 'text-amber-400'} />
            <p className={`text-xs font-medium ${currentBill.status === 'PAID' ? 'text-accent' : daysLeft <= 3 ? 'text-red-400' : 'text-amber-400'}`}>
              {currentBill.status === 'PAID'
                ? 'Bill is Paid in Full ✓'
                : daysLeft > 0
                ? `Due in ${daysLeft} days · ${formatDate(currentBill.dueDate)}`
                : `Overdue! · ${formatDate(currentBill.dueDate)}`}
            </p>
          </div>

          {currentBill.status !== 'PAID' ? (
            <Button
              variant="primary"
              size="lg"
              className="w-full !text-black"
              id="consumer-pay-now-btn"
              onClick={() => setPayModalOpen(true)}
            >
              <CreditCard size={15} />
              Pay Now (Demo)
            </Button>
          ) : (
            <div className="w-full py-2.5 px-3 bg-white/10 rounded-lg text-center text-xs font-semibold text-accent">
              ✓ No Payment Pending
            </div>
          )}
        </div>

        {/* Current Usage */}
        <div className="bento-card">
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Current Usage</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {currentBill.unitsConsumed}
                <span className="text-lg font-normal text-gray-400 ml-1">kWh</span>
              </p>
              <p className="text-sm text-gray-400">This Month</p>
            </div>
            <div className="bg-gray-100 p-2.5 rounded-lg">
              <TrendingUp size={18} className="text-gray-600" />
            </div>
          </div>

          <div className="space-y-2 mt-3 pt-3 border-t border-gray-100">
            {[
              { label: 'Previous Reading', value: `${currentBill.previousReading.toLocaleString('en-IN')} kWh` },
              { label: 'Current Reading', value: `${currentBill.currentReading.toLocaleString('en-IN')} kWh` },
              { label: 'Units Consumed', value: `${currentBill.unitsConsumed} kWh` },
            ].map(r => (
              <div key={r.label} className="flex justify-between">
                <span className="text-xs text-gray-500">{r.label}</span>
                <span className="text-xs font-semibold text-gray-800">{r.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Account Summary */}
        <div className="bento-card">
          <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-3">Account Details</p>
          <div className="space-y-3">
            {[
              { label: 'Consumer ID', value: currentUser?.consumerId || 'C10234' },
              { label: 'Meter Number', value: currentBill.meterNumber || 'MTR-BLR-00124' },
              { label: 'Connection Type', value: 'Residential' },
              { label: 'Sanctioned Load', value: '5 kW' },
              { label: 'Account Status', value: 'Active' },
            ].map(r => (
              <div key={r.label} className="flex justify-between items-center">
                <span className="text-xs text-gray-500">{r.label}</span>
                <span className={`text-xs font-semibold ${r.label === 'Account Status' ? 'text-green-600' : 'text-gray-800'}`}>
                  {r.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <ChartCard
          title="Usage History"
          subtitle="Monthly electricity consumption (kWh)"
          className="lg:col-span-2"
          actions={
            <span className="text-xs text-gray-400">Jan – Sep 2026</span>
          }
        >
          <ConsumptionChart
            data={consumptionRecords.map(c => ({
              month: c.month,
              consumption: c.units,
              revenue: 0,
              billsGenerated: 0,
              paymentReceived: 0,
            }))}
            height={200}
          />
        </ChartCard>

        {/* Charge Breakdown */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Bill Breakdown</h3>
            {currentBill && (
              <button
                onClick={() => setBreakdownOpen(true)}
                className="text-xs text-accent font-medium hover:underline"
              >
                View Details
              </button>
            )}
          </div>
          <div className="space-y-3">
            {[
              { label: 'Energy Charges', value: currentBill.energyCharges, pct: (currentBill.energyCharges / currentBill.totalAmount) * 100 },
              { label: 'Fixed Charge', value: currentBill.fixedCharge, pct: (currentBill.fixedCharge / currentBill.totalAmount) * 100 },
              { label: 'Tax (GST)', value: currentBill.tax, pct: (currentBill.tax / currentBill.totalAmount) * 100 },
              { label: 'Surcharge', value: currentBill.surcharge, pct: (currentBill.surcharge / currentBill.totalAmount) * 100 },
            ].map(item => (
              <div key={item.label}>
                <div className="flex justify-between mb-1">
                  <span className="text-xs text-gray-600">{item.label}</span>
                  <span className="text-xs font-semibold text-gray-800">{formatCurrency(item.value)}</span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full">
                  <div
                    className="h-full bg-accent rounded-full"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="flex justify-between pt-3 border-t border-gray-100">
              <span className="text-sm font-semibold text-gray-800">Total</span>
              <span className="text-sm font-bold text-gray-900">{formatCurrency(currentBill.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bento-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Payment History</h3>
          <button
            onClick={() => navigate('/consumer/payments')}
            className="text-xs text-accent font-medium hover:underline"
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="table" aria-label="Consumer Payment history">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Bill ID</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myPayments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">No payments recorded yet.</td>
                </tr>
              ) : (
                myPayments.map(p => (
                  <tr key={p.id}>
                    <td><span className="font-mono text-xs text-gray-500">{p.paymentId}</span></td>
                    <td><span className="font-mono text-xs text-gray-500">{p.billId}</span></td>
                    <td><span className="font-semibold text-gray-900">{formatCurrency(p.amount)}</span></td>
                    <td><StatusBadge status={p.paymentMethod} /></td>
                    <td className="text-sm text-gray-500">{formatDate(p.paidAt)}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bill Breakdown Modal */}
      <BillBreakdownModal
        isOpen={breakdownOpen}
        onClose={() => setBreakdownOpen(false)}
        bill={currentBill}
        showPayButton={true}
        onPay={() => {
          setBreakdownOpen(false);
          setPayModalOpen(true);
        }}
      />

      {/* Pay Bill Modal (Demo) */}
      {payModalOpen && (
        <Modal
          isOpen={payModalOpen}
          onClose={() => setPayModalOpen(false)}
          title={`Pay Electricity Bill: ${currentBill.billId}`}
          size="md"
        >
          {paySuccess ? (
            <div className="text-center py-6">
              <CheckCircle2 size={48} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-gray-900">Payment Successful!</h3>
              <p className="text-sm text-gray-500 mt-1">
                Demo receipt generated. Bill marked as PAID.
              </p>
            </div>
          ) : (
            <form onSubmit={handlePayNow} className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
                <strong>DEMO NOTICE:</strong> This is a simulation environment. No actual banking or payment gateway is invoked.
              </div>

              <div className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount Due</span>
                <span className="text-xl font-bold text-gray-900">{formatCurrency(currentBill.totalAmount)}</span>
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
                  Authorize Demo Payment ({formatCurrency(currentBill.totalAmount)})
                </Button>
              </div>
            </form>
          )}
        </Modal>
      )}
    </AppShell>
  );
};
