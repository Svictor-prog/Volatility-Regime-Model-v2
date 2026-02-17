import { useState, useEffect, useRef, useCallback, useMemo } from "react";

// ============================================================
// DATABASE — 248 AÇÕES USA + EUROPA
// ============================================================

const SECTOR_DEFAULTS = {
  "Technology":       { kappa:1.2, annVol:0.32, sigma:0.38, rho:-0.62, mu:0.12 },
  "Semiconductors":   { kappa:1.1, annVol:0.38, sigma:0.45, rho:-0.60, mu:0.13 },
  "Software":         { kappa:1.3, annVol:0.30, sigma:0.36, rho:-0.60, mu:0.12 },
  "Finance":          { kappa:1.8, annVol:0.22, sigma:0.28, rho:-0.55, mu:0.09 },
  "Banking":          { kappa:1.9, annVol:0.25, sigma:0.30, rho:-0.58, mu:0.08 },
  "Insurance":        { kappa:2.0, annVol:0.18, sigma:0.22, rho:-0.50, mu:0.07 },
  "Healthcare":       { kappa:1.5, annVol:0.20, sigma:0.24, rho:-0.50, mu:0.08 },
  "Pharma":           { kappa:1.4, annVol:0.22, sigma:0.26, rho:-0.52, mu:0.08 },
  "Biotech":          { kappa:1.0, annVol:0.45, sigma:0.55, rho:-0.55, mu:0.10 },
  "Energy":           { kappa:1.3, annVol:0.28, sigma:0.33, rho:-0.52, mu:0.07 },
  "Oil & Gas":        { kappa:1.2, annVol:0.30, sigma:0.36, rho:-0.50, mu:0.07 },
  "Consumer Disc":    { kappa:1.6, annVol:0.26, sigma:0.30, rho:-0.48, mu:0.09 },
  "Consumer Staples": { kappa:2.0, annVol:0.14, sigma:0.18, rho:-0.42, mu:0.06 },
  "Retail":           { kappa:1.7, annVol:0.28, sigma:0.32, rho:-0.50, mu:0.08 },
  "Industrials":      { kappa:1.5, annVol:0.22, sigma:0.26, rho:-0.50, mu:0.08 },
  "Aerospace":        { kappa:1.4, annVol:0.25, sigma:0.28, rho:-0.52, mu:0.08 },
  "Automotive":       { kappa:1.3, annVol:0.30, sigma:0.35, rho:-0.55, mu:0.07 },
  "Materials":        { kappa:1.4, annVol:0.24, sigma:0.28, rho:-0.50, mu:0.07 },
  "Mining":           { kappa:1.2, annVol:0.32, sigma:0.38, rho:-0.50, mu:0.07 },
  "Chemicals":        { kappa:1.5, annVol:0.20, sigma:0.24, rho:-0.48, mu:0.07 },
  "Utilities":        { kappa:2.2, annVol:0.14, sigma:0.16, rho:-0.38, mu:0.05 },
  "Real Estate":      { kappa:1.8, annVol:0.18, sigma:0.22, rho:-0.45, mu:0.06 },
  "Telecom":          { kappa:1.6, annVol:0.20, sigma:0.24, rho:-0.48, mu:0.06 },
  "Media":            { kappa:1.4, annVol:0.28, sigma:0.33, rho:-0.52, mu:0.08 },
  "Luxury":           { kappa:1.3, annVol:0.26, sigma:0.30, rho:-0.50, mu:0.10 },
  "Transport":        { kappa:1.5, annVol:0.24, sigma:0.28, rho:-0.50, mu:0.07 },
};

