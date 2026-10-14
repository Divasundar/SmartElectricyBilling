// ============================================================
// SMART BILLING - useBackendSync Hook
// Attempts to load data from the Spring Boot backend on mount.
// If backend is unavailable, silently falls back to mock data.
// ============================================================
import { useEffect, useState, useCallback } from 'react';
import {
  checkBackendHealth,
  getApiMode,
  setApiMode,
  fetchConsumers,
  fetchMeters,
  fetchTariffs,
  fetchBills,
  fetchPayments,
} from '../services/api';
import type { AppState } from '../context/AppStateContext';

export type SyncStatus = 'idle' | 'syncing' | 'connected' | 'offline';

export interface UseBackendSyncResult {
  status: SyncStatus;
  isBackendConnected: boolean;
  lastSyncedAt: Date | null;
  syncNow: () => Promise<void>;
}

export function useBackendSync(
  onDataLoaded: (partial: Partial<AppState>) => void
): UseBackendSyncResult {
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  const syncNow = useCallback(async () => {
    setStatus('syncing');
    try {
      const healthy = await checkBackendHealth();
      if (!healthy) {
        setStatus('offline');
        setApiMode('mock');
        return;
      }

      setApiMode('backend');

      const [consumers, meters, tariffs, bills, payments] = await Promise.all([
        fetchConsumers().catch(() => null),
        fetchMeters().catch(() => null),
        fetchTariffs().catch(() => null),
        fetchBills().catch(() => null),
        fetchPayments().catch(() => null),
      ]);

      const partial: Partial<AppState> = {};
      if (consumers && consumers.length > 0) partial.consumers = consumers;
      if (meters && meters.length > 0) partial.meters = meters;
      if (tariffs && tariffs.length > 0) partial.tariffs = tariffs;
      if (bills) partial.bills = bills;
      if (payments) partial.payments = payments;

      onDataLoaded(partial);
      setLastSyncedAt(new Date());
      setStatus('connected');
    } catch (err) {
      console.warn('[BackendSync] Error during sync:', err);
      setStatus('offline');
      setApiMode('mock');
    }
  }, [onDataLoaded]);

  useEffect(() => {
    syncNow();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isBackendConnected: getApiMode() === 'backend' && status === 'connected',
    lastSyncedAt,
    syncNow,
  };
}