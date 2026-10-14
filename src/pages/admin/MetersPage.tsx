import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { SearchBar } from '../../components/ui/SearchBar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Pagination } from '../../components/ui/Pagination';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import { useAppState } from '../../hooks/useAppState';
import { formatDate } from '../../lib/utils';
import type { MeterType, Meter } from '../../types';

const METER_TYPE_LABELS: Record<string, string> = {
  SINGLE_PHASE: 'Single Phase',
  THREE_PHASE: 'Three Phase',
  SMART: 'Smart',
  PREPAID: 'Prepaid',
};

const ITEMS_PER_PAGE = 6;

export const MetersPage: React.FC = () => {
  const { meters, consumers, addMeter, recordMeterReading } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  // Add Meter Form
  const [meterId, setMeterId] = useState('');
  const [consumerId, setConsumerId] = useState('');
  const [meterType, setMeterType] = useState<MeterType>('SMART');
  const [location, setLocation] = useState('');

  // Record Reading Modal
  const [readingModalOpen, setReadingModalOpen] = useState(false);
  const [selectedMeter, setSelectedMeter] = useState<Meter | null>(null);
  const [newReadingVal, setNewReadingVal] = useState('');

  const filtered = meters.filter(m => {
    const matchSearch =
      (m.meterId || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.consumerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (m.location || '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || m.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const counts = {
    total: meters.length,
    active: meters.filter(m => m.status === 'ACTIVE').length,
    inactive: meters.filter(m => m.status === 'INACTIVE').length,
    faulty: meters.filter(m => m.status === 'FAULTY').length,
  };

  const handleSaveMeter = (e: React.FormEvent) => {
    e.preventDefault();
    const finalMeterId = meterId.trim() || `MTR-BLR-${String(meters.length + 1).padStart(5, '0')}`;
    const matchedConsumer = consumers.find(
      c => c.consumerId === consumerId.trim() || c.id === consumerId.trim()
    );

    addMeter({
      meterId: finalMeterId,
      consumerId: matchedConsumer?.id || 'CON-001',
      consumerName: matchedConsumer?.name || 'Assigned Consumer',
      meterType,
      currentReading: 1000,
      previousReading: 1000,
      lastReadingDate: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
      location: location.trim() || 'Bangalore Substation Area',
    });

    setMeterId('');
    setConsumerId('');
    setLocation('');
    setAddOpen(false);
  };

  const handleOpenReading = (meter: Meter) => {
    setSelectedMeter(meter);
    setNewReadingVal(String(meter.currentReading + 50));
    setReadingModalOpen(true);
  };

  const handleSaveReading = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMeter && newReadingVal) {
      recordMeterReading(selectedMeter.id, Number(newReadingVal));
      setReadingModalOpen(false);
      setSelectedMeter(null);
    }
  };

  return (
    <AppShell>
      <PageHeader
        title="Meters"
        subtitle="Manage electricity meters and reading records."
        breadcrumb={['Admin', 'Meters']}
        actions={
          <>
            <Button variant="secondary" size="sm"><Download size={14} />Export</Button>
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)} id="add-meter-btn">
              <Plus size={14} />Add Meter
            </Button>
          </>
        }
      />

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Meters', value: counts.total, color: 'text-gray-900' },
          { label: 'Active', value: counts.active, color: 'text-green-600' },
          { label: 'Inactive', value: counts.inactive, color: 'text-gray-500' },
          { label: 'Faulty', value: counts.faulty, color: 'text-amber-600' },
        ].map(s => (
          <div key={s.label} className="bento-card text-center py-3">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="bento-card mb-5">
        <div className="flex gap-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by meter ID, consumer, location..." className="flex-1" />
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="input text-sm w-36"
            aria-label="Filter by meter status"
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
            <option value="FAULTY">Faulty</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Meters table">
            <thead>
              <tr>
                <th>Meter ID</th>
                <th>Consumer</th>
                <th>Type</th>
                <th>Current Reading</th>
                <th>Last Reading Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState title="No meters found" description="Try adjusting your search criteria." />
                  </td>
                </tr>
              ) : (
                paginated.map(m => (
                  <tr key={m.id}>
                    <td>
                      <span className="font-mono text-xs font-semibold text-gray-900">{m.meterId}</span>
                    </td>
                    <td>
                      <div>
                        <p className="text-sm font-semibold text-gray-800 leading-tight">{m.consumerName}</p>
                        <p className="text-xs text-gray-400 mt-0.5 font-mono">{m.consumerId}</p>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-gray-600 font-medium">
                        {METER_TYPE_LABELS[m.meterType] ?? m.meterType}
                      </span>
                    </td>
                    <td>
                      <div>
                        <span className="font-mono text-sm font-bold text-gray-900">{m.currentReading.toLocaleString()}</span>
                        <span className="text-xs text-gray-400 ml-1">kWh</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-xs text-gray-400">
                        {m.lastReadingDate ? formatDate(m.lastReadingDate) : '—'}
                      </span>
                    </td>
                    <td><StatusBadge status={m.status} /></td>
                    <td>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleOpenReading(m)}
                          className="text-xs text-accent hover:underline font-medium px-2 py-1 rounded hover:bg-accent-muted transition-colors"
                        >
                          Update Reading
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

      {/* Add Meter Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add New Meter" size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveMeter}>Save Meter</Button>
          </>
        }
      >
        <form onSubmit={handleSaveMeter} className="space-y-4">
          <Input
            label="Meter ID"
            placeholder="MTR-BLR-XXXXX"
            id="meter-id"
            value={meterId}
            onChange={e => setMeterId(e.target.value)}
          />
          <Input
            label="Consumer ID or Name"
            placeholder="C10234 or Rahul Kumar"
            id="meter-consumer-id"
            value={consumerId}
            onChange={e => setConsumerId(e.target.value)}
          />
          <Select
            label="Meter Type"
            id="meter-type"
            value={meterType}
            onChange={e => setMeterType(e.target.value as MeterType)}
            options={[
              { value: 'SINGLE_PHASE', label: 'Single Phase' },
              { value: 'THREE_PHASE', label: 'Three Phase' },
              { value: 'SMART', label: 'Smart Meter' },
              { value: 'PREPAID', label: 'Prepaid' },
            ]}
            placeholder="Select type"
          />
          <Input
            label="Location / Address"
            placeholder="Full address"
            id="meter-location"
            value={location}
            onChange={e => setLocation(e.target.value)}
          />
        </form>
      </Modal>

      {/* Record Reading Modal */}
      <Modal
        isOpen={readingModalOpen}
        onClose={() => setReadingModalOpen(false)}
        title={`Record Meter Reading — ${selectedMeter?.meterId || ''}`}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReadingModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveReading}>Record Reading</Button>
          </>
        }
      >
        <form onSubmit={handleSaveReading} className="space-y-3">
          <p className="text-xs text-gray-500">
            Consumer: <strong className="text-gray-800">{selectedMeter?.consumerName}</strong>
          </p>
          <p className="text-xs text-gray-500">
            Previous Reading: <strong className="text-gray-800 font-mono">{selectedMeter?.currentReading} kWh</strong>
          </p>
          <Input
            label="New Current Reading (kWh)"
            type="number"
            id="new-meter-reading"
            value={newReadingVal}
            onChange={e => setNewReadingVal(e.target.value)}
            required
          />
        </form>
      </Modal>
    </AppShell>
  );
};
