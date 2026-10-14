// ============================================================
// SMART BILLING - Payment API
// ============================================================
import type { Payment } from '../../types';
import { apiGet, apiPost } from './apiClient';

interface BackendPayment {
  id: number;
  transactionId: string;
  billId: number;
  billNumber: string;
  consumerId: string;
  consumerName: string;
  amount: number;
  paymentMethod: string;
  status: string;
  paidAt: string;
  remarks?: string;
}

export function mapPayment(b: BackendPayment): Payment {
  return {
    id: String(b.id),
    paymentId: b.transactionId,
    billId: String(b.billId),
    consumerId: b.consumerId,
    consumerName: b.consumerName ?? '',
    amount: Number(b.amount),
    paymentMethod: (b.paymentMethod ?? 'CASH') as Payment['paymentMethod'],
    status: (b.status ?? 'SUCCESS') as Payment['status'],
    transactionRef: b.transactionId,
    paidAt: b.paidAt ?? new Date().toISOString(),
    remarks: b.remarks,
  };
}

export async function fetchPayments(): Promise<Payment[]> {
  const data = await apiGet<BackendPayment[]>('/payments');
  return data.map(mapPayment);
}

export interface RecordPaymentRequest {
  billId: number;
  amount: number;
  paymentMethod: string;
  remarks?: string;
}

export async function recordDemoPayment(req: RecordPaymentRequest): Promise<Payment> {
  const data = await apiPost<BackendPayment>('/payments/demo', req);
  return mapPayment(data);
}