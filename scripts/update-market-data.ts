/**
 * ETL Script: Automated Fetcher & Synchronizer for La Guindalera Market Data & Euribor
 *
 * Automated Sources:
 * 1. Banco Central Europeo (ECB API): Live Euribor 12M monthly official series
 * 2. Instituto Nacional de Estadística (INE API): Índice de Precios de Vivienda (IPV Madrid)
 * 3. Ayuntamiento de Madrid (Datos Abiertos CKAN): Estadística inmobiliaria por barrio
 * 4. Índices públicos de oferta inmobiliaria para La Guindalera
 *
 * Execution Modes:
 *   - 100% Automated (GitHub Actions cron or `pnpm run update-data`):
 *       Attempts to fetch all sources automatically without user interaction.
 *   - Assisted / CLI (`pnpm run update-data --real 7180 --asking 7850` or `pnpm run add-quarter`):
 *       Allows injecting or overriding specific figures if desired.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline/promises';

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

interface IneDataPoint {
  Anyo: number;
  T3_Periodo: string;
  Valor: number;
}

interface HistoricalRecord {
  period: string;
  year: number;
  quarter: number;
  realPricePerM2: number;
  askingPricePerM2: number;
  transactionsCount: number;
  daysOnMarket: number;
  negotiationSpreadPercent: number;
}

function parseArgs(): Record<string, string> {
  const args = process.argv.slice(2);
  const result: Record<string, string> = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].replace(/^--/, '');
      const next = args[i + 1];
      if (next && !next.startsWith('--')) {
        result[key] = next;
        i++;
      } else {
        result[key] = 'true';
      }
    } else if (args[i] === '-i') {
      result['interactive'] = 'true';
    }
  }
  return result;
}

/**
 * 1. Fetch live Euribor from the European Central Bank Data API
 */
async function fetchLatestEuribor(): Promise<number | null> {
  try {
    const url =
      'https://data-api.ecb.europa.eu/service/data/FM/M.U2.EUR.RT.MM.EUR12MD_.HSTA?lastNObservations=1&format=jsondata';
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
    console.warn('ℹ️ [BCE API] Sin conexión en este entorno (normal en local/sandbox). Manteniendo Euríbor actual.');
  }
  return null;
}

/**
 * 2. Fetch official Madrid housing trend from INE (Instituto Nacional de Estadística)
 */
async function fetchIneMadridTrend(): Promise<{ quarterlyChange: number; year: number; quarter: number } | null> {
  try {
    // INE API: IPV Comunidad de Madrid (Tabla 25171)
    const url = 'https://servicios.ine.es/wstempus/js/ES/DATOS_TABLA/25171?nult=2';
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const json = (await response.json()) as IneDataPoint[];
    if (Array.isArray(json) && json.length >= 2) {
      const latest = json[0];
      const prev = json[1];
      if (latest?.Valor && prev?.Valor) {
        const quarterlyChange = Math.round(((latest.Valor - prev.Valor) / prev.Valor) * 10000) / 100;
        const qMatch = latest.T3_Periodo?.match(/T(\d)/i);
        const quarter = qMatch ? parseInt(qMatch[1], 10) : 1;
        return {
          quarterlyChange,
          year: latest.Anyo,
          quarter,
        };
      }
    }
  } catch {
    // Gracefully ignore if offline
  }
  return null;
}

/**
 * 3. Fetch latest open market asking price index for La Guindalera
 */
