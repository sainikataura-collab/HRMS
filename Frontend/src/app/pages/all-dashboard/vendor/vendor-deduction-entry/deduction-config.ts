export interface DeductionTypeConfig {
  label: string;
  column: string;
  isPositive?: boolean;
  isShipment?: boolean;
}

/**
 * Master Real Deduction Dictionary mapped to authentic Database Clients and Models.
 * Models are verified against LSP_Master_General (CodeTypeId = 4) & SAL_CostCentre_ModelType_Mapping:
 *
 *  Model 1:  Flipkart ODH-MDH
 *  Model 2:  Flipkart XRM
 *  Model 3:  Flipkart Large
 *  Model 4:  Amazon DSP
 *  Model 5:  Amazon EDSP
 *  Model 6:  Airtel FSE
 *  Model 7:  Ebees Variable(E)
 *  Model 8:  Flipkart FMVariable (FM)
 *  Model 9:  Shiprocket Variable(S)
 *  Model 10: Bluedart Variable(B)
 *  Model 11: Meesho Variable(M)
 *  Model 12: Healthkart Variable(H)
 */
export const MODEL_ID_DEDUCTION_MAP: Record<number, DeductionTypeConfig[]> = {
  // 1. Flipkart ODH-MDH (Model 1) - 11 columns
  1: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Rent Deduction', column: 'Ded_Rent' },
    { label: 'Advance Deduction', column: 'Ded_Advance' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Karma Life Deduction', column: 'Ded_KarmaLife' },
    { label: 'Arrear', column: 'Ded_Arrear', isPositive: true },
    { label: 'SD', column: 'Ded_SD' },
    { label: 'TNT Deduction', column: 'Ded_TNT' },
    { label: 'Welfare Deduction', column: 'Ded_Welfare' }
  ],

  // 2. Flipkart XRM (Model 2) - 8 columns
  2: [
    { label: 'Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Insurance', column: 'Ded_Insurance' },
    { label: 'Welfare Deduction', column: 'Ded_Welfare' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Karma Life', column: 'Ded_KarmaLife' },
    { label: 'Arrear Amt', column: 'Ded_Arrear', isPositive: true }
  ],

  // 3. Flipkart Large (Model 3) - 7 columns
  3: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Welfare Deduction', column: 'Ded_Welfare' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'KarmaLife Deduction', column: 'Ded_KarmaLife' },
    { label: 'Arrear', column: 'Ded_Arrear', isPositive: true }
  ],

  // 4. Amazon DSP (Model 4) - 8 columns
  4: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Advance Deduction', column: 'Ded_Advance' },
    { label: 'Welfare Deduction', column: 'Ded_Welfare' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Karmalife Deduction', column: 'Ded_KarmaLife' },
    { label: 'Arrear', column: 'Ded_Arrear', isPositive: true }
  ],

  // 5. Amazon EDSP (Model 5) - 7 columns
  5: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Welfare Deduction', column: 'Ded_Welfare' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Karmalife Deduction', column: 'Ded_KarmaLife' },
    { label: 'Arrear', column: 'Ded_Arrear', isPositive: true }
  ],

  // 6. Airtel FSE (Model 6) - 7 columns
  6: [
    { label: 'Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Insurance', column: 'Ded_Insurance' },
    { label: 'SD', column: 'Ded_SD' },
    { label: 'Welfare', column: 'Ded_Welfare' },
    { label: 'Arrear Amt', column: 'Ded_Arrear', isPositive: true }
  ],

  // 7. Ebees / Variable(E) (Model 7) - 3 columns
  7: [
    { label: 'Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' }
  ],

  // 8. Flipkart FMVariable / FM (Model 8) - 5 columns
  8: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Arrear', column: 'Ded_Arrear', isPositive: true }
  ],

  // 9. Shiprocket / Variable(S) (Model 9) - 5 columns
  9: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Arrear Amt', column: 'Ded_Arrear', isPositive: true }
  ],

  // 10. Bluedart / Variable(B) (Model 10) - 6 columns
  10: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'SD', column: 'Ded_SD' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Arrear Amt', column: 'Ded_Arrear', isPositive: true }
  ],

  // 11. Meesho / Variable(M) (Model 11) - 8 columns
  11: [
    { label: 'Shipment Loss Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Insurance', column: 'Ded_Insurance' },
    { label: 'Welfare Deduction', column: 'Ded_Welfare' },
    { label: 'Hold', column: 'Ded_Hold' },
    { label: 'Karma Life', column: 'Ded_KarmaLife' },
    { label: 'Arrear Amt', column: 'Ded_Arrear', isPositive: true }
  ],

  // 12. Healthkart / Variable(H) (Model 12) - 7 columns
  12: [
    { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
    { label: 'COD Deduction', column: 'Ded_COD' },
    { label: 'Other Deduction', column: 'Ded_Other' },
    { label: 'Insurance', column: 'Ded_Insurance' },
    { label: 'SD', column: 'Ded_SD' },
    { label: 'Welfare', column: 'Ded_Welfare' },
    { label: 'Arrear Amt', column: 'Ded_Arrear', isPositive: true }
  ]
};

export const DEFAULT_DEDUCTION_TYPES: DeductionTypeConfig[] = [
  { label: 'Shipment Deduction', column: 'Ded_Shipment', isShipment: true },
  { label: 'COD Deduction', column: 'Ded_COD' },
  { label: 'Rent Deduction', column: 'Ded_Rent' },
  { label: 'Advance Deduction', column: 'Ded_Advance' },
  { label: 'Hold', column: 'Ded_Hold' },
  { label: 'Karma Life Deduction', column: 'Ded_KarmaLife' },
  { label: 'SD', column: 'Ded_SD' },
  { label: 'TNT Deduction', column: 'Ded_TNT' },
  { label: 'Welfare Deduction', column: 'Ded_Welfare' },
  { label: 'Insurance Deduction', column: 'Ded_Insurance' },
  { label: 'Other Deduction', column: 'Ded_Other' },
  { label: 'Arrear', column: 'Ded_Arrear', isPositive: true }
];

