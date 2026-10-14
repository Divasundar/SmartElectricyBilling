import React, { useState } from 'react';
import { Plus, Download, Printer } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { GenerateBillModal } from '../../components/billing/GenerateBillModal';
import { BillBreakdownModal } from '../../components/billing/BillBreakdownModal';
import { BillPrintModal } from '../../components/billing/BillPrintModal';
import { exportBillingReport } from '../../lib/csvExport';
import { useAppState } from '../../hooks/useAppState';
import { formatCurrency, formatDate } from '../../lib/utils';
import type { Bill } from '../../types';

const ITEMS_PER_PAGE = 6;

export const BillsPage: React.FC = () => {
  const { bills } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [generateOpen, setGenerateOpen] = useState(false);
  const [viewBill, setViewBill] = useState<Bill | null>(null);
  const [printBill, setPrintBill] = useState<Bill | null>(null);

  const filtered = bills.filter(b => {
    const matchSearch =
      b.consumerName.toLowerCase().includes(search.toLowerCase()) ||
      b.billId.toLowerCase().includes(search.toLowerCase()) ||
      (b.billNumber && b.billNumber.toLowerCase().includes(search.toLowerCase())) ||
      b.billingPeriod.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || b.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts = {
    total: bills.length,
    paid: bills.filter(b => b.status === 'PAID').length,
    unpaid: bills.filter(b => b.status === 'UNPAID').length,
    overdue: bills.filter(b => b.status === 'OVERDUE').length,
  };

  return (
    <AppShell>
      <PageHeader
        title="Bills"
        subtitle="View and manage electricity bills for all consumers."
        breadcrumb={['Admin', 'Bills']}
        actions={
          <>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => exportBillingReport(filtered, 'electricity-bills.csv')}
              id="export-bills-btn"
            >
              <Download size={14} />Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              id="generate-bill-btn"
              onClick={() => setGenerateOpen(true)}
            >
              <Plus size={14} />Generate Bill
            </Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Bills', value: counts.total, color: 'text-gray-900' },
          { label: 'Paid', value: counts.paid, color: 'text-green-600' },
          { label: 'Unpaid', value: counts.unpaid, color: 'text-amber-600' },
          { label: 'Overdue', value: counts.overdue, color: 'text-red-500' },
        ].map(s => (
          <div key={s.label} className="bento-card text-center py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bento-card mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <SearchBar
            value={search}
            onChange={v => { setSearch(v); setPage(1); }}
            placeholder="Search by bill ID, consumer, period..."
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="input text-sm w-36"
            aria-label="Filter by status"
          >
            <option value="ALL">All Status</option>
            <option value="PAID">Paid</option>
            <option value="UNPAID">Unpaid</option>
            <option value="OVERDUE">Overdue</option>
            <option value="PARTIALLY_PAID">Partial</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Bills table">
            <thead>
              <tr>
                <th>Bill ID</th>
                <th>Consumer</th>
                <th>Billing Period</th>
                <th>Units (kWh)</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan={8}><EmptyState title="No bills found" description="No billing records match your criteria." /></td></tr>
              ) : (
                paginated.map(b => (
                  <tr key={b.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-gray-800">
                        {b.billNumber || b.billId}
                      </span>
                    </td>
                    <td>
                      <p className="text-sm font-medium text-gray-800">{b.consumerName}</p>
                      <p className="text-xs text-gray-400 font-mono">{b.meterNumber || b.meterId}</p>
                    </td>
                    <td className="text-sm text-gray-600">{b.billingPeriod}</td>
                    <td>
                      <span className="font-semibold text-gray-800">{b.unitsConsumed}</span>
                      <span className="text-xs text-gray-400 ml-1">kWh</span>
                    </td>
                    <td>
                      <span className="font-bold text-gray-900">{formatCurrency(b.totalAmount)}</span>
                    </td>
                    <td className="text-sm text-gray-500">{formatDate(b.dueDate)}</td>
                    <td><StatusBadge status={b.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewBill(b)}
                          className="text-xs text-accent hover:underline font-medium px-2 py-1 rounded hover:bg-accent-muted"
                        >
                          View Breakdown
                        </button>
                        <button
                          onClick={() => setPrintBill(b)}
                          className="text-xs text-gray-600 hover:text-gray-900 font-medium px-2 py-1 rounded hover:bg-gray-100 flex items-center gap-1"
                          title="Print / Save PDF"
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
          <Pagination
            currentPage={page} totalPages={totalPages}
            onPageChange={setPage} totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>

      {/* Generate Bill Modal */}
      <GenerateBillModal
        isOpen={generateOpen}
        onClose={() => setGenerateOpen(false)}
        onSuccess={(newBill) => {
          setViewBill(newBill);
        }}
      />

      {/* View Bill Breakdown Modal */}
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
