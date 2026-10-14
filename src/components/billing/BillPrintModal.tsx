import React from 'react';
import { Printer, X, Zap, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency, formatDate } from '../../lib/utils';
import { useAppState } from '../../hooks/useAppState';
import { getBillSlabBreakdown } from '../../services/billingService';
import type { Bill } from '../../types';

interface BillPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  bill: Bill | null;
}

export const BillPrintModal: React.FC<BillPrintModalProps> = ({
  isOpen,
  onClose,
  bill,
}) => {
  const { tariffs } = useAppState();

  if (!bill) return null;

  const slabBreakdown =
    bill.slabBreakdown && bill.slabBreakdown.length > 0
      ? bill.slabBreakdown
      : getBillSlabBreakdown(bill, tariffs);

  const subtotal = (bill.energyCharges || 0) + (bill.fixedCharge || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Print Electricity Bill — ${bill.billNumber || bill.billId}`}
      size="xl"
      footer={
        <div className="flex items-center justify-between w-full print:hidden">
          <div className="flex items-center gap-2 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded border border-amber-200">
            <ShieldCheck size={14} className="text-amber-600" />
            <span className="font-bold">DEMO / SAMPLE BILL — NOT AN OFFICIAL UTILITY BILL</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              <X size={14} /> Close
            </Button>
            <Button variant="primary" onClick={handlePrint} id="print-bill-btn">
              <Printer size={14} /> Print / Save as PDF
            </Button>
          </div>
        </div>
      }
    >
      {/* Printable Bill Area */}
      <div id="printable-bill" className="p-6 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-sm font-sans space-y-6">
        
        {/* Header / System Branding */}
        <div className="flex items-start justify-between border-b-2 border-gray-900 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-black text-white flex items-center justify-center rounded-lg shadow">
              <Zap size={26} className="text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-950">
                SMART ELECTRICITY BILLING SYSTEM
              </h1>
              <p className="text-xs text-gray-700 font-medium">
                Digital Electricity Billing & Management Platform
              </p>
              <div className="inline-block mt-1.5 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                DEMO / SAMPLE BILL — NOT AN OFFICIAL UTILITY BILL
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-black text-white text-xs font-mono font-bold tracking-wider rounded">
              SAMPLE INVOICE
            </span>
            <p className="text-xs text-gray-500 font-mono mt-1">SIMULATION MODE</p>
            <p className="text-[10px] text-amber-700 font-bold mt-0.5">FOR DEMO USE ONLY</p>
          </div>
        </div>

        {/* Invoice & Consumer Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs">
          <div>
            <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Bill Number</span>
            <span className="font-mono font-bold text-gray-950 text-sm">{bill.billNumber || bill.billId}</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Bill Date</span>
            <span className="font-semibold text-gray-900 text-sm">{formatDate(bill.generatedAt || bill.createdAt || new Date().toISOString())}</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Due Date</span>
            <span className="font-bold text-rose-600 text-sm">{formatDate(bill.dueDate)}</span>
          </div>
          <div>
            <span className="text-gray-500 uppercase tracking-wider text-[10px] font-semibold block">Payment Status</span>
            <span className={`inline-block font-bold text-xs px-2 py-0.5 rounded mt-0.5 ${
              bill.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {bill.status}
            </span>
          </div>
        </div>

        {/* Two-Column Consumer & Meter Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          {/* Consumer Info */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2">
            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase tracking-wider text-[11px]">
              Consumer Profile
            </h2>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-gray-500">Consumer Name:</span>
              <span className="font-semibold text-gray-900">{bill.consumerName}</span>

              <span className="text-gray-500">Consumer Account ID:</span>
              <span className="font-mono font-bold text-gray-900">{bill.consumerId}</span>

              <span className="text-gray-500">Category / Tariff:</span>
              <span className="font-semibold text-gray-800">{bill.connectionType || 'RESIDENTIAL'}</span>

              <span className="text-gray-500">Sanctioned Load:</span>
              <span className="font-medium text-gray-800">5.0 kW · Single Phase</span>

              <span className="text-gray-500">Billing Address:</span>
              <span className="text-gray-700">12, Green Avenue, Tech City, Sector 4</span>
            </div>
          </div>

          {/* Meter & Consumption Info */}
          <div className="border border-gray-200 rounded-lg p-4 bg-white space-y-2">
            <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-1.5 uppercase tracking-wider text-[11px]">
              Meter & Reading Details
            </h2>
            <div className="grid grid-cols-2 gap-y-1.5 text-xs">
              <span className="text-gray-500">Meter Serial Number:</span>
              <span className="font-mono font-bold text-gray-900">{bill.meterNumber || 'MTR-100234'}</span>

              <span className="text-gray-500">Billing Cycle:</span>
              <span className="font-medium text-gray-800">{bill.billingPeriod}</span>

              <span className="text-gray-500">Previous Reading:</span>
              <span className="font-mono font-medium text-gray-800">
                {bill.previousReading !== undefined ? `${bill.previousReading} kWh` : 'N/A'}
              </span>

              <span className="text-gray-500">Current Reading:</span>
              <span className="font-mono font-medium text-gray-800">
                {bill.currentReading !== undefined ? `${bill.currentReading} kWh` : 'N/A'}
              </span>

              <span className="text-gray-500 font-bold">Total Consumption:</span>
              <span className="font-mono font-black text-emerald-600 text-sm">
                {bill.unitsConsumed} kWh
              </span>
            </div>
          </div>
        </div>

        {/* Slab Breakdown Calculation Table */}
        <div className="space-y-2">
          <h2 className="font-bold text-gray-900 text-xs uppercase tracking-wider">
            Telescopic Tariff Slab Breakdown ({bill.unitsConsumed} kWh)
          </h2>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-[10px] tracking-wider border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Tariff Slab Range</th>
                  <th className="py-2.5 px-3 text-right">Units Billed</th>
                  <th className="py-2.5 px-3 text-right">Rate / Unit (₹)</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-mono">
                {slabBreakdown.map((s, idx) => (
                  <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="py-2 px-3 font-sans text-gray-800 font-medium">{s.slabName}</td>
                    <td className="py-2 px-3 text-right text-gray-700">{s.unitsInSlab} kWh</td>
                    <td className="py-2 px-3 text-right text-gray-700">₹{s.ratePerUnit.toFixed(2)}</td>
                    <td className="py-2 px-3 text-right font-semibold text-gray-950">
                      ₹{s.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-100 font-bold border-t border-gray-200 text-gray-900">
                <tr>
                  <td colSpan={3} className="py-2 px-3 text-right font-sans uppercase text-[11px]">
                    Subtotal Energy Charges:
                  </td>
                  <td className="py-2 px-3 text-right font-mono font-bold text-gray-950">
                    {formatCurrency(bill.energyCharges)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Final Financial Charges Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 text-xs space-y-2">
            <h3 className="font-bold text-gray-900 uppercase tracking-wider text-[11px]">
              Statutory Notes & Remittances
            </h3>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              1. Please pay by the due date to avoid late payment surcharge of 2% and disconnection of supply.
            </p>
            <p className="text-gray-600 leading-relaxed text-[11px]">
              2. Payments can be remitted online via UPI, Debit/Credit Card, Net Banking or at designated utility collection counters.
            </p>
            <div className="pt-2 flex items-center gap-2 text-emerald-700 font-medium text-[11px]">
              <CheckCircle2 size={14} />
              <span>Electricity Duty calculated @ 10% per State Tariff Regulations.</span>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg overflow-hidden divide-y divide-gray-200 text-xs bg-white">
            <div className="flex justify-between px-3.5 py-2">
              <span className="text-gray-600">Energy Charges</span>
              <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.energyCharges)}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2">
              <span className="text-gray-600">Fixed Demand Charge</span>
              <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.fixedCharge)}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2 bg-gray-50/60 font-medium">
              <span className="text-gray-700">Subtotal</span>
              <span className="font-mono text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2">
              <span className="text-gray-600">Electricity Duty / Tax (10%)</span>
              <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.tax)}</span>
            </div>
            <div className="flex justify-between px-3.5 py-2">
              <span className="text-gray-600">Regulatory Surcharge</span>
              <span className="font-mono font-medium text-gray-900">{formatCurrency(bill.surcharge || 0)}</span>
            </div>
            <div className="flex justify-between px-3.5 py-3 bg-gray-900 text-white font-bold">
              <span className="text-sm">TOTAL AMOUNT PAYABLE</span>
              <span className="text-base text-emerald-400 font-mono">{formatCurrency(bill.totalAmount)}</span>
            </div>
          </div>
        </div>

        {/* Footer Barcode & Authorization */}
        <div className="flex items-center justify-between border-t border-gray-200 pt-4 text-xs">
          <div>
            <div className="font-mono font-bold tracking-widest text-lg text-gray-800">
              ||| | ||||| || |||| ||| ||||||| ||| |||| |
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-0.5">
              Ref: {bill.billId}-{bill.consumerId}-2026
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-gray-800 text-[11px]">Authorized Signatory</p>
            <p className="text-[10px] text-gray-500">Smart Electricity Billing Authority</p>
          </div>
        </div>

      </div>
    </Modal>
  );
};