const RAW_STOCKS = [
  // [ticker, name, sector, exchange, country, price, beta, annVol?]
  // ── USA TECHNOLOGY
  ["AAPL","Apple Inc","Technology","NASDAQ","USA",211,1.25],
  ["MSFT","Microsoft Corp","Software","NASDAQ","USA",415,0.90],
  ["NVDA","NVIDIA Corp","Semiconductors","NASDAQ","USA",875,1.70],
  ["GOOGL","Alphabet Inc","Technology","NASDAQ","USA",178,1.05],
  ["META","Meta Platforms","Technology","NASDAQ","USA",510,1.30],
  ["AMZN","Amazon.com","Consumer Disc","NASDAQ","USA",195,1.20],
  ["TSLA","Tesla Inc","Automotive","NASDAQ","USA",248,1.90,0.55],
  ["AVGO","Broadcom Inc","Semiconductors","NASDAQ","USA",178,1.35],
  ["ORCL","Oracle Corp","Software","NYSE","USA",143,0.85],
  ["AMD","Advanced Micro Devices","Semiconductors","NASDAQ","USA",155,1.60],
  ["INTC","Intel Corp","Semiconductors","NASDAQ","USA",22,0.95,0.42],
  ["QCOM","Qualcomm Inc","Semiconductors","NASDAQ","USA",202,1.20],
  ["TXN","Texas Instruments","Semiconductors","NASDAQ","USA",195,1.00],
  ["AMAT","Applied Materials","Semiconductors","NASDAQ","USA",180,1.30],
  ["LRCX","Lam Research","Semiconductors","NASDAQ","USA",820,1.35],
  ["MU","Micron Technology","Semiconductors","NASDAQ","USA",94,1.45],
  ["KLAC","KLA Corp","Semiconductors","NASDAQ","USA",765,1.30],
  ["MRVL","Marvell Technology","Semiconductors","NASDAQ","USA",80,1.50],
  ["ADI","Analog Devices","Semiconductors","NASDAQ","USA",218,1.05],
  ["NOW","ServiceNow","Software","NYSE","USA",820,1.25],
  ["CRM","Salesforce Inc","Software","NYSE","USA",293,1.15],
  ["ADBE","Adobe Inc","Software","NASDAQ","USA",390,1.20],
  ["INTU","Intuit Inc","Software","NASDAQ","USA",640,1.10],
  ["SNOW","Snowflake Inc","Software","NYSE","USA",155,1.50,0.40],
  ["PANW","Palo Alto Networks","Software","NASDAQ","USA",358,1.30],
  ["CRWD","CrowdStrike","Software","NASDAQ","USA",345,1.40],
  ["WDAY","Workday Inc","Software","NASDAQ","USA",248,1.15],
  ["ZS","Zscaler Inc","Software","NASDAQ","USA",205,1.45],
  ["PLTR","Palantir Technologies","Software","NYSE","USA",28,1.70,0.45],
  ["DDOG","Datadog Inc","Software","NASDAQ","USA",125,1.40],
  // ── USA FINANCE
  ["JPM","JPMorgan Chase","Banking","NYSE","USA",228,1.15],
  ["BAC","Bank of America","Banking","NYSE","USA",42,1.30],
  ["WFC","Wells Fargo","Banking","NYSE","USA",65,1.20],
  ["GS","Goldman Sachs","Finance","NYSE","USA",545,1.40],
  ["MS","Morgan Stanley","Finance","NYSE","USA",110,1.30],
  ["C","Citigroup Inc","Banking","NYSE","USA",68,1.35],
  ["BLK","BlackRock Inc","Finance","NYSE","USA",978,1.05],
  ["SCHW","Charles Schwab","Finance","NYSE","USA",78,1.15],
  ["AXP","American Express","Finance","NYSE","USA",245,1.05],
  ["V","Visa Inc","Finance","NYSE","USA",298,0.90],
  ["MA","Mastercard Inc","Finance","NYSE","USA",498,0.92],
  ["PYPL","PayPal Holdings","Finance","NASDAQ","USA",68,1.25,0.35],
  ["COF","Capital One","Banking","NYSE","USA",175,1.30],
  ["USB","U.S. Bancorp","Banking","NYSE","USA",44,1.05],
  ["PNC","PNC Financial","Banking","NYSE","USA",182,1.10],
  ["ICE","Intercontinental Exchange","Finance","NYSE","USA",155,0.85],
  ["CME","CME Group","Finance","NASDAQ","USA",215,0.60],
  ["SPGI","S&P Global","Finance","NYSE","USA",500,0.85],
  // ── USA HEALTHCARE
  ["JNJ","Johnson & Johnson","Healthcare","NYSE","USA",155,0.55],
  ["UNH","UnitedHealth Group","Healthcare","NYSE","USA",498,0.65],
  ["LLY","Eli Lilly","Pharma","NYSE","USA",858,0.40],
  ["ABBV","AbbVie Inc","Pharma","NYSE","USA",192,0.55],
  ["MRK","Merck & Co","Pharma","NYSE","USA",101,0.45],
  ["PFE","Pfizer Inc","Pharma","NYSE","USA",27,0.60],
  ["TMO","Thermo Fisher","Healthcare","NYSE","USA",530,0.75],
  ["ABT","Abbott Labs","Healthcare","NYSE","USA",122,0.75],
  ["MDT","Medtronic","Healthcare","NYSE","USA",88,0.70],
  ["BMY","Bristol-Myers Squibb","Pharma","NYSE","USA",48,0.40],
  ["AMGN","Amgen Inc","Biotech","NASDAQ","USA",302,0.45],
  ["GILD","Gilead Sciences","Biotech","NASDAQ","USA",88,0.55],
  ["REGN","Regeneron Pharma","Biotech","NASDAQ","USA",820,0.45],
  ["VRTX","Vertex Pharma","Biotech","NASDAQ","USA",462,0.50],
  ["ISRG","Intuitive Surgical","Healthcare","NASDAQ","USA",495,0.75],
  ["CVS","CVS Health","Healthcare","NYSE","USA",58,0.75],
  ["MRNA","Moderna Inc","Biotech","NASDAQ","USA",72,1.20,0.55],
  // ── USA ENERGY
  ["XOM","Exxon Mobil","Oil & Gas","NYSE","USA",112,0.90],
  ["CVX","Chevron Corp","Oil & Gas","NYSE","USA",142,0.90],
  ["COP","ConocoPhillips","Oil & Gas","NYSE","USA",110,1.00],
  ["EOG","EOG Resources","Oil & Gas","NYSE","USA",128,1.05],
  ["SLB","SLB (Schlumberger)","Energy","NYSE","USA",38,1.10],
  ["PSX","Phillips 66","Energy","NYSE","USA",128,0.95],
  ["VLO","Valero Energy","Energy","NYSE","USA",138,1.00],
  ["OXY","Occidental Petroleum","Energy","NYSE","USA",48,1.15],
  ["HAL","Halliburton","Energy","NYSE","USA",30,1.20],
  ["NEE","NextEra Energy","Utilities","NYSE","USA",73,0.65],
  ["DUK","Duke Energy","Utilities","NYSE","USA",99,0.45],
  ["SO","Southern Company","Utilities","NYSE","USA",79,0.40],
  ["D","Dominion Energy","Utilities","NYSE","USA",51,0.45],
  // ── USA CONSUMER
  ["WMT","Walmart Inc","Retail","NYSE","USA",86,0.60],
  ["TGT","Target Corp","Retail","NYSE","USA",135,0.95],
  ["HD","Home Depot","Retail","NYSE","USA",378,0.95],
  ["LOW","Lowe's Companies","Retail","NYSE","USA",248,0.95],
  ["COST","Costco Wholesale","Retail","NASDAQ","USA",895,0.75],
  ["MCD","McDonald's Corp","Consumer Staples","NYSE","USA",295,0.68],
  ["SBUX","Starbucks Corp","Consumer Staples","NASDAQ","USA",78,0.95],
  ["NKE","Nike Inc","Consumer Disc","NYSE","USA",72,1.00],
  ["PEP","PepsiCo Inc","Consumer Staples","NASDAQ","USA",160,0.55],
  ["KO","Coca-Cola","Consumer Staples","NYSE","USA",64,0.55],
  ["PM","Philip Morris Intl","Consumer Staples","NYSE","USA",125,0.60],
  ["PG","Procter & Gamble","Consumer Staples","NYSE","USA",162,0.50],
  ["CL","Colgate-Palmolive","Consumer Staples","NYSE","USA",92,0.55],
  ["MDLZ","Mondelez Intl","Consumer Staples","NASDAQ","USA",62,0.60],
  // ── USA INDUSTRIALS
  ["CAT","Caterpillar Inc","Industrials","NYSE","USA",358,1.10],
  ["DE","Deere & Company","Industrials","NYSE","USA",398,1.10],
  ["BA","Boeing Co","Aerospace","NYSE","USA",188,1.30,0.35],
  ["GE","GE Aerospace","Aerospace","NYSE","USA",178,1.15],
  ["HON","Honeywell Intl","Industrials","NASDAQ","USA",212,0.90],
  ["RTX","RTX Corp","Aerospace","NYSE","USA",118,0.90],
  ["LMT","Lockheed Martin","Aerospace","NYSE","USA",558,0.55],
  ["NOC","Northrop Grumman","Aerospace","NYSE","USA",488,0.55],
  ["UPS","United Parcel Service","Transport","NYSE","USA",120,0.95],
  ["FDX","FedEx Corp","Transport","NYSE","USA",295,1.00],
  ["ETN","Eaton Corp","Industrials","NYSE","USA",328,1.05],
  ["PH","Parker Hannifin","Industrials","NYSE","USA",698,1.10],
  // ── USA MATERIALS & REAL ESTATE
  ["LIN","Linde PLC","Chemicals","NASDAQ","USA",448,0.75],
  ["APD","Air Products","Chemicals","NYSE","USA",305,0.85],
  ["SHW","Sherwin-Williams","Chemicals","NYSE","USA",358,0.88],
  ["FCX","Freeport-McMoRan","Mining","NYSE","USA",45,1.45],
  ["NEM","Newmont Corp","Mining","NYSE","USA",42,0.55],
  ["PLD","Prologis Inc","Real Estate","NYSE","USA",118,1.00],
  ["AMT","American Tower","Real Estate","NYSE","USA",195,0.85],
  ["EQIX","Equinix Inc","Real Estate","NASDAQ","USA",820,0.75],
  ["SPG","Simon Property","Real Estate","NYSE","USA",165,1.25],
  ["O","Realty Income","Real Estate","NYSE","USA",54,0.80],
  // ── USA COMMUNICATION
  ["T","AT&T Inc","Telecom","NYSE","USA",19,0.70],
  ["VZ","Verizon Communications","Telecom","NYSE","USA",41,0.45],
  ["CMCSA","Comcast Corp","Media","NASDAQ","USA",36,0.90],
  ["DIS","Walt Disney Co","Media","NYSE","USA",100,1.10],
  ["NFLX","Netflix Inc","Media","NASDAQ","USA",698,1.30,0.35],
  ["SPOT","Spotify Technology","Media","NYSE","USA",368,1.40],
  // ── GERMANY (DAX)
  ["SAP","SAP SE","Software","XETRA","DE",198,0.80],
  ["SIE","Siemens AG","Industrials","XETRA","DE",175,1.00],
  ["ALV","Allianz SE","Insurance","XETRA","DE",295,0.85],
  ["MUV2","Munich Re","Insurance","XETRA","DE",448,0.70],
  ["BAS","BASF SE","Chemicals","XETRA","DE",46,1.05],
  ["VOW3","Volkswagen AG","Automotive","XETRA","DE",98,1.10],
  ["BMW","Bayerische Motoren Werke","Automotive","XETRA","DE",92,1.00],
  ["MBG","Mercedes-Benz Group","Automotive","XETRA","DE",64,1.05],
  ["DBK","Deutsche Bank","Banking","XETRA","DE",18,1.35],
  ["CBK","Commerzbank","Banking","XETRA","DE",14,1.45],
  ["DTE","Deutsche Telekom","Telecom","XETRA","DE",24,0.60],
  ["RWE","RWE AG","Utilities","XETRA","DE",28,0.75],
  ["EOAN","E.ON SE","Utilities","XETRA","DE",13,0.65],
  ["BAY","Bayer AG","Pharma","XETRA","DE",25,0.80,0.30],
  ["ADS","Adidas AG","Consumer Disc","XETRA","DE",212,0.95],
  ["HEN3","Henkel AG","Consumer Staples","XETRA","DE",80,0.65],
  ["BEI","Beiersdorf AG","Consumer Staples","XETRA","DE",132,0.60],
  ["DHL","DHL Group","Transport","XETRA","DE",36,0.85],
  ["FRE","Fresenius SE","Healthcare","XETRA","DE",28,0.70],
  ["MRKDE","Merck KGaA","Pharma","XETRA","DE",162,0.75],
  ["AIXA","AIXTRON SE","Semiconductors","XETRA","DE",18,1.40],
  ["CON","Continental AG","Automotive","XETRA","DE",58,1.10],
  ["ZAL","Zalando SE","Retail","XETRA","DE",28,1.40,0.42],
  ["DHER","Delivery Hero","Consumer Disc","XETRA","DE",28,1.50,0.45],
  // ── FRANCE (CAC40)
  ["MC","LVMH Moët Hennessy","Luxury","EPA","FR",648,0.90],
  ["OR","L'Oréal SA","Consumer Staples","EPA","FR",388,0.70],
  ["TTE","TotalEnergies","Oil & Gas","EPA","FR",60,0.80],
  ["AIR","Airbus SE","Aerospace","EPA","FR",168,0.95],
  ["SANFR","Sanofi SA","Pharma","EPA","FR",88,0.55],
  ["BNP","BNP Paribas","Banking","EPA","FR",58,1.15],
  ["ACA","Crédit Agricole","Banking","EPA","FR",14,1.20],
  ["GLE","Société Générale","Banking","EPA","FR",26,1.35],
  ["KER","Kering SA","Luxury","EPA","FR",248,1.00],
  ["RI","Pernod Ricard","Consumer Staples","EPA","FR",108,0.65],
  ["DSY","Dassault Systèmes","Software","EPA","FR",36,0.90],
  ["STMFR","STMicroelectronics","Semiconductors","EPA","FR",22,1.25],
  ["CAP","Capgemini SE","Software","EPA","FR",188,0.95],
  ["SGO","Saint-Gobain","Materials","EPA","FR",75,1.00],
  ["VIE","Veolia Environnement","Utilities","EPA","FR",26,0.80],
  ["DG","Vinci SA","Industrials","EPA","FR",112,0.80],
  ["SU","Schneider Electric","Industrials","EPA","FR",212,0.95],
  ["RNO","Renault SA","Automotive","EPA","FR",38,1.25],
  ["ORA","Orange SA","Telecom","EPA","FR",11,0.55],
  ["HO","Thales SA","Aerospace","EPA","FR",148,0.70],
  // ── UK (FTSE100)
  ["HSBA","HSBC Holdings","Banking","LSE","GB",720,0.85],
  ["SHEL","Shell PLC","Oil & Gas","LSE","GB",2580,0.80],
  ["BP","BP PLC","Oil & Gas","LSE","GB",425,0.90],
  ["AZN","AstraZeneca","Pharma","LSE","GB",9800,0.50],
  ["GSK","GSK PLC","Pharma","LSE","GB",1480,0.60],
  ["ULVR","Unilever PLC","Consumer Staples","LSE","GB",4100,0.60],
  ["RIO","Rio Tinto","Mining","LSE","GB",4800,1.00],
  ["BHP","BHP Group","Mining","LSE","GB",2100,0.95],
  ["VOD","Vodafone Group","Telecom","LSE","GB",68,0.70],
  ["LLOY","Lloyds Banking Group","Banking","LSE","GB",54,1.10],
  ["BARC","Barclays PLC","Banking","LSE","GB",258,1.25],
  ["NWG","NatWest Group","Banking","LSE","GB",398,1.15],
  ["DGE","Diageo PLC","Consumer Staples","LSE","GB",2200,0.65],
  ["BATS","British American Tobacco","Consumer Staples","LSE","GB",2400,0.55],
  ["REL","RELX PLC","Media","LSE","GB",3400,0.60],
  ["EXPN","Experian PLC","Finance","LSE","GB",3200,0.75],
  ["STAN","Standard Chartered","Banking","LSE","GB",820,1.00],
  ["PRU","Prudential PLC","Insurance","LSE","GB",680,1.00],
  ["LGEN","Legal & General","Insurance","LSE","GB",218,0.95],
  ["NG","National Grid","Utilities","LSE","GB",930,0.50],
  ["SSE","SSE PLC","Utilities","LSE","GB",1720,0.55],
  ["BAES","BAE Systems","Aerospace","LSE","GB",1280,0.55],
  ["JD","JD Sports Fashion","Retail","LSE","GB",112,1.15],
  ["MKS","Marks & Spencer","Retail","LSE","GB",380,1.00],
  ["TSCO","Tesco PLC","Retail","LSE","GB",360,0.75],
  // ── NETHERLANDS
  ["ASML","ASML Holding","Semiconductors","AEX","NL",780,1.10],
  ["ADYEN","Adyen NV","Finance","AEX","NL",1280,1.40],
  ["INGA","ING Groep","Banking","AEX","NL",15,1.15],
  ["HEIA","Heineken NV","Consumer Staples","AEX","NL",82,0.65],
  ["UNA","Unilever NV","Consumer Staples","AEX","NL",45,0.60],
  ["PHG","Philips NV","Healthcare","AEX","NL",20,1.00],
  ["NN","NN Group","Insurance","AEX","NL",44,0.90],
  // ── SWITZERLAND
  ["NESN","Nestlé SA","Consumer Staples","SWX","CH",92,0.55],
  ["NOVN","Novartis AG","Pharma","SWX","CH",92,0.50],
  ["ROG","Roche Holding","Biotech","SWX","CH",262,0.45],
  ["UBSG","UBS Group","Banking","SWX","CH",26,1.10],
  ["ZURN","Zurich Insurance","Insurance","SWX","CH",492,0.70],
  ["CFR","Compagnie Financière Richemont","Luxury","SWX","CH",148,0.90],
  ["ABBN","ABB Ltd","Industrials","SWX","CH",48,0.95],
  ["LONN","Lonza Group","Pharma","SWX","CH",510,0.90],
  ["GIVN","Givaudan SA","Chemicals","SWX","CH",3800,0.65],
  // ── SPAIN
  ["SANES","Banco Santander","Banking","BME","ES",4,1.20],
  ["BBVA","Banco Bilbao Vizcaya","Banking","BME","ES",9,1.15],
  ["IBE","Iberdrola SA","Utilities","BME","ES",12,0.65],
  ["REP","Repsol SA","Oil & Gas","BME","ES",14,0.90],
  ["ITX","Inditex (Zara)","Retail","BME","ES",48,0.75],
  ["TEF","Telefónica SA","Telecom","BME","ES",4,0.75],
  ["ACS","ACS Construcción","Industrials","BME","ES",42,0.90],
  // ── ITALY
  ["ENI","Eni SpA","Oil & Gas","BIT","IT",14,0.85],
  ["ENEL","Enel SpA","Utilities","BIT","IT",6,0.70],
  ["ISP","Intesa Sanpaolo","Banking","BIT","IT",4,1.20],
  ["UCG","UniCredit SpA","Banking","BIT","IT",38,1.30],
  ["LDO","Leonardo SpA","Aerospace","BIT","IT",22,0.95],
  // ── SCANDINAVIA
  ["NOVO","Novo Nordisk","Pharma","CPH","DK",880,0.65],
  ["CARL","Carlsberg A/S","Consumer Staples","CPH","DK",785,0.70],
  ["ORSTED","Ørsted A/S","Utilities","CPH","DK",338,0.90],
  ["MAERSK","A.P. Møller-Mærsk","Transport","CPH","DK",11500,1.00],
  ["VWS","Vestas Wind Systems","Utilities","CPH","DK",115,1.10,0.35],
  ["EQNR","Equinor ASA","Oil & Gas","OSE","NO",268,0.85],
  ["DNB","DNB Bank","Banking","OSE","NO",228,0.90],
  ["MOWI","Mowi ASA","Consumer Staples","OSE","NO",198,1.00],
  ["VOLV","Volvo AB","Industrials","STO","SE",248,1.00],
  ["ERIC","Ericsson","Technology","STO","SE",70,1.00],
  ["ATCO","Atlas Copco","Industrials","STO","SE",162,1.00],
  ["NOKIA","Nokia Oyj","Technology","HEL","FI",4,0.90],
  ["KONE","KONE Oyj","Industrials","HEL","FI",44,0.75],
  ["SAMPO","Sampo Oyj","Insurance","HEL","FI",44,0.80],
];

