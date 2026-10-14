// ============================================================
// SMART BILLING — Electricity Billing Calculation Engine
// Cycle 3: Pure business logic module, independent of React/DOM.
// Can be directly mapped to Spring Boot backend services in future.
// ============================================================

import type {
  TariffSlab,
  Bill,
  ConnectionType,
  BillStatus,
  SlabBreakdownItem,
} from '../types';

export const BILLING_TAX_RATE = 0.10; // 10% standard electricity tax/duty
export const DEFAULT_SURCHARGE = 0.00; // Standard surcharge for regular bills

/**
 * Reusable precision rounding to exactly 2 decimal places.
 */
export function roundToTwoDecimals(val: number): number {
  return Math.round((val + Number.EPSILON) * 100) / 100;
}

export interface BillingCalculationResult {
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
  connectionType: ConnectionType;
}

export interface CalculateBillParams {
  previousReading: number;
  currentReading: number;
  connectionType: ConnectionType;
  tariffs: TariffSlab[];
  taxRate?: number;
  surcharge?: number;
}

export interface GenerateBillParams {
  consumerId: string;
  consumerName: string;
  meterId?: string;
  meterNumber: string;
  connectionType: ConnectionType;
  billingPeriod: string;
  billingPeriodFrom?: string;
  billingPeriodTo?: string;
  previousReading: number;
  currentReading: number;
  dueDate: string;
  tariffs: TariffSlab[];
  existingBills: Bill[];
  taxRate?: number;
  surcharge?: number;
  customId?: string;
}

/**
 * Validates and calculates consumption units.
 * Throws validation error if current reading is less than previous reading.
 */
export function calculateConsumption(previousReading: number, currentReading: number): number {
  if (currentReading < previousReading) {
    throw new Error(
      `Current reading (${currentReading} kWh) cannot be less than previous reading (${previousReading} kWh).`
    );
  }
  return currentReading - previousReading;
}

/**
 * Retrieves and sorts active tariff slabs for a specific connection category.
 */
export function getActiveTariffSlabs(tariffs: TariffSlab[], category: ConnectionType): TariffSlab[] {
  return tariffs
    .filter(t => t.connectionType === category && t.status === 'ACTIVE')
    .sort((a, b) => a.slabFrom - b.slabFrom);
}

/**
 * Deterministic progressive slab electricity bill calculator.
 * Strictly calculates energy charges slab-by-slab, adds fixed charge, tax, and surcharge.
 */
export function calculateBill(params: CalculateBillParams): BillingCalculationResult {
  const {
    previousReading,
    currentReading,
    connectionType,
    tariffs,
    taxRate = BILLING_TAX_RATE,
    surcharge = DEFAULT_SURCHARGE,
  } = params;

  // 1. Validation: Reading progression
  const unitsConsumed = calculateConsumption(previousReading, currentReading);

  // 2. Filter & sort active tariffs for consumer category
  const activeSlabs = getActiveTariffSlabs(tariffs, connectionType);

  if (activeSlabs.length === 0) {
    throw new Error(`No active tariff is configured for this consumer category (${connectionType}).`);
  }

  // 3. Progressive Slab Calculation
  let unitsRemaining = unitsConsumed;
  let energyCharges = 0;
  const slabBreakdown: SlabBreakdownItem[] = [];

  // Fixed charge is derived from the applicable active tariff category
  const fixedCharge = roundToTwoDecimals(activeSlabs[0].fixedCharge);

  if (unitsConsumed === 0) {
    // Edge case: 0 units consumed
    const firstSlab = activeSlabs[0];
    slabBreakdown.push({
      slabId: firstSlab.id,
      slabName: firstSlab.name,
      slabRange:
        firstSlab.slabTo === 0
          ? 'All units (Unbounded)'
          : `${firstSlab.slabFrom}–${firstSlab.slabTo} units`,
      unitsInSlab: 0,
      ratePerUnit: firstSlab.ratePerUnit,
      amount: 0,
    });
  } else {
    for (const slab of activeSlabs) {
      if (unitsRemaining <= 0) break;

      // Determine the unit capacity of this slab
      let slabCapacity: number;
      if (slab.slabTo === 0 || slab.slabTo === Infinity || slab.slabTo == null) {
        // Unbounded final slab (e.g., above 500 units)
        slabCapacity = Infinity;
      } else if (slab.slabFrom === 0) {
        // Initial slab starting at 0 (e.g. 0 to 100 units = 100 units)
        slabCapacity = slab.slabTo;
      } else {
        // Intermediate slab (e.g. 101 to 200 units = 100 units)
        slabCapacity = slab.slabTo - slab.slabFrom + 1;
      }

      const unitsInSlab = Math.min(unitsRemaining, slabCapacity);
      const amount = roundToTwoDecimals(unitsInSlab * slab.ratePerUnit);

      energyCharges = roundToTwoDecimals(energyCharges + amount);
      unitsRemaining -= unitsInSlab;

      const slabRange =
        slab.slabTo === 0
          ? slab.slabFrom === 0
            ? 'All units'
            : `Above ${slab.slabFrom - 1} units`
          : `${slab.slabFrom}–${slab.slabTo} units`;

      slabBreakdown.push({
        slabId: slab.id,
        slabName: slab.name,
        slabRange,
        unitsInSlab,
        ratePerUnit: slab.ratePerUnit,
        amount,
      });
    }
  }

  // 4. Subtotal, Tax, Surcharge & Total Calculation
  const subtotal = roundToTwoDecimals(energyCharges + fixedCharge);
  const tax = roundToTwoDecimals(subtotal * taxRate);
  const cleanSurcharge = roundToTwoDecimals(surcharge);
  const totalAmount = roundToTwoDecimals(subtotal + tax + cleanSurcharge);

  return {
    previousReading,
    currentReading,
    unitsConsumed,
    energyCharges,
    fixedCharge,
    taxRate,
    tax,
    surcharge: cleanSurcharge,
    totalAmount,
    slabBreakdown,
    connectionType,
  };
}