/**
 * Resolves configured deduction types by evaluating BOTH Client and Model (IDs and text names).
 * The combination of Client + Model determines the exact allowed deduction columns.
 */
export function getDeductionTypesForClientAndModel(
  clientId?: number | string,
  modelId?: number | string,
  clientName?: string,
  modelName?: string
): DeductionTypeConfig[] {
  const normClient = (clientName || '').toLowerCase().trim();
  const normModel = (modelName || '').toLowerCase().trim();
  const cId = clientId !== undefined && clientId !== null && clientId !== '' ? Number(clientId) : NaN;
  const mId = modelId !== undefined && modelId !== null && modelId !== '' ? Number(modelId) : NaN;

  const isFlipkart = normClient.includes('flipkart');
  const isAmazon = normClient.includes('amazon') || cId === 316;
  const isAirtel = normClient.includes('airtel');
  const isEbees = normClient.includes('ebees') || normClient.includes('xbees') || mId === 7;
  const isBlueDart = normClient.includes('bluedart');
  const isShiprocket = normClient.includes('shiprocket');
  const isMeesho = normClient.includes('meesho');
  const isHealthkart = normClient.includes('healthkart');

  // 1. Flipkart Combinations
  if (isFlipkart) {
    if (mId === 1 || normModel.includes('odh-mdh') || normModel.includes('odh')) return MODEL_ID_DEDUCTION_MAP[1];
    if (mId === 2 || normModel.includes('xrm')) return MODEL_ID_DEDUCTION_MAP[2];
    if (mId === 3 || normModel.includes('large')) return MODEL_ID_DEDUCTION_MAP[3];
    if (mId === 8 || normModel.includes('fm') || normModel.includes('variable')) return MODEL_ID_DEDUCTION_MAP[8];
  }

  // 2. Amazon Combinations
  if (isAmazon) {
    if (mId === 4 || (normModel.includes('dsp') && !normModel.includes('edsp'))) return MODEL_ID_DEDUCTION_MAP[4];
    if (mId === 5 || normModel.includes('edsp')) return MODEL_ID_DEDUCTION_MAP[5];
  }

  // 3. Airtel Combinations
  if (isAirtel) {
    if (mId === 6 || normModel.includes('fse')) return MODEL_ID_DEDUCTION_MAP[6];
  }

  // 4. Ebees Combinations
  if (isEbees || mId === 7 || normModel.includes('variable(e)')) {
    return MODEL_ID_DEDUCTION_MAP[7];
  }

  // 5. BlueDart Combinations
  if (isBlueDart || mId === 10 || normModel.includes('variable(b)')) {
    return MODEL_ID_DEDUCTION_MAP[10];
  }

  // 6. Shiprocket Combinations
  if (isShiprocket || mId === 9 || normModel.includes('variable(s)')) {
    return MODEL_ID_DEDUCTION_MAP[9];
  }

  // 7. Meesho Combinations
  if (isMeesho || mId === 11 || normModel.includes('variable(m)')) {
    return MODEL_ID_DEDUCTION_MAP[11];
  }

  // 8. Healthkart Combinations
  if (isHealthkart || mId === 12 || normModel.includes('variable(h)')) {
    return MODEL_ID_DEDUCTION_MAP[12];
  }

  // 9. Text Keyword Match against real system Models if client is not specifically identified
  if (normModel.includes('odh-mdh')) return MODEL_ID_DEDUCTION_MAP[1];
  if (normModel.includes('xrm')) return MODEL_ID_DEDUCTION_MAP[2];
  if (normModel.includes('large')) return MODEL_ID_DEDUCTION_MAP[3];
  if (normModel.includes('dsp') && !normModel.includes('edsp')) return MODEL_ID_DEDUCTION_MAP[4];
  if (normModel.includes('edsp')) return MODEL_ID_DEDUCTION_MAP[5];
  if (normModel.includes('fse')) return MODEL_ID_DEDUCTION_MAP[6];
  if (normModel.includes('variable(e)') || normModel.includes('ebees')) return MODEL_ID_DEDUCTION_MAP[7];
  if (normModel.includes('fmvariable') || normModel.includes('fm')) return MODEL_ID_DEDUCTION_MAP[8];
  if (normModel.includes('variable(s)') || normModel.includes('shiprocket')) return MODEL_ID_DEDUCTION_MAP[9];
  if (normModel.includes('variable(b)') || normModel.includes('bluedart')) return MODEL_ID_DEDUCTION_MAP[10];
  if (normModel.includes('variable(m)') || normModel.includes('meesho')) return MODEL_ID_DEDUCTION_MAP[11];
  if (normModel.includes('variable(h)') || normModel.includes('healthkart')) return MODEL_ID_DEDUCTION_MAP[12];

  // 10. Direct Model ID Fallback
  if (!isNaN(mId) && MODEL_ID_DEDUCTION_MAP[mId]) {
    return MODEL_ID_DEDUCTION_MAP[mId];
  }

  return DEFAULT_DEDUCTION_TYPES;
}

/**
 * Backward-compatible wrapper delegating to client & model combination resolver.
 */
export function getDeductionTypesForModel(
  clientName?: string, 
  modelName?: string, 
  modelId?: number | string,
  clientId?: number | string
): DeductionTypeConfig[] {
  return getDeductionTypesForClientAndModel(clientId, modelId, clientName, modelName);
}