function buildHeston(sector, annVol_override) {
  const d = SECTOR_DEFAULTS[sector] || SECTOR_DEFAULTS["Technology"];
  const av = annVol_override || d.annVol;
  return { kappa: d.kappa, theta: av * av, sigma: d.sigma, rho: d.rho, mu: d.mu, annVol: av };
}

const STOCKS_DB = RAW_STOCKS.map(([ticker, name, sector, exchange, country, price, beta, avOvr]) => {
  const h = buildHeston(sector, avOvr);
  return { ticker, name, sector, exchange, country, price: +price, beta: +beta, ...h, V0: (h.annVol * 0.88) ** 2 };
});

const FLAG = { USA:"🇺🇸", DE:"🇩🇪", FR:"🇫🇷", GB:"🇬🇧", NL:"🇳🇱", CH:"🇨🇭", ES:"🇪🇸", IT:"🇮🇹", DK:"🇩🇰", NO:"🇳🇴", SE:"🇸🇪", FI:"🇫🇮" };
const COUNTRY_NAME = { USA:"USA", DE:"Alemanha", FR:"França", GB:"Reino Unido", NL:"Holanda", CH:"Suíça", ES:"Espanha", IT:"Itália", DK:"Dinamarca", NO:"Noruega", SE:"Suécia", FI:"Finlândia" };
const SECTORS_ALL = [...new Set(STOCKS_DB.map(s => s.sector))].sort();
const COUNTRIES_ALL = [...new Set(STOCKS_DB.map(s => s.country))].sort();

