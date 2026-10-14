import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { ChartCard, ConsumptionChart, RevenueChart } from '../../components/charts/Charts';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency } from '../../lib/utils';
import { CHART_COLORS } from '../../lib/theme';
import { exportBillingReport, exportPaymentReport, exportConsumptionReport, exportToCSV } from '../../lib/csvExport';
import { Download, FileSpreadsheet, Calendar } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { monthlyStats, payments, consumers, bills } = useAppState();
  const [activeTab, setActiveTab] = useState<'consumption' | 'revenue' | 'payments' | 'consumers'>('consumption');
  const [exportDropdownOpen, setExportDropdownOpen] = useState(false);

  const paymentStatusData = [
    { name: 'Paid', value: bills.filter(b => b.status === 'PAID').length, color: CHART_COLORS.primary },
    { name: 'Unpaid', value: bills.filter(b => b.status === 'UNPAID').length, color: '#E5E7EB' },
    { name: 'Overdue', value: bills.filter(b => b.status === 'OVERDUE').length, color: '#374151' },
  ];

  const topConsumers = consumers
    .slice(0, 5)
    .map((c, i) => ({
      name: c.name.split(' ')[0],
      units: 240 + i * 80,
      amount: (240 + i * 80) * 5.5,
    }));

  const tabs = [
    { id: 'consumption' as const, label: 'Consumption' },
    { id: 'revenue' as const, label: 'Revenue' },
    { id: 'payments' as const, label: 'Payments' },
    { id: 'consumers' as const, label: 'Consumers' },
  ];

  const handleExportCurrentTab = () => {
    if (activeTab === 'consumption') {
      const consumptionData = bills.map(b => ({
        consumerName: b.consumerName,
        consumerId: b.consumerId,
        meterNumber: b.meterNumber || 'MTR-AUTO',
        billingPeriod: b.billingPeriod,
        previousReading: b.previousReading ?? (b.unitsConsumed - 50),
        currentReading: b.currentReading ?? b.unitsConsumed,
        unitsConsumed: b.unitsConsumed,
      }));
      exportConsumptionReport(consumptionData, 'monthly-consumption-report.csv');
    } else if (activeTab === 'revenue') {
      exportBillingReport(bills, 'revenue-billing-report.csv');
    } else if (activeTab === 'payments') {
      exportPaymentReport(payments, 'payment-collections-report.csv');
    } else {
      const consumerExport = consumers.map(c => ({
        'Consumer ID': c.consumerId,
        'Name': c.name,
        'Email': c.email,
        'Phone': c.phone,
        'Meter': c.meterNumber,
        'Category': c.connectionType,
        'Status': c.status,
      }));
      exportToCSV(consumerExport, 'consumers-report.csv');
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Monthly consumption, revenue, and payment analytics."
        breadcrumb={['Admin', 'Reports']}
        actions={
          <div className="relative">
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setExportDropdownOpen(!exportDropdownOpen)}
                id="export-report-dropdown-btn"
              >
                <Download size={14} /> Export Options ▾
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleExportCurrentTab}
                id="export-active-tab-btn"
              >
                <FileSpreadsheet size={14} /> Export {tabs.find(t => t.id === activeTab)?.label} CSV
              </Button>
            </div>

            {exportDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1.5 z-20">
                <button
                  onClick={() => {
                    exportBillingReport(bills, 'all-bills-report.csv');
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={13} className="text-emerald-600" />
                  Billing Register (CSV)
                </button>
                <button
                  onClick={() => {
                    exportPaymentReport(payments, 'payment-collections.csv');
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={13} className="text-emerald-600" />
                  Payment Collections (CSV)
                </button>
                <button
                  onClick={() => {
                    const consumptionData = bills.map(b => ({
                      consumerName: b.consumerName,
                      consumerId: b.consumerId,
                      meterNumber: b.meterNumber || 'MTR-AUTO',
                      billingPeriod: b.billingPeriod,
                      previousReading: b.previousReading ?? (b.unitsConsumed - 50),
                      currentReading: b.currentReading ?? b.unitsConsumed,
                      unitsConsumed: b.unitsConsumed,
                    }));
                    exportConsumptionReport(consumptionData, 'meter-consumption.csv');
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <FileSpreadsheet size={13} className="text-emerald-600" />
                  Consumption Records (CSV)
                </button>
                <button
                  onClick={() => {
                    const monthlyCsv = monthlyStats.map(m => ({
                      'Month': m.month,
                      'Consumption (kWh)': m.consumption,
                      'Revenue Billed (₹)': m.revenue,
                      'Payments Received (₹)': m.paymentReceived,
                      'Bills Generated': m.billsGenerated,
                    }));
                    exportToCSV(monthlyCsv, 'monthly-financial-summary.csv');
                    setExportDropdownOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                >
                  <Calendar size={13} className="text-emerald-600" />
                  Monthly Financial Summary (CSV)
                </button>
              </div>
            )}
          </div>
        }
      />

      {/* Tab Nav */}
      <div className="flex items-center gap-2 mb-5 bg-white border border-gray-200 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-black text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            id={`report-tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Charts */}
      {activeTab === 'consumption' && (
        <div className="space-y-4">
          <ChartCard title="Monthly Consumption (kWh)" subtitle="Jan – Oct 2026">
            <ConsumptionChart data={monthlyStats} height={260} />
          </ChartCard>
          <div className="bento-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Consumption by Month</h3>
              <span className="text-xs text-gray-500">Total Billed: {bills.reduce((sum, b) => sum + b.unitsConsumed, 0)} kWh</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyStats} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v: number) => [`${v.toLocaleString('en-IN')} kWh`, 'Consumption']}
                  contentStyle={{ borderRadius: '8px', border: `1px solid ${CHART_COLORS.tooltipBorder}` }}
                />
                <Bar dataKey="consumption" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="space-y-4">
          <ChartCard title="Monthly Revenue (₹)" subtitle="Jan – Oct 2026">
            <RevenueChart data={monthlyStats} height={260} />
          </ChartCard>
          <div className="bento-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="section-title">Revenue vs Payments Received</h3>
              <span className="text-xs text-emerald-600 font-semibold">Total Revenue: {formatCurrency(bills.reduce((sum, b) => sum + b.totalAmount, 0))}</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyStats} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 100000).toFixed(1)}L`} />
                <Tooltip
                  formatter={(v: number, name: string) => [formatCurrency(v), name === 'revenue' ? 'Revenue' : 'Collected']}
                  contentStyle={{ borderRadius: '8px', border: `1px solid ${CHART_COLORS.tooltipBorder}` }}
                />
                <Bar dataKey="revenue" fill={CHART_COLORS.secondary} radius={[4, 4, 0, 0]} maxBarSize={30} name="revenue" />
                <Bar dataKey="paymentReceived" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={30} name="paymentReceived" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'payments' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bento-card">
            <h3 className="section-title mb-4">Bill Status Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  paddingAngle={3}
                >
                  {paymentStatusData.map((entry, i) => (
                    <Cell key={`cell-${i}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  formatter={(value) => <span className="text-xs text-gray-600">{value}</span>}
                />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bento-card">
            <h3 className="section-title mb-4">Recent Payments</h3>
            <div className="space-y-3">
              {payments.slice(0, 5).map(p => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{p.consumerName}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{p.paymentId} · {p.paymentMethod}</p>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{formatCurrency(p.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'consumers' && (
        <div className="bento-card">
          <h3 className="section-title mb-4">Top Consumers by Consumption</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={topConsumers} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.gridLine} vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: CHART_COLORS.tertiary }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number, name: string) => [
                  name === 'units' ? `${v} kWh` : formatCurrency(v),
                  name === 'units' ? 'Units' : 'Billed',
                ]}
                contentStyle={{ borderRadius: '8px', border: `1px solid ${CHART_COLORS.tooltipBorder}` }}
              />
              <Bar dataKey="units" fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} maxBarSize={36} name="units" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </AppShell>
  );
};
