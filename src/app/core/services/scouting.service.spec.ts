import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ScoutingService } from './scouting.service';
import { ScenarioService } from './scenario.service';

describe('ScoutingService', () => {
  let service: ScoutingService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ScoutingService, ScenarioService],
    });
    service = TestBed.inject(ScoutingService);
  });

  it('should initialize with default Guindalera seed properties', () => {
    const list = service.properties();
    expect(list.length).toBeGreaterThanOrEqual(2);
    expect(list[0].address).toContain('Cartagena');
    expect(list[0].squareMeters).toBe(120);
    expect(list[0].structuralType).toBe('pillars');
  });

  it('should add, update and delete scouted property', () => {
    const created = service.addProperty({
      title: 'Piso Eraso 125m²',
      address: 'Calle Eraso, Guindalera',
      askingPrice: 580000,
      squareMeters: 125,
      floor: '3º exterior',
      orientation: 'Sur',
      communityFeeMonthly: 90,
      annualIbi: 720,
      notes: 'Muy buena distribución',
      hasElevator: true,
      elevatorViable: true,
      hasFavorableIte: true,
      hasPendingAssessments: false,
      structuralType: 'pillars',
      hvacSystem: 'central',
      ceilingHeightMeters: 2.75,
      naturalLightRating: 5,
      recommendedOffer: 530000,
    });

    expect(service.properties().some((p) => p.id === created.id)).toBe(true);

    service.updateProperty(created.id, { askingPrice: 560000 });
    const updated = service.properties().find((p) => p.id === created.id);
    expect(updated?.askingPrice).toBe(560000);

    service.deleteProperty(created.id);
    expect(service.properties().some((p) => p.id === created.id)).toBe(false);
  });

  it('should calculate maximum viable price protecting cushion buffer', () => {
    const maxPrice = service.calculateMaxViablePrice(320000, 150000, 20000);
    expect(maxPrice).toBe(535000);
  });
});

