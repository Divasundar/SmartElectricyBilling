// ============================================================
// SMART BILLING — Centralized Application State Context
// ============================================================

import React, { createContext, useContext, useReducer, useEffect, useMemo, useCallback } from 'react';
import type {
  Consumer,
  Meter,
  TariffSlab,
  Bill,
  Payment,
  User,
  ConsumptionRecord,
  Notification,
  MonthlyStats,
  DashboardStats,
  BillStatus,
  ConnectionType,
} from '../types';
import {
  mockConsumers as defaultConsumers,
  mockMeters as defaultMeters,
  mockTariffs as defaultTariffs,
  mockBills as defaultBills,
  mockPayments as defaultPayments,
  mockUsers as defaultUsers,
  mockConsumptionHistory as defaultConsumption,
  mockNotifications as defaultNotifications,
  mockMonthlyStats as defaultMonthlyStats,
  mockDashboardStats as defaultDashboardStats,
} from '../data/mockData';
import {
  createBill,
  deriveBillStatus,
  GenerateBillParams,
} from '../services/billingService';

export type GenerateBillInput =
  | Bill
  | (Omit<GenerateBillParams, 'tariffs' | 'existingBills' | 'connectionType'> & {
      connectionType?: ConnectionType;
      tariffs?: TariffSlab[];
      existingBills?: Bill[];
    });

const APP_STATE_STORAGE_KEY = 'smart_billing_app_state_v2';

export interface AppState {
  consumers: Consumer[];
  meters: Meter[];
  tariffs: TariffSlab[];
  bills: Bill[];
  payments: Payment[];
  users: User[];
  consumptionRecords: ConsumptionRecord[];
  notifications: Notification[];
  monthlyStats: MonthlyStats[];
  dashboardStats: DashboardStats;
}

export type AppStateAction =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'SET_PARTIAL_STATE'; payload: Partial<AppState> }
  | { type: 'ADD_CONSUMER'; payload: Consumer }
  | { type: 'UPDATE_CONSUMER'; payload: { id: string; updates: Partial<Consumer> } }
  | { type: 'DELETE_CONSUMER'; payload: string }
  | { type: 'ADD_METER'; payload: Meter }
  | { type: 'UPDATE_METER'; payload: { id: string; updates: Partial<Meter> } }
  | { type: 'RECORD_METER_READING'; payload: { meterId: string; reading: number } }
  | { type: 'ADD_TARIFF'; payload: TariffSlab }
  | { type: 'UPDATE_TARIFF'; payload: { id: string; updates: Partial<TariffSlab> } }
  | { type: 'DELETE_TARIFF'; payload: string }
  | { type: 'GENERATE_BILL'; payload: Bill }
  | { type: 'UPDATE_BILL_STATUS'; payload: { id: string; status: BillStatus } }
  | { type: 'RECORD_PAYMENT'; payload: Payment }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: { id: string; updates: Partial<User> } }
  | { type: 'DELETE_USER'; payload: string }
  | { type: 'ADD_CONSUMPTION_RECORD'; payload: ConsumptionRecord }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'RESET_STATE' };

// Normalize initial mock data with prompt specs (e.g. Rahul's consumerId)
const initialConsumers: Consumer[] = defaultConsumers.map(c =>
  c.id === 'CON-001' ? { ...c, consumerId: 'C10234', email: 'rahul@smartbilling.com' } : c
);

const initialUsers: User[] = defaultUsers.map(u => {
  if (u.role === 'ADMIN') return { ...u, email: 'admin@smartbilling.com' };
  if (u.role === 'BILLING_CLERK' && u.name === 'Meera Pillai') return { ...u, email: 'clerk@smartbilling.com' };
  if (u.role === 'CONSUMER' && u.name === 'Rahul Kumar') return { ...u, email: 'rahul@smartbilling.com' };
  return u;
});

