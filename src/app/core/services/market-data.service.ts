import { Injectable, signal, computed } from '@angular/core';
import { GuindaleraMarketReport, MarketQuarterRecord } from '../models/market-data.model';

const FALLBACK_REPORT: GuindaleraMarketReport = {
  neighborhoodName: 'La Guindalera (Distrito 04 - Salamanca, Madrid)',
  postalCode: '28028',
  currentRealPricePerM2: 7150,
  currentAskingPricePerM2: 7820,
  averageNegotiationDiscount: 8.57,
  annualGrowthRatePercent: 3.62,
  quarterlyGrowthRatePercent: 0.56,
  volumeTrendQuarterlyPercent: -4.2,
  trend: 'stagnating',
  trendDiagnosis:
    'Mercado en fase de meseta y desaceleración. El tiempo medio en venta ha subido a 72 días y el volumen de compraventas se ha contraído un 4,2% intertrimestral, lo que ensancha la brecha de negociación (regateo medio del 8,6%). Oportunidad favorable para compradores con liquidez para apretar en la oferta.',
  euribor: {
    currentMonthly: 2.45,
    historicalAverage12m: 2.88,
    forecastBase: 2.20,
    forecastOptimistic: 1.75,
    forecastPessimistic: 3.65,
    lastUpdated: '2026-09',
  },
  historicalSeries: [
    { period: '2022-T1', year: 2022, quarter: 1, realPricePerM2: 5350, askingPricePerM2: 5850, transactionsCount: 98, daysOnMarket: 48, negotiationSpreadPercent: 8.55 },
    { period: '2022-T2', year: 2022, quarter: 2, realPricePerM2: 5480, askingPricePerM2: 5980, transactionsCount: 105, daysOnMarket: 45, negotiationSpreadPercent: 8.36 },
    { period: '2022-T3', year: 2022, quarter: 3, realPricePerM2: 5560, askingPricePerM2: 6100, transactionsCount: 92, daysOnMarket: 50, negotiationSpreadPercent: 8.85 },
    { period: '2022-T4', year: 2022, quarter: 4, realPricePerM2: 5690, askingPricePerM2: 6240, transactionsCount: 89, daysOnMarket: 52, negotiationSpreadPercent: 8.81 },
    { period: '2023-T1', year: 2023, quarter: 1, realPricePerM2: 5820, askingPricePerM2: 6390, transactionsCount: 84, daysOnMarket: 58, negotiationSpreadPercent: 8.92 },
    { period: '2023-T2', year: 2023, quarter: 2, realPricePerM2: 5950, askingPricePerM2: 6550, transactionsCount: 82, daysOnMarket: 61, negotiationSpreadPercent: 9.16 },
    { period: '2023-T3', year: 2023, quarter: 3, realPricePerM2: 6080, askingPricePerM2: 6700, transactionsCount: 76, daysOnMarket: 65, negotiationSpreadPercent: 9.25 },
    { period: '2023-T4', year: 2023, quarter: 4, realPricePerM2: 6220, askingPricePerM2: 6850, transactionsCount: 79, daysOnMarket: 63, negotiationSpreadPercent: 9.20 },
    { period: '2024-T1', year: 2024, quarter: 1, realPricePerM2: 6350, askingPricePerM2: 6990, transactionsCount: 83, daysOnMarket: 60, negotiationSpreadPercent: 9.16 },
    { period: '2024-T2', year: 2024, quarter: 2, realPricePerM2: 6490, askingPricePerM2: 7150, transactionsCount: 91, daysOnMarket: 55, negotiationSpreadPercent: 9.23 },
    { period: '2024-T3', year: 2024, quarter: 3, realPricePerM2: 6620, askingPricePerM2: 7280, transactionsCount: 86, daysOnMarket: 57, negotiationSpreadPercent: 9.07 },
    { period: '2024-T4', year: 2024, quarter: 4, realPricePerM2: 6750, askingPricePerM2: 7420, transactionsCount: 88, daysOnMarket: 59, negotiationSpreadPercent: 9.03 },
    { period: '2025-T1', year: 2025, quarter: 1, realPricePerM2: 6880, askingPricePerM2: 7560, transactionsCount: 85, daysOnMarket: 63, negotiationSpreadPercent: 8.99 },
    { period: '2025-T2', year: 2025, quarter: 2, realPricePerM2: 6990, askingPricePerM2: 7680, transactionsCount: 81, daysOnMarket: 66, negotiationSpreadPercent: 8.98 },
    { period: '2025-T3', year: 2025, quarter: 3, realPricePerM2: 7060, askingPricePerM2: 7740, transactionsCount: 77, daysOnMarket: 69, negotiationSpreadPercent: 8.79 },
    { period: '2025-T4', year: 2025, quarter: 4, realPricePerM2: 7110, askingPricePerM2: 7790, transactionsCount: 74, daysOnMarket: 70, negotiationSpreadPercent: 8.73 },
    { period: '2026-T1', year: 2026, quarter: 1, realPricePerM2: 7130, askingPricePerM2: 7810, transactionsCount: 71, daysOnMarket: 71, negotiationSpreadPercent: 8.71 },
    { period: '2026-T2', year: 2026, quarter: 2, realPricePerM2: 7150, askingPricePerM2: 7820, transactionsCount: 68, daysOnMarket: 72, negotiationSpreadPercent: 8.57 },
  ],
};

@Injectable({
  providedIn: 'root',
})
export class MarketDataService {
  public readonly report = signal<GuindaleraMarketReport>(FALLBACK_REPORT);

  public readonly latestSeries = computed(() => {
    return this.report().historicalSeries;
  });

  public readonly euriborRates = computed(() => {
    return this.report().euribor;
  });

  constructor() {
    this.fetchRemoteData();
  }

  /**
   * Calculates the recommended counter-offer based on the real negotiation discount in La Guindalera.
   */
  public calculateRecommendedOffer(askingPrice: number, customDiscountPercent?: number): {
    askingPrice: number;
    discountPercent: number;
    recommendedOffer: number;
    cashSavings: number;
    itpSavings: number;
    totalSavings: number;
  } {
    const discount = customDiscountPercent ?? this.report().averageNegotiationDiscount;
    const recommendedOffer = Math.round(askingPrice * (1 - discount / 100));
    const cashSavings = askingPrice - recommendedOffer;
    const itpSavings = Math.round(cashSavings * 0.06); // 6% ITP Madrid
    const totalSavings = cashSavings + itpSavings;

    return {
      askingPrice,
      discountPercent: discount,
      recommendedOffer,
      cashSavings,
      itpSavings,
      totalSavings,
    };
  }

  /**
   * Attempts to fetch the updated JSON dataset from static asset storage
   */
  private async fetchRemoteData(): Promise<void> {
    if (typeof window === 'undefined' || !window.fetch) {
      return;
    }
    try {
      const response = await fetch('data/guindalera-market-data.json');
      if (response.ok) {
        const data = (await response.json()) as GuindaleraMarketReport;
        if (data && data.historicalSeries?.length > 0) {
          this.report.set(data);
        }
      }
    } catch {
      // Gracefully maintain fallback report
    }
  }
}

