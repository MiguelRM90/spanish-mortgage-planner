import { MortgageInputs } from './mortgage-inputs.model';
import { MortgageResults } from './mortgage-results.model';

export interface Scenario {
  id: string;
  name: string;
  notes?: string;
  createdAt: number;
  updatedAt: number;
  inputs: MortgageInputs;
  results?: MortgageResults;
}

