import React, { useState, useEffect, useMemo } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { formatCurrency } from '../../lib/utils';
import { useAppState } from '../../hooks/useAppState';
import {
  calculateBill,
  checkDuplicateBill,
  getActiveTariffSlabs,
  BILLING_TAX_RATE,
} from '../../services/billingService';
import type { Bill } from '../../types';

interface GenerateBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newBill: Bill) => void;
}

export const GenerateBillModal: React.FC<GenerateBillModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { consumers, meters, tariffs, bills, generateBill } = useAppState();

  const [selectedConsumerId, setSelectedConsumerId] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<string>('October 2026');
  const [dueDate, setDueDate] = useState<string>('2026-11-15');
  const [previousReadingInput, setPreviousReadingInput] = useState<string>('0');
  const [currentReadingInput, setCurrentReadingInput] = useState<string>('0');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Initialize or update selection when modal opens
  useEffect(() => {
    if (isOpen && consumers.length > 0) {
      const initialConsumer = consumers[0];
      setSelectedConsumerId(initialConsumer.consumerId);
      const matchedMeter = meters.find(
        m => m.consumerId === initialConsumer.consumerId || m.consumerId === initialConsumer.id
      );
      const prev = matchedMeter ? matchedMeter.currentReading : 15000;
      setPreviousReadingInput(String(prev));
      setCurrentReadingInput(String(prev + 250));
      setFormError(null);
      setIsSuccess(false);
    }
  }, [isOpen, consumers, meters]);

  const selectedConsumer = useMemo(() => {
    return (
      consumers.find(
        c => c.consumerId === selectedConsumerId || c.id === selectedConsumerId
      ) || consumers[0]
    );
  }, [consumers, selectedConsumerId]);

  const matchedMeter = useMemo(() => {
    if (!selectedConsumer) return undefined;
    return meters.find(
      m =>
        m.consumerId === selectedConsumer.consumerId ||
        m.consumerId === selectedConsumer.id ||
        m.meterId === selectedConsumer.meterNumber
    );
  }, [meters, selectedConsumer]);

  // When consumer changes, adjust previous reading automatically
  const handleConsumerChange = (cId: string) => {
    setSelectedConsumerId(cId);
    setFormError(null);
    const cons = consumers.find(c => c.consumerId === cId || c.id === cId);
    if (cons) {
      const meter = meters.find(
        m => m.consumerId === cons.consumerId || m.consumerId === cons.id || m.meterId === cons.meterNumber
      );
      const prev = meter ? meter.currentReading : 15000;
      setPreviousReadingInput(String(prev));
      setCurrentReadingInput(String(prev + 250));
    }
  };

  const prevReading = Number(previousReadingInput) || 0;
  const currReading = Number(currentReadingInput) || 0;

  // Validation: Current reading >= previous reading
  const isReadingValid = currReading >= prevReading;
  const unitsConsumed = isReadingValid ? currReading - prevReading : 0;
  const readingError = !isReadingValid
    ? `Current reading (${currReading} kWh) cannot be less than previous reading (${prevReading} kWh).`
    : null;

  // Duplicate check (Part 16)
  const isDuplicate = useMemo(() => {
    if (!selectedConsumer || !billingPeriod.trim()) return false;
    return checkDuplicateBill(bills, selectedConsumer.consumerId, billingPeriod.trim());
  }, [bills, selectedConsumer, billingPeriod]);

  // Tariff slabs for category
  const activeTariffs = useMemo(() => {
    if (!selectedConsumer) return [];
    return getActiveTariffSlabs(tariffs, selectedConsumer.connectionType);
  }, [tariffs, selectedConsumer]);

  // Live progressive bill calculation preview (Part 20)
  const calculationPreview = useMemo(() => {
    if (!isReadingValid || activeTariffs.length === 0 || !selectedConsumer) return null;
    return calculateBill({
      previousReading: prevReading,
      currentReading: currReading,
      connectionType: selectedConsumer.connectionType,
      tariffs,
      taxRate: BILLING_TAX_RATE,
      surcharge: 0,
    });
  }, [isReadingValid, activeTariffs, selectedConsumer, prevReading, currReading, tariffs]);

  // Overall form validity
  const canGenerate =
    isReadingValid &&
    !isDuplicate &&
    activeTariffs.length > 0 &&
    billingPeriod.trim().length > 0;

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedConsumer) {
      setFormError('Please select a valid consumer.');
      return;
    }

    if (!isReadingValid) {
      setFormError(readingError);
      return;
    }

    if (isDuplicate) {
      setFormError(`Bill already exists for this consumer and billing period (${billingPeriod}).`);
      return;
    }

    if (activeTariffs.length === 0) {
      setFormError(`No active tariff is configured for ${selectedConsumer.connectionType} category.`);
      return;
    }

    try {
      const newBill = generateBill({
        consumerId: selectedConsumer.consumerId,
        consumerName: selectedConsumer.name,
        meterNumber: matchedMeter?.meterId || selectedConsumer.meterNumber,
        connectionType: selectedConsumer.connectionType,
        billingPeriod: billingPeriod.trim(),
        previousReading: prevReading,
        currentReading: currReading,
        dueDate,
      });

      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
        if (onSuccess) onSuccess(newBill);
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to generate bill.';
      setFormError(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generate Electricity Bill"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleGenerate}
            disabled={!canGenerate || isSuccess}
            id="confirm-generate-bill-btn"
          >
            {isSuccess ? 'Bill Generated ✓' : 'Generate Bill'}
          </Button>
        </div>
      }
    >
      {isSuccess ? (
        <div className="text-center py-8">
          <CheckCircle size={44} className="text-accent mx-auto mb-2 animate-bounce" />
          <h3 className="text-base font-bold text-gray-900">Bill Generated Successfully!</h3>
          <p className="text-xs text-gray-500 mt-1">
            Centralized billing records and dashboard metrics have been updated.
          </p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-4 text-xs">
          {/* Validation Alert Banner */}
          {(!isReadingValid || isDuplicate || activeTariffs.length === 0 || formError) && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-red-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Generation Blocked</p>
                <p className="text-[11px] mt-0.5">
                  {formError ||
                    readingError ||
                    (isDuplicate
                      ? `Bill already exists for this consumer and billing period (${billingPeriod}).`
                      : null) ||
                    (activeTariffs.length === 0
                      ? `No active tariff is configured for ${selectedConsumer?.connectionType} category.`
                      : null)}
                </p>
              </div>
            </div>
          )}

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Select Consumer"
              id="bill-gen-consumer"
              value={selectedConsumerId}
              onChange={e => handleConsumerChange(e.target.value)}
              options={consumers.map(c => ({
                value: c.consumerId,
                label: `${c.name} (${c.consumerId})`,
              }))}
            />

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                Meter & Category
              </label>
              <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 flex justify-between items-center">
                <span>{matchedMeter?.meterId || selectedConsumer?.meterNumber || 'MTR-001'}</span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-bold bg-gray-200 text-gray-800 rounded">
                  {selectedConsumer?.connectionType}
                </span>
              </div>
            </div>

            <Input
              label="Billing Period"
              placeholder="e.g. October 2026"
              id="bill-gen-period"
              value={billingPeriod}
              onChange={e => {
                setBillingPeriod(e.target.value);
                setFormError(null);
              }}
              required
            />

            <Input
              label="Payment Due Date"
              type="date"
              id="bill-gen-due-date"
              value={dueDate}
              onChange={e => setDueDate(e.target.value)}
              required
            />

            <Input
              label="Previous Reading (kWh)"
              type="number"
              id="bill-gen-prev-reading"
              value={previousReadingInput}
              onChange={e => setPreviousReadingInput(e.target.value)}
              required
            />

            <Input
              label="Current Reading (kWh)"
              type="number"
              id="bill-gen-curr-reading"
              value={currentReadingInput}
              onChange={e => setCurrentReadingInput(e.target.value)}
              required
            />
          </div>

          {/* Real-time Units Consumed Metric */}
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-[11px] text-gray-500 font-medium">Calculated Consumption</p>
              <p className="font-mono text-base font-bold text-gray-900">
                {isReadingValid ? `${unitsConsumed} kWh` : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[11px] text-gray-500">Tariff Slabs Applied</p>
              <p className="text-xs font-semibold text-gray-800">
                {activeTariffs.length} Active Slabs ({selectedConsumer?.connectionType})
              </p>
            </div>
          </div>

          {/* Live Bill Preview (Part 20) */}
          {calculationPreview && (
            <div className="border border-gray-200 rounded-lg overflow-hidden bg-white">
              <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Bill Calculation Preview
                </span>
                <span className="text-[11px] text-gray-500">
                  Tax Rate: 10% · Surcharge: ₹0
                </span>
              </div>

              {/* Slabs breakdown snippet */}
              <div className="divide-y divide-gray-100 text-xs">
                {calculationPreview.slabBreakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between px-3 py-1.5 text-gray-600">
                    <span>
                      {item.slabName} ({item.unitsInSlab} × {formatCurrency(item.ratePerUnit)})
                    </span>
                    <span className="font-mono text-gray-800 font-medium">{formatCurrency(item.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between px-3 py-1.5 bg-gray-50/50">
                  <span className="text-gray-600 font-medium">Total Energy Charges</span>
                  <span className="font-mono text-gray-900 font-semibold">
                    {formatCurrency(calculationPreview.energyCharges)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-gray-600">Fixed Demand Charge</span>
                  <span className="font-mono text-gray-900 font-medium">
                    {formatCurrency(calculationPreview.fixedCharge)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-1.5">
                  <span className="text-gray-600">Electricity Tax (10%)</span>
                  <span className="font-mono text-gray-900 font-medium">
                    {formatCurrency(calculationPreview.tax)}
                  </span>
                </div>
                <div className="flex justify-between px-3 py-2 bg-gray-50 font-bold text-gray-900 text-sm border-t border-gray-200">
                  <span>Grand Total Payable</span>
                  <span className="text-accent font-mono text-base">
                    {formatCurrency(calculationPreview.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </form>
      )}
    </Modal>
  );
};
