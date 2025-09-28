// Core OCR interfaces following Interface Segregation Principle (ISP)

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface TextBox {
  text: string;
  boundingBox: BoundingBox;
  confidence: number;
  coordinates: number[][];
}

export interface OCRResult {
  fullText: string;
  textBoxes: TextBox[];
  totalBoxes: number;
  averageConfidence: number;
  processingTime: number;
  status: string;
}

// Interface for OCR service abstraction
export interface IOCRService {
  initialize(): Promise<void>;
  destroy(): Promise<void>;
  recognize(imageBuffer: Buffer): Promise<any>;
}

// Interface for text extraction
export interface ITextExtractor {
  extractTextWithBoxes(imageBuffer: Buffer): Promise<OCRResult>;
}

// Interface for AI processing
export interface IAIService {
  processText(text: string): Promise<any>;
}

// Interface for retry mechanism
export interface IRetryStrategy {
  execute<T>(operation: () => Promise<T>, maxRetries: number): Promise<T>;
}

// Interface for medical bill data processing
export interface IMedicalBillProcessor {
  extractMedicalBillData(imageBuffer: Buffer): Promise<{
    data: any;
    htmlTable: string;
    extractedText: string;
    textBoxes: any[];
    confidence: number;
  }>;
}

// Interface for data display/formatter
export interface IDataFormatter {
  format(data: any): string;
}
