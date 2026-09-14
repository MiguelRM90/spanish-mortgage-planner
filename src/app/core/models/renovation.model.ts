export type RenovationQuality = 'none' | 'basic' | 'medium' | 'high' | 'custom';

export interface RenovationCategoryCosts {
  demolition: number;          // Demolición, desescombro y gestión de residuos
  masonryAndPlaster: number;   // Albañilería, trasdosados acústicos y falsos techos
  electrical: number;          // Instalación eléctrica REBT y mecanismos
  plumbing: number;            // Fontanería, bajantes y desagües
  hvac: number;                // Climatización (aerotermia / suelo radiante o bomba de calor)
  windows: number;             // Carpintería exterior / ventanas Climalit Guardian Sun
  kitchen: number;             // Mobiliario de cocina y encimera porcelánica/cuarzo
  bathrooms: number;           // Sanitarios, griferías, platos de ducha y mamparas
  flooring: number;            // Suelos porcelánicos o tarima flotante AC5 / madera
  painting: number;            // Pintura plástica lisa y acabados
}

export interface RenovationInputs {
  enabled: boolean;
  squareMeters: number;              // Superficie en m² (default: 120 m², totalmente variable)
  quality: RenovationQuality;        // Nivel de calidad
  costPerSquareMeter: number;        // Coste neto base por m² sin impuestos
  vatRate: number;                   // IVA reducido para vivienda habitual (Madrid / España: 10%)
  icioRate: number;                  // ICIO del Ayuntamiento de Madrid (4%)
  financeRenovation: boolean;        // ¿Financiación hipotecaria de la obra (Hipoteca Compra + Reforma)?
  renovationFinancingPercentage: number; // % financiado de la reforma (ej: 80% o 0% si fondos propios)
  projectedMarketValuePerSqMeter: number; // Valor de mercado estimado reformado (default: 7.300 €/m² en La Guindalera)
  customBreakdown?: Partial<RenovationCategoryCosts>;
}

export interface RenovationResults {
  squareMeters: number;
  quality: RenovationQuality;
  netBaseBudget: number;             // Presupuesto neto de obra antes de impuestos
  vatAmount: number;                 // IVA reducido (10%)
  icioAmount: number;                // Impuesto municipal ICIO (4% Madrid)
  totalRenovationCost: number;       // Presupuesto total con impuestos
  costPerSqMeterWithTaxes: number;   // Coste total €/m² con impuestos
  financedRenovationAmount: number;  // Parte cubierta por el préstamo
  unfinancedRenovationAmount: number;// Parte a desembolsar en efectivo propio (cash)
  categoryBreakdown: RenovationCategoryCosts;
  projectedMarketValue: number;      // Valor del inmueble terminado (m² * valor mercado/m²)
  totalOperationCost: number;        // Precio compra + Gastos compra + Reforma total
  netEquityCreated: number;          // Plusvalía neta latente (Valor mercado - Coste total operación)
  equityPercentage: number;          // Rentabilidad patrimonial / margen de seguridad (%)
}

export const RENOVATION_QUALITY_PRESETS: Record<Exclude<RenovationQuality, 'custom' | 'none'>, { label: string; costPerM2: number; description: string }> = {
  basic: {
    label: 'Básica / Funcional',
    costPerM2: 850,
    description: 'Suelo laminado AC5, ventanas PVC estándar, cocina y baños funcionales.',
  },
  medium: {
    label: 'Media / Confort (Recomendada)',
    costPerM2: 1100,
    description: 'Suelo porcelánico o tarima de madera, ventanas Guardian Sun, aerotermia o conductos, cocina porcelánica y 2 baños completos.',
  },
  high: {
    label: 'Alta / Diseño',
    costPerM2: 1350,
    description: 'Suelo radiante/refrescante, tabiquería abierta a medida, domótica y carpintería artesanal.',
  },
};

export const DEFAULT_RENOVATION_INPUTS: Readonly<RenovationInputs> = {
  enabled: true,
  squareMeters: 120,
  quality: 'medium',
  costPerSquareMeter: 1100,
  vatRate: 10.0,
  icioRate: 4.0,
  financeRenovation: false,
  renovationFinancingPercentage: 0,
  projectedMarketValuePerSqMeter: 7300,
};

