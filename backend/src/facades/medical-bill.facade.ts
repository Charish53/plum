// Facade Pattern implementation to simplify complex subsystem interactions

import type { IMedicalBillProcessor } from '../interfaces/ocr.interfaces';
import type { IOCRService } from '../interfaces/ocr.interfaces';
import { ServiceFactory } from '../factories/service.factory';

export class MedicalBillFacade {
  private processor: IMedicalBillProcessor;
  private ocrService: IOCRService;

  constructor(apiKey: string) {
    const system = ServiceFactory.createMedicalBillSystem(apiKey);
    this.processor = system.processor;
    this.ocrService = system.ocrService;
  }

  async initialize(): Promise<void> {
    await this.ocrService.initialize();
  }

  async destroy(): Promise<void> {
    await this.ocrService.destroy();
  }

  async processMedicalBill(imageBuffer: Buffer): Promise<{
    data: any;
    htmlTable: string;
    extractedText: string;
    textBoxes: any[];
    confidence: number;
  }> {
    return await this.processor.extractMedicalBillData(imageBuffer);
  }
}
