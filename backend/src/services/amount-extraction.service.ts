// Amount Extraction Service - 4-Step Pipeline Implementation with LLM Integration

import { GoogleGenerativeAI } from "@google/generative-ai";
import type { MedicalBillData } from '../interfaces/medical-bill.interfaces';

// Step 1: OCR/Text Extraction Interfaces
export interface RawTokensResult {
  raw_tokens: string[];
  currency_hint: string;
  confidence: number;
}

export interface OCRGuardrailResult {
  status: "no_amounts_found";
  reason: string;
}

// Step 2: Normalization Interfaces
export interface NormalizedAmountsResult {
  normalized_amounts: number[];
  normalization_confidence: number;
}

// Step 3: Classification Interfaces
export interface ClassifiedAmount {
  type: "total_bill" | "paid" | "due" | "discount" | "tax" | "subtotal" | "other";
  value: number;
  entity?: string;
}

export interface ClassificationResult {
  amounts: ClassifiedAmount[];
  confidence: number;
}

// Step 4: Final Output Interfaces
export interface FinalAmount {
  type: string;
  value: number;
  source: string;
}

export interface FinalResult {
  currency: string;
  amounts: FinalAmount[];
  status: "ok" | "error";
}

export class AmountExtractionService {
  private genAI?: GoogleGenerativeAI;

  constructor(apiKey?: string) {
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
  }
  
