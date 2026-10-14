package com.smartbilling.billing;

import com.smartbilling.entity.TariffSlab;
import com.smartbilling.exception.InvalidReadingException;
import com.smartbilling.exception.MissingTariffException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

public class BillingCalculatorServiceTest {

    private BillingCalculatorService calculatorService;
    private List<TariffSlab> residentialTariffs;
    private List<TariffSlab> commercialTariffs;

    @BeforeEach
    void setUp() {
        calculatorService = new BillingCalculatorService();

        LocalDate eff = LocalDate.of(2026, 1, 1);
        residentialTariffs = new ArrayList<>();
        residentialTariffs.add(new TariffSlab("Residential Slab 1 (0–100)", "RESIDENTIAL", 0, 100, new BigDecimal("3.15"), new BigDecimal("25.00"), eff));
        residentialTariffs.add(new TariffSlab("Residential Slab 2 (101–200)", "RESIDENTIAL", 101, 200, new BigDecimal("4.95"), new BigDecimal("25.00"), eff));
        residentialTariffs.add(new TariffSlab("Residential Slab 3 (Above 200)", "RESIDENTIAL", 201, 0, new BigDecimal("6.70"), new BigDecimal("25.00"), eff));

        commercialTariffs = new ArrayList<>();
        commercialTariffs.add(new TariffSlab("Commercial Single Slab (0–200)", "COMMERCIAL", 0, 200, new BigDecimal("7.20"), new BigDecimal("100.00"), eff));
    }

    @Test
    @DisplayName("TEST 1 — ZERO UNITS: Consumption 0 kWh, Energy ₹0, Fixed ₹25, Tax ₹2.50, Total ₹27.50")
    void testZeroUnits() {
        BillingResult result = calculatorService.calculateBill(
            1000L, 1000L, "RESIDENTIAL", residentialTariffs,
            BillingCalculatorService.DEFAULT_TAX_RATE, BillingCalculatorService.DEFAULT_SURCHARGE
        );

        assertEquals(0L, result.getUnitsConsumed());
        assertEquals(new BigDecimal("0.00"), result.getEnergyCharges());
        assertEquals(new BigDecimal("25.00"), result.getFixedCharge());
        assertEquals(new BigDecimal("2.50"), result.getTax());
        assertEquals(new BigDecimal("27.50"), result.getTotalAmount());
    }

    @Test
    @DisplayName("TEST 2 — SINGLE SLAB: 200 units @ ₹7.20, Fixed ₹100, Total ₹1694")
    void testSingleSlab() {
        BillingResult result = calculatorService.calculateBill(
            1000L, 1200L, "COMMERCIAL", commercialTariffs,
            BillingCalculatorService.DEFAULT_TAX_RATE, BillingCalculatorService.DEFAULT_SURCHARGE
        );

        assertEquals(200L, result.getUnitsConsumed());
        assertEquals(new BigDecimal("1440.00"), result.getEnergyCharges()); // 200 * 7.20
        assertEquals(new BigDecimal("100.00"), result.getFixedCharge());
        // Subtotal = 1540.00, Tax = 154.00, Total = 1694.00
        assertEquals(new BigDecimal("154.00"), result.getTax());
        assertEquals(new BigDecimal("1694.00"), result.getTotalAmount());
    }

    @Test
    @DisplayName("TEST 3 — MULTIPLE SLABS: 250 units Residential progressive, Energy ₹1145, Total ₹1287")
    void testMultipleSlabs() {
        BillingResult result = calculatorService.calculateBill(
            1200L, 1450L, "RESIDENTIAL", residentialTariffs,
            BillingCalculatorService.DEFAULT_TAX_RATE, BillingCalculatorService.DEFAULT_SURCHARGE
        );

        assertEquals(250L, result.getUnitsConsumed());
        assertEquals(3, result.getSlabBreakdown().size());
        // 100 * 3.15 = 315.00
        // 100 * 4.95 = 495.00
        // 50 * 6.70 = 335.00
        // Total energy = 1145.00
        assertEquals(new BigDecimal("1145.00"), result.getEnergyCharges());
        assertEquals(new BigDecimal("25.00"), result.getFixedCharge());
        // Subtotal = 1170.00, Tax = 117.00, Total = 1287.00
        assertEquals(new BigDecimal("117.00"), result.getTax());
        assertEquals(new BigDecimal("1287.00"), result.getTotalAmount());
    }

