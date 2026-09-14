import { describe, it, expect, beforeEach } from 'vitest';
import { RenovationCalculatorService } from './renovation-calculator.service';
import { RenovationInputs, DEFAULT_RENOVATION_INPUTS } from '../models/renovation.model';

describe('RenovationCalculatorService', () => {
  let service: RenovationCalculatorService;

  beforeEach(() => {
    service = new RenovationCalculatorService();
  });

  it('should calculate defaults accurately for a 120m² flat in Madrid with medium quality', () => {
    // 120 m² * 1100 €/m² = 132,000 € net base
    // IVA 10% = 13,200 €
    // ICIO 4% = 5,280 €
    // Total renovation = 150,480 €
    const result = service.calculate(DEFAULT_RENOVATION_INPUTS, 540000, 36000);

    expect(result.squareMeters).toBe(120);
    expect(result.netBaseBudget).toBe(132000);
    expect(result.vatAmount).toBe(13200);
    expect(result.icioAmount).toBe(5280);
    expect(result.totalRenovationCost).toBe(150480);
    expect(result.costPerSqMeterWithTaxes).toBe(1254);
    expect(result.unfinancedRenovationAmount).toBe(150480);
    expect(result.financedRenovationAmount).toBe(0);

    // Projected market value: 120 m² * 7300 €/m² = 876,000 €
    // Total operation: 540,000 + 36,000 + 150,480 = 726,480 €
    // Net Equity: 876,000 - 726,480 = 149,520 €
    expect(result.projectedMarketValue).toBe(876000);
    expect(result.totalOperationCost).toBe(726480);
    expect(result.netEquityCreated).toBe(149520);
    expect(result.equityPercentage).toBeCloseTo(20.58, 1);
  });

  it('should support custom square meters flexibly (e.g. 85m² or 150m²)', () => {
    const inputs: RenovationInputs = {
      ...DEFAULT_RENOVATION_INPUTS,
      squareMeters: 85,
      costPerSquareMeter: 1000,
    };

    const result = service.calculate(inputs);

    // 85 m² * 1000 = 85,000 net base
    // IVA 10% = 8,500
    // ICIO 4% = 3,400
    // Total = 96,900
    expect(result.squareMeters).toBe(85);
    expect(result.netBaseBudget).toBe(85000);
    expect(result.vatAmount).toBe(8500);
    expect(result.icioAmount).toBe(3400);
    expect(result.totalRenovationCost).toBe(96900);
  });

  it('should calculate mortgage financing of renovation (Hipoteca Compra + Reforma)', () => {
    const inputs: RenovationInputs = {
      ...DEFAULT_RENOVATION_INPUTS,
      squareMeters: 100,
      costPerSquareMeter: 1000,
      financeRenovation: true,
      renovationFinancingPercentage: 80,
    };

    const result = service.calculate(inputs);

    // 100 * 1000 = 100,000
    // + 10% IVA (10,000) + 4% ICIO (4,000) = 114,000
    // 80% financed = 91,200
    // 20% unfinanced (cash needed) = 22,800
    expect(result.totalRenovationCost).toBe(114000);
    expect(result.financedRenovationAmount).toBe(91200);
    expect(result.unfinancedRenovationAmount).toBe(22800);
  });

  it('should handle disabled or none quality cleanly', () => {
    const inputs: RenovationInputs = {
      ...DEFAULT_RENOVATION_INPUTS,
      enabled: false,
    };

    const result = service.calculate(inputs, 500000, 30000);

    expect(result.totalRenovationCost).toBe(0);
    expect(result.netBaseBudget).toBe(0);
    expect(result.vatAmount).toBe(0);
    expect(result.icioAmount).toBe(0);
    expect(result.totalOperationCost).toBe(530000);
  });
});

