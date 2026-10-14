import React from 'react';
import { Users, Gauge, Receipt, CreditCard, Zap, IndianRupee } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { ChartCard, ConsumptionChart, RevenueChart } from '../../components/charts/Charts';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency, formatDate, formatIndianNumber } from '../../lib/utils';

export const AdminDashboard: React.FC = () => {
  const { dashboardStats, monthlyStats, payments, consumers, meters, bills } = useAppState();

  const dynamicRevenue = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const pendingBillsCount = bills.filter(b => b.status === 'UNPAID' || b.status === 'OVERDUE').length;
  const activeMetersCount = meters.filter(m => m.status === 'ACTIVE').length;

  const recentPayments = payments.slice(0, 5);

  return (
    <AppShell>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Good morning, Admin 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Here's what's happening with your electricity network today.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Revenue"
          value={`₹${formatIndianNumber(dynamicRevenue || dashboardStats.totalRevenue)}`}
          change={dashboardStats.revenueChange}
          icon={<IndianRupee size={18} className="text-accent" />}
          iconBg="bg-accent-muted"
        />
        <StatCard
          title="Total Consumers"
          value={formatIndianNumber(consumers.length || dashboardStats.totalConsumers)}
          change={dashboardStats.consumerChange}
          icon={<Users size={18} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Pending Bills"
          value={formatIndianNumber(pendingBillsCount)}
          change={dashboardStats.pendingChange}
          icon={<Receipt size={18} className="text-amber-500" />}
          iconBg="bg-amber-50"
        />
        <StatCard
          title="Active Meters"
          value={formatIndianNumber(activeMetersCount || dashboardStats.activeMeters)}
          change={dashboardStats.meterChange}
          icon={<Gauge size={18} className="text-gray-600" />}
          iconBg="bg-gray-100"
        />
      </div>

      {/* Charts + Quick Info — Bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {/* Monthly Consumption */}
        <ChartCard
          title="Monthly Consumption"
          subtitle="kWh usage — Jan to Oct 2026"
          className="lg:col-span-2"
        >
          <ConsumptionChart data={monthlyStats} height={210} />
        </ChartCard>

        {/* Network Summary */}
        <div className="bento-card flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-accent rounded-lg flex items-center justify-center shrink-0">
              <Zap size={18} className="text-black" fill="currentColor" />
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Grid Efficiency</p>
              <p className="text-2xl font-bold text-gray-900 mt-0.5">97.4%</p>
            </div>
          </div>
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2.5 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Smart Meter Coverage</span>
              <span className="font-semibold text-gray-900">84.2%</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Collection Efficiency</span>
              <span className="font-semibold text-gray-900">92.8%</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Avg. Bill Processing Time</span>
              <span className="font-semibold text-gray-900">&lt; 2 hrs</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Active Feeder Lines</span>
              <span className="font-semibold text-gray-900">14 / 14</span>
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Trend + Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <ChartCard
          title="Revenue Trend"
          subtitle="Monthly collections (₹) — 2026"
          className="lg:col-span-2"
        >
          <RevenueChart data={monthlyStats} height={200} />
        </ChartCard>

        {/* Quick KPI column */}
        <div className="grid grid-cols-1 gap-3">
          {[
            { label: 'Payments Today', value: String(payments.length), sub: 'transactions recorded', icon: <CreditCard size={15} className="text-gray-500" /> },
            { label: 'Faulty Meters', value: String(meters.filter(m => m.status === 'FAULTY').length), sub: 'require attention', icon: <Gauge size={15} className="text-amber-500" /> },
            { label: 'New Consumers', value: String(consumers.length), sub: 'total registered', icon: <Users size={15} className="text-accent" /> },
          ].map(s => (
            <div key={s.label} className="bento-card">
              <div className="mb-2">{s.icon}</div>
              <p className="text-xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs font-medium text-gray-700 mt-0.5">{s.label}</p>
              <p className="text-xs text-gray-400">{s.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Payments Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="section-title">Recent Payments</h3>
          <span className="text-xs text-accent font-medium">Live Stream</span>
        </div>
        <div className="overflow-x-auto">
          <table className="table" aria-label="Recent payments">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Consumer Name</th>
                <th>Amount</th>
                <th>Payment Mode</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.map(p => (
                <tr key={p.id}>
                  <td>
                    <span className="font-mono text-xs text-gray-500">{p.billId}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-gray-600">
                          {p.consumerName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="font-medium text-gray-800 text-sm">{p.consumerName}</span>
                    </div>
                  </td>
                  <td>
                    <span className="font-semibold text-gray-900">{formatCurrency(p.amount)}</span>
                  </td>
                  <td>
                    <StatusBadge status={p.paymentMethod} />
                  </td>
                  <td className="text-gray-500 text-sm">{formatDate(p.paidAt)}</td>
                  <td>
                    <StatusBadge status={p.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
};
