import { PaddleOcrService } from "./src/index.ts";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fetch from 'node-fetch';

// Polyfill Web APIs for Node.js compatibility
(global as any).fetch = fetch;
(global as any).Headers = fetch.Headers;

// OCR service with bounding boxes for medical bill text extraction
export class OCRWithBoundingBoxes {
  private ocrService: PaddleOcrService;
  private genAI: GoogleGenerativeAI;

  constructor(geminiApiKey: string) {
    this.ocrService = new PaddleOcrService({
      debugging: {
        debug: false,
        verbose: false,
      },
    });
    this.genAI = new GoogleGenerativeAI(geminiApiKey);
  }

  async initialize(): Promise<void> {
    await this.ocrService.initialize();
  }

  async destroy(): Promise<void> {
    await this.ocrService.destroy();
  }

  // Extract text with bounding boxes from image using OCR
  async extractTextWithBoxes(imageBuffer: Buffer): Promise<OCRWithBoxesResult> {
    try {
      console.log('🔍 Extracting text with bounding boxes from image...');
      
      const ocrResult = await this.ocrService.recognize(imageBuffer);
      console.log('🔍 OCR Raw Result:', JSON.stringify(ocrResult, null, 2));
      
      // Process OCR result to extract bounding boxes and text
      const textBoxes: TextBox[] = [];
      let fullText = '';

      // Handle different OCR result formats
      if (ocrResult.boxes && Array.isArray(ocrResult.boxes)) {
        // New format: boxes is an array of arrays, each containing text objects
        ocrResult.boxes.forEach((boxGroup: any[], groupIndex: number) => {
          if (Array.isArray(boxGroup)) {
            boxGroup.forEach((textObj: any) => {
              if (textObj.text && textObj.text.trim().length > 0) {
                const text = textObj.text.trim();
                const box = textObj.box;
                
                textBoxes.push({
                  text: text,
                  boundingBox: {
                    x: box.x,
                    y: box.y,
                    width: box.width,
                    height: box.height
                  },
                  confidence: textObj.confidence || 0,
                  coordinates: [[box.x, box.y], [box.x + box.width, box.y], [box.x + box.width, box.y + box.height], [box.x, box.y + box.height]]
                });

                fullText += text + ' ';
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
            textBoxes.push({
              text: text.trim(),
              boundingBox: box ? {
                x: box[0][0],
                y: box[0][1],
                width: box[2][0] - box[0][0],
                height: box[2][1] - box[0][1]
              } : { x: 0, y: 0, width: 0, height: 0 },
              confidence: confidence,
              coordinates: box || [[0, 0], [0, 0], [0, 0], [0, 0]]
            });

            fullText += text + ' ';
          }
        }
      } else if (ocrResult.text) {
        // Simple text format
        fullText = ocrResult.text;
        textBoxes.push({
          text: fullText,
          boundingBox: { x: 0, y: 0, width: 0, height: 0 },
          confidence: ocrResult.confidence || 0,
          coordinates: [[0, 0], [0, 0], [0, 0], [0, 0]]
        });
      }

      // Debug: Log the extracted text
      console.log('🔍 Extracted fullText length:', fullText.length);
      console.log('🔍 First 200 chars of fullText:', fullText.substring(0, 200));

      const result: OCRWithBoxesResult = {
        fullText: fullText.trim(),
        textBoxes: textBoxes,
        totalBoxes: textBoxes.length,
        averageConfidence: textBoxes.length > 0 
          ? textBoxes.reduce((sum, box) => sum + box.confidence, 0) / textBoxes.length 
          : 0,
        processingTime: Date.now(),
        status: 'success'
      };

      console.log(`✅ OCR with bounding boxes completed. Found ${result.totalBoxes} text elements`);
      return result;

    } catch (error) {
      console.error('❌ OCR extraction with bounding boxes failed:', error);
      throw error;
    }
  }

  // Extract only text (simplified version)
  async extractText(imageBuffer: Buffer): Promise<string> {
    try {
      const result = await this.extractTextWithBoxes(imageBuffer);
      return result.fullText;
    } catch (error) {
      console.error('❌ OCR text extraction failed:', error);
      throw error;
    }
  }

  // Extract structured medical bill data from text using Gemini API
  async extractMedicalBillDataFromText(text: string): Promise<{ data: MedicalBillData; htmlTable: string }> {
    try {
      console.log('🏥 Extracting medical bill data from text...');
      console.log('📄 Input Text:', text.substring(0, 200) + '...');

      // Use API key from environment or fallback
      const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBtQFsgSGkG_q95LUEqP9VXbWVtPdzcu3w';
      console.log('🔑 Using API key:', apiKey ? 'API key found' : 'No API key');

      if (!text || text.trim().length === 0) {
        throw new Error('No text provided for processing');
      }

      let medicalBillData: MedicalBillData;

      try {
        // Try Gemini API with retry mechanism
        const prompt = this.createMedicalBillPrompt(text);
        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        console.log('🤖 Calling Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const responseText = response.text();

        console.log('🤖 Gemini Response:', responseText);

        // Parse JSON response
        const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in Gemini response');
        }

        medicalBillData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log('✅ Medical bill data extracted successfully');

      } catch (geminiError) {
        console.log('❌ Gemini API failed:', geminiError);
        throw new Error(`Gemini API failed: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
      }

      // Generate HTML table
      const htmlTable = this.displayMedicalBillTable(medicalBillData);

      return {
        data: medicalBillData,
        htmlTable: htmlTable
      };

    } catch (error) {
      console.error('❌ Medical bill data extraction from text failed:', error);
      throw error;
    }
  }

  // Extract structured medical bill data using Gemini API
  async extractMedicalBillData(imageBuffer: Buffer): Promise<{ data: MedicalBillData; htmlTable: string }> {
    try {
      console.log('🏥 Extracting medical bill data...');

      // Use API key from environment or fallback
      const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBtQFsgSGkG_q95LUEqP9VXbWVtPdzcu3w';
      console.log('🔑 Using API key:', apiKey ? 'API key found' : 'No API key');

            // First, get OCR text
            const ocrResult = await this.extractTextWithBoxes(imageBuffer);
            const ocrText = ocrResult?.fullText || '';
            console.log('📄 OCR Text:', ocrText);
            console.log('📄 OCR Result type:', typeof ocrResult);
            console.log('📄 OCR Result keys:', Object.keys(ocrResult || {}));
      
      if (!ocrText || ocrText.trim().length === 0) {
        throw new Error('No text extracted from image');
      }

      let medicalBillData: MedicalBillData;

      try {
        // Try Gemini API with retry mechanism
        const prompt = this.createMedicalBillPrompt(ocrText);
        const model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
        
        console.log('🤖 Calling Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('🤖 Gemini Response:', text);

        // Parse JSON response
        const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No valid JSON found in Gemini response');
        }
        
        medicalBillData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log('✅ Medical bill data extracted successfully');

      } catch (geminiError) {
        console.log('❌ Gemini API failed:', geminiError);
        throw new Error(`Gemini API failed: ${geminiError instanceof Error ? geminiError.message : String(geminiError)}`);
      }

      // Generate HTML table
      const htmlTable = this.displayMedicalBillTable(medicalBillData);
      
      return {
        data: medicalBillData,
        htmlTable: htmlTable
      };

    } catch (error) {
      console.error('❌ Medical bill data extraction failed:', error);
      throw error;
    }
  }

  private createMedicalBillPrompt(ocrText: string): string {
    return `
Extract medical bill data from this OCR text and return ONLY valid JSON:

OCR Text:
${ocrText}

Return JSON with this structure:

{
  "clinic_info": {
    "name": "clinic/hospital name",
    "address": "full address",
    "phone": "phone number", 
    "email": "email address",
    "website": "website url"
  },
  "patient_info": {
    "name": "patient name",
    "contact": "patient contact/address",
    "id": "patient ID number",
    "age": "age if mentioned",
    "gender": "gender if mentioned"
  },
  "bill_info": {
    "date": "bill date",
    "time": "bill time",
    "bill_number": "bill/invoice number", 
    "doctor_name": "doctor name if mentioned",
    "referrer": "referrer name if mentioned"
  },
  "services": [
    {
      "item_number": "serial/item number if present",
      "service_name": "service/procedure/item name",
      "rate": amount_per_unit_if_mentioned,
      "quantity": quantity_if_mentioned,
      "amount": total_amount_for_this_service,
      "description": "any additional details about this service"
    }
  ],
  "all_amounts": [
    {
      "entity": "exact description of what this amount represents",
      "value": amount_value,
      "currency": "currency if mentioned (Rs, $, etc.)",
      "context": "surrounding text that describes this amount",
      "position": "where in the bill this amount appears",
      "format": "how the amount is formatted"
    }
  ],
  "payment_summary": {
    "total_billed": total_bill_amount,
    "total_payable": payable_amount_if_different,
    "amount_received": received_amount_if_mentioned,
    "payment_method": "payment method if mentioned",
    "payment_date": "payment date if mentioned",
    "payment_time": "payment time if mentioned"
  },
  "additional_info": {
    "authorized_by": "authorized signatory name",
    "software_info": "software information",
    "notes": "any additional notes or terms"
  },
  "text_analysis": {
    "bill_format": "type of bill format detected",
    "language": "primary language detected",
    "currency_format": "how currency is displayed",
    "date_format": "date format used",
    "amount_patterns": "patterns of how amounts are displayed"
  }
}

IMPORTANT: For every amount found, extract the exact entity description from the surrounding text. Don't use predefined categories - use what's actually written in the bill.

Examples:
- "ROOM RENT 4,000.00" → entity: "ROOM RENT"
- "Bill Amount 15,143.54" → entity: "Bill Amount"  
- "Received Rs.420 by Cash" → entity: "Amount Received"
- "Refundable Deposit Rs.5000" → entity: "Refundable Deposit"

Return ONLY the JSON object.
`;
  }

  // Process and display medical bill data as table
  displayMedicalBillTable(data: MedicalBillData): string {
    let tableHTML = `
    <div class="medical-bill-container">
      <h2>🏥 Medical Bill Analysis</h2>
      
      <div class="bill-section">
        <h3>🏢 Clinic Information</h3>
        <table class="bill-table">
          <tr><td><strong>Name:</strong></td><td>${data.clinic_info?.name || 'N/A'}</td></tr>
          <tr><td><strong>Address:</strong></td><td>${data.clinic_info?.address || 'N/A'}</td></tr>
          <tr><td><strong>Phone:</strong></td><td>${data.clinic_info?.phone || 'N/A'}</td></tr>
          <tr><td><strong>Email:</strong></td><td>${data.clinic_info?.email || 'N/A'}</td></tr>
          <tr><td><strong>Website:</strong></td><td>${data.clinic_info?.website || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>👤 Patient Information</h3>
        <table class="bill-table">
          <tr><td><strong>Name:</strong></td><td>${data.patient_info?.name || 'N/A'}</td></tr>
          <tr><td><strong>Contact:</strong></td><td>${data.patient_info?.contact || 'N/A'}</td></tr>
          <tr><td><strong>ID:</strong></td><td>${data.patient_info?.id || 'N/A'}</td></tr>
          <tr><td><strong>Age:</strong></td><td>${data.patient_info?.age || 'N/A'}</td></tr>
          <tr><td><strong>Gender:</strong></td><td>${data.patient_info?.gender || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>📋 Bill Information</h3>
        <table class="bill-table">
          <tr><td><strong>Date:</strong></td><td>${data.bill_info?.date || 'N/A'}</td></tr>
          <tr><td><strong>Time:</strong></td><td>${data.bill_info?.time || 'N/A'}</td></tr>
          <tr><td><strong>Bill Number:</strong></td><td>${data.bill_info?.bill_number || 'N/A'}</td></tr>
          <tr><td><strong>Doctor:</strong></td><td>${data.bill_info?.doctor_name || 'N/A'}</td></tr>
          <tr><td><strong>Referrer:</strong></td><td>${data.bill_info?.referrer || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>🩺 Services & Procedures</h3>
        <table class="bill-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Service Name</th>
              <th>Rate</th>
              <th>Qty</th>
              <th>Amount</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (data.services && data.services.length > 0) {
      data.services.forEach((service, index) => {
        tableHTML += `
          <tr>
            <td>${service.item_number || (index + 1)}</td>
            <td>${service.service_name || 'N/A'}</td>
            <td>₹${service.rate || 0}</td>
            <td>${service.quantity || 1}</td>
            <td>₹${service.amount || 0}</td>
            <td>${service.description || 'N/A'}</td>
          </tr>
        `;
      });
    } else {
      tableHTML += '<tr><td colspan="6">No services found</td></tr>';
    }

    tableHTML += `
          </tbody>
        </table>
      </div>

      <div class="bill-section">
        <h3>💰 Dynamic Amount Analysis</h3>
        <table class="bill-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Position</th>
              <th>Context</th>
              <th>Format</th>
            </tr>
          </thead>
          <tbody>
    `;

    if (data.all_amounts && data.all_amounts.length > 0) {
      data.all_amounts.forEach((amount) => {
        const currencySymbol = amount.currency || '₹';
        tableHTML += `
          <tr>
            <td><strong>${amount.entity || 'N/A'}</strong></td>
            <td>${currencySymbol}${amount.value || 0}</td>
            <td>${amount.currency || 'N/A'}</td>
            <td>${amount.position || 'N/A'}</td>
            <td>${amount.context || 'N/A'}</td>
            <td><code>${amount.format || 'N/A'}</code></td>
          </tr>
        `;
      });
    } else {
      tableHTML += '<tr><td colspan="6">No amounts found</td></tr>';
    }

    tableHTML += `
          </tbody>
        </table>
      </div>

      <div class="bill-section">
        <h3>💳 Payment Summary</h3>
        <table class="bill-table">
          <tr><td><strong>Total Billed:</strong></td><td>₹${data.payment_summary?.total_billed || 0}</td></tr>
          <tr><td><strong>Total Payable:</strong></td><td>₹${data.payment_summary?.total_payable || data.payment_summary?.total_billed || 0}</td></tr>
          <tr><td><strong>Amount Received:</strong></td><td>₹${data.payment_summary?.amount_received || 0}</td></tr>
          <tr><td><strong>Payment Method:</strong></td><td>${data.payment_summary?.payment_method || 'N/A'}</td></tr>
          <tr><td><strong>Payment Date:</strong></td><td>${data.payment_summary?.payment_date || 'N/A'}</td></tr>
          <tr><td><strong>Payment Time:</strong></td><td>${data.payment_summary?.payment_time || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>📊 Text Format Analysis</h3>
        <table class="bill-table">
          <tr><td><strong>Bill Format:</strong></td><td>${data.text_analysis?.bill_format || 'N/A'}</td></tr>
          <tr><td><strong>Language:</strong></td><td>${data.text_analysis?.language || 'N/A'}</td></tr>
          <tr><td><strong>Currency Format:</strong></td><td>${data.text_analysis?.currency_format || 'N/A'}</td></tr>
          <tr><td><strong>Date Format:</strong></td><td>${data.text_analysis?.date_format || 'N/A'}</td></tr>
          <tr><td><strong>Amount Patterns:</strong></td><td>${data.text_analysis?.amount_patterns || 'N/A'}</td></tr>
        </table>
      </div>

      <div class="bill-section">
        <h3>📝 Additional Information</h3>
        <table class="bill-table">
          <tr><td><strong>Authorized By:</strong></td><td>${data.additional_info?.authorized_by || 'N/A'}</td></tr>
          <tr><td><strong>Software Info:</strong></td><td>${data.additional_info?.software_info || 'N/A'}</td></tr>
          <tr><td><strong>Notes:</strong></td><td>${data.additional_info?.notes || 'N/A'}</td></tr>
        </table>
      </div>
    </div>

    <style>
      .medical-bill-container {
        font-family: Arial, sans-serif;
        max-width: 1000px;
        margin: 20px auto;
        padding: 20px;
        background-color: #f8f9fa;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      }
      
      .bill-section {
        margin-bottom: 25px;
        padding: 20px;
        background-color: white;
        border-radius: 8px;
        border-left: 4px solid #007bff;
      }
      
      .bill-section h3 {
        margin-top: 0;
        color: #333;
        border-bottom: 2px solid #e9ecef;
        padding-bottom: 10px;
      }
      
      .bill-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
      }
      
      .bill-table th, .bill-table td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #dee2e6;
      }
      
      .bill-table th {
        background-color: #f8f9fa;
        font-weight: bold;
        color: #495057;
      }
      
      .bill-table tr:hover {
        background-color: #f8f9fa;
      }
    </style>
    `;

    return tableHTML;
  }

}

// Interface for text with bounding box
export interface TextBox {
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  confidence: number;
  coordinates: number[][]; // Original OCR coordinates
}

// Interface for OCR result with bounding boxes
export interface OCRWithBoxesResult {
  fullText: string;
  textBoxes: TextBox[];
  totalBoxes: number;
  averageConfidence: number;
  processingTime: number;
  status: 'success' | 'error';
}

// Interface for structured medical bill data
export interface MedicalBillData {
  clinic_info?: {
    name?: string;
    address?: string;
    phone?: string;
    email?: string;
    website?: string;
  };
  patient_info?: {
    name?: string;
    contact?: string;
    id?: string;
    age?: string;
    gender?: string;
  };
  bill_info?: {
    date?: string;
    time?: string;
    bill_number?: string;
    doctor_name?: string;
    referrer?: string;
  };
  services?: Array<{
    item_number?: string;
    service_name?: string;
    rate?: number;
    quantity?: number;
    amount?: number;
    description?: string;
  }>;
  all_amounts?: Array<{
    entity?: string;
    value?: number;
    currency?: string;
    context?: string;
    position?: string;
    format?: string;
  }>;
  text_analysis?: {
    bill_format?: string;
    language?: string;
    currency_format?: string;
    date_format?: string;
    amount_patterns?: string;
  };
  payment_summary?: {
    total_billed?: number;
    total_payable?: number;
    amount_received?: number;
    payment_method?: string;
    payment_date?: string;
    payment_time?: string;
  };
  additional_info?: {
    authorized_by?: string;
    software_info?: string;
    notes?: string;
  };
}

// Usage example
export async function processMedicalBill(imageBuffer: Buffer, geminiApiKey: string): Promise<string> {
  const extractor = new OCRWithBoundingBoxes(geminiApiKey);
  
  try {
    await extractor.initialize();
    
    // Extract structured data
    const medicalBillData = await extractor.extractMedicalBillData(imageBuffer);
    
    // Display as table
    const tableHTML = extractor.displayMedicalBillTable(medicalBillData);
    
    // Also log the JSON for debugging
    console.log('📊 Extracted Medical Bill Data:');
    console.log(JSON.stringify(medicalBillData, null, 2));
    
    return tableHTML;
    
  } finally {
    await extractor.destroy();
  }
}
