// ============================================================
// SMART BILLING - Consumer API (maps backend DTOs to frontend types)
// ============================================================
import type { Consumer, Meter } from '../../types';
import { apiGet, apiPost } from './apiClient';

interface BackendConsumer {
  id: number;
  consumerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  connectionType: string;
  status: string;
  sanctionedLoad: number;
  createdAt: string;
  meterNumber: string;
}

interface BackendMeter {
  id: number;
  meterId?: string;
  meterNumber?: string;
  consumerId?: string | number;
  consumerCode?: string;
  consumerName?: string;
  meterType?: string;
  currentReading?: number;
  previousReading?: number;
  lastReadingDate?: string;
  installationDate?: string;
  installedAt?: string;
  status?: string;
  location?: string;
}

export function mapConsumer(b: BackendConsumer): Consumer {
  return {
    id: String(b.id),
    consumerId: b.consumerId,
    name: b.name,
    email: b.email,
    phone: b.phone ?? '',
    address: b.address ?? '',
    meterNumber: b.meterNumber ?? '',
    connectionType: (b.connectionType ?? 'RESIDENTIAL') as Consumer['connectionType'],
    status: (b.status ?? 'ACTIVE') as Consumer['status'],
    registeredAt: b.createdAt ?? new Date().toISOString().split('T')[0],
    sanctionedLoad: b.sanctionedLoad ?? 5,
  };
}

export function mapMeter(b: BackendMeter): Meter {
  return {
    id: String(b.id),
    meterId: b.meterId || b.meterNumber || `MTR-${b.id}`,
    consumerId: String(b.consumerId || b.consumerCode || ''),
    consumerName: b.consumerName ?? '',
    meterType: (b.meterType ?? 'SINGLE_PHASE') as Meter['meterType'],
    currentReading: Number(b.currentReading) || 0,
    previousReading: Number(b.previousReading) || 0,
    lastReadingDate: b.lastReadingDate ?? b.installedAt ?? '',
    installationDate: b.installationDate ?? b.installedAt ?? '',
    status: (b.status ?? 'ACTIVE') as Meter['status'],
    location: b.location ?? '',
  };
}

export async function fetchConsumers(): Promise<Consumer[]> {
  const data = await apiGet<BackendConsumer[]>('/consumers');
  return data.map(mapConsumer);
}

export async function fetchConsumerById(id: string): Promise<Consumer> {
  const data = await apiGet<BackendConsumer>('/consumers/' + id);
  return mapConsumer(data);
}

export async function createConsumer(payload: {
  consumerId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  connectionType: string;
  sanctionedLoad: number;
}): Promise<Consumer> {
  const data = await apiPost<BackendConsumer>('/consumers', payload);
  return mapConsumer(data);
}

export async function fetchMeters(): Promise<Meter[]> {
  const data = await apiGet<BackendMeter[]>('/meters');
  return data.map(mapMeter);
}