// ============================================================
// MOTOR DE SIMULAÇÃO — REGIME ENDÓGENO COM CAUSALIDADE CORRETA
// ============================================================
// Princípio: regime NÃO é label pós-hoc.
// Regime é uma função do estado ATUAL (V, drawdown, vol_realizada)
// que DETERMINA os parâmetros da SDE no MESMO passo.
//
// Ordem causal em cada passo t:
//   1. Ler estado: V[t-1], S[t-1], drawdown[t-1], vol_realizada[t-1]
//   2. Calcular regime[t] = f(estado[t-1])  ← ANTES das SDEs
//   3. Usar regime[t] para definir θ(t), κ(t), σ_vv(t), μ(t) efetivos
//   4. Aplicar SDEs com esses parâmetros → gerar S[t], V[t]
//   5. regime[t] já estava determinado; não muda retroativamente
//
// Threshold duplo (vol + drawdown) = bifurcação de estado.
// Vol realizada (EMA 5 dias) evita saltos espúrios por ruído único.
// ============================================================

function gaussianPair() {
  const u1 = Math.max(Math.random(), 1e-10);
  const u2 = Math.random();
  const mag = Math.sqrt(-2.0 * Math.log(u1));
  return [mag * Math.cos(2 * Math.PI * u2), mag * Math.sin(2 * Math.PI * u2)];
}

// ── Núcleo de regime: função pura do estado (t-1) ──────────────
// Entrada: vol instantânea √V[t-1], drawdown corrente, vol_realizada EMA
// Saída: {id, kappaMult, thetaMult, sigmaMult, muMult}
//
// Regime 0 — CALMO:      vol < θ_calm  E drawdown > −8%
// Regime 1 — TRANSIÇÃO:  vol ∈ [θ_calm, θ_crisis) OU drawdown ∈ [−8%, −15%)
// Regime 2 — CRISE:      vol ≥ θ_crisis OU drawdown ≤ −15%
//            (crise é absorvente no curto prazo via κ reduzido)
//
// Os multiplicadores são a força causal:
//   - Em crise: κ cai (reversão mais lenta → vol persiste), θ sobe
//   - Em transição: efeito intermediário
//   - Em calmo: parâmetros base do ativo

function regimeFromState(vol_inst, vol_ema, drawdown, stock) {
  const calm_thresh  = Math.sqrt(stock.theta) * 0.90;  // ~90% da vol de longo prazo
  const crisis_thresh = Math.sqrt(stock.theta) * 1.65; // ~165% da vol longo prazo

  // Threshold primário: vol realizada (EMA) mais robusta que vol instantânea
  const vol_signal = 0.6 * vol_ema + 0.4 * vol_inst;

  const vol_crisis    = vol_signal >= crisis_thresh;
  const vol_transit   = vol_signal >= calm_thresh && !vol_crisis;
  const dd_crisis     = drawdown <= -0.15;
  const dd_transit    = drawdown <= -0.08 && !dd_crisis;

  // Regime = OR lógico dos dois sinais (vol E drawdown são gatilhos independentes)
  if (vol_crisis || dd_crisis) {
    return {
      id: 2,
      // Crise: reversão mais lenta (κ × 0.5), atrator maior (θ × 2.0),
      // vol-da-vol amplificada (σ × feedbackMult), drift penalizado
      kappaMult: 0.50,
      thetaMult: 2.00,
      sigmaMult: 1.00,  // feedbackMult aplicado externamente
      muPenalty: -0.04, // pressão vendedora estrutural
    };
  }
  if (vol_transit || dd_transit) {
    return {
      id: 1,
      kappaMult: 0.80,
      thetaMult: 1.35,
      sigmaMult: 1.00,
      muPenalty: -0.01,
    };
  }
  return {
    id: 0,
    kappaMult: 1.10, // calmo: reversão mais rápida ao equilíbrio
    thetaMult: 0.90, // vol-alvo ligeiramente abaixo da média
    sigmaMult: 1.00,
    muPenalty:  0.0,
  };
}

function simulatePath(stock, feedbackMult, dt = 1/252) {
  const T = 252;
  const S         = new Float64Array(T);
  const V         = new Float64Array(T);
  const regime    = new Uint8Array(T);
  const drawdown  = new Float64Array(T);
  const volEma    = new Float64Array(T);  // vol realizada EMA-5

  S[0]      = stock.price;
  V[0]      = stock.V0;
  volEma[0] = Math.sqrt(stock.V0);

  // Regime t=0 determinado pelo estado inicial
  const r0 = regimeFromState(Math.sqrt(stock.V0), volEma[0], 0, stock);
  regime[0] = r0.id;

  let peakS = stock.price;
  const emaAlpha = 2 / (5 + 1); // EMA-5 dias

  for (let t = 1; t < T; t++) {
    // ── 1. ESTADO EM t-1 ─────────────────────────────────────
    const vol_prev = Math.sqrt(Math.max(V[t - 1], 1e-8));
    const dd_prev  = drawdown[t - 1];
    const ve_prev  = volEma[t - 1];

    // ── 2. REGIME[t] DETERMINADO PELO ESTADO[t-1] ────────────
    //    Este é o ponto causal: regime governa a SDE que vem DEPOIS
    const reg = regimeFromState(vol_prev, ve_prev, dd_prev, stock);
    regime[t] = reg.id;

    // ── 3. PARÂMETROS EFETIVOS para o passo t ────────────────
    const kappa_eff = stock.kappa * reg.kappaMult;
    const theta_eff = stock.theta * reg.thetaMult;
    // Em crise, sigma_vv = stock.sigma × feedbackMult (feedback endógeno)
    const sigma_eff = stock.sigma * reg.sigmaMult * (reg.id === 2 ? feedbackMult : 1.0);
    const mu_eff    = stock.mu + reg.muPenalty;

    // ── 4. SDEs DE HESTON COM PARÂMETROS CONDICIONAIS ────────
    const [dW1] = gaussianPair();
    const [dW2] = gaussianPair();
    const sqdt  = Math.sqrt(dt);
    const dW_S  = dW1 * sqdt;
    const dW_V  = (stock.rho * dW1 + Math.sqrt(Math.max(1 - stock.rho ** 2, 0)) * dW2) * sqdt;

    // dS = μ_eff · S · dt + √V · S · dW_S
    S[t] = S[t - 1] * Math.exp((mu_eff - 0.5 * V[t - 1]) * dt + vol_prev * dW_S);

    // dV = κ_eff · (θ_eff − V) · dt + σ_eff · √V · dW_V  [CIR com parâmetros de regime]
    V[t] = Math.max(
      V[t - 1] + kappa_eff * (theta_eff - V[t - 1]) * dt + sigma_eff * vol_prev * dW_V,
      1e-8
    );

    // ── 5. ESTADO t ATUALIZADO ────────────────────────────────
    volEma[t]   = emaAlpha * Math.sqrt(V[t]) + (1 - emaAlpha) * ve_prev;
    peakS       = Math.max(peakS, S[t]);
    drawdown[t] = (S[t] - peakS) / peakS;
  }

  return { S, V, regime, drawdown, volEma };
}

function runMC(stock, nPaths, feedbackMult) {
  const paths = Array.from({ length: nPaths }, () => simulatePath(stock, feedbackMult));
  const finals = paths.map(p => p.S[251]).sort((a, b) => a - b);
  return {
    paths,
    stock,
    stats: {
      p01: finals[Math.floor(0.01 * nPaths)],
      p05: finals[Math.floor(0.05 * nPaths)],
      p25: finals[Math.floor(0.25 * nPaths)],
      p50: finals[Math.floor(0.50 * nPaths)],
      p75: finals[Math.floor(0.75 * nPaths)],
      p95: finals[Math.floor(0.95 * nPaths)],
      p99: finals[Math.floor(0.99 * nPaths)],
      mean: finals.reduce((a, b) => a + b, 0) / nPaths,
    },
  };
}

// ============================================================
// CANVAS RENDERERS
// ============================================================

const RC = {
  0: { s:"#00ffc8", g:"rgba(0,255,200,0.10)", l:"CALMO" },
  1: { s:"#ffb800", g:"rgba(255,184,0,0.10)", l:"TRANSIÇÃO" },
  2: { s:"#ff2d55", g:"rgba(255,45,85,0.10)", l:"CRISE" },
};

