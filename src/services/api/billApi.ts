// ============================================================
// SMART BILLING - Bill API
// ============================================================
import type { Bill, SlabBreakdownItem } from '../../types';
import { apiGet, apiPost } from './apiClient';

interface BackendSlabBreakdown {
  slabId: string;
  slabName: string;
  slabRange: string;
  unitsInSlab: number;
  ratePerUnit: number;
  amount: number;
}

interface BackendBill {
  id: number;
  billId: string;
  billNumber: string;
  consumerId: string;
  consumerName: string;
  meterId?: string;
  meterNumber: string;
  connectionType?: string;
  billingPeriod: string;
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
  status: string;
  createdAt: string;
  slabBreakdown?: BackendSlabBreakdown[];
}

export function mapBill(b: BackendBill): Bill {
  const slabBreakdown: SlabBreakdownItem[] = (b.slabBreakdown ?? []).map(s => ({
    slabId: String(s.slabId),
    slabName: s.slabName,
    slabRange: s.slabRange,
    unitsInSlab: Number(s.unitsInSlab),
    ratePerUnit: Number(s.ratePerUnit),
    amount: Number(s.amount),
  }));

  return {
    id: String(b.id),
    billId: b.billId ?? b.billNumber,
    billNumber: b.billNumber,
    consumerId: b.consumerId,
    consumerName: b.consumerName,
    meterId: b.meterId,
    meterNumber: b.meterNumber ?? '',
    connectionType: (b.connectionType ?? 'RESIDENTIAL') as Bill['connectionType'],
    billingPeriod: b.billingPeriod,
    billingPeriodFrom: b.dueDate ?? '',
    billingPeriodTo: b.dueDate ?? '',
    previousReading: Number(b.previousReading),
    currentReading: Number(b.currentReading),
    unitsConsumed: Number(b.unitsConsumed),
    energyCharges: Number(b.energyCharges),
    fixedCharge: Number(b.fixedCharge),
    taxRate: Number(b.taxRate ?? 0),
    tax: Number(b.tax),
    surcharge: Number(b.surcharge),
    totalAmount: Number(b.totalAmount),
    dueDate: b.dueDate ?? '',
    status: (b.status ?? 'UNPAID') as Bill['status'],
    generatedAt: b.createdAt ?? new Date().toISOString(),
    createdAt: b.createdAt,
    slabBreakdown,
  };
}

export async function fetchBills(): Promise<Bill[]> {
  const data = await apiGet<BackendBill[]>('/bills');
  return data.map(mapBill);
}

export async function fetchBillById(id: number): Promise<Bill> {
  const data = await apiGet<BackendBill>('/bills/' + String(id));
  return mapBill(data);
}

export async function fetchBillsByConsumer(consumerId: string): Promise<Bill[]> {
  const data = await apiGet<BackendBill[]>('/consumers/' + consumerId + '/bills');
  return data.map(mapBill);
}

export interface BillCalculationPreviewRequest {
  consumerId: string;
  meterNumber?: string;
  previousReading: number;
  currentReading: number;
  billingPeriod: string;
}

export interface BillCalculationPreview {
  consumerId: string;
  consumerName: string;
  connectionType: string;
  billingPeriod: string;
  previousReading: number;
  currentReading: number;
  unitsConsumed: number;
  energyCharges: number;
  fixedCharge: number;
  taxRate: number;
  tax: number;
  surcharge: number;
  totalAmount: number;
  slabBreakdown: SlabBreakdownItem[];
}

export async function calculateBillPreview(
  req: BillCalculationPreviewRequest
): Promise<BillCalculationPreview> {
  return apiPost<BillCalculationPreview>('/bills/calculate-preview', req);
}

export interface BillGenerationRequest {
  consumerId: string;
  meterNumber?: string;
  billingPeriod: string;
  previousReading: number;
  currentReading: number;
  dueDate?: string;
}

export async function generateBillOnBackend(req: BillGenerationRequest): Promise<Bill> {
  const data = await apiPost<BackendBill>('/bills/generate', req);
  return mapBill(data);
}
export async function updateBillStatusOnBackend(id: number, status: string): Promise<Bill> {
  const data = await apiPost<BackendBill>('/bills/' + String(id) + '/status-patch', { status });
  return mapBill(data);
}

export async function patchBillStatus(id: number, status: string): Promise<Bill> {
  const resp = await fetch(
    'http://localhost:8080/api/bills/' + String(id) + '/status',
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }
  );
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(err || 'PATCH bill status failed');
  }
  const data = await resp.json() as BackendBill;
  return mapBill(data);
}
