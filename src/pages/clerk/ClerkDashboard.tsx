import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gauge, Receipt, CreditCard, Search, Plus, FileText, CheckCircle, Activity } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { StatCard } from '../../components/ui/StatCard';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency } from '../../lib/utils';

export const ClerkDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { bills, payments } = useAppState();

  const recentBills = bills.slice(0, 4);
  const todaysTotal = payments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const QUICK_ACTIONS = [
    { label: 'Enter Meter Reading', icon: <Gauge size={20} />, color: 'bg-accent-muted text-accent', id: 'qa-meter-reading', path: '/clerk/meters' },
    { label: 'Generate Bill', icon: <Receipt size={20} />, color: 'bg-blue-50 text-blue-500', id: 'qa-generate-bill', path: '/clerk/bills' },
    { label: 'Record Payment', icon: <CreditCard size={20} />, color: 'bg-gray-100 text-gray-600', id: 'qa-record-payment', path: '/clerk/payments' },
    { label: 'Search Consumer', icon: <Search size={20} />, color: 'bg-gray-100 text-gray-600', id: 'qa-search-consumer', path: '/clerk/consumers' },
  ];

  const RECENT_ACTIVITIES = [
    { icon: <Receipt size={14} />, text: 'Bill generated for Mohan Das', time: '2 hours ago', type: 'bill' },
    { icon: <CreditCard size={14} />, text: 'Payment ₹1,359 recorded for Priya Sharma', time: '4 hours ago', type: 'payment' },
    { icon: <Gauge size={14} />, text: 'Meter reading entered for MTR-BLR-00124 (Rahul Kumar)', time: '5 hours ago', type: 'meter' },
    { icon: <FileText size={14} />, text: 'Bill generated for Sunita Reddy', time: 'Yesterday', type: 'bill' },
    { icon: <CheckCircle size={14} />, text: 'Payment ₹11,205 recorded for Arjun Menon', time: 'Yesterday', type: 'payment' },
  ];

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Hello, Billing Clerk 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage meter readings, bills and payments efficiently.
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard
          title="Meter Readings"
          value="124"
          change={8.5}
          changeLabel="this month"
          icon={<Gauge size={18} className="text-accent" />}
          iconBg="bg-accent-muted"
        />
        <StatCard
          title="Bills Generated"
          value={String(bills.length)}
          change={12.1}
          changeLabel="total records"
          icon={<Receipt size={18} className="text-blue-500" />}
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Payments Collected"
          value={formatCurrency(todaysTotal || 45280)}
          change={5.4}
          changeLabel="total demo pool"
          icon={<CreditCard size={18} className="text-gray-600" />}
          iconBg="bg-gray-100"
          className="col-span-2 md:col-span-1"
        />
      </div>

      {/* Quick Actions */}
      <div className="bento-card mb-6">
        <h3 className="section-title mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {QUICK_ACTIONS.map(action => (
            <button
              type="button"
              key={action.id}
              id={action.id}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-accent hover:shadow-card-hover transition-all duration-150 group text-center"
            >
              <div className={`${action.color} p-3 rounded-xl transition-transform group-hover:scale-110 duration-150`}>
                {action.icon}
              </div>
              <span className="text-xs font-semibold text-gray-700 group-hover:text-accent transition-colors">
                {action.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent bills + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent bills */}
        <div className="bento-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="section-title">Recent Bills</h3>
            <Button variant="primary" size="sm" onClick={() => navigate('/clerk/bills')}>
              <Plus size={13} />Generate New
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="table" aria-label="Recent bills">
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Consumer</th>
                  <th>Period</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentBills.map(b => (
                  <tr key={b.id}>
                    <td><span className="font-mono text-xs text-gray-500">{b.billId}</span></td>
                    <td className="text-sm font-medium text-gray-800">{b.consumerName}</td>
                    <td className="text-sm text-gray-500">{b.billingPeriod}</td>
                    <td><span className="font-semibold text-gray-900">{formatCurrency(b.totalAmount)}</span></td>
                    <td><StatusBadge status={b.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bento-card">
          <h3 className="section-title mb-4">Recent Activity</h3>
          <div className="space-y-4">
            {RECENT_ACTIVITIES.map((a, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 p-1.5 rounded-md shrink-0 ${
                  a.type === 'bill' ? 'bg-blue-50 text-blue-500' :
                  a.type === 'payment' ? 'bg-accent-muted text-accent' :
                  'bg-gray-100 text-gray-500'
                }`}>
                  {a.icon}
                </div>
                <div>
                  <p className="text-xs text-gray-700 leading-relaxed">{a.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
              <Activity size={15} className="text-accent shrink-0" />
              <div>
                <p className="text-xs font-semibold text-gray-700">Today's Progress</p>
                <p className="text-xs text-gray-400">18 / 24 tasks completed</p>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-gray-100 rounded-full">
              <div className="h-full bg-accent rounded-full" style={{ width: '75%' }} />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