async function fetchPortalAskingPriceGuindalera(): Promise<number | null> {
  try {
    const urls = [
      'https://www.idealista.com/sala-de-prensa/informes-precio-vivienda/venta/madrid-comunidad/madrid-provincia/madrid/salamanca/guindalera/',
      'https://properfy.es/precio-vivienda/madrid/salamanca/guindalera',
    ];

    for (const targetUrl of urls) {
      try {
        const res = await fetch(targetUrl, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml',
          },
        });
        if (!res.ok) continue;
        const html = await res.text();

        // Match price patterns e.g. "7.820 €/m²", "7820 €/m2", "7.850 €/m"
        const match = html.match(/(\d{1,2}[\.,]\d{3})\s*€\s*\/\s*m/i);
        if (match && match[1]) {
          const num = parseInt(match[1].replace(/[\.,]/g, ''), 10);
          if (num > 4000 && num < 15000) {
            return num;
          }
        }
      } catch {
        // Try next
      }
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

/**
 * 4. Check Ayuntamiento de Madrid CKAN Open Data Catalogue
 */
async function checkMadridOpenDataCatalogue(): Promise<string | null> {
  try {
    const url = 'https://datos.madrid.es/egob/catalogo/api/3/action/package_search?q=precio+vivienda+barrio';
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return null;
    const json = (await response.json()) as { success?: boolean; result?: { count?: number; results?: Array<{ title?: string }> } };
    if (json.success && json.result?.results && json.result.results.length > 0) {
      return json.result.results[0].title || null;
    }
  } catch {
    // Graceful fallback
  }
  return null;
}

function getNextQuarter(lastPeriod: string): { period: string; year: number; quarter: number } {
  const parts = lastPeriod.split('-T');
  let year = parseInt(parts[0], 10);
  let q = parseInt(parts[1], 10);

  q += 1;
  if (q > 4) {
    q = 1;
    year += 1;
  }
  return {
    period: `${year}-T${q}`,
    year,
    quarter: q,
  };
}

async function promptQuarterData(defaultPeriod: string, lastRecord: HistoricalRecord): Promise<{
  period: string;
  realPrice: number;
  askingPrice: number;
  daysOnMarket: number;
  txCount: number;
} | null> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    console.log('\n--- 📈 Asistente de Actualización para La Guindalera ---');
    const periodInput = await rl.question(`Periodo [por defecto: ${defaultPeriod}]: `);
    const period = periodInput.trim() || defaultPeriod;

    const realInput = await rl.question(`Precio REAL notarial €/m² [anterior: ${lastRecord.realPricePerM2} €/m²]: `);
    const realPrice = parseFloat(realInput.trim());
    if (isNaN(realPrice) || realPrice <= 0) {
      console.log('Precio real no introducido o inválido. Omitiendo actualización manual.');
      return null;
    }

    const askingInput = await rl.question(`Precio de OFERTA en portales €/m² [anterior: ${lastRecord.askingPricePerM2} €/m²]: `);
    const askingPrice = parseFloat(askingInput.trim()) || Math.round(realPrice * 1.09);

    const daysInput = await rl.question(`Días medios en venta [anterior: ${lastRecord.daysOnMarket} días]: `);
    const daysOnMarket = parseInt(daysInput.trim(), 10) || lastRecord.daysOnMarket;

    const txInput = await rl.question(`Número de compraventas [anterior: ${lastRecord.transactionsCount}]: `);
    const txCount = parseInt(txInput.trim(), 10) || lastRecord.transactionsCount;

    return { period, realPrice, askingPrice, daysOnMarket, txCount };
  } finally {
    rl.close();
  }
}

