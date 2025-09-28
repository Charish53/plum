// Medical Bill Service implementation following Single Responsibility Principle (SRP)

import type { IMedicalBillProcessor } from '../interfaces/ocr.interfaces';
import type { ITextExtractor } from '../interfaces/ocr.interfaces';
import type { IAIService } from '../interfaces/ocr.interfaces';
import type { IDataFormatter } from '../interfaces/ocr.interfaces';
import type { MedicalBillData } from '../interfaces/medical-bill.interfaces';

export class MedicalBillProcessor implements IMedicalBillProcessor {
  constructor(
    private textExtractor: ITextExtractor,
    private aiService: IAIService,
    private dataFormatter: IDataFormatter
  ) {}

  async extractMedicalBillData(imageBuffer: Buffer): Promise<{
    data: MedicalBillData;
    htmlTable: string;
    extractedText: string;
    textBoxes: any[];
    confidence: number;
  }> {
    try {
      // Extract text using OCR
      console.log('🔍 Starting OCR text extraction...');
      const ocrResult = await this.textExtractor.extractTextWithBoxes(imageBuffer);
      const ocrText = ocrResult?.fullText || '';
      
      console.log('📄 OCR Text extracted successfully!');
      console.log('📄 OCR Text length:', ocrText.length);
      console.log('📄 OCR Text preview:', ocrText.substring(0, 300) + '...');
      console.log('📄 Full OCR Text:', ocrText);

      if (!ocrText || ocrText.trim().length === 0) {
        throw new Error('No text extracted from image');
      }

      // Process with AI
      console.log('🤖 Starting AI processing with Gemini...');
      const medicalBillData = await this.aiService.processText(ocrText);
      console.log('✅ AI processing completed successfully!');

      // Format for display
      console.log('🎨 Formatting data for HTML display...');
      const htmlTable = this.dataFormatter.format(medicalBillData);
      console.log('✅ HTML formatting completed!');

      return {
        data: medicalBillData,
        htmlTable: htmlTable,
        extractedText: ocrText,
        textBoxes: ocrResult?.textBoxes || [],
        confidence: ocrResult?.averageConfidence || 0
      };

    } catch (error) {
      console.error('❌ Medical bill data extraction failed:', error);
      throw new Error(`Medical bill data extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