// ── DINÂMICA CAUSAL ──────────────────────────────────────────
// Exibe a sequência causal numa trajetória mediana:
//   FAIXA SUPERIOR  = regime[t] (determinado em t pelo estado t-1)
//   LINHA ROXA      = vol EMA[t-1]  ← SINAL que determinou o regime
//   LINHA CINZA     = √V[t]         ← RESULTADO das SDEs condicionais
// A separação entre sinal e resultado torna a causalidade visível.
function drawCausal(canvas, result) {
  if (!result || !canvas.getBoundingClientRect().width) return;
  const { ctx, W, H } = prep(canvas);
  const { paths } = result;
  const T = 252;

  // Trajetória mediana (por vol final)
  const sorted = [...paths].sort((a, b) => Math.sqrt(b.V[T-1]) - Math.sqrt(a.V[T-1]));
  const path = sorted[Math.floor(sorted.length / 2)];
  const veArr = path.volEma || new Float64Array(T);
  const viArr = Array.from({ length: T }, (_, i) => Math.sqrt(Math.max(path.V[i], 0)));

  const PAD = { l: 6, r: 6, t: 6, b: 18 };
  const toX = t => PAD.l + (t / (T - 1)) * (W - PAD.l - PAD.r);
  const REGIME_H = 14;

  // Faixa de regime
  for (let t = 1; t < T; t++) {
    const x0 = toX(t - 1); const x1 = toX(t);
    ctx.fillStyle = RC[path.regime[t]].s;
    ctx.globalAlpha = 0.55;
    ctx.fillRect(x0, PAD.t, x1 - x0 + 0.5, REGIME_H);
  }
  ctx.globalAlpha = 1;

  // Linha divisória
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(PAD.l, PAD.t + REGIME_H + 4);
  ctx.lineTo(W - PAD.r, PAD.t + REGIME_H + 4); ctx.stroke();

  // Área de gráfico
  const chartTop = PAD.t + REGIME_H + 6;
  const chartH   = H - chartTop - PAD.b;
  const allV     = [...Array.from(veArr), ...viArr];
  const minV = Math.min(...allV); const maxV = Math.max(...allV) * 1.06;
  const toY  = v => chartTop + chartH - ((v - minV) / (maxV - minV)) * chartH;

  // Área vol EMA
  ctx.globalAlpha = 0.07; ctx.fillStyle = "#7c6aff";
  ctx.beginPath(); ctx.moveTo(toX(0), toY(veArr[0]));
  for (let t = 1; t < T; t++) ctx.lineTo(toX(t), toY(veArr[t]));
  ctx.lineTo(toX(T-1), chartTop + chartH); ctx.lineTo(toX(0), chartTop + chartH);
  ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1;

  // Vol EMA — SINAL CAUSAL
  ctx.beginPath(); ctx.strokeStyle = "#7c6aff"; ctx.lineWidth = 1.8;
  ctx.moveTo(toX(0), toY(veArr[0]));
  for (let t = 1; t < T; t++) ctx.lineTo(toX(t), toY(veArr[t]));
  ctx.stroke();

  // √V instantânea — RESULTADO
  ctx.beginPath(); ctx.strokeStyle = "rgba(255,255,255,0.30)"; ctx.lineWidth = 0.7;
  ctx.setLineDash([2, 3]);
  ctx.moveTo(toX(0), toY(viArr[0]));
  for (let t = 1; t < T; t++) ctx.lineTo(toX(t), toY(viArr[t]));
  ctx.stroke(); ctx.setLineDash([]);

  // Linhas verticais nas transições de regime
  let pr = path.regime[0];
  for (let t = 1; t < T; t++) {
    if (path.regime[t] !== pr) {
      const x = toX(t);
      ctx.strokeStyle = RC[path.regime[t]].s; ctx.lineWidth = 1;
      ctx.globalAlpha = 0.4; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(x, PAD.t + REGIME_H + 4); ctx.lineTo(x, chartTop + chartH);
      ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1;
      pr = path.regime[t];
    }
  }

  // Labels
  ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.font = "8px monospace";
  ctx.textAlign = "left"; ctx.fillText("REGIME → causa", PAD.l + 2, PAD.t + 10);
  ctx.fillStyle = "#7c6aff"; ctx.fillText("vol EMA (sinal)", PAD.l + 2, H - 5);
  ctx.fillStyle = "rgba(255,255,255,0.28)";
  ctx.textAlign = "right"; ctx.fillText("√V resultado", W - PAD.r - 2, H - 5);
}

function prep(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const r = canvas.getBoundingClientRect();
  canvas.width = r.width * dpr;
  canvas.height = r.height * dpr;
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  return { ctx, W: r.width, H: r.height };
}

