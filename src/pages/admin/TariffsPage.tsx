import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppShell } from '../../components/layout/AppShell';
import { PageHeader } from '../../components/ui/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
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

export const TariffsPage: React.FC = () => {
  const { tariffs, addTariff, updateTariff } = useAppState();
  const [addOpen, setAddOpen] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Add Tariff Form State
  const [name, setName] = useState('');
  const [connectionType, setConnectionType] = useState<ConnectionType>('RESIDENTIAL');
  const [slabFrom, setSlabFrom] = useState('0');
  const [slabTo, setSlabTo] = useState('100');
  const [ratePerUnit, setRatePerUnit] = useState('4.50');
  const [fixedCharge, setFixedCharge] = useState('25');

  const filtered = typeFilter === 'ALL'
    ? tariffs
    : tariffs.filter(t => t.connectionType === typeFilter);

  const handleSaveTariff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addTariff({
      name: name.trim(),
      connectionType,
      slabFrom: Number(slabFrom) || 0,
      slabTo: Number(slabTo) || 0,
      ratePerUnit: parseFloat(ratePerUnit) || 5.0,
      fixedCharge: Number(fixedCharge) || 25,
      effectiveFrom: new Date().toISOString().split('T')[0],
      status: 'ACTIVE',
    });

    setName('');
    setSlabFrom('0');
    setSlabTo('100');
    setRatePerUnit('4.50');
    setFixedCharge('25');
    setAddOpen(false);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    updateTariff(id, {
      status: currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    });
  };

  return (
    <AppShell>
      <PageHeader
        title="Tariff Slabs"
        subtitle="Manage electricity tariff slabs and rates by connection type."
        breadcrumb={['Admin', 'Tariffs']}
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)} id="add-tariff-btn">
            <Plus size={14} />Add Tariff Slab
          </Button>
        }
      />

      {/* Info Banner */}
      <div className="bg-accent-muted border border-accent/20 rounded-lg px-4 py-3 mb-5 flex items-start gap-3">
        <span className="text-accent mt-0.5">ℹ</span>
        <div>
          <p className="text-sm font-medium text-gray-800">Tariff slab calculation is applied automatically during bill generation.</p>
          <p className="text-xs text-gray-500 mt-0.5">Units consumed are matched against slabs in order. Rates are in ₹/kWh. A slab-to of 0 means unlimited.</p>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 mb-4">
        {['ALL', 'RESIDENTIAL', 'COMMERCIAL', 'INDUSTRIAL', 'AGRICULTURAL'].map(t => (
          <button
            key={t}
            onClick={() => setTypeFilter(t)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              typeFilter === t
                ? 'bg-black text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {t === 'ALL' ? 'All Slabs' : (CONNECTION_LABELS[t] ?? t)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bento-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table" aria-label="Tariffs table">
            <thead>
              <tr>
                <th>Slab Name</th>
                <th>Category</th>
                <th>Units Range</th>
                <th>Rate (₹/kWh)</th>
                <th>Fixed Charge</th>
                <th>Effective From</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(slab => (
                <tr key={slab.id}>
                  <td>
                    <span className="font-semibold text-gray-900 text-sm">{slab.name}</span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-600 font-medium">
                      {CONNECTION_LABELS[slab.connectionType] ?? slab.connectionType}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono text-xs text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                      {slab.slabFrom} — {slab.slabTo === 0 ? 'Above / ∞' : `${slab.slabTo} units`}
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-gray-900 text-sm">₹{slab.ratePerUnit.toFixed(2)}</span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-600 font-medium">₹{slab.fixedCharge}/mo</span>
                  </td>
                  <td>
                    <span className="text-xs text-gray-400">{formatDate(slab.effectiveFrom)}</span>
                  </td>
                  <td><StatusBadge status={slab.status} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleToggleStatus(slab.id, slab.status)}
                        className={`text-xs font-medium px-2 py-1 rounded transition-colors ${
                          slab.status === 'ACTIVE'
                            ? 'text-red-500 hover:underline hover:bg-red-50'
                            : 'text-green-600 hover:underline hover:bg-green-50'
                        }`}
                      >
                        {slab.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Tariff Modal */}
      <Modal
        isOpen={addOpen}
        onClose={() => setAddOpen(false)}
        title="Add Tariff Slab"
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveTariff}>Save Slab</Button>
          </>
        }
      >
        <form onSubmit={handleSaveTariff} className="space-y-4">
          <Input
            label="Tariff Name"
            placeholder="e.g. Residential - Slab 1"
            id="tariff-name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <Select
            label="Connection Type"
            id="tariff-connection-type"
            value={connectionType}
            onChange={e => setConnectionType(e.target.value as ConnectionType)}
            options={[
              { value: 'RESIDENTIAL', label: 'Residential' },
              { value: 'COMMERCIAL', label: 'Commercial' },
              { value: 'INDUSTRIAL', label: 'Industrial' },
              { value: 'AGRICULTURAL', label: 'Agricultural' },
            ]}
            placeholder="Select type"
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Slab From (units)"
              type="number"
              placeholder="0"
              id="tariff-slab-from"
              value={slabFrom}
              onChange={e => setSlabFrom(e.target.value)}
            />
            <Input
              label="Slab To (units, 0=∞)"
              type="number"
              placeholder="100"
              id="tariff-slab-to"
              value={slabTo}
              onChange={e => setSlabTo(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Rate per Unit (₹/kWh)"
              type="number"
              step="0.01"
              placeholder="3.15"
              id="tariff-rate"
              value={ratePerUnit}
              onChange={e => setRatePerUnit(e.target.value)}
            />
            <Input
              label="Fixed Charge (₹/month)"
              type="number"
              placeholder="25"
              id="tariff-fixed"
              value={fixedCharge}
              onChange={e => setFixedCharge(e.target.value)}
            />
          </div>
        </form>
      </Modal>
    </AppShell>
  );
};
