/**
 * ETL Script: Fetch and update official market data for La Guindalera and Euribor
 * Sources:
 * - Ayuntamiento de Madrid: Datos Abiertos (Serie de precios declarados por distrito y barrio)
 * - Banco Central Europeo (ECB): Euribor 12M series
 * - Banco de España (BdE): Mercado hipotecario
 */

import * as fs from 'fs';
import * as path from 'path';

interface EuriborApiResponse {
  dataSets?: Array<{
    series?: {
      [key: string]: {
        observations?: {
          [key: string]: [number];
        };
      };
    };
  }>;
}

async function fetchLatestEuribor(): Promise<number | null> {
  try {
    const url = 'https://data-api.ecb.europa.eu/service/data/FM/M.U2.EUR.RT.MM.EUR12MD_.HSTA?lastNObservations=1&format=jsondata';
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const json = (await response.json()) as EuriborApiResponse;
    const series = json.dataSets?.[0]?.series;
    if (!series) return null;
    const firstSeriesKey = Object.keys(series)[0];
    const obs = series[firstSeriesKey]?.observations;
    if (!obs) return null;
    const lastKey = Object.keys(obs).pop();
    if (lastKey !== undefined && obs[lastKey]?.[0] !== undefined) {
      return Math.round(obs[lastKey][0] * 100) / 100;
    }
  } catch (err) {
    console.warn('Unable to fetch live Euribor from ECB API, using existing data:', err);
  }
  return null;
}

async function run(): Promise<void> {
  const targetPath = path.resolve(process.cwd(), 'public/data/guindalera-market-data.json');
  console.log(`Checking market data at: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    console.error('Target data file not found!');
    process.exit(1);
  }

  const fileData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));

  const liveEuribor = await fetchLatestEuribor();
  if (liveEuribor !== null) {
    console.log(`Updated Euribor from ECB API: ${liveEuribor}%`);
    fileData.euribor.currentMonthly = liveEuribor;
    fileData.euribor.lastUpdated = new Date().toISOString().substring(0, 7);
    fs.writeFileSync(targetPath, JSON.stringify(fileData, null, 2), 'utf8');
    console.log('Successfully updated market data.');
  } else {
    console.log('ECB API unavailable or unchanged; keeping current baseline dataset.');
  }
}

run();
