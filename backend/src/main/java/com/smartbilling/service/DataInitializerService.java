package com.smartbilling.service;

import com.smartbilling.entity.*;
import com.smartbilling.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Service
public class DataInitializerService implements CommandLineRunner {

    private final UserRepository userRepository;
    private final ConsumerRepository consumerRepository;
    private final MeterRepository meterRepository;
    private final TariffSlabRepository tariffSlabRepository;
    private final BillRepository billRepository;

    public DataInitializerService(UserRepository userRepository,
                                  ConsumerRepository consumerRepository,
                                  MeterRepository meterRepository,
                                  TariffSlabRepository tariffSlabRepository,
                                  BillRepository billRepository) {
        this.userRepository = userRepository;
        this.consumerRepository = consumerRepository;
        this.meterRepository = meterRepository;
        this.tariffSlabRepository = tariffSlabRepository;
        this.billRepository = billRepository;
    }

    @Override
    public void run(String... args) {
        if (tariffSlabRepository.count() > 0) {
            return; // Already seeded
        }

        // 1. Seed Users
        userRepository.save(new User("System Administrator", "admin@smartbilling.com", "admin123", "ADMIN"));
        userRepository.save(new User("Meera Pillai", "clerk@smartbilling.com", "clerk123", "BILLING_CLERK"));
        userRepository.save(new User("Rahul Kumar", "rahul@smartbilling.com", "consumer123", "CONSUMER"));

        // 2. Seed Tariff Slabs (Matching Cycle 1-3 baseline)
        LocalDate eff = LocalDate.of(2026, 1, 1);

        // Residential Slabs
        tariffSlabRepository.save(new TariffSlab("Residential Slab 1 (0–100)", "RESIDENTIAL", 0, 100, new BigDecimal("3.15"), new BigDecimal("25.00"), eff));
        tariffSlabRepository.save(new TariffSlab("Residential Slab 2 (101–200)", "RESIDENTIAL", 101, 200, new BigDecimal("4.95"), new BigDecimal("25.00"), eff));
        tariffSlabRepository.save(new TariffSlab("Residential Slab 3 (Above 200)", "RESIDENTIAL", 201, 0, new BigDecimal("6.70"), new BigDecimal("25.00"), eff));

        // Commercial Slabs
        tariffSlabRepository.save(new TariffSlab("Commercial Slab 1 (0–200)", "COMMERCIAL", 0, 200, new BigDecimal("7.20"), new BigDecimal("100.00"), eff));
        tariffSlabRepository.save(new TariffSlab("Commercial Slab 2 (Above 200)", "COMMERCIAL", 201, 0, new BigDecimal("9.50"), new BigDecimal("100.00"), eff));

        // Industrial Slabs
        tariffSlabRepository.save(new TariffSlab("Industrial Slab 1 (0–500)", "INDUSTRIAL", 0, 500, new BigDecimal("8.80"), new BigDecimal("500.00"), eff));
        tariffSlabRepository.save(new TariffSlab("Industrial Slab 2 (Above 500)", "INDUSTRIAL", 501, 0, new BigDecimal("11.20"), new BigDecimal("500.00"), eff));

        // Agricultural Slabs
        tariffSlabRepository.save(new TariffSlab("Agricultural Flat (All Units)", "AGRICULTURAL", 0, 0, new BigDecimal("1.50"), BigDecimal.ZERO, eff));

        // 3. Seed Consumers
        Consumer c1 = consumerRepository.save(new Consumer("C10234", "Rahul Kumar", "rahul@smartbilling.com", "+91 98765 43210", "42, 4th Cross, Indiranagar, Bengaluru - 560038", "RESIDENTIAL"));
        Consumer c2 = consumerRepository.save(new Consumer("C10235", "Priya Sharma", "priya.sharma@example.com", "+91 98111 22334", "15, MG Road, Ashok Nagar, Bengaluru - 560025", "RESIDENTIAL"));
        Consumer c3 = consumerRepository.save(new Consumer("C10236", "Apex Textiles Pvt Ltd", "billing@apextextiles.com", "+91 98450 11223", "Plot 88, Peenya Industrial Area, Bengaluru - 560058", "COMMERCIAL"));
        Consumer c4 = consumerRepository.save(new Consumer("C10237", "Bharat Steel Works", "accounts@bharatsteel.in", "+91 94480 99887", "Plot 12, KIADB Phase 2, Bommasandra - 560099", "INDUSTRIAL"));
        Consumer c5 = consumerRepository.save(new Consumer("C10238", "Kisan Green Farms", "ramesh.patel@kisanfarms.in", "+91 97400 55667", "Sy No 45, Devanahalli Rural, Bengaluru - 562110", "AGRICULTURAL"));

        // 4. Seed Meters
        Meter m1 = meterRepository.save(new Meter("MTR-BLR-00124", c1, 15482L, 15232L, "SMART"));
        Meter m2 = meterRepository.save(new Meter("MTR-BLR-00125", c2, 8740L, 8560L, "SINGLE_PHASE"));
        Meter m3 = meterRepository.save(new Meter("MTR-BLR-00126", c3, 45200L, 43900L, "THREE_PHASE"));
        Meter m4 = meterRepository.save(new Meter("MTR-BLR-00127", c4, 189400L, 182100L, "THREE_PHASE"));
        Meter m5 = meterRepository.save(new Meter("MTR-BLR-00128", c5, 12450L, 11800L, "PREPAID"));

        // 5. Seed Initial Baseline Bills
        Bill bill1 = new Bill();
        bill1.setBillNumber("BILL-2026-000001");
        bill1.setConsumer(c1);
        bill1.setMeter(m1);
        bill1.setBillingPeriod("September 2026");
        bill1.setPreviousReading(15232L);
        bill1.setCurrentReading(15482L);
        bill1.setUnitsConsumed(250L);
        bill1.setEnergyCharges(new BigDecimal("1145.00"));
        bill1.setFixedCharge(new BigDecimal("25.00"));
        bill1.setTaxRate(new BigDecimal("0.10"));
        bill1.setTax(new BigDecimal("117.00"));
        bill1.setSurcharge(BigDecimal.ZERO);
        bill1.setTotalAmount(new BigDecimal("1287.00"));
        bill1.setStatus("PAID");
        bill1.setDueDate(LocalDate.of(2026, 10, 15));
        bill1.setCreatedAt(LocalDateTime.of(2026, 10, 1, 10, 0));

        bill1.addSlabBreakdown(new BillSlabBreakdown("Residential Slab 1 (0–100)", "0–100 units", 100L, new BigDecimal("3.15"), new BigDecimal("315.00")));
        bill1.addSlabBreakdown(new BillSlabBreakdown("Residential Slab 2 (101–200)", "101–200 units", 100L, new BigDecimal("4.95"), new BigDecimal("495.00")));
        bill1.addSlabBreakdown(new BillSlabBreakdown("Residential Slab 3 (Above 200)", "Above 200 units", 50L, new BigDecimal("6.70"), new BigDecimal("335.00")));
        billRepository.save(bill1);

        Bill bill2 = new Bill();
        bill2.setBillNumber("BILL-2026-000002");
        bill2.setConsumer(c2);
        bill2.setMeter(m2);
        bill2.setBillingPeriod("September 2026");
        bill2.setPreviousReading(8560L);
        bill2.setCurrentReading(8740L);
        bill2.setUnitsConsumed(180L);
        bill2.setEnergyCharges(new BigDecimal("711.00"));
        bill2.setFixedCharge(new BigDecimal("25.00"));
        bill2.setTaxRate(new BigDecimal("0.10"));
        bill2.setTax(new BigDecimal("73.60"));
        bill2.setSurcharge(BigDecimal.ZERO);
        bill2.setTotalAmount(new BigDecimal("809.60"));
        bill2.setStatus("UNPAID");
        bill2.setDueDate(LocalDate.of(2026, 10, 20));
        bill2.setCreatedAt(LocalDateTime.of(2026, 10, 1, 11, 30));

        bill2.addSlabBreakdown(new BillSlabBreakdown("Residential Slab 1 (0–100)", "0–100 units", 100L, new BigDecimal("3.15"), new BigDecimal("315.00")));
        bill2.addSlabBreakdown(new BillSlabBreakdown("Residential Slab 2 (101–200)", "101–200 units", 80L, new BigDecimal("4.95"), new BigDecimal("396.00")));
        billRepository.save(bill2);
    }
}
