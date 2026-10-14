// ============================================================
// SMART BILLING — Cycle 3 Billing Engine Verification Tests
// ============================================================

import {
  calculateBill,
  createBill,
  deriveBillStatus,
} from './billingService';
import { mockTariffs } from '../data/mockData';
import type { Bill } from '../types';

export function runAllBillingTests() {
  const results: { test: string; status: 'PASSED' | 'FAILED'; details: string }[] = [];

  // TEST 1 — ZERO UNITS
  try {
    const res1 = calculateBill({
      previousReading: 1000,
      currentReading: 1000,
      connectionType: 'RESIDENTIAL',
      tariffs: mockTariffs,
    });
    const pass1 = res1.unitsConsumed === 0 && res1.energyCharges === 0 && res1.fixedCharge === 25 && res1.totalAmount === 27.5;
    results.push({
      test: 'TEST 1 — ZERO UNITS',
      status: pass1 ? 'PASSED' : 'FAILED',
      details: `Units: ${res1.unitsConsumed}, Energy: ₹${res1.energyCharges}, Total: ₹${res1.totalAmount}`,
    });
  } catch (e: any) {
    results.push({ test: 'TEST 1 — ZERO UNITS', status: 'FAILED', details: e.message });
  }

  // TEST 2 — SINGLE SLAB
  try {
    const res2 = calculateBill({
      previousReading: 1000,
      currentReading: 1200,
      connectionType: 'COMMERCIAL',
      tariffs: mockTariffs,
    });
    const pass2 = res2.unitsConsumed === 200 && res2.energyCharges === 1440 && res2.fixedCharge === 100 && res2.totalAmount === 1694;
    results.push({
      test: 'TEST 2 — SINGLE SLAB',
      status: pass2 ? 'PASSED' : 'FAILED',
      details: `Units: ${res2.unitsConsumed}, Energy: ₹${res2.energyCharges}, Total: ₹${res2.totalAmount}`,
    });
  } catch (e: any) {
    results.push({ test: 'TEST 2 — SINGLE SLAB', status: 'FAILED', details: e.message });
  }

  // TEST 3 — MULTIPLE SLABS
  try {
    const res3 = calculateBill({
      previousReading: 1000,
      currentReading: 1250,
      connectionType: 'RESIDENTIAL',
      tariffs: mockTariffs,
    });
    const pass3 = res3.unitsConsumed === 250 && res3.energyCharges === 1145 && res3.fixedCharge === 25 && res3.totalAmount === 1287 && res3.slabBreakdown.length === 3;
    results.push({
      test: 'TEST 3 — MULTIPLE SLABS',
      status: pass3 ? 'PASSED' : 'FAILED',
      details: `Slabs used: ${res3.slabBreakdown.length}, Energy: ₹${res3.energyCharges}, Total: ₹${res3.totalAmount}`,
    });
  } catch (e: any) {
    results.push({ test: 'TEST 3 — MULTIPLE SLABS', status: 'FAILED', details: e.message });
  }

  // TEST 4 — EXACT SLAB BOUNDARY
  try {
    const res4 = calculateBill({
      previousReading: 1000,
      currentReading: 1100,
      connectionType: 'RESIDENTIAL',
      tariffs: mockTariffs,
    });
    const pass4 = res4.unitsConsumed === 100 && res4.energyCharges === 315 && res4.slabBreakdown.length === 1;
    results.push({
      test: 'TEST 4 — EXACT SLAB BOUNDARY',
      status: pass4 ? 'PASSED' : 'FAILED',
      details: `Units: ${res4.unitsConsumed}, Energy: ₹${res4.energyCharges}`,
    });
  } catch (e: any) {
    results.push({ test: 'TEST 4 — EXACT SLAB BOUNDARY', status: 'FAILED', details: e.message });
  }

  // TEST 5 — JUST ABOVE BOUNDARY
  try {
    const res5 = calculateBill({
      previousReading: 1000,
      currentReading: 1101,
      connectionType: 'RESIDENTIAL',
      tariffs: mockTariffs,
    });
    const pass5 = res5.unitsConsumed === 101 && res5.energyCharges === 320 && res5.slabBreakdown.length === 2;
    results.push({
      test: 'TEST 5 — JUST ABOVE BOUNDARY',
      status: pass5 ? 'PASSED' : 'FAILED',
      details: `Units: ${res5.unitsConsumed}, Energy: ₹${res5.energyCharges}`,
    });
  } catch (e: any) {
    results.push({ test: 'TEST 5 — JUST ABOVE BOUNDARY', status: 'FAILED', details: e.message });
  }

  // TEST 6 — INVALID READING
  try {
    calculateBill({
      previousReading: 1500,
      currentReading: 1400,
      connectionType: 'RESIDENTIAL',
      tariffs: mockTariffs,
    });
    results.push({ test: 'TEST 6 — INVALID READING', status: 'FAILED', details: 'Should have thrown error' });
  } catch (e: any) {
    results.push({
      test: 'TEST 6 — INVALID READING',
      status: 'PASSED',
      details: `Caught error: "${e.message}"`,
    });
  }

  // TEST 7 — MISSING TARIFF
  try {
    calculateBill({
      previousReading: 1000,
      currentReading: 1200,
      connectionType: 'RESIDENTIAL',
      tariffs: [],
    });
    results.push({ test: 'TEST 7 — MISSING TARIFF', status: 'FAILED', details: 'Should have thrown error' });
  } catch (e: any) {
    results.push({
      test: 'TEST 7 — MISSING TARIFF',
      status: 'PASSED',
      details: `Caught error: "${e.message}"`,
    });
  }

  // TEST 8 — DUPLICATE BILL
  try {
    const existingBills: Bill[] = [
      {
        id: 'B-001',
        billId: 'BILL-2026-001',
        consumerId: 'C10234',
        consumerName: 'Rahul Kumar',
        meterNumber: 'MTR-BLR-00124',
        billingPeriod: 'September 2026',
        billingPeriodFrom: '2026-09-01',
        billingPeriodTo: '2026-09-30',
        previousReading: 1000,
        currentReading: 1250,
        unitsConsumed: 250,
        energyCharges: 1145,
        fixedCharge: 25,
        tax: 117,
        surcharge: 0,
        totalAmount: 1287,
        dueDate: '2026-10-15',
        status: 'UNPAID',
        generatedAt: '2026-10-01',
      },
    ];

    createBill({
      consumerId: 'C10234',
      consumerName: 'Rahul Kumar',
      meterNumber: 'MTR-BLR-00124',
      connectionType: 'RESIDENTIAL',
      billingPeriod: 'September 2026',
      previousReading: 1250,
      currentReading: 1500,
      dueDate: '2026-11-15',
      tariffs: mockTariffs,
      existingBills,
    });
    results.push({ test: 'TEST 8 — DUPLICATE BILL', status: 'FAILED', details: 'Should have thrown duplicate error' });
  } catch (e: any) {
    results.push({
      test: 'TEST 8 — DUPLICATE BILL',
      status: 'PASSED',
      details: `Caught error: "${e.message}"`,
    });
  }

  // TEST 9 — DEMO PAYMENT
  try {
    const newBill = createBill({
      consumerId: 'C10234',
      consumerName: 'Rahul Kumar',
      meterNumber: 'MTR-BLR-00124',
      connectionType: 'RESIDENTIAL',
      billingPeriod: 'November 2026',
      previousReading: 1250,
      currentReading: 1500,
      dueDate: '2026-12-15',
      tariffs: mockTariffs,
      existingBills: [],
    });
    const initiallyUnpaid = newBill.status === 'UNPAID';
    newBill.status = 'PAID';
    results.push({
      test: 'TEST 9 — DEMO PAYMENT',
      status: initiallyUnpaid && newBill.status === 'PAID' ? 'PASSED' : 'FAILED',
      details: `Status transition: UNPAID -> PAID`,
    });
  } catch (e: any) {
    results.push({ test: 'TEST 9 — DEMO PAYMENT', status: 'FAILED', details: e.message });
  }

  // TEST 10 — OVERDUE
  try {
    const pastBill: Bill = {
      id: 'B-OLD',
      billId: 'BILL-2026-OLD',
      consumerId: 'C10234',
      consumerName: 'Rahul Kumar',
      meterNumber: 'MTR-BLR-00124',
      billingPeriod: 'August 2026',
      billingPeriodFrom: '2026-08-01',
      billingPeriodTo: '2026-08-31',
      previousReading: 1000,
      currentReading: 1200,
      unitsConsumed: 200,
      energyCharges: 815,
      fixedCharge: 25,
      tax: 84,
      surcharge: 0,
      totalAmount: 924,
      dueDate: '2026-09-15',
      status: 'UNPAID',
      generatedAt: '2026-09-01',
    };
    const derived = deriveBillStatus(pastBill);
    results.push({
      test: 'TEST 10 — OVERDUE',
      status: derived === 'OVERDUE' ? 'PASSED' : 'FAILED',
      details: `Due: ${pastBill.dueDate} -> Derived: ${derived}`,
    });
  } catch (e: any) {
    results.push({ test: 'TEST 10 — OVERDUE', status: 'FAILED', details: e.message });
  }

  return results;
}