/**
 * Checks whether a bill already exists for the consumer and billing period.
 * Prevents duplicate billing.
 */
export function checkDuplicateBill(
  bills: Bill[],
  consumerId: string,
  billingPeriod: string
): boolean {
  const cleanPeriod = billingPeriod.trim().toLowerCase();
  const cleanConsId = consumerId.trim().toLowerCase();

  return bills.some(
    b =>
      (b.consumerId.trim().toLowerCase() === cleanConsId ||
        (b as any).consumerCode?.trim().toLowerCase() === cleanConsId) &&
      b.billingPeriod.trim().toLowerCase() === cleanPeriod
  );
}

/**
 * Generates an incremental unique bill number.
 * Format: BILL-2026-000001
 */
export function generateBillNumber(existingBillsCount: number): string {
  const year = new Date().getFullYear();
  const sequence = String(existingBillsCount + 1).padStart(6, '0');
  return `BILL-${year}-${sequence}`;
}

/**
 * Derives current bill status, automatically flagging unpaid bills past due date as OVERDUE.
 */
export function deriveBillStatus(bill: Bill, asOfDate: Date = new Date()): BillStatus {
  if (bill.status === 'PAID') return 'PAID';
  if (bill.status === 'CANCELLED') return 'CANCELLED';

  const dueDateObj = new Date(bill.dueDate);
  // Compare date only (end of due day)
  dueDateObj.setHours(23, 59, 59, 999);

  if (asOfDate > dueDateObj) {
    return 'OVERDUE';
  }

  return bill.status;
}

/**
 * Complete bill generator function.
 * Validates readings, checks duplicates, calculates charges, and returns a fully formed Bill object.
 */
export function createBill(params: GenerateBillParams): Bill {
  const {
    consumerId,
    consumerName,
    meterId,
    meterNumber,
    connectionType,
    billingPeriod,
    billingPeriodFrom = '2026-10-01',
    billingPeriodTo = '2026-10-31',
    previousReading,
    currentReading,
    dueDate,
    tariffs,
    existingBills,
    taxRate = BILLING_TAX_RATE,
    surcharge = DEFAULT_SURCHARGE,
    customId,
  } = params;

  // Duplicate bill check
  if (checkDuplicateBill(existingBills, consumerId, billingPeriod)) {
    throw new Error(`Bill already exists for this consumer and billing period (${billingPeriod}).`);
  }

  // Calculate bill using progressive billing engine
  const calc = calculateBill({
    previousReading,
    currentReading,
    connectionType,
    tariffs,
    taxRate,
    surcharge,
  });

  const billId = generateBillNumber(existingBills.length);
  const id = customId || `B-${String(existingBills.length + 1).padStart(3, '0')}`;
  const now = new Date().toISOString();

  const rawBill: Bill = {
    id,
    billId,
    billNumber: billId,
    consumerId,
    consumerName,
    meterId,
    meterNumber,
    billingPeriod,
    billingPeriodFrom,
    billingPeriodTo,
    previousReading: calc.previousReading,
    currentReading: calc.currentReading,
    unitsConsumed: calc.unitsConsumed,
    energyCharges: calc.energyCharges,
    fixedCharge: calc.fixedCharge,
    taxRate: calc.taxRate,
    tax: calc.tax,
    surcharge: calc.surcharge,
    totalAmount: calc.totalAmount,
    dueDate,
    status: 'UNPAID',
    generatedAt: now,
    createdAt: now,
    connectionType,
    slabBreakdown: calc.slabBreakdown,
  };

  // Evaluate if already overdue based on due date
  rawBill.status = deriveBillStatus(rawBill);

  return rawBill;
}

/**
 * On-the-fly slab breakdown calculator for existing/historical bills.
 * Ensures bill breakdown view always transparently displays slab calculation.
 */
export function getBillSlabBreakdown(bill: Bill, tariffs: TariffSlab[]): SlabBreakdownItem[] {
  if (bill.slabBreakdown && bill.slabBreakdown.length > 0) {
    return bill.slabBreakdown;
  }

  const category: ConnectionType = bill.connectionType || 'RESIDENTIAL';
  try {
    const calc = calculateBill({
      previousReading: bill.previousReading,
      currentReading: bill.currentReading,
      connectionType: category,
      tariffs,
    });
    return calc.slabBreakdown;
  } catch {
    return [
      {
        slabId: 'SLAB-DEFAULT',
        slabName: 'Standard Rate',
        slabRange: '0–∞ units',
        unitsInSlab: bill.unitsConsumed,
        ratePerUnit: roundToTwoDecimals(bill.energyCharges / (bill.unitsConsumed || 1)),
        amount: bill.energyCharges,
      },
    ];
  }
}
