export interface PropertyScoutingItem {
  id: string;
  title: string;              // ej: "Piso Cartagena 120m²"
  address: string;            // ej: "Calle de Cartagena, 84"
  askingPrice: number;        // Precio pedido por agencia
  squareMeters: number;       // Superficie (m²)
  floor: string;              // ej: "3ª Planta exterior"
  orientation: string;        // ej: "Sur / Suroeste"
  communityFeeMonthly: number;// Comunidad €/mes
  annualIbi: number;          // IBI €/año
  notes: string;
  createdAt: number;

  // Checklist técnico para Guindalera
  hasElevator: boolean;       // ¿Tiene ascensor?
  elevatorViable: boolean;    // Si no tiene, ¿hay hueco de escalera o patio para instalarlo?
  hasFavorableIte: boolean;   // ¿ITE favorable?
  hasPendingAssessments: boolean; // ¿Derramas pendientes aprobadas?
  structuralType: 'pillars' | 'load_bearing_walls' | 'mixed'; // Estructura (pilares permite abrir espacios)
  hvacSystem: 'central' | 'individual_gas' | 'electric_none';  // Calefacción existente
  ceilingHeightMeters: number;// Altura libre de techos (m)
  naturalLightRating: 1 | 2 | 3 | 4 | 5; // Valoración luz natural (1-5)

  // Oferta calculada
  recommendedOffer: number;
}