function drawFan(canvas, result, tab) {
  if (!result || !canvas.getBoundingClientRect().width) return;
  const { ctx, W, H } = prep(canvas);
  const { paths, stock } = result;
  const T = 252;
  const PAD = { l: 48, r: 16, t: 28, b: 22 };
  const toX = t => PAD.l + (t / (T - 1)) * (W - PAD.l - PAD.r);

  const getData = (p, t) =>
    tab === "price" ? p.S[t]
    : tab === "vol" ? Math.sqrt(Math.max(p.V[t], 0)) * 100
    : p.drawdown[t] * 100;

  let lo = Infinity, hi = -Infinity;
  paths.forEach(p => {
    for (let t = 0; t < T; t++) {
      const v = getData(p, t);
      if (v < lo) lo = v;
      if (v > hi) hi = v;
    }
  });
  const pad = (hi - lo) * 0.08;
  lo -= pad; hi += pad;
  const toY = v => H - PAD.b - ((v - lo) / (hi - lo)) * (H - PAD.t - PAD.b);

  // Grid
  for (let i = 0; i <= 4; i++) {
    const v = lo + (i / 4) * (hi - lo);
    const y = toY(v);
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(PAD.l, y); ctx.lineTo(W - PAD.r, y); ctx.stroke();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.font = "9px monospace";
    ctx.textAlign = "right";
    const lbl = tab === "price" ? (v / stock.price * 100).toFixed(0) + "%"
              : v.toFixed(1) + "%";
    ctx.fillText(lbl, PAD.l - 4, y + 3);
  }

  // Trajetórias
  const sample = paths.slice(0, 120);
  sample.forEach(p => {
    ctx.globalAlpha = 0.15;
    ctx.lineWidth = 0.7;
    let pr = p.regime[0];
    ctx.beginPath();
    ctx.moveTo(toX(0), toY(getData(p, 0)));
    for (let t = 1; t < T; t++) {
      const r = p.regime[t];
      if (r !== pr) {
        ctx.strokeStyle = RC[pr].s;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(toX(t - 1), toY(getData(p, t - 1)));
        pr = r;
      }
      ctx.lineTo(toX(t), toY(getData(p, t)));
    }
    ctx.strokeStyle = RC[pr].s;
    ctx.stroke();
    ctx.globalAlpha = 1;
  });

  // Percentis por timestep
  const pcts = [5, 25, 50, 75, 95].reduce((acc, p) => ({ ...acc, [p]: [] }), {});
  for (let t = 0; t < T; t++) {
    const vals = paths.map(p => getData(p, t)).sort((a, b) => a - b);
    [5, 25, 50, 75, 95].forEach(p => {
      pcts[p].push(vals[Math.max(0, Math.floor(p / 100 * vals.length) - 1)]);
    });
  }

  // Faixa p5–p95
  ctx.globalAlpha = 0.08;
  ctx.fillStyle = "#7c6aff";
  ctx.beginPath();
  ctx.moveTo(toX(0), toY(pcts[5][0]));
  for (let t = 1; t < T; t++) ctx.lineTo(toX(t), toY(pcts[5][t]));
  for (let t = T - 1; t >= 0; t--) ctx.lineTo(toX(t), toY(pcts[95][t]));
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  // p25/p75
  [[25, "rgba(124,106,255,0.4)"], [75, "rgba(124,106,255,0.4)"]].forEach(([p, col]) => {
    ctx.beginPath(); ctx.strokeStyle = col; ctx.lineWidth = 1.2;
    ctx.setLineDash([5, 5]);
    ctx.moveTo(toX(0), toY(pcts[p][0]));
    for (let t = 1; t < T; t++) ctx.lineTo(toX(t), toY(pcts[p][t]));
    ctx.stroke(); ctx.setLineDash([]);
  });

  // Mediana
  ctx.beginPath(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 2.2;
  ctx.moveTo(toX(0), toY(pcts[50][0]));
  for (let t = 1; t < T; t++) ctx.lineTo(toX(t), toY(pcts[50][t]));
  ctx.stroke();

  // Linha base S0
  if (tab === "price") {
    const y0 = toY(stock.price);
    ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
    ctx.setLineDash([3, 3]);
    ctx.beginPath(); ctx.moveTo(PAD.l, y0); ctx.lineTo(W - PAD.r, y0); ctx.stroke();
    ctx.setLineDash([]);
  }

  // Eixo X
  const months = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
  ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.font = "9px monospace"; ctx.textAlign = "center";
  months.forEach((m, i) => ctx.fillText(m, toX(Math.floor(i / 11 * (T - 1))), H - 5));
}

function drawRegimes(canvas, result) {
  if (!result || !canvas.getBoundingClientRect().width) return;
  const { ctx, W, H } = prep(canvas);
  const { paths } = result;
  const T = 252;
  const N = Math.min(paths.length, 300);
  for (let t = 0; t < T; t++) {
    const c = [0, 0, 0];
    for (let i = 0; i < N; i++) c[paths[i].regime[t]]++;
    const x = (t / (T - 1)) * W;
    const w = Math.max(W / T + 0.5, 1.5);
    let y = 0;
    [0, 1, 2].forEach(r => {
      const h = (c[r] / N) * H;
      ctx.fillStyle = RC[r].s; ctx.globalAlpha = 0.78;
      ctx.fillRect(x, y, w, h); y += h;
    });
  }
  ctx.globalAlpha = 1;
}

function drawHist(canvas, result) {
  if (!result || !canvas.getBoundingClientRect().width) return;
  const { ctx, W, H } = prep(canvas);
  const { paths, stats, stock } = result;
  const finals = paths.map(p => p.S[251]);
  const mn = Math.min(...finals), mx = Math.max(...finals);
  const bins = 44, bw = (mx - mn) / bins;
  const counts = new Array(bins).fill(0);
  finals.forEach(v => { counts[Math.min(Math.floor((v - mn) / bw), bins - 1)]++; });
  const maxC = Math.max(...counts);
  const bpx = (W - 32) / bins;
  counts.forEach((c, i) => {
    const x = 16 + i * bpx;
    const bh = (c / maxC) * (H - 28);
    const mid = mn + (i + 0.5) * bw;
    const col = mid < stats.p05 ? RC[2].s : mid > stats.p95 ? RC[0].s : "#7c6aff";
    ctx.fillStyle = col; ctx.globalAlpha = mid < stats.p05 || mid > stats.p95 ? 0.85 : 0.5;
    ctx.fillRect(x, H - 14 - bh, Math.max(bpx - 0.5, 0.5), bh);
  });
  ctx.globalAlpha = 1;
  const x0 = 16 + ((stock.price - mn) / (mx - mn)) * (W - 32);
  ctx.strokeStyle = "rgba(255,255,255,0.4)"; ctx.lineWidth = 1;
  ctx.setLineDash([3, 3]);
  ctx.beginPath(); ctx.moveTo(x0, 0); ctx.lineTo(x0, H - 14); ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = "rgba(255,255,255,0.4)"; ctx.font = "9px monospace"; ctx.textAlign = "center";
  ctx.fillText("S₀", x0, H - 2);
}

function drawPhase(canvas, result) {
  if (!result || !canvas.getBoundingClientRect().width) return;
  const { ctx, W, H } = prep(canvas);
  const { paths } = result;
  const sample = paths.slice(0, 100);
  sample.forEach(p => {
    for (let t = 1; t < 252; t += 2) {
      const vol = Math.sqrt(Math.max(p.V[t], 0)) * 100;
      const dd = p.drawdown[t] * 100;
      const x = 16 + Math.min(Math.max(vol / 80, 0), 1) * (W - 32);
      const y = H - 12 - Math.min(Math.max((dd + 40) / 40, 0), 1) * (H - 26);
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = RC[p.regime[t]].s; ctx.globalAlpha = 0.28; ctx.fill();
    }
  });
  ctx.globalAlpha = 1;
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(16, H - 12); ctx.lineTo(W - 16, H - 12);
  ctx.moveTo(16, 6); ctx.lineTo(16, H - 12); ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.22)"; ctx.font = "9px monospace";
  ctx.textAlign = "center"; ctx.fillText("VOL% →", W / 2, H);
  ctx.save(); ctx.translate(9, H / 2); ctx.rotate(-Math.PI / 2);
  ctx.fillText("DD% ↑", 0, 0); ctx.restore();
}

