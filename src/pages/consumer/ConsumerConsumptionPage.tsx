import React, { useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { Zap, TrendingDown, ArrowUpRight, Gauge, Info } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { ChartCard } from '../../components/charts/Charts';
import { useAppState } from '../../hooks/useAppState';

const dailyUsageSample = [
  { day: 'Mon', units: 7.2 },
  { day: 'Tue', units: 6.8 },
  { day: 'Wed', units: 8.4 },
  { day: 'Thu', units: 7.9 },
  { day: 'Fri', units: 9.1 },
  { day: 'Sat', units: 11.2 },
  { day: 'Sun', units: 10.5 },
];

export const ConsumerConsumptionPage: React.FC = () => {
  const { consumptionRecords } = useAppState();
  const [timeRange, setTimeRange] = useState<'6M' | '1Y'>('6M');

  const history = timeRange === '6M'
    ? consumptionRecords.slice(-6)
    : consumptionRecords;

  return (
    <AppShell>
      <PageHeader
        title="Consumption Analytics"
        subtitle="Track power consumption trends, peak usage hours, and energy savings."
        breadcrumb={['Consumer', 'Consumption']}
      />

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
        <div className="bento-card">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Current Month</span>
            <Zap size={15} className="text-accent" />
          </div>
          <p className="text-2xl font-bold text-gray-900">210 kWh</p>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-2 font-medium">
            <TrendingDown size={13} />
            <span>8.7% lower than last month</span>
          </div>
        </div>

        <div className="bento-card">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Avg Daily Usage</span>
            <Gauge size={15} className="text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-gray-900">8.7 kWh</p>
          <p className="text-xs text-gray-500 mt-2">Peak hour: 7:00 PM – 10:00 PM</p>
        </div>

        <div className="bento-card">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Meter</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          </div>
          <p className="text-2xl font-bold font-mono text-gray-900">MTR-BLR-00124</p>
          <p className="text-xs text-gray-500 mt-2">Smart Digital · Single Phase</p>
        </div>

        <div className="bento-card">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Projected Units</span>
            <ArrowUpRight size={15} className="text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">225 kWh</p>
          <p className="text-xs text-gray-500 mt-2">Estimated bill: ~₹1,420</p>
        </div>
      </div>

      {/* Main Charts Bento */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
        {/* Monthly Trend */}
        <div className="lg:col-span-2">
          <ChartCard
            title="Monthly Consumption Trend"
            subtitle="Units consumed (kWh) over billing cycles"
            actions={
              <div className="flex bg-gray-100 p-0.5 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setTimeRange('6M')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    timeRange === '6M' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  6 Months
                </button>
                <button
                  onClick={() => setTimeRange('1Y')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    timeRange === '1Y' ? 'bg-white shadow-sm font-semibold text-gray-900' : 'text-gray-600'
                  }`}
                >
                  Full Year
                </button>
              </div>
            }
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={history} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="month" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                    formatter={(value: any) => [`${value} kWh`, 'Units']}
                  />
                  <Bar dataKey="units" fill="#111827" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Weekly Day-by-Day */}
        <div>
          <ChartCard
            title="This Week's Daily Usage"
            subtitle="Average daily pattern (kWh)"
          >
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyUsageSample} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="day" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }}
                    formatter={(val: any) => [`${val} kWh`, 'Units']}
                  />
                  <Line type="monotone" dataKey="units" stroke="#10b981" strokeWidth={2.5} dot={{ r: 3, fill: '#10b981' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Energy Efficiency Tips */}
      <div className="bento-card border border-emerald-100 bg-emerald-50/40">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg">
            <Info size={18} />
          </div>
          <div>
            <h4 className="text-sm font-bold text-gray-900">Energy Efficiency Insights</h4>
            <p className="text-xs text-gray-600 mt-1 leading-relaxed">
              Your highest consumption occurs on weekends between 7:00 PM and 10:00 PM. Shifting high-load appliances
              like washing machines or heavy pumps to off-peak afternoon hours (1:00 PM – 4:00 PM) can help stabilize grid demand
              and lower your effective tier charges.
            </p>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
