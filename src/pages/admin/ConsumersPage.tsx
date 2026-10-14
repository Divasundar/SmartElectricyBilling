import React, { useState } from 'react';
import { Plus, Filter, Download } from 'lucide-react';
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
import type { ConnectionType } from '../../types';

const CONNECTION_LABELS: Record<string, string> = {
  RESIDENTIAL: 'Residential',
  COMMERCIAL: 'Commercial',
  INDUSTRIAL: 'Industrial',
  AGRICULTURAL: 'Agricultural',
};

const ITEMS_PER_PAGE = 6;

export const ConsumersPage: React.FC = () => {
  const { consumers, addConsumer } = useAppState();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [addOpen, setAddOpen] = useState(false);

  // New Consumer Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newLoad, setNewLoad] = useState('5');
  const [newType, setNewType] = useState<ConnectionType>('RESIDENTIAL');
  const [newMeter, setNewMeter] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const filtered = consumers.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.consumerId.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.meterNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    const matchType = typeFilter === 'ALL' || c.connectionType === typeFilter;
    return matchSearch && matchStatus && matchType;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleSearch = (val: string) => { setSearch(val); setPage(1); };

  const handleSaveConsumer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    const consumerId = `CONS-2026-${String(consumers.length + 1).padStart(3, '0')}`;
    addConsumer({
      consumerId,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      phone: newPhone.trim() || '+91 99000 00000',
      address: newAddress.trim() || 'Bangalore, Karnataka',
      meterNumber: newMeter.trim() || `MTR-BLR-${String(consumers.length + 1).padStart(5, '0')}`,
      connectionType: newType,
      status: 'ACTIVE',
      sanctionedLoad: Number(newLoad) || 5,
    });

    // Reset & close
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setNewLoad('5');
    setNewType('RESIDENTIAL');
    setNewMeter('');
    setNewAddress('');
    setAddOpen(false);
  };

  return (
    <AppShell>
      <PageHeader
        title="Consumers"
        subtitle="Manage electricity consumer accounts and connections."
        breadcrumb={['Admin', 'Consumers']}
        actions={
          <>
            <Button variant="secondary" size="sm">
              <Download size={14} />
              Export
            </Button>
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)} id="add-consumer-btn">
              <Plus size={14} />
              Add Consumer
            </Button>
          </>
        }
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total', value: consumers.length, color: 'text-gray-900' },
          { label: 'Active', value: consumers.filter(c => c.status === 'ACTIVE').length, color: 'text-green-600' },
          { label: 'Inactive', value: consumers.filter(c => c.status === 'INACTIVE').length, color: 'text-gray-500' },
          { label: 'Suspended', value: consumers.filter(c => c.status === 'SUSPENDED').length, color: 'text-red-500' },
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
            onChange={handleSearch}
            placeholder="Search by name, ID, phone, meter..."
            className="flex-1"
          />
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="input text-sm w-36"
              aria-label="Filter by status"
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="input text-sm w-40"
              aria-label="Filter by connection type"
            >
              <option value="ALL">All Types</option>
              <option value="RESIDENTIAL">Residential</option>
              <option value="COMMERCIAL">Commercial</option>
              <option value="INDUSTRIAL">Industrial</option>
              <option value="AGRICULTURAL">Agricultural</option>
            </select>
            <Button variant="secondary" size="sm">
              <Filter size={14} />
              Filter
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Consumers table">
            <thead>
              <tr>
                <th>Consumer</th>
                <th>Consumer ID</th>
                <th>Connection</th>
                <th>Meter No.</th>
                <th>Sanctioned Load</th>
                <th>Status</th>
                <th>Registered</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <EmptyState
                      title="No consumers found"
                      description="Try adjusting your search or filters to find what you're looking for."
                    />
                  </td>
                </tr>
              ) : (
                paginated.map(consumer => (
                  <tr key={consumer.id}>
                    <td>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm leading-tight">{consumer.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{consumer.email}</p>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs font-medium text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                        {consumer.consumerId}
                      </span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-600 font-medium">
                        {CONNECTION_LABELS[consumer.connectionType] ?? consumer.connectionType}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-gray-600">{consumer.meterNumber}</span>
                    </td>
                    <td>
                      <span className="text-xs text-gray-700 font-medium">{consumer.sanctionedLoad} kW</span>
                    </td>
                    <td>
                      <StatusBadge status={consumer.status} />
                    </td>
                    <td>
                      <span className="text-xs text-gray-400">{formatDate(consumer.registeredAt)}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            itemsPerPage={ITEMS_PER_PAGE}
          />
        )}
      </div>

      {/* Add Consumer Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add New Consumer"
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveConsumer}>Save Consumer</Button>
          </>
        }
      >
        <form onSubmit={handleSaveConsumer} className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rahul Kumar"
            id="consumer-name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            required
          />
          <Input
            label="Phone"
            placeholder="+91 XXXXX XXXXX"
            id="consumer-phone"
            value={newPhone}
            onChange={e => setNewPhone(e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            placeholder="consumer@email.com"
            id="consumer-email"
            value={newEmail}
            onChange={e => setNewEmail(e.target.value)}
          />
          <Input
            label="Sanctioned Load (kW)"
            type="number"
            placeholder="5"
            id="consumer-load"
            value={newLoad}
            onChange={e => setNewLoad(e.target.value)}
          />
          <Select
            label="Connection Type"
            id="consumer-connection-type"
            value={newType}
            onChange={e => setNewType(e.target.value as ConnectionType)}
            options={[
              { value: 'RESIDENTIAL', label: 'Residential' },
              { value: 'COMMERCIAL', label: 'Commercial' },
              { value: 'INDUSTRIAL', label: 'Industrial' },
              { value: 'AGRICULTURAL', label: 'Agricultural' },
            ]}
            placeholder="Select type"
          />
          <Input
            label="Meter Number"
            placeholder="MTR-BLR-XXXXX"
            id="consumer-meter"
            value={newMeter}
            onChange={e => setNewMeter(e.target.value)}
          />
          <div className="col-span-2">
            <label className="input-label" htmlFor="consumer-address">Address</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Full address with PIN code"
              id="consumer-address"
              value={newAddress}
              onChange={e => setNewAddress(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
};