// ============================================================
// CSS
// ============================================================

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Syne:wght@400;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #03050c;
    --s1: #070b16;
    --s2: #0b1020;
    --b: rgba(255,255,255,0.055);
    --calm: #00ffc8;
    --trans: #ffb800;
    --crisis: #ff2d55;
    --txt: #d8e0ef;
    --mut: #3a4a62;
    --acc: #7c6aff;
  }
  html, body { background: var(--bg); color: var(--txt); font-family: 'Space Mono', monospace; height: 100%; overflow-x: hidden; }
  .app {
    min-height: 100vh;
    background:
      radial-gradient(ellipse 55% 45% at 12% 0%, rgba(124,106,255,0.07) 0%, transparent 55%),
      radial-gradient(ellipse 45% 35% at 88% 100%, rgba(0,255,200,0.04) 0%, transparent 55%),
      var(--bg);
    display: flex; flex-direction: column;
  }

  /* HEADER */
  .hdr {
    padding: 22px 32px 18px;
    border-bottom: 1px solid var(--b);
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px;
  }
  .htit { font-family:'Syne',sans-serif; font-size: clamp(16px,2vw,22px); font-weight:800; color:#fff; letter-spacing:-.02em; }
  .htit em { color:var(--calm); font-style:normal; }
  .hsub { font-size:9px; color:var(--mut); letter-spacing:.1em; text-transform:uppercase; margin-top:4px; }
  .bdg { font-size:9px; padding:3px 8px; border-radius:3px; border:1px solid; letter-spacing:.07em; text-transform:uppercase; font-weight:700; }

  /* SEARCH BAR */
  .search-bar {
    padding: 12px 32px;
    background: var(--s1);
    border-bottom: 1px solid var(--b);
    display: flex; gap: 10px; flex-wrap: wrap; align-items: center;
  }
  .search-input {
    flex: 1; min-width: 180px;
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--b);
    border-radius: 5px;
    padding: 8px 12px;
    color: #fff;
    font-family: 'Space Mono', monospace;
    font-size: 11px;
    outline: none;
    transition: border-color .2s;
  }
  .search-input:focus { border-color: var(--acc); }
  .search-input::placeholder { color: var(--mut); }
  select.flt {
    background: rgba(255,255,255,0.04);
    border: 1px solid var(--b);
    border-radius: 5px;
    padding: 8px 10px;
    color: var(--txt);
    font-family: 'Space Mono', monospace;
    font-size: 10px;
    cursor: pointer;
    outline: none;
  }
  select.flt:focus { border-color: var(--acc); }
  .count-badge { font-size:9px; color:var(--mut); white-space:nowrap; }

  /* MAIN LAYOUT */
  .main { display: grid; grid-template-columns: 320px 1fr; flex: 1; }

  /* STOCK LIST */
  .stock-list {
    border-right: 1px solid var(--b);
    overflow-y: auto;
    max-height: calc(100vh - 130px);
  }
  .stock-item {
    padding: 10px 16px;
    border-bottom: 1px solid rgba(255,255,255,0.03);
    cursor: pointer;
    transition: background .15s;
    display: flex; align-items: center; gap: 10px;
  }
  .stock-item:hover { background: rgba(255,255,255,0.03); }
  .stock-item.active { background: rgba(124,106,255,0.12); border-left: 2px solid var(--acc); }
  .tk {
    font-family:'Syne',sans-serif; font-weight:800; font-size:12px;
    color:#fff; min-width: 52px;
  }
  .sn { font-size:9px; color:var(--mut); overflow:hidden; text-overflow:ellipsis; white-space:nowrap; flex:1; }
  .si-right { text-align:right; flex-shrink:0; }
  .sp { font-size:10px; color:var(--txt); font-weight:700; }
  .sv { font-size:9px; color:var(--mut); }
  .vol-dot {
    width:6px; height:6px; border-radius:50%; flex-shrink:0;
  }

  /* CHART AREA */
  .charts { display:flex; flex-direction:column; overflow:hidden; }
  .ctrls {
    padding: 14px 24px;
    background: var(--s1);
    border-bottom: 1px solid var(--b);
    display: flex; align-items: center; gap: 16px; flex-wrap: wrap;
  }
  .stock-hero { display:flex; flex-direction:column; gap:2px; }
  .hero-tk { font-family:'Syne',sans-serif; font-size:20px; font-weight:800; color:#fff; }
  .hero-name { font-size:9px; color:var(--mut); letter-spacing:.05em; }
  .hero-meta { display:flex; gap:10px; align-items:center; margin-top:4px; flex-wrap:wrap; }
  .chip { font-size:8px; padding:2px 7px; border-radius:3px; border:1px solid var(--b); color:var(--mut); }
  .chip.sec { border-color:rgba(124,106,255,0.3); color:var(--acc); }
  .divv { width:1px; height:32px; background:var(--b); flex-shrink:0; }
  .prow { display:flex; align-items:center; gap:14px; }
  .pl { font-size:9px; color:var(--mut); letter-spacing:.08em; text-transform:uppercase; }
  .sl {
    -webkit-appearance:none; height:3px; border-radius:2px; cursor:pointer;
    background: linear-gradient(to right, var(--acc) var(--p,50%), rgba(255,255,255,0.07) var(--p,50%));
    width: 80px;
  }
  .sl::-webkit-slider-thumb { -webkit-appearance:none; width:11px; height:11px; border-radius:50%; background:#fff; border:2px solid var(--acc); cursor:pointer; }
  .sv2 { font-size:10px; color:#fff; font-weight:700; min-width:28px; }
  .btn-run {
    padding:8px 18px; border:1px solid var(--calm); background:rgba(0,255,200,0.06);
    color:var(--calm); font-family:'Space Mono',monospace; font-size:10px; font-weight:700;
    letter-spacing:.08em; text-transform:uppercase; cursor:pointer; border-radius:5px;
    transition:all .2s; white-space:nowrap;
  }
  .btn-run:hover { background:rgba(0,255,200,0.14); box-shadow:0 0 16px rgba(0,255,200,0.12); }
  .btn-run:disabled { opacity:.45; cursor:not-allowed; }

  /* METRICS ROW */
  .metrics {
    display:flex; gap:0;
    border-bottom: 1px solid var(--b);
    background: var(--s2);
  }
  .met {
    flex:1; padding:10px 14px;
    border-right: 1px solid var(--b);
    text-align:center;
  }
  .met:last-child { border-right:none; }
  .mk { font-size:8px; color:var(--mut); letter-spacing:.08em; text-transform:uppercase; margin-bottom:3px; }
  .mv { font-family:'Syne',sans-serif; font-size:14px; font-weight:800; }

  /* CHART PANELS */
  .fan-wrap { flex:1; position:relative; padding:16px 20px; }
  .tabs { display:flex; gap:2px; background:rgba(255,255,255,0.03); border-radius:5px; padding:3px; width:fit-content; margin-bottom:12px; }
  .tab { padding:5px 12px; font-family:'Space Mono',monospace; font-size:9px; text-transform:uppercase; letter-spacing:.08em; border:none; background:transparent; color:var(--mut); cursor:pointer; border-radius:4px; transition:all .18s; }
  .tab.active { background:rgba(124,106,255,0.2); color:var(--acc); }
  .cwrap { position:relative; background:rgba(0,0,0,0.15); border-radius:5px; overflow:hidden; border:1px solid var(--b); }
  .clbl { position:absolute; top:8px; left:12px; font-size:8px; letter-spacing:.1em; text-transform:uppercase; color:var(--mut); pointer-events:none; }
  canvas { display:block; width:100%; }
  .btm { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; border-top:1px solid var(--b); }
  .bpan { padding:14px 16px; border-right:1px solid var(--b); }
  .bpan:last-child { border-right:none; }
  .bp-title { font-family:'Syne',sans-serif; font-size:9px; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--mut); margin-bottom:10px; display:flex; align-items:center; gap:6px; }
  .bp-title::before { content:''; width:3px; height:3px; border-radius:50%; background:var(--acc); }
  .bpnote { font-size:8px; color:var(--mut); margin-top:7px; line-height:1.6; }

  /* SPIN */
  .spin { display:inline-block; width:12px; height:12px; border:2px solid rgba(0,255,200,.2); border-top-color:var(--calm); border-radius:50%; animation:spin .7s linear infinite; margin-right:7px; vertical-align:middle; }
  @keyframes spin { to { transform:rotate(360deg); } }
  .ldbar { position:absolute; bottom:0; left:0; height:2px; background:var(--calm); border-radius:1px; animation:ld 1.1s ease-in-out infinite; }
  @keyframes ld { 0%{width:0;opacity:1} 70%{width:100%;opacity:1} 100%{width:100%;opacity:0} }

  /* EMPTY STATE */
  .empty { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:10px; color:var(--mut); padding:40px; text-align:center; }
  .empty-icon { font-size:36px; opacity:.5; }
  .empty-txt { font-family:'Syne',sans-serif; font-size:16px; font-weight:700; color:rgba(255,255,255,0.2); }
  .empty-sub { font-size:10px; color:var(--mut); }

  /* REGIME LEGEND */
  .rl { display:flex; gap:8px; flex-wrap:wrap; }
  .ri { display:flex; align-items:center; gap:6px; font-size:9px; padding:3px 8px; border-radius:4px; border:1px solid; }
  .rdot { width:5px; height:5px; border-radius:50%; }

  /* SCROLLBAR */
  .stock-list::-webkit-scrollbar { width:4px; }
  .stock-list::-webkit-scrollbar-track { background:transparent; }
  .stock-list::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.08); border-radius:2px; }

  @media (max-width:768px) {
    .main { grid-template-columns:1fr; }
    .stock-list { max-height:220px; }
    .btm { grid-template-columns:1fr 1fr; }
  }
