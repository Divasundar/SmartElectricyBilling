import React from 'react';
import type { BillStatus, PaymentStatus, ConsumerStatus, MeterStatus, TariffStatus, PaymentMethod, UserRole } from '../../types';

type StatusType = BillStatus | PaymentStatus | ConsumerStatus | MeterStatus | TariffStatus | PaymentMethod | UserRole | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; cls: string }> = {
  // Bill Status
  PAID: { label: 'Paid', cls: 'badge-green' },
  UNPAID: { label: 'Unpaid', cls: 'badge-yellow' },
  OVERDUE: { label: 'Overdue', cls: 'badge-red' },
  PARTIALLY_PAID: { label: 'Partial', cls: 'badge-blue' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-gray' },

  // Payment Status
  SUCCESS: { label: 'Success', cls: 'badge-green' },
  PENDING: { label: 'Pending', cls: 'badge-yellow' },
  FAILED: { label: 'Failed', cls: 'badge-red' },
  REFUNDED: { label: 'Refunded', cls: 'badge-blue' },

  // Consumer / User Status
  ACTIVE: { label: 'Active', cls: 'badge-green' },
  INACTIVE: { label: 'Inactive', cls: 'badge-gray' },
  SUSPENDED: { label: 'Suspended', cls: 'badge-red' },

  // Meter Status
  FAULTY: { label: 'Faulty', cls: 'badge-red' },
  REPLACED: { label: 'Replaced', cls: 'badge-blue' },

  // Tariff Status
  DRAFT: { label: 'Draft', cls: 'badge-gray' },

  // Payment Methods
  UPI: { label: 'UPI', cls: 'badge-blue' },
  CARD: { label: 'Card', cls: 'badge-blue' },
  CASH: { label: 'Cash', cls: 'badge-gray' },
  BANK_TRANSFER: { label: 'Bank Transfer', cls: 'badge-blue' },
  CHEQUE: { label: 'Cheque', cls: 'badge-gray' },
  NETBANKING: { label: 'Net Banking', cls: 'badge-blue' },

  // Roles
  ADMIN: { label: 'Admin', cls: 'badge-blue' },
  BILLING_CLERK: { label: 'Billing Clerk', cls: 'badge-green' },
  CONSUMER: { label: 'Consumer', cls: 'badge-gray' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, cls: 'badge-gray' };

  return (
    <span className={`${config.cls} ${size === 'sm' ? 'text-xs' : ''}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60 inline-block" />
      {config.label}
    </span>
  );
};
