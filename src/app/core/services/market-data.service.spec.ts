import { describe, it, expect, beforeEach } from 'vitest';
import { MarketDataService } from './market-data.service';

describe('MarketDataService', () => {
  let service: MarketDataService;

  beforeEach(() => {
    service = new MarketDataService();
  });

  it('should load initial fallback report for La Guindalera', () => {
    const report = service.report();
    expect(report.postalCode).toBe('28028');
    expect(report.currentRealPricePerM2).toBe(7150);
    expect(report.currentAskingPricePerM2).toBe(7820);
    expect(report.trend).toBe('stagnating');
    expect(report.historicalSeries.length).toBeGreaterThanOrEqual(18);
  });

  it('should accurately calculate recommended counter-offer and ITP savings', () => {
    // If an agency asks 600,000 € in La Guindalera, with an average negotiation discount of 8.57%:
    // Recommended offer: 600,000 * (1 - 0.0857) = 548,580 €
    // Cash savings: 51,420 €
    // ITP savings (6% in Madrid): 51,420 * 0.06 = 3,085 €
    const calc = service.calculateRecommendedOffer(600000);

    expect(calc.askingPrice).toBe(600000);
    expect(calc.discountPercent).toBeCloseTo(8.57, 1);
    expect(calc.recommendedOffer).toBe(548580);
    expect(calc.cashSavings).toBe(51420);
    expect(calc.itpSavings).toBe(3085);
    expect(calc.totalSavings).toBe(54505);
  });

  it('should support custom discount percentage', () => {
    const calc = service.calculateRecommendedOffer(500000, 10.0);

    expect(calc.recommendedOffer).toBe(450000);
    expect(calc.cashSavings).toBe(50000);
    expect(calc.itpSavings).toBe(3000);
    expect(calc.totalSavings).toBe(53000);
  });
});

