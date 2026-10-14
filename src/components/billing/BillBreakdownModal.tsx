import React, { useState } from 'react';
import { CreditCard, Printer } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import { BillPrintModal } from './BillPrintModal';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useAppState } from '../../hooks/useAppState';
import { getBillSlabBreakdown } from '../../services/billingService';
import type { Bill } from '../../types';

interface BillBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
  onPay?: (bill: Bill) => void;
  showPayButton?: boolean;
}

export const BillBreakdownModal: React.FC<BillBreakdownModalProps> = ({
  isOpen,
  onClose,
  bill,
  onPay,
  showPayButton = false,
}) => {
  const { tariffs } = useAppState();
  const [printOpen, setPrintOpen] = useState(false);

  if (!bill) return null;

  // Use stored slabBreakdown or calculate on the fly for legacy/mock bills
  const slabBreakdown = bill.slabBreakdown && bill.slabBreakdown.length > 0
    ? bill.slabBreakdown
    : getBillSlabBreakdown(bill, tariffs);

  const subtotal = (bill.energyCharges || 0) + (bill.fixedCharge || 0);

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={`Bill Breakdown — ${bill.billNumber || bill.billId}`}
        size="lg"
        footer={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">Status:</span>
              <StatusBadge status={bill.status} />
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setPrintOpen(true)}
                id="bill-breakdown-print-btn"
              >
                <Printer size={14} />
                Print Bill
              </Button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
              {showPayButton && bill.status !== 'PAID' && onPay && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onClose();
                    onPay(bill);
                  }}
                >
                  <CreditCard size={14} />
                  Pay Bill (Demo)
                </Button>
              )}
            </div>
          </div>
        }
      >
      <div className="space-y-4 text-sm">
        {/* Consumer & Meter Meta Bento Card */}
        <div className="bg-gray-50 rounded-lg p-3.5 border border-gray-200">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <p className="text-gray-500 font-medium">Consumer</p>
              <p className="font-semibold text-gray-900 mt-0.5">{bill.consumerName}</p>
              <p className="text-gray-400 font-mono">{bill.consumerId}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Meter & Category</p>
              <p className="font-mono font-medium text-gray-800 mt-0.5">{bill.meterNumber || bill.meterId || 'MTR-001'}</p>
              <span className="inline-block mt-0.5 px-1.5 py-0.5 text-[10px] font-semibold uppercase bg-gray-200 text-gray-700 rounded">
                {bill.connectionType || 'Residential'}
              </span>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Billing Period</p>
              <p className="font-semibold text-gray-900 mt-0.5">{bill.billingPeriod}</p>
              <p className="text-gray-400 text-[11px]">Due: {formatDate(bill.dueDate)}</p>
            </div>
            <div>
              <p className="text-gray-500 font-medium">Meter Readings</p>
              <p className="text-gray-700 mt-0.5">
                <span className="font-mono">{bill.previousReading}</span> → <span className="font-mono font-bold text-gray-900">{bill.currentReading}</span>
              </p>
              <p className="text-accent font-semibold font-mono text-xs">{bill.unitsConsumed} kWh</p>
            </div>
          </div>
        </div>

        {/* Slab-by-Slab Calculation Table (Part 22) */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Progressive Tariff Slab Calculation
            </h4>
            <span className="text-[11px] text-gray-400 font-medium">
              Category: {bill.connectionType || 'Residential'}
            </span>
          </div>
          
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs" aria-label="Tariff slab calculation breakdown">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2 px-3">Tariff Slab</th>
                  <th className="py-2 px-3 text-right">Units (kWh)</th>
                  <th className="py-2 px-3 text-right">Rate / Unit</th>
                  <th className="py-2 px-3 text-right">Charge Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {slabBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-3 px-3 text-center text-gray-400 italic">
                      Zero consumption — no energy charge applied
                    </td>
                  </tr>
                ) : (
                  slabBreakdown.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50">
                      <td className="py-2 px-3 font-medium text-gray-800">
                        {item.slabName}
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-700">
                        {item.unitsInSlab} kWh
                      </td>
                      <td className="py-2 px-3 text-right font-mono text-gray-700">
                        {formatCurrency(item.ratePerUnit)}
                      </td>
                      <td className="py-2 px-3 text-right font-mono font-semibold text-gray-900">
                        {formatCurrency(item.amount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-gray-50 font-semibold border-t border-gray-200 text-gray-800">
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-right">
                    Total Energy Charges:
                  </td>
                  <td className="py-2 px-3 text-right font-mono text-gray-900 font-bold">
                    {formatCurrency(bill.energyCharges)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Detailed Financial Summary Table (Part 21) */}
        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
          <div className="flex justify-between px-3.5 py-2.5 bg-white text-xs">
            <span className="text-gray-600">Energy Charges ({bill.unitsConsumed} units)</span>
            <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.energyCharges)}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2.5 bg-white text-xs">
            <span className="text-gray-600">Fixed Demand Charge</span>
            <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.fixedCharge)}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2.5 bg-gray-50/60 text-xs font-medium">
            <span className="text-gray-700">Subtotal (Taxable Amount)</span>
            <span className="font-mono text-gray-900">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2.5 bg-white text-xs">
            <span className="text-gray-600">
              Electricity Duty / Tax ({((bill.taxRate ?? 0.10) * 100).toFixed(0)}%)
            </span>
            <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.tax)}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2.5 bg-white text-xs">
            <span className="text-gray-600">Regulatory Surcharge</span>
            <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.surcharge || 0)}</span>
          </div>
          <div className="flex justify-between px-3.5 py-3 bg-gray-50 font-bold text-gray-900 border-t-2 border-gray-200">
            <span className="text-sm">Total Bill Amount Payable</span>
            <span className="text-base text-accent font-mono">{formatCurrency(bill.totalAmount)}</span>
          </div>
        </div>
      </div>
    </Modal>
    <BillPrintModal
      isOpen={printOpen}
      onClose={() => setPrintOpen(false)}
      bill={bill}
    />
  </>
  );
};