const defaultState: AppState = {
  consumers: initialConsumers,
  meters: defaultMeters,
  tariffs: defaultTariffs,
  bills: defaultBills,
  payments: defaultPayments,
  users: initialUsers,
  consumptionRecords: defaultConsumption,
  notifications: defaultNotifications,
  monthlyStats: defaultMonthlyStats,
  dashboardStats: defaultDashboardStats,
};

function appStateReducer(state: AppState, action: AppStateAction): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;

    case 'SET_PARTIAL_STATE':
      return { ...state, ...action.payload };

    case 'ADD_CONSUMER':
      return {
        ...state,
        consumers: [action.payload, ...state.consumers],
        dashboardStats: {
          ...state.dashboardStats,
          totalConsumers: state.dashboardStats.totalConsumers + 1,
        },
      };

    case 'UPDATE_CONSUMER':
      return {
        ...state,
        consumers: state.consumers.map(c =>
          c.id === action.payload.id ? { ...c, ...action.payload.updates } : c
        ),
      };

    case 'DELETE_CONSUMER':
      return {
        ...state,
        consumers: state.consumers.filter(c => c.id !== action.payload),
      };

    case 'ADD_METER':
      return {
        ...state,
        meters: [action.payload, ...state.meters],
        dashboardStats: {
          ...state.dashboardStats,
          activeMeters: state.dashboardStats.activeMeters + 1,
        },
      };

    case 'UPDATE_METER':
      return {
        ...state,
        meters: state.meters.map(m =>
          m.id === action.payload.id ? { ...m, ...action.payload.updates } : m
        ),
      };

    case 'RECORD_METER_READING':
      return {
        ...state,
        meters: state.meters.map(m =>
          m.id === action.payload.meterId || m.meterId === action.payload.meterId
            ? {
                ...m,
                previousReading: m.currentReading,
                currentReading: action.payload.reading,
                lastReadingDate: new Date().toISOString().split('T')[0],
              }
            : m
        ),
      };

    case 'ADD_TARIFF':
      return {
        ...state,
        tariffs: [...state.tariffs, action.payload],
      };

    case 'UPDATE_TARIFF':
      return {
        ...state,
        tariffs: state.tariffs.map(t =>
          t.id === action.payload.id ? { ...t, ...action.payload.updates } : t
        ),
      };

    case 'DELETE_TARIFF':
      return {
        ...state,
        tariffs: state.tariffs.filter(t => t.id !== action.payload),
      };

    case 'GENERATE_BILL': {
      const newBill = action.payload;
      // Also update consumer's meter reading to reflect the latest reading
      const updatedMeters = state.meters.map(m => {
        if (
          m.meterId === newBill.meterNumber ||
          m.consumerId === newBill.consumerId
        ) {
          return {
            ...m,
            previousReading: newBill.previousReading,
            currentReading: newBill.currentReading,
            lastReadingDate: new Date().toISOString().split('T')[0],
          };
        }
        return m;
      });

      return {
        ...state,
        bills: [newBill, ...state.bills],
        meters: updatedMeters,
        dashboardStats: {
          ...state.dashboardStats,
          pendingBills: state.dashboardStats.pendingBills + 1,
        },
      };
    }

    case 'UPDATE_BILL_STATUS': {
      const { id, status } = action.payload;
      return {
        ...state,
        bills: state.bills.map(b => (b.id === id || b.billId === id ? { ...b, status } : b)),
      };
    }

    case 'RECORD_PAYMENT': {
      const newPayment = action.payload;
      // When payment is recorded, update associated bill status to PAID if SUCCESS
      const updatedBills = state.bills.map(b => {
        if (b.id === newPayment.billId || b.billId === newPayment.billId) {
          return {
            ...b,
            status: (newPayment.status === 'SUCCESS' ? 'PAID' : b.status) as BillStatus,
          };
        }
        return b;
      });

      return {
        ...state,
        payments: [newPayment, ...state.payments],
        bills: updatedBills,
        dashboardStats: {
          ...state.dashboardStats,
          totalRevenue:
            state.dashboardStats.totalRevenue +
            (newPayment.status === 'SUCCESS' ? newPayment.amount : 0),
          pendingBills: Math.max(
            0,
            state.dashboardStats.pendingBills - (newPayment.status === 'SUCCESS' ? 1 : 0)
          ),
        },
      };
    }

    case 'ADD_USER':
      return {
        ...state,
        users: [action.payload, ...state.users],
      };

    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(u =>
          u.id === action.payload.id ? { ...u, ...action.payload.updates } : u
        ),
      };

    case 'DELETE_USER':
      return {
        ...state,
        users: state.users.filter(u => u.id !== action.payload),
      };

    case 'ADD_CONSUMPTION_RECORD':
      return {
        ...state,
        consumptionRecords: [...state.consumptionRecords, action.payload],
      };

    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
      };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [action.payload, ...state.notifications],
      };

    case 'RESET_STATE':
      return defaultState;

    default:
      return state;
  }
}