  // Step 1: Extract raw numeric tokens from text using LLM
  async extractRawTokens(text: string): Promise<RawTokensResult | OCRGuardrailResult> {
    console.log('🔍 Step 1: Extracting raw tokens from text using LLM...');
    
    try {
      if (!this.genAI) {
        console.log('⚠️ LLM not available, falling back to regex extraction...');
        return this.extractRawTokensRegex(text);
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `You are an expert at extracting monetary amounts and currency information from text. 
      
Extract all numeric tokens that could be monetary amounts from the following text and identify the currency.

Text: "${text}"

Return a JSON response with this exact structure:
{
  "raw_tokens": ["list", "of", "numeric", "tokens", "found"],
  "currency_hint": "detected currency code (INR, USD, EUR, GBP, etc.)",
  "confidence": 0.85
}

Rules:
- Include all numbers that could be amounts (prices, totals, discounts, etc.)
- Include percentages as tokens (e.g., "10%")
- Filter out page numbers, dates, phone numbers, and other non-monetary numbers
- If no amounts found, return: {"status": "no_amounts_found", "reason": "no monetary amounts detected"}
- Confidence should be between 0.0 and 1.0 based on text clarity and amount detection quality

Only return valid JSON, no other text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log('🤖 LLM Response for Step 1:', responseText);

      // Parse LLM response
      const cleanResponse = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);

      if (parsed.status === "no_amounts_found") {
        return parsed;
      }

      console.log('✅ Step 1 completed - Raw tokens extracted via LLM:', parsed.raw_tokens);
      
      return parsed;
      
    } catch (error) {
      console.error('❌ Step 1 LLM failed, falling back to regex:', error);
      return this.extractRawTokensRegex(text);
    }
  }

  // Fallback regex-based extraction
  private extractRawTokensRegex(text: string): RawTokensResult | OCRGuardrailResult {
    try {
      // Extract currency hints
      const currencyPatterns = [
        { pattern: /INR|Rs\.?|₹/gi, currency: "INR" },
        { pattern: /\$/g, currency: "USD" },
        { pattern: /€/g, currency: "EUR" },
        { pattern: /£/g, currency: "GBP" }
      ];
      
      let currencyHint = "INR"; // Default
      for (const { pattern, currency } of currencyPatterns) {
        if (pattern.test(text)) {
          currencyHint = currency;
          break;
        }
      }
      
      // Extract numeric tokens (including percentages)
      const numericPattern = /(\d+(?:\.\d+)?%?)/g;
      const matches = text.match(numericPattern) || [];
      
      // Filter out very small numbers that are likely not amounts (like page numbers)
      const rawTokens = matches.filter(token => {
        const num = parseFloat(token.replace('%', ''));
        return num >= 1; // Only amounts >= 1
      });
      
      if (rawTokens.length === 0) {
        return {
          status: "no_amounts_found",
          reason: "document too noisy or no numeric values found"
        };
      }
      
      // Calculate confidence based on number of tokens and text quality
      const confidence = Math.min(0.9, 0.5 + (rawTokens.length * 0.1));
      
      return {
        raw_tokens: rawTokens,
        currency_hint: currencyHint,
        confidence: confidence
      };
      
    } catch (error) {
      console.error('❌ Regex fallback failed:', error);
      return {
        status: "no_amounts_found",
        reason: "extraction error"
      };
    }
  }
  
  // Step 2: Normalize OCR digit errors
  async normalizeAmounts(rawTokens: string[]): Promise<NormalizedAmountsResult> {
    console.log('🔧 Step 2: Normalizing amounts...');
    
    try {
      const normalizedAmounts: number[] = [];
      let totalConfidence = 0;
      
      for (const token of rawTokens) {
        // Remove currency symbols, percentage signs, and other non-numeric characters
        let cleanToken = token.replace(/[$₹€£¥,]/g, '').replace('%', '');
        
        // Common OCR digit corrections
        const corrections: { [key: string]: string } = {
          'O': '0', 'o': '0', 'l': '1', 'I': '1', 'S': '5', 's': '5',
          'G': '6', 'g': '6', 'T': '7', 't': '7', 'B': '8', 'b': '8',
          'q': '9', 'Q': '9'
        };
        
        let correctedToken = cleanToken;
        for (const [wrong, correct] of Object.entries(corrections)) {
          correctedToken = correctedToken.replace(new RegExp(wrong, 'g'), correct);
        }
        
        const normalizedValue = parseFloat(correctedToken);
        
        if (!isNaN(normalizedValue) && normalizedValue >= 0) { // Changed from > 0 to >= 0 to include 0.00
          normalizedAmounts.push(normalizedValue);
          totalConfidence += 0.9; // High confidence for successful normalization
        } else {
          totalConfidence += 0.3; // Lower confidence for failed normalization
        }
      }
      
      const normalizationConfidence = normalizedAmounts.length > 0 
        ? totalConfidence / rawTokens.length 
        : 0;
      
      console.log('✅ Step 2 completed - Normalized amounts:', normalizedAmounts);
      
      return {
        normalized_amounts: normalizedAmounts,
        normalization_confidence: normalizationConfidence
      };
      
    } catch (error) {
      console.error('❌ Step 2 failed:', error);
      return {
        normalized_amounts: [],
        normalization_confidence: 0
      };
    }
  }
  
  // Step 3: Classify amounts by context using LLM
  async classifyAmounts(text: string, normalizedAmounts: number[]): Promise<ClassificationResult> {
    console.log('🏷️ Step 3: Classifying amounts by context using LLM...');
    
    try {
      if (!this.genAI) {
        console.log('⚠️ LLM not available, falling back to regex classification...');
        return this.classifyAmountsRegex(text, normalizedAmounts);
      }

      const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `You are an expert at classifying monetary amounts by their context in financial documents.

Given the following text and normalized amounts, classify each amount by its type based on the surrounding context.

Text: "${text}"

Normalized amounts: [${normalizedAmounts.join(', ')}]

Return a JSON response with this exact structure:
{
  "amounts": [
    {"type": "total_bill", "value": 1200, "entity": "Grand Total"},
    {"type": "paid", "value": 1000, "entity": "Amount Paid"},
    {"type": "due", "value": 200, "entity": "Outstanding Balance"}
  ],
  "confidence": 0.85
}

Classification types:
- "total_bill": Total amount, grand total, bill total, amount due, final amount
- "paid": Amount paid, payment received, paid amount
- "due": Outstanding balance, amount due, remaining amount
- "discount": Discount amount, reduction, off amount
- "tax": Tax amount, GST, CGST, SGST, VAT, service tax
- "subtotal": Subtotal, base amount before taxes
- "other": Any other type not listed above

IMPORTANT: For every amount found, extract the exact entity description from the surrounding text. Don't use predefined categories - use what's actually written in the bill.

Examples:
- "ROOM RENT 4,000.00" → entity: "ROOM RENT"
- "Bill Amount 15,143.54" → entity: "Bill Amount"  
- "Received Rs.420 by Cash" → entity: "Amount Received"
- "Refundable Deposit Rs.5000" → entity: "Refundable Deposit"

Rules:
- Analyze the context around each amount to determine its type
- Use surrounding words and phrases to make the classification
- Extract the exact entity description from the text for each amount
- Confidence should be between 0.0 and 1.0 based on context clarity
- If an amount cannot be clearly classified, use "other" type
- Include all normalized amounts in the response

Only return valid JSON, no other text.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      console.log('🤖 LLM Response for Step 3:', responseText);

      // Parse LLM response
      const cleanResponse = responseText.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(cleanResponse);

      console.log('✅ Step 3 completed - Classified amounts via LLM:', parsed.amounts);
      
      // Sort classification: total_bill, paid, due, tax, others
      const priority: Record<string, number> = { total_bill: 0, paid: 1, due: 2, tax: 3 };
      parsed.amounts.sort((a: ClassifiedAmount, b: ClassifiedAmount) => {
        const pa = priority[a.type] ?? 100;
        const pb = priority[b.type] ?? 100;
        if (pa !== pb) return pa - pb;
        return 0;
      });
      
      return parsed;
      
    } catch (error) {
      console.error('❌ Step 3 LLM failed, falling back to regex:', error);
      return this.classifyAmountsRegex(text, normalizedAmounts);
    }
  }

  // Fallback regex-based classification
  private classifyAmountsRegex(text: string, normalizedAmounts: number[]): ClassificationResult {
    try {
      const amounts: ClassifiedAmount[] = [];
      let totalConfidence = 0;
      
      // Context patterns for different amount types
      const contextPatterns = [
        { 
          pattern: /(?:total|grand total|bill total|amount due|final amount|net amount)/gi, 
          type: "total_bill" as const,
          confidence: 0.9
        },
        { 
          pattern: /(?:paid|payment|received|amount paid|paid amount)/gi, 
          type: "paid" as const,
          confidence: 0.9
        },
        { 
          pattern: /(?:due|balance|outstanding|remaining|pending)/gi, 
          type: "due" as const,
          confidence: 0.9
        },
        { 
          pattern: /(?:discount|disc|off|reduction)/gi, 
          type: "discount" as const,
          confidence: 0.8
        },
        { 
          pattern: /(?:tax|gst|cgst|sgst|vat|service tax)/gi, 
          type: "tax" as const,
          confidence: 0.8
        },
        { 
          pattern: /(?:subtotal|sub total|base amount)/gi, 
          type: "subtotal" as const,
          confidence: 0.8
        }
      ];
      
      for (const amount of normalizedAmounts) {
        let bestMatch: { type: "total_bill" | "paid" | "due" | "discount" | "tax" | "subtotal" | "other", confidence: number } = { type: "other", confidence: 0.3 };
        
        // Find the best context match for this amount
        for (const { pattern, type, confidence } of contextPatterns) {
          const matches = text.match(pattern);
          if (matches) {
            // Check if amount appears near this context
            const amountStr = amount.toString();
            const amountIndex = text.indexOf(amountStr);
            
            for (const match of matches) {
              const matchIndex = text.indexOf(match);
              const distance = Math.abs(amountIndex - matchIndex);
              
              // If amount is within 100 characters of context, it's likely related
              if (distance < 100 && confidence > bestMatch.confidence) {
                bestMatch = { type, confidence };
              }
            }
          }
        }
        
        // Extract entity description from surrounding text
        const amountStr = amount.toString();
        const amountIndex = text.indexOf(amountStr);
        let entity: string = bestMatch.type;
        
        if (amountIndex !== -1) {
          // Extract surrounding context (50 characters before and after)
          const start = Math.max(0, amountIndex - 50);
          const end = Math.min(text.length, amountIndex + amountStr.length + 50);
          const context = text.substring(start, end).trim();
          
          // Try to find a meaningful entity description
          const entityMatch = context.match(/([A-Za-z\s]+)\s*[:\-]?\s*[\d,]+\.?\d*/i);
          if (entityMatch && entityMatch[1]) {
            entity = entityMatch[1].trim();
          }
        }
        
        amounts.push({
          type: bestMatch.type,
          value: amount,
          entity: entity
        });
        
        totalConfidence += bestMatch.confidence;
      }
      
      const classificationConfidence = amounts.length > 0 
        ? totalConfidence / amounts.length 
        : 0;
      
      // Sort classification: total_bill, paid, due, tax, others
      const priority: Record<string, number> = { total_bill: 0, paid: 1, due: 2, tax: 3 };
      amounts.sort((a: ClassifiedAmount, b: ClassifiedAmount) => {
        const pa = priority[a.type] ?? 100;
        const pb = priority[b.type] ?? 100;
        if (pa !== pb) return pa - pb;
        return 0;
      });
      
      return {
        amounts,
        confidence: classificationConfidence
      };
      
    } catch (error) {
      console.error('❌ Regex classification failed:', error);
      return {
        amounts: [],
        confidence: 0
      };
    }
  }
  
  // Step 4: Generate final output with source tracking
  async generateFinalOutput(
    text: string, 
    currency: string, 
    classifiedAmounts: ClassifiedAmount[]
  ): Promise<FinalResult> {
    console.log('📋 Step 4: Generating final output...');
    
    try {
      const finalAmounts: FinalAmount[] = [];
      
      for (const amount of classifiedAmounts) {
        // Find the source text for this amount
        const amountStr = amount.value.toString();
        const amountIndex = text.indexOf(amountStr);
        
        let source = `value: ${amount.value}`;
        
        if (amountIndex !== -1) {
          // Extract surrounding context (50 characters before and after)
          const start = Math.max(0, amountIndex - 50);
          const end = Math.min(text.length, amountIndex + amountStr.length + 50);
          const context = text.substring(start, end).trim();
          source = `text: '${context}'`;
        }
        
        finalAmounts.push({
          type: amount.type,
          value: amount.value,
          source: source
        });
      }
      
      // Sort output: total_bill, paid, due first; then others
      const priority: Record<string, number> = {
        total_bill: 0,
        paid: 1,
        due: 2,
        tax: 3
      };
      finalAmounts.sort((a, b) => {
        const pa = priority[a.type] ?? 100;
        const pb = priority[b.type] ?? 100;
        if (pa !== pb) return pa - pb;
        return 0;
      });
      
      console.log('✅ Step 4 completed - Final output generated');
      
      return {
        currency,
        amounts: finalAmounts,
        status: "ok"
      };
      
    } catch (error) {
      console.error('❌ Step 4 failed:', error);
      return {
        currency: "INR",
        amounts: [],
        status: "error"
      };
    }
  }
  
  // Complete pipeline execution
  async executeFullPipeline(text: string): Promise<FinalResult> {
    console.log('🚀 Starting complete amount extraction pipeline...');
    
    try {
      // Step 1: Extract raw tokens
      const step1Result = await this.extractRawTokens(text);
      
      if ('status' in step1Result && step1Result.status === "no_amounts_found") {
        return {
          currency: "INR",
          amounts: [],
          status: "error"
        };
      }
      
      const rawTokensResult = step1Result as RawTokensResult;
      
      // Step 2: Normalize amounts
      console.log('🔧 Pipeline: Calling Step 2 normalization...');
      const step2Result = await this.normalizeAmounts(rawTokensResult.raw_tokens);
      console.log('✅ Pipeline: Step 2 completed with result:', step2Result);
      
      // Step 3: Classify amounts
      const step3Result = await this.classifyAmounts(text, step2Result.normalized_amounts);
      
      // Step 4: Generate final output
      const step4Result = await this.generateFinalOutput(
        text, 
        rawTokensResult.currency_hint, 
        step3Result.amounts
      );
      
      console.log('✅ Complete pipeline executed successfully');
      return step4Result;
      
    } catch (error) {
      console.error('❌ Pipeline execution failed:', error);
      return {
        currency: "INR",
        amounts: [],
        status: "error"
      };
    }
  }
}
