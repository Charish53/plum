// Factory Pattern implementation for creating services

import type { IOCRService } from '../interfaces/ocr.interfaces';
import type { ITextExtractor } from '../interfaces/ocr.interfaces';
import type { IAIService } from '../interfaces/ocr.interfaces';
import type { IRetryStrategy } from '../interfaces/ocr.interfaces';
import type { IDataFormatter } from '../interfaces/ocr.interfaces';
import type { IMedicalBillProcessor } from '../interfaces/ocr.interfaces';

import { PaddleOCRServiceAdapter, TextExtractorService } from '../services/ocr.service';
import { GeminiAIService } from '../services/ai.service';
import { MedicalBillProcessor } from '../services/medical-bill.service';
import { MedicalBillHTMLFormatter } from '../formatters/medical-bill.formatter';
import { ExponentialBackoffRetryStrategy } from '../strategies/retry.strategy';

export class ServiceFactory {
  static createOCRService(): IOCRService {
    return new PaddleOCRServiceAdapter();
  }

  static createTextExtractor(ocrService: IOCRService): ITextExtractor {
    return new TextExtractorService(ocrService);
  }

  static createAIService(apiKey: string, retryStrategy: IRetryStrategy): IAIService {
    return new GeminiAIService(apiKey, retryStrategy);
  }

  static createRetryStrategy(): IRetryStrategy {
    return new ExponentialBackoffRetryStrategy();
  }

  static createDataFormatter(): IDataFormatter {
    return new MedicalBillHTMLFormatter();
  }

  static createMedicalBillProcessor(
    textExtractor: ITextExtractor,
    aiService: IAIService,
    dataFormatter: IDataFormatter
  ): IMedicalBillProcessor {
    return new MedicalBillProcessor(textExtractor, aiService, dataFormatter);
  }

  // Factory method to create complete medical bill processing system
  static createMedicalBillSystem(apiKey: string): {
    processor: IMedicalBillProcessor;
    ocrService: IOCRService;
  } {
    const ocrService = this.createOCRService();
    const textExtractor = this.createTextExtractor(ocrService);
    const retryStrategy = this.createRetryStrategy();
    const aiService = this.createAIService(apiKey, retryStrategy);
    const dataFormatter = this.createDataFormatter();
    const processor = this.createMedicalBillProcessor(textExtractor, aiService, dataFormatter);

    return {
      processor,
      ocrService
    };
  }
}