export interface AppStateContextType {
  state: AppState;
  consumers: Consumer[];
  meters: Meter[];
  tariffs: TariffSlab[];
  bills: Bill[];
  payments: Payment[];
  users: User[];
  consumptionRecords: ConsumptionRecord[];
  notifications: Notification[];
  monthlyStats: MonthlyStats[];
  dashboardStats: DashboardStats;
  backendSyncStatus: 'idle' | 'syncing' | 'connected' | 'offline';
  isBackendConnected: boolean;

  // Actions
  addConsumer: (consumer: Omit<Consumer, 'id' | 'registeredAt'>) => Consumer;
  updateConsumer: (id: string, updates: Partial<Consumer>) => void;
  deleteConsumer: (id: string) => void;

  addMeter: (meter: Omit<Meter, 'id' | 'installationDate'>) => Meter;
  updateMeter: (id: string, updates: Partial<Meter>) => void;
  recordMeterReading: (meterId: string, reading: number) => void;

  addTariff: (tariff: Omit<TariffSlab, 'id'>) => TariffSlab;
  updateTariff: (id: string, updates: Partial<TariffSlab>) => void;
  deleteTariff: (id: string) => void;

  generateBill: (billOrParams: GenerateBillInput) => Bill;
  updateBillStatus: (id: string, status: BillStatus) => void;

  recordPayment: (paymentData: Omit<Payment, 'id' | 'paymentId' | 'paidAt'>) => Payment;

  addUser: (user: Omit<User, 'id' | 'createdAt' | 'lastLogin'>) => User;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  addConsumptionRecord: (record: Omit<ConsumptionRecord, 'id' | 'recordedAt'>) => ConsumptionRecord;
  markNotificationRead: (id: string) => void;
  resetState: () => void;
}

export const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

