// ============================================================
// SMART BILLING — Core TypeScript Types & Interfaces
// ============================================================

export type UserRole = 'ADMIN' | 'BILLING_CLERK' | 'CONSUMER';

export type ConsumerStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';

export type ConnectionType = 'RESIDENTIAL' | 'COMMERCIAL' | 'INDUSTRIAL' | 'AGRICULTURAL';

export type MeterStatus = 'ACTIVE' | 'INACTIVE' | 'FAULTY' | 'REPLACED';

export type MeterType = 'SINGLE_PHASE' | 'THREE_PHASE' | 'SMART' | 'PREPAID';

export type BillStatus = 'PAID' | 'UNPAID' | 'OVERDUE' | 'PARTIALLY_PAID' | 'CANCELLED';

export type PaymentMethod = 'UPI' | 'CARD' | 'CASH' | 'BANK_TRANSFER' | 'CHEQUE' | 'NETBANKING';

export type PaymentStatus = 'SUCCESS' | 'PENDING' | 'FAILED' | 'REFUNDED';

export type TariffStatus = 'ACTIVE' | 'INACTIVE' | 'DRAFT';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
  lastLogin: string;
  avatar?: string;
  phone?: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  consumerId?: string;
}

export interface Consumer {
  id: string;
  consumerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  meterNumber: string;
  connectionType: ConnectionType;
  status: ConsumerStatus;
  registeredAt: string;
  sanctionedLoad: number; // in kW
}

export interface Meter {
  id: string;
  meterId: string;
  consumerId: string;
  consumerName: string;
  meterType: MeterType;
  currentReading: number;
  previousReading: number;
  lastReadingDate: string;
  installationDate: string;
  status: MeterStatus;
  location: string;
}

export interface TariffSlab {
  id: string;
  name: string;
  slabFrom: number; // units from
  slabTo: number;   // units to (0 = unlimited)
  ratePerUnit: number; // ₹ per kWh
  fixedCharge: number; // ₹ per month
  effectiveFrom: string;
  effectiveTo?: string;
  status: TariffStatus;
  connectionType: ConnectionType;
}

export interface SlabBreakdownItem {
  slabId: string;
  slabName: string;
  slabRange: string;
  unitsInSlab: number;
  ratePerUnit: number;
  amount: number;
}

export interface Bill {
  id: string;
  billId: string;
  billNumber?: string;
  consumerId: string;
  consumerName: string;
  meterId?: string;
  meterNumber: string;
  billingPeriod: string;         // e.g. "September 2026"
  billingPeriodFrom: string;
  billingPeriodTo: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  energyCharges: number;
  fixedCharge: number;
  taxRate?: number;
  tax: number;
  surcharge: number;
  totalAmount: number;
  dueDate: string;
  status: BillStatus;
  generatedAt: string;
  createdAt?: string;
  connectionType?: ConnectionType;
  slabBreakdown?: SlabBreakdownItem[];
}

export interface Payment {
  id: string;
  paymentId: string;
  billId: string;
  consumerId: string;
  consumerName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  transactionRef?: string;
  paidAt: string;
  remarks?: string;
}

export interface ConsumptionRecord {
  id: string;
  consumerId: string;
  month: string;         // "Jan", "Feb", etc.
  year: number;
  units: number;         // kWh
  recordedAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';
  read: boolean;
  createdAt: string;
}

export interface MonthlyStats {
  month: string;
  consumption: number;
  revenue: number;
  billsGenerated: number;
  paymentReceived: number;
}

export interface DashboardStats {
  totalRevenue: number;
  totalConsumers: number;
  pendingBills: number;
  activeMeters: number;
  revenueChange: number;
  consumerChange: number;
  pendingChange: number;
  meterChange: number;
}
