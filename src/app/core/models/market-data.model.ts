export type MarketTrend = 'bullish' | 'stable' | 'stagnating' | 'bearish';

export interface MarketQuarterRecord {
  period: string;             // ej: "2024-T1"
  year: number;
  quarter: number;
  realPricePerM2: number;      // Precio real escriturado (€/m²) - Fuente: Ayto Madrid / Registro
  askingPricePerM2: number;    // Precio de oferta (€/m²) - Fuente: Portales
  transactionsCount: number;   // Volumen de compraventas en el barrio ese trimestre
  daysOnMarket: number;        // Días medios de venta en el mercado
  negotiationSpreadPercent: number; // Descuento medio de negociación (%)
}

export interface EuriborRates {
  currentMonthly: number;       // Último Euríbor oficial publicado por BdE en BOE
  historicalAverage12m: number; // Media últimos 12 meses
  forecastBase: number;         // Previsión consenso de mercado a 12-24 meses
  forecastOptimistic: number;   // Previsión escenario bajista de tipos (BCE)
  forecastPessimistic: number;  // Previsión escenario de tipos altos / rebote inflación
  lastUpdated: string;
}

export interface GuindaleraMarketReport {
  neighborhoodName: string;    // "La Guindalera (Distrito 04 - Salamanca, Madrid)"
  postalCode: string;          // "28028"
  currentRealPricePerM2: number;
  currentAskingPricePerM2: number;
  averageNegotiationDiscount: number; // Porcentaje medio de rebaja respecto al precio ofertado
  annualGrowthRatePercent: number;    // Variación interanual de precio real
  quarterlyGrowthRatePercent: number; // Variación trimestral
  volumeTrendQuarterlyPercent: number;// Variación del volumen de transacciones
  trend: MarketTrend;
  trendDiagnosis: string;
  historicalSeries: MarketQuarterRecord[];
  euribor: EuriborRates;
}