export const AppStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appStateReducer, defaultState, () => {
    try {
      const saved = localStorage.getItem(APP_STATE_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.consumers && parsed.bills && parsed.meters) {
          return parsed;
        }
      }
    } catch {
      // Fallback to default
    }
    return defaultState;
  });

  // ── Backend sync (lazy import to avoid circular dep) ──────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [backendSyncStatus, setBackendSyncStatus] = React.useState<
    'idle' | 'syncing' | 'connected' | 'offline'
  >('idle');
  const [isBackendConnected, setIsBackendConnected] = React.useState(false);

  const handleBackendData = useCallback((partial: Partial<AppState>) => {
    if (Object.keys(partial).length > 0) {
      dispatch({ type: 'SET_PARTIAL_STATE', payload: partial });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      setBackendSyncStatus('syncing');
      try {
        const { checkBackendHealth, fetchConsumers, fetchMeters, fetchTariffs, fetchBills, fetchPayments } =
          await import('../services/api');
        const healthy = await checkBackendHealth();
        if (!healthy || cancelled) {
          setBackendSyncStatus('offline');
          return;
        }
        const [consumers, meters, tariffs, bills, payments] = await Promise.all([
          fetchConsumers().catch(() => null),
          fetchMeters().catch(() => null),
          fetchTariffs().catch(() => null),
          fetchBills().catch(() => null),
          fetchPayments().catch(() => null),
        ]);
        if (cancelled) return;
        const partial: Partial<AppState> = {};
        if (consumers && consumers.length > 0) partial.consumers = consumers;
        if (meters && meters.length > 0) partial.meters = meters;
        if (tariffs && tariffs.length > 0) partial.tariffs = tariffs;
        if (bills) partial.bills = bills;
        if (payments) partial.payments = payments;
        handleBackendData(partial);
        setIsBackendConnected(true);
        setBackendSyncStatus('connected');
      } catch (e) {
        if (!cancelled) {
          console.warn('[AppState] Backend sync failed, using mock data', e);
          setBackendSyncStatus('offline');
        }
      }
    };
    run();
    return () => { cancelled = true; };
  }, [handleBackendData]);
  // ── end backend sync ──────────────────────────────────────────────────────

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage unavailable
    }
  }, [state]);

  const addConsumer = (data: Omit<Consumer, 'id' | 'registeredAt'>): Consumer => {
    const id = `CON-${String(state.consumers.length + 1).padStart(3, '0')}`;
    const newConsumer: Consumer = {
      ...data,
      id,
      registeredAt: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_CONSUMER', payload: newConsumer });
    return newConsumer;
  };

  const updateConsumer = (id: string, updates: Partial<Consumer>) => {
    dispatch({ type: 'UPDATE_CONSUMER', payload: { id, updates } });
  };

  const deleteConsumer = (id: string) => {
    dispatch({ type: 'DELETE_CONSUMER', payload: id });
  };

  const addMeter = (data: Omit<Meter, 'id' | 'installationDate'>): Meter => {
    const id = `M-${String(state.meters.length + 1).padStart(3, '0')}`;
    const newMeter: Meter = {
      ...data,
      id,
      installationDate: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_METER', payload: newMeter });
    return newMeter;
  };

  const updateMeter = (id: string, updates: Partial<Meter>) => {
    dispatch({ type: 'UPDATE_METER', payload: { id, updates } });
  };

  const recordMeterReading = (meterId: string, reading: number) => {
    dispatch({ type: 'RECORD_METER_READING', payload: { meterId, reading } });
  };

  const addTariff = (data: Omit<TariffSlab, 'id'>): TariffSlab => {
    const id = `TAR-${String(state.tariffs.length + 1).padStart(3, '0')}`;
    const newTariff: TariffSlab = { ...data, id };
    dispatch({ type: 'ADD_TARIFF', payload: newTariff });
    return newTariff;
  };

  const updateTariff = (id: string, updates: Partial<TariffSlab>) => {
    dispatch({ type: 'UPDATE_TARIFF', payload: { id, updates } });
  };

  const deleteTariff = (id: string) => {
    dispatch({ type: 'DELETE_TARIFF', payload: id });
  };

  const generateBill = (billOrParams: GenerateBillInput): Bill => {
    let finalBill: Bill;

    if ('billId' in billOrParams && 'energyCharges' in billOrParams) {
      // It's already a constructed Bill object
      finalBill = billOrParams as Bill;
      // Verify duplicate protection
      if (
        state.bills.some(
          b =>
            b.id !== finalBill.id &&
            b.consumerId === finalBill.consumerId &&
            b.billingPeriod.trim().toLowerCase() === finalBill.billingPeriod.trim().toLowerCase()
        )
      ) {
        throw new Error(
          `Bill already exists for this consumer and billing period (${finalBill.billingPeriod}).`
        );
      }
    } else {
      // Use pure billingService creation engine
      const params = billOrParams as Omit<GenerateBillParams, 'tariffs' | 'existingBills'> & {
        connectionType?: ConnectionType;
        tariffs?: TariffSlab[];
        existingBills?: Bill[];
      };

      const consumer = state.consumers.find(
        c => c.consumerId === params.consumerId || c.id === params.consumerId
      );
      const connectionType = params.connectionType || consumer?.connectionType || 'RESIDENTIAL';

      finalBill = createBill({
        ...params,
        connectionType,
        existingBills: params.existingBills || state.bills,
        tariffs: params.tariffs || state.tariffs,
      });
    }

    dispatch({ type: 'GENERATE_BILL', payload: finalBill });

    // Also add notification for bill generation
    dispatch({
      type: 'ADD_NOTIFICATION',
      payload: {
        id: `N-${Date.now()}`,
        title: 'New Bill Generated',
        message: `Bill ${finalBill.billId} generated for ${finalBill.consumerName} (${finalBill.billingPeriod}). Total: ₹${finalBill.totalAmount}`,
        type: 'SUCCESS',
        read: false,
        createdAt: new Date().toISOString(),
      },
    });

    return finalBill;
  };

  const updateBillStatus = (id: string, status: BillStatus) => {
    dispatch({ type: 'UPDATE_BILL_STATUS', payload: { id, status } });
  };

  const recordPayment = (
    paymentData: Omit<Payment, 'id' | 'paymentId' | 'paidAt'>
  ): Payment => {
    const id = `PAY-${String(state.payments.length + 1).padStart(3, '0')}`;
    const paymentId = `TXN-2026-${String(1000 + state.payments.length + 1)}`;
    const newPayment: Payment = {
      ...paymentData,
      id,
      paymentId,
      paidAt: new Date().toISOString(),
    };
    dispatch({ type: 'RECORD_PAYMENT', payload: newPayment });
    return newPayment;
  };

  const addUser = (data: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): User => {
    const id = `USR-${String(state.users.length + 1).padStart(3, '0')}`;
    const newUser: User = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_USER', payload: newUser });
    return newUser;
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER', payload: { id, updates } });
  };

  const deleteUser = (id: string) => {
    dispatch({ type: 'DELETE_USER', payload: id });
  };

  const addConsumptionRecord = (
    record: Omit<ConsumptionRecord, 'id' | 'recordedAt'>
  ): ConsumptionRecord => {
    const id = `CR-${String(state.consumptionRecords.length + 1).padStart(2, '0')}`;
    const newRecord: ConsumptionRecord = {
      ...record,
      id,
      recordedAt: new Date().toISOString().split('T')[0],
    };
    dispatch({ type: 'ADD_CONSUMPTION_RECORD', payload: newRecord });
    return newRecord;
  };

  const markNotificationRead = (id: string) => {
    dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id });
  };

  const resetState = () => {
    dispatch({ type: 'RESET_STATE' });
  };

  // Derive dynamic bill statuses (e.g. OVERDUE for unpaid bills past due date)
  const activeBills = useMemo(() => {
    return state.bills.map(b => ({
      ...b,
      status: deriveBillStatus(b),
    }));
  }, [state.bills]);

  const contextValue = useMemo(
    () => ({
      state,
      consumers: state.consumers,
      meters: state.meters,
      tariffs: state.tariffs,
      bills: activeBills,
      payments: state.payments,
      users: state.users,
      consumptionRecords: state.consumptionRecords,
      notifications: state.notifications,
      monthlyStats: state.monthlyStats,
      dashboardStats: state.dashboardStats,
      backendSyncStatus,
      isBackendConnected,
      addConsumer,
      updateConsumer,
      deleteConsumer,
      addMeter,
      updateMeter,
      recordMeterReading,
      addTariff,
      updateTariff,
      deleteTariff,
      generateBill,
      updateBillStatus,
      recordPayment,
      addUser,
      updateUser,
      deleteUser,
      addConsumptionRecord,
      markNotificationRead,
      resetState,
    }),
    [state, activeBills, backendSyncStatus, isBackendConnected]
  );

  return <AppStateContext.Provider value={contextValue}>{children}</AppStateContext.Provider>;
};

export const useAppState = (): AppStateContextType => {
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return context;
};
