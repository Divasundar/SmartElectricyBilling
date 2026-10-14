import React from 'react';
import { Printer, X, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { formatCurrency, formatDateTime } from '../../lib/utils';
import type { Payment } from '../../types';

interface PaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
}) => {
  if (!payment) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payment Receipt — ${payment.paymentId}`}
      size="md"
      footer={
        <div className="flex items-center justify-between w-full print:hidden">
          <div className="flex items-center gap-1.5 text-xs text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            <ShieldCheck size={14} className="text-amber-600" />
            <span className="font-semibold">DEMO PAYMENT — NO REAL TRANSACTION</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={onClose}>
              <X size={14} /> Close
            </Button>
            <Button variant="primary" onClick={handlePrint} id="print-receipt-btn">
              <Printer size={14} /> Print Receipt
            </Button>
          </div>
        </div>
      }
    >
      <div id="printable-receipt" className="p-5 bg-white text-gray-900 border border-gray-200 rounded-lg shadow-sm font-sans space-y-5">
        {/* Receipt Header */}
        <div className="text-center pb-4 border-b border-gray-200">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center rounded-lg mx-auto mb-2">
            <Zap size={22} className="text-emerald-400" />
          </div>
          <h2 className="text-base font-black text-gray-950 uppercase tracking-wide">
            SMART ELECTRICITY BILLING SYSTEM
          </h2>
          <p className="text-[11px] text-gray-500">Digital Electricity Billing & Management Platform</p>
          <div className="inline-block mt-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded border border-amber-300">
            DEMO PAYMENT RECEIPT — NO REAL TRANSACTION
          </div>
          <div className="block mt-1.5">
            <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-emerald-200">
              <CheckCircle2 size={13} />
              <span>SIMULATION STATUS: {payment.status}</span>
            </span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
          <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold">Simulated Amount Received</p>
          <p className="text-2xl font-black text-gray-900 font-mono mt-0.5">
            {formatCurrency(payment.amount)}
          </p>
          <p className="text-[11px] text-gray-600 font-medium mt-1">
            Simulated Method: <span className="font-bold text-gray-900">{payment.paymentMethod} (DEMO)</span>
          </p>
        </div>

        {/* Key-Value Details */}
        <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100 text-xs">
          <div className="flex justify-between px-3.5 py-2">
            <span className="text-gray-500">Receipt / Payment ID:</span>
            <span className="font-mono font-bold text-gray-900">{payment.paymentId}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2">
            <span className="text-gray-500">Bill ID / Reference:</span>
            <span className="font-mono font-bold text-gray-900">{payment.billId}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2">
            <span className="text-gray-500">Consumer Name:</span>
            <span className="font-semibold text-gray-900">{payment.consumerName}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2">
            <span className="text-gray-500">Consumer ID:</span>
            <span className="font-mono text-gray-800">{payment.consumerId}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2">
            <span className="text-gray-500">Payment Timestamp:</span>
            <span className="text-gray-900">{formatDateTime(payment.paidAt)}</span>
          </div>
          <div className="flex justify-between px-3.5 py-2">
            <span className="text-gray-500">Demo Reference / UTR:</span>
            <span className="font-mono text-gray-800">{payment.transactionRef || 'N/A'}</span>
          </div>
          {payment.remarks && (
            <div className="flex justify-between px-3.5 py-2">
              <span className="text-gray-500">Remarks:</span>
              <span className="text-gray-700 italic">{payment.remarks}</span>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center pt-2 text-[10px] text-amber-700 bg-amber-50/50 p-2 rounded border border-amber-100">
          DEMO NOTICE: This is a simulated transaction receipt generated in a demonstration environment. No actual banking, gateway, or credit card transactions were executed.
        </div>
      </div>
    </Modal>
  );
};