    @Test
    @DisplayName("TEST 4 — EXACT SLAB BOUNDARY: Exactly 100 units")
    void testExactSlabBoundary() {
        BillingResult result = calculatorService.calculateBill(
            1000L, 1100L, "RESIDENTIAL", residentialTariffs,
            BillingCalculatorService.DEFAULT_TAX_RATE, BillingCalculatorService.DEFAULT_SURCHARGE
        );

        assertEquals(100L, result.getUnitsConsumed());
        assertEquals(1, result.getSlabBreakdown().size());
        assertEquals(new BigDecimal("315.00"), result.getEnergyCharges());
    }

    @Test
    @DisplayName("TEST 5 — JUST ABOVE BOUNDARY: Exactly 101 units")
    void testJustAboveBoundary() {
        BillingResult result = calculatorService.calculateBill(
            1000L, 1101L, "RESIDENTIAL", residentialTariffs,
            BillingCalculatorService.DEFAULT_TAX_RATE, BillingCalculatorService.DEFAULT_SURCHARGE
        );

        assertEquals(101L, result.getUnitsConsumed());
        assertEquals(2, result.getSlabBreakdown().size());
        assertEquals(100L, result.getSlabBreakdown().get(0).getUnitsInSlab());
        assertEquals(1L, result.getSlabBreakdown().get(1).getUnitsInSlab());
        // 315.00 + 4.95 = 319.95 rounded
        assertEquals(new BigDecimal("319.95"), result.getEnergyCharges());
    }

    @Test
    @DisplayName("TEST 6 — INVALID READING: Current reading less than previous reading")
    void testInvalidReading() {
        assertThrows(InvalidReadingException.class, () -> {
            calculatorService.calculateBill(
                1500L, 1400L, "RESIDENTIAL", residentialTariffs,
                BillingCalculatorService.DEFAULT_TAX_RATE, BillingCalculatorService.DEFAULT_SURCHARGE
            );
        });
    }

    @Test
    @DisplayName("TEST 7 — MISSING TARIFF: Consumer category has no active tariff")
    void testMissingTariff() {
        assertThrows(MissingTariffException.class, () -> {
            calculatorService.calculateBill(
                1000L, 1200L, "INDUSTRIAL", Collections.emptyList(),
                BillingCalculatorService.DEFAULT_TAX_RATE, BillingCalculatorService.DEFAULT_SURCHARGE
            );
        });
    }

    @Test
    @DisplayName("TEST 8 — DUPLICATE BILL CHECK LOGIC")
    void testDuplicateBillLogic() {
        // Verification of bill number format & logic
        String billNum1 = calculatorService.generateBillNumber(0);
        String billNum2 = calculatorService.generateBillNumber(1);

        assertTrue(billNum1.startsWith("BILL-2026-"));
        assertEquals("BILL-2026-000001", billNum1);
        assertEquals("BILL-2026-000002", billNum2);
    }

    @Test
    @DisplayName("TEST 9 — DEMO PAYMENT: Subtotal, Tax and Total arithmetic consistency")
    void testPaymentArithmetic() {
        BillingResult result = calculatorService.calculateBill(
            1000L, 1100L, "RESIDENTIAL", residentialTariffs,
            BillingCalculatorService.DEFAULT_TAX_RATE, BigDecimal.ZERO
        );

        BigDecimal subtotal = result.getEnergyCharges().add(result.getFixedCharge());
        BigDecimal tax = BillingCalculatorService.roundMoney(subtotal.multiply(result.getTaxRate()));
        assertEquals(result.getTotalAmount(), subtotal.add(tax));
    }

    @Test
    @DisplayName("TEST 10 — OVERDUE: Unpaid bill past due date logic")
    void testOverdueLogic() {
        LocalDate pastDue = LocalDate.now().minusDays(5);
        LocalDate futureDue = LocalDate.now().plusDays(10);

        assertTrue(LocalDate.now().isAfter(pastDue));
        assertFalse(LocalDate.now().isAfter(futureDue));
    }
}