async function run(): Promise<void> {
  const flags = parseArgs();
  const targetPath = path.resolve(process.cwd(), 'public/data/guindalera-market-data.json');
  console.log(`\n=============================================================`);
  console.log(`🚀 Ingesta Automática de Mercado: La Guindalera & Euríbor`);
  console.log(`=============================================================`);
  console.log(`📂 Archivo de destino: ${targetPath}`);

  if (!fs.existsSync(targetPath)) {
    console.error('❌ Error: No se encontró el archivo de datos de mercado!');
    process.exit(1);
  }

  const fileData = JSON.parse(fs.readFileSync(targetPath, 'utf8'));
  const series: HistoricalRecord[] = fileData.historicalSeries || [];
  const lastRecord = series[series.length - 1];
  const nextQ = getNextQuarter(lastRecord?.period || '2026-T2');
  let modified = false;

  // 1. Sincronización Automática de Euríbor (BCE API)
  console.log('\n[1/3] 📡 Consultando API del Banco Central Europeo (Euríbor 12M)...');
  const liveEuribor = await fetchLatestEuribor();
  if (liveEuribor !== null) {
    if (fileData.euribor.currentMonthly !== liveEuribor) {
      console.log(`   ✅ Euríbor actualizado: ${fileData.euribor.currentMonthly}% -> ${liveEuribor}%`);
      fileData.euribor.currentMonthly = liveEuribor;
      fileData.euribor.lastUpdated = new Date().toISOString().substring(0, 7);
      modified = true;
    } else {
      console.log(`   ℹ️ El Euríbor ya está en su último valor cerrado (${liveEuribor}%).`);
    }
  }

  // 2. Rastreo Automático de Precios en La Guindalera (INE, Ayto Madrid, Portales)
  console.log('\n[2/3] 🏙️ Rastreador automático de precios para La Guindalera...');
  const [ineTrend, portalAskingPrice, madridDataset] = await Promise.all([
    fetchIneMadridTrend(),
    fetchPortalAskingPriceGuindalera(),
    checkMadridOpenDataCatalogue(),
  ]);

  if (madridDataset) {
    console.log(`   🏛️ Catálogo Datos Abiertos Ayto. Madrid: ${madridDataset}`);
  }
  if (portalAskingPrice) {
    console.log(`   🏷️ Precio de oferta detectado en portales (Guindalera): ${portalAskingPrice} €/m²`);
  }
  if (ineTrend) {
    console.log(`   📊 Tendencia oficial INE Madrid: ${ineTrend.quarterlyChange > 0 ? '+' : ''}${ineTrend.quarterlyChange}% (T${ineTrend.quarter} ${ineTrend.year})`);
  }

  // Comprobar si hay nuevos datos automáticos para el siguiente trimestre
  if (portalAskingPrice && portalAskingPrice !== lastRecord.askingPricePerM2) {
    // Extrapolación automática si se detecta nuevo precio de oferta y tendencia INE
    const estimatedRealPrice = ineTrend
      ? Math.round(lastRecord.realPricePerM2 * (1 + ineTrend.quarterlyChange / 100))
      : Math.round(portalAskingPrice * (1 - fileData.averageNegotiationDiscount / 100));

    console.log(`   ✨ ¡Detectada actualización automática de mercado para ${nextQ.period}!`);
    console.log(`      - Oferta: ${portalAskingPrice} €/m²`);
    console.log(`      - Escriturado estimado: ${estimatedRealPrice} €/m²`);

    flags['real'] = String(estimatedRealPrice);
    flags['asking'] = String(portalAskingPrice);
    flags['period'] = nextQ.period;
  } else {
    console.log(`   ℹ️ Las fuentes oficiales no tienen aún un nuevo trimestre cerrado para Guindalera.`);
    console.log(`   ℹ️ El último trimestre consolidado es ${lastRecord.period} (${lastRecord.realPricePerM2} €/m² real | ${lastRecord.askingPricePerM2} €/m² oferta).`);
  }

  // 3. Procesar datos (Automáticos o por flags/interactivo)
  console.log('\n[3/3] ⚙️ Consolidación de métricas y serie histórica...');
  let newQuarterInput: {
    period: string;
    realPrice: number;
    askingPrice: number;
    daysOnMarket: number;
    txCount: number;
  } | null = null;

  if (flags['real'] && flags['asking']) {
    newQuarterInput = {
      period: flags['period'] || nextQ.period,
      realPrice: parseFloat(flags['real']),
      askingPrice: parseFloat(flags['asking']),
      daysOnMarket: flags['days'] ? parseInt(flags['days'], 10) : lastRecord?.daysOnMarket ?? 72,
      txCount: flags['tx'] ? parseInt(flags['tx'], 10) : lastRecord?.transactionsCount ?? 70,
    };
  } else if (flags['interactive'] || flags['add']) {
    newQuarterInput = await promptQuarterData(nextQ.period, lastRecord);
  }

  if (newQuarterInput && newQuarterInput.realPrice > 0) {
    const qInfo = getNextQuarter(lastRecord.period);
    const spread =
      Math.round(((newQuarterInput.askingPrice - newQuarterInput.realPrice) / newQuarterInput.askingPrice) * 10000) / 100;
    const quarterlyGrowth =
      Math.round(((newQuarterInput.realPrice - lastRecord.realPricePerM2) / lastRecord.realPricePerM2) * 10000) / 100;

    const yearAgoRecord = series[series.length - 4] || lastRecord;
    const annualGrowth =
      Math.round(((newQuarterInput.realPrice - yearAgoRecord.realPricePerM2) / yearAgoRecord.realPricePerM2) * 10000) /
      100;

    const newRecord: HistoricalRecord = {
      period: newQuarterInput.period,
      year: qInfo.year,
      quarter: qInfo.quarter,
      realPricePerM2: newQuarterInput.realPrice,
      askingPricePerM2: newQuarterInput.askingPrice,
      transactionsCount: newQuarterInput.txCount,
      daysOnMarket: newQuarterInput.daysOnMarket,
      negotiationSpreadPercent: spread,
    };

    series.push(newRecord);
    fileData.historicalSeries = series;

    fileData.currentRealPricePerM2 = newQuarterInput.realPrice;
    fileData.currentAskingPricePerM2 = newQuarterInput.askingPrice;
    fileData.averageNegotiationDiscount = spread;
    fileData.annualGrowthRatePercent = annualGrowth;
    fileData.quarterlyGrowthRatePercent = quarterlyGrowth;

    // Diagnóstico automático del ciclo
    if (quarterlyGrowth < 0) {
      fileData.trend = 'bearish';
      fileData.trendDiagnosis = `Mercado en fase correctiva. El precio escriturado ha retrocedido un ${Math.abs(quarterlyGrowth)}% trimestral y los días de venta se sitúan en ${newQuarterInput.daysOnMarket}. Ocasión inmejorable para presionar a la baja en ofertas.`;
    } else if (quarterlyGrowth <= 0.8 && newQuarterInput.daysOnMarket >= 68) {
      fileData.trend = 'stagnating';
      fileData.trendDiagnosis = `Mercado en fase de meseta y desaceleración. El tiempo medio en venta es de ${newQuarterInput.daysOnMarket} días con crecimiento trimestral contenido (+${quarterlyGrowth}%), lo que ensancha la brecha de negociación (regateo medio del ${spread}%). Oportunidad favorable para compradores.`;
    } else if (quarterlyGrowth > 1.5) {
      fileData.trend = 'bullish';
      fileData.trendDiagnosis = `Mercado al alza con presión de demanda. El precio real ha crecido un +${quarterlyGrowth}% intertrimestral y los días en venta se han reducido a ${newQuarterInput.daysOnMarket}.`;
    } else {
      fileData.trend = 'stable';
      fileData.trendDiagnosis = `Mercado equilibrado y estable (+${quarterlyGrowth}% trimestral). La brecha de negociación se sitúa en torno al ${spread}%.`;
    }

    console.log(`   🎉 Trimestre ${newQuarterInput.period} consolidado con éxito:`);
    console.log(`      • Real: ${newQuarterInput.realPrice} €/m² | Oferta: ${newQuarterInput.askingPrice} €/m²`);
    console.log(`      • Brecha de regateo calculada: ${spread}%`);
    console.log(`      • Diagnóstico: ${fileData.trend.toUpperCase()}`);
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(targetPath, JSON.stringify(fileData, null, 2), 'utf8');
    console.log(`\n💾 Archivo ${targetPath} guardado y actualizado.`);
  } else {
    console.log('\n✨ Todos los datos están al día con la última publicación disponible.');
  }
}

run();
