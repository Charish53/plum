// OCR Service implementation following Single Responsibility Principle (SRP)

import type { IOCRService, ITextExtractor, OCRResult, TextBox } from '../interfaces/ocr.interfaces';
import { PaddleOcrService } from '../index';

export class PaddleOCRServiceAdapter implements IOCRService {
  private ocrService: PaddleOcrService;

  constructor() {
    this.ocrService = new PaddleOcrService({
      debugging: {
        debug: false,
        verbose: false,
      },
    });
  }

  async initialize(): Promise<void> {
    await this.ocrService.initialize();
  }

  async destroy(): Promise<void> {
    await this.ocrService.destroy();
  }

  async recognize(imageBuffer: Buffer): Promise<any> {
    return await this.ocrService.recognize(imageBuffer as any);
  }
}

export class TextExtractorService implements ITextExtractor {
  constructor(private ocrService: IOCRService) {}

  async extractTextWithBoxes(imageBuffer: Buffer): Promise<OCRResult> {
    try {
      console.log('🔍 Extracting text with bounding boxes from image...');
      
      const ocrResult = await this.ocrService.recognize(imageBuffer as any);
      console.log('🔍 OCR Raw Result:', JSON.stringify(ocrResult, null, 2));
      
      return this.processOCRResult(ocrResult);
    } catch (error) {
      console.error('❌ Text extraction failed:', error);
      throw new Error(`Text extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private processOCRResult(ocrResult: any): OCRResult {
    const textBoxes: TextBox[] = [];
    let fullText = '';

    // Handle different OCR result formats
    if (ocrResult.boxes && Array.isArray(ocrResult.boxes)) {
      // New format: boxes is an array of arrays, each containing text objects
      ocrResult.boxes.forEach((boxGroup: any[], groupIndex: number) => {
        if (Array.isArray(boxGroup)) {
          boxGroup.forEach((textObj: any) => {
            if (textObj.text && textObj.text.trim().length > 0) {
              const textBox = this.createTextBox(textObj);
              textBoxes.push(textBox);
              fullText += textBox.text + ' ';
            }
          });
        }
      });
    } else if (ocrResult.texts && ocrResult.texts.length > 0) {
      // Old format: separate boxes, texts, and confidences arrays
      for (let i = 0; i < ocrResult.texts.length; i++) {
        const text = ocrResult.texts[i];
        const box = ocrResult.boxes ? ocrResult.boxes[i] : null;
        const confidence = ocrResult.confidences ? ocrResult.confidences[i] : 0;

        if (text && text.trim().length > 0) {
          const textBox = this.createTextBoxFromArrays(text, box, confidence);
          textBoxes.push(textBox);
          fullText += textBox.text + ' ';
        }
      }
    } else if (ocrResult.text) {
      // Simple text format
      fullText = ocrResult.text;
      textBoxes.push({
        text: fullText,
        boundingBox: { x: 0, y: 0, width: 0, height: 0 },
        confidence: 1.0,
        coordinates: [[0, 0], [0, 0], [0, 0], [0, 0]]
      });
    }

    const totalBoxes = textBoxes.length;
    const averageConfidence = textBoxes.length > 0 
      ? textBoxes.reduce((sum, box) => sum + box.confidence, 0) / textBoxes.length 
      : 0;

    return {
      fullText: fullText.trim(),
      textBoxes,
      totalBoxes,
      averageConfidence,
      processingTime: ocrResult.processingTime || 0,
      status: 'success'
    };
  }

  private createTextBox(textObj: any): TextBox {
    const text = textObj.text.trim();
    const box = textObj.box;
    
    return {
      text: text,
      boundingBox: {
        x: box.x,
        y: box.y,
        width: box.width,
        height: box.height
      },
      confidence: textObj.confidence || 0,
      coordinates: [
        [box.x, box.y], 
        [box.x + box.width, box.y], 
        [box.x + box.width, box.y + box.height], 
        [box.x, box.y + box.height]
      ]
    };
  }

  private createTextBoxFromArrays(text: string, box: any, confidence: number): TextBox {
    return {
      text: text.trim(),
      boundingBox: box ? {
        x: box[0][0],
        y: box[0][1],
        width: box[2][0] - box[0][0],
        height: box[2][1] - box[0][1]
      } : { x: 0, y: 0, width: 0, height: 0 },
      confidence: confidence,
      coordinates: box || [[0, 0], [0, 0], [0, 0], [0, 0]]
    };
  }
}
