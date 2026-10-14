// ============================================================
// SMART BILLING - Tariff API
// ============================================================
import type { TariffSlab } from '../../types';
import { apiGet } from './apiClient';

interface BackendTariff {
  id: number;
  name: string;
  connectionType: string;
  slabFrom: number;
  slabTo: number;
  ratePerUnit: number;
  fixedCharge: number;
  status: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

export function mapTariff(b: BackendTariff): TariffSlab {
  return {
    id: String(b.id),
    name: b.name,
    slabFrom: b.slabFrom,
    slabTo: b.slabTo,
    ratePerUnit: Number(b.ratePerUnit),
    fixedCharge: Number(b.fixedCharge),
    effectiveFrom: b.effectiveFrom ?? '',
    effectiveTo: b.effectiveTo,
    status: (b.status ?? 'ACTIVE') as TariffSlab['status'],
    connectionType: (b.connectionType ?? 'RESIDENTIAL') as TariffSlab['connectionType'],
  };
}

export async function fetchTariffs(): Promise<TariffSlab[]> {
  const data = await apiGet<BackendTariff[]>('/tariffs');
  return data.map(mapTariff);
}

export async function fetchTariffsByConnectionType(type: string): Promise<TariffSlab[]> {
  const data = await apiGet<BackendTariff[]>('/tariffs/' + type);
  return data.map(mapTariff);
}