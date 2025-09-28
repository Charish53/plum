import type { MedicalBillData } from '../../../interfaces/medical-bill.interfaces';

export interface RawTokensResult {
  raw_tokens: string[];
  currency_hint: string;
  confidence: number;
}

export interface OCRGuardrailResult {
  status: 'no_amounts_found';
  reason: string;
}

export interface NormalizedAmountsResult {
  normalized_amounts: number[];
  normalization_confidence: number;
}

export type AmountType = 'total_bill' | 'paid' | 'due' | 'discount' | 'tax' | 'subtotal' | 'other';

export interface ClassifiedAmount {
  type: AmountType;
  value: number;
  entity?: string;
}

export interface ClassificationResult {
  amounts: ClassifiedAmount[];
  confidence: number;
}

export interface FinalAmount {
  type: string;
  value: number;
  source: string;
}

export interface FinalResult {
  currency: string;
  amounts: FinalAmount[];
  status: 'ok' | 'error';
}

export interface IAmountExtractionService {
  extractRawTokens(text: string): Promise<RawTokensResult | OCRGuardrailResult>;
  normalizeAmounts(rawTokens: string[]): Promise<NormalizedAmountsResult>;
  classifyAmounts(text: string, normalizedAmounts: number[]): Promise<ClassificationResult>;
  generateFinalOutput(text: string, currency: string, classifiedAmounts: ClassifiedAmount[]): Promise<FinalResult>;
  executeFullPipeline(text: string): Promise<FinalResult>;
}