`;

// ============================================================
// COMPONENTE
// ============================================================

export default function App() {
  const [query, setQuery] = useState("");
  const [filterSector, setFilterSector] = useState("ALL");
  const [filterCountry, setFilterCountry] = useState("ALL");
  const [selected, setSelected] = useState(STOCKS_DB[0]);
  const [nPaths, setNPaths] = useState(400);
  const [feedback, setFeedback] = useState(1.4);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("price");

  const refs = { fan: useRef(null), reg: useRef(null), hist: useRef(null), phase: useRef(null), causal: useRef(null) };

  const filtered = useMemo(() => {
    return STOCKS_DB.filter(s => {
      const q = query.toLowerCase();
      const matchQ = !q || s.ticker.toLowerCase().includes(q) || s.name.toLowerCase().includes(q);
      const matchS = filterSector === "ALL" || s.sector === filterSector;
      const matchC = filterCountry === "ALL" || s.country === filterCountry;
      return matchQ && matchS && matchC;
    });
  }, [query, filterSector, filterCountry]);

  const run = useCallback(() => {
    if (!selected) return;
    setLoading(true);
    requestAnimationFrame(() => setTimeout(() => {
      const r = runMC(selected, nPaths, feedback);
      setResult(r);
      setLoading(false);
    }, 30));
  }, [selected, nPaths, feedback]);

  // Auto-run on stock change
  useEffect(() => { if (selected) run(); }, [selected]);

  // Redraw on result/tab change
  useEffect(() => {
    if (!result) return;
    const draw = () => {
      if (refs.fan.current)    drawFan(refs.fan.current, result, tab);
      if (refs.reg.current)    drawRegimes(refs.reg.current, result);
      if (refs.hist.current)   drawHist(refs.hist.current, result);
      if (refs.phase.current)  drawPhase(refs.phase.current, result);
      if (refs.causal.current) drawCausal(refs.causal.current, result);
    };
    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [result, tab]);

  const regimePcts = useMemo(() => {
    if (!result) return ["–","–","–"];
    const c = [0,0,0]; let tot = 0;
    result.paths.forEach(p => p.regime.forEach(r => { c[r]++; tot++; }));
    return c.map(v => ((v / tot) * 100).toFixed(1) + "%");
  }, [result]);

  const volColor = (av) => av < 0.20 ? RC[0].s : av < 0.35 ? RC[1].s : RC[2].s;

  const retPct = result
    ? ((result.stats.mean / result.stock.price - 1) * 100).toFixed(1)
    : null;

  return (
    <>
      <style>{CSS}</style>
      <div className="app">
        {/* HEADER */}
        <div className="hdr">
          <div>
            <div className="htit">Volatility <em>Regime</em> Engine</div>
            <div className="hsub">Heston · Hamilton · Monte Carlo · Feedback Loops</div>
          </div>
          <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
            <span className="bdg" style={{ borderColor:"#7c6aff40", color:"#7c6aff" }}>Heston SDE</span>
            <span className="bdg" style={{ borderColor:"#00ffc840", color:"#00ffc8" }}>Regime Endógeno</span>
            <span className="bdg" style={{ borderColor:"#ffb80040", color:"#ffb800" }}>{STOCKS_DB.length} Ações</span>
            <span className="bdg" style={{ borderColor:"#ff2d5540", color:"#ff2d55" }}>USA + EU</span>
          </div>
        </div>

        {/* SEARCH BAR */}
        <div className="search-bar">
          <input className="search-input" placeholder="🔍  Buscar ticker ou empresa…"
            value={query} onChange={e => setQuery(e.target.value)} />
          <select className="flt" value={filterSector} onChange={e => setFilterSector(e.target.value)}>
            <option value="ALL">Todos os Setores</option>
            {SECTORS_ALL.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="flt" value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
            <option value="ALL">Todos os Países</option>
            {COUNTRIES_ALL.map(c => <option key={c} value={c}>{FLAG[c]} {COUNTRY_NAME[c]}</option>)}
          </select>
          <span className="count-badge">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* MAIN */}
        <div className="main" style={{ flex: 1 }}>

          {/* STOCK LIST */}
          <div className="stock-list">
            {filtered.length === 0 && (
              <div style={{ padding:24, textAlign:"center", color:"var(--mut)", fontSize:11 }}>
                Nenhum resultado para "{query}"
              </div>
            )}
            {filtered.map(s => (
              <div key={s.ticker + s.country}
                className={`stock-item ${selected?.ticker === s.ticker && selected?.country === s.country ? "active" : ""}`}
                onClick={() => setSelected(s)}>
                <div className="vol-dot" style={{ background: volColor(s.annVol) }} />
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    <span className="tk">{s.ticker}</span>
                    <span style={{ fontSize:8, color:"var(--mut)" }}>{FLAG[s.country]}</span>
                  </div>
                  <div className="sn">{s.name}</div>
                  <div style={{ fontSize:8, color:"var(--mut)", marginTop:2 }}>{s.sector} · {s.exchange}</div>
                </div>
                <div className="si-right">
                  <div className="sp">{s.price.toLocaleString()}</div>
                  <div className="sv">β {s.beta.toFixed(2)}</div>
                  <div style={{ fontSize:8, color: volColor(s.annVol) }}>{(s.annVol*100).toFixed(0)}% vol</div>
                </div>
              </div>
            ))}
          </div>

          {/* CHARTS */}
          <div className="charts">
            {!selected ? (
              <div className="empty">
                <div className="empty-icon">📊</div>
                <div className="empty-txt">Selecione uma ação</div>
                <div className="empty-sub">Clique em qualquer ticker na lista à esquerda</div>
              </div>
            ) : (
              <>
                {/* CONTROLS */}
                <div className="ctrls">
                  <div className="stock-hero">
                    <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                      <span className="hero-tk">{selected.ticker}</span>
                      <span style={{ fontSize:14 }}>{FLAG[selected.country]}</span>
                    </div>
                    <div className="hero-name">{selected.name}</div>
                    <div className="hero-meta">
                      <span className="chip sec">{selected.sector}</span>
                      <span className="chip">{selected.exchange}</span>
                      <span className="chip">β {selected.beta.toFixed(2)}</span>
                      <span className="chip" style={{ color: volColor(selected.annVol), borderColor: volColor(selected.annVol) + "40" }}>
                        σ {(selected.annVol*100).toFixed(0)}% vol/ano
                      </span>
                    </div>
                  </div>

                  <div className="divv" />

                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    <div className="prow">
                      <span className="pl">N Paths</span>
                      <input type="range" className="sl" min="100" max="1500" step="50"
                        value={nPaths} style={{ "--p": `${((nPaths-100)/1400*100).toFixed(0)}%` }}
                        onChange={e => setNPaths(+e.target.value)} />
                      <span className="sv2">{nPaths}</span>
                    </div>
                    <div className="prow">
                      <span className="pl">Feedback</span>
                      <input type="range" className="sl" min="1.0" max="3.0" step="0.1"
                        value={feedback} style={{ "--p": `${((feedback-1)/2*100).toFixed(0)}%` }}
                        onChange={e => setFeedback(+e.target.value)} />
                      <span className="sv2">{feedback.toFixed(1)}×</span>
                    </div>
                  </div>

                  <button className="btn-run" onClick={run} disabled={loading}>
                    {loading ? <><span className="spin"/>Simulando…</> : "▶ Simular"}
                  </button>

                  {result && (
                    <div className="rl" style={{ marginLeft:"auto" }}>
                      {[0,1,2].map(r => (
                        <div key={r} className="ri" style={{ borderColor: RC[r].s+"30", background: RC[r].g }}>
                          <div className="rdot" style={{ background: RC[r].s }} />
                          <span style={{ color: RC[r].s }}>{RC[r].l}</span>
                          <span style={{ color:"var(--mut)" }}>{regimePcts[r]}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* METRICS */}
                {result && (
                  <div className="metrics">
                    {[
                      ["P1 — Tail Extremo", result.stats.p01, "down"],
                      ["P5 — Tail Risk",    result.stats.p05, "down"],
                      ["P25 — Downside",    result.stats.p25, "mut"],
                      ["Mediana (P50)",      result.stats.p50, "neu"],
                      ["P75 — Upside",      result.stats.p75, "mut"],
                      ["P95 — Upside Risk", result.stats.p95, "up"],
                      ["P99 — Extremo",     result.stats.p99, "up"],
                      ["Retorno Médio",     null, "ret"],
                    ].map(([lbl, val, type]) => (
                      <div className="met" key={lbl}>
                        <div className="mk">{lbl}</div>
                        <div className="mv" style={{
                          color: type === "down" ? "#ff2d55"
                               : type === "up" ? "#00ffc8"
                               : type === "ret" ? (parseFloat(retPct) >= 0 ? "#00ffc8" : "#ff2d55")
                               : "#fff"
                        }}>
                          {type === "ret"
                            ? (retPct >= 0 ? "+" : "") + retPct + "%"
                            : val < 1
                              ? val.toFixed(4)
                              : val > 5000
                                ? (val/1000).toFixed(1)+"k"
                                : val.toFixed(1)
                          }
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* FAN CHART */}
                <div className="fan-wrap" style={{ position:"relative" }}>
                  {loading && <div className="ldbar" />}
                  <div className="tabs">
                    {[["price","Preço"],["vol","Volatilidade %"],["drawdown","Drawdown"]].map(([k,l]) => (
                      <button key={k} className={`tab ${tab===k?"active":""}`} onClick={() => setTab(k)}>{l}</button>
                    ))}
                  </div>
                  <div className="cwrap" style={{ height:280 }}>
                    <div className="clbl">Fan · {nPaths} trajetórias · Mediana + P25/P75 + Banda P5/P95</div>
                    <canvas ref={refs.fan} style={{ height:280 }} />
                  </div>
                </div>

                {/* BOTTOM 4 */}
                <div className="btm">
                  <div className="bpan">
                    <div className="bp-title">Dinâmica Causal</div>
                    <div className="cwrap" style={{ height:130 }}>
                      <canvas ref={refs.causal} style={{ height:130 }} />
                    </div>
                    <div className="bpnote">
                      <span style={{color:"var(--acc)"}}>■ regime[t]</span> determina κ, θ, σ da SDE antes do cálculo de <span style={{color:"rgba(255,255,255,0.4)"}}>√V[t]</span>.{" "}
                      Linhas verticais = switches causais.
                    </div>
                  </div>
                  <div className="bpan">
                    <div className="bp-title">Mapa de Regimes</div>
                    <div className="cwrap" style={{ height:130 }}>
                      <canvas ref={refs.reg} style={{ height:130 }} />
                    </div>
                    <div className="bpnote">
                      Empilhamento temporal dos 3 regimes em todas as {nPaths} trajetórias.
                    </div>
                  </div>
                  <div className="bpan">
                    <div className="bp-title">Distribuição de Payoff</div>
                    <div className="cwrap" style={{ height:130 }}>
                      <canvas ref={refs.hist} style={{ height:130 }} />
                    </div>
                    <div className="bpnote">
                      <span style={{color:"#ff2d55"}}>■</span> P&lt;5% tail ·{" "}
                      <span style={{color:"#7c6aff"}}>■</span> núcleo ·{" "}
                      <span style={{color:"#00ffc8"}}>■</span> P&gt;95% upside
                    </div>
                  </div>
                  <div className="bpan">
                    <div className="bp-title">Espaço de Fase</div>
                    <div className="cwrap" style={{ height:130 }}>
                      <canvas ref={refs.phase} style={{ height:130 }} />
                    </div>
                    <div className="bpnote">
                      Vol × Drawdown colorido por regime — atratores e bifurcações do sistema.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
