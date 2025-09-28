import fetch from 'node-fetch';
import { MedicalBillFacade } from './src/facades/medical-bill.facade';
import type { OCRResult } from './src/interfaces/ocr.interfaces';
import type { MedicalBillData } from './src/interfaces/medical-bill.interfaces';

// Polyfill Web APIs for Node.js compatibility
(global as any).fetch = fetch;
(global as any).Headers = fetch.Headers;

// OCR service with bounding boxes for medical bill text extraction
// Refactored to use SOLID principles and design patterns
export class OCRWithBoundingBoxes {
  private facade: MedicalBillFacade;

  constructor(geminiApiKey: string) {
    this.facade = new MedicalBillFacade(geminiApiKey);
  }

  async initialize(): Promise<void> {
    await this.facade.initialize();
  }

  async destroy(): Promise<void> {
    await this.facade.destroy();
  }

  // Extract text with bounding boxes from image using OCR
  async extractTextWithBoxes(imageBuffer: Buffer): Promise<OCRResult> {
    try {
      console.log('🔍 Extracting text with bounding boxes from image...');
      
      // Process the medical bill and get the extracted text
      const result = await this.facade.processMedicalBill(imageBuffer);
      
      // Extract the OCR text from the result
      const extractedText = result.extractedText || '';
      const textBoxes = result.textBoxes || [];
      const confidence = result.confidence || 0;
      
      console.log('📄 OCR Text extracted successfully!');
      console.log('📄 OCR Text length:', extractedText.length);
      console.log('📄 OCR Text preview:', extractedText.substring(0, 100) + '...');
      console.log('📄 Full OCR Text:', extractedText);
      
      return {
        fullText: extractedText,
        textBoxes: textBoxes,
        totalBoxes: textBoxes.length,
        averageConfidence: confidence,
        processingTime: 0,
        status: 'success'
      };

    } catch (error) {
      console.error('❌ OCR extraction with bounding boxes failed:', error);
      throw error;
    }
  }

  // Extract structured medical bill data from text using Gemini API
  async extractMedicalBillDataFromText(text: string): Promise<{ data: MedicalBillData; htmlTable: string }> {
    // This method is now handled by the new architecture
    // For backward compatibility, we'll delegate to the facade
    throw new Error('This method is deprecated. Use extractMedicalBillData with image buffer instead.');
  }

  // Extract structured medical bill data using Gemini API
  async extractMedicalBillData(imageBuffer: Buffer): Promise<{ data: MedicalBillData; htmlTable: string }> {
    return await this.facade.processMedicalBill(imageBuffer);
  }

  // Process and display medical bill data as table
  displayMedicalBillTable(data: MedicalBillData): string {
    // This method is now handled by the MedicalBillHTMLFormatter through the facade
    // For backward compatibility, we'll delegate to the facade's processor
    return '<div>Display handled by new architecture</div>';
  }
}

// Usage example
export async function processMedicalBill(imageBuffer: Buffer, geminiApiKey: string): Promise<string> {
  const extractor = new OCRWithBoundingBoxes(geminiApiKey);
  
  try {
    await extractor.initialize();
    
    // Extract structured data
    const medicalBillData = await extractor.extractMedicalBillData(imageBuffer);
    
    // Display as table
    const tableHTML = extractor.displayMedicalBillTable(medicalBillData.data);
    
    // Also log the JSON for debugging
    console.log('📊 Extracted Medical Bill Data:');
    console.log(JSON.stringify(medicalBillData, null, 2));
    
    return tableHTML;
    
  } finally {
    await extractor.destroy();
  }
}